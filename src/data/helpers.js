// Generic helpers used across the app

export const formatK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

// Format a "time ago" from a timestamp (ms)
export function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(mo / 12)}y`;
}

// Days between two dates
export function daysBetween(a, b = new Date()) {
  const aD = a instanceof Date ? a : new Date(a);
  const bD = b instanceof Date ? b : new Date(b);
  return Math.floor((bD - aD) / (1000 * 60 * 60 * 24));
}

// Compute moon phase (very approximate, good for display)
export function moonPhase(date = new Date()) {
  // Days since reference new moon (Jan 6, 2000)
  const ref = new Date('2000-01-06').getTime();
  const days = (date.getTime() - ref) / (1000 * 60 * 60 * 24);
  const phase = (days % 29.53059) / 29.53059;
  if (phase < 0.0625 || phase > 0.9375) return { name: 'New Moon', glyph: '●', illum: 0 };
  if (phase < 0.1875) return { name: 'Waxing Crescent', glyph: '☽', illum: 0.25 };
  if (phase < 0.3125) return { name: 'First Quarter', glyph: '◐', illum: 0.5 };
  if (phase < 0.4375) return { name: 'Waxing Gibbous', glyph: '◑', illum: 0.75 };
  if (phase < 0.5625) return { name: 'Full Moon', glyph: '○', illum: 1 };
  if (phase < 0.6875) return { name: 'Waning Gibbous', glyph: '◒', illum: 0.75 };
  if (phase < 0.8125) return { name: 'Last Quarter', glyph: '◓', illum: 0.5 };
  return { name: 'Waning Crescent', glyph: '☾', illum: 0.25 };
}

// Approximate sun sign from a date string
export function sunSign(birthday) {
  if (!birthday) return null;
  const d = new Date(birthday);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const signs = [
    { name: 'Capricorn', glyph: '♑', start: [12, 22], end: [1, 19] },
    { name: 'Aquarius', glyph: '♒', start: [1, 20], end: [2, 18] },
    { name: 'Pisces', glyph: '♓', start: [2, 19], end: [3, 20] },
    { name: 'Aries', glyph: '♈', start: [3, 21], end: [4, 19] },
    { name: 'Taurus', glyph: '♉', start: [4, 20], end: [5, 20] },
    { name: 'Gemini', glyph: '♊', start: [5, 21], end: [6, 20] },
    { name: 'Cancer', glyph: '♋', start: [6, 21], end: [7, 22] },
    { name: 'Leo', glyph: '♌', start: [7, 23], end: [8, 22] },
    { name: 'Virgo', glyph: '♍', start: [8, 23], end: [9, 22] },
    { name: 'Libra', glyph: '♎', start: [9, 23], end: [10, 22] },
    { name: 'Scorpio', glyph: '♏', start: [10, 23], end: [11, 21] },
    { name: 'Sagittarius', glyph: '♐', start: [11, 22], end: [12, 21] },
  ];
  for (const s of signs) {
    if ((m === s.start[0] && day >= s.start[1]) || (m === s.end[0] && day <= s.end[1])) return s;
  }
  return signs[0];
}
