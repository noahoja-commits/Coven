import { X, BookOpen } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TEXTS } from '../../data/library';

function CoverArt({ kind, sigil, glyph }) {
  const palettes = {
    oxblood: { bg: 'linear-gradient(135deg, #5B0F1A 0%, #2A0710 70%, #0A0204 100%)', stroke: '#8B0000', text: '#C9A961' },
    darkleather: { bg: 'linear-gradient(135deg, #2A1810 0%, #14080C 70%, #0A0408 100%)', stroke: '#5C3A1A', text: '#A89968' },
    midnight: { bg: 'linear-gradient(135deg, #1A1A2E 0%, #0F0F1F 70%, #08081A 100%)', stroke: '#5C5C8A', text: '#A89968' },
    fadedgreen: { bg: 'linear-gradient(135deg, #1A2E1F 0%, #0F1F14 70%, #08140A 100%)', stroke: '#3A5C3F', text: '#A89968' },
    black: { bg: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', stroke: '#3F3F3F', text: '#C9A961' },
  };
  const p = palettes[kind] || palettes.black;
  return (
    <div className="relative w-full aspect-[2/3] overflow-hidden border" style={{ background: p.bg, borderColor: p.stroke }}>
      <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full">
        <rect x="3" y="3" width="94" height="144" fill="none" stroke={p.stroke} strokeWidth="0.4" opacity="0.6" />
        <rect x="6" y="6" width="88" height="138" fill="none" stroke={p.stroke} strokeWidth="0.2" opacity="0.4" />
        <g transform="translate(50, 38)" stroke={p.text} strokeWidth="0.4" fill="none" opacity="0.7">
          {sigil === 'cross' && <><line x1="0" y1="-12" x2="0" y2="12" /><line x1="-8" y1="-4" x2="8" y2="-4" /><circle cx="0" cy="0" r="14" /></>}
          {sigil === 'pentacle' && <><circle cx="0" cy="0" r="14" /><polygon points="0,-12 11,4 -7,-7 7,-7 -11,4" /></>}
          {sigil === 'hexagram' && <><circle cx="0" cy="0" r="14" /><polygon points="0,-12 10,6 -10,6" /><polygon points="0,12 10,-6 -10,-6" /></>}
          {sigil === 'sun' && <><circle cx="0" cy="0" r="6" /><circle cx="0" cy="0" r="14" />{[0, 45, 90, 135, 180, 225, 270, 315].map(a => (<line key={a} x1="0" y1="-9" x2="0" y2="-13" transform={`rotate(${a})`} />))}</>}
          {sigil === 'triangle' && <><polygon points="0,-12 10,8 -10,8" /><circle cx="0" cy="0" r="14" /><circle cx="0" cy="0" r="3" /></>}
          {sigil === 'crossfleury' && <><line x1="0" y1="-12" x2="0" y2="12" /><line x1="-12" y1="0" x2="12" y2="0" /><circle cx="0" cy="-12" r="2" /><circle cx="0" cy="12" r="2" /><circle cx="-12" cy="0" r="2" /><circle cx="12" cy="0" r="2" /></>}
          {sigil === 'goetic' && <><circle cx="0" cy="0" r="14" /><polygon points="0,-12 11,4 -7,-7 7,-7 -11,4" transform="rotate(180)" /><circle cx="0" cy="0" r="3" /></>}
          {sigil === 'caduceus' && <><line x1="0" y1="-14" x2="0" y2="14" /><path d="M 0 -10 Q 8 -4, 0 0 Q -8 4, 0 10" /><path d="M 0 -10 Q -8 -4, 0 0 Q 8 4, 0 10" /></>}
        </g>
        <text x="50" y="100" textAnchor="middle" fill={p.text} fontSize="3.5" letterSpacing="1" style={{ fontFamily: 'IM Fell English SC, serif' }} opacity="0.85">{glyph}</text>
      </svg>
    </div>
  );
}

export function LibraryOverlay({ onClose, onOpenText }) {
  return (
    <div className="absolute inset-0 z-40 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A1808 0%, #0A0408 65%, #050204 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <div className="absolute top-0 inset-x-0 z-10 bg-black/60 backdrop-blur-md border-b border-[#5C3A1A]/40 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#C8102E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><X size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.scriptureSC}>THE LIBRARY</div>
          <BookOpen size={18} className="text-[#C8102E]" />
        </div>
      </div>
      <div className="absolute inset-0 pt-[60px] pb-8 overflow-y-auto safe-pb">
        <div className="px-4 py-6 text-center">
          <div className="text-[#C8102E] text-[10px] uppercase tracking-[0.4em] mb-3" style={F.scriptureSC}>· of the wisdoms gathered ·</div>
          <h1 className="text-[#C9A961] text-3xl mb-2" style={F.scripture}>The Library</h1>
          <p className="text-[#C8102E]/80 text-sm italic max-w-xs mx-auto" style={F.scripture}>"sacred and profane texts. read freely. tend the marginalia. the dead speak through these pages."</p>
        </div>
        <div className="px-4 grid grid-cols-2 gap-4 pb-12">
          {TEXTS.map(t => (
            <button key={t.id} onClick={() => onOpenText(t.id)} className="group text-left">
              <CoverArt kind={t.cover} sigil={t.sigil} glyph={t.glyph} />
              <div className="mt-2 text-[#C9A961] text-xs leading-tight" style={F.scriptureSC}>{t.shortTitle.toUpperCase()}</div>
              <div className="text-[#C8102E]/70 text-[10px] mt-0.5" style={F.scripture}>{t.author}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
