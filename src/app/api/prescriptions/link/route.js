import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasSecret, makeToken } from '../../../../lib/pdfLink';

export const runtime = 'nodejs';

const fail = (message, status) => NextResponse.json({ error: message }, { status });

export async function POST(request) {
  if (!hasSecret()) return fail('The server is missing PDF_LINK_SECRET.', 500);

  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return fail('Please sign in again.', 401);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid request.', 400);
  }

  const id = String(body?.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail('Invalid request.', 400);

  // ask the database as the signed-in person: the security rules decide whether they may see it
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  const { data, error } = await db.from('prescriptions').select('id').eq('id', id).maybeSingle();
  if (error || !data) return fail('Prescription not found.', 404);

  const { exp, sig } = makeToken(id);
  const origin = new URL(request.url).origin;
  return NextResponse.json({ url: `${origin}/api/prescriptions/pdf?id=${id}&exp=${exp}&sig=${sig}` });
}