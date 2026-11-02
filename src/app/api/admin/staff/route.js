import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab technician', 'OT coordinator', 'Billing officer', 'Administrator'];
const STATUSES = ['Active', 'On leave', 'Inactive'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function requireAdmin(request, db) {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;

  const { data, error } = await db.auth.getUser(token);
  if (error || !data?.user) return null;

  const { data: profile } = await db.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  return profile?.role === 'admin' ? data.user : null;
}

async function emailTaken(db, email) {
  const { data } = await db.from('staff').select('email');
  return (data || []).some((s) => (s.email || '').toLowerCase() === email);
}

export async function POST(request) {
  const db = serviceClient();
  if (!db) return fail('The server is missing SUPABASE_SERVICE_ROLE_KEY.', 500);

  const admin = await requireAdmin(request, db);
  if (!admin) return fail('Only an admin can do this.', 403);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.');
  }

  /* ---------- create a staff member with a login ---------- */
  if (body.mode === 'create') {
    const full_name = String(body.full_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role;
    const status = STATUSES.includes(body.status) ? body.status : 'Active';

    if (full_name.length < 2) return fail('Please enter the full name.');
    if (!EMAIL_RE.test(email)) return fail('Enter a valid email address.');
    if (!ROLES.includes(role)) return fail('Choose a valid role.');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return fail('The password needs at least 8 characters, with letters and numbers.');
    }
    if (await emailTaken(db, email)) return fail('A staff member with this email already exists.', 409);

    // staff row first, so the account is linked to it the moment it is created
    const { data: row, error: insertError } = await db
      .from('staff')
      .insert({ full_name, role, department: body.department || null, email, phone: body.phone || null, status })
      .select()
      .single();
    if (insertError) return fail('Could not save the staff member.', 500);

    const { error: createError } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
      app_metadata: { created_by_admin: true },
    });

    if (createError) {
      await db.from('staff').delete().eq('id', row.id);
      const taken = /already|registered|exists/i.test(createError.message);
      return fail(
        taken
          ? 'An account with this email already exists. Use "Make staff" on the Sign-ups page instead.'
          : createError.message,
        taken ? 409 : 400
      );
    }

    return NextResponse.json({ staff: row });
  }

  /* ---------- turn an existing sign-up into staff ---------- */
  if (body.mode === 'promote') {
    const role = body.role;
    if (!ROLES.includes(role)) return fail('Choose a valid role.');

    const { data: profile } = await db
      .from('profiles').select('id, full_name, email').eq('id', body.user_id).maybeSingle();
    if (!profile?.email) return fail('That account was not found.', 404);

    const email = profile.email.toLowerCase();
    if (await emailTaken(db, email)) return fail('This person is already on the staff list.', 409);

    // the admin vouches for this account, so it is trusted for staff roles
    const { error: metaError } = await db.auth.admin.updateUserById(profile.id, {
      app_metadata: { created_by_admin: true },
      email_confirm: true,
    });
    if (metaError) return fail(metaError.message);

    const { data: row, error: insertError } = await db
      .from('staff')
      .insert({
        full_name: profile.full_name || email.split('@')[0],
        role,
        department: body.department || null,
        email,
        status: 'Active',
      })
      .select()
      .single();
    if (insertError) return fail('Could not save the staff member.', 500);

    const { data: after } = await db.from('profiles').select('role').eq('id', profile.id).maybeSingle();
    return NextResponse.json({ staff: row, role: after?.role || 'patient' });
  }

  return fail('Unknown request.');
}