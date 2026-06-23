import { useState } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { meetsAge } from '../../data/helpers';

// A door for the age-restricted parts of the Coven. Neutral date-of-birth entry —
// blocks anyone under `minAge`, passes the entered DOB up so the caller can remember
// it. Self-attestation by DOB (the reasonable-measures standard for this content);
// no third party, no stored ID.
export function AgeGate({ minAge = 18, label = 'this part of the coven', onPass, onClose }) {
  const [dob, setDob] = useState('');
  const [denied, setDenied] = useState(false);

  const submit = () => {
    if (!dob) return;
    if (meetsAge(dob, minAge)) { setDenied(false); onPass && onPass(dob); }
    else setDenied(true);
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A0710 0%, #0A0408 55%, #050204 100%)' }}>
      {onClose && (
        <button onClick={onClose} className="absolute top-5 right-5 text-[#A89968]/60 hover:text-[#C9A961] safe-pt" aria-label="back"><X size={22} /></button>
      )}
      <div className="relative w-full max-w-xs text-center">
        <div className="text-[#A89968] text-[10px] uppercase tracking-[0.5em] mb-3" style={F.scriptureSC}>· the door asks ·</div>
        <div className="text-[#C9A961] text-5xl mb-3" style={F.brand}>{minAge}+</div>
        <p className="text-[#A89968]/80 text-sm italic mb-6" style={F.scripture}>
          {label} is for those {minAge} and older. enter your date of birth to pass.
        </p>

        <label className="block text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70 mb-2" style={F.scriptureSC}>· date of birth ·</label>
        <input type="date" value={dob} max="9999-12-31"
          onChange={(e) => { setDob(e.target.value); setDenied(false); }}
          className="w-full bg-[#0A0204] border border-[#5B0F1A]/40 focus:border-[#8B0000] outline-none p-3 text-[#F5F1E8] text-center"
          style={F.serif} />

        {denied && (
          <p className="text-[#8B0000] text-xs mt-3" style={F.ui}>you must be {minAge} or older to enter.</p>
        )}

        <button onClick={submit} disabled={!dob}
          className="mt-6 w-full py-3 bg-[#8B0000] hover:bg-[#5B0F1A] disabled:opacity-40 text-[#F5F1E8] text-xs uppercase tracking-[0.25em]"
          style={F.ui}>enter</button>

        <p className="mt-5 text-[10px] text-[#6B6B6B] italic" style={F.serif}>
          your birthday stays private — it only unlocks this door.
        </p>
      </div>
    </div>
  );
}
