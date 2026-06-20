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

// WMO weather_code (+ day/night) -> subtle tint. Low opacity, soft-light blend.
export function tintForCode(code, isDay) {
  const night = !isDay;
  if (code === 0 || code === 1) {                     // clear / mainly clear
    return night ? { color: '#1B1145', opacity: 0.16 } : { color: '#C9A961', opacity: 0.10 };
  }
  if (code === 2) return { color: night ? '#241B3A' : '#8A8AA0', opacity: 0.12 };  // partly cloudy
  if (code === 3) return { color: '#5A5A66', opacity: 0.16 };                       // overcast
  if (code === 45 || code === 48) return { color: '#6B6B6B', opacity: 0.18 };       // fog
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { color: '#2E4A6B', opacity: 0.18 }; // rain/drizzle
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { color: '#AEC2D6', opacity: 0.16 };  // snow
  if (code >= 95) return { color: '#3A1A55', opacity: 0.20 };                       // thunderstorm
  return { color: '#5A5A66', opacity: 0.12 };                                       // fallback
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
