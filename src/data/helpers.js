// Generic helpers used across the app

export const formatK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

export function todaysCodex(codex) {
  if (!codex || codex.length === 0) return null;
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return codex[seed % codex.length];
}

function flattenTexts(texts) {
  const flat = [];
  for (const t of texts) {
    for (const ch of t.chapters || []) {
      for (const v of ch.verses || []) {
        if (!v.text || v.text.length < 30) continue;
        flat.push({ textId: t.id, textTitle: t.shortTitle, chapterTitle: ch.title, verse: v });
      }
    }
  }
  return flat;
}

export function vespersForDate(texts, date = new Date()) {
  if (!texts || texts.length === 0) return null;
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const flat = flattenTexts(texts);
  if (flat.length === 0) return null;
  return { ...flat[seed % flat.length], dateKey: date.toISOString().slice(0, 10) };
}

export function todaysVespers(texts) {
  return vespersForDate(texts, new Date());
}

export function pastVespers(texts, days = 7) {
  const result = [];
  for (let i = 1; i <= days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(vespersForDate(texts, d));
  }
  return result;
}

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

// Approximate sunrise/sunset for NYC (lat 40.7, lon -74.0)
// Returns { sunrise: "06:42", sunset: "20:14" } in local time
export function sunTimes(date = new Date()) {
  const lat = 40.7;
  const lon = -74.0;
  // Day of year
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date - start) / (1000 * 60 * 60 * 24));
  // Solar declination (radians)
  const decl = 0.4093 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  // Hour angle of sunrise/sunset
  const latRad = (lat * Math.PI) / 180;
  const cosH = -Math.tan(latRad) * Math.tan(decl);
  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const hourAngle = (Math.acos(clampedCosH) * 180) / Math.PI / 15; // hours
  // Local solar noon ~ 12:00 - lon/15, plus DST handled by timezone offset already
  const solarNoon = 12 - lon / 15;
  const sunriseDecimal = solarNoon - hourAngle;
  const sunsetDecimal = solarNoon + hourAngle;
  // Adjust for the device timezone offset relative to UTC
  // Our solarNoon is computed in UTC; convert back to local
  const tzOffsetHours = -date.getTimezoneOffset() / 60;
  const sunriseLocal = sunriseDecimal + tzOffsetHours;
  const sunsetLocal = sunsetDecimal + tzOffsetHours;
  const fmt = (t) => {
    const t2 = ((t % 24) + 24) % 24;
    const h = Math.floor(t2);
    const m = Math.floor((t2 - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  return { sunrise: fmt(sunriseLocal), sunset: fmt(sunsetLocal) };
}

// Detects dark-calendar events for a given date
// Returns the strongest one (or null) — for the home banner
export function darkDay(date = new Date()) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = date.getDay(); // 0=sun

  // Sabbats and special dates
  const fixed = {
    '1-1':   { label: 'a new year of shadows', glyph: '✦', tone: 'gold' },
    '2-1':   { label: 'Imbolc · the first flame', glyph: '🕯', tone: 'gold' },
    '2-2':   { label: 'Candlemas', glyph: '🕯', tone: 'gold' },
    '2-14':  { label: 'St. Valentine — patron of love and the plague', glyph: '✟', tone: 'red' },
    '3-15':  { label: 'beware the Ides', glyph: '☩', tone: 'red' },
    '4-30':  { label: 'Walpurgisnacht', glyph: '⛧', tone: 'red' },
    '5-1':   { label: 'Beltane', glyph: '✦', tone: 'gold' },
    '6-21':  { label: 'Summer Solstice · the longest day', glyph: '☉', tone: 'gold' },
    '6-23':  { label: "St. John's Eve", glyph: '✟', tone: 'gold' },
    '8-1':   { label: 'Lammas · the bread is broken', glyph: '☩', tone: 'gold' },
    '9-22':  { label: 'Autumn Equinox · the balance tips', glyph: '◐', tone: 'silver' },
    '10-31': { label: 'Samhain · the veil is thinnest', glyph: '☠', tone: 'red' },
    '11-1':  { label: "All Saints'", glyph: '✟', tone: 'gold' },
    '11-2':  { label: "All Souls' · pray for the dead", glyph: '⚱', tone: 'gold' },
    '12-21': { label: 'Winter Solstice · the longest night', glyph: '☽', tone: 'silver' },
    '12-24': { label: 'Christmas Eve', glyph: '✟', tone: 'gold' },
    '12-31': { label: "Hogmanay · year's end", glyph: '✦', tone: 'silver' },
  };
  if (fixed[`${m}-${d}`]) return fixed[`${m}-${d}`];

  // Friday the 13th
  if (d === 13 && dow === 5) return { label: 'Friday the 13th', glyph: '☠', tone: 'red' };

  // Moon phase
  const phase = moonPhase(date);
  if (phase.name === 'Full Moon') return { label: `Full Moon · ${phase.name.toLowerCase()}`, glyph: '○', tone: 'silver' };
  if (phase.name === 'New Moon')  return { label: 'New Moon · the dark', glyph: '●', tone: 'silver' };

  return null;
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
