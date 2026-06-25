// Synthesized horror audio (no files): a jumpscare stinger, a building heartbeat/dread bed, and
// whispers. EVERYTHING is routed through a hard DynamicsCompressor limiter so peaks can never
// exceed a safe level — no matter how violent the sound, it can't damage hearing. Browsers block
// audio until a user gesture, so primeHorror() resumes the context from a tap (with a safety net).
let ctx = null, master = null, limiter = null;
let dreadTimer = null, whisperTimer = null;

function ensure() {
  if (ctx) return true;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return false;
  try {
    ctx = new AC();
    limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -8; limiter.knee.value = 2; limiter.ratio.value = 20;
    limiter.attack.value = 0.002; limiter.release.value = 0.18;
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(limiter); limiter.connect(ctx.destination);
    return true;
  } catch { return false; }
}

function resume() { if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); }

export function primeHorror() {
  if (!ensure()) return;
  resume();
  if (ctx.state === 'suspended') {
    const r = () => { resume(); window.removeEventListener('pointerdown', r); };
    window.addEventListener('pointerdown', r, { once: true });
  }
}

function noiseBuf(dur) {
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// THE SCREAM — a violent, dissonant, plunging shriek. Instant attack, fast decay.
export function stinger(intensity = 1) {
  if (!ensure()) return; resume();
  if (ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const out = ctx.createGain(); out.gain.value = 0.0001; out.connect(master);
  [196, 208, 247, 311].forEach((f) => {
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.setValueAtTime(f * 3.2, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(42, f * 0.5), t + 0.5);
    const g = ctx.createGain(); g.gain.value = 0.16;
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.62);
  });
  const n = ctx.createBufferSource(); n.buffer = noiseBuf(0.55);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.setValueAtTime(2600, t); bp.frequency.exponentialRampToValueAtTime(700, t + 0.5); bp.Q.value = 0.8;
  const ng = ctx.createGain(); ng.gain.value = 0.5;
  n.connect(bp); bp.connect(ng); ng.connect(out); n.start(t); n.stop(t + 0.55);
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(Math.min(0.95, 0.7 * intensity), t + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
}

export function whisper() {
  if (!ensure() || ctx.state !== 'running') return;
  const t = ctx.currentTime;
  const n = ctx.createBufferSource(); n.buffer = noiseBuf(0.5);
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400 + Math.random() * 1300; bp.Q.value = 4;
  const g = ctx.createGain(); g.gain.value = 0.0001;
  n.connect(bp); bp.connect(g); g.connect(master);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.12, t + 0.13);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.46);
  n.start(t); n.stop(t + 0.5);
}

function thump(time, freq, gain) {
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(freq, time); o.frequency.exponentialRampToValueAtTime(freq * 0.6, time + 0.12);
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(gain, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
  o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.24);
}

// A slow heartbeat (lub-dub) + occasional whispers, for as long as a horror mode is on.
export function startDread(bpmGap = 1500) {
  if (!ensure()) return;
  resume();
  stopDread();
  const beat = () => {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime;
    thump(t, 92, 0.42);
    thump(t + 0.26, 70, 0.3);
  };
  beat();
  dreadTimer = setInterval(beat, bpmGap);
  whisperTimer = setInterval(() => { if (Math.random() < 0.6) whisper(); }, 4500);
}

export function stopDread() {
  if (dreadTimer) { clearInterval(dreadTimer); dreadTimer = null; }
  if (whisperTimer) { clearInterval(whisperTimer); whisperTimer = null; }
}
