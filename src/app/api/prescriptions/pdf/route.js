import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../../lib/pdfLink';
import { buildPrescriptionPdf } from '../../../../lib/prescriptionPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const message = (text, status) =>
  new Response(text, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const id = params.get('id') || '';

  if (!verifyToken(id, params.get('exp'), params.get('sig'))) {
    return message('This download link is invalid or has expired. Go back and try again.', 403);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return message('The server is missing SUPABASE_SERVICE_ROLE_KEY.', 500);

  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: rx } = await db.from('prescriptions').select('*').eq('id', id).maybeSingle();
  if (!rx) return message('Prescription not found.', 404);

  const bytes = await buildPrescriptionPdf(rx);
  const day = new Date(rx.created_at).toISOString().slice(0, 10);
  const name = String(rx.patient_name || 'patient').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'patient';

  return new Response(bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="prescription-${name}-${day}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}