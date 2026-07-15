import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { F } from '../../styles/fonts';
import { getPositionIfGranted } from '../../lib/weather';

// Free, no-key, dark-by-default vector tiles. No API key, no billing.
const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';
// A neutral fallback center so the map ALWAYS renders — even before (or without) a location fix.
const DEFAULT_CENTER = [-73.99, 40.71];
const LAST_KEY = 'mapLastCenter';

function lastCenter() {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_KEY) || 'null');
    if (Array.isArray(v) && v.length === 2 && Number.isFinite(v[0]) && Number.isFinite(v[1])) return v;
  } catch { /* noop */ }
  return DEFAULT_CENTER;
}

// A geographic circle (meters) as a GeoJSON polygon — so it scales with zoom,
// unlike a pixel-radius circle layer. Used to draw the user's own privacy circle.
function circlePolygon(lng, lat, radiusM, steps = 64) {
  const coords = [];
  const dLat = radiusM / 111320;
  const dLng = radiusM / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } };
}

function markerEl({ glyph, avatarUrl, mine }) {
  const el = document.createElement('div');
  const ring = mine ? '#5E3B73' : '#8B0000';
  el.style.cssText = `width:34px;height:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:16px;background:#0A0A0A;border:2px solid ${ring};box-shadow:0 0 10px ${ring}99;cursor:pointer;overflow:hidden;`;
  if (avatarUrl) {
    const img = document.createElement('img');
    img.src = avatarUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    el.appendChild(img);
  } else {
    el.textContent = glyph || '✦';
  }
  return el;
}

// Events read as a distinct marker (gold rounded-square ◈) so they never blur with the
// circular soul pins. Tap opens the rite.
function eventMarkerEl({ name }) {
  const el = document.createElement('div');
  el.style.cssText = 'width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:15px;background:#0A0A0A;border:2px solid #C9A961;color:#C9A961;box-shadow:0 0 12px rgba(201,169,97,0.55);cursor:pointer;';
  el.textContent = '◈';
  if (name) el.title = name;
  return el;
}

// The living map. It ALWAYS renders the tiles immediately at a sensible default center and
// never blocks on geolocation — your location is requested in parallel and the map flies to it
// when (if) it arrives. You can always SEE the map; sharing only decides whether you appear ON it
// (your own pin + privacy circle). A load failsafe guarantees it never sits on "summoning…".
export default function RealMap({ nearby = [], events = [], tonightStatus, ghost = false, onOpenUser, onOpenTonightStatus, onOpenEvent, placing = false, onPickPoint }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const meRef = useRef(null); // { lat, lng } once we have a fix
  const [state, setState] = useState('loading'); // loading | ready | error
  const [located, setLocated] = useState(false);
  // Read by the marker click handlers: a tap on an existing pin during placement mode picks
  // THAT pin's location (markers sit over the canvas and would otherwise be dead zones),
  // instead of opening the soul/event on top of the create-modal.
  const placingRef = useRef(false);
  useEffect(() => { placingRef.current = placing; }, [placing]);
  const pickFromMarker = (e, lat, lng) => {
    if (!placingRef.current) return false;
    e.stopPropagation(); // don't let the tap ALSO reach the canvas and double-pick
    onPickPoint && onPickPoint({ lat, lng });
    return true;
  };
  const sharing = !!tonightStatus?.share && !ghost;
  const fuzzM = tonightStatus?.fuzzM || 1609;

  // Build the map ONCE, immediately, at the last-known/default center. Never gated on location.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;
    let cancelled = false;
    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_STYLE,
        center: lastCenter(),
        zoom: 11.5,
        attributionControl: { compact: true },
      });
    } catch {
      setState('error');
      return undefined;
    }
    mapRef.current = map;
    try { map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left'); } catch { /* noop */ }
    map.on('error', () => {}); // swallow transient tile errors
    // The external style references sprite images we don't ship (e.g. 'wood-pattern') —
    // feed maplibre a transparent 1px stand-in so it stops warning on every render.
    map.on('styleimagemissing', (e) => {
      try { if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) }); } catch { /* noop */ }
    });
    map.on('load', () => { if (!cancelled) { map.resize(); setState('ready'); } });
    // Failsafe: never sit on "summoning…" — if the style/tiles stall, reveal the map anyway after 8s.
    const failsafe = setTimeout(() => { if (!cancelled) setState(s => (s === 'loading' ? 'ready' : s)); }, 8000);
    // Keep the canvas fitted to the container even if its size settles after mount (animations, dvh).
    const ro = (typeof ResizeObserver !== 'undefined')
      ? new ResizeObserver(() => { try { map.resize(); } catch { /* noop */ } })
      : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    const reflow = setTimeout(() => { try { map.resize(); } catch { /* noop */ } }, 300);

    // Locate the user in parallel (non-blocking), but ONLY if permission was already granted —
    // opening the map must never trigger a permission prompt. Recenter + remember on success.
    // Without a prior grant the map simply stays at the last-known/default center (fine); the
    // "share location" button is the explicit gesture that first requests access.
    getPositionIfGranted().then((coords) => {
      if (cancelled || !coords) return;
      const { latitude, longitude } = coords;
      meRef.current = { lat: latitude, lng: longitude };
      try { localStorage.setItem(LAST_KEY, JSON.stringify([longitude, latitude])); } catch { /* noop */ }
      setLocated(true);
      try { map.flyTo({ center: [longitude, latitude], zoom: 12.5, duration: 1400 }); } catch { /* noop */ }
    }).catch(() => { /* no location — the map stays at the default center, which is fine */ });

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      clearTimeout(reflow);
      if (ro) ro.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // (Re)draw the privacy circle + markers when the map is ready or the data/sharing changes.
  useEffect(() => {
    const map = mapRef.current;
    if (state !== 'ready' || !map) return;
    const me = meRef.current;
    const wantMine = sharing && me; // my circle + pin only when I'm sharing and located

    if (wantMine) {
      const data = circlePolygon(me.lng, me.lat, fuzzM);
      if (map.getSource('me-circle')) {
        map.getSource('me-circle').setData(data);
      } else {
        map.addSource('me-circle', { type: 'geojson', data });
        map.addLayer({ id: 'me-circle-fill', type: 'fill', source: 'me-circle', paint: { 'fill-color': '#8B0000', 'fill-opacity': 0.12 } });
        map.addLayer({ id: 'me-circle-line', type: 'line', source: 'me-circle', paint: { 'line-color': '#9E2A33', 'line-width': 1.5, 'line-opacity': 0.6 } });
      }
    } else if (map.getLayer && map.getLayer('me-circle-fill')) {
      try { map.removeLayer('me-circle-fill'); map.removeLayer('me-circle-line'); map.removeSource('me-circle'); } catch { /* noop */ }
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (wantMine) {
      const mineEl = markerEl({ glyph: '☽', mine: true });
      mineEl.addEventListener('click', (e) => { pickFromMarker(e, me.lat, me.lng); });
      markersRef.current.push(new maplibregl.Marker({ element: mineEl }).setLngLat([me.lng, me.lat]).addTo(map));
    }
    nearby.forEach(p => {
      if (p.fuzzLat == null || p.fuzzLng == null) return;
      const el = markerEl({ glyph: p.avatar, avatarUrl: p.avatarUrl });
      el.title = `${p.handle}${p.distanceMi != null ? ` · ~${p.distanceMi} mi` : ''}`;
      el.addEventListener('click', (e) => { if (!pickFromMarker(e, p.fuzzLat, p.fuzzLng)) onOpenUser && onOpenUser(p.handle); });
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.fuzzLng, p.fuzzLat]).addTo(map));
    });
    // Event pins (gated by the event_map view's anti-spam rules) → tap opens the rite.
    events.forEach(ev => {
      if (!Number.isFinite(ev.lat) || !Number.isFinite(ev.lng)) return;
      const el = eventMarkerEl({ name: ev.name });
      el.addEventListener('click', (e) => { if (!pickFromMarker(e, ev.lat, ev.lng)) onOpenEvent && onOpenEvent(ev.id); });
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([ev.lng, ev.lat]).addTo(map));
    });
  }, [state, nearby, events, sharing, fuzzM, onOpenUser, onOpenEvent, located]);

  // Placement mode: one tap on the map picks the point for a new rite. Crosshair cursor while
  // active; the click handler is registered only for the duration so normal map taps are untouched.
  useEffect(() => {
    const map = mapRef.current;
    if (!placing || state !== 'ready' || !map) return undefined;
    const canvas = map.getCanvas();
    const prevCursor = canvas.style.cursor;
    canvas.style.cursor = 'crosshair';
    const pick = (e) => { onPickPoint && onPickPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng }); };
    map.on('click', pick);
    return () => {
      map.off('click', pick);
      try { canvas.style.cursor = prevCursor; } catch { /* noop */ }
    };
  }, [placing, state, onPickPoint]);

  // When sharing turns on and we don't yet have a fix (permission was granted just now via the
  // share flow, after the map already mounted), locate silently so the user's own pin + privacy
  // circle appear this session without needing to reopen the map. Never prompts on its own.
  useEffect(() => {
    if (!sharing || meRef.current) return undefined;
    let cancelled = false;
    getPositionIfGranted().then((coords) => {
      if (cancelled || !coords) return;
      meRef.current = { lat: coords.latitude, lng: coords.longitude };
      try { localStorage.setItem(LAST_KEY, JSON.stringify([coords.longitude, coords.latitude])); } catch { /* noop */ }
      setLocated(true); // flips the draw effect above (it depends on `located`)
      try { mapRef.current && mapRef.current.flyTo({ center: [coords.longitude, coords.latitude], zoom: 12.5, duration: 1400 }); } catch { /* noop */ }
    }).catch(() => { /* noop */ });
    return () => { cancelled = true; };
  }, [sharing]);

  return (
    <div className="absolute inset-0 bg-[#070708]">
      {/* h-full (not inset-0): MapLibre forces position:relative on its container, which would
          nullify absolute insets and collapse the map to 0 height. height:100% survives that. */}
      <div ref={containerRef} className="h-full w-full" />
      {state === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B] text-xs pointer-events-none" style={F.ui}>summoning the map…</div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 bg-[#070708]">
          <div className="text-4xl mb-3">🜨</div>
          <p className="text-[#A8A29E] text-sm" style={F.serif}>the map couldn't be summoned.</p>
          <p className="text-[#6B6B6B] text-xs mt-1" style={F.serif}>check your connection, then reopen the map.</p>
        </div>
      )}
      {/* Non-blocking nudge — never a dead-end. Tap to drop your pin / share. */}
      {state === 'ready' && !sharing && !ghost && !placing && (
        <button onClick={onOpenTonightStatus}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 bg-black/75 backdrop-blur-sm border border-[#8B0000]/50 text-[#C9A961] text-[10px] uppercase tracking-[0.18em] hover:border-[#C9A961] transition-colors" style={F.ui}>
          {located ? 'go live · drop your pin →' : 'share location to appear →'}
        </button>
      )}
    </div>
  );
}
