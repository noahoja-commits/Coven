import { useState } from 'react';
import { X, Loader2, MapPin, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { getVenues, addVenue } from '../../lib/venues';
import { getPosition } from '../../lib/weather';
import { geocodeVenue } from '../../lib/geocode';
import { Button } from '../shared/Button';

const COVERS = [
  { id: 'red', grad: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)' },
  { id: 'violet', grad: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)' },
  { id: 'black', grad: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)' },
];

const field = 'field';
const label = 'text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block';

export function CreateEventModal({ onCreate, onClose, initialCoords = null }) {
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cover, setCover] = useState('red');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [ticketed, setTicketed] = useState(false);
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [ageRestriction, setAgeRestriction] = useState('all'); // 'all' | '18' | '21'
  const [attested, setAttested] = useState(false); // Stripe-safe: not paid metaphysical services
  const [saving, setSaving] = useState(false);
  const [coords, setCoords] = useState(initialCoords); // {lat,lng} — the map pin
  const [fromMap, setFromMap] = useState(!!initialCoords); // true = picked on the map, false = device location
  const [locating, setLocating] = useState(false);
  const [savedVenues] = useState(() => getVenues());

  const priceNum = parseFloat(price || '0');
  const valid = name.trim().length > 1 && (!ticketed || (priceNum > 0 && attested));

  // Drop the event's map pin at the host's current location (precise, opt-in).
  const pinLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const pos = await getPosition();
      setCoords({ lat: pos.latitude, lng: pos.longitude });
      setFromMap(false);
    } catch {
      setCoords(null);
      setFromMap(false);
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
      // Resolve the map pin: the host's dropped pin wins; otherwise best-effort geocode the
      // venue/neighborhood text. No location ⇒ the event is list-only (never on the map).
      let loc = coords;
      if (!loc && (venue.trim() || neighborhood.trim())) {
        loc = await geocodeVenue([venue.trim(), neighborhood.trim()].filter(Boolean).join(', '));
      }
      await onCreate({
        name: name.trim(),
        venue: venue.trim(),
        neighborhood: neighborhood.trim(),
        date: date || null,
        time: time.trim(),
        cover,
        tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 6),
        description: description.trim(),
        ticketed,
        priceCents: ticketed ? Math.max(0, Math.round(priceNum * 100)) : 0,
        capacity: capacity ? Math.max(1, parseInt(capacity, 10) || 0) || null : null,
        ageRestriction: ageRestriction === 'all' ? null : ageRestriction,
        lat: loc?.lat,
        lng: loc?.lng,
      });
      if (venue.trim()) addVenue(venue.trim());
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[92vh] flex flex-col animate-slide-up safe-pb">
        <div className="px-4 h-[60px] flex items-center justify-between border-b border-[#1A1A1A] shrink-0">
          <div className="text-[#F5F1E8] text-base tracking-[0.25em]" style={F.display}>HOST A RITE</div>
          <button onClick={onClose} className="tap p-2 -m-1 text-[#A8A29E] hover:text-[#C9A961] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className={label} style={F.scriptureSC}>· name ·</label>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 80))} placeholder="Vespers vol. IV" className={field} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} style={F.scriptureSC}>· date ·</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={field} />
            </div>
            <div>
              <label className={label} style={F.scriptureSC}>· time ·</label>
              <input value={time} onChange={e => setTime(e.target.value.slice(0, 20))} placeholder="10PM" className={field} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} style={F.scriptureSC}>· venue ·</label>
              <input value={venue} onChange={e => setVenue(e.target.value.slice(0, 60))} placeholder="The Parish" list="coven-venues" className={field} />
              {savedVenues.length > 0 && <datalist id="coven-venues">{savedVenues.map(v => <option key={v.name} value={v.name} />)}</datalist>}
            </div>
            <div>
              <label className={label} style={F.scriptureSC}>· neighborhood ·</label>
              <input value={neighborhood} onChange={e => setNeighborhood(e.target.value.slice(0, 40))} placeholder="Bushwick" className={field} />
            </div>
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· on the map ·</label>
            <button type="button" onClick={pinLocation} disabled={locating}
              className={`tap w-full flex items-center justify-center gap-2 py-2.5 text-[11px] uppercase tracking-wider border transition-colors ${coords ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/50'}`}
              style={coords ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>
              {locating ? <><Loader2 size={13} className="animate-spin" /> pinning…</>
                : coords ? <><Check size={13} /> {fromMap ? 'pinned where you tapped' : 'pinned to your location'}</>
                : <><MapPin size={13} /> pin this rite on the map</>}
            </button>
            <p className="text-[10px] text-[#6B6B6B] italic mt-1.5" style={F.serif}>
              {coords ? (fromMap ? 'the rite sits where you tapped on the map. tap the button to re-pin it to where you are now.'
                : 'tap again to re-pin. remove nothing — this only sets the map marker.')
                : 'drops a map pin at where you are now. skip it and we’ll place it from the venue text.'}
            </p>
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· tags · (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="darkwave, goth, 18+" className={field} />
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· the door ·</label>
            <div className="flex gap-2">
              {[['all', 'all ages'], ['18', '18+'], ['21', '21+']].map(([v, lbl]) => (
                <button key={v} type="button" onClick={() => setAgeRestriction(v)}
                  className={`tap flex-1 py-2 text-[11px] uppercase tracking-wider border transition-colors ${ageRestriction === v ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/50'}`}
                  style={ageRestriction === v ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>{lbl}</button>
              ))}
            </div>
            {ageRestriction !== 'all' && (
              <p className="text-[10px] text-[#9E2A33]/60 italic mt-1.5" style={F.serif}>guests confirm their age at the door.</p>
            )}
          </div>

          <div className="border border-[#2A2A2A] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#F5F1E8] text-sm" style={F.serif}>Sell tickets</span>
              <button type="button" onClick={() => setTicketed(v => !v)}
                className={`tap relative w-10 h-5 rounded-full transition-colors ${ticketed ? 'bg-[#5B0F1A]' : 'bg-[#2A2A2A]'}`}
                style={ticketed ? { boxShadow: '0 0 10px rgba(201,169,97,0.18)' } : undefined}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${ticketed ? 'left-5 bg-[#C9A961]' : 'left-0.5 bg-[#F5F1E8]'}`} />
              </button>
            </div>
            {ticketed && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} style={F.scriptureSC}>· price (USD) ·</label>
                    <div className="flex items-center bg-[#0A0A0A] border border-[#2A2A2A] focus-within:border-[#C9A961]/50">
                      <span className="pl-2.5 text-[#6B6B6B]" style={F.mono}>$</span>
                      <input type="number" min="0" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="15" className="flex-1 bg-transparent outline-none p-2.5 text-[#F5F1E8] text-sm" style={F.serif} />
                    </div>
                  </div>
                  <div>
                    <label className={label} style={F.scriptureSC}>· capacity ·</label>
                    <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="∞" className={field} />
                  </div>
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={attested} onChange={e => setAttested(e.target.checked)} className="mt-0.5 accent-[#5B0F1A] shrink-0" />
                  <span className="text-[11px] leading-relaxed text-[#A8A29E]" style={F.serif}>
                    I'm selling tickets to an event, gathering, or art — not paid psychic, tarot, spell, or other metaphysical services.
                  </span>
                </label>
              </>
            )}
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· poster mood ·</label>
            <div className="flex gap-2">
              {COVERS.map(c => (
                <button key={c.id} type="button" onClick={() => setCover(c.id)}
                  className={`tap flex-1 h-12 border-2 transition-all ${cover === c.id ? 'border-[#C9A961]' : 'border-[#2A2A2A]'}`}
                  style={cover === c.id ? { background: c.grad, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : { background: c.grad }} />
              ))}
            </div>
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· details ·</label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 600))} rows={3}
              placeholder="the rite, the dress code, the door…" className={`${field} resize-none`} />
          </div>
        </div>

        <div className="p-4 border-t border-[#1A1A1A] flex items-center justify-end gap-2 shrink-0">
          <Button variant="ghost" onClick={onClose}>cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!valid || saving}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> hosting</> : 'host it'}
          </Button>
        </div>
      </div>
    </div>
  );
}
