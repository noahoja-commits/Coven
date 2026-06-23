// Selectable full-screen "shock" visual modes — distinct aesthetics layered over the app.
// One mode at a time (settings.shockMode). Every layer is absolute inset-0 pointer-events-none and
// sits at z-10 (behind content, like the other washes) so the app stays fully usable underneath.
// Motion is guarded by prefers-reduced-motion in index.css. The 'scream' frame-shake itself is a
// class on the phone-frame (App.jsx); here we render the colour/light/texture layers per mode.

// Deterministic ember field for the Pyre — fixed so it doesn't re-randomise each render.
const EMBERS = [
  { l: '12%', d: '0s', s: 5, dur: '4.2s' }, { l: '26%', d: '1.1s', s: 3, dur: '5.1s' },
  { l: '38%', d: '2.3s', s: 6, dur: '3.8s' }, { l: '51%', d: '0.6s', s: 4, dur: '4.8s' },
  { l: '63%', d: '1.8s', s: 5, dur: '4.0s' }, { l: '74%', d: '3.0s', s: 3, dur: '5.4s' },
  { l: '85%', d: '0.3s', s: 6, dur: '3.6s' }, { l: '45%', d: '2.7s', s: 4, dur: '4.6s' },
  { l: '19%', d: '3.4s', s: 4, dur: '5.0s' }, { l: '69%', d: '1.4s', s: 5, dur: '4.4s' },
];
// Deterministic jagged waveform heights for Dead Channel (QUEEN IS DEAD).
const WAVE = [22, 60, 14, 80, 35, 95, 50, 70, 12, 88, 40, 66, 18, 100, 30, 75, 55, 90, 25, 62,
  44, 84, 16, 72, 38, 96, 48, 68, 20, 82, 33, 58, 28, 92, 46, 78, 24, 64, 52, 86, 15, 70];

const HALFTONE = 'radial-gradient(currentColor 0.7px, transparent 1.1px)';

export function ShockOverlay({ mode = 'none' }) {
  if (!mode || mode === 'none') return null;

  // ── INSOMNIA — electric-blue duotone + halftone + distress ──
  if (mode === 'insomnia') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        {/* drench in electric blue */}
        <div className="absolute inset-0" style={{ background: 'rgba(20,40,255,0.32)', mixBlendMode: 'overlay' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 18%, rgba(40,80,255,0.5), rgba(10,20,120,0.35) 45%, transparent 72%)', mixBlendMode: 'screen' }} />
        {/* halftone dots in blue */}
        <div className="absolute inset-0 text-[#2748ff] opacity-40" style={{ backgroundImage: HALFTONE, backgroundSize: '4px 4px', mixBlendMode: 'screen' }} />
        {/* distress scratches */}
        <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(96deg, transparent 0 40px, rgba(120,160,255,0.4) 40px 41px, transparent 41px 90px)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 120px 30px rgba(0,8,60,0.7)' }} />
      </div>
    );
  }

  // ── DEAD CHANNEL — 1-bit dither + scanlines + waveform (QUEEN IS DEAD) ──
  if (mode === 'dead-channel') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        {/* desaturate everything underneath */}
        <div className="absolute inset-0" style={{ backdropFilter: 'grayscale(1) contrast(1.3)', WebkitBackdropFilter: 'grayscale(1) contrast(1.3)' }} />
        {/* dither dot screen */}
        <div className="absolute inset-0 text-white opacity-25" style={{ backgroundImage: HALFTONE, backgroundSize: '3px 3px' }} />
        {/* dense scanlines */}
        <div className="absolute inset-0 opacity-40" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.7) 0 1px, transparent 1px 2.5px)' }} />
        {/* jagged waveform along the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-[16%] flex items-end justify-between px-1 gap-[1px] opacity-70">
          {WAVE.map((h, i) => <span key={i} className="flex-1 bg-[#E8E8E8]" style={{ height: `${h}%` }} />)}
        </div>
      </div>
    );
  }

  // ── EMERGENCY — orbital blueprint HUD + terminal readout (W.H. BEEHLER) ──
  if (mode === 'emergency') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden text-[#9fb4d4]" aria-hidden>
        {/* slowly rotating orbital rings */}
        <svg viewBox="0 0 200 200" className="absolute left-1/2 top-1/2 w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2 shock-orbit" style={{ opacity: 0.22 }}>
          {[30, 48, 66, 84].map(r => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" />)}
          <ellipse cx="100" cy="100" rx="84" ry="40" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <ellipse cx="100" cy="100" rx="40" ry="84" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeWidth="0.3" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeWidth="0.3" />
        </svg>
        {/* crosshair + corner ticks */}
        <div className="absolute inset-3 opacity-25" style={{ background:
          'linear-gradient(to right, currentColor 0 14px, transparent 14px) 0 0 / 14px 1px no-repeat,' +
          'linear-gradient(to bottom, currentColor 0 14px, transparent 14px) 0 0 / 1px 14px no-repeat' }} />
        {/* terminal readout, top-right */}
        <pre className="absolute top-14 right-3 text-[7px] leading-[1.5] opacity-50 text-right" style={{ fontFamily: '"VT323", monospace' }}>{`localdomain · LI
UPTIME 8h44m4s
FREQ 2.00 MHz
RAM 563MiB/1.95GiB
CPU 18% · PROC 107
EMERGENCY · EARLY WARNING`}</pre>
        {/* scanline + dark frame */}
        <div className="absolute inset-0 opacity-25" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 4px)' }} />
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 100px 20px rgba(0,4,20,0.7)' }} />
      </div>
    );
  }

  // ── BLOOD RITE — oxblood spatter that drips ──
  if (mode === 'spatter') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0" style={{
          background:
            'radial-gradient(circle at 14% 6%, rgba(120,0,0,0.85) 0 3%, transparent 7%),' +
            'radial-gradient(circle at 22% 10%, rgba(91,15,26,0.7) 0 1.4%, transparent 4%),' +
            'radial-gradient(circle at 84% 4%, rgba(120,0,0,0.8) 0 2.6%, transparent 7%),' +
            'radial-gradient(circle at 92% 12%, rgba(91,15,26,0.6) 0 1.2%, transparent 4%),' +
            'radial-gradient(circle at 50% 2%, rgba(139,0,0,0.6) 0 2%, transparent 6%),' +
            'radial-gradient(circle at 6% 40%, rgba(91,15,26,0.5) 0 1.4%, transparent 5%),' +
            'radial-gradient(circle at 96% 52%, rgba(120,0,0,0.5) 0 1.6%, transparent 5%)',
        }} />
        {[['13%', '0s'], ['23%', '1.6s'], ['50%', '0.8s'], ['84%', '0.4s'], ['92%', '2.2s']].map(([l, d], i) => (
          <span key={i} className="absolute top-0 w-[2px] shock-drip"
            style={{ left: l, animationDelay: d, height: '22%',
              background: 'linear-gradient(to bottom, rgba(120,0,0,0.9), rgba(91,15,26,0.2) 80%, transparent)' }} />
        ))}
      </div>
    );
  }

  // ── THE SCREAM — crimson flash synced with the phone-frame shake (App.jsx) ──
  if (mode === 'scream') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 shock-scream-flash" aria-hidden
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(200,16,46,0.55) 100%)', mixBlendMode: 'screen' }} />
    );
  }

  // ── CORRUPTION — RGB-split shudder bands + scanlines ──
  if (mode === 'glitch') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-x-0 h-[7%] shock-glitch-bar" style={{ top: '18%', background: 'rgba(200,16,46,0.22)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[4%] shock-glitch-bar2" style={{ top: '46%', background: 'rgba(0,200,200,0.16)', mixBlendMode: 'screen' }} />
        <div className="absolute inset-x-0 h-[9%] shock-glitch-bar" style={{ top: '70%', background: 'rgba(123,44,191,0.2)', mixBlendMode: 'screen', animationDelay: '0.5s' }} />
        <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)' }} />
      </div>
    );
  }

  // ── PYRE — fire glow from below + rising embers ──
  if (mode === 'inferno') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 animate-flicker" style={{
          background: 'radial-gradient(ellipse at 50% 118%, rgba(255,90,0,0.55), rgba(200,16,46,0.4) 35%, rgba(91,15,26,0.2) 55%, transparent 72%)',
          mixBlendMode: 'screen' }} />
        {EMBERS.map((e, i) => (
          <span key={i} className="absolute bottom-0 rounded-full shock-ember"
            style={{ left: e.l, width: e.s, height: e.s, animationDelay: e.d, animationDuration: e.dur,
              background: 'radial-gradient(circle, #ffcc66, #ff5a00 60%, transparent)' }} />
        ))}
      </div>
    );
  }

  // ── BLACK MASS — crush to near-black ──
  if (mode === 'void') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10" aria-hidden
        style={{ background: 'radial-gradient(ellipse at 50% 45%, transparent 6%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.82) 100%)' }}>
        <div className="absolute inset-0 animate-flicker" style={{ background: 'radial-gradient(ellipse at 50% 45%, rgba(91,15,26,0.18), transparent 30%)' }} />
      </div>
    );
  }

  // ── SANCTUM — gothic god-ray light shafts ──
  if (mode === 'cathedral') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 shock-godray" style={{
          background: 'repeating-linear-gradient(72deg, transparent 0 26px, rgba(201,169,97,0.05) 26px 30px, transparent 30px 60px)',
          mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 shock-godray2" style={{
          background: 'repeating-linear-gradient(108deg, transparent 0 34px, rgba(123,44,191,0.06) 34px 38px, transparent 38px 72px)',
          mixBlendMode: 'screen' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(91,15,26,0.35), transparent 60%)' }} />
      </div>
    );
  }

  // ── REBIRTH — editorial poster frame: red corner blocks + chevrons + registration chrome ──
  if (mode === 'rebirth') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden text-[#C8102E]" aria-hidden>
        {/* red color-block corners (REBIRTH) */}
        <div className="absolute top-0 right-0 w-[22%] h-[12%]" style={{ background: 'linear-gradient(135deg, #C8102E, #5B0F1A)' }} />
        <div className="absolute bottom-0 left-0 w-[22%] h-[12%]" style={{ background: 'linear-gradient(135deg, #5B0F1A, #C8102E)' }} />
        {/* chevron stack, top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 text-[13px] leading-none opacity-90" style={{ fontFamily: '"Manrope", sans-serif' }}>
          {Array.from({ length: 6 }).map((_, i) => <span key={i}>❯</span>)}
        </div>
        {/* vertical date, left edge */}
        <div className="absolute left-2 bottom-[16%] text-[8px] tracking-[0.2em] opacity-70" style={{ writingMode: 'vertical-rl', fontFamily: '"VT323", monospace' }}>MMXXVI · COVEN</div>
        {/* registration crosses */}
        {[['top-2 right-[24%]'], ['bottom-[14%] right-3'], ['top-[14%] left-[24%]']].map(([pos], i) => (
          <span key={i} className={`absolute ${pos} text-[10px] opacity-60`}>✛</span>
        ))}
        {/* faint red wash from the corners */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(200,16,46,0.18), transparent 45%), radial-gradient(ellipse at 0% 100%, rgba(200,16,46,0.18), transparent 45%)', mixBlendMode: 'screen' }} />
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
];
