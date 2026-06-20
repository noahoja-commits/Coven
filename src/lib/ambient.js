// A synthesized dark-ambient drone (no audio file). One shared AudioContext +
// node graph; start/stop fade the master gain to avoid clicks. Browsers block
// audio without a user gesture, so startAmbient() must be called from a click
// (the Sound-on toggle) — it resumes the context, with a pointerdown safety net.

let ctx = null;
let master = null;
let nodes = [];
let running = false;

function build() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;            // start silent; fade in on start
  master.connect(ctx.destination);

  // Lowpass the whole drone runs through, slowly swept by an LFO. Cutoff is kept
  // high enough that the midrange passes — otherwise it's inaudible on phone/laptop
  // speakers (which can't reproduce deep bass).
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;
  lp.Q.value = 0.6;
  lp.connect(master);

  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.06;       // very slow sweep
  lfoGain.gain.value = 400;         // +/- Hz on the cutoff
  lfo.connect(lfoGain);
  lfoGain.connect(lp.frequency);
  lfo.start();

  // Detuned oscillators = a thick drone. Pitched into an audible range (~110-330Hz)
  // with a low sub for body, so it's actually hearable on small speakers.
  const voices = [
    { freq: 55, type: 'sine', gain: 0.30 },         // sub body (felt more than heard)
    { freq: 110, type: 'sine', gain: 0.50 },        // fundamental — clearly audible
    { freq: 110 * 1.5, type: 'sine', gain: 0.34 },  // a fifth (165Hz)
    { freq: 220, type: 'triangle', gain: 0.22 },    // upper body / presence
  ];
  voices.forEach((v, i) => {
    const osc = ctx.createOscillator();
    osc.type = v.type;
    osc.frequency.value = v.freq;
    osc.detune.value = (i - 1) * 6; // slight spread for movement
    const g = ctx.createGain();
    g.gain.value = v.gain;
    osc.connect(g);
    g.connect(lp);
    osc.start();
    nodes.push(osc);
  });
  nodes.push(lfo);
  return true;
}

export function startAmbient() {
  try {
    if (!ctx && !build()) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        const resume = () => { ctx && ctx.resume().catch(() => {}); window.removeEventListener('pointerdown', resume); };
        window.addEventListener('pointerdown', resume, { once: true });
      });
    }
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0.16, now + 0.8); // audible but ambient
    running = true;
  } catch { /* audio unavailable — fail silent */ }
}

export function stopAmbient() {
  if (!ctx || !master) return;
  try {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + 0.6);
    running = false;
    // suspend shortly after the fade so it's truly silent and idle
    setTimeout(() => { if (!running && ctx && ctx.state === 'running') ctx.suspend().catch(() => {}); }, 800);
  } catch { /* noop */ }
}

export function ambientSupported() {
  return typeof window !== 'undefined' && !!(window.AudioContext || window.webkitAudioContext);
}
