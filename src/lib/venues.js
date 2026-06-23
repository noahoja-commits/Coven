// Remember venues a host has used (localStorage) to autocomplete the venue field.
const KEY = 'coven:v1:venues';

export function getVenues() {
  try { const v = JSON.parse(localStorage.getItem(KEY)); return Array.isArray(v) ? v : []; }
  catch { return []; }
}

export function addVenue(name) {
  const n = String(name || '').trim();
  if (!n) return;
  try {
    const list = getVenues();
    const i = list.findIndex(v => v.name.toLowerCase() === n.toLowerCase());
    if (i >= 0) list[i].count = (list[i].count || 1) + 1;
    else list.push({ name: n, count: 1 });
    list.sort((a, b) => (b.count || 0) - (a.count || 0));
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 30)));
  } catch { /* noop */ }
}
