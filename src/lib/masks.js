export const digitsOnly = (s) => (s || '').replace(/\D/g, '');

// keeps letters, digits, spaces and a few safe symbols; removes everything else (< > ; " % etc.)
export function maskSearchText(value, max = 40) {
  return (value || '')
    .replace(/[^\p{L}\p{N}\s+\-.'@]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, max);
}

// 03001234567 becomes 0300-1234567; a leading + keeps international numbers as digits
export function maskPhone(value) {
  const raw = (value || '').replace(/[^\d+]/g, '');
  if (raw.startsWith('+')) return `+${digitsOnly(raw).slice(0, 14)}`;
  const d = digitsOnly(raw).slice(0, 11);
  return d.length > 4 ? `${d.slice(0, 4)}-${d.slice(4)}` : d;
}

// display only: 0300-•••4567. Use it where a role does not need the full number
export function maskPhoneDisplay(phone) {
  const d = digitsOnly(phone);
  if (d.length < 7) return phone || '';
  return `${d.slice(0, 4)}-•••${d.slice(-4)}`;
}