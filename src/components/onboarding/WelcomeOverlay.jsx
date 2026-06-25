import { Moon, Users, Feather, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { RestrictedStamp } from '../shared/Sigils';

// Shown once after a soul first enters — turns the empty-feed moment into a
// "here's what to do" welcome. Each step does the thing, then dismisses.
export function WelcomeOverlay({ handle = 'soul', onClose, onDropStatus, onFindSouls, onSpeak }) {
  const steps = [
    { icon: Moon, label: 'drop a tonight status', sub: 'let the coven know you’re out', go: onDropStatus },
    { icon: Users, label: 'find your souls', sub: 'gather the dark-clad and devout', go: onFindSouls },
    { icon: Feather, label: 'speak your first words', sub: 'say something into the night', go: onSpeak },
  ];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #2A0710 0%, #0A0408 55%, #050204 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <button onClick={onClose} className="absolute top-5 right-5 text-[#9E2A33]/60 hover:text-[#C9A961] safe-pt" aria-label="enter"><X size={22} /></button>
      <div className="relative w-full max-w-xs text-center">
        <div className="text-[#9E2A33] text-[10px] uppercase tracking-[0.5em] mb-3" style={F.scriptureSC}>· welcome, {handle} ·</div>
        <h1 className="text-[#C9A961] text-5xl mb-2" style={F.brand}>Coven</h1>
        <div className="mb-3"><RestrictedStamp /></div>
        <p className="text-[#9E2A33]/80 text-sm italic mb-8" style={F.scripture}>
          "you’ve arrived. the coven grows one soul at a time — start with a single rite."
        </p>
        <div className="space-y-2.5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={i} onClick={() => { s.go && s.go(); }}
                className="w-full flex items-center gap-3 p-3 border border-[#5B0F1A]/40 hover:border-[#8B0000] bg-[#0A0204]/50 hover:bg-[#8B0000]/10 transition-colors text-left">
                <Icon size={18} className="text-[#C9A961] shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[#F5F1E8] text-sm" style={F.ui}>{s.label}</span>
                  <span className="block text-[10px] text-[#9E2A33]/60 italic" style={F.serif}>{s.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <button onClick={onClose} className="mt-6 text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B] hover:text-[#9E2A33]" style={F.ui}>
          enter the coven →
        </button>
      </div>
    </div>
  );
}
