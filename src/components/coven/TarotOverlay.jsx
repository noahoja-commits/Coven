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
  const sc = w / 192; // scale factor relative to base 192px card
  const s = (n) => n * sc; // scale a value
  const rays = (x, y, r1, r2) => [0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
    <line key={a} x1={x+Math.cos(a*Math.PI/180)*r1} y1={y+Math.sin(a*Math.PI/180)*r1}
      x2={x+Math.cos(a*Math.PI/180)*r2} y2={y+Math.sin(a*Math.PI/180)*r2}
      stroke={INK} strokeWidth={s(a%60===0?1.4:0.8)}/>
  ));

  const arts = {
    0: ( // The Fool â€” jester striding toward cliff, dog, sun, staff+bundle
      <g>
        {/* Sun upper left */}
        <circle cx={cx-s(28)} cy={cy-s(52)} r={s(18)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        {rays(cx-s(28), cy-s(52), s(18), s(26))}
        {/* Cliff edge */}
        <path d={`M${cx+s(10)},${cy+s(55)} L${cx+s(30)},${cy+s(55)} L${cx+s(30)},${cy+s(75)}`} fill="none" stroke={INK} strokeWidth={s(1.4)}/>
        <path d={`M${cx-s(40)},${cy+s(55)} L${cx+s(10)},${cy+s(55)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* Ground */}
        <path d={`M${cx-s(50)},${cy+s(58)} Q${cx-s(20)},${cy+s(54)} ${cx+s(8)},${cy+s(56)}`} fill={GRN} stroke={INK} strokeWidth={s(0.7)}/>
        {/* Body â€” jester robe */}
        <path d={`M${cx-s(10)},${cy-s(12)} L${cx-s(16)},${cy+s(40)} L${cx+s(16)},${cy+s(40)} L${cx+s(10)},${cy-s(12)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(10)} y={cy-s(10)} w={s(20)} h={s(46)} col={RED} n={7}/>
        {/* Motley patches on robe */}
        <rect x={cx-s(8)} y={cy+s(2)} width={s(6)} height={s(6)} fill={YEL} stroke={INK} strokeWidth={s(0.5)}/>
        <rect x={cx+s(2)} y={cy+s(18)} width={s(6)} height={s(6)} fill={BLUE} stroke={INK} strokeWidth={s(0.5)}/>
        {/* Left arm (back) â€” staff */}
        <line x1={cx-s(10)} y1={cy-s(8)} x2={cx-s(22)} y2={cy+s(10)} stroke={INK} strokeWidth={s(1)}/>
        <Hand x={cx-s(24)} y={cy+s(12)} dir="left"/>
        <line x1={cx-s(26)} y1={cy+s(10)} x2={cx-s(34)} y2={cy-s(32)} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Bundle on stick */}
        <ellipse cx={cx-s(34)} cy={cy-s(34)} rx={s(7)} ry={s(5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Right arm â€” white rose */}
        <line x1={cx+s(10)} y1={cy-s(8)} x2={cx+s(22)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1)}/>
        <Hand x={cx+s(24)} y={cy+s(5)} dir="right"/>
        <circle cx={cx+s(28)} cy={cy+s(2)} r={s(4)} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        <circle cx={cx+s(28)} cy={cy+s(2)} r={s(2)} fill={YEL}/>
        {/* Legs */}
        <line x1={cx-s(2)} y1={cy+s(40)} x2={cx-s(8)} y2={cy+s(60)} stroke={INK} strokeWidth={s(1.3)}/>
        <line x1={cx+s(6)} y1={cy+s(40)} x2={cx+s(14)} y2={cy+s(58)} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Shoes */}
        <path d={`M${cx-s(8)},${cy+s(60)} Q${cx-s(16)},${cy+s(64)} ${cx-s(22)},${cy+s(58)}`} fill={INK} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(14)},${cy+s(58)} Q${cx+s(22)},${cy+s(62)} ${cx+s(28)},${cy+s(56)}`} fill={INK} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Face */}
        <Face x={cx+s(2)} y={cy-s(22)} r={s(7)} hair="short" hCol={YEL}/>
        {/* Jester hat */}
        <path d={`M${cx-s(5)},${cy-s(27)} Q${cx+s(2)},${cy-s(44)} ${cx+s(16)},${cy-s(38)}`} fill={RED} stroke={INK} strokeWidth={s(0.9)}/>
        <circle cx={cx+s(17)} cy={cy-s(37)} r={s(3)} fill={YEL} stroke={INK} strokeWidth={s(0.6)}/>
        <path d={`M${cx-s(5)},${cy-s(27)} Q${cx-s(12)},${cy-s(42)} ${cx-s(4)},${cy-s(50)}`} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        <circle cx={cx-s(3)} cy={cy-s(51)} r={s(3)} fill={RED} stroke={INK} strokeWidth={s(0.6)}/>
        {/* Dog nipping heels */}
        <ellipse cx={cx+s(22)} cy={cy+s(34)} rx={s(10)} ry={s(6)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx+s(30)} cy={cy+s(30)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx+s(33)} cy={cy+s(28)} rx={s(3)} ry={s(2)} fill={FLESH} stroke={INK} strokeWidth={s(0.7)}/>
        <circle cx={cx+s(31)} cy={cy+s(29)} r={s(0.9)} fill={INK}/>
        <line x1={cx+s(12)} y1={cy+s(32)} x2={cx+s(10)} y2={cy+s(44)} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(18)} y1={cy+s(36)} x2={cx+s(16)} y2={cy+s(46)} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(28)} y1={cy+s(38)} x2={cx+s(26)} y2={cy+s(48)} stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    1: ( // The Magician â€” wand raised, tools on table, lemniscate, garden
      <g>
        {/* Garden background */}
        <path d={`M${cx-s(50)},${cy+s(60)} L${cx+s(50)},${cy+s(60)}`} stroke={INK} strokeWidth={s(0.7)}/>
        {[-s(35),-s(20),-s(5),s(10),s(25),s(38)].map((x,k)=>(
          <path key={k} d={`M${cx+x},${cy+s(60)} Q${cx+x-s(3)},${cy+s(50)} ${cx+x},${cy+s(44)} Q${cx+x+s(3)},${cy+s(50)} ${cx+x},${cy+s(60)}`} fill={GRN} stroke={INK} strokeWidth={s(0.6)}/>
        ))}
        {/* Table */}
        <rect x={cx-s(26)} y={cy+s(18)} width={s(52)} height={s(8)} rx={s(1)} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
        <line x1={cx-s(22)} y1={cy+s(26)} x2={cx-s(22)} y2={cy+s(44)} stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx+s(22)} y1={cy+s(26)} x2={cx+s(22)} y2={cy+s(44)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Tools on table: cup, sword, wand, pentacle */}
        <path d={`M${cx-s(20)},${cy+s(18)} L${cx-s(23)},${cy+s(12)} L${cx-s(17)},${cy+s(12)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(0.8)}/>
        <rect x={cx-s(22)} y={cy+s(10)} width={s(4)} height={s(2)} rx={s(1)} fill={BLUE} stroke={INK} strokeWidth={s(0.7)}/>
        <line x1={cx-s(8)} y1={cy+s(18)} x2={cx-s(8)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.3)}/>
        <polygon points={`${cx-s(8)},${cy+s(4)} ${cx-s(5)},${cy+s(8)} ${cx-s(11)},${cy+s(8)}`} fill={INK}/>
        <circle cx={cx+s(6)} cy={cy+s(14)} r={s(4)} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(3)},${cy+s(14)} L${cx+s(6)},${cy+s(10)} L${cx+s(9)},${cy+s(14)} L${cx+s(9)},${cy+s(18)} L${cx+s(3)},${cy+s(18)} Z`} fill={YEL} stroke={INK} strokeWidth={s(0.7)}/>
        <line x1={cx+s(20)} y1={cy+s(18)} x2={cx+s(20)} y2={cy-s(4)} stroke={INK} strokeWidth={s(1.1)}/>
        {/* Lemniscate (infinity) over head */}
        <path d={`M${cx-s(14)},${cy-s(44)} Q${cx-s(22)},${cy-s(54)} ${cx-s(10)},${cy-s(54)} Q${cx+s(2)},${cy-s(54)} ${cx},${cy-s(44)} Q${cx-s(2)},${cy-s(34)} ${cx+s(10)},${cy-s(34)} Q${cx+s(22)},${cy-s(34)} ${cx+s(14)},${cy-s(44)} Q${cx+s(6)},${cy-s(54)} ${cx-s(2)},${cy-s(54)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* Robe */}
        <path d={`M${cx-s(12)},${cy-s(12)} L${cx-s(18)},${cy+s(18)} L${cx+s(18)},${cy+s(18)} L${cx+s(12)},${cy-s(12)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(12)} y={cy-s(10)} w={s(24)} h={s(26)} col={RED} n={6}/>
        {/* Mantle */}
        <path d={`M${cx-s(12)},${cy-s(12)} Q${cx-s(24)},${cy-s(4)} ${cx-s(18)},${cy+s(18)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(12)},${cy-s(12)} Q${cx+s(24)},${cy-s(4)} ${cx+s(18)},${cy+s(18)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* Belt */}
        <path d={`M${cx-s(12)},${cy+s(4)} Q${cx},${cy+s(6)} ${cx+s(12)},${cy+s(4)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* Raised arm (right) with wand */}
        <line x1={cx+s(12)} y1={cy-s(8)} x2={cx+s(20)} y2={cy-s(22)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(21)} y={cy-s(24)} dir="right"/>
        <line x1={cx+s(24)} y1={cy-s(24)} x2={cx+s(18)} y2={cy-s(48)} stroke={INK} strokeWidth={s(1.4)}/>
        {/* Left arm â€” pointing down */}
        <line x1={cx-s(12)} y1={cy-s(8)} x2={cx-s(22)} y2={cy+s(6)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(23)} y={cy+s(7)} dir="left"/>
        {/* Face */}
        <Face x={cx} y={cy-s(26)} r={s(7)} hair="short" hCol={INK}/>
        {/* Wide-brimmed hat */}
        <ellipse cx={cx} cy={cy-s(34)} rx={s(16)} ry={s(4)} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(8)},${cy-s(34)} Q${cx},${cy-s(50)} ${cx+s(8)},${cy-s(34)}`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    2: ( // High Priestess â€” two pillars, veil, scroll, crescent
      <g>
        {/* Pillars */}
        <rect x={cx-s(34)} y={cy-s(62)} width={s(14)} height={s(130)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        <rect x={cx+s(20)} y={cy-s(62)} width={s(14)} height={s(130)} fill={INK} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Pillar capitals */}
        <rect x={cx-s(37)} y={cy-s(64)} width={s(20)} height={s(7)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <rect x={cx+s(17)} y={cy-s(64)} width={s(20)} height={s(7)} fill={INK} stroke={INK} strokeWidth={s(1)}/>
        {/* Letter B and J on pillars */}
        <text x={cx-s(27)} y={cy-s(40)} textAnchor="middle" fill={INK} fontSize={s(12)} fontFamily="Cinzel,serif" fontWeight="bold">B</text>
        <text x={cx+s(27)} y={cy-s(40)} textAnchor="middle" fill="white" fontSize={s(12)} fontFamily="Cinzel,serif" fontWeight="bold">J</text>
        {/* Pomegranate curtain behind */}
        <path d={`M${cx-s(20)},${cy-s(56)} L${cx+s(20)},${cy-s(56)} L${cx+s(20)},${cy+s(66)} L${cx-s(20)},${cy+s(66)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(0.8)}/>
        {[-s(14),-s(6),s(2),s(10)].map((x,k)=>(
          <g key={k}>
            <circle cx={cx+x} cy={cy-s(44)} r={s(5)} fill={RED} stroke={INK} strokeWidth={s(0.7)}/>
            <line x1={cx+x} y1={cy-s(39)} x2={cx+x} y2={cy-s(32)} stroke={INK} strokeWidth={s(0.5)}/>
          </g>
        ))}
        {/* Crescent moon at feet */}
        <path d={`M${cx-s(16)},${cy+s(60)} Q${cx-s(18)},${cy+s(52)} ${cx-s(8)},${cy+s(52)} Q${cx-s(18)},${cy+s(46)} ${cx-s(8)},${cy+s(48)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* Robe */}
        <path d={`M${cx-s(14)},${cy-s(14)} L${cx-s(20)},${cy+s(66)} L${cx+s(20)},${cy+s(66)} L${cx+s(14)},${cy-s(14)} Z`} fill="white" stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(14)} y={cy-s(12)} w={s(28)} h={s(76)} col="white" n={10}/>
        {/* Blue mantle over robe */}
        <path d={`M${cx-s(14)},${cy-s(14)} Q${cx-s(22)},${cy+s(10)} ${cx-s(20)},${cy+s(30)} L${cx-s(20)},${cy+s(66)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)} opacity="0.7"/>
        {/* Veil */}
        <path d={`M${cx-s(12)},${cy-s(32)} Q${cx-s(20)},${cy-s(20)} ${cx-s(18)},${cy+s(10)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M${cx+s(12)},${cy-s(32)} Q${cx+s(20)},${cy-s(20)} ${cx+s(18)},${cy+s(10)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Crown (triple moon) */}
        <circle cx={cx-s(8)} cy={cy-s(42)} r={s(4)} fill="none" stroke={YEL} strokeWidth={s(1.1)}/>
        <circle cx={cx} cy={cy-s(46)} r={s(5)} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
        <circle cx={cx+s(8)} cy={cy-s(42)} r={s(4)} fill="none" stroke={YEL} strokeWidth={s(1.1)}/>
        {/* Scroll/Torah in lap */}
        <rect x={cx-s(10)} y={cy+s(4)} width={s(20)} height={s(14)} rx={s(3)} fill="white" stroke={INK} strokeWidth={s(0.9)}/>
        <text x={cx} y={cy+s(14)} textAnchor="middle" fill={INK} fontSize={s(6)} fontFamily="serif">TORA</text>
        {/* Arms */}
        <line x1={cx-s(10)} y1={cy-s(10)} x2={cx-s(14)} y2={cy+s(4)} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(10)} y1={cy-s(10)} x2={cx+s(14)} y2={cy+s(4)} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Face */}
        <Face x={cx} y={cy-s(26)} r={s(8)} hair="bun" hCol={YEL}/>
      </g>
    ),
    3: ( // The Empress â€” crowned on throne, scepter, wheat, shield
      <g>
        {/* Throne */}
        <rect x={cx-s(30)} y={cy-s(20)} width={s(60)} height={s(80)} rx={s(2)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        <rect x={cx-s(28)} y={cy-s(40)} width={s(56)} height={s(24)} rx={s(2)} fill={YEL} stroke={INK} strokeWidth={s(1.2)}/>
        <Hatch x={cx-s(30)} y={cy-s(20)} w={s(60)} h={s(80)} spacing={s(6)}/>
        {/* Forest background */}
        {[-s(40),-s(28),s(28),s(40)].map((x,k)=>(
          <path key={k} d={`M${cx+x},${cy+s(60)} L${cx+x-s(6)},${cy+s(20)} L${cx+x},${cy+s(14)} L${cx+x+s(6)},${cy+s(20)} Z`} fill={GRN} stroke={INK} strokeWidth={s(0.8)}/>
        ))}
        {/* Wheat at sides */}
        {[-s(22),-s(18),s(18),s(22)].map((x,k)=>(
          <g key={k}>
            <line x1={cx+x} y1={cy+s(30)} x2={cx+x} y2={cy+s(58)} stroke={INK} strokeWidth={s(0.8)}/>
            <ellipse cx={cx+x} cy={cy+s(28)} rx={s(3)} ry={s(6)} fill={YEL} stroke={INK} strokeWidth={s(0.7)}/>
          </g>
        ))}
        {/* Robe (seated) */}
        <path d={`M${cx-s(22)},${cy-s(14)} L${cx-s(28)},${cy+s(58)} L${cx+s(28)},${cy+s(58)} L${cx+s(22)},${cy-s(14)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(22)} y={cy-s(12)} w={s(44)} h={s(68)} col={RED} n={9}/>
        {/* Mantle */}
        <path d={`M${cx-s(22)},${cy-s(14)} Q${cx-s(32)},${cy+s(10)} ${cx-s(28)},${cy+s(58)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* Arms */}
        <line x1={cx-s(14)} y1={cy-s(10)} x2={cx-s(26)} y2={cy+s(6)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(27)} y={cy+s(7)} dir="left"/>
        <line x1={cx+s(14)} y1={cy-s(10)} x2={cx+s(24)} y2={cy-s(4)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(25)} y={cy-s(5)} dir="right"/>
        {/* Scepter */}
        <line x1={cx+s(26)} y1={cy-s(4)} x2={cx+s(30)} y2={cy-s(40)} stroke={INK} strokeWidth={s(1.4)}/>
        <circle cx={cx+s(30)} cy={cy-s(42)} r={s(5)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(27)},${cy-s(46)} L${cx+s(30)},${cy-s(54)} L${cx+s(33)},${cy-s(46)}`} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Shield with Venus symbol */}
        <path d={`M${cx-s(28)},${cy+s(14)} L${cx-s(20)},${cy+s(14)} L${cx-s(20)},${cy+s(30)} L${cx-s(24)},${cy+s(36)} L${cx-s(28)},${cy+s(30)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(24)} cy={cy+s(20)} r={s(4)} fill="none" stroke={YEL} strokeWidth={s(1)}/>
        <line x1={cx-s(24)} y1={cy+s(24)} x2={cx-s(24)} y2={cy+s(30)} stroke={YEL} strokeWidth={s(1)}/>
        <line x1={cx-s(27)} y1={cy+s(27)} x2={cx-s(21)} y2={cy+s(27)} stroke={YEL} strokeWidth={s(1)}/>
        {/* Crown */}
        <path d={`M${cx-s(14)},${cy-s(32)} L${cx-s(10)},${cy-s(50)} L${cx-s(6)},${cy-s(42)} L${cx},${cy-s(52)} L${cx+s(6)},${cy-s(42)} L${cx+s(10)},${cy-s(50)} L${cx+s(14)},${cy-s(32)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
        {[-s(8),0,s(8)].map((x,k)=><circle key={k} cx={cx+x} cy={cy-s(36)} r={s(2)} fill={RED} stroke={INK} strokeWidth={s(0.5)}/>)}
        {/* Face */}
        <Face x={cx} y={cy-s(24)} r={s(8)} hair="long" hCol={YEL}/>
      </g>
    ),
    4: ( // The Emperor â€” throne, scepter, orb, beard, armor
      <g>
        {/* Mountain background */}
        <path d={`M${cx-s(50)},${cy+s(60)} L${cx-s(30)},${cy+s(20)} L${cx-s(10)},${cy+s(40)} L${cx+s(10)},${cy+s(10)} L${cx+s(30)},${cy+s(40)} L${cx+s(50)},${cy+s(60)} Z`} fill="#C8A888" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Throne */}
        <rect x={cx-s(28)} y={cy-s(30)} width={s(56)} height={s(90)} rx={s(2)} fill={RED} stroke={INK} strokeWidth={s(1.3)}/>
        <rect x={cx-s(26)} y={cy-s(50)} width={s(52)} height={s(24)} rx={s(2)} fill={RED} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Ram head armrests */}
        <path d={`M${cx-s(28)},${cy+s(14)} Q${cx-s(38)},${cy+s(12)} ${cx-s(40)},${cy+s(4)} Q${cx-s(36)},${cy-s(4)} ${cx-s(30)},${cy}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(42)} cy={cy+s(4)} r={s(4)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(28)},${cy+s(14)} Q${cx+s(38)},${cy+s(12)} ${cx+s(40)},${cy+s(4)} Q${cx+s(36)},${cy-s(4)} ${cx+s(30)},${cy}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx+s(42)} cy={cy+s(4)} r={s(4)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Robe / armor */}
        <path d={`M${cx-s(18)},${cy-s(14)} L${cx-s(22)},${cy+s(58)} L${cx+s(22)},${cy+s(58)} L${cx+s(18)},${cy-s(14)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(18)} y={cy-s(12)} w={s(36)} h={s(68)} col={RED} n={8}/>
        {/* Armor breastplate */}
        <path d={`M${cx-s(14)},${cy-s(14)} Q${cx-s(20)},${cy-s(4)} ${cx-s(14)},${cy+s(10)} L${cx+s(14)},${cy+s(10)} Q${cx+s(20)},${cy-s(4)} ${cx+s(14)},${cy-s(14)} Z`} fill="#9AA0AA" stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx} y1={cy-s(14)} x2={cx} y2={cy+s(10)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Arms */}
        <line x1={cx-s(14)} y1={cy-s(10)} x2={cx-s(28)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.2)}/>
        <Hand x={cx-s(29)} y={cy+s(5)} dir="left"/>
        {/* Orb */}
        <circle cx={cx-s(34)} cy={cy+s(8)} r={s(6)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(34)} y1={cy+s(2)} x2={cx-s(34)} y2={cy+s(14)} stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx-s(40)} y1={cy+s(8)} x2={cx-s(28)} y2={cy+s(8)} stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx+s(14)} y1={cy-s(10)} x2={cx+s(26)} y2={cy-s(10)} stroke={INK} strokeWidth={s(1.2)}/>
        <Hand x={cx+s(27)} y={cy-s(10)} dir="right"/>
        {/* Scepter (ankh) */}
        <line x1={cx+s(30)} y1={cy-s(8)} x2={cx+s(30)} y2={cy-s(48)} stroke={INK} strokeWidth={s(1.4)}/>
        <circle cx={cx+s(30)} cy={cy-s(54)} r={s(6)} fill="none" stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx+s(24)} y1={cy-s(48)} x2={cx+s(36)} y2={cy-s(48)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Legs */}
        <line x1={cx-s(8)} y1={cy+s(58)} x2={cx-s(8)} y2={cy+s(76)} stroke={INK} strokeWidth={s(1.3)}/>
        <line x1={cx+s(8)} y1={cy+s(58)} x2={cx+s(8)} y2={cy+s(76)} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Face with beard */}
        <Face x={cx} y={cy-s(26)} r={s(8)} beard hair="short" hCol={INK}/>
        {/* Crown */}
        <path d={`M${cx-s(12)},${cy-s(30)} L${cx-s(8)},${cy-s(46)} L${cx-s(4)},${cy-s(38)} L${cx},${cy-s(48)} L${cx+s(4)},${cy-s(38)} L${cx+s(8)},${cy-s(46)} L${cx+s(12)},${cy-s(30)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
      </g>
    ),
    5: ( // The Hierophant â€” triple crown, two keys, acolytes kneeling
      <g>
        {/* Pillars */}
        <rect x={cx-s(36)} y={cy-s(62)} width={s(10)} height={s(130)} fill="#E0D8C0" stroke={INK} strokeWidth={s(1.2)}/>
        <rect x={cx+s(26)} y={cy-s(62)} width={s(10)} height={s(130)} fill="#E0D8C0" stroke={INK} strokeWidth={s(1.2)}/>
        {/* Two kneeling acolytes */}
        {[cx-s(22),cx+s(22)].map((ax,k)=>(
          <g key={k}>
            <circle cx={ax} cy={cy+s(32)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
            <path d={`M${ax-s(6)},${cy+s(37)} L${ax-s(8)},${cy+s(58)} L${ax+s(8)},${cy+s(58)} L${ax+s(6)},${cy+s(37)} Z`} fill={k===0?RED:BLUE} stroke={INK} strokeWidth={s(0.9)}/>
          </g>
        ))}
        {/* Two crossed keys at bottom */}
        <line x1={cx-s(16)} y1={cy+s(56)} x2={cx+s(16)} y2={cy+s(68)} stroke={YEL} strokeWidth={s(2)}/>
        <line x1={cx+s(16)} y1={cy+s(56)} x2={cx-s(16)} y2={cy+s(68)} stroke={YEL} strokeWidth={s(2)}/>
        <circle cx={cx-s(16)} cy={cy+s(56)} r={s(3)} fill="none" stroke={YEL} strokeWidth={s(1.2)}/>
        <circle cx={cx+s(16)} cy={cy+s(56)} r={s(3)} fill="none" stroke={YEL} strokeWidth={s(1.2)}/>
        {/* Robe */}
        <path d={`M${cx-s(16)},${cy-s(14)} L${cx-s(20)},${cy+s(44)} L${cx+s(20)},${cy+s(44)} L${cx+s(16)},${cy-s(14)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(16)} y={cy-s(12)} w={s(32)} h={s(54)} col={RED} n={7}/>
        {/* White underrobe */}
        <path d={`M${cx-s(10)},${cy-s(14)} Q${cx-s(12)},${cy+s(10)} ${cx-s(10)},${cy+s(44)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Stole with crosses */}
        <path d={`M${cx-s(5)},${cy-s(14)} L${cx-s(5)},${cy+s(38)}`} fill={YEL} stroke={INK} strokeWidth={s(3)}/>
        <path d={`M${cx+s(5)},${cy-s(14)} L${cx+s(5)},${cy+s(38)}`} fill={YEL} stroke={INK} strokeWidth={s(3)}/>
        {[-s(4),s(8),s(20)].map((y,k)=>(
          <line key={k} x1={cx-s(8)} y1={cy+y} x2={cx+s(8)} y2={cy+y} stroke={RED} strokeWidth={s(1.5)}/>
        ))}
        {/* Blessing hands */}
        <line x1={cx-s(10)} y1={cy-s(10)} x2={cx-s(24)} y2={cy+s(2)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(25)} y={cy+s(3)} dir="left"/>
        <line x1={cx+s(10)} y1={cy-s(10)} x2={cx+s(22)} y2={cy} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(23)} y={cy+s(1)} dir="right"/>
        {/* Face */}
        <Face x={cx} y={cy-s(28)} r={s(8)} beard hair="short" hCol={YEL}/>
        {/* Triple tiara */}
        <rect x={cx-s(12)} y={cy-s(38)} width={s(24)} height={s(5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <rect x={cx-s(10)} y={cy-s(44)} width={s(20)} height={s(5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <rect x={cx-s(8)} y={cy-s(50)} width={s(16)} height={s(5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(6)},${cy-s(50)} Q${cx},${cy-s(60)} ${cx+s(6)},${cy-s(50)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {[-s(8),0,s(8)].map((x,k)=><circle key={k} cx={cx+x} cy={cy-s(36)} r={s(2)} fill={RED} stroke={INK} strokeWidth={s(0.5)}/>)}
      </g>
    ),
    6: ( // The Lovers â€” angel above, man and woman, two trees, garden
      <g>
        {/* Sun background */}
        <circle cx={cx} cy={cy-s(52)} r={s(22)} fill={YEL} stroke={INK} strokeWidth={s(1.2)}/>
        {rays(cx, cy-s(52), s(22), s(30))}
        {/* Angel in sun */}
        <Face x={cx} y={cy-s(54)} r={s(7)} hair="curly" hCol={YEL}/>
        {/* Angel wings */}
        <path d={`M${cx-s(8)},${cy-s(50)} Q${cx-s(30)},${cy-s(44)} ${cx-s(28)},${cy-s(32)}`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(8)},${cy-s(50)} Q${cx+s(30)},${cy-s(44)} ${cx+s(28)},${cy-s(32)}`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {/* Blessing hands */}
        <line x1={cx-s(4)} y1={cy-s(47)} x2={cx-s(6)} y2={cy-s(36)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(4)} y1={cy-s(47)} x2={cx+s(6)} y2={cy-s(36)} stroke={INK} strokeWidth={s(1)}/>
        {/* Tree of Life (right â€” apple/good) */}
        <line x1={cx+s(24)} y1={cy+s(60)} x2={cx+s(24)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.4)}/>
        <circle cx={cx+s(24)} cy={cy+s(2)} r={s(16)} fill={GRN} stroke={INK} strokeWidth={s(1.1)}/>
        {[[-s(8),-s(6)],[0,-s(12)],[s(8),-s(6)],[-s(4),s(2)],[s(4),s(2)]].map(([ox,oy],k)=>(
          <circle key={k} cx={cx+s(24)+ox} cy={cy+oy} r={s(3)} fill={RED} stroke={INK} strokeWidth={s(0.6)}/>
        ))}
        {/* Tree of Knowledge (left â€” flame-leaves) */}
        <line x1={cx-s(24)} y1={cy+s(60)} x2={cx-s(24)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.4)}/>
        <circle cx={cx-s(24)} cy={cy+s(2)} r={s(16)} fill={GRN} stroke={INK} strokeWidth={s(1.1)}/>
        {[[-s(8),-s(4)],[0,-s(12)],[s(8),-s(4)],[0,s(4)]].map(([ox,oy],k)=>(
          <path key={k} d={`M${cx-s(24)+ox},${cy+oy+s(4)} Q${cx-s(24)+ox-s(2)},${cy+oy-s(2)} ${cx-s(24)+ox},${cy+oy-s(6)} Q${cx-s(24)+ox+s(2)},${cy+oy-s(2)} ${cx-s(24)+ox+s(2)},${cy+oy+s(4)}`} fill={YEL} stroke={INK} strokeWidth={s(0.6)}/>
        ))}
        {/* Snake coiled on left tree */}
        <path d={`M${cx-s(20)},${cy+s(12)} Q${cx-s(32)},${cy+s(8)} ${cx-s(30)},${cy+s(0)} Q${cx-s(28)},${cy-s(8)} ${cx-s(20)},${cy-s(4)}`} fill="none" stroke={GRN} strokeWidth={s(1.4)}/>
        {/* Ground */}
        <path d={`M${cx-s(50)},${cy+s(60)} L${cx+s(50)},${cy+s(60)}`} stroke={INK} strokeWidth={s(1)}/>
        {/* Male (right) */}
        <Face x={cx+s(14)} y={cy+s(10)} r={s(6)} hair="short" hCol={INK}/>
        <path d={`M${cx+s(8)},${cy+s(16)} L${cx+s(6)},${cy+s(44)} L${cx+s(22)},${cy+s(44)} L${cx+s(20)},${cy+s(16)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        <Folds x={cx+s(6)} y={cy+s(18)} w={s(16)} h={s(24)} col={BLUE} n={5}/>
        {/* Female (left) */}
        <Face x={cx-s(14)} y={cy+s(10)} r={s(6)} hair="long" hCol={YEL}/>
        <path d={`M${cx-s(20)},${cy+s(16)} L${cx-s(22)},${cy+s(56)} L${cx-s(6)},${cy+s(56)} L${cx-s(8)},${cy+s(16)} Z`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <Folds x={cx-s(22)} y={cy+s(18)} w={s(16)} h={s(36)} col={RED} n={6}/>
      </g>
    ),
    7: ( // The Chariot â€” armored warrior, two sphinxes, star canopy
      <g>
        {/* Star canopy */}
        <path d={`M${cx-s(30)},${cy-s(60)} L${cx+s(30)},${cy-s(60)} L${cx+s(30)},${cy-s(20)} L${cx-s(30)},${cy-s(20)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1.2)}/>
        {[-s(20),-s(8),s(4),s(16)].map((x,k)=>(
          <polygon key={k} points={`${cx+x},${cy-s(56)} ${cx+x+s(2)},${cy-s(50)} ${cx+x-s(2)},${cy-s(50)}`} fill={YEL}/>
        ))}
        {/* Chariot */}
        <rect x={cx-s(28)} y={cy-s(20)} width={s(56)} height={s(36)} rx={s(2)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        <circle cx={cx-s(20)} cy={cy+s(16)} r={s(6)} fill="none" stroke={INK} strokeWidth={s(1.4)}/>
        <circle cx={cx+s(20)} cy={cy+s(16)} r={s(6)} fill="none" stroke={INK} strokeWidth={s(1.4)}/>
        {/* Wheel spokes */}
        {[0,60,120].map(a=>(
          <line key={a} x1={cx-s(20)+Math.cos(a*Math.PI/180)*s(6)} y1={cy+s(16)+Math.sin(a*Math.PI/180)*s(6)}
            x2={cx-s(20)-Math.cos(a*Math.PI/180)*s(6)} y2={cy+s(16)-Math.sin(a*Math.PI/180)*s(6)} stroke={INK} strokeWidth={s(0.8)}/>
        ))}
        {/* Winged disc on chariot front */}
        <ellipse cx={cx} cy={cy-s(10)} rx={s(12)} ry={s(5)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(12)},${cy-s(10)} Q${cx-s(24)},${cy-s(20)} ${cx-s(22)},${cy-s(30)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(12)},${cy-s(10)} Q${cx+s(24)},${cy-s(20)} ${cx+s(22)},${cy-s(30)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
        {/* Warrior armor */}
        <path d={`M${cx-s(12)},${cy-s(40)} L${cx-s(14)},${cy-s(20)} L${cx+s(14)},${cy-s(20)} L${cx+s(12)},${cy-s(40)} Z`} fill="#9AA0AA" stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(12)} y={cy-s(38)} w={s(24)} h={s(16)} col="#9AA0AA" n={4}/>
        {/* Epaulettes */}
        <ellipse cx={cx-s(14)} cy={cy-s(36)} rx={s(6)} ry={s(3)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <ellipse cx={cx+s(14)} cy={cy-s(36)} rx={s(6)} ry={s(3)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Wand */}
        <line x1={cx+s(12)} y1={cy-s(38)} x2={cx+s(16)} y2={cy-s(60)} stroke={INK} strokeWidth={s(1.4)}/>
        <polygon points={`${cx+s(16)},${cy-s(60)} ${cx+s(12)},${cy-s(54)} ${cx+s(20)},${cy-s(54)}`} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Face with crown */}
        <Face x={cx} y={cy-s(50)} r={s(7)} hair="short" hCol={INK}/>
        <path d={`M${cx-s(10)},${cy-s(54)} L${cx-s(7)},${cy-s(64)} L${cx-s(2)},${cy-s(58)} L${cx+s(3)},${cy-s(64)} L${cx+s(8)},${cy-s(58)} L${cx+s(10)},${cy-s(54)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* White sphinx */}
        <path d={`M${cx-s(40)},${cy+s(30)} L${cx-s(22)},${cy+s(30)} L${cx-s(22)},${cy+s(52)} L${cx-s(40)},${cy+s(52)} Z`} fill="white" stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(31)} cy={cy+s(26)} r={s(7)} fill="white" stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx-s(36)} cy={cy+s(26)} rx={s(3)} ry={s(2)} fill="white" stroke={INK} strokeWidth={s(0.7)}/>
        <circle cx={cx-s(30)} cy={cy+s(25)} r={s(1)} fill={INK}/>
        {/* Black sphinx */}
        <path d={`M${cx+s(22)},${cy+s(30)} L${cx+s(40)},${cy+s(30)} L${cx+s(40)},${cy+s(52)} L${cx+s(22)},${cy+s(52)} Z`} fill={INK}/>
        <circle cx={cx+s(31)} cy={cy+s(26)} r={s(7)} fill={INK}/>
        <ellipse cx={cx+s(36)} cy={cy+s(26)} rx={s(3)} ry={s(2)} fill={INK} stroke={INK} strokeWidth={s(0.7)}/>
      </g>
    ),
    8: ( // Strength â€” woman taming lion, infinity hat, garland
      <g>
        {/* Green hills */}
        <path d={`M${cx-s(50)},${cy+s(60)} Q${cx-s(20)},${cy+s(28)} ${cx+s(10)},${cy+s(48)} Q${cx+s(30)},${cy+s(30)} ${cx+s(50)},${cy+s(60)} Z`} fill={GRN} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Mountain far left */}
        <path d={`M${cx-s(46)},${cy+s(30)} L${cx-s(34)},${cy-s(2)} L${cx-s(22)},${cy+s(30)} Z`} fill="#C8A888" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Lion body */}
        <ellipse cx={cx+s(12)} cy={cy+s(26)} rx={s(24)} ry={s(16)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Lion head */}
        <circle cx={cx-s(8)} cy={cy+s(14)} r={s(14)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Lion mane */}
        {[0,30,60,90,120,150,180,210].map(a=>(
          <path key={a} d={`M${cx-s(8)+Math.cos(a*Math.PI/180)*s(14)},${cy+s(14)+Math.sin(a*Math.PI/180)*s(14)} Q${cx-s(8)+Math.cos(a*Math.PI/180)*s(20)},${cy+s(14)+Math.sin(a*Math.PI/180)*s(20)} ${cx-s(8)+Math.cos((a+15)*Math.PI/180)*s(14)},${cy+s(14)+Math.sin((a+15)*Math.PI/180)*s(14)}`} fill={INK} stroke={INK} strokeWidth={s(0.5)}/>
        ))}
        {/* Lion face */}
        <circle cx={cx-s(7)} cy={cy+s(12)} r={s(1.2)} fill={INK}/>
        <circle cx={cx-s(1)} cy={cy+s(12)} r={s(1.2)} fill={INK}/>
        <path d={`M${cx-s(6)},${cy+s(18)} Q${cx-s(4)},${cy+s(22)} ${cx-s(2)},${cy+s(18)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Lion legs */}
        {[-s(14),-s(4),s(10),s(22)].map((x,k)=>(
          <line key={k} x1={cx+x} y1={cy+s(40)} x2={cx+x} y2={cy+s(58)} stroke={INK} strokeWidth={s(1.2)}/>
        ))}
        {/* Lion tail */}
        <path d={`M${cx+s(36)},${cy+s(26)} Q${cx+s(48)},${cy+s(10)} ${cx+s(42)},${cy-s(4)} Q${cx+s(50)},${cy-s(8)} ${cx+s(46)},${cy-s(18)}`} fill="none" stroke={INK} strokeWidth={s(1.3)}/>
        <ellipse cx={cx+s(46)} cy={cy-s(20)} rx={s(4)} ry={s(6)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* Woman's white robe */}
        <path d={`M${cx-s(18)},${cy-s(8)} L${cx-s(22)},${cy+s(30)} L${cx-s(4)},${cy+s(30)} L${cx-s(8)},${cy-s(8)} Z`} fill="white" stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(22)} y={cy-s(6)} w={s(18)} h={s(36)} col="white" n={6}/>
        {/* Flower garland belt */}
        <path d={`M${cx-s(18)},${cy+s(2)} Q${cx-s(10)},${cy+s(6)} ${cx-s(4)},${cy+s(2)}`} fill="none" stroke={GRN} strokeWidth={s(1.3)}/>
        {[-s(14),-s(8),-s(2)].map((x,k)=>(
          <circle key={k} cx={cx+x} cy={cy+s(3)} r={s(2.5)} fill={RED} stroke={INK} strokeWidth={s(0.5)}/>
        ))}
        {/* Arms â€” reaching to lion's jaws */}
        <line x1={cx-s(8)} y1={cy-s(4)} x2={cx-s(14)} y2={cy+s(10)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(15)} y={cy+s(12)} dir="left"/>
        <line x1={cx-s(4)} y1={cy-s(4)} x2={cx-s(10)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1.1)}/>
        {/* Face with infinity hat */}
        <Face x={cx-s(12)} y={cy-s(18)} r={s(7)} hair="long" hCol={YEL}/>
        {/* Lemniscate hat */}
        <path d={`M${cx-s(22)},${cy-s(28)} Q${cx-s(28)},${cy-s(36)} ${cx-s(18)},${cy-s(36)} Q${cx-s(8)},${cy-s(36)} ${cx-s(12)},${cy-s(28)} Q${cx-s(16)},${cy-s(20)} ${cx-s(6)},${cy-s(20)} Q${cx+s(2)},${cy-s(20)} ${cx-s(4)},${cy-s(28)} Q${cx-s(10)},${cy-s(36)} ${cx-s(16)},${cy-s(36)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    9: ( // The Hermit â€” mountain peak, staff, lantern, cloak
      <g>
        {/* Mountain peaks */}
        <path d={`M${cx-s(50)},${cy+s(65)} L${cx-s(20)},${cy-s(30)} L${cx+s(6)},${cy+s(10)} L${cx+s(24)},${cy-s(16)} L${cx+s(50)},${cy+s(65)} Z`} fill="#C8C0B0" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(20)},${cy-s(30)} L${cx-s(14)},${cy-s(42)} L${cx-s(8)},${cy-s(30)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Snow cap */}
        <path d={`M${cx+s(24)},${cy-s(16)} L${cx+s(28)},${cy-s(26)} L${cx+s(32)},${cy-s(16)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Robe and cloak (old man stooped) */}
        <path d={`M${cx-s(12)},${cy-s(14)} Q${cx-s(20)},${cy+s(10)} ${cx-s(18)},${cy+s(42)} L${cx+s(10)},${cy+s(42)} Q${cx+s(8)},${cy+s(10)} ${cx+s(2)},${cy-s(10)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1.2)}/>
        <Folds x={cx-s(18)} y={cy-s(10)} w={s(28)} h={s(50)} col={BLUE} n={8}/>
        {/* Hood */}
        <path d={`M${cx-s(12)},${cy-s(14)} Q${cx-s(22)},${cy-s(28)} ${cx-s(8)},${cy-s(38)} Q${cx+s(4)},${cy-s(30)} ${cx+s(2)},${cy-s(10)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* Face peeking from hood */}
        <Face x={cx-s(4)} y={cy-s(26)} r={s(6)} beard hair="none" hCol={INK}/>
        {/* Staff */}
        <line x1={cx+s(10)} y1={cy-s(10)} x2={cx+s(14)} y2={cy+s(62)} stroke={INK} strokeWidth={s(2)}/>
        {/* Staff top curl */}
        <path d={`M${cx+s(14)},${cy-s(10)} Q${cx+s(22)},${cy-s(26)} ${cx+s(12)},${cy-s(34)} Q${cx+s(2)},${cy-s(38)} ${cx+s(4)},${cy-s(26)}`} fill="none" stroke={INK} strokeWidth={s(1.4)}/>
        {/* Lantern hand */}
        <line x1={cx-s(12)} y1={cy-s(8)} x2={cx-s(22)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(23)} y={cy+s(5)} dir="left"/>
        {/* Lantern */}
        <rect x={cx-s(34)} y={cy+s(2)} width={s(12)} height={s(16)} rx={s(2)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* Star inside lantern */}
        <polygon points={`${cx-s(28)},${cy+s(5)} ${cx-s(26)},${cy+s(10)} ${cx-s(22)},${cy+s(10)} ${cx-s(25)},${cy+s(13)} ${cx-s(24)},${cy+s(18)} ${cx-s(28)},${cy+s(15)} ${cx-s(32)},${cy+s(18)} ${cx-s(31)},${cy+s(13)} ${cx-s(34)},${cy+s(10)} ${cx-s(30)},${cy+s(10)}`} fill={YEL} stroke={INK} strokeWidth={s(0.5)}/>
        {/* Lantern glow rays */}
        {[-30,0,30].map(a=>(
          <line key={a} x1={cx-s(28)+Math.cos(a*Math.PI/180)*s(10)} y1={cy+s(10)+Math.sin(a*Math.PI/180)*s(10)}
            x2={cx-s(28)+Math.cos(a*Math.PI/180)*s(16)} y2={cy+s(10)+Math.sin(a*Math.PI/180)*s(16)}
            stroke={YEL} strokeWidth={s(0.9)} opacity="0.7"/>
        ))}
        {/* Old man's beard visible */}
        <path d={`M${cx-s(8)},${cy-s(22)} Q${cx-s(14)},${cy-s(14)} ${cx-s(8)},${cy-s(6)}`} fill={INK} stroke={INK} strokeWidth={s(0.6)} opacity="0.5"/>
      </g>
    ),
    10: ( // Wheel of Fortune â€” great wheel, sphinx, snake, jackal
      <g>
        {/* Four corner creatures */}
        {/* Angel (Aquarius) â€” top left */}
        <circle cx={cx-s(36)} cy={cy-s(44)} r={s(8)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(44)},${cy-s(40)} Q${cx-s(52)},${cy-s(28)} ${cx-s(44)},${cy-s(16)}`} fill="white" stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(28)},${cy-s(40)} Q${cx-s(20)},${cy-s(28)} ${cx-s(28)},${cy-s(16)}`} fill="white" stroke={INK} strokeWidth={s(0.9)}/>
        {/* Eagle (Scorpio) â€” top right */}
        <ellipse cx={cx+s(36)} cy={cy-s(44)} rx={s(8)} ry={s(6)} fill={INK}/>
        <path d={`M${cx+s(28)},${cy-s(50)} Q${cx+s(24)},${cy-s(60)} ${cx+s(36)},${cy-s(56)}`} fill={INK}/>
        <path d={`M${cx+s(44)},${cy-s(50)} Q${cx+s(48)},${cy-s(60)} ${cx+s(36)},${cy-s(56)}`} fill={INK}/>
        {/* Bull (Taurus) â€” bottom left */}
        <ellipse cx={cx-s(36)} cy={cy+s(48)} rx={s(10)} ry={s(7)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(36)} cy={cy+s(40)} r={s(5)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(40)},${cy+s(38)} Q${cx-s(46)},${cy+s(30)} ${cx-s(42)},${cy+s(26)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(32)},${cy+s(38)} Q${cx-s(26)},${cy+s(30)} ${cx-s(30)},${cy+s(26)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* Lion (Leo) â€” bottom right */}
        <circle cx={cx+s(36)} cy={cy+s(44)} r={s(10)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <path key={a} d={`M${cx+s(36)+Math.cos(a*Math.PI/180)*s(10)},${cy+s(44)+Math.sin(a*Math.PI/180)*s(10)} Q${cx+s(36)+Math.cos(a*Math.PI/180)*s(14)},${cy+s(44)+Math.sin(a*Math.PI/180)*s(14)} ${cx+s(36)+Math.cos((a+20)*Math.PI/180)*s(10)},${cy+s(44)+Math.sin((a+20)*Math.PI/180)*s(10)}`} fill={INK}/>
        ))}
        {/* Wheel */}
        <circle cx={cx} cy={cy} r={s(30)} fill="none" stroke={INK} strokeWidth={s(2)}/>
        <circle cx={cx} cy={cy} r={s(20)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        <circle cx={cx} cy={cy} r={s(6)} fill={INK}/>
        {/* Spokes */}
        {[0,45,90,135].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*s(6)} y1={cy+Math.sin(a*Math.PI/180)*s(6)}
            x2={cx+Math.cos(a*Math.PI/180)*s(20)} y2={cy+Math.sin(a*Math.PI/180)*s(20)} stroke={INK} strokeWidth={s(1.3)}/>
        ))}
        {[22,67,112,157,202,247,292,337].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*s(20)} y1={cy+Math.sin(a*Math.PI/180)*s(20)}
            x2={cx+Math.cos(a*Math.PI/180)*s(30)} y2={cy+Math.sin(a*Math.PI/180)*s(30)} stroke={INK} strokeWidth={s(0.9)}/>
        ))}
        {/* ROTA letters on wheel */}
        {['T','A','R','O'].map((l,k)=>(
          <text key={k} x={cx+Math.cos((k*90-90)*Math.PI/180)*s(25)} y={cy+Math.sin((k*90-90)*Math.PI/180)*s(25)+s(4)}
            textAnchor="middle" fill={INK} fontSize={s(8)} fontFamily="Cinzel,serif" fontWeight="bold">{l}</text>
        ))}
        {/* Sphinx on top */}
        <ellipse cx={cx+s(4)} cy={cy-s(34)} rx={s(10)} ry={s(6)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx+s(10)} cy={cy-s(40)} r={s(7)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx+s(16)} cy={cy-s(40)} rx={s(4)} ry={s(3)} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        <circle cx={cx+s(11)} cy={cy-s(41)} r={s(1.2)} fill={INK}/>
        {/* Anubis/Jackal ascending right */}
        <ellipse cx={cx+s(32)} cy={cy+s(4)} rx={s(5)} ry={s(9)} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx+s(34)} cy={cy-s(4)} r={s(5)} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(30)},${cy-s(8)} L${cx+s(26)},${cy-s(18)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(38)},${cy-s(6)} L${cx+s(42)},${cy-s(16)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* Snake descending left */}
        <path d={`M${cx-s(30)},${cy-s(20)} Q${cx-s(40)},${cy-s(10)} ${cx-s(36)},${cy+s(4)} Q${cx-s(32)},${cy+s(16)} ${cx-s(38)},${cy+s(26)}`} fill="none" stroke={GRN} strokeWidth={s(2.5)}/>
        <circle cx={cx-s(38)} cy={cy+s(28)} r={s(4)} fill={GRN} stroke={INK} strokeWidth={s(0.9)}/>
        <circle cx={cx-s(37)} cy={cy+s(27)} r={s(1)} fill={INK}/>
      </g>
    ),
    11: ( // Justice â€” scales, upright sword, throne, two pillars
      <g>
        {/* Pillars */}
        <rect x={cx-s(38)} y={cy-s(65)} width={s(10)} height={s(130)} fill="#E0D8C0" stroke={INK} strokeWidth={s(1.2)}/>
        <rect x={cx+s(28)} y={cy-s(65)} width={s(10)} height={s(130)} fill="#E0D8C0" stroke={INK} strokeWidth={s(1.2)}/>
        {/* Throne */}
        <rect x={cx-s(24)} y={cy-s(20)} width={s(48)} height={s(80)} rx={s(2)} fill={RED} stroke={INK} strokeWidth={s(1.2)}/>
        <rect x={cx-s(22)} y={cy-s(36)} width={s(44)} height={s(20)} rx={s(2)} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Hatch x={cx-s(24)} y={cy-s(20)} w={s(48)} h={s(80)} spacing={s(7)}/>
        {/* Robe */}
        <path d={`M${cx-s(14)},${cy-s(12)} L${cx-s(18)},${cy+s(58)} L${cx+s(18)},${cy+s(58)} L${cx+s(14)},${cy-s(12)} Z`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(14)} y={cy-s(10)} w={s(28)} h={s(66)} col={RED} n={8}/>
        {/* Mantle */}
        <path d={`M${cx-s(14)},${cy-s(12)} Q${cx-s(24)},${cy+s(4)} ${cx-s(18)},${cy+s(58)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        {/* Left arm holds scales */}
        <line x1={cx-s(10)} y1={cy-s(8)} x2={cx-s(26)} y2={cy+s(6)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(27)} y={cy+s(7)} dir="left"/>
        {/* Scale beam */}
        <line x1={cx-s(36)} y1={cy+s(8)} x2={cx-s(10)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1.1)}/>
        <line x1={cx-s(23)} y1={cy+s(8)} x2={cx-s(23)} y2={cy+s(2)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Scale pans */}
        <path d={`M${cx-s(38)},${cy+s(12)} Q${cx-s(34)},${cy+s(20)} ${cx-s(28)},${cy+s(20)} Q${cx-s(22)},${cy+s(20)} ${cx-s(18)},${cy+s(12)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx-s(38)} y1={cy+s(12)} x2={cx-s(34)} y2={cy+s(8)} stroke={INK} strokeWidth={s(0.7)}/>
        <line x1={cx-s(18)} y1={cy+s(12)} x2={cx-s(12)} y2={cy+s(8)} stroke={INK} strokeWidth={s(0.7)}/>
        <path d={`M${cx-s(30)},${cy+s(12)} Q${cx-s(26)},${cy+s(20)} ${cx-s(20)},${cy+s(20)} Q${cx-s(14)},${cy+s(20)} ${cx-s(10)},${cy+s(12)}`} fill="none" stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx-s(30)} y1={cy+s(12)} x2={cx-s(32)} y2={cy+s(8)} stroke={INK} strokeWidth={s(0.7)}/>
        <line x1={cx-s(10)} y1={cy+s(12)} x2={cx-s(14)} y2={cy+s(8)} stroke={INK} strokeWidth={s(0.7)}/>
        {/* Right arm holds sword upright */}
        <line x1={cx+s(10)} y1={cy-s(8)} x2={cx+s(22)} y2={cy+s(6)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(23)} y={cy+s(7)} dir="right"/>
        <line x1={cx+s(26)} y1={cy+s(2)} x2={cx+s(26)} y2={cy-s(46)} stroke={INK} strokeWidth={s(1.8)}/>
        <path d={`M${cx+s(23)},${cy-s(46)} L${cx+s(26)},${cy-s(58)} L${cx+s(29)},${cy-s(46)}`} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(20)} y1={cy-s(42)} x2={cx+s(32)} y2={cy-s(42)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Face */}
        <Face x={cx} y={cy-s(26)} r={s(8)} hair="bun" hCol={YEL}/>
        {/* Crown */}
        <path d={`M${cx-s(12)},${cy-s(30)} L${cx-s(8)},${cy-s(46)} L${cx-s(3)},${cy-s(38)} L${cx+s(2)},${cy-s(46)} L${cx+s(7)},${cy-s(38)} L${cx+s(12)},${cy-s(46)} L${cx+s(16)},${cy-s(30)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
        {[-s(6),s(4)].map((x,k)=><circle key={k} cx={cx+x} cy={cy-s(33)} r={s(2)} fill={RED} stroke={INK} strokeWidth={s(0.5)}/>)}
      </g>
    ),
    12: ( // The Hanged Man â€” T-frame trees, inverted figure, nimbus
      <g>
        {/* Tree trunks */}
        <line x1={cx-s(26)} y1={cy-s(65)} x2={cx-s(26)} y2={cy+s(65)} stroke={INK} strokeWidth={s(2.5)}/>
        <line x1={cx+s(26)} y1={cy-s(65)} x2={cx+s(26)} y2={cy+s(65)} stroke={INK} strokeWidth={s(2.5)}/>
        {/* Foliage on left tree */}
        {[-s(14),-s(6),s(2)].map((dx,k)=>(
          <path key={k} d={`M${cx-s(26)+dx},${cy-s(56)} Q${cx-s(26)+dx-s(4)},${cy-s(66)} ${cx-s(26)+dx+s(2)},${cy-s(70)} Q${cx-s(26)+dx+s(6)},${cy-s(66)} ${cx-s(26)+dx+s(8)},${cy-s(56)}`} fill={GRN} stroke={INK} strokeWidth={s(0.7)}/>
        ))}
        {/* Foliage on right tree */}
        {[-s(2),s(6),s(14)].map((dx,k)=>(
          <path key={k} d={`M${cx+s(26)+dx-s(4)},${cy-s(56)} Q${cx+s(26)+dx-s(2)},${cy-s(66)} ${cx+s(26)+dx+s(2)},${cy-s(70)} Q${cx+s(26)+dx+s(6)},${cy-s(66)} ${cx+s(26)+dx+s(8)},${cy-s(56)}`} fill={GRN} stroke={INK} strokeWidth={s(0.7)}/>
        ))}
        {/* Horizontal beam */}
        <line x1={cx-s(26)} y1={cy-s(42)} x2={cx+s(26)} y2={cy-s(42)} stroke={INK} strokeWidth={s(2.2)}/>
        {/* Rope */}
        <line x1={cx} y1={cy-s(42)} x2={cx} y2={cy-s(28)} stroke={INK} strokeWidth={s(1)}/>
        {/* Inverted body */}
        <path d={`M${cx-s(10)},${cy-s(26)} L${cx-s(12)},${cy+s(12)} L${cx+s(12)},${cy+s(12)} L${cx+s(10)},${cy-s(26)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(12)} y={cy-s(24)} w={s(24)} h={s(36)} col={BLUE} n={6}/>
        {/* Legs: right straight up tied to rope, left bent */}
        <line x1={cx+s(4)} y1={cy-s(26)} x2={cx+s(4)} y2={cy-s(42)} stroke={INK} strokeWidth={s(1.3)}/>
        <line x1={cx-s(4)} y1={cy-s(26)} x2={cx-s(14)} y2={cy-s(18)} stroke={INK} strokeWidth={s(1.3)}/>
        <line x1={cx-s(14)} y1={cy-s(18)} x2={cx-s(6)} y2={cy-s(10)} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Arms spread forming triangle */}
        <line x1={cx-s(10)} y1={cy+s(2)} x2={cx-s(24)} y2={cy+s(16)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(10)} y1={cy+s(2)} x2={cx+s(24)} y2={cy+s(16)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(24)} y1={cy+s(16)} x2={cx+s(24)} y2={cy+s(16)} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Golden nimbus */}
        <circle cx={cx} cy={cy+s(26)} r={s(11)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <Face x={cx} y={cy+s(26)} r={s(7)} hair="short" hCol={INK}/>
      </g>
    ),
    13: ( // Death â€” skeleton on black horse, banner, fallen figures, rising sun
      <g>
        {/* Rising sun */}
        <circle cx={cx} cy={cy+s(40)} r={s(18)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {rays(cx, cy+s(40), s(18), s(24))}
        {/* Distant towers */}
        <rect x={cx-s(18)} y={cy+s(14)} width={s(8)} height={s(28)} fill="#C8A888" stroke={INK} strokeWidth={s(0.8)}/>
        <rect x={cx+s(10)} y={cy+s(14)} width={s(8)} height={s(28)} fill="#C8A888" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Ground */}
        <path d={`M${cx-s(50)},${cy+s(58)} L${cx+s(50)},${cy+s(58)}`} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Black horse */}
        <ellipse cx={cx+s(6)} cy={cy+s(18)} rx={s(28)} ry={s(14)} fill={INK}/>
        <ellipse cx={cx+s(28)} cy={cy+s(6)} rx={s(10)} ry={s(7)} fill={INK}/>
        <path d={`M${cx+s(34)},${cy+s(2)} L${cx+s(40)},${cy-s(8)}`} stroke={INK} strokeWidth={s(1.2)}/>
        {[cx-s(12),cx-s(2),cx+s(12),cx+s(22)].map((x,k)=>(
          <line key={k} x1={x} y1={cy+s(30)} x2={x+(k<2?-s(3):s(3))} y2={cy+s(52)} stroke={INK} strokeWidth={s(1.5)}/>
        ))}
        {/* Skeleton skull */}
        <circle cx={cx-s(16)} cy={cy-s(24)} r={s(8)} fill={PARCHMENT} stroke={INK} strokeWidth={s(1.2)}/>
        <ellipse cx={cx-s(14)} cy={cy-s(22)} rx={s(1.5)} ry={s(2)} fill={INK}/>
        <ellipse cx={cx-s(20)} cy={cy-s(22)} rx={s(1.5)} ry={s(2)} fill={INK}/>
        <path d={`M${cx-s(21)},${cy-s(16)} L${cx-s(18)},${cy-s(18)} L${cx-s(15)},${cy-s(16)} L${cx-s(12)},${cy-s(18)} L${cx-s(9)},${cy-s(16)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Skeleton spine and ribs */}
        <line x1={cx-s(16)} y1={cy-s(16)} x2={cx-s(16)} y2={cy+s(2)} stroke={INK} strokeWidth={s(1.4)}/>
        {[-s(8),-s(3),s(2),s(7)].map((dy,k)=>(
          <line key={k} x1={cx-s(24)} y1={cy-s(12)+dy} x2={cx-s(8)} y2={cy-s(12)+dy} stroke={INK} strokeWidth={s(0.9)}/>
        ))}
        {/* Flag arm */}
        <line x1={cx-s(16)} y1={cy-s(14)} x2={cx-s(30)} y2={cy-s(8)} stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx-s(30)} y1={cy-s(8)} x2={cx-s(30)} y2={cy-s(50)} stroke={INK} strokeWidth={s(1.3)}/>
        <rect x={cx-s(30)} y={cy-s(50)} width={s(18)} height={s(14)} fill={INK} stroke={INK} strokeWidth={s(0.8)}/>
        {/* White rose on flag */}
        <circle cx={cx-s(22)} cy={cy-s(44)} r={s(4)} fill="white" stroke={INK} strokeWidth={s(0.7)}/>
        <circle cx={cx-s(22)} cy={cy-s(44)} r={s(2)} fill={YEL}/>
        {/* Fallen bishop */}
        <circle cx={cx+s(26)} cy={cy+s(34)} r={s(4)} fill="white" stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(22)},${cy+s(38)} Q${cx+s(32)},${cy+s(42)} ${cx+s(42)},${cy+s(40)}`} fill="white" stroke={INK} strokeWidth={s(1)}/>
        {/* Kneeling child */}
        <circle cx={cx-s(36)} cy={cy+s(36)} r={s(4)} fill={FLESH} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(36)},${cy+s(40)} L${cx-s(40)},${cy+s(54)} L${cx-s(32)},${cy+s(54)}`} fill={RED} stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    14: ( // Temperance â€” angel pouring water between two cups
      <g>
        {/* Mountain with crown at peak */}
        <path d={`M${cx-s(50)},${cy+s(65)} L${cx+s(14)},${cy-s(14)} L${cx+s(50)},${cy+s(65)} Z`} fill="#C8A888" stroke={INK} strokeWidth={s(0.9)}/>
        <circle cx={cx+s(14)} cy={cy-s(18)} r={s(6)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        {rays(cx+s(14), cy-s(18), s(6), s(10))}
        {/* Pool */}
        <ellipse cx={cx-s(16)} cy={cy+s(60)} rx={s(22)} ry={s(8)} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Iris flowers */}
        {[-s(32),-s(40)].map((x,k)=>(
          <g key={k}>
            <line x1={cx+x} y1={cy+s(65)} x2={cx+x} y2={cy+s(44)} stroke={INK} strokeWidth={s(0.9)}/>
            <path d={`M${cx+x-s(4)},${cy+s(44)} Q${cx+x-s(6)},${cy+s(36)} ${cx+x-s(2)},${cy+s(32)} Q${cx+x+s(2)},${cy+s(36)} ${cx+x},${cy+s(44)}`} fill={BLUE} stroke={INK} strokeWidth={s(0.7)}/>
            <path d={`M${cx+x+s(4)},${cy+s(44)} Q${cx+x+s(6)},${cy+s(36)} ${cx+x+s(2)},${cy+s(32)} Q${cx+x-s(2)},${cy+s(36)} ${cx+x},${cy+s(44)}`} fill={BLUE} stroke={INK} strokeWidth={s(0.7)}/>
          </g>
        ))}
        {/* Angel wings */}
        <path d={`M${cx-s(10)},${cy-s(10)} Q${cx-s(34)},${cy-s(18)} ${cx-s(38)},${cy-s(40)} Q${cx-s(28)},${cy-s(28)} ${cx-s(10)},${cy-s(18)}`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(10)},${cy-s(10)} Q${cx+s(34)},${cy-s(18)} ${cx+s(38)},${cy-s(40)} Q${cx+s(28)},${cy-s(28)} ${cx+s(10)},${cy-s(18)}`} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        {/* White robe */}
        <path d={`M${cx-s(14)},${cy-s(12)} L${cx-s(16)},${cy+s(60)} L${cx+s(16)},${cy+s(60)} L${cx+s(14)},${cy-s(12)} Z`} fill="white" stroke={INK} strokeWidth={s(1.1)}/>
        <Folds x={cx-s(14)} y={cy-s(10)} w={s(28)} h={s(70)} col="white" n={9}/>
        {/* Triangle on chest */}
        <polygon points={`${cx},${cy-s(6)} ${cx-s(6)},${cy+s(6)} ${cx+s(6)},${cy+s(6)}`} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Arms */}
        <line x1={cx-s(12)} y1={cy-s(8)} x2={cx-s(28)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(29)} y={cy+s(9)} dir="left"/>
        <line x1={cx+s(12)} y1={cy-s(8)} x2={cx+s(22)} y2={cy+s(4)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(23)} y={cy+s(5)} dir="right"/>
        {/* Two golden cups */}
        <path d={`M${cx-s(40)},${cy+s(16)} L${cx-s(36)},${cy+s(26)} L${cx-s(28)},${cy+s(26)} L${cx-s(24)},${cy+s(16)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(32)} y1={cy+s(26)} x2={cx-s(32)} y2={cy+s(30)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(38)} y1={cy+s(30)} x2={cx-s(26)} y2={cy+s(30)} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(16)},${cy+s(6)} L${cx+s(20)},${cy+s(16)} L${cx+s(28)},${cy+s(16)} L${cx+s(32)},${cy+s(6)} Z`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(24)} y1={cy+s(16)} x2={cx+s(24)} y2={cy+s(20)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(18)} y1={cy+s(20)} x2={cx+s(30)} y2={cy+s(20)} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Water arc */}
        <path d={`M${cx-s(24)},${cy+s(16)} Q${cx-s(4)},${cy+s(6)} ${cx+s(16)},${cy+s(8)}`} fill="none" stroke={BLUE} strokeWidth={s(1.2)}/>
        {/* Face */}
        <Face x={cx} y={cy-s(26)} r={s(8)} hair="long" hCol={YEL}/>
        <circle cx={cx} cy={cy-s(26)} r={s(12)} fill="none" stroke={YEL} strokeWidth={s(0.8)} strokeDasharray={`${s(3)},${s(2)}`}/>
      </g>
    ),
    15: ( // The Devil â€” bat-winged beast, torch, two chained figures
      <g>
        {/* Dark pedestal */}
        <rect x={cx-s(20)} y={cy+s(8)} width={s(40)} height={s(22)} rx={s(1)} fill={INK}/>
        <rect x={cx-s(14)} y={cy-s(4)} width={s(28)} height={s(14)} rx={s(1)} fill={INK}/>
        {/* Pentagram */}
        {[0,1,2,3,4].map(i => {
          const a1=(i*144-90)*Math.PI/180, a2=((i+2)*144-90)*Math.PI/180;
          return <line key={i} x1={cx+Math.sin(a1)*s(8)} y1={cy+s(16)-Math.cos(a1)*s(8)} x2={cx+Math.sin(a2)*s(8)} y2={cy+s(16)-Math.cos(a2)*s(8)} stroke={YEL} strokeWidth={s(0.8)}/>;
        })}
        {/* Bat wings */}
        <path d={`M${cx-s(10)},${cy-s(16)} Q${cx-s(36)},${cy-s(28)} ${cx-s(44)},${cy-s(10)} Q${cx-s(38)},${cy-s(2)} ${cx-s(10)},${cy-s(6)}`} fill={INK} stroke={INK} strokeWidth={s(1.2)}/>
        <path d={`M${cx+s(10)},${cy-s(16)} Q${cx+s(36)},${cy-s(28)} ${cx+s(44)},${cy-s(10)} Q${cx+s(38)},${cy-s(2)} ${cx+s(10)},${cy-s(6)}`} fill={INK} stroke={INK} strokeWidth={s(1.2)}/>
        <path d={`M${cx-s(10)},${cy-s(12)} Q${cx-s(28)},${cy-s(16)} ${cx-s(38)},${cy-s(8)}`} fill="none" stroke={YEL} strokeWidth={s(0.6)} opacity="0.5"/>
        <path d={`M${cx+s(10)},${cy-s(12)} Q${cx+s(28)},${cy-s(16)} ${cx+s(38)},${cy-s(8)}`} fill="none" stroke={YEL} strokeWidth={s(0.6)} opacity="0.5"/>
        {/* Body */}
        <path d={`M${cx-s(12)},${cy-s(16)} L${cx-s(14)},${cy+s(8)} L${cx+s(14)},${cy+s(8)} L${cx+s(12)},${cy-s(16)} Z`} fill={INK} stroke={INK} strokeWidth={s(1.1)}/>
        {/* Torch arm */}
        <line x1={cx+s(12)} y1={cy-s(12)} x2={cx+s(24)} y2={cy-s(26)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(25)} y={cy-s(28)} dir="right"/>
        <line x1={cx+s(28)} y1={cy-s(28)} x2={cx+s(28)} y2={cy-s(52)} stroke={INK} strokeWidth={s(1.4)}/>
        <path d={`M${cx+s(24)},${cy-s(52)} Q${cx+s(26)},${cy-s(62)} ${cx+s(28)},${cy-s(60)} Q${cx+s(30)},${cy-s(62)} ${cx+s(32)},${cy-s(52)}`} fill={YEL} stroke={INK} strokeWidth={s(0.7)}/>
        <path d={`M${cx+s(25)},${cy-s(52)} Q${cx+s(27)},${cy-s(58)} ${cx+s(28)},${cy-s(57)} Q${cx+s(29)},${cy-s(58)} ${cx+s(31)},${cy-s(52)}`} fill={RED}/>
        {/* Face with horns */}
        <Face x={cx} y={cy-s(30)} r={s(8)} beard hair="short" hCol={INK}/>
        <path d={`M${cx-s(8)},${cy-s(36)} Q${cx-s(10)},${cy-s(50)} ${cx-s(6)},${cy-s(52)}`} fill="none" stroke={INK} strokeWidth={s(1.3)}/>
        <path d={`M${cx+s(8)},${cy-s(36)} Q${cx+s(10)},${cy-s(50)} ${cx+s(6)},${cy-s(52)}`} fill="none" stroke={INK} strokeWidth={s(1.3)}/>
        {/* Left chained figure */}
        <circle cx={cx-s(22)} cy={cy+s(26)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(22)},${cy+s(31)} L${cx-s(26)},${cy+s(52)} L${cx-s(18)},${cy+s(52)}`} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(25)},${cy+s(23)} Q${cx-s(28)},${cy+s(18)} ${cx-s(26)},${cy+s(16)}`} fill="none" stroke={INK} strokeWidth={s(0.7)}/>
        {/* Right chained figure */}
        <circle cx={cx+s(22)} cy={cy+s(26)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(22)},${cy+s(31)} L${cx+s(18)},${cy+s(52)} L${cx+s(26)},${cy+s(52)}`} fill={RED} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(25)},${cy+s(23)} Q${cx+s(28)},${cy+s(18)} ${cx+s(26)},${cy+s(16)}`} fill="none" stroke={INK} strokeWidth={s(0.7)}/>
        {/* Chains */}
        <path d={`M${cx-s(16)},${cy+s(16)} Q${cx},${cy+s(12)} ${cx+s(16)},${cy+s(16)}`} fill="none" stroke={INK} strokeWidth={s(1)} strokeDasharray={`${s(3)},${s(2)}`}/>
      </g>
    ),
    16: ( // The Tower â€” lightning, falling figures, flames, crown blown off
      <g>
        {/* Storm clouds */}
        <path d={`M${cx-s(50)},${cy-s(50)} Q${cx-s(28)},${cy-s(62)} ${cx-s(8)},${cy-s(52)} Q${cx+s(12)},${cy-s(64)} ${cx+s(32)},${cy-s(54)} Q${cx+s(50)},${cy-s(46)} ${cx+s(48)},${cy-s(38)}`} fill="#4A4050" stroke={INK} strokeWidth={s(0.9)}/>
        {/* Rocky peak */}
        <path d={`M${cx-s(30)},${cy+s(65)} L${cx-s(18)},${cy+s(30)} L${cx+s(18)},${cy+s(30)} L${cx+s(30)},${cy+s(65)} Z`} fill="#8A7060" stroke={INK} strokeWidth={s(1)}/>
        {/* Tower body */}
        <rect x={cx-s(18)} y={cy-s(28)} width={s(36)} height={s(60)} fill={INK} stroke={INK} strokeWidth={s(1.3)}/>
        {/* Windows */}
        <rect x={cx-s(8)} y={cy-s(18)} width={s(10)} height={s(14)} rx={s(1)} fill={YEL}/>
        <rect x={cx-s(8)} y={cy+s(6)} width={s(10)} height={s(14)} rx={s(1)} fill={YEL}/>
        {/* Battlements */}
        <rect x={cx-s(20)} y={cy-s(36)} width={s(40)} height={s(10)} fill={YEL} stroke={INK} strokeWidth={s(1.1)}/>
        {[-s(14),-s(6),s(2),s(10)].map((x,k)=>(
          <rect key={k} x={cx+x} y={cy-s(46)} width={s(6)} height={s(12)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        ))}
        {/* Crown flying off */}
        <path d={`M${cx-s(10)},${cy-s(52)} L${cx-s(6)},${cy-s(62)} L${cx-s(1)},${cy-s(56)} L${cx+s(4)},${cy-s(62)} L${cx+s(8)},${cy-s(52)}`} fill={YEL} stroke={INK} strokeWidth={s(1)} style={{transform:`rotate(-15deg)`,transformOrigin:`${cx}px ${cy-s(57)}px`}}/>
        {/* Flames */}
        {[-s(10),-s(2),s(6)].map((x,k)=>(
          <path key={k} d={`M${cx+x},${cy-s(36)} Q${cx+x-s(2)},${cy-s(48)} ${cx+x},${cy-s(50)} Q${cx+x+s(2)},${cy-s(48)} ${cx+x+s(4)},${cy-s(36)}`} fill={k%2===0?YEL:RED} stroke={INK} strokeWidth={s(0.6)}/>
        ))}
        {/* Lightning bolt */}
        <path d={`M${cx+s(24)},${cy-s(56)} L${cx+s(12)},${cy-s(38)} L${cx+s(18)},${cy-s(36)} L${cx+s(6)},${cy-s(16)}`} fill={YEL} stroke={INK} strokeWidth={s(1.8)}/>
        {/* Yod drops */}
        {[-s(30),-s(22),s(26),s(36)].map((x,k)=>(
          <path key={k} d={`M${cx+x},${cy-s(44)} Q${cx+x},${cy-s(40)} ${cx+x+s(1)},${cy-s(36)}`} fill={YEL} stroke={YEL} strokeWidth={s(1)}/>
        ))}
        {/* Falling figure left */}
        <circle cx={cx-s(32)} cy={cy-s(10)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(32)},${cy-s(5)} L${cx-s(28)},${cy+s(12)} L${cx-s(36)},${cy+s(12)} Z`} fill={RED} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx-s(32)} y1={cy-s(5)} x2={cx-s(44)} y2={cy-s(2)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(32)} y1={cy-s(5)} x2={cx-s(22)} y2={cy-s(2)} stroke={INK} strokeWidth={s(1)}/>
        {/* Falling figure right */}
        <circle cx={cx+s(32)} cy={cy+s(2)} r={s(5)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(32)},${cy+s(7)} L${cx+s(28)},${cy+s(24)} L${cx+s(36)},${cy+s(24)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(32)} y1={cy+s(7)} x2={cx+s(22)} y2={cy+s(16)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx+s(32)} y1={cy+s(7)} x2={cx+s(42)} y2={cy+s(14)} stroke={INK} strokeWidth={s(1)}/>
      </g>
    ),
    17: ( // The Star â€” 8-pointed star, woman pouring water, pool, tree
      <g>
        {/* Night sky */}
        <rect x={0} y={0} width={w} height={h} fill="#080618"/>
        {/* Small stars */}
        {[[-s(30),-s(56)],[s(36),-s(60)],[-s(44),-s(40)],[s(44),-s(44)],[s(20),-s(60)],[-s(20),-s(64)],[s(44),-s(28)]].map(([ox,oy],k)=>(
          <g key={k}>
            <line x1={cx+ox} y1={cy+oy-s(4)} x2={cx+ox} y2={cy+oy+s(4)} stroke={YEL} strokeWidth={s(0.8)}/>
            <line x1={cx+ox-s(4)} y1={cy+oy} x2={cx+ox+s(4)} y2={cy+oy} stroke={YEL} strokeWidth={s(0.8)}/>
          </g>
        ))}
        {/* Large 8-pointed central star */}
        {[0,45,90,135,180,225,270,315].map((a,k)=>(
          <line key={a} x1={cx} y1={cy-s(44)}
            x2={cx+Math.sin(a*Math.PI/180)*s(k%2===0?28:18)} y2={cy-s(44)+Math.cos(a*Math.PI/180)*s(k%2===0?28:18)}
            stroke={YEL} strokeWidth={k%2===0?s(2.5):s(1.5)}/>
        ))}
        <circle cx={cx} cy={cy-s(44)} r={s(7)} fill={YEL} stroke={INK} strokeWidth={s(0.8)}/>
        {/* Ground and pool */}
        <path d={`M${cx-s(50)},${cy+s(58)} Q${cx},${cy+s(54)} ${cx+s(50)},${cy+s(58)}`} fill={GRN} stroke={INK} strokeWidth={s(0.8)}/>
        <ellipse cx={cx-s(14)} cy={cy+s(62)} rx={s(22)} ry={s(6)} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Tree with ibis */}
        <line x1={cx+s(38)} y1={cy+s(60)} x2={cx+s(38)} y2={cy-s(18)} stroke={INK} strokeWidth={s(1.2)}/>
        <circle cx={cx+s(38)} cy={cy-s(20)} r={s(8)} fill={GRN} stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx+s(42)} cy={cy-s(26)} rx={s(4)} ry={s(2)} fill={INK}/>
        <path d={`M${cx+s(46)},${cy-s(26)} L${cx+s(52)},${cy-s(28)}`} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Kneeling woman */}
        <Face x={cx-s(10)} y={cy-s(14)} r={s(7)} hair="long" hCol={YEL}/>
        <ellipse cx={cx-s(10)} cy={cy+s(4)} rx={s(8)} ry={s(12)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx-s(10)} y1={cy+s(16)} x2={cx-s(20)} y2={cy+s(38)} stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx-s(20)} y1={cy+s(38)} x2={cx-s(6)} y2={cy+s(54)} stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx-s(10)} y1={cy+s(16)} x2={cx-s(2)} y2={cy+s(42)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Left jug to ground */}
        <line x1={cx-s(10)} y1={cy+s(0)} x2={cx-s(28)} y2={cy+s(10)} stroke={INK} strokeWidth={s(1)}/>
        <Hand x={cx-s(29)} y={cy+s(11)} dir="left"/>
        <path d={`M${cx-s(38)},${cy+s(8)} L${cx-s(32)},${cy+s(18)} L${cx-s(26)},${cy+s(10)} Z`} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx-s(34)},${cy+s(14)} Q${cx-s(36)},${cy+s(30)} ${cx-s(30)},${cy+s(46)}`} fill="none" stroke={BLUE} strokeWidth={s(1.2)}/>
        {/* Right jug to water */}
        <line x1={cx-s(8)} y1={cy+s(0)} x2={cx+s(10)} y2={cy+s(14)} stroke={INK} strokeWidth={s(1)}/>
        <Hand x={cx+s(11)} y={cy+s(15)} dir="right"/>
        <path d={`M${cx+s(16)},${cy+s(12)} L${cx+s(22)},${cy+s(22)} L${cx+s(16)},${cy+s(26)} Z`} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
        <path d={`M${cx+s(18)},${cy+s(20)} Q${cx+s(14)},${cy+s(38)} ${cx+s(4)},${cy+s(50)}`} fill="none" stroke={BLUE} strokeWidth={s(1.2)}/>
      </g>
    ),
    18: ( // The Moon â€” moon, two towers, crayfish, dog and wolf
      <g>
        {/* Night sky */}
        <rect x={0} y={0} width={w} height={h} fill="#040218"/>
        {/* Full moon with crescent */}
        <circle cx={cx} cy={cy-s(44)} r={s(20)} fill={YEL} stroke={INK} strokeWidth={s(1.2)}/>
        <circle cx={cx+s(8)} cy={cy-s(44)} r={s(16)} fill={PARCHMENT} stroke="none"/>
        {/* Moon face */}
        <ellipse cx={cx-s(3)} cy={cy-s(46)} rx={s(1.5)} ry={s(2)} fill={INK}/>
        <path d={`M${cx-s(7)},${cy-s(40)} Q${cx-s(2)},${cy-s(38)} ${cx+s(2)},${cy-s(40)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Yod drops */}
        {[-s(20),-s(10),0,s(10),s(20)].map((x,k)=>(
          <path key={k} d={`M${cx+x},${cy-s(28)} Q${cx+x},${cy-s(24)} ${cx+x+s(1)},${cy-s(20)}`} fill={YEL} stroke={YEL} strokeWidth={s(1)}/>
        ))}
        {/* Two dark towers */}
        <rect x={cx-s(46)} y={cy-s(30)} width={s(14)} height={s(62)} fill={INK} stroke={INK} strokeWidth={s(1.2)}/>
        <rect x={cx+s(32)} y={cy-s(30)} width={s(14)} height={s(62)} fill={INK} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Battlements */}
        {[cx-s(46),cx-s(40),cx-s(34)].map((x,k)=>(
          <rect key={k} x={x} y={cy-s(38)} width={s(4)} height={s(8)} fill={INK}/>
        ))}
        {[cx+s(32),cx+s(38),cx+s(44)].map((x,k)=>(
          <rect key={k} x={x} y={cy-s(38)} width={s(4)} height={s(8)} fill={INK}/>
        ))}
        {/* Winding path */}
        <path d={`M${cx-s(8)},${cy+s(65)} Q${cx-s(4)},${cy+s(38)} ${cx},${cy+s(18)} Q${cx+s(4)},${cy+s(8)} ${cx},${cy-s(8)}`} fill="none" stroke="#C8A888" strokeWidth={s(3)}/>
        {/* Water pool */}
        <ellipse cx={cx} cy={cy+s(60)} rx={s(28)} ry={s(8)} fill="#102050" stroke={INK} strokeWidth={s(0.9)}/>
        {/* Crayfish */}
        <ellipse cx={cx} cy={cy+s(52)} rx={s(8)} ry={s(6)} fill={RED} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(8)},${cy+s(50)} Q${cx-s(14)},${cy+s(46)} ${cx-s(16)},${cy+s(50)}`} fill="none" stroke={RED} strokeWidth={s(1.5)}/>
        <path d={`M${cx+s(8)},${cy+s(50)} Q${cx+s(14)},${cy+s(46)} ${cx+s(16)},${cy+s(50)}`} fill="none" stroke={RED} strokeWidth={s(1.5)}/>
        {/* Dog (left) howling */}
        <ellipse cx={cx-s(24)} cy={cy+s(30)} rx={s(8)} ry={s(6)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(18)} cy={cy+s(24)} r={s(6)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(18)},${cy+s(18)} Q${cx-s(18)},${cy+s(10)} ${cx-s(22)},${cy+s(4)}`} fill="none" stroke={INK} strokeWidth={s(1.1)}/>
        {[cx-s(32),cx-s(28),cx-s(20),cx-s(16)].map((x,k)=>(
          <line key={k} x1={x} y1={cy+s(36)} x2={x+(k%2?s(2):-s(2))} y2={cy+s(48)} stroke={INK} strokeWidth={s(1)}/>
        ))}
        {/* Wolf (right) */}
        <ellipse cx={cx+s(24)} cy={cy+s(30)} rx={s(8)} ry={s(6)} fill={INK}/>
        <circle cx={cx+s(18)} cy={cy+s(24)} r={s(6)} fill={INK}/>
        <path d={`M${cx+s(18)},${cy+s(18)} Q${cx+s(18)},${cy+s(10)} ${cx+s(22)},${cy+s(4)}`} fill="none" stroke={INK} strokeWidth={s(1.1)}/>
        <path d={`M${cx+s(14)},${cy+s(20)} L${cx+s(12)},${cy+s(14)} L${cx+s(16)},${cy+s(18)}`} fill={INK}/>
        <path d={`M${cx+s(22)},${cy+s(20)} L${cx+s(22)},${cy+s(14)} L${cx+s(24)},${cy+s(18)}`} fill={INK}/>
      </g>
    ),
    19: ( // The Sun â€” radiant sun, child on white horse, sunflowers
      <g>
        {/* Sun */}
        <circle cx={cx} cy={cy-s(44)} r={s(22)} fill={YEL} stroke={INK} strokeWidth={s(1.3)}/>
        {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((a,k)=>(
          <line key={a}
            x1={cx+Math.cos(a*Math.PI/180)*s(22)} y1={cy-s(44)+Math.sin(a*Math.PI/180)*s(22)}
            x2={cx+Math.cos(a*Math.PI/180)*s(k%2===0?32:27)} y2={cy-s(44)+Math.sin(a*Math.PI/180)*s(k%2===0?32:27)}
            stroke={INK} strokeWidth={s(k%2===0?1.2:0.8)}/>
        ))}
        {/* Sun face */}
        <circle cx={cx-s(6)} cy={cy-s(46)} r={s(2)} fill={INK}/>
        <circle cx={cx+s(6)} cy={cy-s(46)} r={s(2)} fill={INK}/>
        <path d={`M${cx-s(4)},${cy-s(38)} Q${cx},${cy-s(36)} ${cx+s(4)},${cy-s(38)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(2)},${cy-s(44)} L${cx-s(2)},${cy-s(40)}`} fill="none" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Stone wall */}
        <rect x={cx-s(40)} y={cy+s(12)} width={s(80)} height={s(16)} fill="#C8A888" stroke={INK} strokeWidth={s(1)}/>
        {[-s(28),-s(12),s(4),s(20)].map((x,k)=>(
          <line key={k} x1={cx+x} y1={cy+s(12)} x2={cx+x} y2={cy+s(28)} stroke={INK} strokeWidth={s(0.5)}/>
        ))}
        <line x1={cx-s(40)} y1={cy+s(20)} x2={cx+s(40)} y2={cy+s(20)} stroke={INK} strokeWidth={s(0.5)}/>
        {/* Sunflowers */}
        {[cx-s(36),cx+s(34)].map((x,k)=>(
          <g key={k}>
            <line x1={x} y1={cy+s(12)} x2={x} y2={cy-s(8)} stroke={INK} strokeWidth={s(1.1)}/>
            <circle cx={x} cy={cy-s(10)} r={s(6)} fill={YEL} stroke={INK} strokeWidth={s(0.9)}/>
            <circle cx={x} cy={cy-s(10)} r={s(3)} fill={INK}/>
          </g>
        ))}
        {/* White horse body */}
        <ellipse cx={cx+s(4)} cy={cy+s(40)} rx={s(22)} ry={s(12)} fill="white" stroke={INK} strokeWidth={s(1.2)}/>
        <ellipse cx={cx+s(20)} cy={cy+s(32)} rx={s(10)} ry={s(8)} fill="white" stroke={INK} strokeWidth={s(1.2)}/>
        {[cx-s(8),cx+s(2),cx+s(14),cx+s(22)].map((x,k)=>(
          <line key={k} x1={x} y1={cy+s(50)} x2={x+(k<2?-s(2):s(2))} y2={cy+s(64)} stroke={INK} strokeWidth={s(1.4)}/>
        ))}
        {/* Child riding */}
        <Face x={cx+s(6)} y={cy+s(14)} r={s(7)} hair="short" hCol={YEL}/>
        <path d={`M${cx-s(2)},${cy+s(8)} Q${cx+s(6)},${cy+s(6)} ${cx+s(14)},${cy+s(8)}`} fill="none" stroke={GRN} strokeWidth={s(1.2)}/>
        {[-s(2),s(4),s(10)].map((x,k)=>(
          <circle key={k} cx={cx+x} cy={cy+s(7)} r={s(2)} fill={RED} stroke={INK} strokeWidth={s(0.4)}/>
        ))}
        {/* Red banner */}
        <line x1={cx+s(14)} y1={cy+s(20)} x2={cx+s(14)} y2={cy-s(2)} stroke={INK} strokeWidth={s(1.3)}/>
        <rect x={cx+s(14)} y={cy-s(2)} width={s(16)} height={s(10)} fill={RED} stroke={INK} strokeWidth={s(0.8)}/>
      </g>
    ),
    20: ( // Judgement â€” angel with trumpet, three rising figures
      <g>
        {/* Clouds */}
        <path d={`M${cx-s(50)},${cy-s(52)} Q${cx-s(28)},${cy-s(66)} ${cx-s(6)},${cy-s(54)} Q${cx+s(14)},${cy-s(68)} ${cx+s(36)},${cy-s(56)} Q${cx+s(52)},${cy-s(48)} ${cx+s(50)},${cy-s(38)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M${cx-s(48)},${cy-s(50)} Q${cx-s(20)},${cy-s(56)} ${cx},${cy-s(50)}`} fill="white" stroke={INK} strokeWidth={s(0.7)}/>
        {/* Angel */}
        <Face x={cx} y={cy-s(60)} r={s(8)} hair="curly" hCol={YEL}/>
        <path d={`M${cx-s(8)},${cy-s(54)} Q${cx-s(38)},${cy-s(46)} ${cx-s(42)},${cy-s(28)}`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <path d={`M${cx+s(8)},${cy-s(54)} Q${cx+s(38)},${cy-s(46)} ${cx+s(42)},${cy-s(28)}`} fill={RED} stroke={INK} strokeWidth={s(1.1)}/>
        <path d={`M${cx-s(8)},${cy-s(50)} L${cx-s(10)},${cy-s(28)} L${cx+s(10)},${cy-s(28)} L${cx+s(8)},${cy-s(50)} Z`} fill="white" stroke={INK} strokeWidth={s(1)}/>
        {/* Trumpet */}
        <line x1={cx+s(8)} y1={cy-s(46)} x2={cx+s(26)} y2={cy-s(22)} stroke={YEL} strokeWidth={s(2.5)}/>
        <path d={`M${cx+s(22)},${cy-s(16)} Q${cx+s(30)},${cy-s(10)} ${cx+s(34)},${cy-s(18)} Q${cx+s(30)},${cy-s(22)} ${cx+s(26)},${cy-s(22)}`} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {/* Red cross banner */}
        <rect x={cx+s(10)} y={cy-s(46)} width={s(14)} height={s(18)} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        <line x1={cx+s(17)} y1={cy-s(46)} x2={cx+s(17)} y2={cy-s(28)} stroke={RED} strokeWidth={s(2)}/>
        <line x1={cx+s(10)} y1={cy-s(38)} x2={cx+s(24)} y2={cy-s(38)} stroke={RED} strokeWidth={s(2)}/>
        {/* Water surface */}
        <path d={`M${cx-s(50)},${cy+s(28)} L${cx+s(50)},${cy+s(28)}`} stroke={BLUE} strokeWidth={s(0.8)}/>
        {/* Centre figure (child, arms raised) */}
        <Face x={cx} y={cy+s(8)} r={s(6)} hair="short" hCol={INK}/>
        <line x1={cx} y1={cy+s(14)} x2={cx} y2={cy+s(28)} stroke={INK} strokeWidth={s(1.1)}/>
        <line x1={cx} y1={cy+s(18)} x2={cx-s(10)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1)}/>
        <line x1={cx} y1={cy+s(18)} x2={cx+s(10)} y2={cy+s(8)} stroke={INK} strokeWidth={s(1)}/>
        {/* Left (female) */}
        <Face x={cx-s(22)} y={cy+s(12)} r={s(6)} hair="long" hCol={YEL}/>
        <path d={`M${cx-s(22)},${cy+s(18)} L${cx-s(26)},${cy+s(40)} L${cx-s(18)},${cy+s(40)} Z`} fill="white" stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx-s(22)} y1={cy+s(22)} x2={cx-s(12)} y2={cy+s(14)} stroke={INK} strokeWidth={s(0.9)}/>
        {/* Right (male) */}
        <Face x={cx+s(22)} y={cy+s(12)} r={s(6)} hair="short" hCol={INK}/>
        <path d={`M${cx+s(22)},${cy+s(18)} L${cx+s(18)},${cy+s(40)} L${cx+s(26)},${cy+s(40)} Z`} fill={BLUE} stroke={INK} strokeWidth={s(0.9)}/>
        <line x1={cx+s(22)} y1={cy+s(22)} x2={cx+s(32)} y2={cy+s(14)} stroke={INK} strokeWidth={s(0.9)}/>
      </g>
    ),
    21: ( // The World â€” dancing figure, laurel wreath, four creatures
      <g>
        {/* Green laurel wreath */}
        <ellipse cx={cx} cy={cy} rx={s(32)} ry={s(48)} fill="none" stroke={GRN} strokeWidth={s(9)}/>
        {[0,20,40,60,80,100,120,140,160,180,200,220,240,260,280,300,320,340].map(a=>(
          <ellipse key={a}
            cx={cx+Math.cos(a*Math.PI/180)*s(32)}
            cy={cy+Math.sin(a*Math.PI/180)*s(48)}
            rx={s(5)} ry={s(3)}
            fill={GRN} stroke={INK} strokeWidth={s(0.5)}
            style={{transform:`rotate(${a+90}deg)`,transformOrigin:`${cx+Math.cos(a*Math.PI/180)*s(32)}px ${cy+Math.sin(a*Math.PI/180)*s(48)}px`}}/>
        ))}
        {/* Ribbon sashes */}
        <path d={`M${cx-s(10)},${cy-s(48)} Q${cx},${cy-s(52)} ${cx+s(10)},${cy-s(48)}`} fill={RED} stroke={INK} strokeWidth={s(1.2)}/>
        <path d={`M${cx-s(10)},${cy+s(48)} Q${cx},${cy+s(52)} ${cx+s(10)},${cy+s(48)}`} fill={RED} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Dancing female figure */}
        <Face x={cx} y={cy-s(28)} r={s(7)} hair="long" hCol={YEL}/>
        <path d={`M${cx-s(10)},${cy-s(20)} Q${cx-s(18)},${cy-s(8)} ${cx-s(14)},${cy+s(10)} Q${cx-s(10)},${cy+s(22)} ${cx-s(8)},${cy+s(38)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx+s(10)},${cy-s(20)} Q${cx+s(18)},${cy-s(8)} ${cx+s(14)},${cy+s(10)} Q${cx+s(10)},${cy+s(22)} ${cx+s(8)},${cy+s(38)}`} fill={BLUE} stroke={INK} strokeWidth={s(1)}/>
        <ellipse cx={cx} cy={cy-s(8)} rx={s(8)} ry={s(12)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        {/* Arms holding wands */}
        <line x1={cx-s(6)} y1={cy-s(16)} x2={cx-s(18)} y2={cy-s(28)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx-s(19)} y={cy-s(30)} dir="left"/>
        <line x1={cx-s(22)} y1={cy-s(30)} x2={cx-s(22)} y2={cy-s(6)} stroke={INK} strokeWidth={s(1.4)}/>
        <line x1={cx+s(6)} y1={cy-s(16)} x2={cx+s(18)} y2={cy-s(22)} stroke={INK} strokeWidth={s(1.1)}/>
        <Hand x={cx+s(19)} y={cy-s(24)} dir="right"/>
        <line x1={cx+s(22)} y1={cy-s(24)} x2={cx+s(22)} y2={cy} stroke={INK} strokeWidth={s(1.4)}/>
        {/* Legs crossed, dancing */}
        <line x1={cx} y1={cy+s(4)} x2={cx-s(8)} y2={cy+s(28)} stroke={INK} strokeWidth={s(1.2)}/>
        <line x1={cx} y1={cy+s(4)} x2={cx+s(8)} y2={cy+s(20)} stroke={INK} strokeWidth={s(1.2)}/>
        {/* Angel top left */}
        <circle cx={cx-s(38)} cy={cy-s(50)} r={s(7)} fill={FLESH} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(46)},${cy-s(46)} Q${cx-s(54)},${cy-s(36)} ${cx-s(46)},${cy-s(26)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        <path d={`M${cx-s(30)},${cy-s(46)} Q${cx-s(22)},${cy-s(36)} ${cx-s(30)},${cy-s(26)}`} fill="white" stroke={INK} strokeWidth={s(0.8)}/>
        {/* Eagle top right */}
        <ellipse cx={cx+s(38)} cy={cy-s(50)} rx={s(8)} ry={s(6)} fill={INK}/>
        <path d={`M${cx+s(30)},${cy-s(56)} Q${cx+s(26)},${cy-s(64)} ${cx+s(38)},${cy-s(58)}`} fill={INK}/>
        <path d={`M${cx+s(46)},${cy-s(56)} Q${cx+s(50)},${cy-s(64)} ${cx+s(38)},${cy-s(58)}`} fill={INK}/>
        {/* Bull bottom left */}
        <ellipse cx={cx-s(38)} cy={cy+s(52)} rx={s(10)} ry={s(7)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <circle cx={cx-s(38)} cy={cy+s(44)} r={s(5)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(42)},${cy+s(42)} Q${cx-s(48)},${cy+s(36)} ${cx-s(46)},${cy+s(32)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        <path d={`M${cx-s(34)},${cy+s(42)} Q${cx-s(28)},${cy+s(36)} ${cx-s(30)},${cy+s(32)}`} fill="none" stroke={INK} strokeWidth={s(1)}/>
        {/* Lion bottom right */}
        <circle cx={cx+s(38)} cy={cy+s(48)} r={s(10)} fill={YEL} stroke={INK} strokeWidth={s(1)}/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <path key={a} d={`M${cx+s(38)+Math.cos(a*Math.PI/180)*s(10)},${cy+s(48)+Math.sin(a*Math.PI/180)*s(10)} Q${cx+s(38)+Math.cos(a*Math.PI/180)*s(14)},${cy+s(48)+Math.sin(a*Math.PI/180)*s(14)} ${cx+s(38)+Math.cos((a+20)*Math.PI/180)*s(10)},${cy+s(48)+Math.sin((a+20)*Math.PI/180)*s(10)}`} fill={INK}/>
        ))}
        <circle cx={cx+s(35)} cy={cy+s(46)} r={s(1.5)} fill={INK}/>
        <circle cx={cx+s(41)} cy={cy+s(46)} r={s(1.5)} fill={INK}/>
      </g>
    ),
  };
  return arts[id] || (
    <g>
      <circle cx={cx} cy={cy} r={28} fill={YEL} stroke={INK} strokeWidth="1.2"/>
      <text x={cx} y={cy+6} textAnchor="middle" fill={INK} fontSize="22" fontFamily="Cinzel,serif" fontWeight="bold">{ROMAN[id]}</text>
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
