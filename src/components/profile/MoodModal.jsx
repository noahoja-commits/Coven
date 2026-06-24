import { useState } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';
import { MOODS, MOOD_TTLS, moodActive } from '../../data/moods';

export function MoodModal({ current, onSave, onClose }) {
  const live = moodActive(current) ? current : null;
  const [pick, setPick] = useState(() => {
    if (!live) return null;
    return MOODS.find(m => m.label === live.label) || { id: 'custom', label: live.label, glyph: live.glyph || '✦', color: live.color || '#8B0000' };
  });
  const [custom, setCustom] = useState(live && !MOODS.some(m => m.label === live.label) ? live.label : '');
  const [ttl, setTtl] = useState('12h');

  const chosen = custom.trim()
    ? { id: 'custom', label: custom.trim().slice(0, 24), glyph: '✦', color: '#8B0000' }
    : pick;

  const save = () => {
    if (!chosen) return;
    const ms = (MOOD_TTLS.find(t => t.id === ttl) || MOOD_TTLS[1]).ms;
    onSave({ label: chosen.label, glyph: chosen.glyph, color: chosen.color, setAt: Date.now(), expiresAt: Date.now() + ms });
    onClose();
  };
  const clear = () => { onSave({}); onClose(); };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up safe-pb max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <SectionLabel rule={false}>current state</SectionLabel>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>SET YOUR MOOD</h3>
          </div>
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
        </div>

        <div className="p-4">
          <p className="text-[#A8A29E] text-xs mb-3" style={F.serif}>a self-set aura on your profile. it fades on its own.</p>

          <div className="grid grid-cols-3 gap-1.5">
            {MOODS.map(m => {
              const on = !custom.trim() && pick?.label === m.label;
              return (
                <button key={m.id} onClick={() => { setCustom(''); setPick(m); }}
                  className={`tap flex flex-col items-center gap-1 py-2.5 border ${on ? 'border-[#C9A961]/70' : 'border-[#2A2A2A] hover:border-[#5B0F1A]'}`}
                  style={{ boxShadow: on ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>
                  <span className="text-lg leading-none" style={{ color: m.color, textShadow: `0 0 8px ${m.color}99` }}>{m.glyph}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#A8A29E]" style={F.ui}>{m.label}</span>
                </button>
              );
            })}
          </div>

          <input
            value={custom}
            onChange={e => { setCustom(e.target.value.slice(0, 24)); }}
            placeholder="or name your own…"
            className="field mt-3"
            maxLength={24}
          />

          <div className="mt-4">
            <div className="text-[9px] uppercase tracking-wider text-[#6B6B6B] mb-1.5" style={F.ui}>fades after</div>
            <div className="grid grid-cols-3 gap-1.5">
              {MOOD_TTLS.map(t => (
                <button key={t.id} onClick={() => setTtl(t.id)}
                  className={`tap px-1 py-1.5 text-center border text-[10px] uppercase tracking-wider ${ttl === t.id ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]'}`}
                  style={{ ...F.ui, boxShadow: ttl === t.id ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          {live && (
            <button onClick={clear} className="btn btn-quiet">clear</button>
          )}
          <button onClick={onClose} className="btn btn-ghost ml-auto">cancel</button>
          <button onClick={save} disabled={!chosen} className="btn btn-primary">set mood</button>
        </div>
      </div>
    </div>
  );
}
