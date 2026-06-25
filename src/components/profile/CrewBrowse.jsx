import { useState } from 'react';
import { ArrowLeft, Users, Check, Plus, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';
import { GLYPHS } from '../../data/glyphs';

export function CrewBrowse({ crews = [], busy = {}, onJoin, onCreate, onOpen, onClose }) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [glyph, setGlyph] = useState('✦');
  const [desc, setDesc] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onCreate && onCreate({ name: name.trim(), glyph, description: desc.trim() });
    setName(''); setDesc(''); setGlyph('✦'); setCreating(false);
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>CREWS</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{crews.length} circles · find yours</div>
          </div>
          <button onClick={() => setCreating(v => !v)} className="btn btn-ghost">
            {creating ? <><X size={11} /> close</> : <><Plus size={11} /> conjure</>}
          </button>
        </div>
      </div>

      {creating && (
        <div className="px-4 py-4 border-b border-[#1A1A1A] bg-[#0F0F0F] space-y-3">
          <SectionLabel rule={false}>conjure a circle</SectionLabel>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="crew name"
            className="field" style={F.display} />
          <div className="flex flex-wrap gap-1.5">
            {GLYPHS.map((g, i) => (
              <button key={i} onClick={() => setGlyph(g)}
                className={`tap w-9 h-9 border flex items-center justify-center text-lg ${glyph === g ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#9E2A33] hover:border-[#5B0F1A]'}`}
                style={{ boxShadow: glyph === g ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{g}</button>
            ))}
          </div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="what gathers here…" rows={2}
            className="field italic resize-none" />
          <button onClick={submit} disabled={!name.trim()} className="btn btn-primary w-full">
            summon the crew
          </button>
        </div>
      )}

      {crews.length === 0 && !creating && (
        <div className="px-4 py-12 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>
          no circles have formed yet.<br />be the first to conjure one.
        </div>
      )}

      <div className="divide-y divide-[#1A1A1A]">
        {crews.map(c => {
          const isMember = c.isMember;
          const isBusy = !!busy[c.id];
          return (
            <div key={c.id} className="px-4 py-4 flex items-start gap-3">
              <button onClick={() => isMember && onOpen && onOpen(c.id)}
                className="tap w-12 h-12 shrink-0 border border-[#2A2A2A] flex items-center justify-center text-[#9E2A33] text-xl">
                {c.glyph}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <button onClick={() => isMember && onOpen && onOpen(c.id)}
                    className="tap text-[#F5F1E8] text-base text-left" style={F.display}>{c.name}</button>
                  <span className="text-[10px] text-[#6B6B6B] shrink-0 flex items-center gap-1" style={F.mono}>
                    <Users size={9} /> {c.members}
                  </span>
                </div>
                {c.description && <p className="text-[#A8A29E] text-xs italic leading-snug mb-1" style={F.serif}>{c.description}</p>}
                <div className="mt-2">
                  {isMember ? (
                    <button onClick={() => onOpen && onOpen(c.id)} className="btn btn-primary">
                      <Check size={11} /> member · open
                    </button>
                  ) : (
                    <button onClick={() => !isBusy && onJoin && onJoin(c.id)} disabled={isBusy} className="btn btn-ghost">
                      {isBusy ? '· joining ·' : 'join circle'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
