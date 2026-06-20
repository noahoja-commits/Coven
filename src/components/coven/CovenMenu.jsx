import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

const PORTALS = [
  { id: 'library', name: 'The Library', desc: 'sacred texts. shared marginalia. the dead speak.', glyph: '✟', tone: 'gold', enabled: true },
  { id: 'oddities', name: 'Oddities', desc: 'wares & curiosities. for sale, for trade, for keeping.', glyph: '⚱', tone: 'red', enabled: true },
  { id: 'tarot', name: 'The Deck', desc: 'one card a day. the alchemystic woodcut.', glyph: '✦', tone: 'gold', enabled: true },
  { id: 'ephemeris', name: 'The Ephemeris', desc: 'moon, sun, stars. tonight\u2019s sky.', glyph: '☽', tone: 'silver', enabled: true },
  { id: 'codex', name: 'The Codex', desc: 'a dictionary. goth, occult, scene, sacred.', glyph: '⌬', tone: 'gold', enabled: true },
  { id: 'sigils', name: 'Sigils', desc: 'give your intention a body. line, circle, sealed.', glyph: '⛧', tone: 'red', enabled: true },
  { id: 'pendulum', name: 'The Pendulum', desc: 'ask once. yes, no, or ask again.', glyph: '◯', tone: 'silver', enabled: true },
  { id: 'confessions', name: 'Confessions', desc: 'speak without your name. no replies.', glyph: '☩', tone: 'red', enabled: true },
  { id: 'souls', name: 'Souls', desc: 'the directory. who is counted.', glyph: '☥', tone: 'silver', enabled: true },
];

export function CovenMenu({ onClose, onOpen }) {
  return (
    <div className="absolute inset-0 z-30 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #14080C 0%, #050204 70%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <button onClick={onClose} className="absolute top-4 right-4 z-20 text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors safe-pt"><X size={20} /></button>
      {/* start-aligned + padded (NOT justify-center) so all 9 doors scroll into
          reach — centering a taller-than-viewport column clips the top/bottom. */}
      <div className="absolute inset-0 flex flex-col items-center px-6 py-14 safe-pt safe-pb overflow-y-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-[#A89968] text-[10px] uppercase tracking-[0.5em] mb-3" style={F.scriptureSC}>· enter the ·</div>
          <h1 className="text-[#C9A961] text-5xl mb-3" style={F.brand}>Coven</h1>
          <p className="text-[#A89968]/70 text-sm italic max-w-xs mx-auto" style={F.scripture}>"choose your door."</p>
        </div>
        <div className="w-full max-w-sm space-y-2.5">
          {PORTALS.map(p => {
            const tone = p.tone === 'red' ? '#5B0F1A' : p.tone === 'silver' ? '#8A8A92' : '#A89968';
            return (
              <button key={p.id}
                onClick={() => p.enabled && onOpen(p.id)}
                disabled={!p.enabled}
                className={`w-full text-left flex items-center gap-3 p-3 border transition-all ${p.enabled ? 'border-[#2A2A2A] hover:border-[#5B0F1A]/60 hover:bg-[#5B0F1A]/5' : 'border-[#1A1A1A] opacity-50'}`}>
                <div className="w-12 h-12 flex items-center justify-center text-2xl shrink-0 border" style={{ color: tone, borderColor: `${tone}40` }}>{p.glyph}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h3 className="text-[#F5F1E8] text-base" style={F.scripture}>{p.name}</h3>
                    {p.soon && <span className="text-[8px] uppercase tracking-wider text-[#5B0F1A]" style={F.ui}>soon</span>}
                  </div>
                  <p className="text-[#A89968]/70 text-[11px] italic" style={F.scripture}>{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-8 text-[#A89968]/40 text-xs text-center" style={F.scripture}>· more doors will open ·</div>
      </div>
    </div>
  );
}
