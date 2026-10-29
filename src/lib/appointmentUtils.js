export const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const initials = (name) =>
  (name || '?').trim().split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export const titleCase = (s) =>
  (s || 'Other').trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const fmtTime = (t) => (t || '').replace(/\s*(AM|PM)$/i, (m, ap) => ` ${ap.toUpperCase()}`);

export function timeToMinutes(label) {
  const m = (label || '').match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return 0;
  let h = Number(m[1]);
  const min = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

export const byDateTime = (a, b) =>
  a.appointment_date.localeCompare(b.appointment_date) ||
  timeToMinutes(a.appointment_time) - timeToMinutes(b.appointment_time);

export function prettyDate(iso, opts) {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString(
    'en-US',
    opts || { day: 'numeric', month: 'short', year: 'numeric' }
  );
}