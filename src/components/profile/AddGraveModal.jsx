import { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';

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
            <SectionLabel rule={false}>bury</SectionLabel>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>IN MEMORIAM</h3>
          </div>
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· name ·</label>
            <input value={name} onChange={e => setName(e.target.value.slice(0, 40))}
              placeholder="who or what"
              className="field mt-1.5"
              style={F.display} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· kind ·</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {KINDS.map(k => (
                <button key={k} onClick={() => setKind(k)}
                  className={`tap text-[11px] px-2 py-1 border uppercase tracking-wider ${kind === k ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]'}`}
                  style={{ ...F.ui, boxShadow: kind === k ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{k}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· dates ·</label>
            <input value={dates} onChange={e => setDates(e.target.value.slice(0, 40))}
              placeholder="2021 — 2024"
              className="field mt-1.5"
              style={F.mono} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· epitaph ·</label>
            <textarea value={epitaph} onChange={e => setEpitaph(e.target.value.slice(0, 140))}
              placeholder="what it was. how it ended."
              rows={3}
              className="field mt-1.5 italic resize-none" />
          </div>
          <button onClick={() => setIsPrivate(p => !p)} className="tap w-full flex items-center gap-3 text-left">
            <span className={`shrink-0 w-5 h-5 border flex items-center justify-center transition-all ${isPrivate ? 'border-[#5B0F1A] bg-[#5B0F1A]/30 text-[#C9A961]' : 'border-[#2A2A2A] text-transparent'}`}>✓</span>
            <span className="flex items-center gap-1.5 text-[#A8A29E] text-xs" style={F.serif}>
              <Lock size={12} className={isPrivate ? 'text-[#C9A961]' : 'text-[#6B6B6B]'} />
              private — only you can see this memorial
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <button onClick={onClose} className="btn btn-ghost ml-auto">cancel</button>
          <button onClick={submit} disabled={!name.trim()} className="btn btn-primary">bury it</button>
        </div>
      </div>
    </div>
  );
}
