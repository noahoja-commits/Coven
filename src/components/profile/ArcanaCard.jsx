import { arcanaFor } from '../shared/Sigils';
import { OrnateFrame } from '../shared/Sigils';
import { F } from '../../styles/fonts';
import { TAROT_DECK } from '../../data/tarot';
import { arcanaArtFor } from '../../lib/arcana';

// Each soul is deterministically dealt a Major Arcana (arcanaFor). We borrow the
// card's symbol + upright meaning from the existing TAROT_DECK by matching the name,
// so there's no separate symbol map to maintain.
function cardFor(handle) {
  const a = arcanaFor(handle); // { numeral, name } — name is UPPERCASE
  const deck = TAROT_DECK.find(c => c.type === 'major' && c.name.toUpperCase() === a.name);
  return { numeral: a.numeral, name: a.name, symbol: deck?.symbol || '✦', meaning: deck?.upright || '' };
}

// compact: a small engraved emblem that replaces the text chip in the profile header.
// full: a proper card face (shown in a flip modal) with the symbol, numeral, name + meaning.
export function ArcanaCard({ handle, mode = 'compact', onTap }) {
  const c = cardFor(handle);
  const art = arcanaArtFor(c.name); // a hand-made card illustration, or null → engraved symbol

  if (mode === 'compact') {
    return (
      <button onClick={onTap} title={`${c.numeral} · ${c.name}`}
        className="relative inline-flex flex-col items-center justify-center w-9 h-14 border border-[#C9A961]/40 bg-[#0A0204]/70 hover:border-[#C9A961]/80 transition-colors shrink-0 overflow-hidden">
        {art && <img src={art} alt="" className="absolute inset-0 w-full h-full object-cover" />}
        {art && <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35), transparent 40%, rgba(0,0,0,0.65))' }} />}
        <span className="relative text-[7px] text-[#9E2A33] leading-none mt-1" style={F.mono}>{c.numeral}</span>
        {!art && <span className="text-lg text-[#C9A961] leading-none my-auto">{c.symbol}</span>}
        <span className={`relative text-[5px] uppercase tracking-[0.15em] leading-none mb-1 px-0.5 truncate max-w-full ${art ? 'text-[#F5F1E8] mt-auto' : 'text-[#9E2A33]/70'}`} style={F.ui}>{c.name}</span>
      </button>
    );
  }

  // full card face
  if (art) {
    return (
      <div className="relative w-[200px] aspect-[5/8] bg-[#0A0204] border border-[#C9A961]/30 animate-card-flip overflow-hidden">
        <img src={art} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, transparent 28%, transparent 58%, rgba(5,2,4,0.92) 100%)' }} />
        <OrnateFrame glow inset={8} />
        <div className="absolute top-3 inset-x-0 text-center text-[#9E2A33] text-xs tracking-[0.3em]" style={F.mono}>{c.numeral}</div>
        <div className="absolute bottom-4 inset-x-0 px-5 text-center">
          <div className="text-[#F5F1E8] text-lg leading-tight mb-1" style={F.displayOrnate}>{c.name}</div>
          {c.meaning && <div className="text-[#9E2A33]/80 text-[11px] italic leading-snug" style={F.scripture}>{c.meaning}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-[200px] aspect-[5/8] bg-[#0A0204] border border-[#C9A961]/30 animate-card-flip overflow-hidden flex flex-col items-center justify-center px-5 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1A0810 0%, #0A0204 70%)' }}>
      <OrnateFrame glow inset={8} />
      <div className="text-[#9E2A33] text-xs tracking-[0.3em] mb-3" style={F.mono}>{c.numeral}</div>
      <div className="text-[#C9A961] text-6xl leading-none mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(201,169,97,0.4))' }}>{c.symbol}</div>
      <div className="text-[#F5F1E8] text-lg leading-tight mb-2" style={F.displayOrnate}>{c.name}</div>
      {c.meaning && <div className="text-[#9E2A33]/80 text-[11px] italic leading-snug" style={F.scripture}>{c.meaning}</div>}
    </div>
  );
}
