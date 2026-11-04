// the hospital's own zone, used only to label appointment slots and to read old rows
export const HOSPITAL_TZ = 'Asia/Karachi';

// the viewer's zone, taken from their device, e.g. "America/New_York"
export function viewerZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// "GMT-5", "GMT+11", for showing next to a time
export function zoneLabel(date = new Date(), zone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone || viewerZone(), timeZoneName: 'short' }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
}

// "3 Nov 2026, 11:41 am" in the VIEWER's zone, from a UTC value
export function formatDateTime(iso, options = {}) {
  if (!iso) return '';
  const { zone, withZone = false } = options;
  const date = new Date(iso);
  const text = date.toLocaleString('en-GB', {
    timeZone: zone || undefined,
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  return withZone ? `${text} ${zoneLabel(date, zone)}` : text;
}

// "3 Nov 2026" in the viewer's zone
export function formatDay(iso, zone) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { timeZone: zone || undefined, day: 'numeric', month: 'short', year: 'numeric' });
}

// "11:41 am" in the viewer's zone
export function formatClock(iso, zone) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-GB', { timeZone: zone || undefined, hour: '2-digit', minute: '2-digit', hour12: true });
}

// the same moment written in UTC, for logs and tooltips
export function formatUtc(iso) {
  if (!iso) return '';
  return `${new Date(iso).toISOString().replace('T', ' ').slice(0, 19)} UTC`;
}

// "2026-11-03": the calendar day of a UTC moment in the viewer's zone (used by date filters)
export function dayInViewerZone(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: viewerZone() });
}

// an appointment slot: local time for the viewer, plus the hospital's clock time for clarity
// slot = { appointment_at, appointment_date, appointment_time }
export function formatSlot(slot) {
  if (!slot?.appointment_at) {
    return { local: slot?.appointment_time || '', hospital: '', sameZone: true };
  }
  const at = new Date(slot.appointment_at);
  const zone = viewerZone();
  const local = `${formatDay(slot.appointment_at)}, ${formatClock(slot.appointment_at)}`;
  const hospital = `${formatClock(slot.appointment_at, HOSPITAL_TZ)} hospital time`;
  const sameOffset =
    new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }).format(at).split(' ').pop() ===
    new Intl.DateTimeFormat('en-US', { timeZone: HOSPITAL_TZ, timeZoneName: 'longOffset' }).format(at).split(' ').pop();
  return { local, hospital, sameZone: sameOffset };
}