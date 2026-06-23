// Is `now` inside the user's quiet-hours window? Handles windows that wrap past
// midnight (e.g. 22:00 → 08:00). Disabled or malformed → false (no quiet).
export function inQuietHours(qh, now = new Date()) {
  if (!qh?.enabled) return false;
  const toMin = (s) => { const [h, m] = String(s || '').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const start = toMin(qh.start), end = toMin(qh.end);
  if (start === end) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  return start < end ? (cur >= start && cur < end) : (cur >= start || cur < end);
}
