import { useState, useEffect } from 'react';
import { X, Share, Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const isStandalone = () =>
  (typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true));

const isIOS = () =>
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

// Nudges the user to add Coven to their home screen so it runs as a standalone
// app (no browser chrome). Android/Chrome get a one-tap install; iOS Safari gets
// the manual Share -> Add to Home Screen hint. Self-hides once installed.
export function InstallPrompt() {
  const [dismissed, setDismissed] = useLocalStorage('installPromptDismissed', false);
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (dismissed || isStandalone()) return;
    const onBIP = (e) => { e.preventDefault(); setDeferred(e); setShow(true); };
    window.addEventListener('beforeinstallprompt', onBIP);
    // iOS never fires beforeinstallprompt — surface the manual hint after a beat.
    let t;
    if (isIOS()) t = setTimeout(() => setShow(true), 2000);
    return () => { window.removeEventListener('beforeinstallprompt', onBIP); if (t) clearTimeout(t); };
  }, [dismissed]);

  if (!show || dismissed || isStandalone()) return null;

  const ios = isIOS();
  const close = () => { setShow(false); setDismissed(true); };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    setShow(false);
    if (outcome === 'accepted') setDismissed(true);
  };

  return (
    <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[70] animate-slide-up"
      style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}>
      <div className="relative bg-[#140406] border border-[#5B0F1A] shadow-[0_8px_40px_rgba(0,0,0,0.7)] px-4 py-3.5 flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 border border-[#5B0F1A] bg-[#0A0204] flex items-center justify-center text-[#C9A961] text-xl" style={F.brand}>C</div>
        <div className="flex-1 min-w-0">
          {ios ? (
            <>
              <div className="text-[#F5F1E8] text-sm leading-tight" style={F.display}>Make Coven an app</div>
              <div className="text-[#A8A29E] text-[11px] mt-0.5 flex items-center gap-1 flex-wrap" style={F.serif}>
                tap <Share size={12} className="inline text-[#C9A961]" /> then <span className="text-[#C9A961] inline-flex items-center gap-0.5">Add to Home Screen <Plus size={11} /></span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[#F5F1E8] text-sm leading-tight" style={F.display}>Add Coven to your home screen</div>
              <div className="text-[#A8A29E] text-[11px] mt-0.5" style={F.serif}>full-screen, no browser — like a real app.</div>
            </>
          )}
        </div>
        {!ios && (
          <button onClick={install}
            className="shrink-0 text-[10px] uppercase tracking-[0.2em] px-3 py-2 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]" style={F.ui}>
            install
          </button>
        )}
        <button onClick={close} className="shrink-0 text-[#6B6B6B] hover:text-[#A8A29E] p-1 -mr-1" aria-label="dismiss"><X size={16} /></button>
      </div>
    </div>
  );
}
