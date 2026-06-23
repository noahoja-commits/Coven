// Build a standards-compliant .ics for an event and trigger a download.
// Uses starts_at/ends_at when present (timed); otherwise falls back to an all-day
// event on dateRaw, so a freeform `time` string can't produce an invalid file.

const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const utc = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); // YYYYMMDDTHHMMSSZ
const dateOnly = (ymd) => String(ymd).replace(/-/g, ''); // YYYYMMDD
const nextDay = (ymd) => { const d = new Date(ymd + 'T00:00:00'); d.setDate(d.getDate() + 1); return dateOnly(d.toISOString().slice(0, 10)); };

export function buildICS(event) {
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/?event=${event.id}`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Coven//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:event-${event.id}@coven`,
    `DTSTAMP:${utc(Date.now())}`,
  ];
  if (event.starts_at) {
    lines.push(`DTSTART:${utc(event.starts_at)}`);
    lines.push(`DTEND:${utc(event.ends_at || new Date(new Date(event.starts_at).getTime() + 2 * 3600 * 1000))}`);
  } else if (event.dateRaw) {
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(event.dateRaw)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(event.dateRaw)}`);
  }
  lines.push(`SUMMARY:${esc(event.name)}`);
  const loc = [event.venue, event.neighborhood].filter(Boolean).join(', ');
  if (loc) lines.push(`LOCATION:${esc(loc)}`);
  if (event.description) lines.push(`DESCRIPTION:${esc(event.description)}`);
  lines.push(`URL:${url}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(event) {
  try {
    const blob = new Blob([buildICS(event)], { type: 'text/calendar;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `${(event.name || 'rite').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch { /* noop */ }
}
