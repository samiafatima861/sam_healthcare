import { supabase } from './supabaseClient';

export async function downloadPrescriptionPdf(id) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in again.');

  const res = await fetch('/api/prescriptions/link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ id }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || 'Could not prepare the PDF.');

  // the server marks the file as an attachment, so the browser downloads it and stays on the page
  window.location.assign(json.url);
}