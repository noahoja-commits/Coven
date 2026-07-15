import { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Clock, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TAROT_DECK, getDailyCard } from '../../data/tarot';

// â”€â”€ Marseille palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const INK  = '#1A0C04';          // dark warm black â€” outlines & text
const PARCHMENT = '#F2E8C6';     // aged card background
const RED  = '#C0283A';          // robe red
const BLUE = '#1B3D87';          // robe blue
const YEL  = '#C9960E';          // ochre/gold â€” crowns, sun, coins
const FLESH= '#E8BE8A';          // skin tones
const GRN  = '#2D6435';          // greenery

const ROMAN = ['â˜‰','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const RANK_LABEL = { ace:'ACE', two:'2', three:'3', four:'4', five:'5', six:'6', seven:'7', eight:'8', nine:'9', ten:'10', page:'PAGE', knight:'KNIGHT', queen:'QUEEN', king:'KING' };

// â”€â”€ Border â€” simple Marseille double-rect â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CardBorder({ w, h }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" width={w} height={h}>
      <rect x={3} y={3} width={w-6} height={h-6} rx={1} fill="none" stroke={INK} strokeWidth="1.8"/>
      <rect x={7} y={7} width={w-14} height={h-14} rx={0} fill="none" stroke={INK} strokeWidth="0.8"/>
    </svg>
  );
}

// â”€â”€ Shared figure helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Face({ x, y, r = 7, beard = false, hair = 'none', hCol = INK }) {
  const ew = r * 0.18, eh = r * 0.15; // eye dims
  return (
    <g>
      {/* Hair behind */}
      {hair === 'long' && <path d={`M${x - r},${y - r * 0.2} Q${x - r * 1.3},${y + r * 1.8} ${x - r * 0.8},${y + r * 2.6}`} fill={hCol} stroke={INK} strokeWidth="0.7"/>}
      {hair === 'long' && <path d={`M${x + r},${y - r * 0.2} Q${x + r * 1.3},${y + r * 1.8} ${x + r * 0.8},${y + r * 2.6}`} fill={hCol} stroke={INK} strokeWidth="0.7"/>}
      {/* Skull */}
      <circle cx={x} cy={y} r={r} fill={FLESH} stroke={INK} strokeWidth="1.2"/>
      {/* Hair on top */}
      {hair === 'short' && <path d={`M${x - r},${y - r * 0.3} Q${x - r * 0.6},${y - r * 1.5} ${x},${y - r * 1.3} Q${x + r * 0.6},${y - r * 1.5} ${x + r},${y - r * 0.3}`} fill={hCol} stroke={INK} strokeWidth="0.8"/>}
      {hair === 'long' && <path d={`M${x - r},${y - r * 0.3} Q${x - r * 0.5},${y - r * 1.6} ${x},${y - r * 1.4} Q${x + r * 0.5},${y - r * 1.6} ${x + r},${y - r * 0.3}`} fill={hCol} stroke={INK} strokeWidth="0.8"/>}
      {hair === 'curly' && <path d={`M${x - r},${y - r * 0.2} Q${x - r * 1.1},${y - r * 1.2} ${x - r * 0.3},${y - r * 1.5} Q${x + r * 0.3},${y - r * 1.8} ${x + r * 0.8},${y - r * 1.3} Q${x + r * 1.1},${y - r * 0.6} ${x + r},${y - r * 0.1}`} fill={hCol} stroke={INK} strokeWidth="0.8"/>}
      {hair === 'bun' && <ellipse cx={x} cy={y - r * 1.2} rx={r * 0.6} ry={r * 0.5} fill={hCol} stroke={INK} strokeWidth="0.8"/>}
      {/* Eyes */}
      <ellipse cx={x - r * 0.32} cy={y - r * 0.08} rx={ew} ry={eh} fill={INK}/>
      <ellipse cx={x + r * 0.32} cy={y - r * 0.08} rx={ew} ry={eh} fill={INK}/>
      {/* Nose */}
      <path d={`M${x},${y - r * 0.05} L${x - r * 0.14},${y + r * 0.22} L${x + r * 0.14},${y + r * 0.22}`} fill="none" stroke={INK} strokeWidth="0.55"/>
      {/* Mouth */}
      <path d={`M${x - r * 0.25},${y + r * 0.42} Q${x},${y + r * 0.6} ${x + r * 0.25},${y + r * 0.42}`} fill="none" stroke={INK} strokeWidth="0.6"/>
      {/* Beard */}
      {beard && <path d={`M${x - r * 0.7},${y + r * 0.5} Q${x - r * 0.8},${y + r * 1.4} ${x},${y + r * 1.6} Q${x + r * 0.8},${y + r * 1.4} ${x + r * 0.7},${y + r * 0.5}`} fill={hCol} stroke={INK} strokeWidth="0.8"/>}
    </g>
  );
}

function Hand({ x, y, dir = 'right' }) {
  const dx = dir === 'right' ? 1 : -1;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={3} ry={2.2} fill={FLESH} stroke={INK} strokeWidth="0.8"/>
      <line x1={x + dx * 2} y1={y - 1} x2={x + dx * 5} y2={y - 3} stroke={FLESH} strokeWidth="1.2"/>
      <line x1={x + dx * 2.5} y1={y} x2={x + dx * 5.5} y2={y - 0.5} stroke={FLESH} strokeWidth="1.2"/>
      <line x1={x + dx * 2} y1={y + 1} x2={x + dx * 4.5} y2={y + 2} stroke={FLESH} strokeWidth="1.2"/>
    </g>
  );
}

function Folds({ x, y, w, h, col, n = 5 }) {
  const lines = [];
  for (let i = 1; i < n; i++) {
    const yy = y + (h / n) * i;
    const wobble = (i % 2 === 0 ? 2 : -2);
    lines.push(<path key={i} d={`M${x + 3},${yy} Q${x + w / 2 + wobble},${yy + 3} ${x + w - 3},${yy}`} fill="none" stroke={INK} strokeWidth="0.55" opacity="0.7"/>);
  }
  return <g>{lines}</g>;
}

function Hatch({ x, y, w, h, spacing = 5, angle = 45 }) {
  const lines = [];
  const rad = angle * Math.PI / 180;
  const len = Math.sqrt(w * w + h * h);
  for (let i = -len; i < len * 2; i += spacing) {
    lines.push(<line key={i}
      x1={x + i} y1={y}
      x2={x + i + Math.cos(rad) * len} y2={y + Math.sin(rad) * len}
      stroke={INK} strokeWidth="0.35" opacity="0.25"/>);
  }
  return <g clipPath={`url(#hb-${x}-${y})`}>
    <defs><clipPath id={`hb-${x}-${y}`}><rect x={x} y={y} width={w} height={h}/></clipPath></defs>
    {lines}
  </g>;
}

// â”€â”€ Major Arcana art (Marseille woodcut style, colored fills) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MajorArt({ id, w, h }) {
  const pad = String(id).padStart(2, '0');
  const url = `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/m${pad}.jpg`;
  return <image href={url} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid meet"/>;
}

function CourtArt({ rank, suit, w, h }) {
  const suitPfx = { wands: 'w', cups: 'c', swords: 's', pentacles: 'p' }[suit] || 'w';
  const rankNum = { page: 11, knight: 12, queen: 13, king: 14 }[rank] || 11;
  const pad = String(rankNum).padStart(2, '0');
  const url = `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/${suitPfx}${pad}.jpg`;
  return <image href={url} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid meet"/>;
}

function PipArt({ count, suit, w, h }) {
  const suitPfx = { wands: 'w', cups: 'c', swords: 's', pentacles: 'p' }[suit] || 'w';
  const pad = String(count).padStart(2, '0');
  const url = `https://raw.githubusercontent.com/metabismuth/tarot-json/master/cards/${suitPfx}${pad}.jpg`;
  return <image href={url} x={0} y={0} width={w} height={h} preserveAspectRatio="xMidYMid meet"/>;
}

// â”€â”€ CardFace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RANK_TO_COUNT = { ace:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
const COURT_RANKS = ['page','knight','queen','king'];

function CardFace({ card, reversed, large = false, w: wProp, h: hProp }) {
  const w = wProp ?? (large ? 252 : 192);
  const h = hProp ?? (large ? 418 : 318);

  const isMajor = card.type === 'major';
  const isCourt = COURT_RANKS.includes(card.rank);
  const pipCount = RANK_TO_COUNT[card.rank];

  const topLabel = isMajor
    ? ROMAN[card.id] || 'â˜‰'
    : (RANK_LABEL[card.rank] || card.rank?.toUpperCase() || '');
  const suitLabel = !isMajor ? (card.suit?.toUpperCase() || '') : (card.element?.toUpperCase() || '');
  const cardName = card.name?.toUpperCase() || '';

  const fontSize = w < 120 ? 6 : large ? 10 : 8;

  return (
    <div className="relative mx-auto select-none"
      style={{
        width: w, height: h,
        background: PARCHMENT,
        transform: reversed ? 'rotate(180deg)' : 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
      }}>

      {/* Border */}
      <CardBorder w={w} h={h}/>

      {/* Top band */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between"
        style={{ top: 10, left: 10, right: 10 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: fontSize+1, color: INK, letterSpacing: '0.1em', fontWeight: 700 }}>
          {topLabel}
        </span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: fontSize-1, color: INK, letterSpacing: '0.08em', opacity: 0.7 }}>
          {suitLabel}
        </span>
      </div>

      <svg className="absolute left-0 right-0 pointer-events-none" style={{ top: 24, width: w, height: 1 }}>
        <line x1={10} y1={0} x2={w-10} y2={0} stroke={INK} strokeWidth="0.6" opacity="0.4"/>
      </svg>

      {/* Central illustration */}
      <svg className="absolute" style={{ top: 26, left: 0, width: w, height: h - 52 }}>
        {isMajor && <MajorArt id={card.id} w={w} h={h - 52}/>}
        {!isMajor && isCourt && <CourtArt rank={card.rank} suit={card.suit} w={w} h={h - 52}/>}
        {!isMajor && !isCourt && pipCount && <PipArt count={pipCount} suit={card.suit} w={w} h={h - 52}/>}
      </svg>

      {/* Bottom rule */}
      <svg className="absolute left-0 right-0 pointer-events-none" style={{ bottom: 20, width: w, height: 1 }}>
        <line x1={10} y1={0} x2={w-10} y2={0} stroke={INK} strokeWidth="0.6" opacity="0.4"/>
      </svg>

      {/* Card name */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
        style={{ bottom: 8 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: fontSize-1, color: INK, letterSpacing: '0.15em', textAlign: 'center', lineHeight: 1.1, fontWeight: 600 }}>
          {cardName}
        </span>
      </div>
    </div>
  );
}

// â”€â”€ Card Back â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CardBack({ small = false, w: wProp, h: hProp }) {
  const w = wProp ?? (small ? 90 : 192);
  const h = hProp ?? (small ? 135 : 318);
  return (
    <div className="relative mx-auto" style={{ width: w, height: h, background: PARCHMENT, boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}>
      <svg className="absolute inset-0" width={w} height={h}>
        <defs>
          <pattern id="diamond-back" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M8,1 L15,8 L8,15 L1,8 Z" fill="none" stroke={INK} strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect x={8} y={8} width={w-16} height={h-16} fill="url(#diamond-back)"/>
      </svg>
      <CardBorder w={w} h={h}/>
    </div>
  );
}

// â”€â”€ TarotOverlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function TarotOverlay({ onClose, history = {}, onRecord, onLogDivination, divinationLog = [], onShare }) {
  const [pull, setPull] = useState(() => getDailyCard());
  const [mode, setMode] = useState('daily');

  const todayKey = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (!history[todayKey]) {
      const daily = getDailyCard();
      onRecord && onRecord(todayKey, { card: daily.card.name, reversed: daily.reversed, symbol: daily.card.symbol });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reshuffle = () => {
    const idx = Math.floor(Math.random() * TAROT_DECK.length);
    setPull({ card: TAROT_DECK[idx], reversed: Math.random() < 0.33 });
  };

  const [browseCard, setBrowseCard] = useState(null);
  const [oracleQ, setOracleQ] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState(null);
  const drawOracle = () => {
    if (!oracleQ.trim()) return;
    const idx = Math.floor(Math.random() * TAROT_DECK.length);
    const result = { card: TAROT_DECK[idx], reversed: Math.random() < 0.4 };
    setOracleAnswer(result);
    onLogDivination && onLogDivination({ kind: 'oracle', question: oracleQ.trim(), answer: `${result.card.name}${result.reversed ? ' Â· reversed' : ''}` });
  };
  const resetOracle = () => { setOracleQ(''); setOracleAnswer(null); };

  const [spread, setSpread] = useState(null);
  const drawSpread = () => {
    const seen = new Set();
    const cards = [];
    while (cards.length < 3) {
      const idx = Math.floor(Math.random() * TAROT_DECK.length);
      if (seen.has(idx)) continue;
      seen.add(idx);
      cards.push({ card: TAROT_DECK[idx], reversed: Math.random() < 0.33 });
    }
    setSpread(cards);
  };

  const historyEntries = Object.entries(history)
    .map(([date, c]) => ({ date, ...c }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="animate-portal-in absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1A0A06 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }}/>

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#9E2A33] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20}/></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>THE DECK</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('history')} className={`text-[10px] uppercase tracking-wider ${mode === 'history' ? 'text-[#C9A961]' : 'text-[#9E2A33]'}`} style={F.ui} title="history"><Clock size={14}/></button>
            <button onClick={() => setMode(mode === 'oracle' ? 'daily' : 'oracle')} className={`text-[10px] uppercase tracking-wider ${mode === 'oracle' ? 'text-[#C9A961]' : 'text-[#9E2A33]'}`} style={F.ui}>oracle</button>
            <button onClick={() => setMode(mode === 'spread' ? 'daily' : 'spread')} className={`text-[10px] uppercase tracking-wider ${mode === 'spread' ? 'text-[#C9A961]' : 'text-[#9E2A33]'}`} style={F.ui}>spread</button>
            <button onClick={() => setMode(mode === 'browse' ? 'daily' : 'browse')} className="text-[#9E2A33] text-[10px] uppercase tracking-wider" style={F.ui}>{mode === 'browse' ? 'today' : 'browse'}</button>
          </div>
        </div>
      </div>

      {mode === 'daily' && (
        <div className="relative px-6 pt-8 pb-12">
          <div className="text-center mb-6">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.5em] mb-1" style={F.scriptureSC}>Â· today's pull Â·</div>
            <div className="text-[#9E2A33]/60 text-xs italic" style={F.scripture}>{pull.reversed ? 'drawn reversed' : 'drawn upright'}</div>
          </div>
          <CardFace card={pull.card} reversed={pull.reversed} large/>
          <div className="mt-8 max-w-sm mx-auto text-center space-y-3">
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{pull.card.name}{pull.reversed && ' Â· reversed'}</h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>"{pull.reversed ? pull.card.reversed : pull.card.upright}"</p>
            {pull.card.element && <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>Â· {pull.card.element} Â·</div>}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            <button onClick={reshuffle} className="flex items-center gap-2 px-5 py-2.5 border border-[#A89968]/40 text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.25em]" style={F.ui}>
              <Shuffle size={13}/> pull another
            </button>
            {onShare && (
              <button onClick={() => onShare(pull)} className="flex items-center gap-2 px-5 py-2.5 border border-[#A89968]/40 text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.25em]" style={F.ui}>
                <Send size={13}/> share
              </button>
            )}
          </div>
          <p className="mt-10 text-center text-[#9E2A33]/40 text-[10px] italic" style={F.scripture}>Â· the deck remembers Â·</p>
        </div>
      )}

      {mode === 'history' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>Â· the deck remembers Â·</div>
            <p className="text-[#9E2A33]/60 text-xs italic mt-1" style={F.scripture}>{historyEntries.length} days recorded</p>
          </div>
          {divinationLog.length > 0 && (
            <div className="mb-6 max-w-sm mx-auto">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]/60 mb-2" style={F.scriptureSC}>Â· questions asked Â·</div>
              <div className="space-y-1">
                {divinationLog.slice(0, 8).map(d => (
                  <div key={d.id} className="px-3 py-2 border border-[#A89968]/15 bg-[#0A0204]/30">
                    <span className="text-[9px] uppercase tracking-wider text-[#9E2A33]/60" style={F.scriptureSC}>{d.kind === 'pendulum' ? 'â—¯ pendulum' : 'âœ¦ oracle'}</span>
                    <p className="text-[#A8A29E] text-xs italic" style={F.scripture}>"{d.question}"</p>
                    <p className="text-[#C9A961] text-xs mt-0.5" style={F.scripture}>â†’ {d.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {historyEntries.length === 0 && divinationLog.length === 0 ? (
            <div className="text-center py-12 text-[#9E2A33]/40 text-sm italic" style={F.scripture}>Â· no pulls yet Â· today is your first Â·</div>
          ) : historyEntries.length > 0 && (
            <div className="space-y-1 max-w-sm mx-auto">
              {historyEntries.map(entry => (
                <div key={entry.date} className="flex items-center gap-3 px-3 py-2 border border-[#A89968]/20 bg-[#0A0204]/40">
                  <div className="w-10 text-[10px] text-[#9E2A33]" style={F.mono}>{entry.date.slice(5).replace('-', '/')}</div>
                  <div className="w-7 h-10 border border-[#A89968]/40 flex items-center justify-center"
                    style={{ background: PARCHMENT, transform: entry.reversed ? 'rotate(180deg)' : 'none' }}>
                    <span className="text-base" style={{ color: INK }}>{entry.symbol || 'âœ¦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.scripture}>{entry.card}</div>
                    <div className="text-[10px] text-[#9E2A33]/60" style={F.scriptureSC}>{entry.reversed ? 'reversed' : 'upright'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'oracle' && (
        <div className="relative px-6 pt-8 pb-12">
          <div className="text-center mb-6">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>Â· ask the deck Â·</div>
            <p className="text-[#9E2A33]/60 text-xs italic mt-1" style={F.scripture}>one question. one card. trust what falls.</p>
          </div>
          {!oracleAnswer ? (
            <div className="max-w-sm mx-auto">
              <textarea value={oracleQ} onChange={e => setOracleQ(e.target.value.slice(0, 140))}
                placeholder="what should I..." rows={2}
                className="w-full bg-[#0A0204] border border-[#A89968]/30 focus:border-[#C9A961] outline-none p-3 text-[#F5F1E8] text-base italic resize-none" style={F.scripture}/>
              <button onClick={drawOracle} disabled={!oracleQ.trim()}
                className="mt-3 w-full py-3 border border-[#A89968]/40 text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961] disabled:opacity-40 text-xs uppercase tracking-[0.3em]" style={F.ui}>
                draw a card
              </button>
            </div>
          ) : (
            <div className="max-w-sm mx-auto text-center space-y-4">
              <p className="text-[#9E2A33]/60 text-xs italic" style={F.scripture}>"{oracleQ}"</p>
              <CardFace card={oracleAnswer.card} reversed={oracleAnswer.reversed}/>
              <h2 className="text-[#F5F1E8] text-xl" style={F.brand}>{oracleAnswer.card.name}{oracleAnswer.reversed && ' Â· reversed'}</h2>
              <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>"{oracleAnswer.reversed ? oracleAnswer.card.reversed : oracleAnswer.card.upright}"</p>
              <button onClick={resetOracle} className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#9E2A33] hover:border-[#C9A961]" style={F.ui}>ask again</button>
            </div>
          )}
        </div>
      )}

      {mode === 'spread' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>Â· past Â· present Â· future Â·</div>
            <p className="text-[#9E2A33]/60 text-xs italic mt-1" style={F.scripture}>three cards. one breath.</p>
          </div>
          {!spread ? (
            <div className="flex flex-col items-center pt-12">
              <div className="flex gap-3 mb-8">
                {[0,1,2].map(i => <CardBack key={i} small/>)}
              </div>
              <button onClick={drawSpread} className="px-5 py-2.5 border border-[#A89968]/40 text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.3em]" style={F.ui}>
                draw the spread
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {spread.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-[9px] uppercase tracking-[0.3em] text-[#9E2A33]/60 mb-1" style={F.scriptureSC}>Â· {['past','present','future'][i]} Â·</div>
                    <CardFace card={s.card} reversed={s.reversed} w={90} h={150}/>
                  </div>
                ))}
              </div>
              <div className="space-y-3 max-w-sm mx-auto">
                {spread.map((s, i) => (
                  <div key={i} className="border border-[#A89968]/20 bg-[#0A0204]/40 p-3">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]" style={F.scriptureSC}>Â· {['past','present','future'][i]} Â· {s.card.name}{s.reversed ? ' Â· reversed' : ''} Â·</div>
                    <p className="text-[#A8A29E] text-xs italic mt-1.5 leading-relaxed" style={F.scripture}>"{s.reversed ? s.card.reversed : s.card.upright}"</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-2">
                <button onClick={drawSpread} className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#9E2A33] hover:border-[#C9A961]" style={F.ui}>draw again</button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'browse' && !browseCard && (
        <div className="relative px-4 pt-6 pb-12 grid grid-cols-3 gap-3">
          {TAROT_DECK.map(card => (
            <button key={card.id} onClick={() => setBrowseCard(card)}
              className="hover:opacity-80 transition-opacity">
              <CardFace card={card} reversed={false} w={96} h={159}/>
            </button>
          ))}
        </div>
      )}

      {mode === 'browse' && browseCard && (
        <div className="relative px-6 pt-6 pb-12">
          <button onClick={() => setBrowseCard(null)} className="text-[10px] uppercase tracking-wider text-[#9E2A33] hover:text-[#C9A961] mb-4" style={F.ui}>â† back to deck</button>
          <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>
              Â· {browseCard.type === 'major' ? `arcanum ${String(browseCard.id).padStart(2,'0')}` : `${browseCard.suit} Â· ${browseCard.rank || ''}`} Â·
            </div>
            <CardFace card={browseCard} large/>
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{browseCard.name}</h2>
            {browseCard.element && <div className="text-[#9E2A33]/70 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>Â· {browseCard.element} Â·</div>}
            <div className="text-left space-y-3 pt-2">
              <div className="border border-[#C9A961]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] mb-1" style={F.scriptureSC}>Â· upright Â·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.scripture}>"{browseCard.upright}"</p>
              </div>
              <div className="border border-[#8B0000]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] mb-1" style={F.scriptureSC}>Â· reversed Â·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.scripture}>"{browseCard.reversed}"</p>
              </div>
            </div>
            <button onClick={() => { setPull({ card: browseCard, reversed: false }); setBrowseCard(null); setMode('daily'); }}
              className="mt-2 px-4 py-2 text-[10px] uppercase tracking-wider border border-[#A89968]/40 text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961]" style={F.ui}>
              draw this card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
