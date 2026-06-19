import { useEffect } from 'react';
import { F } from '../../styles/fonts';

// Transient in-app message. Driven by a `toast` object ({ key, text, kind }) held
// in App state; renders nothing when null. Replaces blunt window.alert popups.
export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const ms = toast.ms || (toast.kind === 'error' ? 4200 : 2600);
    const t = setTimeout(onDone, ms);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  const bad = toast.kind === 'error';
  return (
    <div
      className="fixed left-0 right-0 z-[100] flex justify-center px-5 pointer-events-none"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)' }}
    >
      <div
        key={toast.key}
        onClick={onDone}
        className="pointer-events-auto max-w-sm w-full text-center px-4 py-3 rounded-lg border backdrop-blur-md animate-slide-up"
        style={{
          background: bad ? 'rgba(38,10,12,0.96)' : 'rgba(18,18,18,0.96)',
          borderColor: bad ? 'rgba(139,0,0,0.55)' : 'rgba(201,169,97,0.35)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        }}
      >
        <span className="text-[#F5F1E8] text-[13px] leading-snug" style={F.serif}>{toast.text}</span>
      </div>
    </div>
  );
}
