import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Button } from '../shared/Button';
import { ODDITY_CATEGORIES, CONDITION_LABELS } from '../../data/oddities';
import { uploadImage } from '../../lib/db/storage';

const KIND_COPY = {
  sale: { head: 'LIST WARE', title: 'describe the ware', price: '· price · usd ·', img: '· photographs ·' },
  wanted: { head: 'POST A WANTED', title: 'what are you seeking?', price: '· budget · usd ·', img: '· reference (optional) ·' },
  commission: { head: 'OFFER A COMMISSION', title: 'what do you make? (tattoos, portraits…)', price: '· starting at · usd ·', img: '· portfolio sample ·' },
};

export function OddityCompose({ meId, onClose, onCreate, kind = 'sale' }) {
  const copy = KIND_COPY[kind] || KIND_COPY.sale;
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ kind, title: '', price: '', priceMode: 'firm', condition: 'used', category: 'clothing', description: '', storyBehind: '', image_url: null });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const onPickImage = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try { setData(d => ({ ...d, image_url: '' })); const url = await uploadImage('listing-images', meId, file); setData(d => ({ ...d, image_url: url })); }
    catch (err) { setError(err?.message || 'upload failed'); setData(d => ({ ...d, image_url: null })); }
    finally { setUploading(false); }
  };

  const advance = () => {
    if (step < 3) { setStep(step + 1); return; }
    if (!data.title.trim() || uploading) return;
    onCreate && onCreate(data);
    onClose && onClose();
  };

  const canAdvance = (step !== 1 ? true : data.title.trim().length > 0) && !uploading;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0608] animate-fade-in flex flex-col">
      <div className="bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="tap text-[#C8102E] hover:text-[#C9A961] p-2 -m-1 transition-colors">
            <X size={20} />
          </button>
          <div className="text-[#C9A961] text-sm tracking-[0.3em]" style={F.scriptureSC}>{copy.head} — {step}/3</div>
          <Button variant="primary" disabled={!canAdvance} onClick={advance}>
            {step < 3 ? 'next' : 'list it'}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 safe-pb">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-2 block" style={F.scriptureSC}>{copy.img}</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="tap w-full aspect-[4/3] border border-dashed border-[#3F3F3F] hover:border-[#C9A961]/60 flex flex-col items-center justify-center gap-2 text-[#C8102E] overflow-hidden relative">
                {uploading ? <Loader2 size={28} className="animate-spin text-[#C9A961]" />
                  : data.image_url ? <img src={data.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : <><Camera size={28} /><span className="text-xs uppercase tracking-wider" style={F.ui}>tap to add</span></>}
              </button>
              {data.image_url && !uploading && (
                <button onClick={() => setData(d => ({ ...d, image_url: null }))} className="tap mt-1.5 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>remove photo</button>
              )}
              {error && <div className="text-[11px] text-[#8B0000] mt-1" style={F.ui}>{error}</div>}
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1 block" style={F.scriptureSC}>· title ·</label>
              <input value={data.title} onChange={e => setData({ ...data, title: e.target.value })}
                placeholder={copy.title} className="field p-3" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1 block" style={F.scriptureSC}>· category ·</label>
              <select value={data.category} onChange={e => setData({ ...data, category: e.target.value })}
                className="field p-3">
                {ODDITY_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id} className="bg-[#0F0F0F]">{c.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1 block" style={F.scriptureSC}>{copy.price}</label>
              <input type="number" value={data.price} onChange={e => setData({ ...data, price: e.target.value })}
                placeholder="0" className="field p-3 text-2xl" style={F.mono} />
            </div>
            {/* terms + condition only make sense for a sale */}
            {kind === 'sale' && (<>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-2 block" style={F.scriptureSC}>· terms ·</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'firm', label: 'firm' }, { id: 'obo', label: 'or best offer' }, { id: 'trade', label: 'open to trades' }].map(p => (
                  <button key={p.id} onClick={() => setData({ ...data, priceMode: p.id })}
                    className={`tap py-3 border text-[10px] uppercase tracking-wider transition-colors ${data.priceMode === p.id ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:text-[#C9A961]'}`}
                    style={data.priceMode === p.id ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-2 block" style={F.scriptureSC}>· condition ·</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setData({ ...data, condition: k })}
                    className={`tap py-3 border text-[10px] uppercase tracking-wider transition-colors ${data.condition === k ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:text-[#C9A961]'}`}
                    style={data.condition === k ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>{v}</button>
                ))}
              </div>
            </div>
            </>)}
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1 block" style={F.scriptureSC}>· description ·</label>
              <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })}
                placeholder="size, condition details, what's included..."
                className="field h-32 p-3 resize-none" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1 block" style={F.scriptureSC}>· the story · optional ·</label>
              <textarea value={data.storyBehind} onChange={e => setData({ ...data, storyBehind: e.target.value })}
                placeholder="anything to share about this piece?"
                className="field h-24 p-3 resize-none italic text-[#A8A29E]" />
              <p className="text-[10px] text-[#6B6B6B] mt-1" style={F.serif}>where it came from, what it meant. helps it find the right home.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
