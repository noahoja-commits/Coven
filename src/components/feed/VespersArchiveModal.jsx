import { X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TEXTS } from '../../data/library';
import { todaysVespers, pastVespers } from '../../data/helpers';

export function VespersArchiveModal({ onClose }) {
  const today = todaysVespers(TEXTS);
  const past = pastVespers(TEXTS, 14);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] flex flex-col animate-slide-up safe-pb" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33]" style={F.scriptureSC}>· archive ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>VESPERS</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {today && (
            <div className="w-full text-left p-3 border border-[#C9A961]/30 bg-[#C9A961]/5">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] mb-1" style={F.scriptureSC}>· today · {today.dateKey} ·</div>
              <p className="text-[#F5F1E8] text-sm italic leading-snug" style={F.scripture}>"{today.verse.text}"</p>
              <div className="text-[10px] text-[#9E2A33]/70 mt-1" style={F.scriptureSC}>· {today.chapterTitle} ·</div>
            </div>
          )}
          {past.map(v => (
            <div key={v.dateKey} className="w-full text-left p-3 border border-[#2A2A2A]">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]/70 mb-1" style={F.scriptureSC}>· {v.dateKey} ·</div>
              <p className="text-[#A8A29E] text-sm italic leading-snug line-clamp-2" style={F.scripture}>"{v.verse.text}"</p>
              <div className="text-[10px] text-[#9E2A33]/50 mt-1" style={F.scriptureSC}>· {v.chapterTitle} ·</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
