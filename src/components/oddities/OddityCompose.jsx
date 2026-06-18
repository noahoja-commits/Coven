import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { F } from '../../styles/fonts';
import { ODDITY_CATEGORIES, CONDITION_LABELS } from '../../data/oddities';

export function OddityCompose({ onClose, onCreate }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ title: '', price: '', priceMode: 'firm', condition: 'used', category: 'clothing', description: '', storyBehind: '' });

  const advance = () => {
    if (step < 3) { setStep(step + 1); return; }
    if (!data.title.trim()) return;
    onCreate && onCreate(data);
    onClose && onClose();
  };

  const canAdvance = step !== 1 ? true : data.title.trim().length > 0;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0608] animate-fade-in flex flex-col">
      <div className="bg-black/60 backdrop-blur-md border-b border-[#5B0F1A]/40">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors">
            <X size={20} />
          </button>
          <div className="text-[#C9A961] text-sm tracking-[0.3em]" style={F.scriptureSC}>LIST WARE — {step}/3</div>
          <button disabled={!canAdvance} onClick={advance}
            className="text-[#F5F1E8] text-xs px-3 py-1.5 bg-[#8B0000] hover:bg-[#5B0F1A] uppercase tracking-wider disabled:opacity-40" style={F.ui}>
            {step < 3 ? 'next' : 'list it'}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2 block" style={F.scriptureSC}>· photographs ·</label>
              <button className="w-full aspect-[4/3] border border-dashed border-[#3F3F3F] flex flex-col items-center justify-center gap-2 text-[#A89968]">
                <Camera size={28} />
                <span className="text-xs uppercase tracking-wider" style={F.ui}>tap to add</span>
              </button>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1 block" style={F.scriptureSC}>· title ·</label>
              <input value={data.title} onChange={e => setData({ ...data, title: e.target.value })}
                placeholder="describe the ware" className="w-full bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8]" style={F.serif} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1 block" style={F.scriptureSC}>· category ·</label>
              <select value={data.category} onChange={e => setData({ ...data, category: e.target.value })}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] outline-none p-3 text-[#F5F1E8]" style={F.serif}>
                {ODDITY_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id} className="bg-[#0F0F0F]">{c.label}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1 block" style={F.scriptureSC}>· price · usd ·</label>
              <input type="number" value={data.price} onChange={e => setData({ ...data, price: e.target.value })}
                placeholder="0" className="w-full bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8] text-2xl" style={F.mono} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2 block" style={F.scriptureSC}>· terms ·</label>
              <div className="grid grid-cols-3 gap-2">
                {[{ id: 'firm', label: 'firm' }, { id: 'obo', label: 'or best offer' }, { id: 'trade', label: 'open to trades' }].map(p => (
                  <button key={p.id} onClick={() => setData({ ...data, priceMode: p.id })}
                    className={`py-3 border text-[10px] uppercase tracking-wider ${data.priceMode === p.id ? 'border-[#5B0F1A] bg-[#5B0F1A]/20 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
                    style={F.ui}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2 block" style={F.scriptureSC}>· condition ·</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setData({ ...data, condition: k })}
                    className={`py-3 border text-[10px] uppercase tracking-wider ${data.condition === k ? 'border-[#5B0F1A] bg-[#5B0F1A]/20 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
                    style={F.ui}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1 block" style={F.scriptureSC}>· description ·</label>
              <textarea value={data.description} onChange={e => setData({ ...data, description: e.target.value })}
                placeholder="size, condition details, what's included..."
                className="w-full h-32 bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8] resize-none" style={F.serif} />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1 block" style={F.scriptureSC}>· the story · optional ·</label>
              <textarea value={data.storyBehind} onChange={e => setData({ ...data, storyBehind: e.target.value })}
                placeholder="anything to share about this piece?"
                className="w-full h-24 bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#A8A29E] resize-none italic" style={F.serif} />
              <p className="text-[10px] text-[#6B6B6B] mt-1" style={F.serif}>where it came from, what it meant. helps it find the right home.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
