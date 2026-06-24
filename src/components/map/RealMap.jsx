import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { F } from '../../styles/fonts';
import { getPosition } from '../../lib/weather';

// Free, no-key, dark-by-default vector tiles. No API key, no billing.
const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

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
  const ring = mine ? '#7B2CBF' : '#8B0000';
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

export default function RealMap({ nearby = [], tonightStatus, ghost = false, onOpenUser, onOpenTonightStatus }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const meRef = useRef(null); // { lat, lng }
  const [state, setState] = useState('loading'); // loading | ready | denied
  const sharing = !!tonightStatus?.share;
  const fuzzM = tonightStatus?.fuzzM || 1609;

  // Build the map once we have the user's position (only when sharing).
  useEffect(() => {
    if (!sharing) return undefined;
    let cancelled = false;
    setState('loading');
    getPosition().then(({ latitude, longitude }) => {
      if (cancelled || !containerRef.current) return;
      meRef.current = { lat: latitude, lng: longitude };
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_STYLE,
        center: [longitude, latitude],
        zoom: 12.5,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-left');
      map.on('error', () => {}); // swallow transient tile errors
      map.on('load', () => { if (!cancelled) { map.resize(); setState('ready'); } });
      mapRef.current = map;
    }).catch(() => { if (!cancelled) setState('denied'); });
    return () => {
      cancelled = true;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [sharing]);

  // Draw the privacy circle + (re)place markers when ready or the data changes.
  useEffect(() => {
    const map = mapRef.current;
    if (state !== 'ready' || !map || !meRef.current) return;
    const { lat, lng } = meRef.current;

    const data = circlePolygon(lng, lat, fuzzM);
    if (map.getSource('me-circle')) {
      map.getSource('me-circle').setData(data);
    } else {
      map.addSource('me-circle', { type: 'geojson', data });
      map.addLayer({ id: 'me-circle-fill', type: 'fill', source: 'me-circle', paint: { 'fill-color': '#8B0000', 'fill-opacity': 0.12 } });
      map.addLayer({ id: 'me-circle-line', type: 'line', source: 'me-circle', paint: { 'line-color': '#C8102E', 'line-width': 1.5, 'line-opacity': 0.6 } });
    }

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!ghost) {
      const mk = new maplibregl.Marker({ element: markerEl({ glyph: '☽', mine: true }) }).setLngLat([lng, lat]).addTo(map);
      markersRef.current.push(mk);
    }
    nearby.forEach(p => {
      if (p.fuzzLat == null || p.fuzzLng == null) return;
      const el = markerEl({ glyph: p.avatar, avatarUrl: p.avatarUrl });
      el.title = `${p.handle}${p.distanceMi != null ? ` · ~${p.distanceMi} mi` : ''}`;
      el.addEventListener('click', () => onOpenUser && onOpenUser(p.handle));
      markersRef.current.push(new maplibregl.Marker({ element: el }).setLngLat([p.fuzzLng, p.fuzzLat]).addTo(map));
    });
  }, [state, nearby, ghost, fuzzM, onOpenUser]);

  if (!sharing) {
    return (
      <div className="absolute inset-0 top-[100px] bottom-0 flex flex-col items-center justify-center text-center px-8 bg-[#070708]">
        <div className="text-4xl mb-3">🜨</div>
        <p className="text-[#A8A29E] text-sm mb-1" style={F.serif}>the living map needs your location.</p>
        <p className="text-[#6B6B6B] text-xs mb-4 leading-relaxed" style={F.serif}>share an approximate circle — others only ever see a fuzzed area, never your exact spot.</p>
        <button onClick={onOpenTonightStatus} className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]" style={F.ui}>share location →</button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 top-[100px] bottom-0 bg-[#070708]">
      <div ref={containerRef} className="absolute inset-0" />
      {state === 'loading' && <div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B] text-xs pointer-events-none" style={F.ui}>summoning the map…</div>}
      {state === 'denied' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
          <p className="text-[#A8A29E] text-sm" style={F.serif}>couldn't read your location.</p>
          <p className="text-[#6B6B6B] text-xs mt-1" style={F.serif}>allow location access, then reopen the map.</p>
        </div>
      )}
    </div>
  );
}
