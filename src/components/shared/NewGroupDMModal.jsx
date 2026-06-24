import { useState } from 'react';
import { X, Users, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Button } from './Button';

export function NewGroupDMModal({ people = [], onCreate, onClose }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState(new Set());

  const candidates = people;

  const toggle = (h) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(h)) next.delete(h);
    else next.add(h);
    return next;
  });

  const submit = () => {
    if (selected.size < 1) return;
    const members = Array.from(selected);
    const groupName = name.trim() || (members.length === 1 ? members[0] : `the ${members.length + 1}`);
    onCreate && onCreate({ name: groupName, members });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] flex flex-col animate-slide-up safe-pb">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C9A961] flex items-center gap-1" style={F.scriptureSC}>
              <Users size={11} /> · new gathering ·
            </span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>WHISPER CIRCLE</h3>
          </div>
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4">
          <input value={name} onChange={e => setName(e.target.value.slice(0, 40))}
            placeholder="name the circle (optional)"
            className="field" />
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-2" style={F.scriptureSC}>
            · who you follow · {selected.size} chosen ·
          </div>
          {candidates.length === 0 && (
            <div className="text-center py-8 text-[#6B6B6B] text-xs italic" style={F.serif}>· follow people first to gather a circle ·</div>
          )}
          {candidates.map(u => {
            const isSel = selected.has(u.handle);
            return (
              <button key={u.handle} onClick={() => toggle(u.handle)}
                className={`tap w-full flex items-center gap-3 px-2 py-2 transition-colors ${isSel ? 'border border-[#C9A961]/70' : 'border border-transparent hover:bg-[#0A0A0A]'}`}
                style={isSel ? { boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : undefined}>
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">{u.avatar}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.ui}>{u.handle}</div>
                  {u.bio && <div className="text-[10px] text-[#A8A29E] truncate" style={F.serif}>{u.bio}</div>}
                </div>
                <div className={`w-5 h-5 border flex items-center justify-center ${isSel ? 'bg-[#C9A961] border-[#C9A961] text-[#0A0A0A]' : 'border-[#3F3F3F]'}`}>
                  {isSel && <Check size={11} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{selected.size} selected</span>
          <Button variant="ghost" onClick={onClose} className="ml-auto">cancel</Button>
          <Button variant="primary" onClick={submit} disabled={selected.size === 0}>open whispers</Button>
        </div>
      </div>
    </div>
  );
}
