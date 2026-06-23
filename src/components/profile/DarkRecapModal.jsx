import { X, Share2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { shareCoven } from '../../lib/share';

// A Wrapped-style recap card built from numbers the profile already shows (no
// invented metrics). Shareable via the native sheet / clipboard.
export function DarkRecapModal({ stats, onClose }) {
  const rows = [
    { n: stats.posts, label: 'spoken into the dark' },
    { n: stats.streak, label: 'nights of the rite' },
    { n: stats.sigils, label: 'sigils sealed' },
    { n: `${stats.achievementsEarned}/${stats.achievementsTotal}`, label: 'marks earned' },
  ];
  const text = `my coven so far — ${stats.posts} posts · ${stats.streak}-night rite · ${stats.sigils} sigils · ${stats.achievementsEarned}/${stats.achievementsTotal} marks${stats.topScene ? ` · ${stats.topScene}` : ''}`;

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-xs border border-[#5B0F1A]/40 p-6 animate-slide-up overflow-hidden"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #2A0710 0%, #0A0408 60%, #050204 100%)' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-[#C8102E]/60 hover:text-[#C9A961]" aria-label="close"><X size={18} /></button>
        <div className="text-center mb-5">
          <div className="text-[#C8102E] text-[10px] uppercase tracking-[0.5em] mb-1" style={F.scriptureSC}>· your dark recap ·</div>
          <div className="text-[#C9A961] text-3xl" style={F.brand}>Coven</div>
        </div>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="flex items-baseline justify-between border-b border-[#5B0F1A]/20 pb-2">
              <span className="text-[#F5F1E8] text-2xl" style={F.mono}>{r.n}</span>
              <span className="text-[#A8A29E] text-[11px] uppercase tracking-[0.2em]" style={F.ui}>{r.label}</span>
            </div>
          ))}
          {stats.topScene && (
            <div className="text-center pt-1 text-[#C8102E] text-xs italic" style={F.scripture}>most at home in · {stats.topScene} ·</div>
          )}
        </div>
        <button onClick={() => shareCoven({ title: 'my coven recap', text, path: '' })}
          className="w-full mt-6 py-2.5 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2" style={F.ui}>
          <Share2 size={13} /> share the dark
        </button>
      </div>
    </div>
  );
}
