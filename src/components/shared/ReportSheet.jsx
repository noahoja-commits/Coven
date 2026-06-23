import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

// Reason picker shown when someone taps "report". The chosen key is stored straight
// into the existing reports.reason free-text column (no schema change). The two
// legally-sensitive keys ('illegal', 'copyright') trigger a follow-up contact note.
const REASONS = [
  { key: 'spam', label: 'Spam or scam' },
  { key: 'harassment', label: 'Harassment or threats' },
  { key: 'hate', label: 'Hate or targeted abuse' },
  { key: 'sexual', label: 'Non-consensual or explicit content' },
  { key: 'illegal', label: 'Illegal content (incl. minors)' },
  { key: 'copyright', label: 'Copyright / DMCA' },
  { key: 'other', label: 'Something else' },
];

export function ReportSheet({ onPick, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-sm sm:m-4 animate-slide-up safe-pb" onClick={e => e.stopPropagation()}>
        <div className="px-4 h-[52px] flex items-center justify-between border-b border-[#1A1A1A]">
          <div className="text-[#F5F1E8] text-sm tracking-[0.2em]" style={F.display}>REPORT</div>
          <button onClick={onClose} className="p-2 -m-1 text-[#A8A29E] hover:text-[#F5F1E8]"><X size={18} /></button>
        </div>
        <div className="py-1">
          {REASONS.map(r => (
            <button key={r.key} onClick={() => onPick(r.key)}
              className="w-full px-4 py-3 text-left text-[#E8DFD0] text-sm hover:bg-[#5B0F1A]/15 transition-colors border-b border-[#141414] last:border-b-0" style={F.serif}>
              {r.label}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 text-[10px] text-[#6B6B6B] italic" style={F.serif}>
          we review reports. illegal content and copyright claims get priority.
        </div>
      </div>
    </div>
  );
}
