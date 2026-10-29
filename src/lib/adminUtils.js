export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const digits = (s) => (s || '').replace(/\D/g, '');

export const norm = (s) => (s || '').trim().toLowerCase();

export function validPhone(p) {
  const d = digits(p);
  return /^[+\d\s()-]+$/.test(p) && d.length >= 7 && d.length <= 15;
}

export function timeAgo(iso) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}