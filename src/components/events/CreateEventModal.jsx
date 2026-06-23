import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';

const COVERS = [
  { id: 'red', grad: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)' },
  { id: 'violet', grad: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)' },
  { id: 'black', grad: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)' },
];

const field = 'w-full p-2.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none text-[#F5F1E8] text-sm';
const label = 'text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1.5 block';

export function CreateEventModal({ onCreate, onClose }) {
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

  const priceNum = parseFloat(price || '0');
  const valid = name.trim().length > 1 && (!ticketed || (priceNum > 0 && attested));

  const submit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    try {
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
        priceCents: ticketed ? Math.round(priceNum * 100) : 0,
        capacity: capacity ? parseInt(capacity, 10) : null,
        ageRestriction: ageRestriction === 'all' ? null : ageRestriction,
      });
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
          <button onClick={onClose} className="p-2 -m-1 text-[#A8A29E] hover:text-[#F5F1E8] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className={label} style={F.scriptureSC}>· name ·</label>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 80))} placeholder="Vespers vol. IV" className={field} style={F.serif} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} style={F.scriptureSC}>· date ·</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={field} style={F.serif} />
            </div>
            <div>
              <label className={label} style={F.scriptureSC}>· time ·</label>
              <input value={time} onChange={e => setTime(e.target.value.slice(0, 20))} placeholder="10PM" className={field} style={F.serif} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label} style={F.scriptureSC}>· venue ·</label>
              <input value={venue} onChange={e => setVenue(e.target.value.slice(0, 60))} placeholder="The Parish" className={field} style={F.serif} />
            </div>
            <div>
              <label className={label} style={F.scriptureSC}>· neighborhood ·</label>
              <input value={neighborhood} onChange={e => setNeighborhood(e.target.value.slice(0, 40))} placeholder="Bushwick" className={field} style={F.serif} />
            </div>
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· tags · (comma separated)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder="darkwave, goth, 18+" className={field} style={F.serif} />
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· the door ·</label>
            <div className="flex gap-2">
              {[['all', 'all ages'], ['18', '18+'], ['21', '21+']].map(([v, lbl]) => (
                <button key={v} type="button" onClick={() => setAgeRestriction(v)}
                  className={`flex-1 py-2 text-[11px] uppercase tracking-wider border transition-colors ${ageRestriction === v ? 'border-[#8B0000] bg-[#5B0F1A]/25 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={F.ui}>{lbl}</button>
              ))}
            </div>
            {ageRestriction !== 'all' && (
              <p className="text-[10px] text-[#A89968]/60 italic mt-1.5" style={F.serif}>guests confirm their age at the door.</p>
            )}
          </div>

          <div className="border border-[#2A2A2A] p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#F5F1E8] text-sm" style={F.serif}>Sell tickets</span>
              <button type="button" onClick={() => setTicketed(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${ticketed ? 'bg-[#5B0F1A]' : 'bg-[#2A2A2A]'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#F5F1E8] transition-all ${ticketed ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
            {ticketed && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label} style={F.scriptureSC}>· price (USD) ·</label>
                    <div className="flex items-center bg-[#0A0A0A] border border-[#2A2A2A] focus-within:border-[#5B0F1A]">
                      <span className="pl-2.5 text-[#6B6B6B]" style={F.mono}>$</span>
                      <input type="number" min="0" step="1" value={price} onChange={e => setPrice(e.target.value)} placeholder="15" className="flex-1 bg-transparent outline-none p-2.5 text-[#F5F1E8] text-sm" style={F.serif} />
                    </div>
                  </div>
                  <div>
                    <label className={label} style={F.scriptureSC}>· capacity ·</label>
                    <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="∞" className={field} style={F.serif} />
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
                  className={`flex-1 h-12 border-2 transition-all ${cover === c.id ? 'border-[#C9A961]' : 'border-[#2A2A2A]'}`}
                  style={{ background: c.grad }} />
              ))}
            </div>
          </div>
          <div>
            <label className={label} style={F.scriptureSC}>· details ·</label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 600))} rows={3}
              placeholder="the rite, the dress code, the door…" className={`${field} resize-none`} style={F.serif} />
          </div>
        </div>

        <div className="p-4 border-t border-[#1A1A1A] flex items-center justify-end gap-2 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E] hover:text-[#F5F1E8] transition-colors" style={F.ui}>cancel</button>
          <button onClick={submit} disabled={!valid || saving}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40 flex items-center gap-2 transition-colors" style={F.ui}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> hosting</> : 'host it'}
          </button>
        </div>
      </div>
    </div>
  );
}
