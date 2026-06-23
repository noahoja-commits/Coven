// Selectable full-screen "shock" visual modes. Renders ON TOP of the app at z-30 and is
// pointer-events-none, so each mode dominates the screen while the app stays fully tappable.
// One mode at a time (settings.shockMode). Motion is real (see index.css .shock-* keyframes);
// the 'scream'/'glitch' frame-shake itself is a class on the phone-frame (App.jsx).

const WRAP = 'absolute inset-0 pointer-events-none z-30 overflow-hidden';
const GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>\")";
// scattered alchemical / astronomical glyphs for the Alchemy mode
const ALCHEMY_GLYPHS = [
  { g: '☉', t: '8%', l: '12%' }, { g: '☽', t: '22%', l: '78%' }, { g: '☿', t: '40%', l: '20%' },
  { g: '♀', t: '14%', l: '52%' }, { g: '♂', t: '60%', l: '70%' }, { g: '♃', t: '74%', l: '30%' },
  { g: '♄', t: '52%', l: '88%' }, { g: '🜂', t: '86%', l: '60%' }, { g: '🜄', t: '34%', l: '60%' },
  { g: '⚹', t: '68%', l: '10%' }, { g: '🜔', t: '90%', l: '24%' }, { g: '☊', t: '6%', l: '84%' },
];

// Deterministic ember field for the Pyre.
const EMBERS = Array.from({ length: 26 }, (_, i) => ({
  l: (i * 37) % 100, d: ((i * 7) % 50) / 10, s: 3 + (i % 4) * 2, dur: 3 + (i % 5) * 0.6,
}));
// Deterministic jagged waveform for Dead Channel.
const WAVE = [22, 60, 14, 80, 35, 95, 50, 70, 12, 88, 40, 66, 18, 100, 30, 75, 55, 90, 25, 62,
  44, 84, 16, 72, 38, 96, 48, 68, 20, 82, 33, 58, 28, 92, 46, 78];

export function ShockOverlay({ mode = 'none' }) {
  if (!mode || mode === 'none') return null;

  // ── INSOMNIA — the blue duotone is applied to the whole app via the .shock-duo-blue filter
  //    (App.jsx + index.css). Here we add just the halftone texture + a light sweep on top. ──
  if (mode === 'insomnia') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0 shock-halftone-drift" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.5) 0.6px, transparent 1.1px)', backgroundSize: '5px 5px', mixBlendMode: 'overlay', opacity: 0.35 }} />
        <div className="absolute -inset-1/4 shock-sheen" style={{ background: 'linear-gradient(115deg, transparent 44%, rgba(255,255,255,0.28) 50%, transparent 56%)' }} />
      </div>
    );
  }

  // ── DEAD CHANNEL — 1-bit dither + rolling scanlines + bouncing waveform ──
  if (mode === 'dead-channel') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0" style={{ backdropFilter: 'grayscale(1) contrast(1.6) brightness(0.95)', WebkitBackdropFilter: 'grayscale(1) contrast(1.6) brightness(0.95)' }} />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#fff 0.7px, transparent 1.1px)', backgroundSize: '3px 3px' }} />
        <div className="absolute inset-0 shock-scanroll opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.8) 0 1px, transparent 1px 4px)' }} />
        <div className="absolute top-10 left-0 right-0 text-center text-[#cfcfcf] text-[9px] leading-[1.7] opacity-30 shock-blink" style={{ fontFamily: '"VT323", monospace', letterSpacing: '0.3em' }}>
          QUEEN IS DEAD · QUEEN IS DEAD · QUEEN IS DEAD<br />QUEEN IS DEAD · LONG LIVE THE QUEEN
        </div>
        <div className="absolute bottom-0 inset-x-0 h-[20%] flex items-end justify-between px-1 gap-[1px]">
          {WAVE.map((h, i) => (
            <span key={i} className="flex-1 bg-[#EDEDED] shock-wave" style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.08}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── EMERGENCY — rotating orbital HUD + radar sweep + blinking readout ──
  if (mode === 'emergency') {
    return (
      <div className={`${WRAP} text-[#bcd2f0]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(2,8,18,0.5)' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[170%] h-[170%] shock-orbit" style={{ opacity: 0.6 }}>
          {[26, 44, 62, 80, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.5" />)}
          <ellipse cx="100" cy="100" rx="96" ry="42" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="42" ry="96" fill="none" stroke="currentColor" strokeWidth="0.5" />
          {[0, 30, 60, 90, 120, 150].map(a => (
            <line key={a} x1="100" y1="100" x2={100 + 96 * Math.cos(a * Math.PI / 180)} y2={100 + 96 * Math.sin(a * Math.PI / 180)} stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
          ))}
        </svg>
        {/* radar sweep */}
        <div className="absolute left-1/2 top-1/2 w-[170%] h-[170%] -translate-x-1/2 -translate-y-1/2 shock-radar" style={{ background: 'conic-gradient(from 0deg, rgba(120,200,255,0.35), transparent 25%)', borderRadius: '50%' }} />
        <pre className="absolute top-16 right-3 text-[8px] leading-[1.6] opacity-80 text-right shock-blink" style={{ fontFamily: '"VT323", monospace' }}>{`localdomain · LI
UPTIME 8h44m4s
FREQ 2.00 MHz
RAM 563MiB/1.95GiB
CPU 18% · PROC 107
>> EMERGENCY EARLY WARNING`}</pre>
        <div className="absolute inset-4 opacity-40" style={{ background:
          'linear-gradient(to right, currentColor 0 18px, transparent 18px) 0 0 / 18px 1px no-repeat,' +
          'linear-gradient(to bottom, currentColor 0 18px, transparent 18px) 0 0 / 1px 18px no-repeat,' +
          'linear-gradient(to left, currentColor 0 18px, transparent 18px) 100% 100% / 18px 1px no-repeat,' +
          'linear-gradient(to top, currentColor 0 18px, transparent 18px) 100% 100% / 1px 18px no-repeat' }} />
        <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.6) 0 1px, transparent 1px 4px)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 120px 30px rgba(0,4,20,0.85)' }} />
      </div>
    );
  }

  // ── BLOOD RITE — irregular SVG blots + drips that fall ──
  if (mode === 'spatter') {
    return (
      <div className={WRAP} aria-hidden>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 180">
          <g fill="#6e0000">
            <path d="M12 4 C 20 -2, 26 6, 22 12 C 28 14, 24 22, 16 20 C 10 26, 2 20, 6 12 C 0 10, 4 2, 12 4 Z" />
            <path d="M84 2 C 92 0, 96 8, 90 12 C 96 18, 88 24, 82 18 C 74 22, 72 12, 78 8 C 76 2, 80 2, 84 2 Z" />
            <path d="M48 0 C 54 0, 56 6, 52 9 C 57 12, 51 17, 46 13 C 41 16, 40 8, 45 6 Z" opacity="0.85" />
            <circle cx="30" cy="60" r="2.4" /><circle cx="70" cy="48" r="3" /><circle cx="92" cy="80" r="2" />
            <circle cx="8" cy="92" r="2.6" /><circle cx="58" cy="120" r="1.8" /><circle cx="22" cy="150" r="2.2" />
          </g>
        </svg>
        {[[13, 0], [23, 1.4], [49, 0.7], [85, 0.3], [91, 2.1], [62, 1.1]].map(([l, d], i) => (
          <span key={i} className="absolute top-0 w-[3px] shock-drip"
            style={{ left: `${l}%`, animationDelay: `${d}s`, height: '34%',
              background: 'linear-gradient(to bottom, #8b0000, #5b0f1a 75%, transparent)' }}>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full" style={{ background: '#8b0000' }} />
          </span>
        ))}
      </div>
    );
  }

  // ── THE SCREAM — frame-shake (App.jsx) + violent red strobe + closing vignette ──
  if (mode === 'scream') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0 shock-scream-flash" style={{ background: 'rgba(200,16,46,0.5)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-scream-vig" style={{ boxShadow: 'inset 0 0 100px 40px rgba(120,0,0,0.9)' }} />
      </div>
    );
  }

  // ── CORRUPTION — RGB split + violent shudder bands + scanline tear ──
  if (mode === 'glitch') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0 shock-rgb-r" style={{ backdropFilter: 'brightness(1.1)', background: 'rgba(255,0,40,0.18)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-rgb-c" style={{ background: 'rgba(0,255,230,0.16)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[8%] shock-glitch-bar" style={{ top: '16%', background: 'rgba(255,255,255,0.12)', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-x-0 h-[5%] shock-glitch-bar2" style={{ top: '44%', background: 'rgba(0,255,230,0.2)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[11%] shock-glitch-bar" style={{ top: '68%', background: 'rgba(200,16,46,0.28)', mixBlendMode: 'screen', animationDelay: '0.4s' }} />
        <div className="absolute inset-0 opacity-40" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── PYRE — flickering fire + dense streaming embers ──
  if (mode === 'inferno') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-x-0 bottom-0 h-3/4 shock-fire" style={{
          background: 'radial-gradient(ellipse at 50% 110%, rgba(255,140,0,0.8), rgba(255,40,0,0.55) 35%, rgba(139,0,0,0.3) 58%, transparent 78%)',
          mixBlendMode: 'screen' }} />
        {EMBERS.map((e, i) => (
          <span key={i} className="absolute bottom-0 rounded-full shock-ember"
            style={{ left: `${e.l}%`, width: e.s, height: e.s, animationDelay: `${e.d}s`, animationDuration: `${e.dur}s`,
              background: 'radial-gradient(circle, #ffdf80, #ff5a00 55%, transparent)', boxShadow: '0 0 6px #ff7a00' }} />
        ))}
      </div>
    );
  }

  // ── BLACK MASS — darkness breathing inward ──
  if (mode === 'void') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0 shock-void" style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 22%, rgba(0,0,0,0.55) 48%, rgba(0,0,0,0.86) 100%)' }} />
        <div className="absolute inset-0 animate-flicker" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(120,0,0,0.25), transparent 28%)' }} />
      </div>
    );
  }

  // ── SANCTUM — sweeping god-ray shafts ──
  if (mode === 'cathedral') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-godray" style={{
          background: 'repeating-linear-gradient(74deg, transparent 0 22px, rgba(201,169,97,0.12) 22px 28px, transparent 28px 56px)',
          mixBlendMode: 'screen' }} />
        <div className="absolute -inset-1/3 shock-godray2" style={{
          background: 'repeating-linear-gradient(106deg, transparent 0 30px, rgba(123,44,191,0.13) 30px 36px, transparent 36px 70px)',
          mixBlendMode: 'screen' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -15%, rgba(91,15,26,0.5), transparent 62%)' }} />
      </div>
    );
  }

  // ── REBIRTH — bold red corner blocks + marching chevrons + chrome ──
  if (mode === 'rebirth') {
    return (
      <div className={`${WRAP} text-[#C8102E]`} aria-hidden>
        <div className="absolute top-0 right-0 w-[30%] h-[16%]" style={{ background: 'linear-gradient(135deg, #ff0a2e, #5B0F1A)' }} />
        <div className="absolute bottom-0 left-0 w-[30%] h-[16%]" style={{ background: 'linear-gradient(135deg, #5B0F1A, #ff0a2e)' }} />
        <div className="absolute top-3 left-2 flex flex-col text-[18px] leading-[0.8] font-bold shock-chevron" style={{ fontFamily: '"Manrope", sans-serif' }}>
          {Array.from({ length: 7 }).map((_, i) => <span key={i}>❯</span>)}
        </div>
        <div className="absolute left-2 bottom-[20%] text-[9px] tracking-[0.25em] opacity-80" style={{ writingMode: 'vertical-rl', fontFamily: '"VT323", monospace' }}>MMXXVI · COVEN</div>
        {[['top-3 right-[32%]'], ['bottom-[18%] right-4'], ['top-[18%] left-[32%]'], ['bottom-3 right-[10%]']].map(([pos], i) => (
          <span key={i} className={`absolute ${pos} text-[13px] opacity-70`}>✛</span>
        ))}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(255,10,46,0.3), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(255,10,46,0.3), transparent 42%)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 border-[3px] border-[#C8102E]/40" />
      </div>
    );
  }

  // ── REQUIEM — stark 1-bit B&W (filter via .shock-duo-bw) + heavy grain + vignette ──
  if (mode === 'requiem') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.55 }} />
        <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 130px 36px rgba(0,0,0,0.85)' }} />
      </div>
    );
  }

  // ── MIST — warm sepia fog drifting (filter via .shock-duo-sepia) ──
  if (mode === 'mist') {
    return (
      <div className={WRAP} aria-hidden>
        <div className="absolute -inset-1/3 shock-fog" style={{ background: 'radial-gradient(ellipse at 30% 38%, rgba(225,205,165,0.4), transparent 55%)' }} />
        <div className="absolute -inset-1/3 shock-fog2" style={{ background: 'radial-gradient(ellipse at 72% 64%, rgba(205,180,145,0.36), transparent 55%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(150,130,95,0.35), transparent 45%), linear-gradient(to bottom, rgba(180,160,120,0.25), transparent 40%)' }} />
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.25 }} />
      </div>
    );
  }

  // ── RELIQUARY — ornate gothic cathedral arch + tracery frame (silver on black) ──
  if (mode === 'reliquary') {
    return (
      <div className={`${WRAP} text-[#d6cfc0]`} aria-hidden>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 200" style={{ opacity: 0.85 }}>
          <rect x="3" y="3" width="94" height="194" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <rect x="5.5" y="5.5" width="89" height="189" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.7" />
          {/* gothic pointed arch near the top */}
          <path d="M10 40 Q10 12 50 9 Q90 12 90 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M14 40 Q14 16 50 13 Q86 16 86 40" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.7" />
          {/* tracery cusps along the arch */}
          {[22, 34, 50, 66, 78].map((x, i) => <path key={i} d={`M${x - 4} 20 Q${x} 12 ${x + 4} 20`} fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.6" />)}
          {/* bottom pendant */}
          <path d="M50 188 l-4 -6 h8 z M50 182 v-6" fill="none" stroke="currentColor" strokeWidth="0.4" />
        </svg>
        {/* corner fleurons */}
        {['top-1.5 left-1.5', 'top-1.5 right-1.5', 'bottom-1.5 left-1.5', 'bottom-1.5 right-1.5'].map((p, i) => (
          <span key={i} className={`absolute ${p} text-base opacity-80`}>⛧</span>
        ))}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 90px 26px rgba(0,0,0,0.7)' }} />
      </div>
    );
  }

  // ── ALCHEMY — drifting astronomical rings + alchemical glyphs + kanji (dark academia) ──
  if (mode === 'alchemy') {
    return (
      <div className={`${WRAP} text-[#bcb4a2]`} aria-hidden>
        <div className="absolute inset-0" style={{ background: 'rgba(6,6,10,0.4)' }} />
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[150%] h-[150%] shock-orbit" style={{ opacity: 0.16 }}>
          {[34, 56, 78, 96].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" />)}
          <ellipse cx="100" cy="100" rx="96" ry="46" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <circle cx="100" cy="44" r="2" fill="currentColor" /><circle cx="156" cy="100" r="1.6" fill="currentColor" />
        </svg>
        {ALCHEMY_GLYPHS.map((a, i) => (
          <span key={i} className="absolute text-lg shock-twinkle" style={{ top: a.t, left: a.l, opacity: 0.4, animationDelay: `${(i % 6) * 0.5}s` }}>{a.g}</span>
        ))}
        <div className="absolute left-2 top-[18%] text-[10px] leading-[1.8] opacity-25" style={{ writingMode: 'vertical-rl', fontFamily: '"Shippori Mincho", serif' }}>生流転死再生</div>
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.3 }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 110px 28px rgba(0,2,8,0.8)' }} />
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
  { id: 'emergency', label: 'Emergency', desc: 'orbital HUD · early warning' },
  { id: 'spatter', label: 'Blood Rite', desc: 'spatter that drips' },
  { id: 'scream', label: 'The Scream', desc: 'the screen convulses' },
  { id: 'glitch', label: 'Corruption', desc: 'rgb shudder · scanlines' },
  { id: 'inferno', label: 'Pyre', desc: 'fire · rising embers' },
  { id: 'void', label: 'Black Mass', desc: 'crushed to black' },
  { id: 'cathedral', label: 'Sanctum', desc: 'god-ray light shafts' },
  { id: 'rebirth', label: 'Rebirth', desc: 'poster · red corners · chevrons' },
  { id: 'requiem', label: 'Requiem', desc: 'stark 1-bit black & white' },
  { id: 'mist', label: 'Mist', desc: 'warm sepia fog' },
  { id: 'reliquary', label: 'Reliquary', desc: 'gothic cathedral arch frame' },
  { id: 'alchemy', label: 'Alchemy', desc: 'astral rings · glyphs · kanji' },
];
