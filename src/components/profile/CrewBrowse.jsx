import { useState } from 'react';
import { ArrowLeft, Users, Check, Plus, X } from 'lucide-react';
import { F } from '../../styles/fonts';

const GLYPHS = ['✦', '🦇', '🕯', '✟', '🌹', '⛧', '☾', '🜏', '⚰', '🔮', '🌑', '⛧'];

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
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>CREWS</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{crews.length} circles · find yours</div>
          </div>
          <button onClick={() => setCreating(v => !v)} className="text-[10px] uppercase tracking-wider px-3 py-1.5 border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] flex items-center gap-1.5" style={F.ui}>
            {creating ? <><X size={11} /> close</> : <><Plus size={11} /> conjure</>}
          </button>
        </div>
      </div>

      {creating && (
        <div className="px-4 py-4 border-b border-[#1A1A1A] bg-[#0F0F0F] space-y-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· conjure a circle ·</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="crew name"
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#F5F1E8] text-sm placeholder-[#5B5B5B] focus:border-[#5B0F1A] outline-none" style={F.display} />
          <div className="flex flex-wrap gap-1.5">
            {GLYPHS.map((g, i) => (
              <button key={i} onClick={() => setGlyph(g)}
                className={`w-9 h-9 border flex items-center justify-center text-lg ${glyph === g ? 'border-[#8B0000] bg-[#8B0000]/15 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A89968]'}`}>{g}</button>
            ))}
          </div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="what gathers here…" rows={2}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2 text-[#A8A29E] text-xs italic placeholder-[#5B5B5B] focus:border-[#5B0F1A] outline-none resize-none" style={F.serif} />
          <button onClick={submit} disabled={!name.trim()}
            className="w-full text-[11px] uppercase tracking-wider py-2 border border-[#8B0000] bg-[#8B0000]/15 text-[#F5F1E8] disabled:opacity-40" style={F.ui}>
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
                className="w-12 h-12 shrink-0 border border-[#2A2A2A] flex items-center justify-center text-[#A89968] text-xl">
                {c.glyph}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <button onClick={() => isMember && onOpen && onOpen(c.id)}
                    className="text-[#F5F1E8] text-base text-left" style={F.display}>{c.name}</button>
                  <span className="text-[10px] text-[#6B6B6B] shrink-0 flex items-center gap-1" style={F.mono}>
                    <Users size={9} /> {c.members}
                  </span>
                </div>
                {c.description && <p className="text-[#A8A29E] text-xs italic leading-snug mb-1" style={F.serif}>{c.description}</p>}
                <div className="mt-2">
                  {isMember ? (
                    <button onClick={() => onOpen && onOpen(c.id)}
                      className="text-[10px] uppercase tracking-wider px-3 py-1 border border-[#8B0000] bg-[#8B0000]/15 text-[#F5F1E8] flex items-center gap-1.5"
                      style={F.ui}>
                      <Check size={11} /> member · open
                    </button>
                  ) : (
                    <button onClick={() => !isBusy && onJoin && onJoin(c.id)} disabled={isBusy}
                      className="text-[10px] uppercase tracking-wider px-3 py-1 border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] disabled:opacity-40" style={F.ui}>
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
