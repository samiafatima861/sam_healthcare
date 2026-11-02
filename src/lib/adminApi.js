import { supabase } from './supabaseClient';

export async function callStaffApi(payload) {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch('/api/admin/staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token || ''}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.');
  return json;
}