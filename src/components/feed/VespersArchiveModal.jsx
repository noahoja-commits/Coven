import { X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TEXTS } from '../../data/library';
import { todaysVespers, pastVespers } from '../../data/helpers';

export function VespersArchiveModal({ onClose, onOpenLibrary }) {
  const today = todaysVespers(TEXTS);
  const past = pastVespers(TEXTS, 14);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90vh] flex flex-col animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· archive ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>VESPERS</h3>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#A8A29E]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {today && (
            <button onClick={() => onOpenLibrary && onOpenLibrary(today.textId)}
              className="w-full text-left p-3 border border-[#C9A961]/30 bg-[#C9A961]/5 hover:border-[#C9A961] transition-colors">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] mb-1" style={F.scriptureSC}>· today · {today.dateKey} ·</div>
              <p className="text-[#F5F1E8] text-sm italic leading-snug" style={F.scripture}>"{today.verse.text}"</p>
              <div className="text-[10px] text-[#A89968]/70 mt-1" style={F.scriptureSC}>· {today.chapterTitle} ·</div>
            </button>
          )}
          {past.map(v => (
            <button key={v.dateKey} onClick={() => onOpenLibrary && onOpenLibrary(v.textId)}
              className="w-full text-left p-3 border border-[#2A2A2A] hover:border-[#A89968]/40 transition-colors">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]/70 mb-1" style={F.scriptureSC}>· {v.dateKey} ·</div>
              <p className="text-[#A8A29E] text-sm italic leading-snug line-clamp-2" style={F.scripture}>"{v.verse.text}"</p>
              <div className="text-[10px] text-[#A89968]/50 mt-1" style={F.scriptureSC}>· {v.chapterTitle} ·</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
