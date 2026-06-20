// Weather-mood tint: get the device location, fetch current conditions from
// Open-Meteo (free, no API key, CORS-OK), and map the WMO weather code to a
// subtle full-screen tint. Only call this in response to the user enabling the
// toggle — never on page load (it prompts for location permission).

function getPosition() {
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

// WMO weather_code (+ day/night) -> tint { color, opacity, label }. soft-light blend.
// Opacities kept noticeable (subtle was imperceptible on the dark UI).
export function tintForCode(code, isDay) {
  const night = !isDay;
  if (code === 0 || code === 1) {                     // clear / mainly clear
    return night ? { color: '#2A1C6E', opacity: 0.30, label: 'clear night 🌙' } : { color: '#E8C45A', opacity: 0.22, label: 'clear skies ☀' };
  }
  if (code === 2) return { color: night ? '#322657' : '#9A9AB5', opacity: 0.26, label: 'partly cloudy ⛅' };
  if (code === 3) return { color: '#6E6E7E', opacity: 0.30, label: 'overcast ☁' };
  if (code === 45 || code === 48) return { color: '#8A8A8A', opacity: 0.32, label: 'fog 🌫' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { color: '#3E6FA8', opacity: 0.34, label: 'rain 🌧' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { color: '#C5D8EC', opacity: 0.30, label: 'snow ❄' };
  if (code >= 95) return { color: '#5A2A85', opacity: 0.38, label: 'thunderstorm ⛈' };
  return { color: '#6E6E7E', opacity: 0.24, label: 'weather' };                     // fallback
}

// Returns { color, opacity, code } or null (permission denied / error / unsupported).
export async function fetchWeatherTint() {
  try {
    const { latitude, longitude } = await getPosition();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude.toFixed(3)}&longitude=${longitude.toFixed(3)}&current=weather_code,is_day`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const cur = data && data.current;
    if (!cur || typeof cur.weather_code !== 'number') return null;
    return { ...tintForCode(cur.weather_code, cur.is_day === 1), code: cur.weather_code };
  } catch {
    return null;
  }
}
