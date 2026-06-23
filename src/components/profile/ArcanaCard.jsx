import { arcanaFor } from '../shared/Sigils';
import { OrnateFrame } from '../shared/Sigils';
import { F } from '../../styles/fonts';
import { TAROT_DECK } from '../../data/tarot';

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

  if (mode === 'compact') {
    return (
      <button onClick={onTap} title={`${c.numeral} · ${c.name}`}
        className="relative inline-flex flex-col items-center justify-center w-9 h-14 border border-[#C9A961]/40 bg-[#0A0204]/70 hover:border-[#C9A961]/80 transition-colors shrink-0">
        <span className="text-[7px] text-[#C8102E] leading-none mt-1" style={F.mono}>{c.numeral}</span>
        <span className="text-lg text-[#C9A961] leading-none my-auto">{c.symbol}</span>
        <span className="text-[5px] uppercase tracking-[0.15em] text-[#C8102E]/70 leading-none mb-1 px-0.5 truncate max-w-full" style={F.ui}>{c.name}</span>
      </button>
    );
  }

  // full card face
  return (
    <div className="relative w-[200px] aspect-[5/8] bg-[#0A0204] border border-[#C9A961]/30 animate-card-flip overflow-hidden flex flex-col items-center justify-center px-5 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1A0810 0%, #0A0204 70%)' }}>
      <OrnateFrame glow inset={8} />
      <div className="text-[#C8102E] text-xs tracking-[0.3em] mb-3" style={F.mono}>{c.numeral}</div>
      <div className="text-[#C9A961] text-6xl leading-none mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(201,169,97,0.4))' }}>{c.symbol}</div>
      <div className="text-[#F5F1E8] text-lg leading-tight mb-2" style={F.displayOrnate}>{c.name}</div>
      {c.meaning && <div className="text-[#C8102E]/80 text-[11px] italic leading-snug" style={F.scripture}>{c.meaning}</div>}
    </div>
  );
}
