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
const SUIT_GLYPH = { wands:'ðŒŠ', cups:'â¬¡', swords:'âœ¦', pentacles:'âœ¿' };
const SUIT_COLOR = { wands: YEL, cups: BLUE, swords: RED, pentacles: YEL };

const PIP_LAYOUTS = {
  1:  [[50,50]],
  2:  [[50,25],[50,75]],
  3:  [[50,18],[50,50],[50,82]],
  4:  [[28,25],[72,25],[28,75],[72,75]],
  5:  [[28,18],[72,18],[50,50],[28,82],[72,82]],
  6:  [[28,18],[72,18],[28,50],[72,50],[28,82],[72,82]],
  7:  [[28,15],[72,15],[50,32],[28,50],[72,50],[28,75],[72,75]],
  8:  [[28,12],[72,12],[28,32],[72,32],[28,55],[72,55],[28,78],[72,78]],
  9:  [[28,12],[72,12],[28,32],[72,32],[50,50],[28,68],[72,68],[28,88],[72,88]],
  10: [[28,10],[72,10],[28,28],[72,28],[28,46],[72,46],[28,64],[72,64],[28,82],[72,82]],
};

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
  const cx = w / 2, cy = h / 2;
  const s = n => n * w / 192;
  const sw = s(1.4);
  const arts = {
    0: (
      <g>
        <line x1={s(10)} y1={cy+s(88)} x2={w-s(10)} y2={cy+s(88)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* dog */}
        <path d={`M ${cx-s(36)},${cy+s(50)} C ${cx-s(48)},${cy+s(46)} ${cx-s(52)},${cy+s(34)} ${cx-s(44)},${cy+s(24)} C ${cx-s(36)},${cy+s(16)} ${cx-s(22)},${cy+s(18)} ${cx-s(16)},${cy+s(26)} L ${cx-s(10)},${cy+s(20)} C ${cx-s(6)},${cy+s(12)} ${cx},${cy+s(8)} ${cx+s(4)},${cy+s(12)} L ${cx+s(4)},${cy+s(44)} C ${cx-s(6)},${cy+s(56)} ${cx-s(22)},${cy+s(58)} ${cx-s(36)},${cy+s(50)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(4)},${cy+s(10)} C ${cx+s(10)},${cy+s(4)} ${cx+s(12)},${cy-s(4)} ${cx+s(6)},${cy-s(8)} C ${cx},${cy-s(12)} ${cx-s(10)},${cy-s(8)} ${cx-s(12)},${cy-s(2)} C ${cx-s(14)},${cy+s(6)} ${cx-s(8)},${cy+s(12)} ${cx+s(4)},${cy+s(10)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(12)},${cy-s(2)} C ${cx-s(18)},${cy-s(4)} ${cx-s(20)},${cy+s(2)} ${cx-s(18)},${cy+s(8)}`} fill="none" stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(3)} cy={cy-s(4)} r={s(1.5)} fill={INK}/>
        {[cx-s(28),cx-s(16),cx-s(4)].map((x,i)=><line key={i} x1={x} y1={cy+s(52)} x2={x-s(3)} y2={cy+s(78)} stroke={INK} strokeWidth={s(3.5)} strokeLinecap="round"/>)}
        {/* legs */}
        <path d={`M ${cx+s(18)},${cy+s(16)} C ${cx+s(22)},${cy+s(32)} ${cx+s(26)},${cy+s(52)} ${cx+s(22)},${cy+s(66)} L ${cx+s(30)},${cy+s(66)} C ${cx+s(36)},${cy+s(76)} ${cx+s(30)},${cy+s(86)} ${cx+s(22)},${cy+s(84)} L ${cx+s(14)},${cy+s(84)} L ${cx+s(12)},${cy+s(66)} L ${cx+s(10)},${cy+s(16)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(8)},${cy+s(16)} L ${cx+s(4)},${cy+s(56)} L ${cx+s(4)},${cy+s(68)} C ${cx},${cy+s(76)} ${cx+s(2)},${cy+s(86)} ${cx+s(10)},${cy+s(86)} L ${cx+s(16)},${cy+s(86)} C ${cx+s(22)},${cy+s(84)} ${cx+s(22)},${cy+s(74)} ${cx+s(16)},${cy+s(68)} L ${cx+s(16)},${cy+s(60)} L ${cx+s(18)},${cy+s(16)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* tunic */}
        <path d={`M ${cx+s(6)},${cy-s(24)} C ${cx+s(2)},${cy-s(16)} ${cx},${cy-s(4)} ${cx},${cy+s(6)} L ${cx},${cy+s(22)} L ${cx+s(18)},${cy+s(22)} L ${cx+s(18)},${cy+s(6)} C ${cx+s(20)},${cy-s(6)} ${cx+s(16)},${cy-s(18)} ${cx+s(12)},${cy-s(24)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx},${cy-s(24)} C ${cx-s(4)},${cy-s(16)} ${cx-s(6)},${cy-s(4)} ${cx-s(6)},${cy+s(8)} L ${cx-s(6)},${cy+s(22)} L ${cx},${cy+s(22)} L ${cx},${cy-s(24)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {[-s(6),s(2),s(10)].map((x,i)=><path key={i} d={`M ${cx+x},${cy+s(22)} L ${cx+x+s(4)},${cy+s(34)} L ${cx+x+s(8)},${cy+s(22)}`} fill={i%2?RED:YEL} stroke={INK} strokeWidth={s(0.8)}/>)}
        {/* right arm to staff */}
        <path d={`M ${cx+s(14)},${cy-s(16)} C ${cx+s(24)},${cy-s(20)} ${cx+s(38)},${cy-s(28)} ${cx+s(48)},${cy-s(46)} C ${cx+s(44)},${cy-s(52)} ${cx+s(38)},${cy-s(48)} ${cx+s(28)},${cy-s(34)} C ${cx+s(20)},${cy-s(24)} ${cx+s(14)},${cy-s(18)} ${cx+s(14)},${cy-s(16)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left arm */}
        <path d={`M ${cx},${cy-s(14)} C ${cx-s(8)},${cy-s(8)} ${cx-s(18)},${cy-s(2)} ${cx-s(26)},${cy+s(2)} C ${cx-s(22)},${cy+s(8)} ${cx-s(16)},${cy+s(8)} ${cx-s(8)},${cy+s(4)} C ${cx-s(2)},${cy-s(2)} ${cx},${cy-s(10)} ${cx},${cy-s(14)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(48)} y1={cy-s(50)} x2={cx+s(22)} y2={cy+s(84)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        {/* bundle */}
        <path d={`M ${cx+s(44)},${cy-s(54)} C ${cx+s(38)},${cy-s(68)} ${cx+s(56)},${cy-s(78)} ${cx+s(64)},${cy-s(66)} C ${cx+s(68)},${cy-s(56)} ${cx+s(58)},${cy-s(48)} ${cx+s(46)},${cy-s(48)} Z`} fill={GRN} stroke={INK} strokeWidth={sw}/>
        {/* head */}
        <path d={`M ${cx+s(14)},${cy-s(40)} C ${cx+s(18)},${cy-s(50)} ${cx+s(16)},${cy-s(66)} ${cx+s(6)},${cy-s(70)} C ${cx-s(4)},${cy-s(74)} ${cx-s(12)},${cy-s(68)} ${cx-s(12)},${cy-s(58)} C ${cx-s(12)},${cy-s(46)} ${cx-s(4)},${cy-s(38)} ${cx+s(4)},${cy-s(36)} C ${cx+s(8)},${cy-s(36)} ${cx+s(12)},${cy-s(37)} ${cx+s(14)},${cy-s(40)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* jester cap */}
        <path d={`M ${cx-s(12)},${cy-s(60)} C ${cx-s(18)},${cy-s(72)} ${cx-s(12)},${cy-s(88)} ${cx-s(4)},${cy-s(94)} C ${cx},${cy-s(86)} ${cx+s(2)},${cy-s(76)} ${cx+s(2)},${cy-s(68)} C ${cx+s(4)},${cy-s(78)} ${cx+s(8)},${cy-s(88)} ${cx+s(12)},${cy-s(96)} C ${cx+s(16)},${cy-s(86)} ${cx+s(16)},${cy-s(74)} ${cx+s(16)},${cy-s(66)} L ${cx+s(18)},${cy-s(58)} ${cx+s(18)},${cy-s(54)} ${cx-s(12)},${cy-s(54)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(2)},${cy-s(56)} C ${cx+s(4)},${cy-s(64)} ${cx+s(4)},${cy-s(74)} ${cx+s(2)},${cy-s(82)} C ${cx},${cy-s(74)} ${cx-s(2)},${cy-s(66)} ${cx+s(2)},${cy-s(56)} Z`} fill={YEL}/>
        {[{x:cx-s(4),y:cy-s(94)},{x:cx+s(12),y:cy-s(97)}].map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={s(3.5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>)}
        <circle cx={cx+s(3)} cy={cy-s(58)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(9)} cy={cy-s(60)} r={s(2)} fill={INK}/>
        <path d={`M ${cx+s(2)},${cy-s(50)} C ${cx+s(5)},${cy-s(47)} ${cx+s(9)},${cy-s(47)} ${cx+s(11)},${cy-s(50)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(6)},${cy-s(62)} C ${cx+s(5)},${cy-s(58)} ${cx+s(7)},${cy-s(56)} ${cx+s(8)},${cy-s(58)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
      </g>
    ),
    1: (
      <g>
        {/* Le Bateleur Â· The Magician */}
        {/* table */}
        <path d={`M ${cx-s(30)},${cy+s(16)} L ${cx+s(30)},${cy+s(16)} L ${cx+s(30)},${cy+s(20)} L ${cx+s(26)},${cy+s(20)} L ${cx+s(26)},${cy+s(78)} L ${cx-s(26)},${cy+s(78)} L ${cx-s(26)},${cy+s(20)} L ${cx-s(30)},${cy+s(20)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* implements on table */}
        <path d={`M ${cx-s(20)},${cy+s(14)} L ${cx-s(16)},${cy+s(18)} L ${cx-s(12)},${cy+s(14)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(6)},${cy+s(10)} L ${cx-s(4)},${cy+s(16)} L ${cx-s(2)},${cy+s(10)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx+s(8)} cy={cy+s(14)} r={s(4)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(16)},${cy+s(8)} L ${cx+s(18)},${cy+s(18)}`} stroke={INK} strokeWidth={s(2)} strokeLinecap="round"/>
        {/* body - blue tunic */}
        <path d={`M ${cx-s(16)},${cy-s(24)} C ${cx-s(20)},${cy-s(12)} ${cx-s(22)},${cy} ${cx-s(20)},${cy+s(18)} L ${cx+s(20)},${cy+s(18)} C ${cx+s(22)},${cy} ${cx+s(20)},${cy-s(12)} ${cx+s(16)},${cy-s(24)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* belt */}
        <path d={`M ${cx-s(20)},${cy-s(4)} L ${cx+s(20)},${cy-s(4)} L ${cx+s(20)},${cy+s(2)} L ${cx-s(20)},${cy+s(2)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* skirt/lower */}
        <path d={`M ${cx-s(20)},${cy+s(2)} C ${cx-s(24)},${cy+s(8)} ${cx-s(26)},${cy+s(14)} ${cx-s(24)},${cy+s(20)} L ${cx+s(24)},${cy+s(20)} C ${cx+s(26)},${cy+s(14)} ${cx+s(24)},${cy+s(8)} ${cx+s(20)},${cy+s(2)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* right arm raised with wand */}
        <path d={`M ${cx+s(16)},${cy-s(18)} C ${cx+s(22)},${cy-s(24)} ${cx+s(28)},${cy-s(34)} ${cx+s(30)},${cy-s(50)} C ${cx+s(26)},${cy-s(54)} ${cx+s(22)},${cy-s(50)} ${cx+s(20)},${cy-s(40)} C ${cx+s(18)},${cy-s(28)} ${cx+s(16)},${cy-s(20)} ${cx+s(16)},${cy-s(18)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(30)} y1={cy-s(52)} x2={cx+s(30)} y2={cy-s(90)} stroke={INK} strokeWidth={s(2)} strokeLinecap="round"/>
        {/* left arm pointing down */}
        <path d={`M ${cx-s(16)},${cy-s(18)} C ${cx-s(22)},${cy-s(12)} ${cx-s(28)},${cy-s(2)} ${cx-s(32)},${cy+s(8)} C ${cx-s(28)},${cy+s(14)} ${cx-s(22)},${cy+s(12)} ${cx-s(18)},${cy+s(4)} C ${cx-s(16)},${cy-s(6)} ${cx-s(16)},${cy-s(14)} ${cx-s(16)},${cy-s(18)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(44)} C ${cx-s(14)},${cy-s(44)} ${cx-s(16)},${cy-s(34)} ${cx-s(16)},${cy-s(26)} C ${cx-s(16)},${cy-s(18)} ${cx-s(10)},${cy-s(14)} ${cx},${cy-s(14)} C ${cx+s(10)},${cy-s(14)} ${cx+s(16)},${cy-s(18)} ${cx+s(16)},${cy-s(26)} C ${cx+s(16)},${cy-s(34)} ${cx+s(14)},${cy-s(44)} ${cx},${cy-s(44)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* wide brimmed hat */}
        <path d={`M ${cx-s(24)},${cy-s(44)} L ${cx+s(24)},${cy-s(44)} L ${cx+s(20)},${cy-s(48)} L ${cx+s(14)},${cy-s(48)} L ${cx+s(14)},${cy-s(66)} C ${cx+s(14)},${cy-s(70)} ${cx+s(10)},${cy-s(72)} ${cx},${cy-s(72)} C ${cx-s(10)},${cy-s(72)} ${cx-s(14)},${cy-s(70)} ${cx-s(14)},${cy-s(66)} L ${cx-s(14)},${cy-s(48)} L ${cx-s(20)},${cy-s(48)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(8)} cy={cy-s(32)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(32)} r={s(2)} fill={INK}/>
        <path d={`M ${cx-s(6)},${cy-s(22)} C ${cx-s(2)},${cy-s(19)} ${cx+s(2)},${cy-s(19)} ${cx+s(6)},${cy-s(22)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(2)},${cy-s(34)} C ${cx-s(3)},${cy-s(30)} ${cx-s(1)},${cy-s(28)} ${cx},${cy-s(30)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
      </g>
    ),
    2: (
      <g>
        {/* La Papesse Â· The High Priestess */}
        {/* pillars */}
        <path d={`M ${cx-s(52)},${cy-s(100)} L ${cx-s(44)},${cy-s(100)} L ${cx-s(44)},${cy+s(88)} L ${cx-s(52)},${cy+s(88)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(44)},${cy-s(100)} L ${cx+s(52)},${cy-s(100)} L ${cx+s(52)},${cy+s(88)} L ${cx+s(44)},${cy+s(88)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* throne back */}
        <path d={`M ${cx-s(28)},${cy-s(30)} L ${cx-s(28)},${cy+s(88)} L ${cx+s(28)},${cy+s(88)} L ${cx+s(28)},${cy-s(30)} C ${cx+s(20)},${cy-s(38)} ${cx-s(20)},${cy-s(38)} ${cx-s(28)},${cy-s(30)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* blue outer robe */}
        <path d={`M ${cx-s(22)},${cy-s(28)} C ${cx-s(26)},${cy-s(16)} ${cx-s(28)},${cy+s(4)} ${cx-s(26)},${cy+s(30)} C ${cx-s(22)},${cy+s(54)} ${cx-s(14)},${cy+s(72)} ${cx-s(10)},${cy+s(88)} L ${cx+s(10)},${cy+s(88)} C ${cx+s(14)},${cy+s(72)} ${cx+s(22)},${cy+s(54)} ${cx+s(26)},${cy+s(30)} C ${cx+s(28)},${cy+s(4)} ${cx+s(26)},${cy-s(16)} ${cx+s(22)},${cy-s(28)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* white wimple/chest */}
        <path d={`M ${cx-s(12)},${cy-s(28)} C ${cx-s(14)},${cy-s(18)} ${cx-s(12)},${cy-s(6)} ${cx-s(10)},${cy+s(4)} L ${cx+s(10)},${cy+s(4)} C ${cx+s(12)},${cy-s(6)} ${cx+s(14)},${cy-s(18)} ${cx+s(12)},${cy-s(28)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* book on lap */}
        <path d={`M ${cx-s(16)},${cy+s(8)} L ${cx+s(16)},${cy+s(8)} L ${cx+s(18)},${cy+s(22)} L ${cx-s(18)},${cy+s(22)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        <line x1={cx} y1={cy+s(8)} x2={cx} y2={cy+s(22)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(44)} C ${cx-s(12)},${cy-s(44)} ${cx-s(14)},${cy-s(34)} ${cx-s(14)},${cy-s(26)} C ${cx-s(14)},${cy-s(18)} ${cx-s(8)},${cy-s(14)} ${cx},${cy-s(14)} C ${cx+s(8)},${cy-s(14)} ${cx+s(14)},${cy-s(18)} ${cx+s(14)},${cy-s(26)} C ${cx+s(14)},${cy-s(34)} ${cx+s(12)},${cy-s(44)} ${cx},${cy-s(44)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* veil */}
        <path d={`M ${cx-s(16)},${cy-s(40)} C ${cx-s(20)},${cy-s(30)} ${cx-s(18)},${cy-s(14)} ${cx-s(14)},${cy-s(6)} L ${cx-s(10)},${cy+s(4)} C ${cx-s(14)},${cy-s(2)} ${cx-s(18)},${cy-s(12)} ${cx-s(20)},${cy-s(26)} C ${cx-s(22)},${cy-s(34)} ${cx-s(20)},${cy-s(42)} ${cx-s(16)},${cy-s(40)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(16)},${cy-s(40)} C ${cx+s(20)},${cy-s(30)} ${cx+s(18)},${cy-s(14)} ${cx+s(14)},${cy-s(6)} L ${cx+s(10)},${cy+s(4)} C ${cx+s(14)},${cy-s(2)} ${cx+s(18)},${cy-s(12)} ${cx+s(20)},${cy-s(26)} C ${cx+s(22)},${cy-s(34)} ${cx+s(20)},${cy-s(42)} ${cx+s(16)},${cy-s(40)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* triple tiara */}
        <path d={`M ${cx-s(14)},${cy-s(44)} L ${cx+s(14)},${cy-s(44)} L ${cx+s(14)},${cy-s(48)} L ${cx+s(10)},${cy-s(52)} L ${cx+s(10)},${cy-s(56)} L ${cx+s(6)},${cy-s(60)} L ${cx+s(6)},${cy-s(64)} L ${cx+s(2)},${cy-s(68)} L ${cx-s(2)},${cy-s(68)} L ${cx-s(6)},${cy-s(64)} L ${cx-s(6)},${cy-s(60)} L ${cx-s(10)},${cy-s(56)} L ${cx-s(10)},${cy-s(52)} L ${cx-s(14)},${cy-s(48)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(8)} cy={cy-s(29)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(29)} r={s(1.5)} fill={INK}/>
        <path d={`M ${cx-s(5)},${cy-s(22)} C ${cx-s(1)},${cy-s(19)} ${cx+s(1)},${cy-s(19)} ${cx+s(5)},${cy-s(22)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    3: (
      <g>
        {/* L'ImpÃ©ratrice Â· The Empress */}
        {/* throne */}
        <path d={`M ${cx-s(30)},${cy-s(18)} L ${cx-s(30)},${cy+s(84)} L ${cx+s(30)},${cy+s(84)} L ${cx+s(30)},${cy-s(18)} C ${cx+s(22)},${cy-s(26)} ${cx-s(22)},${cy-s(26)} ${cx-s(30)},${cy-s(18)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* red mantle */}
        <path d={`M ${cx-s(24)},${cy-s(24)} C ${cx-s(28)},${cy-s(8)} ${cx-s(30)},${cy+s(10)} ${cx-s(28)},${cy+s(36)} C ${cx-s(22)},${cy+s(58)} ${cx-s(14)},${cy+s(74)} ${cx-s(10)},${cy+s(84)} L ${cx+s(10)},${cy+s(84)} C ${cx+s(14)},${cy+s(74)} ${cx+s(22)},${cy+s(58)} ${cx+s(28)},${cy+s(36)} C ${cx+s(30)},${cy+s(10)} ${cx+s(28)},${cy-s(8)} ${cx+s(24)},${cy-s(24)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* blue dress */}
        <path d={`M ${cx-s(14)},${cy-s(20)} C ${cx-s(16)},${cy-s(8)} ${cx-s(16)},${cy+s(8)} ${cx-s(14)},${cy+s(26)} L ${cx-s(10)},${cy+s(84)} L ${cx+s(10)},${cy+s(84)} L ${cx+s(14)},${cy+s(26)} C ${cx+s(16)},${cy+s(8)} ${cx+s(16)},${cy-s(8)} ${cx+s(14)},${cy-s(20)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* right arm - scepter */}
        <path d={`M ${cx+s(18)},${cy-s(18)} C ${cx+s(24)},${cy-s(22)} ${cx+s(30)},${cy-s(28)} ${cx+s(34)},${cy-s(42)} C ${cx+s(30)},${cy-s(46)} ${cx+s(26)},${cy-s(44)} ${cx+s(22)},${cy-s(32)} C ${cx+s(20)},${cy-s(24)} ${cx+s(18)},${cy-s(20)} ${cx+s(18)},${cy-s(18)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(34)} y1={cy-s(44)} x2={cx+s(34)} y2={cy-s(90)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        <circle cx={cx+s(34)} cy={cy-s(90)} r={s(5)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* left arm - shield */}
        <path d={`M ${cx-s(18)},${cy-s(18)} C ${cx-s(24)},${cy-s(12)} ${cx-s(30)},${cy-s(4)} ${cx-s(32)},${cy+s(8)} C ${cx-s(28)},${cy+s(14)} ${cx-s(22)},${cy+s(12)} ${cx-s(18)},${cy+s(2)} C ${cx-s(16)},${cy-s(8)} ${cx-s(18)},${cy-s(16)} ${cx-s(18)},${cy-s(18)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* shield */}
        <path d={`M ${cx-s(46)},${cy-s(6)} C ${cx-s(54)},${cy+s(6)} ${cx-s(52)},${cy+s(20)} ${cx-s(46)},${cy+s(30)} C ${cx-s(40)},${cy+s(40)} ${cx-s(36)},${cy+s(38)} ${cx-s(36)},${cy+s(28)} L ${cx-s(36)},${cy-s(6)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(42)},${cy+s(8)} L ${cx-s(48)},${cy+s(20)} L ${cx-s(42)},${cy+s(16)} L ${cx-s(36)},${cy+s(20)} Z`} fill={INK}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(44)} C ${cx-s(13)},${cy-s(44)} ${cx-s(15)},${cy-s(34)} ${cx-s(15)},${cy-s(26)} C ${cx-s(15)},${cy-s(18)} ${cx-s(9)},${cy-s(14)} ${cx},${cy-s(14)} C ${cx+s(9)},${cy-s(14)} ${cx+s(15)},${cy-s(18)} ${cx+s(15)},${cy-s(26)} C ${cx+s(15)},${cy-s(34)} ${cx+s(13)},${cy-s(44)} ${cx},${cy-s(44)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* crown */}
        <path d={`M ${cx-s(16)},${cy-s(44)} L ${cx-s(12)},${cy-s(58)} L ${cx-s(6)},${cy-s(50)} L ${cx},${cy-s(62)} L ${cx+s(6)},${cy-s(50)} L ${cx+s(12)},${cy-s(58)} L ${cx+s(16)},${cy-s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {[-s(8),s(4)].map((x,i)=><circle key={i} cx={cx+x} cy={cy-s(48)} r={s(2.5)} fill={RED}/>)}
        <circle cx={cx-s(8)} cy={cy-s(29)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(29)} r={s(2)} fill={INK}/>
        <path d={`M ${cx-s(5)},${cy-s(21)} C ${cx-s(1)},${cy-s(18)} ${cx+s(1)},${cy-s(18)} ${cx+s(5)},${cy-s(21)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    4: (
      <g>
        {/* L'Empereur Â· The Emperor */}
        {/* throne */}
        <path d={`M ${cx-s(36)},${cy-s(22)} L ${cx-s(36)},${cy+s(88)} L ${cx+s(36)},${cy+s(88)} L ${cx+s(36)},${cy-s(22)} C ${cx+s(26)},${cy-s(30)} ${cx-s(26)},${cy-s(30)} ${cx-s(36)},${cy-s(22)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* red robe body */}
        <path d={`M ${cx-s(22)},${cy-s(22)} C ${cx-s(26)},${cy-s(8)} ${cx-s(28)},${cy+s(8)} ${cx-s(26)},${cy+s(30)} C ${cx-s(20)},${cy+s(54)} ${cx-s(12)},${cy+s(70)} ${cx-s(8)},${cy+s(84)} L ${cx+s(8)},${cy+s(84)} C ${cx+s(12)},${cy+s(70)} ${cx+s(20)},${cy+s(54)} ${cx+s(26)},${cy+s(30)} C ${cx+s(28)},${cy+s(8)} ${cx+s(26)},${cy-s(8)} ${cx+s(22)},${cy-s(22)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* blue chest armor */}
        <path d={`M ${cx-s(12)},${cy-s(22)} L ${cx-s(14)},${cy+s(4)} L ${cx+s(14)},${cy+s(4)} L ${cx+s(12)},${cy-s(22)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* left arm crossed over - scepter */}
        <path d={`M ${cx-s(12)},${cy-s(12)} C ${cx-s(4)},${cy-s(14)} ${cx+s(6)},${cy-s(14)} ${cx+s(16)},${cy-s(12)} C ${cx+s(16)},${cy-s(6)} ${cx+s(10)},${cy-s(2)} ${cx},${cy-s(2)} C ${cx-s(10)},${cy-s(2)} ${cx-s(16)},${cy-s(6)} ${cx-s(12)},${cy-s(12)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* scepter */}
        <line x1={cx-s(20)} y1={cy-s(10)} x2={cx-s(42)} y2={cy-s(56)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        <path d={`M ${cx-s(44)},${cy-s(58)} C ${cx-s(50)},${cy-s(64)} ${cx-s(48)},${cy-s(72)} ${cx-s(42)},${cy-s(72)} C ${cx-s(36)},${cy-s(72)} ${cx-s(34)},${cy-s(64)} ${cx-s(40)},${cy-s(58)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* orb in right hand */}
        <path d={`M ${cx+s(12)},${cy-s(10)} C ${cx+s(20)},${cy-s(14)} ${cx+s(28)},${cy-s(12)} ${cx+s(32)},${cy-s(6)} C ${cx+s(28)},${cy+s(2)} ${cx+s(20)},${cy+s(4)} ${cx+s(12)},${cy} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx+s(38)} cy={cy-s(2)} r={s(10)} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(38)} y1={cy-s(12)} x2={cx+s(38)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(28)} y1={cy-s(2)} x2={cx+s(48)} y2={cy-s(2)} stroke={INK} strokeWidth={s(1)}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(46)} C ${cx-s(13)},${cy-s(46)} ${cx-s(15)},${cy-s(36)} ${cx-s(15)},${cy-s(28)} C ${cx-s(15)},${cy-s(20)} ${cx-s(9)},${cy-s(16)} ${cx},${cy-s(16)} C ${cx+s(9)},${cy-s(16)} ${cx+s(15)},${cy-s(20)} ${cx+s(15)},${cy-s(28)} C ${cx+s(15)},${cy-s(36)} ${cx+s(13)},${cy-s(46)} ${cx},${cy-s(46)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* beard */}
        <path d={`M ${cx-s(12)},${cy-s(24)} C ${cx-s(16)},${cy-s(14)} ${cx-s(14)},${cy-s(4)} ${cx-s(8)},${cy-s(2)} C ${cx-s(2)},${cy} ${cx+s(4)},${cy} ${cx+s(10)},${cy-s(4)} C ${cx+s(14)},${cy-s(10)} ${cx+s(14)},${cy-s(20)} ${cx+s(12)},${cy-s(26)} C ${cx+s(6)},${cy-s(22)} ${cx-s(4)},${cy-s(22)} ${cx-s(12)},${cy-s(24)} Z`} fill={INK}/>
        {/* crown */}
        <path d={`M ${cx-s(16)},${cy-s(46)} L ${cx-s(12)},${cy-s(60)} L ${cx-s(6)},${cy-s(52)} L ${cx},${cy-s(64)} L ${cx+s(6)},${cy-s(52)} L ${cx+s(12)},${cy-s(60)} L ${cx+s(16)},${cy-s(46)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(9)} cy={cy-s(35)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(9)} cy={cy-s(35)} r={s(2)} fill={INK}/>
      </g>
    ),
    5: (
      <g>
        {/* Le Pape Â· The Hierophant */}
        {/* pillars */}
        {[-s(46),-s(38),s(38),s(46)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(100)} L ${cx+x+(i<2?s(8):s(8))},${cy-s(100)} L ${cx+x+(i<2?s(8):s(8))},${cy+s(88)} L ${cx+x},${cy+s(88)} Z`} fill={i%2===0?YEL:PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>)}
        {/* throne */}
        <path d={`M ${cx-s(30)},${cy-s(26)} L ${cx-s(30)},${cy+s(88)} L ${cx+s(30)},${cy+s(88)} L ${cx+s(30)},${cy-s(26)} C ${cx+s(20)},${cy-s(34)} ${cx-s(20)},${cy-s(34)} ${cx-s(30)},${cy-s(26)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* red papal robe */}
        <path d={`M ${cx-s(22)},${cy-s(22)} C ${cx-s(26)},${cy-s(4)} ${cx-s(28)},${cy+s(14)} ${cx-s(26)},${cy+s(36)} C ${cx-s(20)},${cy+s(56)} ${cx-s(12)},${cy+s(72)} ${cx-s(8)},${cy+s(84)} L ${cx+s(8)},${cy+s(84)} C ${cx+s(12)},${cy+s(72)} ${cx+s(20)},${cy+s(56)} ${cx+s(26)},${cy+s(36)} C ${cx+s(28)},${cy+s(14)} ${cx+s(26)},${cy-s(4)} ${cx+s(22)},${cy-s(22)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* white alb front */}
        <path d={`M ${cx-s(12)},${cy-s(22)} L ${cx-s(10)},${cy+s(80)} L ${cx+s(10)},${cy+s(80)} L ${cx+s(12)},${cy-s(22)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* right hand blessing */}
        <path d={`M ${cx+s(16)},${cy-s(14)} C ${cx+s(24)},${cy-s(18)} ${cx+s(32)},${cy-s(16)} ${cx+s(36)},${cy-s(8)} C ${cx+s(32)},${cy-s(2)} ${cx+s(24)},${cy-s(2)} ${cx+s(16)},${cy-s(6)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* two raised fingers */}
        <line x1={cx+s(36)} y1={cy-s(8)} x2={cx+s(40)} y2={cy-s(26)} stroke={FLESH} strokeWidth={s(3)} strokeLinecap="round"/>
        <line x1={cx+s(38)} y1={cy-s(6)} x2={cx+s(44)} y2={cy-s(22)} stroke={FLESH} strokeWidth={s(3)} strokeLinecap="round"/>
        {/* triple cross staff */}
        <line x1={cx-s(20)} y1={cy-s(16)} x2={cx-s(38)} y2={cy-s(12)} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(16)},${cy-s(8)} C ${cx-s(24)},${cy-s(12)} ${cx-s(32)},${cy-s(10)} ${cx-s(36)},${cy-s(4)} C ${cx-s(32)},${cy+s(2)} ${cx-s(24)},${cy+s(2)} ${cx-s(16)},${cy-s(2)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx-s(38)} y1={cy-s(12)} x2={cx-s(38)} y2={cy+s(80)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        {[-s(48),-s(40),-s(30)].map((y,i)=><line key={i} x1={cx-s(46)} y1={cy+y} x2={cx-s(30)} y2={cy+y} stroke={INK} strokeWidth={s(i===0?2:1.4)}/>)}
        {/* two kneeling monks */}
        {[-s(22),s(22)].map((ox,i)=>(
          <g key={i}>
            <path d={`M ${cx+ox-s(8)},${cy+s(42)} C ${cx+ox-s(8)},${cy+s(30)} ${cx+ox+s(8)},${cy+s(30)} ${cx+ox+s(8)},${cy+s(42)} L ${cx+ox+s(8)},${cy+s(84)} L ${cx+ox-s(8)},${cy+s(84)} Z`} fill={i===0?BLUE:RED} stroke={INK} strokeWidth={s(1)}/>
            <path d={`M ${cx+ox},${cy+s(30)} C ${cx+ox-s(8)},${cy+s(30)} ${cx+ox-s(9)},${cy+s(24)} ${cx+ox-s(9)},${cy+s(20)} C ${cx+ox-s(9)},${cy+s(16)} ${cx+ox-s(5)},${cy+s(14)} ${cx+ox},${cy+s(14)} C ${cx+ox+s(5)},${cy+s(14)} ${cx+ox+s(9)},${cy+s(16)} ${cx+ox+s(9)},${cy+s(20)} C ${cx+ox+s(9)},${cy+s(24)} ${cx+ox+s(8)},${cy+s(30)} ${cx+ox},${cy+s(30)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
          </g>
        ))}
        {/* head */}
        <path d={`M ${cx},${cy-s(46)} C ${cx-s(12)},${cy-s(46)} ${cx-s(14)},${cy-s(36)} ${cx-s(14)},${cy-s(28)} C ${cx-s(14)},${cy-s(20)} ${cx-s(8)},${cy-s(16)} ${cx},${cy-s(16)} C ${cx+s(8)},${cy-s(16)} ${cx+s(14)},${cy-s(20)} ${cx+s(14)},${cy-s(28)} C ${cx+s(14)},${cy-s(36)} ${cx+s(12)},${cy-s(46)} ${cx},${cy-s(46)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* triple tiara */}
        <path d={`M ${cx-s(14)},${cy-s(46)} L ${cx+s(14)},${cy-s(46)} L ${cx+s(14)},${cy-s(52)} L ${cx+s(10)},${cy-s(56)} L ${cx+s(10)},${cy-s(60)} L ${cx+s(6)},${cy-s(64)} L ${cx+s(6)},${cy-s(68)} L ${cx+s(2)},${cy-s(72)} L ${cx-s(2)},${cy-s(72)} L ${cx-s(6)},${cy-s(68)} L ${cx-s(6)},${cy-s(64)} L ${cx-s(10)},${cy-s(60)} L ${cx-s(10)},${cy-s(56)} L ${cx-s(14)},${cy-s(52)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(7)} cy={cy-s(31)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(7)} cy={cy-s(31)} r={s(1.5)} fill={INK}/>
        <path d={`M ${cx-s(4)},${cy-s(23)} C ${cx},${cy-s(20)} ${cx+s(4)},${cy-s(21)} ${cx+s(6)},${cy-s(23)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    6: (
      <g>
        {/* L'Amoureux Â· The Lovers */}
        {/* Sun/clouds above */}
        <path d={`M ${cx-s(50)},${cy-s(74)} C ${cx-s(30)},${cy-s(90)} ${cx-s(10)},${cy-s(88)} ${cx},${cy-s(84)} C ${cx+s(10)},${cy-s(88)} ${cx+s(30)},${cy-s(90)} ${cx+s(50)},${cy-s(74)}`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* Cupid */}
        <path d={`M ${cx},${cy-s(80)} C ${cx-s(8)},${cy-s(80)} ${cx-s(9)},${cy-s(72)} ${cx-s(9)},${cy-s(68)} C ${cx-s(9)},${cy-s(64)} ${cx-s(5)},${cy-s(62)} ${cx},${cy-s(62)} C ${cx+s(5)},${cy-s(62)} ${cx+s(9)},${cy-s(64)} ${cx+s(9)},${cy-s(68)} C ${cx+s(9)},${cy-s(72)} ${cx+s(8)},${cy-s(80)} ${cx},${cy-s(80)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(9)},${cy-s(72)} C ${cx-s(18)},${cy-s(76)} ${cx-s(22)},${cy-s(68)} ${cx-s(18)},${cy-s(62)} C ${cx-s(12)},${cy-s(60)} ${cx-s(8)},${cy-s(62)} ${cx-s(6)},${cy-s(66)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M ${cx+s(9)},${cy-s(72)} C ${cx+s(18)},${cy-s(76)} ${cx+s(22)},${cy-s(68)} ${cx+s(18)},${cy-s(62)} C ${cx+s(12)},${cy-s(60)} ${cx+s(8)},${cy-s(62)} ${cx+s(6)},${cy-s(66)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        {/* arrow */}
        <line x1={cx-s(26)} y1={cy-s(56)} x2={cx+s(16)} y2={cy-s(42)} stroke={INK} strokeWidth={s(1.5)}/>
        <path d={`M ${cx+s(16)},${cy-s(42)} L ${cx+s(10)},${cy-s(48)} L ${cx+s(18)},${cy-s(46)} Z`} fill={INK}/>
        {/* centre male figure */}
        <path d={`M ${cx-s(10)},${cy-s(10)} C ${cx-s(14)},${cy+s(4)} ${cx-s(14)},${cy+s(22)} ${cx-s(12)},${cy+s(44)} L ${cx-s(8)},${cy+s(88)} L ${cx+s(8)},${cy+s(88)} L ${cx+s(12)},${cy+s(44)} C ${cx+s(14)},${cy+s(22)} ${cx+s(14)},${cy+s(4)} ${cx+s(10)},${cy-s(10)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* head centre */}
        <path d={`M ${cx},${cy-s(28)} C ${cx-s(10)},${cy-s(28)} ${cx-s(12)},${cy-s(20)} ${cx-s(12)},${cy-s(14)} C ${cx-s(12)},${cy-s(8)} ${cx-s(7)},${cy-s(4)} ${cx},${cy-s(4)} C ${cx+s(7)},${cy-s(4)} ${cx+s(12)},${cy-s(8)} ${cx+s(12)},${cy-s(14)} C ${cx+s(12)},${cy-s(20)} ${cx+s(10)},${cy-s(28)} ${cx},${cy-s(28)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left woman - red */}
        <path d={`M ${cx-s(36)},${cy-s(6)} C ${cx-s(40)},${cy+s(8)} ${cx-s(40)},${cy+s(26)} ${cx-s(36)},${cy+s(48)} C ${cx-s(30)},${cy+s(66)} ${cx-s(22)},${cy+s(80)} ${cx-s(18)},${cy+s(88)} L ${cx-s(2)},${cy+s(88)} C ${cx-s(6)},${cy+s(80)} ${cx-s(14)},${cy+s(66)} ${cx-s(20)},${cy+s(48)} C ${cx-s(24)},${cy+s(26)} ${cx-s(24)},${cy+s(8)} ${cx-s(20)},${cy-s(6)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(28)},${cy-s(22)} C ${cx-s(36)},${cy-s(22)} ${cx-s(38)},${cy-s(14)} ${cx-s(38)},${cy-s(8)} C ${cx-s(38)},${cy-s(2)} ${cx-s(34)},${cy} ${cx-s(28)},${cy} C ${cx-s(22)},${cy} ${cx-s(18)},${cy-s(2)} ${cx-s(18)},${cy-s(8)} C ${cx-s(18)},${cy-s(14)} ${cx-s(20)},${cy-s(22)} ${cx-s(28)},${cy-s(22)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(38)},${cy-s(14)} C ${cx-s(46)},${cy-s(18)} ${cx-s(50)},${cy-s(10)} ${cx-s(46)},${cy-s(4)} C ${cx-s(42)},${cy} ${cx-s(36)},${cy} ${cx-s(34)},${cy-s(6)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* right woman - yellow/green */}
        <path d={`M ${cx+s(20)},${cy-s(6)} C ${cx+s(24)},${cy+s(8)} ${cx+s(24)},${cy+s(26)} ${cx+s(20)},${cy+s(48)} C ${cx+s(14)},${cy+s(66)} ${cx+s(6)},${cy+s(80)} ${cx+s(2)},${cy+s(88)} L ${cx+s(18)},${cy+s(88)} C ${cx+s(22)},${cy+s(80)} ${cx+s(30)},${cy+s(66)} ${cx+s(36)},${cy+s(48)} C ${cx+s(40)},${cy+s(26)} ${cx+s(40)},${cy+s(8)} ${cx+s(36)},${cy-s(6)} Z`} fill={GRN} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(28)},${cy-s(22)} C ${cx+s(20)},${cy-s(22)} ${cx+s(18)},${cy-s(14)} ${cx+s(18)},${cy-s(8)} C ${cx+s(18)},${cy-s(2)} ${cx+s(22)},${cy} ${cx+s(28)},${cy} C ${cx+s(34)},${cy} ${cx+s(38)},${cy-s(2)} ${cx+s(38)},${cy-s(8)} C ${cx+s(38)},${cy-s(14)} ${cx+s(36)},${cy-s(22)} ${cx+s(28)},${cy-s(22)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* crown on right woman */}
        <path d={`M ${cx+s(18)},${cy-s(22)} L ${cx+s(22)},${cy-s(32)} L ${cx+s(26)},${cy-s(26)} L ${cx+s(30)},${cy-s(34)} L ${cx+s(34)},${cy-s(26)} L ${cx+s(38)},${cy-s(22)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* face dots for all three */}
        {[cx-s(28),cx,cx+s(28)].map((x,i)=>(
          <g key={i}>
            <circle cx={x-s(4)} cy={cy+(i===0?-s(15):i===1?-s(17):-s(15))} r={s(1.5)} fill={INK}/>
            <circle cx={x+s(4)} cy={cy+(i===0?-s(15):i===1?-s(17):-s(15))} r={s(1.5)} fill={INK}/>
            <path d={`M ${x-s(3)},${cy+(i===0?-s(8):i===1?-s(10):-s(8))} C ${x},${cy+(i===0?-s(5):i===1?-s(7):-s(5))} ${x+s(3)},${cy+(i===0?-s(6):i===1?-s(8):-s(6))} ${x+s(5)},${cy+(i===0?-s(8):i===1?-s(10):-s(8))}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
          </g>
        ))}
      </g>
    ),
    7: (
      <g>
        {/* Le Chariot Â· The Chariot */}
        {/* canopy top */}
        <path d={`M ${cx-s(36)},${cy-s(22)} L ${cx-s(36)},${cy-s(32)} L ${cx+s(36)},${cy-s(32)} L ${cx+s(36)},${cy-s(22)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {[cx-s(26),cx-s(14),cx-s(2),cx+s(10),cx+s(22)].map((x,i)=><circle key={i} cx={x} cy={cy-s(27)} r={s(3)} fill={YEL} stroke={INK} strokeWidth={s(0.7)}/>)}
        {/* chariot box */}
        <path d={`M ${cx-s(36)},${cy-s(22)} L ${cx-s(36)},${cy+s(34)} L ${cx+s(36)},${cy+s(34)} L ${cx+s(36)},${cy-s(22)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* chariot front decoration */}
        <path d={`M ${cx-s(30)},${cy-s(22)} L ${cx-s(30)},${cy+s(34)} M ${cx+s(30)},${cy-s(22)} L ${cx+s(30)},${cy+s(34)}`} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(6)},${cy+s(6)} C ${cx-s(12)},${cy+s(2)} ${cx-s(12)},${cy-s(10)} ${cx-s(6)},${cy-s(14)} C ${cx},${cy-s(18)} ${cx+s(6)},${cy-s(14)} ${cx+s(6)},${cy-s(6)} C ${cx+s(6)},${cy} ${cx},${cy+s(4)} ${cx-s(6)},${cy+s(6)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {/* wheels */}
        {[cx-s(30),cx+s(30)].map((x,i)=>(
          <g key={i}>
            <circle cx={x} cy={cy+s(42)} r={s(18)} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
            <circle cx={x} cy={cy+s(42)} r={s(4)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
            {[0,60,120,180,240,300].map(a=><line key={a} x1={x} y1={cy+s(42)} x2={x+Math.cos(a*Math.PI/180)*s(18)} y2={cy+s(42)+Math.sin(a*Math.PI/180)*s(18)} stroke={INK} strokeWidth={s(1)}/>)}
          </g>
        ))}
        {/* axle */}
        <line x1={cx-s(30)} y1={cy+s(42)} x2={cx+s(30)} y2={cy+s(42)} stroke={INK} strokeWidth={s(2)}/>
        {/* horses (stylised) */}
        {[-s(20),s(20)].map((ox,i)=>(
          <g key={i}>
            <path d={`M ${cx+ox-s(8)},${cy+s(58)} C ${cx+ox-s(14)},${cy+s(46)} ${cx+ox-s(16)},${cy+s(32)} ${cx+ox-s(12)},${cy+s(18)} L ${cx+ox+s(12)},${cy+s(18)} C ${cx+ox+s(16)},${cy+s(32)} ${cx+ox+s(14)},${cy+s(46)} ${cx+ox+s(8)},${cy+s(58)} Z`} fill={i===0?PARCHMENT:INK} stroke={INK} strokeWidth={s(1.2)}/>
            <path d={`M ${cx+ox-s(4)},${cy+s(18)} C ${cx+ox-s(8)},${cy+s(10)} ${cx+ox-s(8)},${cy} ${cx+ox-s(4)},${cy-s(6)} L ${cx+ox+s(4)},${cy-s(6)} C ${cx+ox+s(8)},${cy} ${cx+ox+s(8)},${cy+s(10)} ${cx+ox+s(4)},${cy+s(18)} Z`} fill={i===0?PARCHMENT:INK} stroke={INK} strokeWidth={s(1.2)}/>
            {[cx+ox-s(10),cx+ox-s(2),cx+ox+s(6)].map((x,j)=><line key={j} x1={x} y1={cy+s(58)} x2={x+(j%2?s(3):-s(3))} y2={cy+s(82)} stroke={INK} strokeWidth={s(3)} strokeLinecap="round"/>)}
          </g>
        ))}
        {/* charioteer body */}
        <path d={`M ${cx-s(14)},${cy-s(22)} C ${cx-s(16)},${cy-s(10)} ${cx-s(16)},${cy+s(4)} ${cx-s(14)},${cy+s(22)} L ${cx+s(14)},${cy+s(22)} C ${cx+s(16)},${cy+s(4)} ${cx+s(16)},${cy-s(10)} ${cx+s(14)},${cy-s(22)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* armour shoulder plates */}
        <path d={`M ${cx-s(14)},${cy-s(14)} C ${cx-s(22)},${cy-s(16)} ${cx-s(26)},${cy-s(10)} ${cx-s(22)},${cy-s(4)} C ${cx-s(18)},${cy+s(2)} ${cx-s(14)},${cy-s(2)} ${cx-s(14)},${cy-s(14)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(14)},${cy-s(14)} C ${cx+s(22)},${cy-s(16)} ${cx+s(26)},${cy-s(10)} ${cx+s(22)},${cy-s(4)} C ${cx+s(18)},${cy+s(2)} ${cx+s(14)},${cy-s(2)} ${cx+s(14)},${cy-s(14)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* sceptre/wand */}
        <line x1={cx+s(12)} y1={cy-s(16)} x2={cx+s(20)} y2={cy-s(56)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        {/* head */}
        <path d={`M ${cx},${cy-s(44)} C ${cx-s(12)},${cy-s(44)} ${cx-s(14)},${cy-s(34)} ${cx-s(14)},${cy-s(26)} C ${cx-s(14)},${cy-s(18)} ${cx-s(8)},${cy-s(14)} ${cx},${cy-s(14)} C ${cx+s(8)},${cy-s(14)} ${cx+s(14)},${cy-s(18)} ${cx+s(14)},${cy-s(26)} C ${cx+s(14)},${cy-s(34)} ${cx+s(12)},${cy-s(44)} ${cx},${cy-s(44)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(14)},${cy-s(44)} L ${cx-s(10)},${cy-s(58)} L ${cx-s(4)},${cy-s(50)} L ${cx+s(2)},${cy-s(62)} L ${cx+s(8)},${cy-s(50)} L ${cx+s(14)},${cy-s(58)} L ${cx+s(18)},${cy-s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(6)} cy={cy-s(30)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(6)} cy={cy-s(30)} r={s(2)} fill={INK}/>
        <path d={`M ${cx-s(4)},${cy-s(22)} C ${cx},${cy-s(19)} ${cx+s(4)},${cy-s(20)} ${cx+s(6)},${cy-s(22)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    8: (
      <g>
        {/* La Justice Â· Justice */}
        {/* throne */}
        <path d={`M ${cx-s(32)},${cy-s(26)} L ${cx-s(32)},${cy+s(88)} L ${cx+s(32)},${cy+s(88)} L ${cx+s(32)},${cy-s(26)} C ${cx+s(22)},${cy-s(34)} ${cx-s(22)},${cy-s(34)} ${cx-s(32)},${cy-s(26)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* red robe */}
        <path d={`M ${cx-s(20)},${cy-s(22)} C ${cx-s(24)},${cy-s(6)} ${cx-s(26)},${cy+s(12)} ${cx-s(24)},${cy+s(36)} C ${cx-s(18)},${cy+s(58)} ${cx-s(10)},${cy+s(74)} ${cx-s(8)},${cy+s(86)} L ${cx+s(8)},${cy+s(86)} C ${cx+s(10)},${cy+s(74)} ${cx+s(18)},${cy+s(58)} ${cx+s(24)},${cy+s(36)} C ${cx+s(26)},${cy+s(12)} ${cx+s(24)},${cy-s(6)} ${cx+s(20)},${cy-s(22)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* blue underdress */}
        <path d={`M ${cx-s(10)},${cy-s(22)} L ${cx-s(8)},${cy+s(84)} L ${cx+s(8)},${cy+s(84)} L ${cx+s(10)},${cy-s(22)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* right arm - sword upright */}
        <path d={`M ${cx+s(16)},${cy-s(14)} C ${cx+s(24)},${cy-s(16)} ${cx+s(32)},${cy-s(14)} ${cx+s(36)},${cy-s(8)} C ${cx+s(32)},${cy-s(2)} ${cx+s(24)},${cy-s(2)} ${cx+s(16)},${cy-s(6)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(38)} y1={cy-s(6)} x2={cx+s(38)} y2={cy-s(86)} stroke={INK} strokeWidth={s(3)} strokeLinecap="round"/>
        <path d={`M ${cx+s(34)},${cy-s(82)} L ${cx+s(38)},${cy-s(94)} L ${cx+s(42)},${cy-s(82)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(30)} y1={cy-s(72)} x2={cx+s(46)} y2={cy-s(72)} stroke={INK} strokeWidth={s(2)}/>
        {/* left arm - scales */}
        <path d={`M ${cx-s(16)},${cy-s(14)} C ${cx-s(24)},${cy-s(10)} ${cx-s(34)},${cy-s(8)} ${cx-s(38)},${cy-s(2)} C ${cx-s(34)},${cy+s(4)} ${cx-s(24)},${cy+s(4)} ${cx-s(16)},${cy} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* scales */}
        <line x1={cx-s(44)} y1={cy-s(4)} x2={cx-s(18)} y2={cy-s(4)} stroke={INK} strokeWidth={s(1.5)}/>
        <line x1={cx-s(31)} y1={cy-s(4)} x2={cx-s(31)} y2={cy-s(18)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* pans */}
        <path d={`M ${cx-s(50)},${cy+s(8)} Q ${cx-s(44)},${cy+s(16)} ${cx-s(38)},${cy+s(8)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx-s(50)} y1={cy+s(8)} x2={cx-s(48)} y2={cy-s(4)} stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx-s(38)} y1={cy+s(8)} x2={cx-s(36)} y2={cy-s(4)} stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M ${cx-s(26)},${cy+s(8)} Q ${cx-s(20)},${cy+s(16)} ${cx-s(14)},${cy+s(8)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx-s(26)} y1={cy+s(8)} x2={cx-s(28)} y2={cy-s(4)} stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx-s(14)} y1={cy+s(8)} x2={cx-s(16)} y2={cy-s(4)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(44)} C ${cx-s(12)},${cy-s(44)} ${cx-s(14)},${cy-s(34)} ${cx-s(14)},${cy-s(26)} C ${cx-s(14)},${cy-s(18)} ${cx-s(8)},${cy-s(14)} ${cx},${cy-s(14)} C ${cx+s(8)},${cy-s(14)} ${cx+s(14)},${cy-s(18)} ${cx+s(14)},${cy-s(26)} C ${cx+s(14)},${cy-s(34)} ${cx+s(12)},${cy-s(44)} ${cx},${cy-s(44)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(14)},${cy-s(44)} L ${cx-s(10)},${cy-s(58)} L ${cx-s(4)},${cy-s(50)} L ${cx+s(2)},${cy-s(62)} L ${cx+s(8)},${cy-s(50)} L ${cx+s(14)},${cy-s(58)} L ${cx+s(18)},${cy-s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(6)} cy={cy-s(30)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(6)} cy={cy-s(30)} r={s(2)} fill={INK}/>
        <path d={`M ${cx-s(4)},${cy-s(22)} C ${cx},${cy-s(19)} ${cx+s(4)},${cy-s(20)} ${cx+s(6)},${cy-s(22)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    9: (
      <g>
        {/* L'Ermite Â· The Hermit */}
        {/* rocky ground */}
        <path d={`M ${s(6)},${cy+s(88)} C ${cx-s(20)},${cy+s(80)} ${cx+s(20)},${cy+s(84)} ${w-s(6)},${cy+s(88)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        {/* cloak - large dark shape */}
        <path d={`M ${cx-s(16)},${cy-s(26)} C ${cx-s(26)},${cy-s(8)} ${cx-s(32)},${cy+s(16)} ${cx-s(30)},${cy+s(46)} C ${cx-s(26)},${cy+s(68)} ${cx-s(16)},${cy+s(80)} ${cx-s(8)},${cy+s(86)} L ${cx+s(14)},${cy+s(86)} C ${cx+s(20)},${cy+s(80)} ${cx+s(26)},${cy+s(66)} ${cx+s(24)},${cy+s(46)} C ${cx+s(22)},${cy+s(16)} ${cx+s(18)},${cy-s(8)} ${cx+s(14)},${cy-s(26)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* hood */}
        <path d={`M ${cx-s(18)},${cy-s(24)} C ${cx-s(24)},${cy-s(32)} ${cx-s(20)},${cy-s(50)} ${cx-s(8)},${cy-s(58)} C ${cx},${cy-s(62)} ${cx+s(8)},${cy-s(60)} ${cx+s(14)},${cy-s(52)} C ${cx+s(20)},${cy-s(42)} ${cx+s(18)},${cy-s(28)} ${cx+s(12)},${cy-s(24)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* face */}
        <path d={`M ${cx},${cy-s(52)} C ${cx-s(10)},${cy-s(52)} ${cx-s(12)},${cy-s(44)} ${cx-s(12)},${cy-s(38)} C ${cx-s(12)},${cy-s(32)} ${cx-s(7)},${cy-s(28)} ${cx},${cy-s(28)} C ${cx+s(7)},${cy-s(28)} ${cx+s(12)},${cy-s(32)} ${cx+s(12)},${cy-s(38)} C ${cx+s(12)},${cy-s(44)} ${cx+s(10)},${cy-s(52)} ${cx},${cy-s(52)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* beard */}
        <path d={`M ${cx-s(10)},${cy-s(36)} C ${cx-s(14)},${cy-s(26)} ${cx-s(12)},${cy-s(16)} ${cx-s(6)},${cy-s(14)} C ${cx},${cy-s(12)} ${cx+s(6)},${cy-s(14)} ${cx+s(10)},${cy-s(20)} C ${cx+s(12)},${cy-s(28)} ${cx+s(10)},${cy-s(36)} ${cx+s(8)},${cy-s(38)} C ${cx+s(4)},${cy-s(36)} ${cx-s(2)},${cy-s(36)} ${cx-s(10)},${cy-s(36)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(5)} cy={cy-s(42)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(5)} cy={cy-s(42)} r={s(1.5)} fill={INK}/>
        {/* staff - right side */}
        <path d={`M ${cx+s(12)},${cy-s(24)} C ${cx+s(18)},${cy-s(18)} ${cx+s(22)},${cy-s(8)} ${cx+s(22)},${cy+s(6)} C ${cx+s(22)},${cy+s(26)} ${cx+s(20)},${cy+s(52)} ${cx+s(18)},${cy+s(86)} L ${cx+s(24)},${cy+s(86)} L ${cx+s(26)},${cy+s(6)} C ${cx+s(28)},${cy-s(8)} ${cx+s(28)},${cy-s(20)} ${cx+s(24)},${cy-s(28)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1.2)}/>
        {/* lantern - left hand */}
        <path d={`M ${cx-s(22)},${cy-s(20)} C ${cx-s(30)},${cy-s(16)} ${cx-s(36)},${cy-s(8)} ${cx-s(34)},${cy+s(2)} C ${cx-s(30)},${cy+s(8)} ${cx-s(22)},${cy+s(8)} ${cx-s(18)},${cy+s(2)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* lantern box */}
        <path d={`M ${cx-s(40)},${cy-s(16)} L ${cx-s(46)},${cy-s(16)} L ${cx-s(46)},${cy-s(2)} L ${cx-s(40)},${cy-s(2)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(46)},${cy-s(16)} L ${cx-s(50)},${cy-s(20)} L ${cx-s(36)},${cy-s(20)} L ${cx-s(40)},${cy-s(16)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(43)} y1={cy-s(20)} x2={cx-s(43)} y2={cy-s(22)} stroke={INK} strokeWidth={s(1.5)}/>
        <circle cx={cx-s(43)} cy={cy-s(9)} r={s(3)} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.6)}/>
      </g>
    ),
    10: (
      <g>
        {/* La Roue de Fortune Â· Wheel of Fortune */}
        {/* outer wheel */}
        <circle cx={cx} cy={cy} r={s(60)} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx} cy={cy} r={s(50)} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx} cy={cy} r={s(12)} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* spokes */}
        {[0,45,90,135,180,225,270,315].map(a=><line key={a} x1={cx+Math.cos(a*Math.PI/180)*s(12)} y1={cy+Math.sin(a*Math.PI/180)*s(12)} x2={cx+Math.cos(a*Math.PI/180)*s(50)} y2={cy+Math.sin(a*Math.PI/180)*s(50)} stroke={INK} strokeWidth={s(1.2)}/>)}
        {/* figure ascending left */}
        <path d={`M ${cx-s(56)},${cy+s(12)} C ${cx-s(62)},${cy} ${cx-s(60)},${cy-s(14)} ${cx-s(52)},${cy-s(18)} C ${cx-s(44)},${cy-s(22)} ${cx-s(38)},${cy-s(18)} ${cx-s(38)},${cy-s(10)} C ${cx-s(38)},${cy-s(2)} ${cx-s(44)},${cy+s(4)} ${cx-s(56)},${cy+s(12)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(48)},${cy-s(26)} C ${cx-s(56)},${cy-s(26)} ${cx-s(58)},${cy-s(18)} ${cx-s(58)},${cy-s(12)} C ${cx-s(58)},${cy-s(6)} ${cx-s(54)},${cy-s(2)} ${cx-s(48)},${cy-s(2)} C ${cx-s(42)},${cy-s(2)} ${cx-s(38)},${cy-s(6)} ${cx-s(38)},${cy-s(12)} C ${cx-s(38)},${cy-s(18)} ${cx-s(40)},${cy-s(26)} ${cx-s(48)},${cy-s(26)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(48)},${cy-s(36)} L ${cx-s(54)},${cy-s(44)} L ${cx-s(48)},${cy-s(38)} L ${cx-s(42)},${cy-s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* figure at top - crowned beast */}
        <path d={`M ${cx-s(10)},${cy-s(50)} C ${cx-s(14)},${cy-s(60)} ${cx-s(12)},${cy-s(72)} ${cx-s(4)},${cy-s(76)} C ${cx+s(4)},${cy-s(80)} ${cx+s(10)},${cy-s(76)} ${cx+s(12)},${cy-s(68)} C ${cx+s(14)},${cy-s(58)} ${cx+s(10)},${cy-s(50)} ${cx-s(10)},${cy-s(50)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx},${cy-s(88)} C ${cx-s(10)},${cy-s(88)} ${cx-s(12)},${cy-s(80)} ${cx-s(12)},${cy-s(74)} C ${cx-s(12)},${cy-s(68)} ${cx-s(7)},${cy-s(64)} ${cx},${cy-s(64)} C ${cx+s(7)},${cy-s(64)} ${cx+s(12)},${cy-s(68)} ${cx+s(12)},${cy-s(74)} C ${cx+s(12)},${cy-s(80)} ${cx+s(10)},${cy-s(88)} ${cx},${cy-s(88)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(8)},${cy-s(88)} L ${cx-s(6)},${cy-s(96)} L ${cx},${cy-s(92)} L ${cx+s(6)},${cy-s(96)} L ${cx+s(8)},${cy-s(88)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* figure descending right */}
        <path d={`M ${cx+s(38)},${cy+s(12)} C ${cx+s(44)},${cy} ${cx+s(56)},${cy-s(4)} ${cx+s(60)},${cy+s(4)} C ${cx+s(62)},${cy+s(14)} ${cx+s(56)},${cy+s(22)} ${cx+s(44)},${cy+s(24)} Z`} fill={GRN} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(48)},${cy-s(8)} C ${cx+s(42)},${cy-s(8)} ${cx+s(40)},${cy-s(2)} ${cx+s(40)},${cy+s(4)} C ${cx+s(40)},${cy+s(10)} ${cx+s(44)},${cy+s(14)} ${cx+s(50)},${cy+s(14)} C ${cx+s(56)},${cy+s(14)} ${cx+s(60)},${cy+s(10)} ${cx+s(60)},${cy+s(4)} C ${cx+s(60)},${cy-s(2)} ${cx+s(58)},${cy-s(8)} ${cx+s(52)},${cy-s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* crank handle */}
        <line x1={cx+s(60)} y1={cy} x2={cx+s(74)} y2={cy} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        <line x1={cx+s(74)} y1={cy-s(12)} x2={cx+s(74)} y2={cy+s(12)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
      </g>
    ),
    11: (
      <g>
        {/* La Force Â· Strength */}
        {/* ground */}
        <path d={`M ${s(6)},${cy+s(88)} L ${w-s(6)},${cy+s(88)}`} stroke={INK} strokeWidth={s(0.8)} fill="none"/>
        {/* lion body */}
        <path d={`M ${cx-s(56)},${cy+s(48)} C ${cx-s(60)},${cy+s(36)} ${cx-s(56)},${cy+s(24)} ${cx-s(44)},${cy+s(18)} L ${cx+s(20)},${cy+s(18)} C ${cx+s(32)},${cy+s(18)} ${cx+s(38)},${cy+s(30)} ${cx+s(38)},${cy+s(44)} C ${cx+s(38)},${cy+s(58)} ${cx+s(28)},${cy+s(68)} ${cx+s(14)},${cy+s(70)} L ${cx-s(36)},${cy+s(70)} C ${cx-s(50)},${cy+s(68)} ${cx-s(58)},${cy+s(60)} ${cx-s(56)},${cy+s(48)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* lion legs */}
        {[cx-s(38),cx-s(22),cx+s(8),cx+s(22)].map((x,i)=><path key={i} d={`M ${x},${cy+s(68)} C ${x},${cy+s(74)} ${x+(i<2?-s(4):s(4))},${cy+s(78)} ${x+(i<2?-s(6):s(6))},${cy+s(86)} L ${x+(i<2?s(2):s(2))},${cy+s(86)} L ${x+(i<2?s(4):s(4))},${cy+s(76)} L ${x+(i<2?s(8):s(10))},${cy+s(68)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>)}
        {/* lion head */}
        <path d={`M ${cx-s(52)},${cy+s(28)} C ${cx-s(62)},${cy+s(16)} ${cx-s(60)},${cy} ${cx-s(48)},${cy-s(6)} C ${cx-s(36)},${cy-s(12)} ${cx-s(24)},${cy-s(10)} ${cx-s(18)},${cy} C ${cx-s(14)},${cy+s(8)} ${cx-s(18)},${cy+s(18)} ${cx-s(28)},${cy+s(22)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* lion mane */}
        {[0,30,60,90,120,150,180].map(a=><path key={a} d={`M ${cx-s(38)+Math.cos((a+180)*Math.PI/180)*s(22)},${cy+s(8)+Math.sin((a+180)*Math.PI/180)*s(22)} C ${cx-s(38)+Math.cos((a+180)*Math.PI/180)*s(30)},${cy+s(8)+Math.sin((a+180)*Math.PI/180)*s(30)} ${cx-s(38)+Math.cos((a+170)*Math.PI/180)*s(28)},${cy+s(8)+Math.sin((a+170)*Math.PI/180)*s(28)} ${cx-s(38)+Math.cos((a+160)*Math.PI/180)*s(22)},${cy+s(8)+Math.sin((a+160)*Math.PI/180)*s(22)} Z`} fill={INK}/>)}
        <circle cx={cx-s(44)} cy={cy+s(4)} r={s(3)} fill={INK}/>
        <path d={`M ${cx-s(52)},${cy+s(14)} L ${cx-s(36)},${cy+s(14)}`} stroke={INK} strokeWidth={s(1)}/>
        {/* lion tail */}
        <path d={`M ${cx+s(38)},${cy+s(40)} C ${cx+s(48)},${cy+s(36)} ${cx+s(58)},${cy+s(30)} ${cx+s(62)},${cy+s(20)} C ${cx+s(64)},${cy+s(26)} ${cx+s(60)},${cy+s(36)} ${cx+s(50)},${cy+s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* woman figure */}
        <path d={`M ${cx-s(12)},${cy-s(8)} C ${cx-s(16)},${cy+s(6)} ${cx-s(16)},${cy+s(22)} ${cx-s(14)},${cy+s(40)} L ${cx-s(14)},${cy+s(20)} L ${cx-s(6)},${cy+s(20)} L ${cx-s(6)},${cy-s(8)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(6)},${cy-s(8)} C ${cx-s(2)},${cy+s(4)} ${cx-s(2)},${cy+s(16)} ${cx},${cy+s(20)} L ${cx+s(14)},${cy+s(20)} C ${cx+s(16)},${cy+s(16)} ${cx+s(16)},${cy} ${cx+s(14)},${cy-s(8)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* arms on lion's jaw */}
        <path d={`M ${cx-s(10)},${cy-s(4)} C ${cx-s(18)},${cy-s(10)} ${cx-s(28)},${cy-s(12)} ${cx-s(36)},${cy-s(8)} C ${cx-s(32)},${cy-s(2)} ${cx-s(24)},${cy} ${cx-s(14)},${cy} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(6)},${cy-s(4)} C ${cx-s(12)},${cy+s(2)} ${cx-s(22)},${cy+s(8)} ${cx-s(30)},${cy+s(12)} C ${cx-s(24)},${cy+s(18)} ${cx-s(16)},${cy+s(16)} ${cx-s(8)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* head */}
        <path d={`M ${cx+s(4)},${cy-s(26)} C ${cx-s(8)},${cy-s(26)} ${cx-s(10)},${cy-s(16)} ${cx-s(10)},${cy-s(10)} C ${cx-s(10)},${cy-s(4)} ${cx-s(5)},${cy} ${cx+s(2)},${cy} C ${cx+s(9)},${cy} ${cx+s(14)},${cy-s(4)} ${cx+s(14)},${cy-s(10)} C ${cx+s(14)},${cy-s(16)} ${cx+s(12)},${cy-s(26)} ${cx+s(4)},${cy-s(26)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* hat */}
        <path d={`M ${cx-s(12)},${cy-s(26)} C ${cx-s(10)},${cy-s(36)} ${cx-s(6)},${cy-s(44)} ${cx},${cy-s(52)} C ${cx+s(6)},${cy-s(44)} ${cx+s(10)},${cy-s(36)} ${cx+s(14)},${cy-s(26)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(16)},${cy-s(26)} C ${cx-s(10)},${cy-s(30)} ${cx+s(14)},${cy-s(30)} ${cx+s(18)},${cy-s(26)} C ${cx+s(14)},${cy-s(22)} ${cx-s(10)},${cy-s(22)} ${cx-s(16)},${cy-s(26)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(2)} cy={cy-s(14)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(14)} r={s(1.5)} fill={INK}/>
        <path d={`M ${cx},${cy-s(7)} C ${cx+s(3)},${cy-s(4)} ${cx+s(6)},${cy-s(5)} ${cx+s(8)},${cy-s(7)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    12: (
      <g>
        {/* Le Pendu Â· The Hanged Man */}
        {/* two trees */}
        {[-s(36),s(36)].map((ox,i)=>(
          <g key={i}>
            <path d={`M ${cx+ox-s(6)},${cy-s(100)} L ${cx+ox-s(6)},${cy+s(88)} L ${cx+ox+s(6)},${cy+s(88)} L ${cx+ox+s(6)},${cy-s(100)} Z`} fill={GRN} stroke={INK} strokeWidth={sw}/>
            {[-s(80),-s(60),-s(40),-s(20)].map((y,j)=>(
              <path key={j} d={`M ${cx+ox-s(6)},${cy+y} L ${cx+ox+(i===0?-s(20):-s(20))+(j%2===0?0:0)},${cy+y-s(12)} L ${cx+ox+(i===0?s(6):s(6))},${cy+y}`} fill={GRN} stroke={INK} strokeWidth={s(1.2)}/>
            ))}
          </g>
        ))}
        {/* crossbar */}
        <path d={`M ${cx-s(42)},${cy-s(54)} L ${cx+s(42)},${cy-s(54)} L ${cx+s(42)},${cy-s(44)} L ${cx-s(42)},${cy-s(44)} Z`} fill={GRN} stroke={INK} strokeWidth={sw}/>
        {/* rope */}
        <line x1={cx} y1={cy-s(44)} x2={cx} y2={cy-s(28)} stroke={INK} strokeWidth={s(1.5)}/>
        {/* hanging figure - one foot tied, body inverted */}
        {/* right leg up (tied to bar) */}
        <path d={`M ${cx-s(4)},${cy-s(28)} L ${cx-s(6)},${cy-s(44)} L ${cx+s(6)},${cy-s(44)} L ${cx+s(4)},${cy-s(28)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {/* left leg bent (forms the 4-shape) */}
        <path d={`M ${cx+s(4)},${cy-s(28)} C ${cx+s(12)},${cy-s(24)} ${cx+s(18)},${cy-s(16)} ${cx+s(18)},${cy-s(8)} L ${cx+s(10)},${cy-s(8)} C ${cx+s(10)},${cy-s(14)} ${cx+s(6)},${cy-s(20)} ${cx+s(2)},${cy-s(24)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {/* body inverted */}
        <path d={`M ${cx-s(14)},${cy-s(28)} C ${cx-s(16)},${cy-s(10)} ${cx-s(16)},${cy+s(8)} ${cx-s(12)},${cy+s(24)} L ${cx+s(12)},${cy+s(24)} C ${cx+s(16)},${cy+s(8)} ${cx+s(16)},${cy-s(10)} ${cx+s(14)},${cy-s(28)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* arms behind back - two small lumps */}
        <path d={`M ${cx-s(12)},${cy+s(8)} C ${cx-s(22)},${cy+s(12)} ${cx-s(28)},${cy+s(20)} ${cx-s(24)},${cy+s(28)} C ${cx-s(18)},${cy+s(26)} ${cx-s(12)},${cy+s(18)} ${cx-s(12)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(12)},${cy+s(8)} C ${cx+s(22)},${cy+s(12)} ${cx+s(28)},${cy+s(20)} ${cx+s(24)},${cy+s(28)} C ${cx+s(18)},${cy+s(26)} ${cx+s(12)},${cy+s(18)} ${cx+s(12)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* head - inverted at bottom */}
        <path d={`M ${cx},${cy+s(38)} C ${cx-s(12)},${cy+s(38)} ${cx-s(14)},${cy+s(28)} ${cx-s(14)},${cy+s(22)} C ${cx-s(14)},${cy+s(16)} ${cx-s(8)},${cy+s(12)} ${cx},${cy+s(12)} C ${cx+s(8)},${cy+s(12)} ${cx+s(14)},${cy+s(16)} ${cx+s(14)},${cy+s(22)} C ${cx+s(14)},${cy+s(28)} ${cx+s(12)},${cy+s(38)} ${cx},${cy+s(38)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* hair falls up (downward from hanging head) */}
        <path d={`M ${cx-s(12)},${cy+s(38)} C ${cx-s(16)},${cy+s(50)} ${cx-s(10)},${cy+s(60)} ${cx},${cy+s(62)} C ${cx+s(10)},${cy+s(60)} ${cx+s(16)},${cy+s(50)} ${cx+s(12)},${cy+s(38)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(5)} cy={cy+s(26)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(5)} cy={cy+s(26)} r={s(1.5)} fill={INK}/>
        <path d={`M ${cx-s(3)},${cy+s(34)} C ${cx},${cy+s(37)} ${cx+s(4)},${cy+s(36)} ${cx+s(6)},${cy+s(34)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    13: (
      <g>
        {/* XIII Â· Death */}
        {/* dark ground with fallen parts */}
        <path d={`M ${s(6)},${cy+s(70)} L ${w-s(6)},${cy+s(70)}`} stroke={INK} strokeWidth={s(0.8)} fill="none"/>
        {/* severed crowned head */}
        <path d={`M ${cx-s(38)},${cy+s(52)} C ${cx-s(46)},${cy+s(52)} ${cx-s(48)},${cy+s(44)} ${cx-s(48)},${cy+s(38)} C ${cx-s(48)},${cy+s(32)} ${cx-s(44)},${cy+s(28)} ${cx-s(38)},${cy+s(28)} C ${cx-s(32)},${cy+s(28)} ${cx-s(28)},${cy+s(32)} ${cx-s(28)},${cy+s(38)} C ${cx-s(28)},${cy+s(44)} ${cx-s(30)},${cy+s(52)} ${cx-s(38)},${cy+s(52)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(46)},${cy+s(36)} L ${cx-s(42)},${cy+s(28)} L ${cx-s(36)},${cy+s(32)} L ${cx-s(30)},${cy+s(28)} L ${cx-s(26)},${cy+s(36)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* severed hand */}
        <path d={`M ${cx+s(28)},${cy+s(66)} C ${cx+s(22)},${cy+s(60)} ${cx+s(20)},${cy+s(54)} ${cx+s(24)},${cy+s(50)} C ${cx+s(28)},${cy+s(46)} ${cx+s(36)},${cy+s(48)} ${cx+s(40)},${cy+s(54)} C ${cx+s(44)},${cy+s(60)} ${cx+s(42)},${cy+s(66)} ${cx+s(36)},${cy+s(68)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        {/* skeleton */}
        {/* pelvis/hips */}
        <path d={`M ${cx-s(20)},${cy+s(18)} C ${cx-s(22)},${cy+s(8)} ${cx-s(16)},${cy+s(2)} ${cx},${cy+s(2)} C ${cx+s(16)},${cy+s(2)} ${cx+s(22)},${cy+s(8)} ${cx+s(20)},${cy+s(18)} C ${cx+s(14)},${cy+s(24)} ${cx-s(14)},${cy+s(24)} ${cx-s(20)},${cy+s(18)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* spine */}
        <path d={`M ${cx-s(4)},${cy+s(2)} L ${cx-s(4)},${cy-s(68)} L ${cx+s(4)},${cy-s(68)} L ${cx+s(4)},${cy+s(2)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* ribs */}
        {[-s(58),-s(46),-s(34),-s(22),-s(10)].map((y,i)=>(
          <g key={i}>
            <path d={`M ${cx-s(4)},${cy+y} C ${cx-s(18)},${cy+y-s(4)} ${cx-s(24)},${cy+y+s(4)} ${cx-s(20)},${cy+y+s(10)}`} fill="none" stroke={PARCHMENT} strokeWidth={s(2.5)}/>
            <path d={`M ${cx+s(4)},${cy+y} C ${cx+s(18)},${cy+y-s(4)} ${cx+s(24)},${cy+y+s(4)} ${cx+s(20)},${cy+y+s(10)}`} fill="none" stroke={PARCHMENT} strokeWidth={s(2.5)}/>
          </g>
        ))}
        {/* scythe arm */}
        <path d={`M ${cx-s(4)},${cy-s(30)} C ${cx-s(14)},${cy-s(28)} ${cx-s(28)},${cy-s(22)} ${cx-s(38)},${cy-s(12)} C ${cx-s(32)},${cy-s(6)} ${cx-s(22)},${cy-s(8)} ${cx-s(12)},${cy-s(18)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1.2)}/>
        {/* scythe */}
        <line x1={cx-s(38)} y1={cy-s(12)} x2={cx-s(2)} y2={cy+s(68)} stroke={INK} strokeWidth={s(3)} strokeLinecap="round"/>
        <path d={`M ${cx-s(40)},${cy-s(14)} C ${cx-s(60)},${cy-s(34)} ${cx-s(58)},${cy-s(58)} ${cx-s(42)},${cy-s(62)} C ${cx-s(30)},${cy-s(64)} ${cx-s(24)},${cy-s(54)} ${cx-s(32)},${cy-s(44)} C ${cx-s(40)},${cy-s(36)} ${cx-s(44)},${cy-s(24)} ${cx-s(40)},${cy-s(14)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* skeleton legs */}
        <path d={`M ${cx-s(12)},${cy+s(22)} L ${cx-s(16)},${cy+s(68)} L ${cx-s(6)},${cy+s(68)} L ${cx-s(4)},${cy+s(22)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(4)},${cy+s(22)} L ${cx+s(6)},${cy+s(68)} L ${cx+s(16)},${cy+s(68)} L ${cx+s(12)},${cy+s(22)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* skull */}
        <path d={`M ${cx},${cy-s(82)} C ${cx-s(16)},${cy-s(82)} ${cx-s(18)},${cy-s(70)} ${cx-s(18)},${cy-s(62)} C ${cx-s(18)},${cy-s(52)} ${cx-s(10)},${cy-s(46)} ${cx},${cy-s(46)} C ${cx+s(10)},${cy-s(46)} ${cx+s(18)},${cy-s(52)} ${cx+s(18)},${cy-s(62)} C ${cx+s(18)},${cy-s(70)} ${cx+s(16)},${cy-s(82)} ${cx},${cy-s(82)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(18)},${cy-s(60)} L ${cx-s(10)},${cy-s(46)} L ${cx+s(10)},${cy-s(46)} L ${cx+s(18)},${cy-s(60)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(6)},${cy-s(46)} L ${cx-s(6)},${cy-s(38)} L ${cx+s(6)},${cy-s(38)} L ${cx+s(6)},${cy-s(46)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(8)},${cy-s(66)} L ${cx-s(4)},${cy-s(64)} L ${cx+s(4)},${cy-s(64)} L ${cx+s(8)},${cy-s(66)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <circle cx={cx-s(8)} cy={cy-s(72)} r={s(3)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(72)} r={s(3)} fill={INK}/>
      </g>
    ),
    14: (
      <g>
        {/* La TempÃ©rance Â· Temperance */}
        {/* wings */}
        <path d={`M ${cx-s(12)},${cy-s(12)} C ${cx-s(30)},${cy-s(20)} ${cx-s(50)},${cy-s(12)} ${cx-s(56)},${cy+s(4)} C ${cx-s(48)},${cy+s(12)} ${cx-s(32)},${cy+s(8)} ${cx-s(14)},${cy+s(2)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(12)},${cy-s(12)} C ${cx+s(30)},${cy-s(20)} ${cx+s(50)},${cy-s(12)} ${cx+s(56)},${cy+s(4)} C ${cx+s(48)},${cy+s(12)} ${cx+s(32)},${cy+s(8)} ${cx+s(14)},${cy+s(2)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        {/* wing details */}
        {[-s(30),-s(40)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(8)} L ${cx+x-s(8)},${cy+s(4)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>)}
        {[s(30),s(40)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(8)} L ${cx+x+s(8)},${cy+s(4)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>)}
        {/* white robe */}
        <path d={`M ${cx-s(16)},${cy-s(14)} C ${cx-s(20)},${cy-s(2)} ${cx-s(20)},${cy+s(14)} ${cx-s(18)},${cy+s(34)} C ${cx-s(14)},${cy+s(56)} ${cx-s(8)},${cy+s(72)} ${cx-s(4)},${cy+s(86)} L ${cx+s(4)},${cy+s(86)} C ${cx+s(8)},${cy+s(72)} ${cx+s(14)},${cy+s(56)} ${cx+s(18)},${cy+s(34)} C ${cx+s(20)},${cy+s(14)} ${cx+s(20)},${cy-s(2)} ${cx+s(16)},${cy-s(14)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* blue surcoat */}
        <path d={`M ${cx-s(10)},${cy-s(14)} C ${cx-s(12)},${cy-s(4)} ${cx-s(12)},${cy+s(8)} ${cx-s(10)},${cy+s(22)} L ${cx+s(10)},${cy+s(22)} C ${cx+s(12)},${cy+s(8)} ${cx+s(12)},${cy-s(4)} ${cx+s(10)},${cy-s(14)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* left arm + vessel pouring */}
        <path d={`M ${cx-s(12)},${cy-s(6)} C ${cx-s(22)},${cy-s(8)} ${cx-s(34)},${cy-s(4)} ${cx-s(40)},${cy+s(4)} C ${cx-s(34)},${cy+s(10)} ${cx-s(24)},${cy+s(8)} ${cx-s(14)},${cy+s(2)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left vessel */}
        <path d={`M ${cx-s(48)},${cy-s(6)} L ${cx-s(54)},${cy-s(6)} L ${cx-s(56)},${cy+s(10)} L ${cx-s(46)},${cy+s(10)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(54)},${cy-s(6)} L ${cx-s(58)},${cy-s(10)} L ${cx-s(44)},${cy-s(10)} L ${cx-s(48)},${cy-s(6)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* right arm + vessel */}
        <path d={`M ${cx+s(12)},${cy-s(6)} C ${cx+s(22)},${cy-s(4)} ${cx+s(32)},${cy+s(2)} ${cx+s(36)},${cy+s(12)} C ${cx+s(28)},${cy+s(18)} ${cx+s(18)},${cy+s(14)} ${cx+s(10)},${cy+s(6)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* right vessel tilted */}
        <path d={`M ${cx+s(36)},${cy+s(10)} L ${cx+s(44)},${cy+s(6)} L ${cx+s(50)},${cy+s(20)} L ${cx+s(42)},${cy+s(24)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* water stream */}
        <path d={`M ${cx-s(48)},${cy+s(10)} C ${cx-s(40)},${cy+s(24)} ${cx-s(20)},${cy+s(32)} ${cx},${cy+s(36)} C ${cx+s(20)},${cy+s(40)} ${cx+s(36)},${cy+s(36)} ${cx+s(44)},${cy+s(24)}`} fill="none" stroke={BLUE} strokeWidth={s(2)} strokeDasharray={`${s(4)},${s(2)}`}/>
        {/* head */}
        <path d={`M ${cx},${cy-s(34)} C ${cx-s(12)},${cy-s(34)} ${cx-s(14)},${cy-s(24)} ${cx-s(14)},${cy-s(18)} C ${cx-s(14)},${cy-s(12)} ${cx-s(8)},${cy-s(8)} ${cx},${cy-s(8)} C ${cx+s(8)},${cy-s(8)} ${cx+s(14)},${cy-s(12)} ${cx+s(14)},${cy-s(18)} C ${cx+s(14)},${cy-s(24)} ${cx+s(12)},${cy-s(34)} ${cx},${cy-s(34)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(12)},${cy-s(30)} C ${cx-s(16)},${cy-s(22)} ${cx-s(10)},${cy-s(14)} ${cx-s(8)},${cy-s(10)} C ${cx-s(16)},${cy-s(12)} ${cx-s(22)},${cy-s(20)} ${cx-s(18)},${cy-s(30)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(12)},${cy-s(30)} C ${cx+s(16)},${cy-s(22)} ${cx+s(10)},${cy-s(14)} ${cx+s(8)},${cy-s(10)} C ${cx+s(16)},${cy-s(12)} ${cx+s(22)},${cy-s(20)} ${cx+s(18)},${cy-s(30)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(5)} cy={cy-s(20)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(5)} cy={cy-s(20)} r={s(1.5)} fill={INK}/>
        <path d={`M ${cx-s(3)},${cy-s(13)} C ${cx},${cy-s(10)} ${cx+s(4)},${cy-s(11)} ${cx+s(6)},${cy-s(13)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    15: (
      <g>
        {/* Le Diable Â· The Devil */}
        {/* dark pedestal */}
        <path d={`M ${cx-s(28)},${cy+s(26)} L ${cx-s(28)},${cy+s(88)} L ${cx+s(28)},${cy+s(88)} L ${cx+s(28)},${cy+s(26)} Z`} fill={INK}/>
        <path d={`M ${cx-s(22)},${cy+s(14)} L ${cx-s(22)},${cy+s(28)} L ${cx+s(22)},${cy+s(28)} L ${cx+s(22)},${cy+s(14)} Z`} fill={INK}/>
        <path d={`M ${cx-s(16)},${cy+s(4)} L ${cx-s(16)},${cy+s(16)} L ${cx+s(16)},${cy+s(16)} L ${cx+s(16)},${cy+s(4)} Z`} fill={INK}/>
        {/* bat wings */}
        <path d={`M ${cx-s(10)},${cy-s(18)} C ${cx-s(28)},${cy-s(30)} ${cx-s(54)},${cy-s(24)} ${cx-s(64)},${cy-s(4)} C ${cx-s(60)},${cy+s(10)} ${cx-s(42)},${cy+s(12)} ${cx-s(14)},${cy+s(4)} Z`} fill={INK} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(10)},${cy-s(18)} C ${cx+s(28)},${cy-s(30)} ${cx+s(54)},${cy-s(24)} ${cx+s(64)},${cy-s(4)} C ${cx+s(60)},${cy+s(10)} ${cx+s(42)},${cy+s(12)} ${cx+s(14)},${cy+s(4)} Z`} fill={INK} stroke={INK} strokeWidth={s(1)}/>
        {/* wing membrane lines */}
        {[-s(36),-s(48)].map((x,i)=><path key={i} d={`M ${cx-s(10)},${cy-s(10)} L ${cx+x},${cy+s(4)}`} fill="none" stroke={YEL} strokeWidth={s(0.8)} opacity="0.6"/>)}
        {[s(36),s(48)].map((x,i)=><path key={i} d={`M ${cx+s(10)},${cy-s(10)} L ${cx+x},${cy+s(4)}`} fill="none" stroke={YEL} strokeWidth={s(0.8)} opacity="0.6"/>)}
        {/* beast body */}
        <path d={`M ${cx-s(14)},${cy-s(18)} C ${cx-s(18)},${cy-s(6)} ${cx-s(18)},${cy+s(8)} ${cx-s(14)},${cy+s(16)} L ${cx+s(14)},${cy+s(16)} C ${cx+s(18)},${cy+s(8)} ${cx+s(18)},${cy-s(6)} ${cx+s(14)},${cy-s(18)} Z`} fill={INK}/>
        {/* right arm holding torch */}
        <path d={`M ${cx+s(14)},${cy-s(12)} C ${cx+s(22)},${cy-s(14)} ${cx+s(30)},${cy-s(10)} ${cx+s(34)},${cy-s(4)} C ${cx+s(28)},${cy+s(2)} ${cx+s(20)},${cy+s(2)} ${cx+s(12)},${cy-s(4)} Z`} fill={INK}/>
        <line x1={cx+s(34)} y1={cy-s(4)} x2={cx+s(34)} y2={cy-s(54)} stroke={INK} strokeWidth={s(3)} strokeLinecap="round"/>
        <path d={`M ${cx+s(30)},${cy-s(54)} C ${cx+s(28)},${cy-s(66)} ${cx+s(32)},${cy-s(72)} ${cx+s(36)},${cy-s(68)} C ${cx+s(40)},${cy-s(64)} ${cx+s(38)},${cy-s(54)} ${cx+s(34)},${cy-s(52)} Z`} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M ${cx+s(31)},${cy-s(54)} C ${cx+s(30)},${cy-s(62)} ${cx+s(34)},${cy-s(68)} ${cx+s(36)},${cy-s(64)} C ${cx+s(36)},${cy-s(58)} ${cx+s(35)},${cy-s(54)} ${cx+s(34)},${cy-s(52)} Z`} fill={RED}/>
        {/* left arm down */}
        <path d={`M ${cx-s(14)},${cy-s(12)} C ${cx-s(22)},${cy-s(8)} ${cx-s(30)},${cy-s(2)} ${cx-s(32)},${cy+s(6)} C ${cx-s(26)},${cy+s(12)} ${cx-s(18)},${cy+s(10)} ${cx-s(12)},${cy+s(4)} Z`} fill={INK}/>
        {/* head with horns */}
        <path d={`M ${cx},${cy-s(36)} C ${cx-s(14)},${cy-s(36)} ${cx-s(16)},${cy-s(26)} ${cx-s(16)},${cy-s(20)} C ${cx-s(16)},${cy-s(14)} ${cx-s(10)},${cy-s(10)} ${cx},${cy-s(10)} C ${cx+s(10)},${cy-s(10)} ${cx+s(16)},${cy-s(14)} ${cx+s(16)},${cy-s(20)} C ${cx+s(16)},${cy-s(26)} ${cx+s(14)},${cy-s(36)} ${cx},${cy-s(36)} Z`} fill={INK}/>
        {/* horns */}
        <path d={`M ${cx-s(16)},${cy-s(28)} C ${cx-s(20)},${cy-s(42)} ${cx-s(14)},${cy-s(56)} ${cx-s(8)},${cy-s(60)} C ${cx-s(6)},${cy-s(52)} ${cx-s(8)},${cy-s(44)} ${cx-s(12)},${cy-s(36)} Z`} fill={INK}/>
        <path d={`M ${cx+s(16)},${cy-s(28)} C ${cx+s(20)},${cy-s(42)} ${cx+s(14)},${cy-s(56)} ${cx+s(8)},${cy-s(60)} C ${cx+s(6)},${cy-s(52)} ${cx+s(8)},${cy-s(44)} ${cx+s(12)},${cy-s(36)} Z`} fill={INK}/>
        <circle cx={cx-s(6)} cy={cy-s(24)} r={s(2.5)} fill={YEL}/>
        <circle cx={cx+s(6)} cy={cy-s(24)} r={s(2.5)} fill={YEL}/>
        {/* two chained small figures */}
        {[-s(34),s(22)].map((ox,i)=>(
          <g key={i}>
            <path d={`M ${cx+ox-s(7)},${cy+s(40)} C ${cx+ox-s(9)},${cy+s(30)} ${cx+ox+s(9)},${cy+s(30)} ${cx+ox+s(7)},${cy+s(40)} L ${cx+ox+s(7)},${cy+s(80)} L ${cx+ox-s(7)},${cy+s(80)} Z`} fill={i===0?RED:BLUE} stroke={INK} strokeWidth={s(1)}/>
            <path d={`M ${cx+ox},${cy+s(30)} C ${cx+ox-s(7)},${cy+s(30)} ${cx+ox-s(8)},${cy+s(24)} ${cx+ox-s(8)},${cy+s(20)} C ${cx+ox-s(8)},${cy+s(16)} ${cx+ox-s(4)},${cy+s(14)} ${cx+ox},${cy+s(14)} C ${cx+ox+s(4)},${cy+s(14)} ${cx+ox+s(8)},${cy+s(16)} ${cx+ox+s(8)},${cy+s(20)} C ${cx+ox+s(8)},${cy+s(24)} ${cx+ox+s(7)},${cy+s(30)} ${cx+ox},${cy+s(30)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
            {/* chain */}
            <path d={`M ${cx+ox},${cy+s(28)} C ${cx+ox+(i===0?s(16):s(-16))},${cy+s(26)} ${cx+(i===0?-s(16):s(8))},${cy+s(22)} ${cx},${cy+s(18)}`} fill="none" stroke={INK} strokeWidth={s(1)} strokeDasharray={`${s(2)},${s(2)}`}/>
          </g>
        ))}
      </g>
    ),
    16: (
      <g>
        {/* La Maison Dieu Â· The Tower */}
        {/* dark storm sky */}
        <path d={`M ${s(4)},${s(4)} L ${w-s(4)},${s(4)} L ${w-s(4)},${cy-s(10)} L ${s(4)},${cy-s(10)} Z`} fill="#2A1A2A" stroke="none"/>
        {/* stone tower */}
        <path d={`M ${cx-s(22)},${cy-s(10)} L ${cx-s(22)},${cy+s(88)} L ${cx+s(22)},${cy+s(88)} L ${cx+s(22)},${cy-s(10)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {/* stone texture */}
        {[-s(60),-s(40),-s(20),0,s(20),s(40),s(60),s(80)].map((y,i)=>(
          <g key={i}>
            <line x1={cx-s(22)} y1={cy+y} x2={cx+s(22)} y2={cy+y} stroke={INK} strokeWidth={s(0.5)}/>
            {(i%2===0?[-s(11),s(11)]:[-s(22),0]).map((x,j)=><line key={j} x1={cx+x} y1={cy+y} x2={cx+x} y2={cy+y-s(20)} stroke={INK} strokeWidth={s(0.4)}/>)}
          </g>
        ))}
        {/* battlements */}
        {[-s(16),-s(4),s(8)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(10)} L ${cx+x},${cy-s(26)} L ${cx+x+s(8)},${cy-s(26)} L ${cx+x+s(8)},${cy-s(10)}`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>)}
        {/* crown flying off */}
        <path d={`M ${cx-s(8)},${cy-s(38)} L ${cx-s(4)},${cy-s(50)} L ${cx},${cy-s(42)} L ${cx+s(4)},${cy-s(52)} L ${cx+s(8)},${cy-s(40)} L ${cx+s(12)},${cy-s(38)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)} style={{transform:`rotate(-20deg)`,transformOrigin:`${cx}px ${cy-s(44)}px`}}/>
        {/* lightning bolt */}
        <path d={`M ${cx+s(36)},${cy-s(80)} L ${cx+s(18)},${cy-s(44)} L ${cx+s(26)},${cy-s(40)} L ${cx+s(8)},${cy-s(4)}`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* flames at top */}
        {[-s(10),0,s(10)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(26)} C ${cx+x-s(4)},${cy-s(38)} ${cx+x},${cy-s(46)} ${cx+x+s(2)},${cy-s(44)} C ${cx+x+s(4)},${cy-s(42)} ${cx+x+s(4)},${cy-s(32)} ${cx+x+s(6)},${cy-s(26)} Z`} fill={i%2===0?YEL:RED}/>)}
        {/* window */}
        <path d={`M ${cx-s(6)},${cy+s(8)} L ${cx-s(6)},${cy+s(26)} C ${cx-s(6)},${cy+s(30)} ${cx+s(6)},${cy+s(30)} ${cx+s(6)},${cy+s(26)} L ${cx+s(6)},${cy+s(8)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* left falling figure */}
        <path d={`M ${cx-s(40)},${cy-s(14)} C ${cx-s(46)},${cy-s(4)} ${cx-s(46)},${cy+s(10)} ${cx-s(40)},${cy+s(20)} L ${cx-s(28)},${cy+s(20)} C ${cx-s(22)},${cy+s(10)} ${cx-s(22)},${cy-s(4)} ${cx-s(28)},${cy-s(14)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(34)},${cy-s(30)} C ${cx-s(42)},${cy-s(30)} ${cx-s(44)},${cy-s(22)} ${cx-s(44)},${cy-s(16)} C ${cx-s(44)},${cy-s(10)} ${cx-s(40)},${cy-s(6)} ${cx-s(34)},${cy-s(6)} C ${cx-s(28)},${cy-s(6)} ${cx-s(24)},${cy-s(10)} ${cx-s(24)},${cy-s(16)} C ${cx-s(24)},${cy-s(22)} ${cx-s(26)},${cy-s(30)} ${cx-s(34)},${cy-s(30)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* right falling figure */}
        <path d={`M ${cx+s(26)},${cy+s(6)} C ${cx+s(20)},${cy+s(18)} ${cx+s(22)},${cy+s(34)} ${cx+s(30)},${cy+s(42)} L ${cx+s(42)},${cy+s(36)} C ${cx+s(48)},${cy+s(24)} ${cx+s(46)},${cy+s(10)} ${cx+s(36)},${cy+s(4)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(28)},${cy-s(8)} C ${cx+s(20)},${cy-s(8)} ${cx+s(18)},${cy} ${cx+s(18)},${cy+s(6)} C ${cx+s(18)},${cy+s(12)} ${cx+s(22)},${cy+s(16)} ${cx+s(28)},${cy+s(16)} C ${cx+s(34)},${cy+s(16)} ${cx+s(38)},${cy+s(12)} ${cx+s(38)},${cy+s(6)} C ${cx+s(38)},${cy} ${cx+s(36)},${cy-s(8)} ${cx+s(28)},${cy-s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
      </g>
    ),
    17: (
      <g>
        {/* L'Ã‰toile Â· The Star */}
        {/* night sky */}
        <path d={`M ${s(4)},${s(4)} L ${w-s(4)},${s(4)} L ${w-s(4)},${cy+s(20)} L ${s(4)},${cy+s(20)} Z`} fill="#0C0818" stroke="none"/>
        {/* large 8-pointed star */}
        {[0,45,90,135,180,225,270,315].map(a=><path key={a} d={`M ${cx},${cy-s(68)} L ${cx+Math.cos(a*Math.PI/180)*s(26)},${cy-s(68)+Math.sin(a*Math.PI/180)*s(26)} L ${cx+Math.cos((a+22.5)*Math.PI/180)*s(12)},${cy-s(68)+Math.sin((a+22.5)*Math.PI/180)*s(12)}`} fill={YEL} stroke={INK} strokeWidth={s(0.6)}/>)}
        <circle cx={cx} cy={cy-s(68)} r={s(8)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* 7 small stars */}
        {[[-s(36),-s(86)],[s(32),-s(82)],[-s(50),-s(64)],[s(46),-s(60)],[-s(38),-s(44)],[s(40),-s(42)],[s(10),-s(54)]].map(([dx,dy],i)=>(
          <g key={i}>
            <line x1={cx+dx} y1={cy+dy-s(5)} x2={cx+dx} y2={cy+dy+s(5)} stroke={YEL} strokeWidth={s(1.2)}/>
            <line x1={cx+dx-s(5)} y1={cy+dy} x2={cx+dx+s(5)} y2={cy+dy} stroke={YEL} strokeWidth={s(1.2)}/>
          </g>
        ))}
        {/* ground and pool */}
        <path d={`M ${s(4)},${cy+s(18)} L ${w-s(4)},${cy+s(18)} L ${w-s(4)},${cy+s(88)} L ${s(4)},${cy+s(88)} Z`} fill={GRN} stroke="none"/>
        <path d={`M ${cx-s(36)},${cy+s(70)} C ${cx-s(36)},${cy+s(60)} ${cx+s(36)},${cy+s(60)} ${cx+s(36)},${cy+s(70)} C ${cx+s(36)},${cy+s(80)} ${cx-s(36)},${cy+s(80)} ${cx-s(36)},${cy+s(70)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* tree with bird */}
        <line x1={cx+s(54)} y1={cy+s(88)} x2={cx+s(54)} y2={cy-s(12)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>
        <path d={`M ${cx+s(54)},${cy-s(12)} C ${cx+s(40)},${cy-s(16)} ${cx+s(36)},${cy-s(8)} ${cx+s(40)},${cy-s(2)} C ${cx+s(48)},${cy+s(4)} ${cx+s(58)},${cy-s(2)} ${cx+s(56)},${cy-s(12)} Z`} fill={GRN} stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx+s(58)} cy={cy-s(16)} rx={s(5)} ry={s(3)} fill={INK}/>
        <path d={`M ${cx+s(63)},${cy-s(16)} L ${cx+s(68)},${cy-s(18)}`} stroke={INK} strokeWidth={s(1)}/>
        {/* kneeling naked figure */}
        {/* lower leg (kneel) */}
        <path d={`M ${cx-s(14)},${cy+s(38)} C ${cx-s(18)},${cy+s(46)} ${cx-s(24)},${cy+s(56)} ${cx-s(28)},${cy+s(72)} L ${cx-s(18)},${cy+s(72)} L ${cx-s(16)},${cy+s(56)} L ${cx-s(10)},${cy+s(38)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(6)},${cy+s(38)} C ${cx+s(4)},${cy+s(46)} ${cx},${cy+s(56)} ${cx-s(4)},${cy+s(72)} L ${cx+s(6)},${cy+s(72)} L ${cx+s(12)},${cy+s(56)} L ${cx+s(14)},${cy+s(38)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* torso */}
        <path d={`M ${cx-s(12)},${cy+s(6)} C ${cx-s(16)},${cy+s(14)} ${cx-s(16)},${cy+s(26)} ${cx-s(14)},${cy+s(40)} L ${cx+s(14)},${cy+s(40)} C ${cx+s(16)},${cy+s(26)} ${cx+s(16)},${cy+s(14)} ${cx+s(12)},${cy+s(6)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left arm pouring to ground */}
        <path d={`M ${cx-s(10)},${cy+s(14)} C ${cx-s(20)},${cy+s(14)} ${cx-s(34)},${cy+s(22)} ${cx-s(40)},${cy+s(32)} C ${cx-s(34)},${cy+s(38)} ${cx-s(24)},${cy+s(36)} ${cx-s(14)},${cy+s(26)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(46)},${cy+s(28)} L ${cx-s(52)},${cy+s(28)} L ${cx-s(54)},${cy+s(42)} L ${cx-s(48)},${cy+s(42)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(52)},${cy+s(40)} C ${cx-s(48)},${cy+s(56)} ${cx-s(38)},${cy+s(66)} ${cx-s(26)},${cy+s(72)}`} fill="none" stroke={BLUE} strokeWidth={s(1.5)}/>
        {/* right arm pouring to pool */}
        <path d={`M ${cx+s(10)},${cy+s(14)} C ${cx+s(20)},${cy+s(18)} ${cx+s(32)},${cy+s(26)} ${cx+s(36)},${cy+s(36)} C ${cx+s(28)},${cy+s(42)} ${cx+s(18)},${cy+s(40)} ${cx+s(12)},${cy+s(30)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(38)},${cy+s(32)} L ${cx+s(44)},${cy+s(32)} L ${cx+s(46)},${cy+s(46)} L ${cx+s(40)},${cy+s(46)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(44)},${cy+s(44)} C ${cx+s(38)},${cy+s(58)} ${cx+s(26)},${cy+s(68)} ${cx+s(14)},${cy+s(72)}`} fill="none" stroke={BLUE} strokeWidth={s(1.5)}/>
        {/* head */}
        <path d={`M ${cx+s(2)},${cy-s(8)} C ${cx-s(10)},${cy-s(8)} ${cx-s(12)},${cy} ${cx-s(12)},${cy+s(6)} C ${cx-s(12)},${cy+s(12)} ${cx-s(7)},${cy+s(16)} ${cx+s(2)},${cy+s(16)} C ${cx+s(11)},${cy+s(16)} ${cx+s(16)},${cy+s(12)} ${cx+s(16)},${cy+s(6)} C ${cx+s(16)},${cy} ${cx+s(14)},${cy-s(8)} ${cx+s(2)},${cy-s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(12)},${cy+s(4)} C ${cx-s(16)},${cy-s(8)} ${cx-s(8)},${cy-s(16)} ${cx+s(2)},${cy-s(16)} C ${cx+s(10)},${cy-s(16)} ${cx+s(16)},${cy-s(10)} ${cx+s(14)},${cy-s(2)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(2)} cy={cy+s(4)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy+s(4)} r={s(1.5)} fill={INK}/>
      </g>
    ),
    18: (
      <g>
        {/* La Lune Â· The Moon */}
        {/* night sky */}
        <path d={`M ${s(4)},${s(4)} L ${w-s(4)},${s(4)} L ${w-s(4)},${cy+s(10)} L ${s(4)},${cy+s(10)} Z`} fill="#08040C" stroke="none"/>
        {/* moon face */}
        <path d={`M ${cx},${cy-s(70)} C ${cx-s(22)},${cy-s(70)} ${cx-s(26)},${cy-s(56)} ${cx-s(26)},${cy-s(48)} C ${cx-s(26)},${cy-s(40)} ${cx-s(14)},${cy-s(34)} ${cx},${cy-s(34)} C ${cx+s(14)},${cy-s(34)} ${cx+s(26)},${cy-s(40)} ${cx+s(26)},${cy-s(48)} C ${cx+s(26)},${cy-s(56)} ${cx+s(22)},${cy-s(70)} ${cx},${cy-s(70)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {/* crescent shadow */}
        <path d={`M ${cx+s(4)},${cy-s(70)} C ${cx+s(16)},${cy-s(68)} ${cx+s(26)},${cy-s(58)} ${cx+s(26)},${cy-s(48)} C ${cx+s(26)},${cy-s(38)} ${cx+s(18)},${cy-s(34)} ${cx+s(8)},${cy-s(34)} C ${cx+s(18)},${cy-s(38)} ${cx+s(22)},${cy-s(46)} ${cx+s(20)},${cy-s(54)} C ${cx+s(18)},${cy-s(64)} ${cx+s(12)},${cy-s(70)} ${cx+s(4)},${cy-s(70)} Z`} fill={PARCHMENT} stroke="none"/>
        {/* moon face features */}
        <path d={`M ${cx-s(16)},${cy-s(54)} C ${cx-s(18)},${cy-s(50)} ${cx-s(14)},${cy-s(48)} ${cx-s(10)},${cy-s(50)} C ${cx-s(8)},${cy-s(52)} ${cx-s(8)},${cy-s(56)} ${cx-s(12)},${cy-s(58)} Z`} fill={INK}/>
        <path d={`M ${cx-s(16)},${cy-s(44)} C ${cx-s(10)},${cy-s(40)} ${cx-s(2)},${cy-s(40)} ${cx+s(2)},${cy-s(44)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <path d={`M ${cx-s(8)},${cy-s(50)} L ${cx-s(6)},${cy-s(46)}`} stroke={INK} strokeWidth={s(0.9)}/>
        {/* yod drops */}
        {[-s(16),-s(6),s(4),s(14)].map((x,i)=><path key={i} d={`M ${cx+x},${cy-s(30)} C ${cx+x},${cy-s(24)} ${cx+x+s(2)},${cy-s(20)} ${cx+x+s(1)},${cy-s(16)}`} fill="none" stroke={YEL} strokeWidth={s(1.5)}/>)}
        {/* two towers */}
        {[cx-s(44),cx+s(34)].map((x,i)=>(
          <g key={i}>
            <path d={`M ${x},${cy+s(10)} L ${x},${cy+s(88)} L ${x+s(16)},${cy+s(88)} L ${x+s(16)},${cy+s(10)} Z`} fill={INK}/>
            {[-s(4),s(4)].map((bx,j)=><path key={j} d={`M ${x+bx+s(3)},${cy+s(10)} L ${x+bx+s(3)},${cy-s(2)} L ${x+bx+s(7)},${cy-s(2)} L ${x+bx+s(7)},${cy+s(10)}`} fill={INK}/>)}
          </g>
        ))}
        {/* path/road */}
        <path d={`M ${cx-s(8)},${cy+s(88)} C ${cx-s(4)},${cy+s(60)} ${cx+s(4)},${cy+s(40)} ${cx+s(2)},${cy+s(10)}`} fill="none" stroke={PARCHMENT} strokeWidth={s(4)}/>
        {/* pool */}
        <path d={`M ${cx-s(34)},${cy+s(80)} C ${cx-s(34)},${cy+s(70)} ${cx+s(34)},${cy+s(70)} ${cx+s(34)},${cy+s(80)} C ${cx+s(34)},${cy+s(90)} ${cx-s(34)},${cy+s(90)} ${cx-s(34)},${cy+s(80)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* crayfish */}
        <path d={`M ${cx-s(8)},${cy+s(78)} C ${cx-s(12)},${cy+s(72)} ${cx-s(8)},${cy+s(68)} ${cx},${cy+s(70)} C ${cx+s(8)},${cy+s(72)} ${cx+s(10)},${cy+s(76)} ${cx+s(6)},${cy+s(80)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {[-s(14),-s(6),s(6),s(14)].map((x,i)=><line key={i} x1={cx+x} y1={cy+s(74)} x2={cx+x+(i<2?-s(6):s(6))} y2={cy+s(68)} stroke={RED} strokeWidth={s(1.5)}/>)}
        {/* dog left */}
        <path d={`M ${cx-s(44)},${cy+s(48)} C ${cx-s(52)},${cy+s(44)} ${cx-s(54)},${cy+s(36)} ${cx-s(50)},${cy+s(28)} C ${cx-s(46)},${cy+s(22)} ${cx-s(38)},${cy+s(22)} ${cx-s(32)},${cy+s(28)} L ${cx-s(30)},${cy+s(22)} C ${cx-s(26)},${cy+s(16)} ${cx-s(22)},${cy+s(14)} ${cx-s(18)},${cy+s(18)} L ${cx-s(18)},${cy+s(48)} C ${cx-s(26)},${cy+s(56)} ${cx-s(38)},${cy+s(56)} ${cx-s(44)},${cy+s(48)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(30)},${cy+s(20)} C ${cx-s(30)},${cy+s(12)} ${cx-s(26)},${cy+s(8)} ${cx-s(22)},${cy+s(10)} C ${cx-s(18)},${cy+s(12)} ${cx-s(16)},${cy+s(16)} ${cx-s(18)},${cy+s(20)} Z`} fill={YEL} stroke={INK} strokeWidth={sw}/>
        <circle cx={cx-s(20)} cy={cy+s(14)} r={s(1.5)} fill={INK}/>
        <line x1={cx-s(18)} y1={cy+s(18)} x2={cx-s(16)} y2={cy+s(10)} stroke={INK} strokeWidth={s(1)}/>
        {[cx-s(42),cx-s(34),cx-s(26),cx-s(20)].map((x,i)=><line key={i} x1={x} y1={cy+s(54)} x2={x+(i%2?s(2):-s(2))} y2={cy+s(70)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>)}
        {/* wolf right */}
        <path d={`M ${cx+s(34)},${cy+s(48)} C ${cx+s(42)},${cy+s(44)} ${cx+s(44)},${cy+s(36)} ${cx+s(40)},${cy+s(28)} C ${cx+s(36)},${cy+s(22)} ${cx+s(28)},${cy+s(22)} ${cx+s(22)},${cy+s(28)} L ${cx+s(20)},${cy+s(22)} C ${cx+s(16)},${cy+s(16)} ${cx+s(12)},${cy+s(14)} ${cx+s(8)},${cy+s(18)} L ${cx+s(8)},${cy+s(48)} C ${cx+s(16)},${cy+s(56)} ${cx+s(28)},${cy+s(56)} ${cx+s(34)},${cy+s(48)} Z`} fill={INK}/>
        <path d={`M ${cx+s(20)},${cy+s(20)} C ${cx+s(20)},${cy+s(12)} ${cx+s(16)},${cy+s(8)} ${cx+s(12)},${cy+s(10)} C ${cx+s(8)},${cy+s(12)} ${cx+s(6)},${cy+s(16)} ${cx+s(8)},${cy+s(20)} Z`} fill={INK}/>
        <path d={`M ${cx+s(18)},${cy+s(12)} L ${cx+s(16)},${cy+s(6)} M ${cx+s(12)},${cy+s(10)} L ${cx+s(10)},${cy+s(4)}`} stroke={INK} strokeWidth={s(1.5)}/>
        <circle cx={cx+s(9)} cy={cy+s(14)} r={s(1.5)} fill={YEL}/>
        {[cx+s(32),cx+s(24),cx+s(16),cx+s(10)].map((x,i)=><line key={i} x1={x} y1={cy+s(54)} x2={x+(i%2?-s(2):s(2))} y2={cy+s(70)} stroke={INK} strokeWidth={s(2.5)} strokeLinecap="round"/>)}
      </g>
    ),
    19: (
      <g>
        {/* Le Soleil Â· The Sun */}
        {/* sun */}
        <circle cx={cx} cy={cy-s(56)} r={s(28)} fill={YEL} stroke={INK} strokeWidth={sw}/>
        {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((a,i)=>(
          <line key={a}
            x1={cx+Math.cos(a*Math.PI/180)*s(28)} y1={cy-s(56)+Math.sin(a*Math.PI/180)*s(28)}
            x2={cx+Math.cos(a*Math.PI/180)*s(i%2===0?40:34)} y2={cy-s(56)+Math.sin(a*Math.PI/180)*s(i%2===0?40:34)}
            stroke={INK} strokeWidth={s(i%2===0?1.4:0.8)}/>
        ))}
        {/* sun face */}
        <circle cx={cx-s(8)} cy={cy-s(58)} r={s(2.5)} fill={INK}/>
        <circle cx={cx+s(8)} cy={cy-s(58)} r={s(2.5)} fill={INK}/>
        <path d={`M ${cx-s(6)},${cy-s(50)} C ${cx-s(2)},${cy-s(46)} ${cx+s(2)},${cy-s(46)} ${cx+s(6)},${cy-s(50)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <path d={`M ${cx-s(2)},${cy-s(58)} L ${cx},${cy-s(54)} L ${cx+s(2)},${cy-s(58)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* low wall */}
        <path d={`M ${cx-s(54)},${cy+s(18)} L ${cx+s(54)},${cy+s(18)} L ${cx+s(54)},${cy+s(32)} L ${cx-s(54)},${cy+s(32)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={sw}/>
        {[-s(36),-s(12),s(12),s(36)].map((x,i)=>(
          <g key={i}>
            <line x1={cx+x} y1={cy+s(18)} x2={cx+x} y2={cy+s(32)} stroke={INK} strokeWidth={s(0.6)}/>
            <line x1={cx+x} y1={cy+s(25)} x2={cx+x+s(24)} y2={cy+s(25)} stroke={INK} strokeWidth={s(0.4)}/>
          </g>
        ))}
        {/* ground */}
        <path d={`M ${cx-s(54)},${cy+s(32)} L ${cx+s(54)},${cy+s(32)} L ${cx+s(54)},${cy+s(88)} L ${cx-s(54)},${cy+s(88)} Z`} fill={GRN} stroke="none"/>
        {/* left child */}
        <path d={`M ${cx-s(24)},${cy+s(32)} C ${cx-s(28)},${cy+s(40)} ${cx-s(28)},${cy+s(52)} ${cx-s(24)},${cy+s(66)} L ${cx-s(12)},${cy+s(66)} C ${cx-s(8)},${cy+s(52)} ${cx-s(8)},${cy+s(40)} ${cx-s(12)},${cy+s(32)} Z`} fill={RED} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(18)},${cy+s(20)} C ${cx-s(26)},${cy+s(20)} ${cx-s(28)},${cy+s(26)} ${cx-s(28)},${cy+s(32)} C ${cx-s(28)},${cy+s(38)} ${cx-s(24)},${cy+s(42)} ${cx-s(18)},${cy+s(42)} C ${cx-s(12)},${cy+s(42)} ${cx-s(8)},${cy+s(38)} ${cx-s(8)},${cy+s(32)} C ${cx-s(8)},${cy+s(26)} ${cx-s(10)},${cy+s(20)} ${cx-s(18)},${cy+s(20)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left child arms raised */}
        <path d={`M ${cx-s(26)},${cy+s(38)} C ${cx-s(34)},${cy+s(34)} ${cx-s(38)},${cy+s(26)} ${cx-s(36)},${cy+s(18)} C ${cx-s(30)},${cy+s(16)} ${cx-s(24)},${cy+s(22)} ${cx-s(24)},${cy+s(32)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(10)},${cy+s(38)} C ${cx-s(2)},${cy+s(34)} ${cx+s(2)},${cy+s(26)} ${cx},${cy+s(18)} C ${cx-s(6)},${cy+s(16)} ${cx-s(12)},${cy+s(22)} ${cx-s(14)},${cy+s(32)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        {/* right child */}
        <path d={`M ${cx+s(10)},${cy+s(32)} C ${cx+s(6)},${cy+s(40)} ${cx+s(6)},${cy+s(52)} ${cx+s(10)},${cy+s(66)} L ${cx+s(22)},${cy+s(66)} C ${cx+s(26)},${cy+s(52)} ${cx+s(26)},${cy+s(40)} ${cx+s(22)},${cy+s(32)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(16)},${cy+s(20)} C ${cx+s(8)},${cy+s(20)} ${cx+s(6)},${cy+s(26)} ${cx+s(6)},${cy+s(32)} C ${cx+s(6)},${cy+s(38)} ${cx+s(10)},${cy+s(42)} ${cx+s(16)},${cy+s(42)} C ${cx+s(22)},${cy+s(42)} ${cx+s(26)},${cy+s(38)} ${cx+s(26)},${cy+s(32)} C ${cx+s(26)},${cy+s(26)} ${cx+s(24)},${cy+s(20)} ${cx+s(16)},${cy+s(20)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx+s(8)},${cy+s(38)} C ${cx},${cy+s(34)} ${cx-s(4)},${cy+s(26)} ${cx-s(2)},${cy+s(18)} C ${cx+s(4)},${cy+s(16)} ${cx+s(10)},${cy+s(22)} ${cx+s(12)},${cy+s(32)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(24)},${cy+s(38)} C ${cx+s(32)},${cy+s(34)} ${cx+s(36)},${cy+s(26)} ${cx+s(34)},${cy+s(18)} C ${cx+s(28)},${cy+s(16)} ${cx+s(22)},${cy+s(22)} ${cx+s(20)},${cy+s(32)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        {/* face dots */}
        {[cx-s(18),cx+s(16)].map((x,i)=>(
          <g key={i}>
            <circle cx={x-s(4)} cy={cy+s(28)} r={s(1.5)} fill={INK}/>
            <circle cx={x+s(4)} cy={cy+s(28)} r={s(1.5)} fill={INK}/>
            <path d={`M ${x-s(3)},${cy+s(35)} C ${x},${cy+s(38)} ${x+s(3)},${cy+s(37)} ${x+s(5)},${cy+s(35)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
          </g>
        ))}
      </g>
    ),
    20: (
      <g>
        {/* Le Jugement Â· Judgement */}
        {/* clouds */}
        <path d={`M ${cx-s(56)},${cy-s(60)} C ${cx-s(38)},${cy-s(76)} ${cx-s(14)},${cy-s(74)} ${cx},${cy-s(68)} C ${cx+s(14)},${cy-s(74)} ${cx+s(38)},${cy-s(76)} ${cx+s(56)},${cy-s(60)} L ${cx+s(56)},${cy-s(48)} L ${cx-s(56)},${cy-s(48)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(56)},${cy-s(54)} C ${cx-s(42)},${cy-s(68)} ${cx-s(18)},${cy-s(66)} ${cx},${cy-s(60)}`} fill="none" stroke={INK} strokeWidth={s(0.7)}/>
        {/* angel */}
        <path d={`M ${cx-s(12)},${cy-s(56)} C ${cx-s(28)},${cy-s(64)} ${cx-s(46)},${cy-s(58)} ${cx-s(52)},${cy-s(44)} C ${cx-s(44)},${cy-s(36)} ${cx-s(28)},${cy-s(38)} ${cx-s(14)},${cy-s(44)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(12)},${cy-s(56)} C ${cx+s(28)},${cy-s(64)} ${cx+s(46)},${cy-s(58)} ${cx+s(52)},${cy-s(44)} C ${cx+s(44)},${cy-s(36)} ${cx+s(28)},${cy-s(38)} ${cx+s(14)},${cy-s(44)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(8)},${cy-s(66)} L ${cx-s(8)},${cy-s(46)} L ${cx+s(8)},${cy-s(46)} L ${cx+s(8)},${cy-s(66)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
        {/* angel head */}
        <path d={`M ${cx},${cy-s(80)} C ${cx-s(10)},${cy-s(80)} ${cx-s(12)},${cy-s(72)} ${cx-s(12)},${cy-s(66)} C ${cx-s(12)},${cy-s(60)} ${cx-s(7)},${cy-s(56)} ${cx},${cy-s(56)} C ${cx+s(7)},${cy-s(56)} ${cx+s(12)},${cy-s(60)} ${cx+s(12)},${cy-s(66)} C ${cx+s(12)},${cy-s(72)} ${cx+s(10)},${cy-s(80)} ${cx},${cy-s(80)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* nimbus */}
        <circle cx={cx} cy={cy-s(70)} r={s(14)} fill="none" stroke={YEL} strokeWidth={s(2)}/>
        {/* trumpet */}
        <line x1={cx+s(8)} y1={cy-s(62)} x2={cx+s(38)} y2={cy-s(46)} stroke={YEL} strokeWidth={s(3)} strokeLinecap="round"/>
        <path d={`M ${cx+s(36)},${cy-s(38)} C ${cx+s(44)},${cy-s(36)} ${cx+s(50)},${cy-s(44)} ${cx+s(46)},${cy-s(50)} C ${cx+s(42)},${cy-s(54)} ${cx+s(36)},${cy-s(54)} ${cx+s(34)},${cy-s(48)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* banner on trumpet */}
        <path d={`M ${cx+s(20)},${cy-s(54)} L ${cx+s(20)},${cy-s(38)} L ${cx+s(34)},${cy-s(38)} L ${cx+s(34)},${cy-s(54)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx+s(27)} y1={cy-s(54)} x2={cx+s(27)} y2={cy-s(38)} stroke={RED} strokeWidth={s(2.5)}/>
        <line x1={cx+s(20)} y1={cy-s(46)} x2={cx+s(34)} y2={cy-s(46)} stroke={RED} strokeWidth={s(2.5)}/>
        {/* water/ground line */}
        <line x1={s(6)} y1={cy+s(32)} x2={w-s(6)} y2={cy+s(32)} stroke={BLUE} strokeWidth={s(1)}/>
        {/* three rising figures from open coffins */}
        {[-s(32),0,s(32)].map((ox,i)=>(
          <g key={i}>
            {/* coffin */}
            <path d={`M ${cx+ox-s(10)},${cy+s(86)} L ${cx+ox-s(10)},${cy+s(34)} L ${cx+ox+s(10)},${cy+s(34)} L ${cx+ox+s(10)},${cy+s(86)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(1)}/>
            {/* body in coffin */}
            <path d={`M ${cx+ox-s(7)},${cy+s(34)} L ${cx+ox-s(7)},${cy+s(10)} L ${cx+ox+s(7)},${cy+s(10)} L ${cx+ox+s(7)},${cy+s(34)} Z`} fill={i===0?RED:i===1?BLUE:GRN} stroke={INK} strokeWidth={s(1)}/>
            {/* head */}
            <path d={`M ${cx+ox},${cy-s(2)} C ${cx+ox-s(8)},${cy-s(2)} ${cx+ox-s(9)},${cy+s(4)} ${cx+ox-s(9)},${cy+s(8)} C ${cx+ox-s(9)},${cy+s(12)} ${cx+ox-s(5)},${cy+s(14)} ${cx+ox},${cy+s(14)} C ${cx+ox+s(5)},${cy+s(14)} ${cx+ox+s(9)},${cy+s(12)} ${cx+ox+s(9)},${cy+s(8)} C ${cx+ox+s(9)},${cy+s(4)} ${cx+ox+s(8)},${cy-s(2)} ${cx+ox},${cy-s(2)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
            {/* arms raised */}
            <path d={`M ${cx+ox-s(6)},${cy+s(14)} C ${cx+ox-s(14)},${cy+s(12)} ${cx+ox-s(20)},${cy+s(6)} ${cx+ox-s(20)},${cy-s(2)} C ${cx+ox-s(14)},${cy-s(6)} ${cx+ox-s(8)},${cy-s(2)} ${cx+ox-s(6)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(0.9)}/>
            <path d={`M ${cx+ox+s(6)},${cy+s(14)} C ${cx+ox+s(14)},${cy+s(12)} ${cx+ox+s(20)},${cy+s(6)} ${cx+ox+s(20)},${cy-s(2)} C ${cx+ox+s(14)},${cy-s(6)} ${cx+ox+s(8)},${cy-s(2)} ${cx+ox+s(6)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(0.9)}/>
          </g>
        ))}
      </g>
    ),
    21: (
      <g>
        {/* Le Monde Â· The World */}
        {/* laurel wreath */}
        <ellipse cx={cx} cy={cy} rx={s(40)} ry={s(56)} fill="none" stroke={GRN} strokeWidth={s(10)}/>
        {/* leaf details around wreath */}
        {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340].map(a=>{
          const rx=s(40), ry=s(56);
          const x=cx+Math.cos(a*Math.PI/180)*rx, y=cy+Math.sin(a*Math.PI/180)*ry;
          const nx=cx+Math.cos((a+20)*Math.PI/180)*rx, ny=cy+Math.sin((a+20)*Math.PI/180)*ry;
          return <path key={a} d={`M ${x},${y} C ${(x+nx)/2-s(6)},${(y+ny)/2} ${(x+nx)/2+s(6)},${(y+ny)/2} ${nx},${ny}`} fill="none" stroke={INK} strokeWidth={s(0.7)}/>;
        })}
        {/* wreath ribbon top and bottom */}
        <path d={`M ${cx-s(14)},${cy-s(56)} C ${cx-s(6)},${cy-s(62)} ${cx+s(6)},${cy-s(62)} ${cx+s(14)},${cy-s(56)}`} fill={RED} stroke={INK} strokeWidth={s(2)}/>
        <path d={`M ${cx-s(14)},${cy+s(56)} C ${cx-s(6)},${cy+s(62)} ${cx+s(6)},${cy+s(62)} ${cx+s(14)},${cy+s(56)}`} fill={RED} stroke={INK} strokeWidth={s(2)}/>
        {/* dancing figure */}
        {/* right leg straight down */}
        <path d={`M ${cx+s(4)},${cy+s(8)} C ${cx+s(8)},${cy+s(18)} ${cx+s(10)},${cy+s(32)} ${cx+s(8)},${cy+s(46)} L ${cx+s(14)},${cy+s(46)} C ${cx+s(18)},${cy+s(32)} ${cx+s(18)},${cy+s(18)} ${cx+s(14)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* left leg crossed */}
        <path d={`M ${cx-s(4)},${cy+s(8)} C ${cx-s(2)},${cy+s(18)} ${cx+s(4)},${cy+s(26)} ${cx+s(4)},${cy+s(40)} L ${cx-s(2)},${cy+s(40)} C ${cx-s(6)},${cy+s(28)} ${cx-s(8)},${cy+s(18)} ${cx-s(8)},${cy+s(8)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        {/* sash/drape */}
        <path d={`M ${cx-s(10)},${cy-s(12)} C ${cx-s(18)},${cy-s(4)} ${cx-s(20)},${cy+s(8)} ${cx-s(14)},${cy+s(20)} C ${cx-s(8)},${cy+s(28)} ${cx+s(4)},${cy+s(26)} ${cx+s(8)},${cy+s(16)} C ${cx+s(14)},${cy+s(4)} ${cx+s(12)},${cy-s(8)} ${cx+s(6)},${cy-s(14)} C ${cx},${cy-s(16)} ${cx-s(6)},${cy-s(16)} ${cx-s(10)},${cy-s(12)} Z`} fill={BLUE} stroke={INK} strokeWidth={sw}/>
        {/* torso - flesh visible on sides */}
        <path d={`M ${cx-s(8)},${cy-s(16)} C ${cx-s(10)},${cy-s(8)} ${cx-s(10)},${cy+s(4)} ${cx-s(8)},${cy+s(12)} L ${cx+s(8)},${cy+s(12)} C ${cx+s(10)},${cy+s(4)} ${cx+s(10)},${cy-s(8)} ${cx+s(8)},${cy-s(16)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        {/* left arm up with wand */}
        <path d={`M ${cx-s(6)},${cy-s(12)} C ${cx-s(14)},${cy-s(18)} ${cx-s(22)},${cy-s(30)} ${cx-s(26)},${cy-s(44)} C ${cx-s(20)},${cy-s(48)} ${cx-s(14)},${cy-s(44)} ${cx-s(10)},${cy-s(32)} C ${cx-s(8)},${cy-s(22)} ${cx-s(6)},${cy-s(14)} ${cx-s(6)},${cy-s(12)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx-s(28)} y1={cy-s(44)} x2={cx-s(28)} y2={cy-s(82)} stroke={INK} strokeWidth={s(2)} strokeLinecap="round"/>
        {/* right arm out with wand */}
        <path d={`M ${cx+s(6)},${cy-s(10)} C ${cx+s(14)},${cy-s(6)} ${cx+s(24)},${cy-s(4)} ${cx+s(32)},${cy-s(10)} C ${cx+s(28)},${cy-s(16)} ${cx+s(18)},${cy-s(18)} ${cx+s(10)},${cy-s(14)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <line x1={cx+s(34)} y1={cy-s(10)} x2={cx+s(34)} y2={cy+s(28)} stroke={INK} strokeWidth={s(2)} strokeLinecap="round"/>
        {/* head */}
        <path d={`M ${cx},${cy-s(34)} C ${cx-s(10)},${cy-s(34)} ${cx-s(12)},${cy-s(24)} ${cx-s(12)},${cy-s(18)} C ${cx-s(12)},${cy-s(12)} ${cx-s(7)},${cy-s(8)} ${cx},${cy-s(8)} C ${cx+s(7)},${cy-s(8)} ${cx+s(12)},${cy-s(12)} ${cx+s(12)},${cy-s(18)} C ${cx+s(12)},${cy-s(24)} ${cx+s(10)},${cy-s(34)} ${cx},${cy-s(34)} Z`} fill={FLESH} stroke={INK} strokeWidth={sw}/>
        <path d={`M ${cx-s(12)},${cy-s(28)} C ${cx-s(16)},${cy-s(18)} ${cx-s(8)},${cy-s(10)} ${cx-s(6)},${cy-s(8)} C ${cx-s(14)},${cy-s(10)} ${cx-s(20)},${cy-s(18)} ${cx-s(16)},${cy-s(28)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx+s(12)},${cy-s(28)} C ${cx+s(16)},${cy-s(18)} ${cx+s(8)},${cy-s(10)} ${cx+s(6)},${cy-s(8)} C ${cx+s(14)},${cy-s(10)} ${cx+s(20)},${cy-s(18)} ${cx+s(16)},${cy-s(28)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(4)} cy={cy-s(22)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(4)} cy={cy-s(22)} r={s(1.5)} fill={INK}/>
        {/* four corner symbols */}
        {/* angel top-left */}
        <path d={`M ${cx-s(62)},${cy-s(72)} C ${cx-s(70)},${cy-s(72)} ${cx-s(72)},${cy-s(64)} ${cx-s(72)},${cy-s(58)} C ${cx-s(72)},${cy-s(52)} ${cx-s(68)},${cy-s(48)} ${cx-s(62)},${cy-s(48)} C ${cx-s(56)},${cy-s(48)} ${cx-s(52)},${cy-s(52)} ${cx-s(52)},${cy-s(58)} C ${cx-s(52)},${cy-s(64)} ${cx-s(54)},${cy-s(72)} ${cx-s(62)},${cy-s(72)} Z`} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(72)},${cy-s(62)} C ${cx-s(80)},${cy-s(66)} ${cx-s(82)},${cy-s(58)} ${cx-s(78)},${cy-s(52)} C ${cx-s(74)},${cy-s(48)} ${cx-s(68)},${cy-s(48)} ${cx-s(66)},${cy-s(52)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M ${cx-s(52)},${cy-s(62)} C ${cx-s(44)},${cy-s(66)} ${cx-s(42)},${cy-s(58)} ${cx-s(46)},${cy-s(52)} C ${cx-s(50)},${cy-s(48)} ${cx-s(56)},${cy-s(48)} ${cx-s(58)},${cy-s(52)} Z`} fill={PARCHMENT} stroke={INK} strokeWidth={s(0.8)}/>
        {/* eagle top-right */}
        <path d={`M ${cx+s(60)},${cy-s(70)} C ${cx+s(54)},${cy-s(76)} ${cx+s(60)},${cy-s(86)} ${cx+s(68)},${cy-s(82)} C ${cx+s(72)},${cy-s(78)} ${cx+s(70)},${cy-s(72)} ${cx+s(66)},${cy-s(68)} Z`} fill={INK}/>
        <path d={`M ${cx+s(54)},${cy-s(62)} C ${cx+s(48)},${cy-s(70)} ${cx+s(54)},${cy-s(78)} ${cx+s(62)},${cy-s(76)} C ${cx+s(66)},${cy-s(74)} ${cx+s(66)},${cy-s(68)} ${cx+s(62)},${cy-s(64)} Z`} fill={INK}/>
        <ellipse cx={cx+s(64)} cy={cy-s(62)} rx={s(10)} ry={s(8)} fill={INK}/>
        <path d={`M ${cx+s(74)},${cy-s(62)} L ${cx+s(80)},${cy-s(58)}`} stroke={INK} strokeWidth={s(1.5)}/>
        {/* bull bottom-left */}
        <ellipse cx={cx-s(60)} cy={cy+s(60)} rx={s(14)} ry={s(8)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(60)},${cy+s(52)} C ${cx-s(68)},${cy+s(52)} ${cx-s(70)},${cy+s(44)} ${cx-s(66)},${cy+s(40)} C ${cx-s(62)},${cy+s(36)} ${cx-s(56)},${cy+s(38)} ${cx-s(54)},${cy+s(44)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M ${cx-s(68)},${cy+s(46)} C ${cx-s(74)},${cy+s(42)} ${cx-s(76)},${cy+s(36)} ${cx-s(72)},${cy+s(32)}`} fill="none" stroke={INK} strokeWidth={s(1.5)} strokeLinecap="round"/>
        <path d={`M ${cx-s(52)},${cy+s(46)} C ${cx-s(46)},${cy+s(42)} ${cx-s(44)},${cy+s(36)} ${cx-s(48)},${cy+s(32)}`} fill="none" stroke={INK} strokeWidth={s(1.5)} strokeLinecap="round"/>
        {/* lion bottom-right */}
        <circle cx={cx+s(60)} cy={cy+s(58)} r={s(14)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=><path key={a} d={`M ${cx+s(60)+Math.cos(a*Math.PI/180)*s(14)},${cy+s(58)+Math.sin(a*Math.PI/180)*s(14)} L ${cx+s(60)+Math.cos(a*Math.PI/180)*s(20)},${cy+s(58)+Math.sin(a*Math.PI/180)*s(20)}`} stroke={INK} strokeWidth={s(1.5)}/>)}
        <circle cx={cx+s(56)} cy={cy+s(54)} r={s(2.5)} fill={INK}/>
        <circle cx={cx+s(64)} cy={cy+s(54)} r={s(2.5)} fill={INK}/>
        <path d={`M ${cx+s(54)},${cy+s(64)} C ${cx+s(58)},${cy+s(70)} ${cx+s(62)},${cy+s(70)} ${cx+s(66)},${cy+s(64)}`} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
      </g>
    ),
  };
  return arts[id] ?? (
    <g>
      <circle cx={cx} cy={cy} r={s(40)} fill={YEL} stroke={INK} strokeWidth={s(1.5)}/>
      <text x={cx} y={cy+s(8)} textAnchor="middle" fill={INK} fontSize={s(20)} fontFamily="Cinzel,serif">{id}</text>
    </g>
  );
}

// â”€â”€ Court card figures â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CourtArt({ rank, suit, w, h }) {
  const cx = w / 2, cy = h / 2;
  const glyph = SUIT_GLYPH[suit] || 'âœ¦';
  const sc = SUIT_COLOR[suit] || YEL;
  const isKing = rank === 'king', isQueen = rank === 'queen', isKnight = rank === 'knight';
  const robeCol = (isKing || isKnight) ? BLUE : RED;
  const mantleCol = (isKing || isKnight) ? RED : BLUE;

  return (
    <g>
      {(isKing || isQueen) && <>
        <line x1={cx-24} y1={cy-42} x2={cx-24} y2={cy+46} stroke={INK} strokeWidth="1.5"/>
        <line x1={cx+24} y1={cy-42} x2={cx+24} y2={cy+46} stroke={INK} strokeWidth="1.5"/>
        <rect x={cx-28} y={cy-46} width={10} height={8} fill={INK}/>
        <rect x={cx+18} y={cy-46} width={10} height={8} fill={INK}/>
      </>}
      {/* Head */}
      <circle cx={isKnight ? cx-6 : cx} cy={cy-28} r={8} fill={FLESH} stroke={INK} strokeWidth="1.3"/>
      {/* Crown */}
      {(isKing || isQueen) && (
        <path d={`M${cx-10},${cy-32} L${cx-7},${cy-46} L${cx},${cy-40} L${cx+7},${cy-46} L${cx+10},${cy-32}`} fill={YEL} stroke={INK} strokeWidth="1.1"/>
      )}
      {/* Hat for page */}
      {rank === 'page' && (
        <path d={`M${cx-10},${cy-32} Q${cx},${cy-46} ${cx+10},${cy-32}`} fill={sc} stroke={INK} strokeWidth="1"/>
      )}
      {/* Horse for knight */}
      {isKnight && <>
        <ellipse cx={cx+10} cy={cy+12} rx={20} ry={11} fill={RED} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx+28} y1={cy+7} x2={cx+32} y2={cy-10} stroke={INK} strokeWidth="1.1"/>
        <circle cx={cx+32} cy={cy-12} r={6} fill={FLESH} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-10} y1={cy+16} x2={cx-12} y2={cy+32} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+2} y1={cy+21} x2={cx+2} y2={cy+34} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+16} y1={cy+21} x2={cx+18} y2={cy+34} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+28} y1={cy+17} x2={cx+30} y2={cy+32} stroke={INK} strokeWidth="1.1"/>
      </>}
      {/* Body */}
      {!isKnight && <>
        <line x1={cx} y1={cy-20} x2={cx} y2={cy+8} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-13} y1={cy-11} x2={cx+13} y2={cy-11} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-13},${cy+8} L${cx-15},${cy+46} L${cx+15},${cy+46} L${cx+13},${cy+8} Z`} fill={robeCol} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx-13},${cy+8} Q${cx-22},${cy-4} ${cx-13},${cy-11}`} fill={mantleCol} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+13},${cy+8} Q${cx+22},${cy-4} ${cx+13},${cy-11}`} fill={mantleCol} stroke={INK} strokeWidth="1"/>
        <line x1={cx} y1={cy+8} x2={cx-11} y2={cy+24} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx} y1={cy+8} x2={cx+11} y2={cy+24} stroke={INK} strokeWidth="0.9"/>
      </>}
      {/* Suit symbol */}
      <text x={cx+14} y={cy+38} textAnchor="middle" fill={sc} fontSize="12" fontFamily="serif" stroke={INK} strokeWidth="0.3">{glyph}</text>
    </g>
  );
}

// â”€â”€ Pip arrangements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PipArt({ count, suit, w, h }) {
  const glyph = SUIT_GLYPH[suit] || 'âœ¦';
  const col = SUIT_COLOR[suit] || YEL;
  const layout = PIP_LAYOUTS[Math.min(count, 10)] || PIP_LAYOUTS[1];
  const areaW = w - 28, areaH = h - 56;
  const startX = 14, startY = 28;
  return (
    <g>
      {layout.map(([px, py], k) => {
        const x = startX + (px / 100) * areaW;
        const y = startY + (py / 100) * areaH;
        const flipped = py > 55;
        return (
          <text key={k} x={x} y={y + 5}
            textAnchor="middle"
            fill={col}
            stroke={INK}
            strokeWidth="0.4"
            fontSize={count === 1 ? '22' : count <= 3 ? '14' : '11'}
            fontFamily="serif"
            style={{ transform: flipped ? `rotate(180deg)` : 'none', transformOrigin: `${x}px ${y}px` }}>
            {glyph}
          </text>
        );
      })}
    </g>
  );
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
