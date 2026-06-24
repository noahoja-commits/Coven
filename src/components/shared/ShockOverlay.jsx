import { useState, useEffect } from 'react';

// Selectable full-screen "shock" visual modes, split into TWO layers so you can always read the app:
//   layer="back"  → renders BEHIND the app content (bold motifs: pentagrams, summoning circle, fog,
//                   fire, the eye, god-rays, orbital rings, arch frame, washes). Content sits on top.
//   layer="front" → renders ON TOP at z-30, kept translucent (fine texture only: scanlines, grain,
//                   sheen, drips, HUD chrome, glitch bars, 666/Latin text) — never blocks reading.
// Both are pointer-events-none. The 'scream'/'glitch' frame-shake is a class on the phone-frame (App.jsx).

const BWRAP = 'absolute inset-0 pointer-events-none overflow-hidden';
const FWRAP = 'absolute inset-0 pointer-events-none z-30 overflow-hidden';
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>\")";
const EMBERS = Array.from({ length: 30 }, (_, i) => ({ l: (i * 37) % 100, d: ((i * 7) % 50) / 10, s: 3 + (i % 4) * 2, dur: 3 + (i % 5) * 0.6 }));
const WAVE = [22, 60, 14, 80, 35, 95, 50, 70, 12, 88, 40, 66, 18, 100, 30, 75, 55, 90, 25, 62, 44, 84, 16, 72, 38, 96, 48, 68, 20, 82, 33, 58, 28, 92, 46, 78];
const ALCHEMY_GLYPHS = [
  { g: '☉', t: '8%', l: '12%' }, { g: '☽', t: '22%', l: '78%' }, { g: '☿', t: '40%', l: '20%' },
  { g: '♀', t: '14%', l: '52%' }, { g: '♂', t: '60%', l: '70%' }, { g: '♃', t: '74%', l: '30%' },
  { g: '♄', t: '52%', l: '88%' }, { g: '🜏', t: '86%', l: '60%' }, { g: '🜍', t: '34%', l: '60%' },
  { g: '⛧', t: '68%', l: '10%' }, { g: '🜔', t: '90%', l: '24%' }, { g: '☊', t: '6%', l: '84%' },
];
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const LEAVES = Array.from({ length: 9 }, (_, i) => ({ l: (i * 23 + 5) % 100, d: (i * 1.3) % 8, dur: 7 + (i % 4) * 2 }));

function InvPentagram({ className = '', color = '#C8102E', circle = true, sw = 1.4 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
      {circle && <circle cx="50" cy="50" r="46" />}
      <path d="M50 95 L61.8 9.5 L4.9 64.4 L95.1 64.4 L38.2 9.5 Z" />
    </svg>
  );
}
const pad = (n) => String(n).padStart(2, '0');
const PETALS = Array.from({ length: 12 }, (_, i) => ({ l: (i * 29 + 7) % 100, d: (i * 0.9) % 9, dur: 8 + (i % 5) * 2, g: i % 3 === 0 ? '✿' : i % 3 === 1 ? '❧' : '✾' }));

function Rose({ className = '', color = '#cdbb97' }) {
  return (
    <svg viewBox="0 0 40 64" className={className} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round">
      <path d="M20 28 q-7 -9 0 -16 q7 7 0 16 M20 28 q-11 -3 -9 -13 M20 28 q11 -3 9 -13 M20 28 q-5 -11 0 -15 M20 28 L20 60 M20 38 q-9 2 -13 -5 M20 46 q9 2 13 -5 M20 52 q-7 1 -10 -4" />
    </svg>
  );
}
function BoneHand({ className = '', color = '#b8b0a4', opacity = 0.45 }) {
  return (
    <svg viewBox="0 0 60 100" className={className} fill={color} opacity={opacity}>
      <path d="M27 100 L23 52 Q23 46 27 46 L29 46 L29 20 Q29 16 32 16 Q35 16 35 20 L35 44 L37 44 L38 13 Q38 9 41 9 Q44 9 44 13 L43 44 L45 44 L47 21 Q47 17 50 17 Q53 17 52 21 L50 50 Q49 62 43 72 L40 100 Z" />
    </svg>
  );
}
function CrownedSkull({ className = '', color = '#cfc6b8' }) {
  return (
    <svg viewBox="0 0 64 72" className={className} fill="none" stroke={color} strokeWidth="1" strokeLinejoin="round">
      <path d="M14 24 L7 7 L16 17 L21 4 L27 17 L32 5 L37 17 L43 4 L48 17 L57 7 L50 24" opacity="0.85" />
      <path d="M17 26 Q17 13 32 13 Q47 13 47 26 Q47 36 40 40 L40 48 Q40 52 32 52 Q24 52 24 48 L24 40 Q17 36 17 26 Z" />
      <circle cx="25" cy="30" r="3.6" fill={color} /><circle cx="39" cy="30" r="3.6" fill={color} />
      <path d="M32 34 L28.5 41 L35.5 41 Z" fill={color} />
    </svg>
  );
}

export function ShockOverlay({ mode = 'none', layer = 'front' }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!mode || mode === 'none') return;
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [mode]);

  if (!mode || mode === 'none') return null;
  const back = layer === 'back';

  // ── INSOMNIA — electric blue (filter) + halftone + scan + sweep + awake counter ──
  if (mode === 'insomnia') {
    if (back) return (<div className={BWRAP} aria-hidden><div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 16%, rgba(30,80,255,0.22), transparent 72%)', mixBlendMode: 'screen' }} /></div>);
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-halftone-drift" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 0.6px, transparent 1.1px)', backgroundSize: '5px 5px', mixBlendMode: 'overlay', opacity: 0.3 }} />
        <div className="absolute inset-x-0 h-[2px] shock-scan-v" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,210,255,0.8), transparent)' }} />
        <div className="absolute -inset-1/4 shock-sheen" style={{ background: 'linear-gradient(115deg, transparent 44%, rgba(255,255,255,0.22) 50%, transparent 56%)' }} />
        <div className="absolute bottom-3 right-3 text-[8px] tracking-[0.25em] opacity-50 text-[#bcd2f0]" style={{ fontFamily: '"VT323", monospace' }}>AWAKE · {pad(Math.floor(tick / 3600))}:{pad(Math.floor(tick / 60) % 60)}:{pad(tick % 60)}</div>
      </div>
    );
  }

  // ── DEAD CHANNEL — dither + rolling scanlines + waveform + entry burst + dead text ──
  if (mode === 'dead-channel') {
    if (back) return (<div className={BWRAP} aria-hidden><InvPentagram className="absolute left-1/2 top-[38%] -translate-x-1/2 w-44 h-44 opacity-[0.1]" color="#fff" circle={false} /></div>);
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 0.7px, transparent 1.1px)', backgroundSize: '3px 3px' }} />
        <div className="absolute inset-0 shock-scanroll opacity-35" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.7) 0 1px, transparent 1px 4px)' }} />
        <div className="absolute inset-0 shock-burst" style={{ backgroundImage: GRAIN, backgroundSize: '90px 90px', opacity: 0.9 }} />
        <div className="absolute top-8 left-0 right-0 text-center text-[#cfcfcf] text-[9px] leading-[1.7] opacity-30 shock-blink" style={{ fontFamily: '"VT323", monospace', letterSpacing: '0.3em' }}>QUEEN IS DEAD · QUEEN IS DEAD · QUEEN IS DEAD<br />𖤐 LONG LIVE THE QUEEN 𖤐</div>
        <div className="absolute bottom-0 inset-x-0 h-[18%] flex items-end justify-between px-1 gap-[1px] opacity-80">
          {WAVE.map((h, i) => <span key={i} className="flex-1 bg-[#EDEDED] shock-wave" style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.08}s` }} />)}
        </div>
      </div>
    );
  }

  // ── EMERGENCY — orbital HUD + radar (back) + live infernal readout + REC (front) ──
  if (mode === 'emergency') {
    if (back) return (
      <div className={`${BWRAP} text-[#bcd2f0]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(2,8,18,0.18)' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[170%] h-[170%] shock-orbit" style={{ opacity: 0.5 }}>
          {[26, 44, 62, 80, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.5" />)}
          <ellipse cx="100" cy="100" rx="96" ry="42" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="42" ry="96" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {[0, 30, 60, 90, 120, 150].map(a => <line key={a} x1="100" y1="100" x2={100 + 96 * Math.cos(a * Math.PI / 180)} y2={100 + 96 * Math.sin(a * Math.PI / 180)} stroke="currentColor" strokeWidth="0.3" opacity="0.5" />)}
        </svg>
        <div className="absolute left-1/2 top-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 shock-radar" style={{ background: 'conic-gradient(from 0deg, rgba(120,200,255,0.28), transparent 25%)', borderRadius: '50%' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#bcd2f0]`} aria-hidden>
        <pre className="absolute top-16 right-3 text-[8px] leading-[1.6] opacity-80 text-right" style={{ fontFamily: '"VT323", monospace' }}>{`localdomain · LI
UPTIME ${pad(Math.floor(tick / 3600))}:${pad(Math.floor(tick / 60) % 60)}:${pad(tick % 60)}
SIGNAL 666.6 MHz
DAEMON · RUNNING
CPU ${18 + (tick % 7)}% · PROC 6${6 + (tick % 4)}
>> EMERGENCY · INFERNAL`}</pre>
        <div className="absolute top-16 left-3 flex items-center gap-1 text-[9px] opacity-90" style={{ fontFamily: '"VT323", monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a]" style={{ opacity: tick % 2 ? 1 : 0.2 }} /> REC
        </div>
        <div className="absolute inset-4 opacity-30" style={{ background: 'linear-gradient(to right, currentColor 0 18px, transparent 18px) 0 0 / 18px 1px no-repeat, linear-gradient(to bottom, currentColor 0 18px, transparent 18px) 0 0 / 1px 18px no-repeat, linear-gradient(to left, currentColor 0 18px, transparent 18px) 100% 100% / 18px 1px no-repeat, linear-gradient(to top, currentColor 0 18px, transparent 18px) 100% 100% / 1px 18px no-repeat' }} />
      </div>
    );
  }

  // ── BLOOD RITE — pentagram + blots + pool (back, behind content so buttons stay clear) + thin translucent drips (front) ──
  if (mode === 'spatter') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <InvPentagram className="absolute left-1/2 top-[40%] -translate-x-1/2 w-44 h-44 opacity-30 shock-summon" color="#8b0000" sw={1.2} />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 180">
          <g fill="#6e0000">
            <path d="M12 4 C 20 -2, 26 6, 22 12 C 28 14, 24 22, 16 20 C 10 26, 2 20, 6 12 C 0 10, 4 2, 12 4 Z" />
            <path d="M84 2 C 92 0, 96 8, 90 12 C 96 18, 88 24, 82 18 C 74 22, 72 12, 78 8 C 76 2, 80 2, 84 2 Z" />
            <path d="M48 0 C 54 0, 56 6, 52 9 C 57 12, 51 17, 46 13 C 41 16, 40 8, 45 6 Z" opacity="0.85" />
            <circle cx="30" cy="60" r="2.4" /><circle cx="70" cy="48" r="3" /><circle cx="92" cy="80" r="2" /><circle cx="8" cy="92" r="2.6" />
          </g>
        </svg>
        <div className="absolute bottom-0 inset-x-0 h-[8%] shock-pool" style={{ background: 'linear-gradient(to top, #4a0000, #6e0000 60%, transparent)' }} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {[[13, 0], [23, 1.4], [49, 0.7], [85, 0.3], [91, 2.1]].map(([l, d], i) => (
          <span key={i} className="absolute top-0 w-[2px] shock-drip" style={{ left: `${l}%`, animationDelay: `${d}s`, height: '22%', opacity: 0.5, background: 'linear-gradient(to bottom, #8b0000, #5b0f1a 75%, transparent)' }}>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full" style={{ background: '#8b0000' }} />
          </span>
        ))}
      </div>
    );
  }

  // ── THE SCREAM — pentagram flash (back) + strobe + vignette (front) ──
  if (mode === 'scream') {
    if (back) return (<div className={BWRAP} aria-hidden><InvPentagram className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] shock-scream-flash" color="#ff1030" circle={false} sw={0.7} /></div>);
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-scream-flash" style={{ background: 'rgba(200,16,46,0.45)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-scream-vig" style={{ boxShadow: 'inset 0 0 70px 18px rgba(120,0,0,0.5)' }} />
      </div>
    );
  }

  // ── CORRUPTION — all front (translucent) ──
  if (mode === 'glitch') {
    if (back) return null;
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-rgb-r" style={{ background: 'rgba(255,0,40,0.16)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-rgb-c" style={{ background: 'rgba(0,255,230,0.14)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[8%] shock-glitch-bar" style={{ top: '16%', background: 'rgba(255,255,255,0.1)', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-x-0 h-[5%] shock-glitch-bar2" style={{ top: '44%', background: 'rgba(0,255,230,0.18)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[11%] shock-glitch-bar" style={{ top: '68%', background: 'rgba(200,16,46,0.24)', mixBlendMode: 'screen', animationDelay: '0.4s' }} />
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 text-3xl tracking-[0.3em] shock-glitch-bar2" style={{ color: '#ff2040', fontFamily: '"VT323", monospace', textShadow: '2px 0 #00ffe6, -2px 0 #ff2040' }}>6̷6̴6̸</div>
        <div className="absolute inset-0 opacity-35" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── PYRE — fire glow + burning pentagram (back) + embers (front) ──
  if (mode === 'inferno') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-3/4 shock-fire" style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(255,140,0,0.7), rgba(255,40,0,0.45) 35%, rgba(139,0,0,0.25) 58%, transparent 78%)', mixBlendMode: 'screen' }} />
        <InvPentagram className="absolute left-1/2 bottom-[6%] -translate-x-1/2 w-40 h-40 opacity-50 shock-fire" color="#ffb300" circle sw={1.6} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {EMBERS.map((e, i) => <span key={i} className="absolute bottom-0 rounded-full shock-ember" style={{ left: `${e.l}%`, width: e.s, height: e.s, animationDelay: `${e.d}s`, animationDuration: `${e.dur}s`, background: 'radial-gradient(circle, #ffdf80, #ff5a00 55%, transparent)', boxShadow: '0 0 6px #ff7a00' }} />)}
      </div>
    );
  }

  // ── BLACK MASS — summoning circle + candles + dark (back) + rising chant (front) ──
  if (mode === 'void') {
    const candles = Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 - Math.PI / 2; return { x: 50 + 33 * Math.cos(a), y: 50 + 33 * Math.sin(a) }; });
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0 shock-void" style={{ background: 'radial-gradient(ellipse at 50% 48%, transparent 30%, rgba(0,0,0,0.42) 56%, rgba(0,0,0,0.78) 100%)' }} />
        <InvPentagram className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 shock-summon" color="#C8102E" sw={1.1} />
        {candles.map((c, i) => <span key={i} className="absolute w-1 h-1 rounded-full animate-flicker" style={{ left: `${c.x}%`, top: `${c.y}%`, background: '#ffb14a', boxShadow: '0 0 8px 2px #ff7a00', animationDelay: `${i * 0.3}s` }} />)}
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute left-0 right-0 top-[14%] text-center text-[#C8102E] text-[11px] tracking-[0.4em] shock-rise" style={{ fontFamily: '"UnifrakturCook", serif' }}>· AVE · SATANAS ·</div>
        <div className="absolute left-0 right-0 bottom-[14%] text-center text-[#C8102E] text-[11px] tracking-[0.4em] shock-rise" style={{ fontFamily: '"UnifrakturCook", serif', animationDelay: '2.5s' }}>· REGNVM · INFERNVM ·</div>
      </div>
    );
  }

  // ── SANCTUM — god-rays + inverted cross (back) + "God is dead" (front) ──
  if (mode === 'cathedral') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-godray" style={{ background: 'repeating-linear-gradient(74deg, transparent 0 22px, rgba(201,169,97,0.12) 22px 28px, transparent 28px 56px)', mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-godray2" style={{ background: 'repeating-linear-gradient(106deg, transparent 0 30px, rgba(123,44,191,0.13) 30px 36px, transparent 36px 70px)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -15%, rgba(91,15,26,0.4), transparent 62%)' }} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute left-1/2 top-6 -translate-x-1/2 shock-summon" style={{ color: '#d6cfc0' }}>
          <div className="w-[3px] h-16 bg-current mx-auto" /><div className="w-10 h-[3px] bg-current absolute top-11 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute left-0 right-0 top-[30%] text-center text-[#d6cfc0]/70 text-[10px] tracking-[0.4em]" style={{ fontFamily: '"UnifrakturCook", serif' }}>· DEVS · MORTVVS · EST ·</div>
      </div>
    );
  }

  // ── REBIRTH — corner blocks + wash (back) + chevrons/666/chrome (front) ──
  if (mode === 'rebirth') {
    if (back) return (
      <div className={`${BWRAP} text-[#C8102E]`} aria-hidden>
        <div className="absolute top-0 right-0 w-[30%] h-[16%]" style={{ background: 'linear-gradient(135deg, #ff0a2e, #5B0F1A)' }} />
        <div className="absolute bottom-0 left-0 w-[30%] h-[16%]" style={{ background: 'linear-gradient(135deg, #5B0F1A, #ff0a2e)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(255,10,46,0.22), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(255,10,46,0.22), transparent 42%)', mixBlendMode: 'screen' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#C8102E]`} aria-hidden>
        <div className="absolute top-3 left-2 flex flex-col text-[18px] leading-[0.8] font-bold shock-chevron" style={{ fontFamily: '"Manrope", sans-serif' }}>{Array.from({ length: 7 }).map((_, i) => <span key={i}>❯</span>)}</div>
        <div className="absolute top-2 right-[33%] text-2xl font-bold" style={{ fontFamily: '"Manrope", sans-serif' }}>666</div>
        <div className="absolute left-2 bottom-[20%] text-[9px] tracking-[0.25em] opacity-80" style={{ writingMode: 'vertical-rl', fontFamily: '"VT323", monospace' }}>MMXXVI · COVEN</div>
        {[['top-3 right-[5%]'], ['bottom-[18%] right-4'], ['top-[18%] left-[32%]']].map(([pos], i) => <span key={i} className={`absolute ${pos} text-[13px] opacity-70`}>⛧</span>)}
        <div className="absolute inset-0 border-[3px] border-[#C8102E]/35" />
      </div>
    );
  }

  // ── REQUIEM — eye (back) + grain/scanlines (front) ──
  if (mode === 'requiem') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-[30%] -translate-x-1/2 w-28 h-28 opacity-25" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M4 50 Q50 14 96 50 Q50 86 4 50 Z" /><circle cx="50" cy="50" r="18" /><circle cx="50" cy="50" r="8" fill="#fff" className="shock-summon" />
        </svg>
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.4 }} />
        <div className="absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── MIST — fog + pentagram (back) + leaves/grain (front) ──
  if (mode === 'mist') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-fog" style={{ background: 'radial-gradient(ellipse at 30% 38%, rgba(225,205,165,0.4), transparent 55%)' }} />
        <div className="absolute -inset-1/3 shock-fog2" style={{ background: 'radial-gradient(ellipse at 72% 64%, rgba(205,180,145,0.36), transparent 55%)' }} />
        <InvPentagram className="absolute left-1/2 top-[34%] -translate-x-1/2 w-40 h-40 opacity-[0.08]" color="#7a6a4a" circle sw={1} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(150,130,95,0.3), transparent 45%)' }} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {LEAVES.map((lf, i) => <span key={i} className="absolute top-0 text-[10px] shock-leaf" style={{ left: `${lf.l}%`, color: 'rgba(150,110,60,0.6)', animationDelay: `${lf.d}s`, animationDuration: `${lf.dur}s` }}>❧</span>)}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.22 }} />
      </div>
    );
  }

  // ── RELIQUARY — arch frame + cross (back) + Latin/fleurons (front) ──
  if (mode === 'reliquary') {
    if (back) return (
      <div className={`${BWRAP} text-[#d6cfc0]`} aria-hidden>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 200" style={{ opacity: 0.7 }}>
          <rect x="3" y="3" width="94" height="194" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10 44 Q10 14 50 11 Q90 14 90 44" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M14 44 Q14 18 50 15 Q86 18 86 44" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.7" />
          {[22, 34, 50, 66, 78].map((x, i) => <path key={i} d={`M${x - 4} 24 Q${x} 16 ${x + 4} 24`} fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />)}
        </svg>
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 55px 10px rgba(0,0,0,0.35)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#d6cfc0]`} aria-hidden>
        <div className="absolute left-1/2 top-3 -translate-x-1/2 shock-summon" style={{ color: '#d6cfc0' }}>
          <div className="w-[2px] h-7 bg-current mx-auto" /><div className="w-5 h-[2px] bg-current absolute top-5 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute left-0 right-0 top-[2px] text-center text-[9px] tracking-[0.3em] opacity-70" style={{ fontFamily: '"UnifrakturCook", serif' }}>· OVR · POWER · IS · INFINITE ·</div>
        {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((p, i) => <span key={i} className={`absolute ${p} text-base opacity-80`}>⛧</span>)}
      </div>
    );
  }

  // ── ALCHEMY — orbital + zodiac + planet (back) + glyphs/kanji (front) ──
  if (mode === 'alchemy') {
    if (back) return (
      <div className={`${BWRAP} text-[#bcb4a2]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(6,6,10,0.18)' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[150%] h-[150%] shock-orbit" style={{ opacity: 0.16 }}>
          {[34, 56, 78, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" />)}
          <ellipse cx="100" cy="100" rx="96" ry="46" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <div className="absolute left-1/2 top-1/2 w-[78%] aspect-square -translate-x-1/2 -translate-y-1/2 shock-orbit-slow" style={{ opacity: 0.3 }}>
          {ZODIAC.map((z, i) => { const a = (i / 12) * Math.PI * 2; return <span key={i} className="absolute text-xs" style={{ left: `${50 + 48 * Math.cos(a)}%`, top: `${50 + 48 * Math.sin(a)}%`, transform: 'translate(-50%,-50%)' }}>{z}</span>; })}
        </div>
        <div className="absolute w-8 h-8 rounded-full shock-fog" style={{ right: '18%', top: '60%', background: 'radial-gradient(circle at 35% 35%, #6a6478, #1a1822 70%)', boxShadow: '0 0 18px rgba(120,110,150,0.4)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#bcb4a2]`} aria-hidden>
        {ALCHEMY_GLYPHS.map((a, i) => <span key={i} className="absolute text-lg shock-twinkle" style={{ top: a.t, left: a.l, opacity: 0.4, animationDelay: `${(i % 6) * 0.5}s` }}>{a.g}</span>)}
        <div className="absolute left-2 top-[18%] text-[10px] leading-[1.8] opacity-25" style={{ writingMode: 'vertical-rl', fontFamily: '"Shippori Mincho", serif' }}>生流転死再生</div>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.25 }} />
      </div>
    );
  }

  // ── KEEPSAKE — sepia romantic scrapbook: candles + roses + light-leak (back), torn-paper captions, THE END, moon phases, falling petals (front) ──
  if (mode === 'keepsake') {
    if (back) return (
      <div className={`${BWRAP} text-[#cdbb97]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 112%, rgba(232,196,90,0.55), rgba(120,90,40,0.16) 40%, transparent 74%)', mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-fog" style={{ background: 'radial-gradient(ellipse at 84% 8%, rgba(232,210,150,0.3), transparent 52%)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px 30px rgba(18,12,5,0.62)' }} />
        <Rose className="absolute left-[4%] bottom-[6%] w-14 h-24 opacity-25 -rotate-12" color="#a89066" />
        <Rose className="absolute right-[5%] top-[10%] w-10 h-16 opacity-20 rotate-[18deg]" color="#a89066" />
        {/* dripping candles + flames */}
        <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 flex items-end gap-7 opacity-90">
          {[0, 1, 2].map(i => (
            <div key={i} className="relative flex flex-col items-center">
              <span className="block w-[5px] rounded-full animate-flicker" style={{ height: 15 + (i % 2) * 8, marginBottom: -2, background: 'radial-gradient(circle at 50% 0%, #fff, #ffb14a 45%, #8a4a00)', filter: 'blur(0.3px)', animationDelay: `${i * 0.3}s` }} />
              <span className="block w-[10px] rounded-[2px]" style={{ height: 26 + (i % 3) * 7, background: 'linear-gradient(180deg, #e8dcc0, #b9a886 70%, #8a7a58)', boxShadow: '0 0 12px rgba(232,196,90,0.35)' }} />
            </div>
          ))}
        </div>
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#3a2c18]`} aria-hidden>
        {[
          { t: 'she loves moonlight & rainstorms', top: '9%', left: '6%', rot: -3, s: 10 },
          { t: "look up — you'll see the stars", top: '30%', left: '40%', rot: 2.5, s: 10 },
          { t: "if it's meant to be, it'll be", top: '52%', left: '10%', rot: -1.5, s: 11 },
          { t: 'forever & always', top: '68%', left: '52%', rot: 2, s: 10 },
          { t: 'the things we love most, destroy us', top: '84%', left: '14%', rot: -2, s: 9 },
        ].map((c, i) => (
          <span key={i} className="absolute px-1.5 py-[3px] tracking-wide" style={{ top: c.top, left: c.left, fontSize: c.s, transform: `rotate(${c.rot}deg)`, background: 'rgba(228,214,184,0.85)', boxShadow: '0 1px 5px rgba(0,0,0,0.4)' }}>{c.t}</span>
        ))}
        <span className="absolute top-[20%] right-[8%] px-2 py-[3px] text-[10px] tracking-[0.2em] rotate-[-6deg] border border-[#3a2c18]/40" style={{ background: 'rgba(228,214,184,0.85)' }}>THE END</span>
        <div className="absolute top-[6%] right-[10%] flex gap-1.5 opacity-55">
          {['#1a1208', '#5a4424', '#cdbb97', '#5a4424', '#1a1208'].map((c, i) => <span key={i} className="block w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: '0 0 5px rgba(232,196,90,0.4)' }} />)}
        </div>
        <span className="absolute bottom-[28%] right-[14%] text-base opacity-50">🦋</span>
        {PETALS.slice(0, 8).map((p, i) => <span key={i} className="absolute top-0 text-[10px] shock-leaf" style={{ left: `${p.l}%`, color: 'rgba(180,140,90,0.55)', animationDelay: `${p.d}s`, animationDuration: `${p.dur}s` }}>{p.g}</span>)}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '110px 110px', mixBlendMode: 'overlay', opacity: 0.24 }} />
      </div>
    );
  }

  // ── XEROX — zine photocopy: noise + halftone face + layered words (back), lyric scatter + crop marks + barcode + editorial stamp (front) ──
  if (mode === 'xerox') {
    if (back) return (
      <div className={`${BWRAP} text-white`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.22)' }} />
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square rounded-full opacity-[0.16]" style={{ backgroundImage: 'radial-gradient(#fff 32%, transparent 33%)', backgroundSize: '7px 7px', maskImage: 'radial-gradient(circle, #000 35%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle, #000 35%, transparent 70%)' }} />
        <div className="absolute inset-0 shock-burst" style={{ backgroundImage: GRAIN, backgroundSize: '70px 70px', opacity: 0.85, mixBlendMode: 'screen' }} />
        <div className="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 text-[30vw] leading-none whitespace-nowrap opacity-[0.05]">REMEMBER</div>
        <div className="absolute left-1/2 bottom-[8%] -translate-x-1/2 text-[24vw] leading-none whitespace-nowrap opacity-[0.04]">FORGET</div>
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#EDEDED]`} aria-hidden>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(91deg, rgba(0,0,0,0.6) 0 1px, transparent 1px 7px)' }} />
        <div className="absolute left-3 right-3 top-[40%] text-[13px] leading-[1.05] font-bold uppercase opacity-80" style={{ letterSpacing: '-0.01em' }}>now i have to remember you<br />for longer than i&apos;ve known you</div>
        {[
          { t: 'I MISS YOU', top: '12%', left: '11%' }, { t: 'do you remember us?', top: '24%', left: '48%' },
          { t: 'where are you now?', top: '58%', left: '16%' }, { t: 'if i knew', top: '70%', left: '60%' },
          { t: 'sorry', top: '34%', left: '7%' }, { t: 'maybe we…', top: '64%', left: '46%' },
          { t: 'what could have been?', top: '86%', left: '10%' }, { t: 'guess i never will', top: '90%', left: '58%' },
        ].map((a, i) => <span key={i} className="absolute text-[9px] uppercase tracking-[0.18em] opacity-60 shock-blink" style={{ top: a.top, left: a.left, animationDelay: `${(i % 6) * 0.4}s` }}>{a.t}</span>)}
        {/* crop / registration marks */}
        {['top-2 left-2 border-l border-t', 'top-2 right-2 border-r border-t', 'bottom-2 left-2 border-l border-b', 'bottom-2 right-2 border-r border-b'].map((p, i) => <span key={i} className={`absolute ${p} w-3 h-3 border-white/50`} />)}
        {/* barcode + stamp */}
        <div className="absolute bottom-2 right-3 flex items-end gap-[1.5px] h-4 opacity-70">{[2,1,3,1,2,1,1,3,2,1,2,3,1,2].map((w,i)=><span key={i} className="bg-white" style={{ width: w, height: '100%' }} />)}</div>
        <div className="absolute bottom-2.5 left-3 text-[8px] uppercase tracking-[0.25em] opacity-60">WK 51 / 52 · COVEN.JPG</div>
        <div className="absolute inset-0 shock-burst" style={{ backgroundImage: GRAIN, backgroundSize: '50px 50px', mixBlendMode: 'overlay', opacity: 0.55 }} />
      </div>
    );
  }

  // ── SEE NO EVIL — blue riso grunge: halftone + crack + figure (back), big stencil + micro-text + double crack + torn edge (front) ──
  if (mode === 'duotone') {
    if (back) return (
      <div className={`${BWRAP} text-[#9fc0e8]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 62% 40%, rgba(40,90,200,0.2), transparent 74%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-halftone-drift" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1.1px, transparent 2.2px)', backgroundSize: '8px 8px', mixBlendMode: 'overlay', opacity: 0.4 }} />
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[55%] aspect-[3/4] opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#cfe0f5 36%, transparent 38%)', backgroundSize: '6px 6px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#cfe0f5]`} aria-hidden>
        <div className="absolute left-[6%] top-1/2 -translate-y-1/2 -rotate-3 text-[19vw] leading-[0.78] opacity-[0.16]">SEE<br />NO<br />EVIL</div>
        <div className="absolute top-[30%] left-2 right-2 text-[7px] uppercase tracking-[0.1em] opacity-30 leading-[1.4] break-words">{'who knows you · '.repeat(18)}</div>
        <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 100 100"><g stroke="#dfeaf7" strokeWidth="0.16" fill="none">
          <path d="M0 30 L20 34 L34 26 L52 38 L70 30 L88 42 L100 36" /><path d="M10 0 L16 22 L8 40 L20 60 L12 82 L22 100" /><path d="M60 0 L66 26 L58 48 L72 70 L64 100" /><path d="M0 70 L24 66 L46 76 L70 68 L100 78" /><path d="M40 0 L44 18 L36 36 L46 54 L40 100" /><path d="M80 0 L86 30 L78 56 L88 100" /><path d="M0 50 L30 46 L60 56 L100 48" />
        </g></svg>
        <div className="absolute bottom-2 left-3 text-[8px] uppercase tracking-[0.25em] opacity-50">no light in our descent</div>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '80px 80px', mixBlendMode: 'overlay', opacity: 0.34 }} />
      </div>
    );
  }

  // ── THE VOW — black-metal insert: full thorn frame + crowned skull + reaching bone-hands + script (back), oxblood blackletter vow + daggers (front) ──
  if (mode === 'vow') {
    if (back) return (
      <div className={`${BWRAP} text-[#b8b0a4]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(6,4,6,0.32)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px 24px rgba(0,0,0,0.78)' }} />
        <CrownedSkull className="absolute left-1/2 top-[5%] -translate-x-1/2 w-24 h-28 opacity-30" color="#cfc6b8" />
        <BoneHand className="absolute left-[6%] top-[8%] w-16 h-28 -rotate-[18deg]" opacity={0.32} />
        <BoneHand className="absolute right-[8%] bottom-[4%] w-16 h-28 rotate-[200deg] scale-x-[-1]" opacity={0.3} />
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <rect x="2.5" y="2.5" width="95" height="95" fill="none" stroke="#cfc6b8" strokeWidth="0.2" opacity="0.32" />
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#cfc6b8" strokeWidth="0.12" opacity="0.22" />
          <g stroke="#cfc6b8" strokeWidth="0.3" fill="none" opacity="0.55">
            {[[5, 5, 0], [95, 5, 90], [95, 95, 180], [5, 95, 270]].map(([x, y, r], i) => (
              <path key={i} d="M0 20 Q0 0 20 0 M3 13 q5 -9 10 -10 M0 9 q6 0 7 6 M9 0 q0 6 6 7 M0 28 q-1 -6 4 -8 M28 0 q-6 -1 -8 4" transform={`translate(${x},${y}) rotate(${r})`} />
            ))}
            {/* edge thorns mid-side */}
            <path d="M50 4 l-3 4 l3 -2 l3 2 z M50 96 l-3 -4 l3 2 l3 -2 z M4 50 l4 -3 l-2 3 l2 3 z M96 50 l-4 -3 l2 3 l-2 3 z" />
          </g>
        </svg>
        <div className="absolute left-1.5 top-[30%] text-[8px] leading-[1.7] opacity-15 italic" style={{ writingMode: 'vertical-rl' }}>per omnia saecula saeculorum amen</div>
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#8B0000]`} aria-hidden>
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center text-[17px] tracking-[0.16em] opacity-85 shock-twinkle" style={{ textShadow: '0 0 12px rgba(139,0,0,0.7), 0 0 2px rgba(0,0,0,0.9)' }}>· till death do us part ·</div>
        <div className="absolute left-0 right-0 top-[58%] text-center text-[9px] tracking-[0.35em] text-[#cfc6b8]/50">⸸ · ⸸ · ⸸</div>
        {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((p, i) => <span key={i} className={`absolute ${p} text-sm text-[#cfc6b8] opacity-55`}>†</span>)}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '120px 120px', mixBlendMode: 'overlay', opacity: 0.22 }} />
      </div>
    );
  }

  return null;
}

// Mode registry — drives the picker (label + one-line vibe). Order = picker order.
export const SHOCK_MODES = [
  { id: 'none', label: 'None', desc: 'pure brutalist base' },
  { id: 'insomnia', label: 'Insomnia', desc: 'electric blue · halftone' },
  { id: 'dead-channel', label: 'Dead Channel', desc: '1-bit dither · waveform' },
  { id: 'emergency', label: 'Emergency', desc: 'orbital HUD · infernal signal' },
  { id: 'spatter', label: 'Blood Rite', desc: 'spatter · pool · pentagram' },
  { id: 'scream', label: 'The Scream', desc: 'the screen convulses' },
  { id: 'glitch', label: 'Corruption', desc: 'rgb shudder · 666' },
  { id: 'inferno', label: 'Pyre', desc: 'fire · embers · burning star' },
  { id: 'void', label: 'Black Mass', desc: 'summoning circle · ave satanas' },
  { id: 'cathedral', label: 'Sanctum', desc: 'god-rays · inverted cross' },
  { id: 'rebirth', label: 'Rebirth', desc: 'poster · red corners · 666' },
  { id: 'requiem', label: 'Requiem', desc: 'stark b&w · the eye' },
  { id: 'mist', label: 'Mist', desc: 'sepia fog · falling leaves' },
  { id: 'reliquary', label: 'Reliquary', desc: 'gothic arch · inverted cross' },
  { id: 'alchemy', label: 'Alchemy', desc: 'zodiac · planet · sigils' },
  { id: 'keepsake', label: 'Keepsake', desc: 'sepia collage · candlelight · torn paper' },
  { id: 'xerox', label: 'Xerox', desc: 'zine photocopy · b&w grain · lyrics' },
  { id: 'duotone', label: 'See No Evil', desc: 'blue grunge · halftone · stencil' },
  { id: 'vow', label: 'The Vow', desc: 'black-metal filigree · till death' },
];
