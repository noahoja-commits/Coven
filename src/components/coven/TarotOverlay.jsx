import { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Clock, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TAROT_DECK, getDailyCard } from '../../data/tarot';

// ── Marseille palette ──────────────────────────────────────────────────────────
const INK  = '#1A0C04';          // dark warm black — outlines & text
const PARCHMENT = '#F2E8C6';     // aged card background
const RED  = '#C0283A';          // robe red
const BLUE = '#1B3D87';          // robe blue
const YEL  = '#C9960E';          // ochre/gold — crowns, sun, coins
const FLESH= '#E8BE8A';          // skin tones
const GRN  = '#2D6435';          // greenery

const ROMAN = ['☉','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const RANK_LABEL = { ace:'ACE', two:'2', three:'3', four:'4', five:'5', six:'6', seven:'7', eight:'8', nine:'9', ten:'10', page:'PAGE', knight:'KNIGHT', queen:'QUEEN', king:'KING' };
const SUIT_GLYPH = { wands:'𝌊', cups:'⬡', swords:'✦', pentacles:'✿' };
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

// ── Border — simple Marseille double-rect ──────────────────────────────────────
function CardBorder({ w, h }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" width={w} height={h}>
      <rect x={3} y={3} width={w-6} height={h-6} rx={1} fill="none" stroke={INK} strokeWidth="1.8"/>
      <rect x={7} y={7} width={w-14} height={h-14} rx={0} fill="none" stroke={INK} strokeWidth="0.8"/>
    </svg>
  );
}

// ── Major Arcana art (Marseille woodcut style, colored fills) ──────────────────
function MajorArt({ id, w, h }) {
  const cx = w / 2, cy = h / 2;
  const o = { fill: 'none', stroke: INK, strokeWidth: 1.2 };
  const t = { fill: 'none', stroke: INK, strokeWidth: 0.8 };
  // helpers
  const head = (x, y, r=7) => <circle cx={x} cy={y} r={r} fill={FLESH} stroke={INK} strokeWidth="1.2"/>;
  const robe = (d, col=RED) => <path d={d} fill={col} stroke={INK} strokeWidth="1.1"/>;
  const sun8 = (x, y, r1, r2, col=YEL) => [0,45,90,135,180,225,270,315].map(a=>(
    <line key={a} x1={x+Math.cos(a*Math.PI/180)*r1} y1={y+Math.sin(a*Math.PI/180)*r1}
      x2={x+Math.cos(a*Math.PI/180)*r2} y2={y+Math.sin(a*Math.PI/180)*r2}
      stroke={col} strokeWidth="1.2"/>
  ));

  const arts = {
    0: (
      <g>
        <circle cx={cx-16} cy={cy-34} r={15} fill={YEL} stroke={INK} strokeWidth="1.2"/>
        {sun8(cx-16, cy-34, 11, 19, INK)}
        {head(cx+2, cy-22)}
        <path d={`M${cx-4},${cy-15} Q${cx-12},${cy-4} ${cx-6},${cy+8}`} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+8},${cy-15} Q${cx+14},${cy-4} ${cx+8},${cy+8}`} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <rect x={cx-6} y={cy-15} width={14} height={23} rx={2} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <line x1={cx+2} y1={cy+8} x2={cx-10} y2={cy+28} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+2} y1={cy+8} x2={cx+14} y2={cy+26} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+12} y1={cy-10} x2={cx+26} y2={cy-24} stroke={INK} strokeWidth="1"/>
        <polygon points={`${cx+26},${cy-28} ${cx+30},${cy-22} ${cx+22},${cy-22}`} fill={YEL} stroke={INK} strokeWidth="0.8"/>
        <ellipse cx={cx-18} cy={cy+26} rx={9} ry={6} fill={FLESH} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-26},${cy+40} Q${cx},${cy+46} ${cx+26},${cy+38}`} fill={GRN} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    1: (
      <g>
        <path d={`M${cx-14},${cy-30} Q${cx},${cy-42} ${cx+14},${cy-30}`} fill="none" stroke={INK} strokeWidth="1.2"/>
        {head(cx, cy-22)}
        <line x1={cx} y1={cy-15} x2={cx} y2={cy+4} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx-13} y1={cy-7} x2={cx+13} y2={cy-7} stroke={INK} strokeWidth="1"/>
        <line x1={cx} y1={cy+4} x2={cx-10} y2={cy+22} stroke={INK} strokeWidth="1"/>
        <line x1={cx} y1={cy+4} x2={cx+10} y2={cy+22} stroke={INK} strokeWidth="1"/>
        <rect x={cx-20} y={cy+24} width={40} height={5} rx={1} fill={YEL} stroke={INK} strokeWidth="1"/>
        {[[-14,cy+16],[0,cy+18],[14,cy+16]].map(([x,y],k)=><circle key={k} cx={cx+x} cy={y} r={3} fill={YEL} stroke={INK} strokeWidth="0.8"/>)}
        <line x1={cx+10} y1={cy-8} x2={cx+20} y2={cy-20} stroke={INK} strokeWidth="1"/>
        <polygon points={`${cx+18},${cy-26} ${cx+22},${cy-20} ${cx+14},${cy-20}`} fill={YEL} stroke={INK} strokeWidth="0.8"/>
      </g>
    ),
    2: (
      <g>
        <line x1={cx-22} y1={cy-42} x2={cx-22} y2={cy+44} stroke={INK} strokeWidth="2"/>
        <line x1={cx+22} y1={cy-42} x2={cx+22} y2={cy+44} stroke={INK} strokeWidth="2"/>
        <rect x={cx-27} y={cy-46} width={10} height={7} fill={INK}/>
        <rect x={cx+17} y={cy-46} width={10} height={7} fill={INK}/>
        {head(cx, cy-10)}
        <circle cx={cx+4} cy={cy-14} r={5} fill={YEL} stroke={INK} strokeWidth="0.8"/>
        <path d={`M${cx-14},${cy-16} Q${cx},${cy-26} ${cx+14},${cy-16}`} fill={BLUE} stroke={INK} strokeWidth="0.9"/>
        <rect x={cx-14} y={cy-4} width={28} height={46} rx={1} fill={BLUE} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-10} y1={cy+6} x2={cx+10} y2={cy+6} stroke={YEL} strokeWidth="1"/>
        <rect x={cx-8} y={cy+28} width={16} height={16} rx={1} fill={YEL} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    3: (
      <g>
        {head(cx, cy-30)}
        <path d={`M${cx-9},${cy-34} L${cx-6},${cy-44} L${cx},${cy-40} L${cx+6},${cy-44} L${cx+9},${cy-34}`} fill={YEL} stroke={INK} strokeWidth="1"/>
        <ellipse cx={cx} cy={cy+12} rx={18} ry={14} fill={RED} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx} y1={cy-23} x2={cx} y2={cy} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx-14},${cy-16} Q${cx-22},${cy-6} ${cx-12},${cy+4}`} fill="none" stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+14},${cy-16} Q${cx+22},${cy-6} ${cx+12},${cy+4}`} fill="none" stroke={INK} strokeWidth="1"/>
        {[-18,-10,0,10,18].map((x,k)=>(
          <g key={k}>
            <line x1={cx+x} y1={cy+30} x2={cx+x} y2={cy+46} stroke={INK} strokeWidth="0.9"/>
            <ellipse cx={cx+x} cy={cy+28} rx={3} ry={4} fill={YEL} stroke={INK} strokeWidth="0.8"/>
          </g>
        ))}
      </g>
    ),
    4: (
      <g>
        <rect x={cx-22} y={cy+12} width={44} height={30} rx={2} fill={RED} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx-22} y1={cy+12} x2={cx-22} y2={cy-12} stroke={INK} strokeWidth="1.3"/>
        <line x1={cx+22} y1={cy+12} x2={cx+22} y2={cy-12} stroke={INK} strokeWidth="1.3"/>
        <path d={`M${cx-22},${cy-12} Q${cx},${cy-24} ${cx+22},${cy-12}`} fill={RED} stroke={INK} strokeWidth="1.2"/>
        {head(cx, cy-10)}
        <path d={`M${cx-8},${cy-13} L${cx-4},${cy-22} L${cx},${cy-18} L${cx+4},${cy-22} L${cx+8},${cy-13}`} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx} y1={cy-3} x2={cx} y2={cy+12} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-11} y1={cy+2} x2={cx+11} y2={cy+2} stroke={INK} strokeWidth="0.9"/>
        <circle cx={cx-15} cy={cy+24} r={5} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-20} y1={cy+20} x2={cx-28} y2={cy+12} stroke={INK} strokeWidth="1"/>
        <line x1={cx+12} y1={cy+20} x2={cx+22} y2={cy+20} stroke={INK} strokeWidth="1.3"/>
        <line x1={cx+22} y1={cy+16} x2={cx+22} y2={cy+34} stroke={INK} strokeWidth="1.3"/>
      </g>
    ),
    5: (
      <g>
        {head(cx, cy-28)}
        <rect x={cx-6} y={cy-46} width={12} height={20} rx={1} fill={YEL} stroke={INK} strokeWidth="1"/>
        <rect x={cx-9} y={cy-44} width={18} height={4} fill={YEL} stroke={INK} strokeWidth="0.8"/>
        <rect x={cx-11} y={cy-40} width={22} height={4} fill={YEL} stroke={INK} strokeWidth="0.8"/>
        <line x1={cx} y1={cy-21} x2={cx} y2={cy+10} stroke={INK} strokeWidth="1.2"/>
        <path d={`M${cx-12},${cy+10} L${cx-14},${cy+44} L${cx+14},${cy+44} L${cx+12},${cy+10} Z`} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx-14},${cy-16} Q${cx-20},${cy-4} ${cx-10},${cy+10}`} fill="none" stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+14},${cy-16} Q${cx+20},${cy-4} ${cx+10},${cy+10}`} fill="none" stroke={INK} strokeWidth="1"/>
        <circle cx={cx-20} cy={cy+16} r={5} fill={FLESH} stroke={INK} strokeWidth="0.9"/>
        <circle cx={cx+20} cy={cy+16} r={5} fill={FLESH} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-16} y1={cy+18} x2={cx-12} y2={cy+40} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+16} y1={cy+18} x2={cx+12} y2={cy+40} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    6: (
      <g>
        <circle cx={cx} cy={cy-36} r={9} fill={YEL} stroke={INK} strokeWidth="1.2"/>
        {sun8(cx, cy-36, 9, 15, INK)}
        <path d={`M${cx-8},${cy-28} Q${cx-18},${cy-16} ${cx-8},${cy-2}`} fill="none" stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+8},${cy-28} Q${cx+18},${cy-16} ${cx+8},${cy-2}`} fill="none" stroke={INK} strokeWidth="1"/>
        {head(cx-18, cy-2)}
        <rect x={cx-28} y={cy+4} width={20} height={38} rx={1} fill={RED} stroke={INK} strokeWidth="1"/>
        <line x1={cx-18} y1={cy-28} x2={cx-18} y2={cy+4} stroke={INK} strokeWidth="1.1"/>
        {head(cx+18, cy-2)}
        <rect x={cx+8} y={cy+4} width={20} height={38} rx={1} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <line x1={cx+18} y1={cy-28} x2={cx+18} y2={cy+4} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-12} y1={cy+2} x2={cx+12} y2={cy+2} stroke={INK} strokeWidth="0.7"/>
      </g>
    ),
    7: (
      <g>
        <rect x={cx-24} y={cy-8} width={48} height={30} rx={1} fill={BLUE} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx-24} y1={cy-8} x2={cx-16} y2={cy-32} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+24} y1={cy-8} x2={cx+16} y2={cy-32} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-16} y1={cy-32} x2={cx+16} y2={cy-32} stroke={INK} strokeWidth="1.2"/>
        {head(cx, cy-22)}
        <path d={`M${cx-6},${cy-26} L${cx-4},${cy-34} L${cx},${cy-30} L${cx+4},${cy-34} L${cx+6},${cy-26}`} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        <circle cx={cx-18} cy={cy+32} r={7} fill={FLESH} stroke={INK} strokeWidth="1"/>
        <circle cx={cx+18} cy={cy+32} r={7} fill={INK}/>
        <line x1={cx-16} y1={cy+27} x2={cx-14} y2={cy+20} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+16} y1={cy+27} x2={cx+14} y2={cy+20} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-22} y1={cy+20} x2={cx+22} y2={cy+20} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    8: (
      <g>
        {head(cx-8, cy-28)}
        <path d={`M${cx-16},${cy-22} Q${cx-26},${cy-10} ${cx-14},${cy-2}`} fill={RED} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx},${cy-22} Q${cx+8},${cy-10} ${cx},${cy-2}`} fill={RED} stroke={INK} strokeWidth="1"/>
        <rect x={cx-16} y={cy-22} width={16} height={20} rx={1} fill={RED} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+4},${cy-16} Q${cx+14},${cy-22} ${cx+20},${cy-10} Q${cx+24},${cy+2} ${cx+16},${cy+8}`} fill="none" stroke={INK} strokeWidth="1.2"/>
        <ellipse cx={cx+12} cy={cy+12} rx={18} ry={11} fill={YEL} stroke={INK} strokeWidth="1.2"/>
        <path d={`M${cx+4},${cy+8} Q${cx+2},${cy+16} ${cx+8},${cy+22}`} fill="none" stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+24} y1={cy+18} x2={cx+30} y2={cy+30} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-14} y1={cy-2} x2={cx-10} y2={cy+12} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-10} y1={cy+12} x2={cx-14} y2={cy+30} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-10} y1={cy+12} x2={cx-4} y2={cy+30} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    9: (
      <g>
        {head(cx-4, cy-30)}
        <path d={`M${cx-10},${cy-24} Q${cx-18},${cy-14} ${cx-8},${cy-4}`} fill="none" stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+2},${cy-24} Q${cx+10},${cy-14} ${cx+2},${cy-4}`} fill="none" stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-8},${cy-4} L${cx+2},${cy-4} L${cx+4},${cy+20} L${cx-10},${cy+20} Z`} fill={BLUE} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx-10},${cy+20} L${cx+4},${cy+20} L${cx+2},${cy+46} L${cx-8},${cy+46} Z`} fill={BLUE} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+8} y1={cy-10} x2={cx+8} y2={cy+46} stroke={INK} strokeWidth="1.4"/>
        <path d={`M${cx+6},${cy-10} L${cx+8},${cy-22} L${cx+10},${cy-10}`} fill="none" stroke={INK} strokeWidth="0.9"/>
        <rect x={cx+14} y={cy-4} width={13} height={15} rx={1} fill={YEL} stroke={INK} strokeWidth="1"/>
        <circle cx={cx+20} cy={cy+2} r={5} fill={YEL} stroke={INK} strokeWidth="0.7"/>
      </g>
    ),
    10: (
      <g>
        <circle cx={cx} cy={cy} r={32} fill="none" stroke={INK} strokeWidth="1.4"/>
        <circle cx={cx} cy={cy} r={20} fill={YEL} stroke={INK} strokeWidth="1"/>
        <circle cx={cx} cy={cy} r={7} fill={INK}/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*7} y1={cy+Math.sin(a*Math.PI/180)*7}
            x2={cx+Math.cos(a*Math.PI/180)*20} y2={cy+Math.sin(a*Math.PI/180)*20}
            stroke={INK} strokeWidth="1"/>
        ))}
        {[0,90,180,270].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*20} y1={cy+Math.sin(a*Math.PI/180)*20}
            x2={cx+Math.cos(a*Math.PI/180)*32} y2={cy+Math.sin(a*Math.PI/180)*32}
            stroke={INK} strokeWidth="1.2"/>
        ))}
        {['T','A','R','O'].map((l,k)=>(
          <text key={k} x={cx+Math.cos((k*90-90)*Math.PI/180)*26} y={cy+Math.sin((k*90-90)*Math.PI/180)*26+4}
            textAnchor="middle" fill={INK} fontSize="8" fontFamily="Cinzel,serif" fontWeight="bold">{l}</text>
        ))}
      </g>
    ),
    11: (
      <g>
        {head(cx, cy-28)}
        <path d={`M${cx-7},${cy-33} L${cx-5},${cy-42} L${cx},${cy-39} L${cx+5},${cy-42} L${cx+7},${cy-33}`} fill={YEL} stroke={INK} strokeWidth="1"/>
        <rect x={cx-14} y={cy+12} width={28} height={32} rx={1} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx} y1={cy-21} x2={cx} y2={cy+12} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-13} y1={cy-10} x2={cx+13} y2={cy-10} stroke={INK} strokeWidth="1"/>
        <line x1={cx-13} y1={cy-10} x2={cx-15} y2={cy+4} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+13} y1={cy-10} x2={cx+13} y2={cy+4} stroke={INK} strokeWidth="0.9"/>
        <ellipse cx={cx-13} cy={cy+6} rx={6} ry={4} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        <ellipse cx={cx+12} cy={cy+6} rx={6} ry={4} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+17} y1={cy-14} x2={cx+28} y2={cy+12} stroke={INK} strokeWidth="1.4"/>
        <polygon points={`${cx+26},${cy+12} ${cx+30},${cy+16} ${cx+22},${cy+16}`} fill={INK}/>
      </g>
    ),
    12: (
      <g>
        <line x1={cx} y1={cy-46} x2={cx} y2={cy+24} stroke={INK} strokeWidth="1.4"/>
        <line x1={cx-22} y1={cy-34} x2={cx+22} y2={cy-34} stroke={INK} strokeWidth="1.3"/>
        <rect x={cx-24} y={cy-46} width={8} height={13} fill={INK}/>
        <rect x={cx+16} y={cy-46} width={8} height={13} fill={INK}/>
        {head(cx, cy+30, 7)}
        <line x1={cx} y1={cy+23} x2={cx} y2={cy+12} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-11} y1={cy+18} x2={cx+11} y2={cy+18} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-11},${cy+2} Q${cx-18},${cy-8} ${cx-12},${cy-18}`} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+11},${cy+2} Q${cx+18},${cy-8} ${cx+12},${cy-18}`} fill={RED} stroke={INK} strokeWidth="1"/>
        <line x1={cx} y1={cy+12} x2={cx-11} y2={cy+2} stroke={INK} strokeWidth="1"/>
        <line x1={cx} y1={cy+12} x2={cx+11} y2={cy+2} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    13: (
      <g>
        <circle cx={cx-4} cy={cy-32} r={7} fill={PARCHMENT} stroke={INK} strokeWidth="1.2"/>
        {[cy-12,cy-18,cy-24].map((y,k)=>(
          <line key={k} x1={cx-8} y1={y} x2={cx} y2={y} stroke={INK} strokeWidth="0.9"/>
        ))}
        <line x1={cx-4} y1={cy-25} x2={cx-4} y2={cy} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-4} y1={cy} x2={cx-16} y2={cy+20} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-4} y1={cy} x2={cx+6} y2={cy+20} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-16} y1={cy-16} x2={cx+4} y2={cy-14} stroke={INK} strokeWidth="0.9"/>
        <path d={`M${cx+8},${cy-16} Q${cx+22},${cy-8} ${cx+18},${cy+8}`} fill="none" stroke={INK} strokeWidth="1.2"/>
        <line x1={cx+18} y1={cy+8} x2={cx-10} y2={cy+30} stroke={INK} strokeWidth="1.4"/>
        <polygon points={`${cx-10},${cy+30} ${cx-18},${cy+24} ${cx-6},${cy+26}`} fill={INK}/>
        <rect x={cx-16} y={cy+38} width={28} height={8} rx={1} fill={GRN} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    14: (
      <g>
        {head(cx, cy-28)}
        <path d={`M${cx-12},${cy-20} Q${cx-26},${cy-8} ${cx-14},${cy+6}`} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx+12},${cy-20} Q${cx+26},${cy-8} ${cx+14},${cy+6}`} fill={BLUE} stroke={INK} strokeWidth="1.1"/>
        <rect x={cx-8} y={cy-20} width={16} height={26} rx={1} fill={RED} stroke={INK} strokeWidth="1"/>
        <rect x={cx-20} y={cy+8} width={14} height={18} rx={1} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <rect x={cx+6} y={cy+8} width={14} height={18} rx={1} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-13},${cy+8} Q${cx},${cy+2} ${cx+13},${cy+8}`} fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="2,2"/>
        <path d={`M${cx-20},${cy+26} L${cx-20},${cy+46} L${cx+20},${cy+46} L${cx+20},${cy+26}`} fill={GRN} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    15: (
      <g>
        {head(cx, cy-24, 8)}
        <line x1={cx-8} y1={cy-28} x2={cx-16} y2={cy-42} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx+8} y1={cy-28} x2={cx+16} y2={cy-42} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx-12} y1={cy-44} x2={cx+12} y2={cy-38} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-12},${cy-14} Q${cx-20},${cy-2} ${cx-12},${cy+8}`} fill={INK} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx+12},${cy-14} Q${cx+20},${cy-2} ${cx+12},${cy+8}`} fill={INK} stroke={INK} strokeWidth="1"/>
        <rect x={cx-5} y={cy+2} width={10} height={20} rx={1} fill={INK}/>
        <line x1={cx} y1={cy-16} x2={cx} y2={cy+4} stroke={INK} strokeWidth="1.2"/>
        {head(cx-16, cy+24, 5)}
        {head(cx+16, cy+24, 5)}
        <line x1={cx-12} y1={cy+24} x2={cx-4} y2={cy+16} stroke={INK} strokeWidth="0.8"/>
        <line x1={cx+12} y1={cy+24} x2={cx+4} y2={cy+16} stroke={INK} strokeWidth="0.8"/>
        <line x1={cx-16} y1={cy+29} x2={cx-14} y2={cy+44} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx+16} y1={cy+29} x2={cx+14} y2={cy+44} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-16} y1={cy+44} x2={cx+16} y2={cy+44} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    16: (
      <g>
        <rect x={cx-15} y={cy-30} width={30} height={54} rx={1} fill={INK}/>
        <polygon points={`${cx-17},${cy-30} ${cx+17},${cy-30} ${cx},${cy-46}`} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx+22},${cy-42} L${cx+10},${cy-20} L${cx+17},${cy-18} L${cx+4},${cy}`} stroke={YEL} strokeWidth="2.5" fill="none"/>
        <line x1={cx-5} y1={cy-14} x2={cx+5} y2={cy-14} stroke={YEL} strokeWidth="2.5"/>
        {head(cx-22, cy+10, 5)}
        <line x1={cx-22} y1={cy+5} x2={cx-18} y2={cy-12} stroke={INK} strokeWidth="1"/>
        <line x1={cx-22} y1={cy+15} x2={cx-28} y2={cy+30} stroke={INK} strokeWidth="0.9"/>
        {head(cx+22, cy+20, 5)}
        <line x1={cx+22} y1={cy+15} x2={cx+18} y2={cy-2} stroke={INK} strokeWidth="1"/>
        <line x1={cx+22} y1={cy+25} x2={cx+28} y2={cy+40} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    17: (
      <g>
        <circle cx={cx} cy={cy-40} r={9} fill={YEL} stroke={INK} strokeWidth="1.2"/>
        {sun8(cx, cy-40, 9, 15, INK)}
        {[[-24,-28],[24,-28],[-30,-8],[30,-8],[-24,10],[24,10],[0,14]].map(([x,y],k)=>(
          <polygon key={k} points={`${cx+x},${cy+y-4} ${cx+x+3},${cy+y+3} ${cx+x-3},${cy+y+3}`} fill={YEL} stroke={INK} strokeWidth="0.7"/>
        ))}
        {head(cx-16, cy+16, 5)}
        <line x1={cx-16} y1={cy+21} x2={cx-16} y2={cy+40} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-24} y1={cy+30} x2={cx-8} y2={cy+30} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-16} y1={cy+40} x2={cx-24} y2={cy+48} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-16} y1={cy+40} x2={cx-8} y2={cy+48} stroke={INK} strokeWidth="0.9"/>
        <rect x={cx-4} y={cy+22} width={10} height={12} rx={1} fill={BLUE} stroke={INK} strokeWidth="0.9"/>
        <path d={`M${cx+1},${cy+34} Q${cx+8},${cy+40} ${cx+2},${cy+48}`} fill="none" stroke={INK} strokeWidth="0.9"/>
        <path d={`M${cx-28},${cy+46} Q${cx},${cy+42} ${cx+28},${cy+46}`} fill={BLUE} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    18: (
      <g>
        <circle cx={cx} cy={cy-30} r={15} fill={YEL} stroke={INK} strokeWidth="1.3"/>
        <circle cx={cx+7} cy={cy-30} r={11} fill={PARCHMENT} stroke="none"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*15} y1={cy-30+Math.sin(a*Math.PI/180)*15}
            x2={cx+Math.cos(a*Math.PI/180)*20} y2={cy-30+Math.sin(a*Math.PI/180)*20}
            stroke={INK} strokeWidth="0.8"/>
        ))}
        <rect x={cx-30} y={cy-4} width={12} height={30} fill={INK}/>
        <polygon points={`${cx-30},${cy-4} ${cx-18},${cy-4} ${cx-24},${cy-16}`} fill={INK}/>
        <rect x={cx+18} y={cy-4} width={12} height={30} fill={INK}/>
        <polygon points={`${cx+18},${cy-4} ${cx+30},${cy-4} ${cx+24},${cy-16}`} fill={INK}/>
        <ellipse cx={cx-14} cy={cy+24} rx={7} ry={9} fill={FLESH} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx-14} y1={cy+15} x2={cx-16} y2={cy+6} stroke={INK} strokeWidth="1"/>
        <ellipse cx={cx+14} cy={cy+24} rx={7} ry={9} fill={INK} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+14} y1={cy+15} x2={cx+16} y2={cy+6} stroke={INK} strokeWidth="1"/>
        <path d={`M${cx-4},${cy+40} Q${cx},${cy+32} ${cx+4},${cy+40}`} fill={BLUE} stroke={INK} strokeWidth="1"/>
        <rect x={cx-2} y={cx+40} width={4} height={6} rx={1} fill={BLUE} stroke={INK} strokeWidth="0.7"/>
        <line x1={cx-30} y1={cy+46} x2={cx+30} y2={cy+46} fill="none" stroke={INK} strokeWidth="1.1"/>
      </g>
    ),
    19: (
      <g>
        <circle cx={cx} cy={cy-24} r={18} fill={YEL} stroke={INK} strokeWidth="1.3"/>
        <circle cx={cx} cy={cy-24} r={11} fill={YEL} stroke={INK} strokeWidth="0.9"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*18} y1={cy-24+Math.sin(a*Math.PI/180)*18}
            x2={cx+Math.cos(a*Math.PI/180)*26} y2={cy-24+Math.sin(a*Math.PI/180)*26}
            stroke={INK} strokeWidth={a%60===0?1.4:0.8}/>
        ))}
        {head(cx-4, cy+10, 5)}
        <line x1={cx-4} y1={cy+15} x2={cx-4} y2={cy+30} stroke={INK} strokeWidth="1"/>
        <line x1={cx-12} y1={cy+21} x2={cx+4} y2={cy+21} stroke={INK} strokeWidth="0.9"/>
        <ellipse cx={cx+6} cy={cy+35} rx={15} ry={9} fill={RED} stroke={INK} strokeWidth="1.2"/>
        <line x1={cx-4} y1={cy+30} x2={cx+2} y2={cy+28} stroke={INK} strokeWidth="1"/>
        <line x1={cx+19} y1={cy+33} x2={cx+24} y2={cy+46} stroke={INK} strokeWidth="0.9"/>
        <line x1={cx-8} y1={cy+40} x2={cx-12} y2={cy+48} stroke={INK} strokeWidth="0.9"/>
      </g>
    ),
    20: (
      <g>
        {head(cx, cy-36, 8)}
        <path d={`M${cx-9},${cy-30} Q${cx-22},${cy-18} ${cx-11},${cy-6}`} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx+9},${cy-30} Q${cx+22},${cy-18} ${cx+11},${cy-6}`} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <line x1={cx+9} y1={cy-30} x2={cx+28} y2={cy-22} stroke={INK} strokeWidth="1.4"/>
        <ellipse cx={cx+30} cy={cy-20} rx={5} ry={10} fill={YEL} stroke={INK} strokeWidth="1"
          style={{transform:`rotate(-30deg)`,transformOrigin:`${cx+30}px ${cy-20}px`}}/>
        {head(cx-16, cy+14, 5)}
        <line x1={cx-16} y1={cy+8} x2={cx-16} y2={cy-2} stroke={INK} strokeWidth="1"/>
        <rect x={cx-26} y={cy+20} width={20} height={26} rx={1} fill={BLUE} stroke={INK} strokeWidth="1.1"/>
        {head(cx+4, cy+14, 5)}
        <line x1={cx+4} y1={cy+8} x2={cx+4} y2={cy-2} stroke={INK} strokeWidth="1"/>
        <rect x={cx-4} y={cy+20} width={20} height={26} rx={1} fill={RED} stroke={INK} strokeWidth="1.1"/>
        <path d={`M${cx-28},${cy+46} Q${cx},${cy+40} ${cx+28},${cy+46}`} fill={GRN} stroke={INK} strokeWidth="1"/>
      </g>
    ),
    21: (
      <g>
        <ellipse cx={cx} cy={cy} rx={24} ry={36} fill={GRN} stroke={INK} strokeWidth="1.4"/>
        {head(cx, cy, 9)}
        <line x1={cx} y1={cy-9} x2={cx} y2={cy-36} stroke={INK} strokeWidth="0.8"/>
        <line x1={cx} y1={cy+9} x2={cx} y2={cy+36} stroke={INK} strokeWidth="0.8"/>
        {[0,40,80,120,160,200,240,280,320].map(a=>(
          <ellipse key={a} cx={cx+Math.cos(a*Math.PI/180)*24} cy={cy+Math.sin(a*Math.PI/180)*36}
            rx={4} ry={6} fill={YEL} stroke={INK} strokeWidth="0.8"
            style={{transform:`rotate(${a+90}deg)`,transformOrigin:`${cx+Math.cos(a*Math.PI/180)*24}px ${cy+Math.sin(a*Math.PI/180)*36}px`}}/>
        ))}
        <text x={cx-28} y={cy-32} textAnchor="middle" fill={INK} fontSize="9" fontFamily="serif">♌</text>
        <text x={cx+28} y={cy-32} textAnchor="middle" fill={INK} fontSize="9" fontFamily="serif">♅</text>
        <text x={cx-28} y={cy+34} textAnchor="middle" fill={INK} fontSize="9" fontFamily="serif">♉</text>
        <text x={cx+28} y={cy+34} textAnchor="middle" fill={INK} fontSize="9" fontFamily="serif">♏</text>
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

// ── Court card figures ─────────────────────────────────────────────────────────
function CourtArt({ rank, suit, w, h }) {
  const cx = w / 2, cy = h / 2;
  const glyph = SUIT_GLYPH[suit] || '✦';
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

// ── Pip arrangements ───────────────────────────────────────────────────────────
function PipArt({ count, suit, w, h }) {
  const glyph = SUIT_GLYPH[suit] || '✦';
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

// ── CardFace ──────────────────────────────────────────────────────────────────
const RANK_TO_COUNT = { ace:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };
const COURT_RANKS = ['page','knight','queen','king'];

function CardFace({ card, reversed, large = false, w: wProp, h: hProp }) {
  const w = wProp ?? (large ? 252 : 192);
  const h = hProp ?? (large ? 418 : 318);

  const isMajor = card.type === 'major';
  const isCourt = COURT_RANKS.includes(card.rank);
  const pipCount = RANK_TO_COUNT[card.rank];

  const topLabel = isMajor
    ? ROMAN[card.id] || '☉'
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

// ── Card Back ─────────────────────────────────────────────────────────────────
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

// ── TarotOverlay ──────────────────────────────────────────────────────────────
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
    onLogDivination && onLogDivination({ kind: 'oracle', question: oracleQ.trim(), answer: `${result.card.name}${result.reversed ? ' · reversed' : ''}` });
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
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.5em] mb-1" style={F.scriptureSC}>· today's pull ·</div>
            <div className="text-[#9E2A33]/60 text-xs italic" style={F.scripture}>{pull.reversed ? 'drawn reversed' : 'drawn upright'}</div>
          </div>
          <CardFace card={pull.card} reversed={pull.reversed} large/>
          <div className="mt-8 max-w-sm mx-auto text-center space-y-3">
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{pull.card.name}{pull.reversed && ' · reversed'}</h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>"{pull.reversed ? pull.card.reversed : pull.card.upright}"</p>
            {pull.card.element && <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>· {pull.card.element} ·</div>}
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
          <p className="mt-10 text-center text-[#9E2A33]/40 text-[10px] italic" style={F.scripture}>· the deck remembers ·</p>
        </div>
      )}

      {mode === 'history' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· the deck remembers ·</div>
            <p className="text-[#9E2A33]/60 text-xs italic mt-1" style={F.scripture}>{historyEntries.length} days recorded</p>
          </div>
          {divinationLog.length > 0 && (
            <div className="mb-6 max-w-sm mx-auto">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]/60 mb-2" style={F.scriptureSC}>· questions asked ·</div>
              <div className="space-y-1">
                {divinationLog.slice(0, 8).map(d => (
                  <div key={d.id} className="px-3 py-2 border border-[#A89968]/15 bg-[#0A0204]/30">
                    <span className="text-[9px] uppercase tracking-wider text-[#9E2A33]/60" style={F.scriptureSC}>{d.kind === 'pendulum' ? '◯ pendulum' : '✦ oracle'}</span>
                    <p className="text-[#A8A29E] text-xs italic" style={F.scripture}>"{d.question}"</p>
                    <p className="text-[#C9A961] text-xs mt-0.5" style={F.scripture}>→ {d.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {historyEntries.length === 0 && divinationLog.length === 0 ? (
            <div className="text-center py-12 text-[#9E2A33]/40 text-sm italic" style={F.scripture}>· no pulls yet · today is your first ·</div>
          ) : historyEntries.length > 0 && (
            <div className="space-y-1 max-w-sm mx-auto">
              {historyEntries.map(entry => (
                <div key={entry.date} className="flex items-center gap-3 px-3 py-2 border border-[#A89968]/20 bg-[#0A0204]/40">
                  <div className="w-10 text-[10px] text-[#9E2A33]" style={F.mono}>{entry.date.slice(5).replace('-', '/')}</div>
                  <div className="w-7 h-10 border border-[#A89968]/40 flex items-center justify-center"
                    style={{ background: PARCHMENT, transform: entry.reversed ? 'rotate(180deg)' : 'none' }}>
                    <span className="text-base" style={{ color: INK }}>{entry.symbol || '✦'}</span>
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
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· ask the deck ·</div>
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
              <h2 className="text-[#F5F1E8] text-xl" style={F.brand}>{oracleAnswer.card.name}{oracleAnswer.reversed && ' · reversed'}</h2>
              <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>"{oracleAnswer.reversed ? oracleAnswer.card.reversed : oracleAnswer.card.upright}"</p>
              <button onClick={resetOracle} className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#9E2A33] hover:border-[#C9A961]" style={F.ui}>ask again</button>
            </div>
          )}
        </div>
      )}

      {mode === 'spread' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· past · present · future ·</div>
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
                    <div className="text-[9px] uppercase tracking-[0.3em] text-[#9E2A33]/60 mb-1" style={F.scriptureSC}>· {['past','present','future'][i]} ·</div>
                    <CardFace card={s.card} reversed={s.reversed} w={90} h={150}/>
                  </div>
                ))}
              </div>
              <div className="space-y-3 max-w-sm mx-auto">
                {spread.map((s, i) => (
                  <div key={i} className="border border-[#A89968]/20 bg-[#0A0204]/40 p-3">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]" style={F.scriptureSC}>· {['past','present','future'][i]} · {s.card.name}{s.reversed ? ' · reversed' : ''} ·</div>
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
          <button onClick={() => setBrowseCard(null)} className="text-[10px] uppercase tracking-wider text-[#9E2A33] hover:text-[#C9A961] mb-4" style={F.ui}>← back to deck</button>
          <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="text-[#9E2A33]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>
              · {browseCard.type === 'major' ? `arcanum ${String(browseCard.id).padStart(2,'0')}` : `${browseCard.suit} · ${browseCard.rank || ''}`} ·
            </div>
            <CardFace card={browseCard} large/>
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{browseCard.name}</h2>
            {browseCard.element && <div className="text-[#9E2A33]/70 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>· {browseCard.element} ·</div>}
            <div className="text-left space-y-3 pt-2">
              <div className="border border-[#C9A961]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] mb-1" style={F.scriptureSC}>· upright ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.scripture}>"{browseCard.upright}"</p>
              </div>
              <div className="border border-[#8B0000]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] mb-1" style={F.scriptureSC}>· reversed ·</div>
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
