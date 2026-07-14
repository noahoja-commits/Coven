// Weather-mood tint: get the device location, fetch current conditions from
// Open-Meteo (free, no API key, CORS-OK), and map the WMO weather code to a
// subtle full-screen tint. Only call this in response to the user enabling the
// toggle — never on page load (it prompts for location permission).

export function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('geolocation unavailable'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60 * 1000 },
    );
  });
}

// Current geolocation permission WITHOUT prompting: 'granted' | 'prompt' | 'denied' | 'unknown'.
// ('unknown' = the Permissions API isn't available, e.g. older Safari.)
export async function geoPermission() {
  try {
    if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) return 'unknown';
    const s = await navigator.permissions.query({ name: 'geolocation' });
    return s.state;
  } catch {
    return 'unknown';
  }
}

// Remember that THIS user once explicitly granted location (via the share flow). iOS
// Safari — especially installed PWAs — often reports 'prompt' again on the next session
// even though the user granted before, which made every silent refresh bail and the map
// pins vanish. With this marker we still attempt the read (worst case iOS shows its own
// re-prompt, which matches the user's stated intent to share).
const GEO_GRANTED_KEY = 'geoEverGranted';
export function markGeoGranted() {
  try { localStorage.setItem(GEO_GRANTED_KEY, '1'); } catch { /* noop */ }
}
function geoEverGranted() {
  try { return localStorage.getItem(GEO_GRANTED_KEY) === '1'; } catch { return false; }
}

// Get position ONLY if the user has already granted permission — never triggers a prompt
// for someone who hasn't opted in. Used by background/auto features (map recenter, nearby
// refresh). The user grants once via an explicit gesture (the "share location" button, or
// the weather-mood toggle), and thereafter these silent calls just work. Resolves null otherwise.
export async function getPositionIfGranted() {
  const state = await geoPermission();
  const allowed = state === 'granted' || (state !== 'denied' && geoEverGranted());
  if (!allowed) return null;
  try { return await getPosition(); } catch { return null; }
}

// WMO weather_code (+ day/night + temp °F) -> tint { color, opacity, label }. soft-light blend.
// Granular per-code mapping so the mood reflects the real sky (drizzle ≠ heavy rain ≠ storm),
// with the temperature appended so it always carries fresh signal. Opacities kept noticeable.
export function tintForCode(code, isDay, tempF) {
  const night = !isDay;
  const T = (label) => (typeof tempF === 'number' && Number.isFinite(tempF) ? `${label} · ${Math.round(tempF)}°` : label);
  if (code === 0) return night ? { color: '#2A1C6E', opacity: 0.30, label: T('clear night 🌙') } : { color: '#E8C45A', opacity: 0.22, label: T('clear skies ☀') };
  if (code === 1) return night ? { color: '#2A1C6E', opacity: 0.26, label: T('mainly clear 🌙') } : { color: '#E8C45A', opacity: 0.18, label: T('mainly clear ☀') };
  if (code === 2) return { color: night ? '#322657' : '#9A9AB5', opacity: 0.26, label: T('partly cloudy ⛅') };
  if (code === 3) return { color: '#6E6E7E', opacity: 0.30, label: T('overcast ☁') };
  if (code === 45 || code === 48) return { color: '#8A8A8A', opacity: 0.32, label: T('fog 🌫') };
  if (code >= 51 && code <= 57) return { color: '#5E7E9A', opacity: 0.30, label: T('drizzle 🌦') };
  if (code === 61 || code === 80) return { color: '#4E78A6', opacity: 0.32, label: T('light rain 🌦') };
  if (code === 63 || code === 81) return { color: '#3E6FA8', opacity: 0.34, label: T('rain 🌧') };
  if (code === 65 || code === 82) return { color: '#2E5E96', opacity: 0.38, label: T('heavy rain 🌧') };
  if (code === 66 || code === 67) return { color: '#6A8AB0', opacity: 0.34, label: T('freezing rain 🧊') };
  if ((code >= 71 && code <= 75) || code === 85 || code === 86) return { color: '#C5D8EC', opacity: 0.30, label: T('snow ❄') };
  if (code === 77) return { color: '#C5D8EC', opacity: 0.26, label: T('snow grains ❄') };
  if (code === 95) return { color: '#5A2A85', opacity: 0.38, label: T('thunderstorm ⛈') };
  if (code === 96 || code === 99) return { color: '#4A1A75', opacity: 0.42, label: T('storm & hail ⛈') };
  return { color: '#6E6E7E', opacity: 0.24, label: T('weather') };                     // fallback
}

// Real local sunrise/sunset for the device's location (Open-Meteo, free, no key).
// timezone=auto → times come back in local ISO ("YYYY-MM-DDTHH:MM"). Returns
// { sunrise, sunset } as "HH:MM", or null (permission denied / error).
export async function fetchSunTimes() {
  try {
    const { latitude, longitude } = await getPosition();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}&daily=sunrise,sunset&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const sr = data?.daily?.sunrise?.[0];
    const ss = data?.daily?.sunset?.[0];
    if (!sr || !ss) return null;
    const hhmm = (iso) => String(iso).slice(11, 16);
    return { sunrise: hhmm(sr), sunset: hhmm(ss) };
  } catch {
    return null;
  }
}

// Returns { color, opacity, code } or null (permission denied / error / unsupported).
export async function fetchWeatherTint() {
  try {
    const { latitude, longitude } = await getPosition();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}&current=weather_code,is_day,temperature_2m&temperature_unit=fahrenheit`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cur = data && data.current;
    if (!cur || typeof cur.weather_code !== 'number') return null;
    return { ...tintForCode(cur.weather_code, cur.is_day === 1, cur.temperature_2m), code: cur.weather_code, tempF: cur.temperature_2m };
  } catch {
    return null;
  }
}
