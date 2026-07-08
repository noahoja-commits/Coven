import { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Clock, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TAROT_DECK, getDailyCard } from '../../data/tarot';

// ── Palette ────────────────────────────────────────────────────────────────────
const G = 'rgba(201,169,97,0.85)';
const G2 = 'rgba(201,169,97,0.45)';
const BG = '#110A06';

const ROMAN = ['☉','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];
const RANK_LABEL = { ace:'ACE', two:'II', three:'III', four:'IV', five:'V', six:'VI', seven:'VII', eight:'VIII', nine:'IX', ten:'X', page:'PAGE', knight:'KNIGHT', queen:'QUEEN', king:'KING' };
const SUIT_GLYPH = { wands:'🜂', cups:'🜄', swords:'🜁', pentacles:'🜃' };

// ── Pip layouts (traditional Tarot de Marseille positions, in % of card area) ──
const PIP_LAYOUTS = {
  1: [[50,50]],
  2: [[50,25],[50,75]],
  3: [[50,20],[50,50],[50,80]],
  4: [[25,25],[75,25],[25,75],[75,75]],
  5: [[25,20],[75,20],[50,50],[25,80],[75,80]],
  6: [[25,20],[75,20],[25,50],[75,50],[25,80],[75,80]],
  7: [[25,18],[75,18],[50,35],[25,52],[75,52],[25,75],[75,75]],
  8: [[25,15],[75,15],[25,36],[75,36],[25,57],[75,57],[25,78],[75,78]],
  9: [[25,14],[75,14],[25,33],[75,33],[50,50],[25,67],[75,67],[25,86],[75,86]],
  10: [[25,12],[75,12],[25,30],[75,30],[25,48],[75,48],[25,66],[75,66],[25,84],[75,84]],
};

// ── SVG Border (ornate double-frame with corner rosettes) ─────────────────────
function CardBorder({ w, h }) {
  const m = 6, i = 12;
  const cr = 3;
  return (
    <svg className="absolute inset-0 pointer-events-none" width={w} height={h} style={{ overflow: 'visible' }}>
      {/* Outer frame */}
      <rect x={m} y={m} width={w - m*2} height={h - m*2} rx={cr} fill="none" stroke={G} strokeWidth="1.2"/>
      {/* Inner frame */}
      <rect x={i} y={i} width={w - i*2} height={h - i*2} rx={1} fill="none" stroke={G} strokeWidth="0.7"/>
      {/* Corner rosettes */}
      {[[m,m],[w-m,m],[m,h-m],[w-m,h-m]].map(([cx,cy],k) => (
        <g key={k}>
          <circle cx={cx} cy={cy} r={4} fill={BG} stroke={G} strokeWidth="0.9"/>
          <circle cx={cx} cy={cy} r={1.5} fill={G}/>
        </g>
      ))}
      {/* Top/bottom diamond rule */}
      {[[w/2, m+4],[w/2, h-m-4]].map(([cx,cy],k) => (
        <g key={k}>
          <line x1={i+6} y1={cy} x2={cx-10} y2={cy} stroke={G2} strokeWidth="0.5"/>
          <polygon points={`${cx-4},${cy} ${cx},${cy-3} ${cx+4},${cy} ${cx},${cy+3}`} fill="none" stroke={G} strokeWidth="0.7"/>
          <line x1={cx+10} y1={cy} x2={w-i-6} y2={cy} stroke={G2} strokeWidth="0.5"/>
        </g>
      ))}
    </svg>
  );
}

// ── Major Arcana woodcut compositions ─────────────────────────────────────────
function MajorArt({ id, w, h }) {
  const cx = w / 2, cy = h / 2;
  const g = (a) => `rgba(201,169,97,${a})`;
  const s = { fill: 'none', stroke: G, strokeWidth: 1.1 };
  const st = { ...s, strokeWidth: 0.75 };

  const arts = {
    0: ( // The Fool — figure stepping forward, sun, dog
      <g>
        <circle cx={cx-18} cy={cy-35} r={16} {...st}/>
        <line x1={cx-18} y1={cy-19} x2={cx-18} y2={cy-35} stroke={G} strokeWidth="0.5"/>
        {[0,60,120,180,240,300].map(a=><line key={a} x1={cx-18+Math.cos(a*Math.PI/180)*12} y1={cy-35+Math.sin(a*Math.PI/180)*12} x2={cx-18+Math.cos(a*Math.PI/180)*20} y2={cy-35+Math.sin(a*Math.PI/180)*20} stroke={G} strokeWidth="0.8"/>)}
        <circle cx={cx+2} cy={cy-24} r={5} {...st}/>
        <line x1={cx+2} y1={cy-19} x2={cx+2} y2={cy+5} stroke={G} strokeWidth="1"/>
        <line x1={cx-10} y1={cy-12} x2={cx+14} y2={cy-10} stroke={G} strokeWidth="0.9"/>
        <line x1={cx+2} y1={cy+5} x2={cx-12} y2={cy+26} stroke={G} strokeWidth="0.9"/>
        <line x1={cx+2} y1={cy+5} x2={cx+16} y2={cy+24} stroke={G} strokeWidth="0.9"/>
        <line x1={cx+14} y1={cy-10} x2={cx+28} y2={cy-22} stroke={G} strokeWidth="0.9"/>
        <ellipse cx={cx-20} cy={cy+28} rx={9} ry={6} {...st}/>
        <line x1={cx-20} y1={cy+22} x2={cx-14} y2={cy+10} stroke={G} strokeWidth="0.8"/>
        <path d={`M${cx-28},${cy+40} Q${cx},${cy+46} ${cx+28},${cy+38}`} {...st}/>
      </g>
    ),
    1: ( // The Magician — figure at table, tools above, lemniscate
      <g>
        <path d={`M${cx-14},${cy-32} Q${cx},${cy-42} ${cx+14},${cy-32}`} {...st}/>
        <circle cx={cx} cy={cy-24} r={6} {...s}/>
        <line x1={cx} y1={cy-18} x2={cx} y2={cy+2} stroke={G} strokeWidth="1"/>
        <line x1={cx-12} y1={cy-10} x2={cx+12} y2={cy-8} stroke={G} strokeWidth="0.9"/>
        <line x1={cx} y1={cy+2} x2={cx-10} y2={cy+20} stroke={G} strokeWidth="0.9"/>
        <line x1={cx} y1={cy+2} x2={cx+10} y2={cy+20} stroke={G} strokeWidth="0.9"/>
        <rect x={cx-18} y={cy+22} width={36} height={4} rx={1} {...st}/>
        {[[-14,cy+14],[0,cy+16],[14,cy+14]].map(([x,y],k)=><circle key={k} cx={cx+x} cy={y} r={3} {...st}/>)}
        <line x1={cx+8} y1={cy-10} x2={cx+18} y2={cy-20} stroke={G} strokeWidth="0.9"/>
        <polygon points={`${cx+18},${cy-26} ${cx+22},${cy-20} ${cx+14},${cy-20}`} {...st}/>
      </g>
    ),
    2: ( // High Priestess — seated, two pillars, crescent moon
      <g>
        <line x1={cx-22} y1={cy-40} x2={cx-22} y2={cy+42} stroke={G} strokeWidth="1.3"/>
        <line x1={cx+22} y1={cy-40} x2={cx+22} y2={cy+42} stroke={G} strokeWidth="1.3"/>
        <rect x={cx-26} y={cy-44} width={8} height={6} {...st}/>
        <rect x={cx+18} y={cy-44} width={8} height={6} {...st}/>
        <path d={`M${cx-16},${cy-16} Q${cx},${cy-28} ${cx+16},${cy-16}`} fill="none" stroke={G} strokeWidth="0.8"/>
        <circle cx={cx} cy={cy-8} r={6} {...s}/>
        <path d={`M${cx+4},${cy-12} Q${cx+10},${cy-8} ${cx+4},${cy-4}`} fill={G} stroke={G} strokeWidth="0.5"/>
        <line x1={cx} y1={cy-2} x2={cx} y2={cy+20} stroke={G} strokeWidth="1"/>
        <path d={`M${cx-14},${cy+4} Q${cx},${cy+10} ${cx+14},${cy+4}`} {...st}/>
        <path d={`M${cx-16},${cy+20} Q${cx},${cy+30} ${cx+16},${cy+20}`} {...st}/>
        <path d={`M${cx-18},${cy+34} L${cx+18},${cy+34} L${cx+18},${cy+44} L${cx-18},${cy+44} Z`} {...st}/>
      </g>
    ),
    3: ( // The Empress — crowned, wheat, nature
      <g>
        <circle cx={cx} cy={cy-28} r={7} {...s}/>
        <path d={`M${cx-9},${cy-32} L${cx-6},${cy-42} L${cx},${cy-38} L${cx+6},${cy-42} L${cx+9},${cy-32}`} {...st}/>
        <line x1={cx} y1={cy-21} x2={cx} y2={cy+2} stroke={G} strokeWidth="1"/>
        <path d={`M${cx-14},${cy-14} Q${cx-20},${cy-4} ${cx-10},${cy+4}`} {...st}/>
        <path d={`M${cx+14},${cy-14} Q${cx+20},${cy-4} ${cx+10},${cy+4}`} {...st}/>
        <ellipse cx={cx} cy={cy+14} rx={16} ry={10} {...st}/>
        {[-18,-10,0,10,18].map((x,k)=>(
          <g key={k}>
            <line x1={cx+x} y1={cy+28} x2={cx+x} y2={cy+44} stroke={G} strokeWidth="0.8"/>
            <ellipse cx={cx+x} cy={cy+26} rx={3} ry={4} {...st}/>
          </g>
        ))}
      </g>
    ),
    4: ( // The Emperor — enthroned, orb, scepter
      <g>
        <rect x={cx-20} y={cy+14} width={40} height={28} rx={2} {...st}/>
        <line x1={cx-20} y1={cy+14} x2={cx-20} y2={cy-10} stroke={G} strokeWidth="1.2"/>
        <line x1={cx+20} y1={cy+14} x2={cx+20} y2={cy-10} stroke={G} strokeWidth="1.2"/>
        <path d={`M${cx-20},${cy-10} Q${cx},${cy-20} ${cx+20},${cy-10}`} {...st}/>
        <circle cx={cx} cy={cy-8} r={6} {...s}/>
        <path d={`M${cx-8},${cy-11} L${cx-4},${cy-18} L${cx},${cy-15} L${cx+4},${cy-18} L${cx+8},${cy-11}`} {...st}/>
        <line x1={cx} y1={cy-2} x2={cx} y2={cy+14} stroke={G} strokeWidth="1"/>
        <line x1={cx-10} y1={cy+2} x2={cx+10} y2={cy+2} stroke={G} strokeWidth="0.9"/>
        <circle cx={cx-14} cy={cy+26} r={5} {...st}/>
        <line x1={cx-18} y1={cy+22} x2={cx-26} y2={cy+14} stroke={G} strokeWidth="0.9"/>
        <circle cx={cx-26} cy={cy+12} r={2} fill={G}/>
        <line x1={cx+10} y1={cy+20} x2={cx+20} y2={cy+20} stroke={G} strokeWidth="1.2"/>
        <line x1={cx+20} y1={cy+16} x2={cx+20} y2={cy+34} stroke={G} strokeWidth="1.2"/>
      </g>
    ),
    5: ( // The Hierophant — robed, two acolytes, triple crown
      <g>
        <circle cx={cx} cy={cy-28} r={6} {...s}/>
        <rect x={cx-4} y={cy-44} width={8} height={18} rx={1} {...st}/>
        <rect x={cx-7} y={cy-42} width={14} height={3} {...st}/>
        <rect x={cx-9} y={cy-38} width={18} height={3} {...st}/>
        <line x1={cx} y1={cy-22} x2={cx} y2={cy+10} stroke={G} strokeWidth="1.1"/>
        <path d={`M${cx-14},${cy-14} Q${cx-18},${cy} ${cx-10},${cy+10}`} {...st}/>
        <path d={`M${cx+14},${cy-14} Q${cx+18},${cy} ${cx+10},${cy+10}`} {...st}/>
        <path d={`M${cx-16},${cy+10} L${cx+16},${cy+10} L${cx+14},${cy+44} L${cx-14},${cy+44} Z`} {...st}/>
        <circle cx={cx-20} cy={cy+16} r={4} {...st}/>
        <circle cx={cx+20} cy={cy+16} r={4} {...st}/>
        <line x1={cx-16} y1={cy+16} x2={cx-12} y2={cy+38} stroke={G} strokeWidth="0.9"/>
        <line x1={cx+16} y1={cy+16} x2={cx+12} y2={cy+38} stroke={G} strokeWidth="0.9"/>
        <line x1={cx-8} y1={cy+2} x2={cx+8} y2={cy+2} stroke={G} strokeWidth="0.8"/>
      </g>
    ),
    6: ( // The Lovers — two figures, angel above
      <g>
        <circle cx={cx} cy={cy-36} r={8} {...st}/>
        <path d={`M${cx-8},${cy-30} Q${cx-16},${cy-18} ${cx-8},${cy-4}`} {...st}/>
        <path d={`M${cx+8},${cy-30} Q${cx+16},${cy-18} ${cx+8},${cy-4}`} {...st}/>
        <line x1={cx} y1={cy-28} x2={cx} y2={cy-14} stroke={G} strokeWidth="0.8"/>
        <circle cx={cx-18} cy={cy-4} r={5} {...s}/>
        <line x1={cx-18} y1={cy+1} x2={cx-18} y2={cy+22} stroke={G} strokeWidth="0.9"/>
        <line x1={cx-26} y1={cy+10} x2={cx-10} y2={cy+10} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-18} y1={cy+22} x2={cx-24} y2={cy+40} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-18} y1={cy+22} x2={cx-12} y2={cy+40} stroke={G} strokeWidth="0.8"/>
        <circle cx={cx+18} cy={cy-4} r={5} {...s}/>
        <line x1={cx+18} y1={cy+1} x2={cx+18} y2={cy+22} stroke={G} strokeWidth="0.9"/>
        <line x1={cx+10} y1={cy+10} x2={cx+26} y2={cy+10} stroke={G} strokeWidth="0.8"/>
        <line x1={cx+18} y1={cy+22} x2={cx+12} y2={cy+40} stroke={G} strokeWidth="0.8"/>
        <line x1={cx+18} y1={cy+22} x2={cx+24} y2={cy+40} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-12} y1={cy+2} x2={cx+12} y2={cy+2} stroke={G} strokeWidth="0.6"/>
      </g>
    ),
    7: ( // The Chariot — chariot, two sphinxes
      <g>
        <rect x={cx-22} y={cy-10} width={44} height={28} rx={1} {...st}/>
        <line x1={cx-22} y1={cy-10} x2={cx-14} y2={cy-32} stroke={G} strokeWidth="1"}/>
        <line x1={cx+22} y1={cy-10} x2={cx+14} y2={cy-32} stroke={G} strokeWidth="1"}/>
        <line x1={cx-14} y1={cy-32} x2={cx+14} y2={cy-32} stroke={G} strokeWidth="1.2"}/>
        <circle cx={cx} cy={cy-20} r={6} {...s}/>
        <path d={`M${cx-6},${cy-24} L${cx-4},${cy-32} L${cx},${cy-28} L${cx+4},${cy-32} L${cx+6},${cy-24}`} {...st}/>
        <circle cx={cx} cy={cy+6} r={8} {...st}/>
        <circle cx={cx-18} cy={cy+30} r={6} {...st}/>
        <line x1={cx-16} y1={cy+26} x2={cx-14} y2={cy+18} stroke={G} strokeWidth="0.8"/>
        <circle cx={cx+18} cy={cy+30} r={6} {...st}/>
        <line x1={cx+16} y1={cy+26} x2={cx+14} y2={cy+18} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-22} y1={cy+18} x2={cx+22} y2={cy+18} stroke={G} strokeWidth="1"}/>
      </g>
    ),
    8: ( // Strength — woman and lion
      <g>
        <circle cx={cx-8} cy={cy-28} r={6} {...s}/>
        <path d={`M${cx-16},${cy-24} Q${cx-24},${cy-14} ${cx-14},${cy-4}`} {...st}/>
        <path d={`M${cx},${cy-24} Q${cx+8},${cy-14} ${cx},${cy-4}`} {...st}/>
        <line x1={cx-8} y1={cy-22} x2={cx-8} y2={cy-4} stroke={G} strokeWidth="0.9"/>
        <path d={`M${cx+4},${cy-14} Q${cx+12},${cy-20} ${cx+18},${cy-10} Q${cx+22},${cy} ${cx+16},${cy+6}`} {...st}/>
        <ellipse cx={cx+12} cy={cy+10} rx={16} ry={10} {...st}/>
        <path d={`M${cx+4},${cy+6} Q${cx+2},${cy+14} ${cx+8},${cy+20}`} {...st}/>
        <line x1={cx+24} y1={cy+16} x2={cx+30} y2={cy+28} stroke={G} strokeWidth="0.9"/>
        <path d={`M${cx-4},${cy-4} Q${cx+4},${cy+4} ${cx+2},${cy+14}`} {...st}/>
        <line x1={cx-14} y1={cy-4} x2={cx-10} y2={cy+10} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-10} y1={cy+10} x2={cx-14} y2={cy+28} stroke={G} strokeWidth="0.8"/>
        <line x1={cx-10} y1={cy+10} x2={cx-4} y2={cy+28} stroke={G} strokeWidth="0.8"/>
      </g>
    ),
    9: ( // The Hermit — robed figure, lantern, staff
      <g>
        <circle cx={cx-4} cy={cy-30} r={6} {...s}/>
        <path d={`M${cx-10},${cy-26} Q${cx-16},${cy-16} ${cx-8},${cy-6}`} {...st}/>
        <path d={`M${cx+2},${cy-26} Q${cx+8},${cy-16} ${cx+2},${cy-6}`} {...st}/>
        <line x1={cx-4} y1={cy-24} x2={cx-4} y2={cy-6} stroke={G} strokeWidth="0.9"/>
        <line x1={cx-12} y1={cy-14} x2={cx+4} y2={cy-14} stroke={G} strokeWidth="0.8"/>
        <path d={`M${cx-8},${cy-6} L${cx+2},${cy-6} L${cx+4},${cy+18} L${cx-10},${cy+18} Z`} {...st}/>
        <path d={`M${cx-10},${cy+18} L${cx+4},${cy+18} L${cx+2},${cy+44} L${cx-8},${cy+44} Z`} {...st}/>
        <line x1={cx+8} y1={cy-10} x2={cx+8} y2={cy+44} stroke={G} strokeWidth="1.3"/>
        <path d={`M${cx+6},${cy-10} L${cx+8},${cy-20} L${cx+10},${cy-10}`} {...st}/>
        <rect x={cx+14} y={cy-6} width={12} height={14} rx={1} {...st}/>
        <circle cx={cx+20} cy={cy} r={4} fill={G} stroke={G} strokeWidth="0.5"/>
        <line x1={cx+8} y1={cy-2} x2={cx+14} y2={cy-2} stroke={G} strokeWidth="0.7"/>
      </g>
    ),
    10: ( // Wheel of Fortune — great wheel, symbols
      <g>
        <circle cx={cx} cy={cy} r={30} {...st}/>
        <circle cx={cx} cy={cy} r={18} {...st}/>
        <circle cx={cx} cy={cy} r={6} {...s}/>
        {[0,45,90,135,180,225,270,315].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*6} y1={cy+Math.sin(a*Math.PI/180)*6}
            x2={cx+Math.cos(a*Math.PI/180)*18} y2={cy+Math.sin(a*Math.PI/180)*18}
            stroke={G} strokeWidth="0.9"/>
        ))}
        {[0,90,180,270].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*18} y1={cy+Math.sin(a*Math.PI/180)*18}
            x2={cx+Math.cos(a*Math.PI/180)*30} y2={cy+Math.sin(a*Math.PI/180)*30}
            stroke={G} strokeWidth="1"/>
        ))}
        {['T','A','R','O'].map((l,k)=>(
          <text key={k} x={cx+Math.cos((k*90-90)*Math.PI/180)*24} y={cy+Math.sin((k*90-90)*Math.PI/180)*24+4}
            textAnchor="middle" fill={G} fontSize="7" fontFamily="serif">{l}</text>
        ))}
      </g>
    ),
    11: ( // Justice — scales, sword
      <g>
        <circle cx={cx} cy={cy-28} r={6} {...s}/>
        <path d={`M${cx-7},${cy-31} L${cx-5},${cy-40} L${cx},${cy-37} L${cx+5},${cy-40} L${cx+7},${cy-31}`} {...st}/>
        <line x1={cx} y1={cy-22} x2={cx} y2={cy+14} stroke={G} strokeWidth="1"}/>
        <line x1={cx-12} y1={cy-10} x2={cx+12} y2={cy-10} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-12} y1={cy-10} x2={cx-14} y2={cy+2} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx+12} y1={cy-10} x2={cx+12} y2={cy+2} stroke={G} strokeWidth="0.8"}/>
        <ellipse cx={cx-13} cy={cy+4} rx={5} ry={3} {...st}/>
        <ellipse cx={cx+12} cy={cy+4} rx={5} ry={3} {...st}/>
        <line x1={cx+16} y1={cy-14} x2={cx+26} y2={cy+10} stroke={G} strokeWidth="1.3"}/>
        <polygon points={`${cx+24},${cy+10} ${cx+28},${cy+14} ${cx+20},${cy+14}`} fill={G} stroke={G} strokeWidth="0.5"/>
        <path d={`M${cx-14},${cy+14} L${cx+14},${cy+14} L${cx+10},${cy+44} L${cx-10},${cy+44} Z`} {...st}/>
      </g>
    ),
    12: ( // The Hanged Man — figure upside down on cross
      <g>
        <line x1={cx} y1={cy-44} x2={cx} y2={cy+24} stroke={G} strokeWidth="1.3"}/>
        <line x1={cx-20} y1={cy-32} x2={cx+20} y2={cy-32} stroke={G} strokeWidth="1.2"}/>
        <circle cx={cx} cy={cy+30} r={6} {...s}/>
        <line x1={cx} y1={cy+24} x2={cx} y2={cy+14} stroke={G} strokeWidth="1"}/>
        <line x1={cx-10} y1={cy+18} x2={cx+10} y2={cy+18} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx} y1={cy+14} x2={cx-10} y2={cy+2} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx} y1={cy+14} x2={cx+10} y2={cy+2} stroke={G} strokeWidth="0.9"}/>
        <path d={`M${cx-6},${cy+2} Q${cx-14},${cy-6} ${cx-10},${cy-14}`} {...st}/>
        <path d={`M${cx-6},${cy+2} L${cx-10},${cy-44}`} stroke="none"/>
        {[cy-44,cy-36,cy-26].map((y,k)=>(
          <line key={k} x1={cx-3} y1={y} x2={cx-3} y2={y+6} stroke={G} strokeWidth="1.3"/>
        ))}
      </g>
    ),
    13: ( // Death — skeleton, scythe, fallen figure
      <g>
        <circle cx={cx-4} cy={cy-32} r={7} {...st}/>
        <line x1={cx-4} y1={cy-25} x2={cx-4} y2={cy-2} stroke={G} strokeWidth="1"}/>
        {[-3,-8,-13,-18,-23].map((y,k)=>(
          <line key={k} x1={cx-8} y1={cy+y} x2={cx} y2={cy+y} stroke={G} strokeWidth="0.7"/>
        ))}
        <line x1={cx-4} y1={cy-2} x2={cx-14} y2={cy+18} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-4} y1={cy-2} x2={cx+4} y2={cy+18} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-14} y1={cy-14} x2={cx+4} y2={cy-12} stroke={G} strokeWidth="0.8"}/>
        <path d={`M${cx+6},${cy-16} Q${cx+20},${cy-8} ${cx+16},${cy+8}`} {...st}/>
        <line x1={cx+16} y1={cy+8} x2={cx-10} y2={cy+28} stroke={G} strokeWidth="1.3"}/>
        <polygon points={`${cx-10},${cy+28} ${cx-18},${cy+22} ${cx-6},${cy+24}`} fill={G} stroke={G} strokeWidth="0.5"/>
        <ellipse cx={cx-4} cy={cy+38} rx={14} ry={4} {...st}/>
      </g>
    ),
    14: ( // Temperance — angel, two cups, water
      <g>
        <circle cx={cx} cy={cy-28} r={7} {...s}/>
        <path d={`M${cx-12},${cy-20} Q${cx-24},${cy-8} ${cx-14},${cy+4}`} {...st}/>
        <path d={`M${cx+12},${cy-20} Q${cx+24},${cy-8} ${cx+14},${cy+4}`} {...st}/>
        <path d={`M${cx-6},${cy-22} Q${cx-14},${cy-10} ${cx-8},${cy+4}`} {...st}/>
        <path d={`M${cx+6},${cy-22} Q${cx+14},${cy-10} ${cx+8},${cy+4}`} {...st}/>
        <line x1={cx} y1={cy-21} x2={cx} y2={cy+4} stroke={G} strokeWidth="1"}/>
        <line x1={cx-10} y1={cy-6} x2={cx+10} y2={cy-6} stroke={G} strokeWidth="0.9"}/>
        <rect x={cx-18} y={cy+6} width={12} height={16} rx={1} {...st}/>
        <rect x={cx+6} y={cy+6} width={12} height={16} rx={1} {...st}/>
        <path d={`M${cx-12},${cy+6} Q${cx},${cy} ${cx+12},${cy+6}`} fill="none" stroke={G} strokeWidth="0.7" strokeDasharray="2,2"/>
        <path d={`M${cx-18},${cy+22} L${cx-18},${cy+44} L${cx+18},${cy+44} L${cx+18},${cy+22}`} {...st}/>
      </g>
    ),
    15: ( // The Devil — horned figure, two bound figures
      <g>
        <circle cx={cx} cy={cy-22} r={7} {...s}/>
        <path d={`M${cx-7},${cy-26} L${cx-14},${cy-38} M${cx+7},${cy-26} L${cx+14},${cy-38}`} stroke={G} strokeWidth="1"}/>
        <line x1={cx-10} y1={cy-40} x2={cx+10} y2={cy-34} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx} y1={cy-15} x2={cx} y2={cy+2} stroke={G} strokeWidth="1.1"}/>
        <path d={`M${cx-10},${cy-12} Q${cx-18},${cy-2} ${cx-10},${cy+6}`} {...st}/>
        <path d={`M${cx+10},${cy-12} Q${cx+18},${cy-2} ${cx+10},${cy+6}`} {...st}/>
        <line x1={cx-10} y1={cy+6} x2={cx+10} y2={cy+6} stroke={G} strokeWidth="0.8"}/>
        <rect x={cx-4} y={cy+2} width={8} height={18} rx={1} {...st}/>
        <circle cx={cx-16} cy={cy+22} r={4} {...st}/>
        <circle cx={cx+16} cy={cy+22} r={4} {...st}/>
        <line x1={cx-12} y1={cy+22} x2={cx-4} y2={cy+14} stroke={G} strokeWidth="0.7"}/>
        <line x1={cx+12} y1={cy+22} x2={cx+4} y2={cy+14} stroke={G} strokeWidth="0.7"}/>
        <line x1={cx-16} y1={cy+26} x2={cx-14} y2={cy+40} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx+16} y1={cy+26} x2={cx+14} y2={cy+40} stroke={G} strokeWidth="0.8"}/>
        <path d={`M${cx-16},${cy+40} L${cx+16},${cy+40}`} stroke={G} strokeWidth="0.8"}/>
      </g>
    ),
    16: ( // The Tower — struck by lightning, figures falling
      <g>
        <rect x={cx-14} y={cy-30} width={28} height={52} rx={1} {...st}/>
        <polygon points={`${cx-16},${cy-30} ${cx+16},${cy-30} ${cx},${cy-44}`} {...st}/>
        <path d={`M${cx+20},${cy-40} L${cx+10},${cy-20} L${cx+16},${cy-18} L${cx+4},${cy+2}`} stroke={G} strokeWidth="1.4"}/>
        <line x1={cx-4} y1={cy-16} x2={cx+4} y2={cy-16} stroke={G} strokeWidth="2"}/>
        <circle cx={cx-22} cy={cy+10} r={4} {...st}/>
        <line x1={cx-22} y1={cy+6} x2={cx-18} y2={cy-10} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-22} y1={cy+14} x2={cx-26} y2={cy+28} stroke={G} strokeWidth="0.8"}/>
        <circle cx={cx+22} cy={cy+20} r={4} {...st}/>
        <line x1={cx+22} y1={cy+16} x2={cx+18} y2={cy} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx+22} y1={cy+24} x2={cx+28} y2={cy+38} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx-4} y1={cy-4} x2={cx+4} y2={cy+4} stroke={G} strokeWidth="0.7"}/>
        <line x1={cx-4} y1={cy+14} x2={cx+4} y2={cy+14} stroke={G} strokeWidth="0.7"}/>
      </g>
    ),
    17: ( // The Star — kneeling figure, stars, water
      <g>
        {[[0,-40],[22,-30],[-22,-30],[30,-8],[-30,-8],[22,10],[-22,10],[0,14]].map(([x,y],k)=>(
          <polygon key={k} points={`${cx+x},${cy+y-4} ${cx+x+2},${cy+y+2} ${cx+x-2},${cy+y+2}`} fill={G}/>
        ))}
        <circle cx={cx} cy={cy-40} r={7} {...s}/>
        <circle cx={cx-16} cy={cy+16} r={5} {...s}/>
        <line x1={cx-16} y1={cy+21} x2={cx-16} y2={cy+38} stroke={G} strokeWidth="1"}/>
        <line x1={cx-22} y1={cy+28} x2={cx-10} y2={cy+28} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx-16} y1={cy+38} x2={cx-24} y2={cy+46} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx-16} y1={cy+38} x2={cx-8} y2={cy+46} stroke={G} strokeWidth="0.8"}/>
        <rect x={cx-4} y={cy+20} width={8} height={10} rx={1} {...st}/>
        <path d={`M${cx},${cy+30} Q${cx+6},${cy+36} ${cx},${cy+44}`} {...st}/>
        <path d={`M${cx+4},${cy+34} Q${cx+14},${cy+38} ${cx+8},${cy+46}`} {...st}/>
        <path d={`M${cx-28},${cy+44} Q${cx},${cy+40} ${cx+28},${cy+44}`} {...st}/>
      </g>
    ),
    18: ( // The Moon — full moon, two towers, dog and wolf, crayfish
      <g>
        <circle cx={cx} cy={cy-30} r={14} {...st}/>
        <circle cx={cx+6} cy={cy-30} r={10} fill={BG} stroke="none"/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*14} y1={cy-30+Math.sin(a*Math.PI/180)*14}
            x2={cx+Math.cos(a*Math.PI/180)*18} y2={cy-30+Math.sin(a*Math.PI/180)*18}
            stroke={G} strokeWidth="0.6"/>
        ))}
        <rect x={cx-28} y={cy-4} width={10} height={28} {...st}/>
        <polygon points={`${cx-28},${cy-4} ${cx-18},${cy-4} ${cx-23},${cy-14}`} {...st}/>
        <rect x={cx+18} y={cy-4} width={10} height={28} {...st}/>
        <polygon points={`${cx+18},${cy-4} ${cx+28},${cy-4} ${cx+23},${cy-14}`} {...st}/>
        <ellipse cx={cx-14} cy={cy+22} rx={6} ry={8} {...st}/>
        <line x1={cx-14} y1={cy+14} x2={cx-16} y2={cy+6} stroke={G} strokeWidth="0.9"}/>
        <ellipse cx={cx+14} cy={cy+22} rx={6} ry={8} {...st}/>
        <line x1={cx+14} y1={cy+14} x2={cx+16} y2={cy+6} stroke={G} strokeWidth="0.9"}/>
        <path d={`M${cx-4},${cy+38} Q${cx},${cy+30} ${cx+4},${cy+38}`} {...st}/>
        <circle cx={cx} cy={cy+42} r={3} {...st}/>
        <path d={`M${cx-28},${cy+44} L${cx+28},${cy+44}`} {...st}/>
      </g>
    ),
    19: ( // The Sun — radiant sun, child on horse
      <g>
        <circle cx={cx} cy={cy-24} r={16} {...s}/>
        <circle cx={cx} cy={cy-24} r={10} {...s}/>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map(a=>(
          <line key={a} x1={cx+Math.cos(a*Math.PI/180)*16} y1={cy-24+Math.sin(a*Math.PI/180)*16}
            x2={cx+Math.cos(a*Math.PI/180)*24} y2={cy-24+Math.sin(a*Math.PI/180)*24}
            stroke={G} strokeWidth={a%60===0?1.2:0.7}/>
        ))}
        <circle cx={cx-4} cy={cy+10} r={5} {...s}/>
        <line x1={cx-4} y1={cy+15} x2={cx-4} y2={cy+30} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-12} y1={cy+20} x2={cx+4} y2={cy+20} stroke={G} strokeWidth="0.8"}/>
        <ellipse cx={cx+6} cy={cy+34} rx={14} ry={8} {...st}/>
        <line x1={cx-4} y1={cy+30} x2={cx+2} y2={cy+28} stroke={G} strokeWidth="0.9"}/>
        <line x1={cx-4} y1={cy+30} x2={cx-10} y2={cy+34} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx+18} y1={cy+32} x2={cx+24} y2={cy+44} stroke={G} strokeWidth="0.8"}/>
        <line x1={cx-8} y1={cy+38} x2={cx-12} y2={cy+46} stroke={G} strokeWidth="0.8"}/>
      </g>
    ),
    20: ( // Judgement — angel with trumpet, rising figures
      <g>
        <circle cx={cx} cy={cy-36} r={7} {...st}/>
        <path d={`M${cx-8},${cy-32} Q${cx-20},${cy-20} ${cx-10},${cy-8}`} {...st}/>
        <path d={`M${cx+8},${cy-32} Q${cx+20},${cy-20} ${cx+10},${cy-8}`} {...st}/>
        <path d={`M${cx+8},${cy-32} L${cx+26},${cy-24}`} stroke={G} strokeWidth="1.3"}/>
        <ellipse cx={cx+28} cy={cy-22} rx={4} ry={8} style={{transform:`rotate(-30deg)`,transformOrigin:`${cx+28}px ${cy-22}px`}} {...st}/>
        <circle cx={cx-16} cy={cy+14} r={5} {...st}/>
        <line x1={cx-16} y1={cy+8} x2={cx-16} y2={cy-4} stroke={G} strokeWidth="0.9"}/>
        <rect x={cx-24} y={cy+18} width={16} height={24} rx={1} {...st}/>
        <circle cx={cx+4} cy={cy+14} r={5} {...st}/>
        <line x1={cx+4} y1={cy+8} x2={cx+4} y2={cy-4} stroke={G} strokeWidth="0.9"}/>
        <rect x={cx-4} y={cy+18} width={16} height={24} rx={1} {...st}/>
        <path d={`M${cx-28},${cy+44} Q${cx},${cy+38} ${cx+28},${cy+44}`} {...st}/>
      </g>
    ),
    21: ( // The World — dancing figure in wreath, four symbols
      <g>
        <ellipse cx={cx} cy={cy} rx={22} ry={34} {...st}/>
        <circle cx={cx} cy={cy} r={8} {...s}/>
        <line x1={cx} y1={cy-8} x2={cx} y2={cy-34} stroke={G} strokeWidth="0.7"}/>
        <line x1={cx} y1={cy+8} x2={cx} y2={cy+34} stroke={G} strokeWidth="0.7"}/>
        {[0,40,80,120,160,200,240,280,320].map(a=>(
          <ellipse key={a} cx={cx+Math.cos(a*Math.PI/180)*22} cy={cy+Math.sin(a*Math.PI/180)*34}
            rx={3} ry={5} style={{transform:`rotate(${a+90}deg)`,transformOrigin:`${cx+Math.cos(a*Math.PI/180)*22}px ${cy+Math.sin(a*Math.PI/180)*34}px`}}
            fill="none" stroke={G} strokeWidth="0.7"/>
        ))}
        <text x={cx-26} y={cy-30} textAnchor="middle" fill={G} fontSize="8" fontFamily="serif">♌</text>
        <text x={cx+26} y={cy-30} textAnchor="middle" fill={G} fontSize="8" fontFamily="serif">♅</text>
        <text x={cx-26} y={cy+32} textAnchor="middle" fill={G} fontSize="8" fontFamily="serif">♉</text>
        <text x={cx+26} y={cy+32} textAnchor="middle" fill={G} fontSize="8" fontFamily="serif">♏</text>
      </g>
    ),
  };
  return arts[id] || (
    <g>
      <circle cx={cx} cy={cy} r={26} {...st}/>
      <text x={cx} y={cy+5} textAnchor="middle" fill={G} fontSize="22" fontFamily="serif">{ROMAN[id]}</text>
    </g>
  );
}

// ── Court card figures ─────────────────────────────────────────────────────────
function CourtArt({ rank, suit, w, h }) {
  const cx = w / 2, cy = h / 2;
  const glyph = SUIT_GLYPH[suit] || '✦';
  const s = { fill: 'none', stroke: G, strokeWidth: 1.1 };
  const st = { ...s, strokeWidth: 0.75 };
  const isKing = rank === 'king', isQueen = rank === 'queen';
  const isKnight = rank === 'knight';

  return (
    <g>
      {/* Throne pillars for king/queen */}
      {(isKing || isQueen) && <>
        <line x1={cx-22} y1={cy-40} x2={cx-22} y2={cy+44} stroke={G} strokeWidth="1.2"/>
        <line x1={cx+22} y1={cy-40} x2={cx+22} y2={cy+44} stroke={G} strokeWidth="1.2"/>
        <rect x={cx-26} y={cy-44} width={8} height={6} {...st}/>
        <rect x={cx+18} y={cy-44} width={8} height={6} {...st}/>
      </>}
      {/* Head */}
      <circle cx={isKnight ? cx-6 : cx} cy={cy-28} r={7} {...s}/>
      {/* Crown */}
      {(isKing || isQueen) && (
        <path d={`M${cx-9},${cy-32} L${cx-6},${cy-44} L${cx},${cy-38} L${cx+6},${cy-44} L${cx+9},${cy-32}`} {...st}/>
      )}
      {/* Horse for knight */}
      {isKnight && <>
        <ellipse cx={cx+10} cy={cy+10} rx={18} ry={10} {...st}/>
        <line x1={cx+26} y1={cy+6} x2={cx+30} y2={cy-10} stroke={G} strokeWidth="1"/>
        <circle cx={cx+30} cy={cy-12} r={5} {...st}/>
        <line x1={cx-8} y1={cy+14} x2={cx-10} y2={cy+30} stroke={G} strokeWidth="1"/>
        <line x1={cx+2} y1={cy+18} x2={cx+2} y2={cy+32} stroke={G} strokeWidth="1"/>
        <line x1={cx+14} y1={cy+18} x2={cx+16} y2={cy+32} stroke={G} strokeWidth="1"/>
        <line x1={cx+26} y1={cy+14} x2={cx+28} y2={cy+30} stroke={G} strokeWidth="1"/>
      </>}
      {/* Body */}
      {!isKnight && <>
        <line x1={isKing || isQueen ? cx : cx} y1={cy-21} x2={cx} y2={cy+6} stroke={G} strokeWidth="1"/>
        <line x1={cx-12} y1={cy-12} x2={cx+12} y2={cy-12} stroke={G} strokeWidth="0.9"/>
        <path d={`M${cx-12},${cy+6} L${cx-14},${cy+44} L${cx+14},${cy+44} L${cx+12},${cy+6} Z`} {...st}/>
        <line x1={cx} y1={cy+6} x2={cx-10} y2={cy+22} stroke={G} strokeWidth="0.9"/>
        <line x1={cx} y1={cy+6} x2={cx+10} y2={cy+22} stroke={G} strokeWidth="0.9"/>
      </>}
      {/* Suit glyph attribute */}
      <text x={cx-14} y={cy+36} textAnchor="middle" fill={G} fontSize="10" fontFamily="serif">{glyph}</text>
    </g>
  );
}

// ── Pip arrangements ───────────────────────────────────────────────────────────
function PipArt({ count, suit, w, h }) {
  const glyph = SUIT_GLYPH[suit] || '✦';
  const layout = PIP_LAYOUTS[Math.min(count, 10)] || PIP_LAYOUTS[1];
  const areaW = w - 32, areaH = h - 64;
  const startX = 16, startY = 32;
  return (
    <g>
      {layout.map(([px, py], k) => {
        const x = startX + (px / 100) * areaW;
        const y = startY + (py / 100) * areaH;
        const flipped = py > 50;
        return (
          <text key={k} x={x} y={y + 5}
            textAnchor="middle"
            fill={G}
            fontSize={count === 1 ? '20' : '11'}
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

function CardFace({ card, reversed, large = false }) {
  const w = large ? 252 : 192;
  const h = large ? 418 : 318;

  const isMajor = card.type === 'major';
  const isCourt = COURT_RANKS.includes(card.rank);
  const pipCount = RANK_TO_COUNT[card.rank];

  const topLabel = isMajor
    ? ROMAN[card.id] || '☉'
    : (RANK_LABEL[card.rank] || card.rank?.toUpperCase() || '');
  const suitLabel = !isMajor ? (card.suit?.toUpperCase() || '') : (card.element?.toUpperCase() || '');
  const cardName = card.name?.toUpperCase() || '';

  return (
    <div className="relative mx-auto select-none"
      style={{
        width: w, height: h,
        background: `linear-gradient(170deg, #1C0D08 0%, #110806 50%, #180D0A 100%)`,
        transform: reversed ? 'rotate(180deg)' : 'none',
        boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.4)',
      }}>

      {/* Crosshatch texture */}
      <svg className="absolute inset-0 pointer-events-none opacity-[0.06]" width={w} height={h}>
        <defs>
          <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="6" x2="6" y2="0" stroke="#C9A961" strokeWidth="0.4"/>
            <line x1="-1" y1="1" x2="1" y2="-1" stroke="#C9A961" strokeWidth="0.4"/>
            <line x1="5" y1="7" x2="7" y2="5" stroke="#C9A961" strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#hatch)"/>
      </svg>

      {/* Ornate border */}
      <CardBorder w={w} h={h}/>

      {/* Top band */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4 pb-1"
        style={{ top: 14 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: large ? 11 : 9, color: 'rgba(201,169,97,0.9)', letterSpacing: '0.15em' }}>
          {topLabel}
        </span>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: large ? 9 : 8, color: 'rgba(201,169,97,0.6)', letterSpacing: '0.1em' }}>
          {suitLabel}
        </span>
      </div>
      <svg className="absolute left-0 right-0 pointer-events-none" style={{ top: 30, width: w, height: 1 }}>
        <line x1={16} y1={0} x2={w-16} y2={0} stroke="rgba(201,169,97,0.3)" strokeWidth="0.5"/>
      </svg>

      {/* Central illustration */}
      <svg className="absolute" style={{ top: 32, left: 0, width: w, height: h - 64 }}>
        {isMajor && <MajorArt id={card.id} w={w} h={h - 64}/>}
        {!isMajor && isCourt && <CourtArt rank={card.rank} suit={card.suit} w={w} h={h - 64}/>}
        {!isMajor && !isCourt && pipCount && <PipArt count={pipCount} suit={card.suit} w={w} h={h - 64}/>}
      </svg>

      {/* Bottom rule */}
      <svg className="absolute left-0 right-0 pointer-events-none" style={{ bottom: 30, width: w, height: 1 }}>
        <line x1={16} y1={0} x2={w-16} y2={0} stroke="rgba(201,169,97,0.3)" strokeWidth="0.5"/>
      </svg>

      {/* Bottom band — card name */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-3"
        style={{ bottom: 10 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: large ? 8 : 7, color: 'rgba(201,169,97,0.85)', letterSpacing: '0.2em', textAlign: 'center', lineHeight: 1.2 }}>
          {cardName}
        </span>
      </div>
    </div>
  );
}

// ── Card Back (for undrawn spread slots) ──────────────────────────────────────
function CardBack({ small = false }) {
  const w = small ? 90 : 192, h = small ? 135 : 318;
  return (
    <div className="relative mx-auto" style={{ width: w, height: h,
      background: 'linear-gradient(170deg, #1C0D08 0%, #110806 50%, #180D0A 100%)' }}>
      <svg className="absolute inset-0" width={w} height={h}>
        <defs>
          <pattern id="diamond-back" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M8,1 L15,8 L8,15 L1,8 Z" fill="none" stroke="rgba(201,169,97,0.25)" strokeWidth="0.6"/>
          </pattern>
        </defs>
        <rect width={w} height={h} fill="url(#diamond-back)"/>
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
                    style={{ background: 'linear-gradient(180deg,#1C0D08 0%,#110806 100%)', transform: entry.reversed ? 'rotate(180deg)' : 'none' }}>
                    <span className="text-[#C9A961] text-base">{entry.symbol || '✦'}</span>
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
                    <div style={{ transform: s.reversed ? 'rotate(180deg)' : 'none' }}>
                      <div style={{ width: 90, height: 135, background: 'linear-gradient(170deg,#1C0D08 0%,#110806 100%)', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                        <svg style={{ position: 'absolute', inset: 0, width: 90, height: 135 }}>
                          <rect x={5} y={5} width={80} height={125} rx={2} fill="none" stroke={G} strokeWidth="1"/>
                          <rect x={9} y={9} width={72} height={117} rx={1} fill="none" stroke={G2} strokeWidth="0.6"/>
                        </svg>
                        <svg style={{ position: 'absolute', inset: 0 }}>
                          {s.card.type === 'major' && <MajorArt id={s.card.id} w={90} h={135}/>}
                          {s.card.type !== 'major' && COURT_RANKS.includes(s.card.rank) && <CourtArt rank={s.card.rank} suit={s.card.suit} w={90} h={135}/>}
                          {s.card.type !== 'major' && !COURT_RANKS.includes(s.card.rank) && RANK_TO_COUNT[s.card.rank] && <PipArt count={RANK_TO_COUNT[s.card.rank]} suit={s.card.suit} w={90} h={135}/>}
                        </svg>
                        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 6, color: 'rgba(201,169,97,0.8)', letterSpacing: '0.1em' }}>
                          {s.card.name?.toUpperCase()}
                        </div>
                      </div>
                    </div>
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
              className="hover:opacity-90 transition-opacity"
              style={{ aspectRatio: '2/3' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(170deg,#1C0D08 0%,#110806 100%)', position: 'relative', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <rect x="4" y="4" width="calc(100% - 8)" height="calc(100% - 8)" rx="2" fill="none" stroke="rgba(201,169,97,0.6)" strokeWidth="0.8"/>
                </svg>
                <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 6, color: 'rgba(201,169,97,0.8)', letterSpacing: '0.08em', padding: '0 4px' }}>
                  {card.name?.toUpperCase()}
                </div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-60%)', fontFamily: 'serif', fontSize: 18, color: 'rgba(201,169,97,0.7)' }}>
                  {SUIT_GLYPH[card.suit] || (card.type === 'major' ? ROMAN[card.id] : '✦')}
                </div>
              </div>
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
