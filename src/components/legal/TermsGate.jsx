import { useState, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
const LegalScreen = lazy(() => import('./LegalScreen').then(m => ({ default: m.LegalScreen })));
import { TERMS_EFFECTIVE_LABEL } from '../../lib/legal';

// Re-acceptance gate — shown when the signed-in profile's recorded tos_version
// doesn't match the current TERMS_VERSION (existing users after the migration,
// and everyone again on future version bumps). Blocks the app until the user
// agrees; onAgree persists the version + timestamp and refreshes the profile.
// Renders LegalScreen internally so the docs are readable before agreeing.
export function TermsGate({ onAgree }) {
  const [legal, setLegal] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const agree = async () => {
    if (working) return;
    setWorking(true); setError('');
    try {
      await onAgree();
      // success → profile refresh unmounts the gate.
    } catch {
      setWorking(false);
      setError("couldn't record your agreement — try again.");
    }
  };

  return (
    <div className="absolute inset-0 z-[70] flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #1A0508 0%, #0A0408 55%, #050204 100%)' }}>
      <div className="w-full max-w-xs text-center">
        <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.5em] mb-3" style={F.scriptureSC}>· the pact ·</div>
        <div className="text-[#C9A961] text-3xl mb-4" style={F.brand}>Coven</div>
        <p className="text-[#A8A29E] text-sm leading-relaxed mb-2" style={F.serif}>
          our Terms of Service and Privacy Policy are effective {TERMS_EFFECTIVE_LABEL}.
          to keep using Coven, read them and agree below.
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <button type="button" onClick={() => setLegal('terms')}
            className="text-[#9E2A33] underline text-xs" style={F.ui}>Terms</button>
          <button type="button" onClick={() => setLegal('privacy')}
            className="text-[#9E2A33] underline text-xs" style={F.ui}>Privacy Policy</button>
        </div>

        {error && <p className="text-[#8B0000] text-[11px] mb-3" style={F.ui}>{error}</p>}

        <button onClick={agree} disabled={working}
          className="w-full py-3 bg-[#8B0000] hover:bg-[#5B0F1A] disabled:opacity-40 text-[#F5F1E8] text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2"
          style={F.ui}>
          {working ? <><Loader2 size={14} className="animate-spin" /> recording</> : 'i agree'}
        </button>

        <p className="mt-5 text-[10px] text-[#6B6B6B] italic" style={F.serif}>
          your agreement is recorded with today's date, once.
        </p>
      </div>
      {legal && <Suspense fallback={null}><LegalScreen initialDoc={legal} onBack={() => setLegal(null)} /></Suspense>}
    </div>
  );
}
