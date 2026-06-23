import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { F } from '../../styles/fonts';

const KINDS = ['relationship', 'friendship', 'self', 'pet', 'era', 'job', 'place'];

export function AddGraveModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState('relationship');
  const [dates, setDates] = useState('');
  const [epitaph, setEpitaph] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), kind, dates: dates.trim(), epitaph: epitaph.trim(), private: isPrivate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up safe-pb max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#5B0F1A]" style={F.scriptureSC}>· bury ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>IN MEMORIAM</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· name ·</label>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 40))}
              placeholder="who or what"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-base"
              style={F.display} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· kind ·</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {KINDS.map(k => (
                <button key={k} onClick={() => setKind(k)}
                  className={`text-[11px] px-2 py-1 border uppercase tracking-wider ${kind === k ? 'border-[#5B0F1A] bg-[#5B0F1A]/15 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
                  style={F.ui}>{k}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· dates ·</label>
            <input value={dates} onChange={e => setDates(e.target.value.slice(0, 40))}
              placeholder="2021 — 2024"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm"
              style={F.mono} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· epitaph ·</label>
            <textarea value={epitaph} onChange={e => setEpitaph(e.target.value.slice(0, 140))}
              placeholder="what it was. how it ended."
              rows={3}
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm italic resize-none"
              style={F.serif} />
          </div>
          <button onClick={() => setIsPrivate(p => !p)} className="w-full flex items-center gap-3 text-left">
            <span className={`shrink-0 w-5 h-5 border flex items-center justify-center transition-all ${isPrivate ? 'border-[#5B0F1A] bg-[#5B0F1A]/30 text-[#C9A961]' : 'border-[#2A2A2A] text-transparent'}`}>✓</span>
            <span className="flex items-center gap-1.5 text-[#A8A29E] text-xs" style={F.serif}>
              <Lock size={12} className={isPrivate ? 'text-[#C9A961]' : 'text-[#6B6B6B]'} />
              private — only you can see this memorial
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>cancel</button>
          <button onClick={submit} disabled={!name.trim()}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40" style={F.ui}>bury it</button>
        </div>
      </div>
    </div>
  );
}
