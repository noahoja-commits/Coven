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
const EMBERS = Array.from({ length: 44 }, (_, i) => ({ l: (i * 37) % 100, d: ((i * 7) % 50) / 10, s: 3 + (i % 4) * 2, dur: 3 + (i % 5) * 0.6 }));
const ASH = Array.from({ length: 16 }, (_, i) => ({ l: (i * 53 + 9) % 100, d: (i * 1.7) % 9, dur: 8 + (i % 5) * 2, s: 2 + (i % 2) }));
const WAVE = [22, 60, 14, 80, 35, 95, 50, 70, 12, 88, 40, 66, 18, 100, 30, 75, 55, 90, 25, 62, 44, 84, 16, 72, 38, 96, 48, 68, 20, 82, 33, 58, 28, 92, 46, 78];
const ALCHEMY_GLYPHS = [
  { g: '☉', t: '8%', l: '12%' }, { g: '☽', t: '22%', l: '78%' }, { g: '☿', t: '40%', l: '20%' },
  { g: '♀', t: '14%', l: '52%' }, { g: '♂', t: '60%', l: '70%' }, { g: '♃', t: '74%', l: '30%' },
  { g: '♄', t: '52%', l: '88%' }, { g: '🜏', t: '86%', l: '60%' }, { g: '🜍', t: '34%', l: '60%' },
  { g: '⛧', t: '68%', l: '10%' }, { g: '🜔', t: '90%', l: '24%' }, { g: '☊', t: '6%', l: '84%' },
];
const ZODIAC = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
const LEAVES = Array.from({ length: 14 }, (_, i) => ({ l: (i * 23 + 5) % 100, d: (i * 1.3) % 8, dur: 7 + (i % 4) * 2 }));
const MOTES = Array.from({ length: 24 }, (_, i) => ({ l: (i * 41 + 7) % 100, t: (i * 29 + 11) % 100, d: (i * 0.7) % 6, dur: 6 + (i % 5) * 2, s: 1 + (i % 3) }));
const TEARS = Array.from({ length: 10 }, (_, i) => ({ l: (i * 23 + 9) % 100, d: (i * 1.1) % 8, dur: 6 + (i % 4) * 2 }));
const WISPS = Array.from({ length: 7 }, (_, i) => ({ l: (i * 31 + 12) % 100, d: (i * 1.4) % 9, dur: 9 + (i % 4) * 3, s: 4 + (i % 3) * 3 }));
const STARS = Array.from({ length: 22 }, (_, i) => ({ l: (i * 47 + 3) % 100, t: (i * 19 + 5) % 62, d: (i * 0.5) % 4, s: i % 3 ? 1 : 2 }));
const RAIN = Array.from({ length: 26 }, (_, i) => ({ l: (i * 19 + 4) % 100, d: (i * 0.27) % 2, dur: 0.5 + (i % 4) * 0.16, h: 7 + (i % 5) * 5 }));
const EYES = Array.from({ length: 11 }, (_, i) => ({ l: (i * 37 + 6) % 94, t: (i * 53 + 7) % 90, d: (i * 0.7) % 5, s: 12 + (i % 3) * 7 }));

function InvPentagram({ className = '', color = '#C8102E', circle = true, sw = 1.4 }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
      {circle && <circle cx="50" cy="50" r="46" />}
      <path d="M50 95 L61.8 9.5 L4.9 64.4 L95.1 64.4 L38.2 9.5 Z" />
    </svg>
  );
}
const pad = (n) => String(n).padStart(2, '0');
const PETALS = Array.from({ length: 14 }, (_, i) => ({ l: (i * 29 + 7) % 100, d: (i * 0.9) % 9, dur: 8 + (i % 5) * 2, g: i % 3 === 0 ? '✿' : i % 3 === 1 ? '❧' : '✾' }));

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
// A translucent veiled mourner — the heart of "Lament" (and a ghost in the mist).
function VeiledFigure({ className = '', color = '#d8e2f5' }) {
  return (
    <svg viewBox="0 0 100 200" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="veilG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.55" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.22" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M50 16 C37 16 31 27 33 40 C25 53 21 86 24 122 C17 152 16 186 31 199 L69 199 C84 186 83 152 76 122 C79 86 75 53 67 40 C69 27 63 16 50 16 Z" fill="url(#veilG)" />
      <ellipse cx="50" cy="33" rx="15" ry="18" fill={color} opacity="0.16" />
      <ellipse cx="50" cy="36" rx="8" ry="11" fill="#0a0a14" opacity="0.45" />
    </svg>
  );
}

// A gaunt, screaming wraith — the thing that leans over you in the dark. Pale skin fading into
// the black, hollow eye sockets with tiny dead-white pupils, sunken cheeks, a gaping mouth.
function WraithFace({ className = '', style }) {
  return (
    <svg viewBox="0 0 100 132" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="wraithSkin" cx="0.5" cy="0.4" r="0.62">
          <stop offset="0" stopColor="#d9d5cc" /><stop offset="0.55" stopColor="#8b867c" /><stop offset="1" stopColor="#26241f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* gaunt elongated head dissolving into the dark */}
      <path d="M50 4 C25 4 17 26 19 51 C20 74 30 104 50 128 C70 104 80 74 81 51 C83 26 75 4 50 4 Z" fill="url(#wraithSkin)" />
      {/* hollow black eye sockets */}
      <ellipse cx="36" cy="52" rx="8.5" ry="12" fill="#000" />
      <ellipse cx="64" cy="52" rx="8.5" ry="12" fill="#000" />
      {/* tiny dead-white pupils, staring */}
      <circle cx="36" cy="53" r="1.6" fill="#fff" opacity="0.9" />
      <circle cx="64" cy="53" r="1.6" fill="#fff" opacity="0.9" />
      {/* sunken brow + hollow cheeks */}
      <path d="M28 40 Q36 35 43 41 M57 41 Q64 35 72 40" stroke="#14120e" strokeWidth="1.6" fill="none" opacity="0.6" />
      <path d="M30 66 Q34 78 40 84 M70 66 Q66 78 60 84" stroke="#14120e" strokeWidth="1.2" fill="none" opacity="0.45" />
      {/* gaping, screaming mouth */}
      <path d="M39 88 Q50 81 61 88 Q57 112 50 116 Q43 112 39 88 Z" fill="#070503" />
      {/* jagged teeth */}
      <path d="M41 90 l2 5 l2 -5 l2 5 l2 -5 l2 5 l2 -5 l2 5 l2 -5 l2 5" stroke="#cfc8b6" strokeWidth="0.8" fill="none" opacity="0.7" />
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

  // ── INSOMNIA — electric blue + heartbeat vignette + lightning + 3AM clock (back) · twin scans + static motes + awake counter (front) ──
  if (mode === 'insomnia') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 16%, rgba(30,80,255,0.24), transparent 72%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-heartbeat" style={{ boxShadow: 'inset 0 0 90px 26px rgba(20,60,200,0.5)' }} />
        <div className="absolute inset-0 shock-lightning" style={{ background: 'rgba(120,170,255,0.4)', mixBlendMode: 'screen' }} />
        <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-[20vw] leading-none opacity-[0.06] shock-heartbeat" style={{ color: '#9fc0ff', fontFamily: '"VT323", monospace' }}>3:33</div>
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-halftone-drift" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 0.6px, transparent 1.1px)', backgroundSize: '5px 5px', mixBlendMode: 'overlay', opacity: 0.3 }} />
        <div className="absolute inset-x-0 h-[2px] shock-scan-v" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,210,255,0.85), transparent)' }} />
        <div className="absolute inset-x-0 h-[1px] shock-scan-v" style={{ background: 'linear-gradient(90deg, transparent, rgba(180,210,255,0.5), transparent)', animationDuration: '2.1s', animationDelay: '-1s' }} />
        <div className="absolute -inset-1/4 shock-sheen" style={{ background: 'linear-gradient(115deg, transparent 44%, rgba(255,255,255,0.22) 50%, transparent 56%)' }} />
        {MOTES.slice(0, 16).map((m, i) => <span key={i} className="absolute rounded-full shock-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, width: m.s, height: m.s, background: '#bcd2f0', boxShadow: '0 0 4px #6f9fff', animationDelay: `${m.d}s`, animationDuration: `${m.dur}s` }} />)}
        <div className="absolute bottom-3 right-3 text-[8px] tracking-[0.25em] opacity-50 text-[#bcd2f0]" style={{ fontFamily: '"VT323", monospace' }}>AWAKE · {pad(Math.floor(tick / 3600))}:{pad(Math.floor(tick / 60) % 60)}:{pad(tick % 60)}</div>
        <div className="absolute bottom-3 left-3 text-[8px] tracking-[0.3em] opacity-40 text-[#bcd2f0] shock-blink" style={{ fontFamily: '"VT323", monospace' }}>CAN'T SLEEP</div>
      </div>
    );
  }

  // ── DEAD CHANNEL — color bars + NO SIGNAL ghost (back) · rolling tracking band + RGB tear + dither + waveform (front) ──
  if (mode === 'dead-channel') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0 opacity-[0.07]" style={{ background: 'linear-gradient(90deg, #fff 0 14.28%, #ff0 14.28% 28.5%, #0ff 28.5% 42.8%, #0f0 42.8% 57.1%, #f0f 57.1% 71.4%, #f00 71.4% 85.7%, #00f 85.7%)' }} />
        <InvPentagram className="absolute left-1/2 top-[38%] -translate-x-1/2 w-44 h-44 opacity-[0.1]" color="#fff" circle={false} />
        <div className="absolute left-1/2 top-[64%] -translate-x-1/2 text-[15vw] leading-none whitespace-nowrap opacity-[0.05] shock-blink" style={{ fontFamily: '"VT323", monospace', letterSpacing: '0.1em' }}>NO SIGNAL</div>
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 0.7px, transparent 1.1px)', backgroundSize: '3px 3px' }} />
        <div className="absolute inset-0 shock-scanroll opacity-35" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.7) 0 1px, transparent 1px 4px)' }} />
        <div className="absolute inset-0 shock-rgb-r" style={{ background: 'rgba(255,0,40,0.07)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-rgb-c" style={{ background: 'rgba(0,255,230,0.06)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[12%] shock-track" style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.18) 40%, rgba(0,0,0,0.5) 50%, transparent)', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0 shock-burst" style={{ backgroundImage: GRAIN, backgroundSize: '90px 90px', opacity: 0.9 }} />
        <div className="absolute top-8 left-0 right-0 text-center text-[#cfcfcf] text-[9px] leading-[1.7] opacity-30 shock-blink" style={{ fontFamily: '"VT323", monospace', letterSpacing: '0.3em' }}>QUEEN IS DEAD · QUEEN IS DEAD · QUEEN IS DEAD<br />𖤐 LONG LIVE THE QUEEN 𖤐</div>
        <div className="absolute top-3 right-3 text-[8px] tracking-[0.3em] text-[#cfcfcf] opacity-40 shock-blink" style={{ fontFamily: '"VT323", monospace' }}>▮ TRACKING</div>
        <div className="absolute bottom-0 inset-x-0 h-[20%] flex items-end justify-between px-1 gap-[1px] opacity-80">
          {WAVE.map((h, i) => <span key={i} className="flex-1 bg-[#EDEDED] shock-wave" style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.08}s` }} />)}
        </div>
      </div>
    );
  }

  // ── EMERGENCY — twin orbital HUD + radar + crosshair (back) · alert ticker + readout + ALERT/REC (front) ──
  if (mode === 'emergency') {
    if (back) return (
      <div className={`${BWRAP} text-[#bcd2f0]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(2,8,18,0.18)' }} />
        <div className="absolute inset-0 shock-lightning-2" style={{ background: 'rgba(255,40,40,0.16)', mixBlendMode: 'screen' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[170%] h-[170%] shock-orbit" style={{ opacity: 0.5 }}>
          {[26, 44, 62, 80, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.5" />)}
          <ellipse cx="100" cy="100" rx="96" ry="42" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="42" ry="96" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {[0, 30, 60, 90, 120, 150].map(a => <line key={a} x1="100" y1="100" x2={100 + 96 * Math.cos(a * Math.PI / 180)} y2={100 + 96 * Math.sin(a * Math.PI / 180)} stroke="currentColor" strokeWidth="0.3" opacity="0.5" />)}
        </svg>
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[120%] h-[120%] shock-orbit-slow" style={{ opacity: 0.3 }}>
          {[40, 70].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#ff6a6a" strokeWidth="0.4" strokeDasharray="2 4" />)}
        </svg>
        <div className="absolute left-1/2 top-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 shock-radar" style={{ background: 'conic-gradient(from 0deg, rgba(120,200,255,0.3), transparent 25%)', borderRadius: '50%' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#bcd2f0]`} aria-hidden>
        <pre className="absolute top-16 right-3 text-[8px] leading-[1.6] opacity-80 text-right" style={{ fontFamily: '"VT323", monospace' }}>{`localdomain · LI
UPTIME ${pad(Math.floor(tick / 3600))}:${pad(Math.floor(tick / 60) % 60)}:${pad(tick % 60)}
SIGNAL 666.6 MHz
DAEMON · RUNNING
CPU ${18 + (tick % 7)}% · PROC 6${6 + (tick % 4)}
THREAT ${['LOW', 'ELEV', 'HIGH', 'CRIT'][tick % 4]}
>> EMERGENCY · INFERNAL`}</pre>
        <div className="absolute top-16 left-3 flex items-center gap-1 text-[9px] opacity-90" style={{ fontFamily: '"VT323", monospace' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a2a]" style={{ opacity: tick % 2 ? 1 : 0.2 }} /> REC
        </div>
        <div className="absolute top-[27%] left-3 text-[9px] tracking-[0.2em] text-[#ff6a6a] shock-blink" style={{ fontFamily: '"VT323", monospace' }}>▲ ALERT · BREACH</div>
        <div className="absolute bottom-7 inset-x-0 overflow-hidden h-3 opacity-70">
          <div className="whitespace-nowrap text-[9px] tracking-[0.2em] shock-godray" style={{ fontFamily: '"VT323", monospace' }}>⚠ INFERNAL SIGNAL DETECTED · SOULS INBOUND · DO NOT PANIC · THE GATE IS OPEN · ⚠ INFERNAL SIGNAL DETECTED · SOULS INBOUND ·</div>
        </div>
        <div className="absolute inset-4 opacity-30" style={{ background: 'linear-gradient(to right, currentColor 0 18px, transparent 18px) 0 0 / 18px 1px no-repeat, linear-gradient(to bottom, currentColor 0 18px, transparent 18px) 0 0 / 1px 18px no-repeat, linear-gradient(to left, currentColor 0 18px, transparent 18px) 100% 100% / 18px 1px no-repeat, linear-gradient(to top, currentColor 0 18px, transparent 18px) 100% 100% / 1px 18px no-repeat' }} />
      </div>
    );
  }

  // ── BLOOD RITE — pulsing pentagram + blots + running blood + rising pool (back) · drips + side streaks (front) ──
  if (mode === 'spatter') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <InvPentagram className="absolute left-1/2 top-[40%] -translate-x-1/2 w-48 h-48 opacity-40 shock-summon" color="#8b0000" sw={1.3} />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 180">
          <g fill="#6e0000">
            <path d="M12 4 C 20 -2, 26 6, 22 12 C 28 14, 24 22, 16 20 C 10 26, 2 20, 6 12 C 0 10, 4 2, 12 4 Z" />
            <path d="M84 2 C 92 0, 96 8, 90 12 C 96 18, 88 24, 82 18 C 74 22, 72 12, 78 8 C 76 2, 80 2, 84 2 Z" />
            <path d="M48 0 C 54 0, 56 6, 52 9 C 57 12, 51 17, 46 13 C 41 16, 40 8, 45 6 Z" opacity="0.85" />
            <circle cx="30" cy="60" r="2.4" /><circle cx="70" cy="48" r="3" /><circle cx="92" cy="80" r="2" /><circle cx="8" cy="92" r="2.6" />
            <circle cx="55" cy="100" r="2.2" /><circle cx="20" cy="120" r="3.2" /><circle cx="80" cy="132" r="2.6" />
          </g>
        </svg>
        {/* blood running down both edges */}
        <div className="absolute top-0 left-0 w-[10%] h-full shock-pool" style={{ background: 'linear-gradient(to bottom, #6e0000, #4a0000 70%, transparent)', transformOrigin: 'top' }} />
        <div className="absolute top-0 right-0 w-[8%] h-full shock-pool" style={{ background: 'linear-gradient(to bottom, #5b0f1a, #4a0000 65%, transparent)', transformOrigin: 'top', animationDelay: '-3s' }} />
        <div className="absolute bottom-0 inset-x-0 h-[11%] shock-pool" style={{ background: 'linear-gradient(to top, #4a0000, #6e0000 60%, transparent)' }} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {[[13, 0], [23, 1.4], [37, 2.3], [49, 0.7], [62, 1.8], [85, 0.3], [91, 2.1]].map(([l, d], i) => (
          <span key={i} className="absolute top-0 w-[2px] shock-drip" style={{ left: `${l}%`, animationDelay: `${d}s`, height: '24%', opacity: 0.5, background: 'linear-gradient(to bottom, #8b0000, #5b0f1a 75%, transparent)' }}>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[6px] h-[6px] rounded-full" style={{ background: '#8b0000' }} />
          </span>
        ))}
      </div>
    );
  }

  // ── THE SCREAM — twin strobing pentagrams + red rings (back) · red/black strobe + spreading cracks + lightning (front) ──
  if (mode === 'scream') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <InvPentagram className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] shock-scream-flash" color="#ff1030" circle={false} sw={0.7} />
        <InvPentagram className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] shock-scream-flash" color="#8b0000" circle sw={0.4} style={{ animationDelay: '0.15s' }} />
        {[0, 1, 2].map(i => <span key={i} className="absolute left-1/2 top-1/2 w-40 h-40 rounded-full border border-[#ff1030]/60 shock-ring" style={{ animationDelay: `${i * 1.1}s` }} />)}
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-scream-flash" style={{ background: 'rgba(200,16,46,0.5)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-strobe" style={{ background: 'rgba(0,0,0,0.5)' }} />
        <div className="absolute inset-0 shock-scream-vig" style={{ boxShadow: 'inset 0 0 80px 22px rgba(120,0,0,0.6)' }} />
        <svg className="absolute inset-0 w-full h-full shock-crackin" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ opacity: 0.4 }}>
          <g stroke="#ff1030" strokeWidth="0.3" fill="none">
            <path d="M50 0 L48 22 L56 34 L44 52 L52 70 L46 100" /><path d="M48 22 L30 30 L14 26" /><path d="M56 34 L74 40 L92 32" /><path d="M44 52 L24 60 L6 54" /><path d="M52 70 L72 76 L96 70" />
          </g>
        </svg>
      </div>
    );
  }

  // ── CORRUPTION — datamosh blocks (back) · stacked rgb split + glitch bars + scrambled hex + 666 (front) ──
  if (mode === 'glitch') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        {[['12%', '18%', '24%', 'rgba(255,0,64,0.1)'], ['52%', '8%', '40%', 'rgba(0,255,230,0.08)'], ['74%', '30%', '14%', 'rgba(255,255,255,0.06)']].map(([t, l, w, c], i) => (
          <div key={i} className="absolute shock-glitch-bar" style={{ top: t, left: l, width: w, height: '6%', background: c, mixBlendMode: 'screen', animationDelay: `${i * 0.3}s` }} />
        ))}
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <div className="absolute inset-0 shock-rgb-r" style={{ background: 'rgba(255,0,40,0.18)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-rgb-c" style={{ background: 'rgba(0,255,230,0.16)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[8%] shock-glitch-bar" style={{ top: '16%', background: 'rgba(255,255,255,0.1)', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-x-0 h-[5%] shock-glitch-bar2" style={{ top: '44%', background: 'rgba(0,255,230,0.18)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[11%] shock-glitch-bar" style={{ top: '68%', background: 'rgba(200,16,46,0.24)', mixBlendMode: 'screen', animationDelay: '0.4s' }} />
        <div className="absolute inset-x-0 h-[3%] shock-glitch-bar2" style={{ top: '82%', background: 'rgba(255,255,255,0.14)', mixBlendMode: 'overlay', animationDelay: '0.2s' }} />
        <div className="absolute left-3 top-[8%] text-[7px] leading-[1.5] opacity-30 shock-blink" style={{ color: '#00ffe6', fontFamily: '"VT323", monospace' }}>0x66 0xDE 0xAD · FF00FF · 0xC0FFEE<br />SEGFAULT 0x666 · CORE DUMPED</div>
        <div className="absolute left-1/2 top-[42%] -translate-x-1/2 text-3xl tracking-[0.3em] shock-glitch-bar2" style={{ color: '#ff2040', fontFamily: '"VT323", monospace', textShadow: '2px 0 #00ffe6, -2px 0 #ff2040' }}>6̷6̴6̸</div>
        <div className="absolute inset-0 opacity-35" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── PYRE — towering fire + hell-sky pulse + burning star + smoke (back) · embers + rising sparks + ash (front) ──
  if (mode === 'inferno') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0 shock-fire" style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(255,60,0,0.3), transparent 60%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 bottom-0 h-[85%] shock-fire" style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(255,150,0,0.78), rgba(255,40,0,0.5) 34%, rgba(139,0,0,0.28) 58%, transparent 80%)', mixBlendMode: 'screen' }} />
        {[28, 50, 72].map((l, i) => <div key={i} className="absolute bottom-[20%] w-[30%] h-[60%] shock-smoke" style={{ left: `${l}%`, marginLeft: '-15%', background: 'radial-gradient(ellipse at 50% 100%, rgba(40,20,10,0.5), transparent 70%)', animationDelay: `${i * 1.3}s`, animationDuration: `${6 + i}s` }} />)}
        <InvPentagram className="absolute left-1/2 bottom-[6%] -translate-x-1/2 w-44 h-44 opacity-60 shock-fire" color="#ffb300" circle sw={1.7} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {EMBERS.map((e, i) => <span key={i} className="absolute bottom-0 rounded-full shock-ember" style={{ left: `${e.l}%`, width: e.s, height: e.s, animationDelay: `${e.d}s`, animationDuration: `${e.dur}s`, background: 'radial-gradient(circle, #ffdf80, #ff5a00 55%, transparent)', boxShadow: '0 0 6px #ff7a00' }} />)}
        {ASH.map((a, i) => <span key={i} className="absolute top-0 shock-leaf" style={{ left: `${a.l}%`, width: a.s, height: a.s, background: '#2a2420', borderRadius: '50%', opacity: 0.5, animationDelay: `${a.d}s`, animationDuration: `${a.dur}s` }} />)}
      </div>
    );
  }

  // ── BLACK MASS — twin summoning rings + portal vortex + 13 candles (back) · expanding ring + rising chant (front) ──
  if (mode === 'void') {
    const candles = Array.from({ length: 13 }, (_, i) => { const a = (i / 13) * Math.PI * 2 - Math.PI / 2; return { x: 50 + 34 * Math.cos(a), y: 50 + 34 * Math.sin(a) }; });
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0 shock-void" style={{ background: 'radial-gradient(ellipse at 50% 48%, transparent 26%, rgba(0,0,0,0.46) 54%, rgba(0,0,0,0.82) 100%)' }} />
        <div className="absolute left-1/2 top-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full shock-spin" style={{ background: 'conic-gradient(from 0deg, transparent, rgba(200,16,46,0.4), transparent 40%, rgba(123,44,191,0.3), transparent 70%)', filter: 'blur(2px)' }} />
        <InvPentagram className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 shock-summon" color="#C8102E" sw={1.1} />
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 shock-spin-rev" style={{ opacity: 0.4 }}><circle cx="50" cy="50" r="46" fill="none" stroke="#7B2CBF" strokeWidth="0.6" strokeDasharray="3 5" /><circle cx="50" cy="50" r="38" fill="none" stroke="#C8102E" strokeWidth="0.4" strokeDasharray="1 7" /></svg>
        {candles.map((c, i) => <span key={i} className="absolute w-1 h-1 rounded-full animate-flicker" style={{ left: `${c.x}%`, top: `${c.y}%`, background: '#ffb14a', boxShadow: '0 0 8px 2px #ff7a00', animationDelay: `${i * 0.25}s` }} />)}
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {[0, 1].map(i => <span key={i} className="absolute left-1/2 top-1/2 w-44 h-44 rounded-full border border-[#C8102E]/40 shock-ring" style={{ animationDelay: `${i * 1.7}s` }} />)}
        <div className="absolute left-0 right-0 top-[14%] text-center text-[#C8102E] text-[11px] tracking-[0.4em] shock-rise" style={{ fontFamily: '"UnifrakturCook", serif' }}>· AVE · SATANAS ·</div>
        <div className="absolute left-0 right-0 bottom-[14%] text-center text-[#C8102E] text-[11px] tracking-[0.4em] shock-rise" style={{ fontFamily: '"UnifrakturCook", serif', animationDelay: '2.5s' }}>· REGNVM · INFERNVM ·</div>
      </div>
    );
  }

  // ── SANCTUM — god-rays + stained shafts + rose window (back) · dust motes + glowing cross + Latin (front) ──
  if (mode === 'cathedral') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-godray" style={{ background: 'repeating-linear-gradient(74deg, transparent 0 22px, rgba(201,169,97,0.14) 22px 28px, transparent 28px 56px)', mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-godray2" style={{ background: 'repeating-linear-gradient(106deg, transparent 0 30px, rgba(123,44,191,0.14) 30px 36px, transparent 36px 70px)', mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-godray" style={{ background: 'repeating-linear-gradient(88deg, transparent 0 40px, rgba(91,15,26,0.1) 40px 48px, transparent 48px 90px)', mixBlendMode: 'screen', animationDuration: '11s' }} />
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-[8%] -translate-x-1/2 w-28 h-28 opacity-25 shock-spin" style={{ animationDuration: '90s' }}>
          {Array.from({ length: 12 }).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1="50" y1="50" x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke="#C9A961" strokeWidth="0.5" />; })}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#C9A961" strokeWidth="0.6" /><circle cx="50" cy="50" r="30" fill="none" stroke="#7B2CBF" strokeWidth="0.5" /><circle cx="50" cy="50" r="14" fill="none" stroke="#C8102E" strokeWidth="0.6" />
        </svg>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -15%, rgba(91,15,26,0.42), transparent 62%)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#d6cfc0]`} aria-hidden>
        {MOTES.slice(0, 18).map((m, i) => <span key={i} className="absolute rounded-full shock-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, width: m.s, height: m.s, background: 'rgba(201,169,97,0.8)', boxShadow: '0 0 4px rgba(201,169,97,0.7)', animationDelay: `${m.d}s`, animationDuration: `${m.dur}s` }} />)}
        <div className="absolute left-1/2 top-6 -translate-x-1/2 shock-summon" style={{ color: '#d6cfc0' }}>
          <div className="w-[3px] h-16 bg-current mx-auto" /><div className="w-10 h-[3px] bg-current absolute top-11 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute left-0 right-0 top-[30%] text-center text-[#d6cfc0]/70 text-[10px] tracking-[0.4em]" style={{ fontFamily: '"UnifrakturCook", serif' }}>· DEVS · MORTVVS · EST ·</div>
      </div>
    );
  }

  // ── REBIRTH — flashing corner blocks + wash (back) · marquee + rotating 666 + chevrons + chrome (front) ──
  if (mode === 'rebirth') {
    if (back) return (
      <div className={`${BWRAP} text-[#C8102E]`} aria-hidden>
        <div className="absolute top-0 right-0 w-[30%] h-[16%] shock-blink" style={{ background: 'linear-gradient(135deg, #ff0a2e, #5B0F1A)' }} />
        <div className="absolute bottom-0 left-0 w-[30%] h-[16%] shock-blink" style={{ background: 'linear-gradient(135deg, #5B0F1A, #ff0a2e)', animationDelay: '0.4s' }} />
        <div className="absolute top-0 left-0 w-[14%] h-[30%]" style={{ background: 'linear-gradient(180deg, #ff0a2e, transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(255,10,46,0.24), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(255,10,46,0.24), transparent 42%)', mixBlendMode: 'screen' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#C8102E]`} aria-hidden>
        <div className="absolute top-3 left-2 flex flex-col text-[18px] leading-[0.8] font-bold shock-chevron" style={{ fontFamily: '"Manrope", sans-serif' }}>{Array.from({ length: 7 }).map((_, i) => <span key={i}>❯</span>)}</div>
        <div className="absolute top-2 right-[33%] text-2xl font-bold shock-spin" style={{ fontFamily: '"Manrope", sans-serif', animationDuration: '6s' }}>666</div>
        <div className="absolute left-2 bottom-[20%] text-[9px] tracking-[0.25em] opacity-80" style={{ writingMode: 'vertical-rl', fontFamily: '"VT323", monospace' }}>MMXXVI · COVEN</div>
        <div className="absolute top-[46%] inset-x-0 overflow-hidden h-5 opacity-90">
          <div className="whitespace-nowrap text-base font-bold tracking-[0.2em] shock-godray" style={{ fontFamily: '"Manrope", sans-serif', animationDuration: '5s' }}>NO FUTURE · NO GODS · NO MASTERS · BORN AGAIN IN FIRE · NO FUTURE · NO GODS · NO MASTERS ·</div>
        </div>
        {[['top-3 right-[5%]'], ['bottom-[18%] right-4'], ['top-[18%] left-[32%]']].map(([pos], i) => <span key={i} className={`absolute ${pos} text-[13px] opacity-70`}>⛧</span>)}
        <div className="absolute inset-0 border-[3px] border-[#C8102E]/35" />
      </div>
    );
  }

  // ── REQUIEM — the blinking, weeping eye + radiating lines (back) · grain + scanlines + falling tear (front) ──
  if (mode === 'requiem') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-[24%] -translate-x-1/2 w-44 h-44 opacity-20">
          {Array.from({ length: 24 }).map((_, i) => { const a = (i / 24) * Math.PI * 2; return <line key={i} x1={50 + 22 * Math.cos(a)} y1={50 + 22 * Math.sin(a)} x2={50 + 48 * Math.cos(a)} y2={50 + 48 * Math.sin(a)} stroke="#fff" strokeWidth="0.4" />; })}
        </svg>
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-[30%] -translate-x-1/2 w-28 h-28 opacity-30 shock-eyeblink" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M4 50 Q50 14 96 50 Q50 86 4 50 Z" /><circle cx="50" cy="50" r="18" /><circle cx="50" cy="50" r="8" fill="#fff" className="shock-summon" />
        </svg>
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        <span className="absolute top-[44%] left-1/2 w-[2px] shock-tear" style={{ height: '5%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)', animationDuration: '7s' }} />
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.42 }} />
        <div className="absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── MIST — layered rolling fog + a ghost in the haze + pentagram (back) · leaves + motes + grain (front) ──
  if (mode === 'mist') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-fog" style={{ background: 'radial-gradient(ellipse at 30% 38%, rgba(225,205,165,0.42), transparent 55%)' }} />
        <div className="absolute -inset-1/3 shock-fog2" style={{ background: 'radial-gradient(ellipse at 72% 64%, rgba(205,180,145,0.38), transparent 55%)' }} />
        <div className="absolute -inset-1/4 shock-fog" style={{ background: 'radial-gradient(ellipse at 52% 88%, rgba(180,160,120,0.34), transparent 50%)', animationDuration: '20s', animationDelay: '-6s' }} />
        <VeiledFigure className="absolute left-1/2 bottom-0 -translate-x-1/2 w-40 h-[80%] opacity-25 shock-veil" color="#cdbf9a" />
        <InvPentagram className="absolute left-1/2 top-[34%] -translate-x-1/2 w-40 h-40 opacity-[0.08]" color="#7a6a4a" circle sw={1} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(150,130,95,0.32), transparent 45%)' }} />
      </div>
    );
    return (
      <div className={FWRAP} aria-hidden>
        {LEAVES.map((lf, i) => <span key={i} className="absolute top-0 text-[10px] shock-leaf" style={{ left: `${lf.l}%`, color: 'rgba(150,110,60,0.6)', animationDelay: `${lf.d}s`, animationDuration: `${lf.dur}s` }}>❧</span>)}
        {MOTES.slice(0, 12).map((m, i) => <span key={i} className="absolute rounded-full shock-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, width: m.s, height: m.s, background: 'rgba(210,190,150,0.6)', animationDelay: `${m.d}s`, animationDuration: `${m.dur}s` }} />)}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.22 }} />
      </div>
    );
  }

  // ── RELIQUARY — ornate arch + rose window + candle row (back) · glowing cross + Latin + gilt corners (front) ──
  if (mode === 'reliquary') {
    if (back) return (
      <div className={`${BWRAP} text-[#d6cfc0]`} aria-hidden>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 200" style={{ opacity: 0.7 }}>
          <rect x="3" y="3" width="94" height="194" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M10 44 Q10 14 50 11 Q90 14 90 44" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M14 44 Q14 18 50 15 Q86 18 86 44" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.7" />
          {[22, 34, 50, 66, 78].map((x, i) => <path key={i} d={`M${x - 4} 24 Q${x} 16 ${x + 4} 24`} fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />)}
        </svg>
        <svg viewBox="0 0 100 100" className="absolute left-1/2 top-[14%] -translate-x-1/2 w-24 h-24 opacity-30 shock-spin" style={{ animationDuration: '70s' }}>
          {Array.from({ length: 8 }).map((_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M50 50 L${50 + 44 * Math.cos(a)} ${50 + 44 * Math.sin(a)}`} stroke="#C9A961" strokeWidth="0.5" />; })}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#C9A961" strokeWidth="0.6" /><circle cx="50" cy="50" r="20" fill="none" stroke="#7B2CBF" strokeWidth="0.5" />
        </svg>
        <div className="absolute bottom-[3%] inset-x-0 flex items-end justify-center gap-5 opacity-70">
          {[0, 1, 2, 3, 4].map(i => <span key={i} className="w-[3px] rounded-full animate-flicker" style={{ height: 10 + (i % 3) * 6, background: 'radial-gradient(circle at 50% 0%, #fff, #ffb14a 50%, #8a4a00)', boxShadow: '0 0 8px rgba(255,170,80,0.6)', animationDelay: `${i * 0.3}s` }} />)}
        </div>
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 55px 10px rgba(0,0,0,0.35)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#d6cfc0]`} aria-hidden>
        <div className="absolute left-1/2 top-3 -translate-x-1/2 shock-summon" style={{ color: '#d6cfc0' }}>
          <div className="w-[2px] h-7 bg-current mx-auto" /><div className="w-5 h-[2px] bg-current absolute top-5 left-1/2 -translate-x-1/2" />
        </div>
        <div className="absolute left-0 right-0 top-[2px] text-center text-[9px] tracking-[0.3em] opacity-70" style={{ fontFamily: '"UnifrakturCook", serif' }}>· OVR · POWER · IS · INFINITE ·</div>
        {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((p, i) => <span key={i} className={`absolute ${p} text-base opacity-80`} style={{ color: '#C9A961' }}>⛧</span>)}
      </div>
    );
  }

  // ── ALCHEMY — twin rotating rings + zodiac + planets + constellation (back) · glyphs + gold dust + kanji (front) ──
  if (mode === 'alchemy') {
    if (back) return (
      <div className={`${BWRAP} text-[#bcb4a2]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(6,6,10,0.18)' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[150%] h-[150%] shock-orbit" style={{ opacity: 0.18 }}>
          {[34, 56, 78, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" />)}
          <ellipse cx="100" cy="100" rx="96" ry="46" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[150%] h-[150%] shock-orbit-slow" style={{ opacity: 0.16 }}>
          <ellipse cx="100" cy="100" rx="46" ry="96" fill="none" stroke="#C9A961" strokeWidth="0.4" />
          {ZODIAC.map((_, i) => { const a = (i / 12) * Math.PI * 2; const b = ((i + 5) / 12) * Math.PI * 2; return <line key={i} x1={100 + 90 * Math.cos(a)} y1={100 + 90 * Math.sin(a)} x2={100 + 90 * Math.cos(b)} y2={100 + 90 * Math.sin(b)} stroke="#C9A961" strokeWidth="0.2" />; })}
        </svg>
        <div className="absolute left-1/2 top-1/2 w-[78%] aspect-square -translate-x-1/2 -translate-y-1/2 shock-orbit-slow" style={{ opacity: 0.32 }}>
          {ZODIAC.map((z, i) => { const a = (i / 12) * Math.PI * 2; return <span key={i} className="absolute text-xs" style={{ left: `${50 + 48 * Math.cos(a)}%`, top: `${50 + 48 * Math.sin(a)}%`, transform: 'translate(-50%,-50%)' }}>{z}</span>; })}
        </div>
        <div className="absolute w-8 h-8 rounded-full shock-fog" style={{ right: '18%', top: '60%', background: 'radial-gradient(circle at 35% 35%, #6a6478, #1a1822 70%)', boxShadow: '0 0 18px rgba(120,110,150,0.4)' }} />
        <div className="absolute w-5 h-5 rounded-full shock-fog2" style={{ left: '20%', top: '24%', background: 'radial-gradient(circle at 35% 35%, #b8a06a, #3a2f12 70%)', boxShadow: '0 0 14px rgba(201,169,97,0.5)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#bcb4a2]`} aria-hidden>
        {ALCHEMY_GLYPHS.map((a, i) => <span key={i} className="absolute text-lg shock-twinkle" style={{ top: a.t, left: a.l, opacity: 0.4, animationDelay: `${(i % 6) * 0.5}s` }}>{a.g}</span>)}
        {MOTES.slice(0, 14).map((m, i) => <span key={i} className="absolute rounded-full shock-mote" style={{ left: `${m.l}%`, top: `${m.t}%`, width: m.s, height: m.s, background: 'rgba(201,169,97,0.7)', boxShadow: '0 0 3px rgba(201,169,97,0.6)', animationDelay: `${m.d}s`, animationDuration: `${m.dur}s` }} />)}
        <div className="absolute left-2 top-[18%] text-[10px] leading-[1.8] opacity-25" style={{ writingMode: 'vertical-rl', fontFamily: '"Shippori Mincho", serif' }}>生流転死再生</div>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.25 }} />
      </div>
    );
  }

  // ── KEEPSAKE — candlelight + roses + light-leak (back) · torn captions + polaroid + THE END + petals (front) ──
  if (mode === 'keepsake') {
    if (back) return (
      <div className={`${BWRAP} text-[#cdbb97]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 112%, rgba(232,196,90,0.55), rgba(120,90,40,0.16) 40%, transparent 74%)', mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-fog" style={{ background: 'radial-gradient(ellipse at 84% 8%, rgba(232,210,150,0.3), transparent 52%)' }} />
        <div className="absolute -inset-1/4 shock-fog2" style={{ background: 'radial-gradient(ellipse at 10% 30%, rgba(220,120,80,0.16), transparent 50%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px 30px rgba(18,12,5,0.62)' }} />
        <Rose className="absolute left-[4%] bottom-[6%] w-14 h-24 opacity-25 -rotate-12" color="#a89066" />
        <Rose className="absolute right-[5%] top-[10%] w-10 h-16 opacity-20 rotate-[18deg]" color="#a89066" />
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
        <div className="absolute top-[40%] right-[6%] w-16 rotate-[5deg] p-1 pb-3 bg-[#e4d6b8] shadow-[0_2px_8px_rgba(0,0,0,0.5)]"><div className="w-full h-16 bg-gradient-to-br from-[#7a6648] to-[#2a2014]" /><span className="block text-center text-[7px] mt-1 tracking-wider">us, once</span></div>
        <span className="absolute top-[20%] right-[8%] px-2 py-[3px] text-[10px] tracking-[0.2em] rotate-[-6deg] border border-[#3a2c18]/40" style={{ background: 'rgba(228,214,184,0.85)' }}>THE END</span>
        <div className="absolute top-[6%] right-[10%] flex gap-1.5 opacity-55">
          {['#1a1208', '#5a4424', '#cdbb97', '#5a4424', '#1a1208'].map((c, i) => <span key={i} className="block w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: '0 0 5px rgba(232,196,90,0.4)' }} />)}
        </div>
        <span className="absolute bottom-[28%] right-[14%] text-base opacity-50">🦋</span>
        {PETALS.slice(0, 10).map((p, i) => <span key={i} className="absolute top-0 text-[10px] shock-leaf" style={{ left: `${p.l}%`, color: 'rgba(180,140,90,0.55)', animationDelay: `${p.d}s`, animationDuration: `${p.dur}s` }}>{p.g}</span>)}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '110px 110px', mixBlendMode: 'overlay', opacity: 0.24 }} />
      </div>
    );
  }

  // ── XEROX — halftone face + layered words (back) · lyric scatter + toner streaks + crop/barcode/stamp (front) ──
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
        <div className="absolute inset-y-0 left-[28%] w-[3px] opacity-30" style={{ background: 'repeating-linear-gradient(to bottom, #000 0 3px, transparent 3px 9px)' }} />
        <div className="absolute inset-y-0 right-[18%] w-[2px] opacity-25" style={{ background: 'repeating-linear-gradient(to bottom, #000 0 5px, transparent 5px 12px)' }} />
        <div className="absolute left-3 right-3 top-[40%] text-[13px] leading-[1.05] font-bold uppercase opacity-80" style={{ letterSpacing: '-0.01em' }}>now i have to remember you<br />for longer than i&apos;ve known you</div>
        {[
          { t: 'I MISS YOU', top: '12%', left: '11%' }, { t: 'do you remember us?', top: '24%', left: '48%' },
          { t: 'where are you now?', top: '58%', left: '16%' }, { t: 'if i knew', top: '70%', left: '60%' },
          { t: 'sorry', top: '34%', left: '7%' }, { t: 'maybe we…', top: '64%', left: '46%' },
          { t: 'what could have been?', top: '86%', left: '10%' }, { t: 'guess i never will', top: '90%', left: '58%' },
        ].map((a, i) => <span key={i} className="absolute text-[9px] uppercase tracking-[0.18em] opacity-60 shock-blink" style={{ top: a.top, left: a.left, animationDelay: `${(i % 6) * 0.4}s` }}>{a.t}</span>)}
        {['top-2 left-2 border-l border-t', 'top-2 right-2 border-r border-t', 'bottom-2 left-2 border-l border-b', 'bottom-2 right-2 border-r border-b'].map((p, i) => <span key={i} className={`absolute ${p} w-3 h-3 border-white/50`} />)}
        <div className="absolute bottom-2 right-3 flex items-end gap-[1.5px] h-4 opacity-70">{[2,1,3,1,2,1,1,3,2,1,2,3,1,2].map((w,i)=><span key={i} className="bg-white" style={{ width: w, height: '100%' }} />)}</div>
        <div className="absolute bottom-2.5 left-3 text-[8px] uppercase tracking-[0.25em] opacity-60">WK 51 / 52 · COVEN.JPG</div>
        <div className="absolute top-[16%] right-[6%] text-[9px] uppercase tracking-[0.2em] border border-white/50 px-1.5 py-0.5 rotate-[7deg] opacity-70 shock-blink">PROOF</div>
        <div className="absolute inset-0 shock-burst" style={{ backgroundImage: GRAIN, backgroundSize: '50px 50px', mixBlendMode: 'overlay', opacity: 0.55 }} />
      </div>
    );
  }

  // ── SEE NO EVIL — riso misregister halftone figure (back) · big stencil + cracks + micro-text (front) ──
  if (mode === 'duotone') {
    if (back) return (
      <div className={`${BWRAP} text-[#9fc0e8]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 62% 40%, rgba(40,90,200,0.22), transparent 74%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-halftone-drift" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1.1px, transparent 2.2px)', backgroundSize: '8px 8px', mixBlendMode: 'overlay', opacity: 0.4 }} />
        <div className="absolute right-[6%] top-1/2 -translate-y-1/2 w-[55%] aspect-[3/4] opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#cfe0f5 36%, transparent 38%)', backgroundSize: '6px 6px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)' }} />
        <div className="absolute right-[4%] top-1/2 -translate-y-1/2 w-[55%] aspect-[3/4] opacity-[0.07] shock-jitter" style={{ backgroundImage: 'radial-gradient(#e88 36%, transparent 38%)', backgroundSize: '6px 6px', maskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 68%)', mixBlendMode: 'screen' }} />
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

  // ── THE VOW — glowing crowned skull + reaching hands + thorn frame + candles (back) · pulsing vow + daggers (front) ──
  if (mode === 'vow') {
    if (back) return (
      <div className={`${BWRAP} text-[#b8b0a4]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(6,4,6,0.32)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 80px 24px rgba(0,0,0,0.78)' }} />
        <CrownedSkull className="absolute left-1/2 top-[5%] -translate-x-1/2 w-24 h-28 opacity-35 shock-summon" color="#cfc6b8" />
        <BoneHand className="absolute left-[6%] top-[8%] w-16 h-28 -rotate-[18deg]" opacity={0.32} />
        <BoneHand className="absolute right-[8%] bottom-[4%] w-16 h-28 rotate-[200deg] scale-x-[-1]" opacity={0.3} />
        <BoneHand className="absolute left-[18%] bottom-[2%] w-12 h-24 rotate-[8deg]" opacity={0.22} />
        <div className="absolute bottom-[3%] inset-x-0 flex items-end justify-center gap-6 opacity-70">
          {[0, 1].map(i => <span key={i} className="w-[3px] rounded-full animate-flicker" style={{ height: 14, background: 'radial-gradient(circle at 50% 0%, #fff, #ffb14a 50%, #8a4a00)', boxShadow: '0 0 8px rgba(255,170,80,0.6)', animationDelay: `${i * 0.4}s` }} />)}
        </div>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <rect x="2.5" y="2.5" width="95" height="95" fill="none" stroke="#cfc6b8" strokeWidth="0.2" opacity="0.32" />
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#cfc6b8" strokeWidth="0.12" opacity="0.22" />
          <g stroke="#cfc6b8" strokeWidth="0.3" fill="none" opacity="0.55">
            {[[5, 5, 0], [95, 5, 90], [95, 95, 180], [5, 95, 270]].map(([x, y, r], i) => (
              <path key={i} d="M0 20 Q0 0 20 0 M3 13 q5 -9 10 -10 M0 9 q6 0 7 6 M9 0 q0 6 6 7 M0 28 q-1 -6 4 -8 M28 0 q-6 -1 -8 4" transform={`translate(${x},${y}) rotate(${r})`} />
            ))}
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

  // ── LAMENT — a mourning letter: ink wept across parchment in a rain-struck castle. cold storm-
  //    light through a gothic window, a single guttering candle, a wilting rose shedding petals,
  //    and ink that runs like tears. heart-wrenching and beautiful — grief held by one small flame.
  if (mode === 'lament') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        {/* cold castle stone, a sorrowful blue-grey dark */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 26%, rgba(40,46,64,0.5), rgba(10,12,20,0.86) 56%, #04050a 100%)' }} />
        {/* gothic window — pale cold storm-light, rain on the glass */}
        <div className="absolute left-1/2 top-[2%] -translate-x-1/2 w-44 h-60 overflow-hidden">
          <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMin meet">
            <defs>
              <linearGradient id="lamentSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#aeb8d4" stopOpacity="0.5" /><stop offset="0.5" stopColor="#7e8aa8" stopOpacity="0.26" /><stop offset="1" stopColor="#5a6480" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M50 6 Q14 11 14 50 L14 150 L86 150 L86 50 Q86 11 50 6 Z" fill="url(#lamentSky)" className="shock-veil" />
            {/* rain streaking the panes */}
            <g stroke="#cdd6ee" strokeWidth="0.5" opacity="0.34">
              {[20, 30, 40, 52, 62, 72, 80].map((x, i) => <line key={i} x1={x} y1="12" x2={x - 7} y2="148" />)}
            </g>
            <path d="M50 6 L50 150 M14 50 L86 50 M32 28 L32 150 M68 28 L68 150" stroke="#0a0b12" strokeWidth="1.1" fill="none" opacity="0.85" />
            <path d="M50 6 Q14 11 14 50 L14 150 M50 6 Q86 11 86 50 L86 150" stroke="#161a26" strokeWidth="2.4" fill="none" />
          </svg>
        </div>
        {/* the cold pale light falling into the room */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[58%] h-[74%] shock-veil" style={{ background: 'linear-gradient(180deg, rgba(174,184,212,0.2), rgba(126,138,168,0.06) 46%, transparent 76%)', mixBlendMode: 'screen', clipPath: 'polygon(34% 0, 66% 0, 88% 100%, 12% 100%)' }} />
        {/* the letter — parchment with ink wept across it */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[82%] h-[63%] rotate-[-1deg]"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, #e6dcc4, #c9bd9c 64%, #a3977a 100%)', opacity: 0.42, boxShadow: '0 12px 60px 10px rgba(0,0,0,0.72), inset 0 0 44px rgba(70,66,52,0.45)' }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <filter id="lamentInk" x="-40%" y="-40%" width="180%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="9" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="15" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            {/* ink running down from the words, like tears */}
            <g filter="url(#lamentInk)" fill="#23160c" opacity="0.72" stroke="#23160c" strokeLinecap="round">
              <path d="M30 30 q5 18 -2 30 q-6 14 2 30" strokeWidth="2.6" fill="none" className="shock-ink-bloom" />
              <path d="M52 32 q4 16 -1 30 q-4 12 2 26" strokeWidth="2" fill="none" className="shock-ink-bloom" style={{ animationDelay: '1.6s' }} />
              <path d="M70 30 q-4 18 2 32 q5 10 -2 22" strokeWidth="2.2" fill="none" className="shock-ink-bloom" style={{ animationDelay: '2.6s' }} />
              <circle cx="22" cy="26" r="2.4" stroke="none" className="shock-ink-bloom" style={{ animationDelay: '0.6s' }} />
              <circle cx="80" cy="34" r="2" stroke="none" className="shock-ink-bloom" style={{ animationDelay: '3.4s' }} />
            </g>
          </svg>
          {/* the written grief, drying in */}
          <div className="absolute left-0 right-0 top-[18%] text-center px-6 shock-ink-write" style={{ fontFamily: '"IM Fell English", serif', color: '#241910', fontSize: '15px', lineHeight: 1.55 }}>
            your side of the bed<br />is still cold
          </div>
        </div>
        {/* a single guttering candle — the last warmth in the room */}
        <div className="absolute left-[15%] bottom-[19%] flex flex-col items-center">
          <span className="block w-[4px] rounded-full animate-flicker" style={{ height: 11, marginBottom: -1, background: 'radial-gradient(circle at 50% 0%, #fff, #ffb14a 45%, #8a4a00)', filter: 'blur(0.3px)', boxShadow: '0 0 16px 5px rgba(255,170,80,0.45)' }} />
          <span className="block w-[7px] rounded-[2px]" style={{ height: 30, background: 'linear-gradient(180deg, #e8dcc0, #b9a886 70%, #8a7a58)' }} />
        </div>
        {/* a wilting rose, its head bowed */}
        <Rose className="absolute right-[9%] bottom-[9%] w-12 h-20 opacity-30 rotate-[152deg]" color="#7a5a66" />
        {/* the cold vignette of the keep */}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 130px 44px rgba(3,4,8,0.88)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#cdd6ee]`} aria-hidden>
        {/* rain falling through the whole room */}
        {RAIN.slice(0, 18).map((r, i) => <span key={i} className="absolute top-0 w-px shock-rain" style={{ left: `${r.l}%`, height: `${r.h}%`, background: 'linear-gradient(to bottom, transparent, rgba(190,202,230,0.42))', animationDelay: `${r.d}s`, animationDuration: `${r.dur}s` }} />)}
        {/* ink tears running down the page */}
        {[[30, 0], [52, 2.4], [70, 1.3]].map(([l, d], i) => (
          <span key={i} className="absolute top-[34%] w-[1.5px] shock-drip" style={{ left: `${l}%`, height: '24%', opacity: 0.5, background: 'linear-gradient(to bottom, #160c06, #23160c 72%, transparent)', animationDelay: `${d}s`, animationDuration: '5.2s' }} />
        ))}
        {/* falling rose petals, slow and mournful */}
        {PETALS.slice(0, 9).map((p, i) => <span key={i} className="absolute top-0 text-[11px] shock-leaf" style={{ left: `${p.l}%`, color: 'rgba(150,96,112,0.5)', animationDelay: `${p.d}s`, animationDuration: `${p.dur + 3}s` }}>{p.g}</span>)}
        {/* the tender, hopeless-hopeful turn — tied to the rain */}
        <div className="absolute left-0 right-0 bottom-[14%] text-center text-[12px] tracking-[0.26em] italic shock-veil" style={{ fontFamily: '"IM Fell English", serif', color: '#aeb8d4', textShadow: '0 0 10px rgba(120,140,180,0.5)' }}>· come back as rain — i won't mind ·</div>
        {/* cold paper-grain + the dark */}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '120px 120px', mixBlendMode: 'overlay', opacity: 0.18 }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px 26px rgba(4,5,10,0.6)' }} />
      </div>
    );
  }

  // ── EGO DEATH — a mindfuck for the "I": a hypnotic vortex spiralling into a watching eye, the
  //    self glitching apart, eyes opening everywhere, dissociative whispers. the whole app's hue warps.
  if (mode === 'egodeath') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 45%, rgba(24,12,36,0.42), rgba(4,3,8,0.92) 70%)' }} />
        {/* two counter-spinning hypnotic pinwheels */}
        <div className="absolute left-1/2 top-[45%] w-[120%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full shock-spin" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(10,5,18,0.6) 0deg 7deg, rgba(42,22,64,0.5) 7deg 14deg)', opacity: 0.4, maskImage: 'radial-gradient(circle, #000 30%, transparent 66%)', WebkitMaskImage: 'radial-gradient(circle, #000 30%, transparent 66%)', animationDuration: '26s' }} />
        <div className="absolute left-1/2 top-[45%] w-[82%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full shock-spin-rev" style={{ background: 'repeating-conic-gradient(from 0deg, transparent 0deg 9deg, rgba(123,44,191,0.4) 9deg 12deg)', opacity: 0.5, maskImage: 'radial-gradient(circle, #000 18%, transparent 60%)', WebkitMaskImage: 'radial-gradient(circle, #000 18%, transparent 60%)' }} />
        {/* the vortex rings pulled into the eye */}
        {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="absolute left-1/2 top-[45%] w-64 h-64 rounded-full shock-pull" style={{ border: `2px solid ${i % 2 ? 'rgba(200,16,46,0.5)' : 'rgba(123,44,191,0.5)'}`, animationDelay: `${i * 0.66}s` }} />)}
        {/* the watching eye at the centre */}
        <svg viewBox="0 0 100 60" className="absolute left-1/2 top-[45%] w-52 -translate-x-1/2 -translate-y-1/2" style={{ opacity: 0.55 }}>
          <path d="M3 30 Q50 2 97 30 Q50 58 3 30 Z" fill="#050308" stroke="#cdbce8" strokeWidth="1" className="shock-eyeblink" />
          <circle cx="50" cy="30" r="13" fill="none" stroke="#C8102E" strokeWidth="1.2" className="shock-void" />
          <circle cx="50" cy="30" r="5.5" fill="#000" className="shock-void" />
          <circle cx="46.5" cy="26.5" r="1.5" fill="#fff" opacity="0.7" />
        </svg>
        <div className="absolute inset-0 shock-void" style={{ boxShadow: 'inset 0 0 120px 44px rgba(2,1,6,0.72)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#cdbce8]`} aria-hidden>
        {/* a giant fragmenting "I" — the self coming apart */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none shock-rgb-r" style={{ fontSize: '52vw', color: 'rgba(255,255,255,0.05)', fontFamily: '"Grenze Gotisch", serif', textShadow: '5px 0 rgba(200,16,46,0.35), -5px 0 rgba(0,255,230,0.28)' }}>I</div>
        {/* watching eyes opening across the dark */}
        {EYES.map((e, i) => <span key={i} className="absolute shock-twinkle" style={{ left: `${e.l}%`, top: `${e.t}%`, fontSize: e.s, opacity: 0.5, animationDelay: `${e.d}s` }}>👁</span>)}
        {/* dissociative whispers, flickering in and out */}
        {[
          { t: 'you are not real', top: '12%', left: '8%' }, { t: 'who is watching?', top: '24%', left: '52%' },
          { t: 'this never happened', top: '40%', left: '13%' }, { t: 'wake up', top: '58%', left: '62%' },
          { t: 'none of this is you', top: '70%', left: '9%' }, { t: 'look away', top: '84%', left: '50%' },
          { t: 'are you still here?', top: '90%', left: '12%' }, { t: 'there is no I', top: '32%', left: '72%' },
        ].map((a, i) => <span key={i} className="absolute text-[10px] uppercase tracking-[0.2em] opacity-50 shock-blink" style={{ top: a.top, left: a.left, animationDelay: `${(i % 6) * 0.4}s`, fontFamily: '"VT323", monospace' }}>{a.t}</span>)}
        <div className="absolute inset-0 shock-rgb-c" style={{ background: 'rgba(0,255,230,0.05)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── SLEEP PARALYSIS — pure horror: a wraith looms out of the black and LUNGES (jumpscare flash),
  //    skeletal hands reach, claw marks tear the screen, blood drips, the eyelids slam shut. don't move.
  if (mode === 'paralysis') {
    if (back) return (
      <div className={BWRAP} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(18,16,20,0.4), rgba(4,4,5,0.78) 72%)' }} />
        {/* a failing, flickering light */}
        <div className="absolute left-1/2 top-[6%] -translate-x-1/2 w-[60%] h-[50%] animate-flicker" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(180,180,190,0.12), transparent 62%)', mixBlendMode: 'screen' }} />
        {/* the entity, looming out of the dark then lunging */}
        <WraithFace className="absolute left-1/2 top-[14%] w-44 shock-loom" />
        {/* skeletal hands reaching from the edges */}
        <BoneHand className="absolute left-[4%] bottom-[5%] w-16 h-28 -rotate-[24deg]" opacity={0.3} />
        <BoneHand className="absolute right-[5%] bottom-[2%] w-16 h-28 rotate-[206deg] scale-x-[-1]" opacity={0.28} />
        {/* a creeping shadow rising from below, breathing */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] shock-breath-heavy" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
      </div>
    );
    return (
      <div className={`${FWRAP} text-[#b8b0a8]`} aria-hidden>
        {/* the jumpscare — a sudden blinding flash on the lunge */}
        <div className="absolute inset-0 shock-jump" style={{ background: 'rgba(222,222,228,0.9)' }} />
        {/* labored-breath vignette closing in (eased so the app stays readable between breaths) */}
        <div className="absolute inset-0 shock-breath-heavy" style={{ boxShadow: 'inset 0 0 80px 20px rgba(0,0,0,0.6)' }} />
        {/* claw marks torn down the screen */}
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100"><g stroke="#5b0f1a" strokeWidth="0.5" fill="none" strokeLinecap="round">
          <path d="M20 6 L24 70" /><path d="M26 4 L31 72" /><path d="M32 8 L36 66" /><path d="M70 10 L74 78" /><path d="M76 6 L80 74" />
        </g></svg>
        {/* blood weeping from the top */}
        {[[40, 0], [58, 1.6]].map(([l, d], i) => <span key={i} className="absolute top-0 w-[2px] shock-drip" style={{ left: `${l}%`, height: '18%', background: 'linear-gradient(to bottom, #8b0000, #5b0f1a 70%, transparent)', animationDelay: `${d}s` }} />)}
        {/* the terror, flickering */}
        <div className="absolute left-0 right-0 top-[42%] text-center text-[15px] tracking-[0.3em] text-[#C8102E] shock-blink" style={{ fontFamily: '"IM Fell English", serif', textShadow: '0 0 12px rgba(139,0,0,0.85)' }}>don't move</div>
        <div className="absolute left-0 right-0 bottom-[15%] text-center text-[10px] tracking-[0.34em] text-[#b8b0a8]/60 shock-blink" style={{ animationDelay: '0.6s', fontFamily: '"VT323", monospace' }}>IT IS ALREADY IN THE ROOM</div>
        {/* the eyelids slam shut */}
        <div className="absolute inset-0 shock-eyelid" style={{ background: '#000' }} />
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '120px 120px', mixBlendMode: 'overlay', opacity: 0.3 }} />
      </div>
    );
  }

  return null;
}

// Mode registry — drives the picker (label + one-line vibe). Order = picker order.
export const SHOCK_MODES = [
  { id: 'none', label: 'None', desc: 'pure brutalist base' },
  { id: 'lament', label: 'Lament', desc: 'a mourning letter · rain & candlelight · heartbreaking' },
  { id: 'egodeath', label: 'Ego Death', desc: 'the I dissolves · hypnotic vortex · the watching eye' },
  { id: 'paralysis', label: 'Sleep Paralysis', desc: 'pure horror · a wraith lunges from the dark' },
  { id: 'insomnia', label: 'Insomnia', desc: 'electric blue · heartbeat · 3:33am' },
  { id: 'dead-channel', label: 'Dead Channel', desc: '1-bit dither · tracking roll · no signal' },
  { id: 'emergency', label: 'Emergency', desc: 'twin radar · alert ticker · infernal signal' },
  { id: 'spatter', label: 'Blood Rite', desc: 'spatter · running blood · pentagram' },
  { id: 'scream', label: 'The Scream', desc: 'convulse · cracks · red rings' },
  { id: 'glitch', label: 'Corruption', desc: 'rgb shudder · datamosh · 666' },
  { id: 'inferno', label: 'Pyre', desc: 'towering fire · embers · ash · smoke' },
  { id: 'void', label: 'Black Mass', desc: 'twin circles · portal vortex · ave satanas' },
  { id: 'cathedral', label: 'Sanctum', desc: 'god-rays · rose window · dust' },
  { id: 'rebirth', label: 'Rebirth', desc: 'poster · marquee · spinning 666' },
  { id: 'requiem', label: 'Requiem', desc: 'stark b&w · the weeping eye' },
  { id: 'mist', label: 'Mist', desc: 'sepia fog · a ghost · falling leaves' },
  { id: 'reliquary', label: 'Reliquary', desc: 'gothic arch · rose window · candles' },
  { id: 'alchemy', label: 'Alchemy', desc: 'twin orbits · planets · constellation' },
  { id: 'keepsake', label: 'Keepsake', desc: 'sepia collage · candlelight · torn paper' },
  { id: 'xerox', label: 'Xerox', desc: 'zine photocopy · toner streaks · lyrics' },
  { id: 'duotone', label: 'See No Evil', desc: 'blue riso · misregister · stencil' },
  { id: 'vow', label: 'The Vow', desc: 'black-metal filigree · glowing skull · till death' },
];
