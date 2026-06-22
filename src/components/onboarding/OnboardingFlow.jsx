import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { checkHandleAvailable } from '../../lib/db/profiles';

const GLYPHS = ['🦇', '✟', '☠', '🌹', '🩸', '⚰', '✶', '⛧', '☩', '⚱', '✦', '⌬', '☾', '✽', '⚜'];
const SCENES = [
  { id: 'goth', label: 'Goth & Alt' },
  { id: 'music', label: 'Music & Bands' },
  { id: 'partying', label: 'Nightlife' },
  { id: 'fashion', label: 'Fashion & Fits' },
  { id: 'drinking', label: 'Drinking' },
  { id: 'smoking', label: 'Smoking' },
  { id: 'gambling', label: 'Gambling' },
];
const VIBES = ['romantic', 'darkwave', 'industrial', 'punk', 'witchy', 'religious', 'melancholic', 'theatrical', 'minimal', 'occult', 'queer', 'femme', 'masc', 'androgynous'];

export function OnboardingFlow({ onComplete, onSignOut }) {
  const [step, setStep] = useState(0);
  const [handle, setHandle] = useState('');
  const [glyph, setGlyph] = useState('🦇');
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [scenes, setScenes] = useState([]);
  const [vibes, setVibes] = useState([]);
  const [adult, setAdult] = useState(false); // 18+ self-attestation, gates entry
  const [handleStatus, setHandleStatus] = useState('idle'); // idle|checking|free|taken
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const checkSeq = useRef(0);
  const totalSteps = 5;

  // Debounced live handle-availability check.
  useEffect(() => {
    const h = handle.trim().toLowerCase();
    if (h.length < 2) { setHandleStatus('idle'); return; }
    setHandleStatus('checking');
    const seq = ++checkSeq.current;
    const t = setTimeout(async () => {
      try {
        const free = await checkHandleAvailable(h);
        if (seq === checkSeq.current) setHandleStatus(free ? 'free' : 'taken');
      } catch {
        if (seq === checkSeq.current) setHandleStatus('idle');
      }
    }, 400);
    return () => clearTimeout(t);
  }, [handle]);

  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  // Only the handle is required to get in; everything else is optional and editable
  // later. (We allow advancing while the availability check is still in flight —
  // finish() catches a taken handle and bounces back, so a slow check can't wall you.)
  const canAdvance = () => {
    if (step === 0) return adult; // must confirm 18+ before entering
    if (step === 1) return handle.trim().length >= 2 && handleStatus !== 'taken';
    return true;
  };

  // If a birthday is given, enforce 18+ from it (self-attested checkbox is the floor).
  const isUnder18 = (iso) => {
    if (!iso) return false;
    const b = new Date(iso); if (isNaN(b)) return false;
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age < 18;
  };

  const finish = async () => {
    if (submitting) return;
    if (isUnder18(birthday)) { setError('you must be 18 or older to enter the Coven'); setStep(3); return; }
    setSubmitting(true); setError('');
    try {
      await onComplete({ handle: handle.trim().toLowerCase().replace(/\s/g, '_'), glyph, city: city.trim(), birthday, scenes, vibes });
    } catch (e) {
      setError(e?.message === 'handle taken' ? 'that handle was just taken — pick another' : (e?.message || 'something went wrong'));
      setHandleStatus('taken');
      setSubmitting(false);
      setStep(1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col">
      {/* Atmospheric background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #2A0710 0%, #0A0408 50%, #050204 100%)'
      }} />
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      {/* Progress dots */}
      <div className="relative pt-12 px-6 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <span key={i} className={`h-[2px] transition-all duration-500 ${i === step ? 'w-8 bg-[#8B0000]' : i < step ? 'w-4 bg-[#5B0F1A]' : 'w-4 bg-[#2A2A2A]'}`} />
        ))}
      </div>

      {error && <div className="relative px-6 mt-3 text-center text-[11px] text-[#8B0000]" style={F.ui}>{error}</div>}

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pt-8 pb-8">
        {step === 0 && (
          <div className="flex flex-col items-center text-center max-w-xs mx-auto pt-12 animate-fade-in">
            <div className="text-[#A89968] text-[10px] uppercase tracking-[0.5em] mb-4" style={F.scriptureSC}>· welcome to ·</div>
            <h1 className="text-[#C9A961] text-7xl mb-6" style={F.brand}>Coven</h1>
            <p className="text-[#F5F1E8] text-2xl leading-snug mb-3" style={F.scripture}>You have found the Coven.</p>
            <p className="text-[#A89968]/80 text-sm italic" style={F.scripture}>"a quiet place for the dark-clad, the dramatic, the devout, and the wandering. proceed when ready."</p>
            <div className="mt-8 text-[#6B6B6B] text-[10px] uppercase tracking-[0.3em]" style={F.ui}>goth & alt only · 18+</div>
            <button onClick={() => setAdult(a => !a)}
              className="mt-6 flex items-center gap-3 text-left max-w-[16rem] group">
              <span className={`shrink-0 w-5 h-5 border flex items-center justify-center transition-all ${adult ? 'border-[#8B0000] bg-[#5B0F1A]/30 text-[#C9A961]' : 'border-[#2A2A2A] text-transparent'}`}>✓</span>
              <span className="text-[#A89968]/80 text-xs leading-snug" style={F.serif}>I confirm I am 18 years of age or older.</span>
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="max-w-xs mx-auto pt-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· chapter the first ·</div>
              <h2 className="text-[#F5F1E8] text-3xl" style={F.scripture}>What shall we call you?</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1.5 block" style={F.scriptureSC}>· handle ·</label>
                <div className="flex items-center bg-[#0F0F0F] border border-[#2A2A2A] focus-within:border-[#5B0F1A]">
                  <span className="pl-3 text-[#6B6B6B]" style={F.mono}>@</span>
                  <input value={handle} onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 20))}
                    placeholder="spectre.eve"
                    className="flex-1 bg-transparent outline-none p-3 text-[#F5F1E8]"
                    style={F.mono} />
                </div>
                {handleStatus === 'checking' && <p className="text-[10px] text-[#6B6B6B] mt-1.5" style={F.ui}>checking…</p>}
                {handleStatus === 'free' && <p className="text-[10px] text-[#C9A961] mt-1.5" style={F.ui}>@{handle} is yours</p>}
                {handleStatus === 'taken' && <p className="text-[10px] text-[#8B0000] mt-1.5" style={F.ui}>@{handle} is already taken</p>}
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2 block" style={F.scriptureSC}>· your sigil ·</label>
                <div className="grid grid-cols-5 gap-2">
                  {GLYPHS.map(g => (
                    <button key={g} onClick={() => setGlyph(g)}
                      className={`aspect-square text-2xl border transition-all ${glyph === g ? 'border-[#8B0000] bg-[#5B0F1A]/20' : 'border-[#2A2A2A]'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-sm mx-auto pt-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· chapter the second ·</div>
              <h2 className="text-[#F5F1E8] text-3xl mb-2" style={F.scripture}>Find your scenes.</h2>
              <p className="text-[#A89968]/70 text-sm italic" style={F.scripture}>"pick all that pull at you. you can change later."</p>
            </div>
            <div className="space-y-2">
              {SCENES.map(s => {
                const active = scenes.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggle(scenes, setScenes, s.id)}
                    className={`w-full text-left p-3 border transition-all ${active ? 'border-[#8B0000] bg-[#5B0F1A]/20' : 'border-[#2A2A2A]'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-base ${active ? 'text-[#F5F1E8]' : 'text-[#A8A29E]'}`} style={F.serif}>{s.label}</span>
                      {active && <span className="text-[#C9A961] text-sm">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xs mx-auto pt-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· chapter the third ·</div>
              <h2 className="text-[#F5F1E8] text-3xl mb-2" style={F.scripture}>Where & when.</h2>
              <p className="text-[#A89968]/70 text-sm italic" style={F.scripture}>"so we know when the moon is full above you."</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1.5 block" style={F.scriptureSC}>· your city ·</label>
                <input value={city} onChange={e => setCity(e.target.value.slice(0, 40))}
                  placeholder="brooklyn, NY"
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8]"
                  style={F.serif} />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-1.5 block" style={F.scriptureSC}>· your birthday ·</label>
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
                  className="w-full bg-[#0F0F0F] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8]"
                  style={F.serif} />
                <p className="text-[10px] text-[#6B6B6B] mt-1.5 italic" style={F.serif}>for ephemeris readings & memento mori. always private.</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-sm mx-auto pt-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em] mb-2" style={F.scriptureSC}>· chapter the fourth ·</div>
              <h2 className="text-[#F5F1E8] text-3xl mb-2" style={F.scripture}>Your vibe.</h2>
              <p className="text-[#A89968]/70 text-sm italic" style={F.scripture}>"optional. tap any that resonate."</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {VIBES.map(v => {
                const active = vibes.includes(v);
                return (
                  <button key={v} onClick={() => toggle(vibes, setVibes, v)}
                    className={`px-3 py-2 border text-sm transition-all ${active ? 'border-[#8B0000] bg-[#5B0F1A]/30 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
                    style={F.serif}>{v}</button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Escape hatch — so a soul whose profile-create keeps failing is never trapped in
          onboarding (session exists but no profile → this screen would otherwise re-show forever). */}
      {onSignOut && (
        <div className="relative z-20 text-center pb-1">
          <button onClick={() => onSignOut()}
            className={`text-[10px] uppercase tracking-[0.2em] transition-colors ${error ? 'text-[#8B0000] hover:text-[#C9A961]' : 'text-[#5B5B5B] hover:text-[#A89968]'}`}
            style={F.ui}>
            {error ? 'still stuck? · sign out & start over' : 'not you? · leave'}
          </button>
        </div>
      )}

      {/* Footer nav — a real flex child (NOT absolute) so the scroll area can never overlay/block the buttons */}
      <div className="relative z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] p-4 safe-pb flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="text-[#A89968] flex items-center gap-1 text-sm" style={F.ui}>
            <ChevronLeft size={16} /> back
          </button>
        ) : <span />}
        {step < totalSteps - 1 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canAdvance()}
            className="ml-auto px-5 py-2.5 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.2em] disabled:opacity-40 flex items-center gap-1.5"
            style={F.ui}>
            {step === 0 ? 'enter' : 'continue'} <ChevronRight size={14} />
          </button>
        ) : (
          <button onClick={finish} disabled={submitting}
            className="ml-auto px-5 py-2.5 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.2em] disabled:opacity-40 flex items-center gap-2"
            style={F.ui}>{submitting ? <><Loader2 size={14} className="animate-spin" /> entering</> : 'begin'}</button>
        )}
      </div>
    </div>
  );
}
