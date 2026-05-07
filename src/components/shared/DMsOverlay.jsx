import { X, Search, Edit3 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CONVERSATIONS } from '../../data/posts';

export function DMsOverlay({ onClose }) {
  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-slide-in-right">
      <div className="absolute top-0 inset-x-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A8A29E] -ml-1"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>WHISPERS</div>
          <button className="text-[#A8A29E]"><Edit3 size={18} /></button>
        </div>
      </div>
      <div className="pt-[60px] pb-24">
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#1F1F1F]">
            <Search size={14} className="text-[#6B6B6B]" />
            <input placeholder="search whispers" className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]" style={F.ui} />
          </div>
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {CONVERSATIONS.map(c => (
            <button key={c.id} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
              <div className="relative w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg shrink-0">
                {c.avatar}
                {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#8B0000] text-[#F5F1E8] text-[9px] flex items-center justify-center" style={F.mono}>{c.unread}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <span className={`text-sm truncate ${c.unread > 0 ? 'text-[#F5F1E8]' : 'text-[#A8A29E]'}`} style={F.ui}>{c.user}</span>
                  <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{c.time}</span>
                </div>
                <p className={`text-xs truncate ${c.unread > 0 ? 'text-[#A8A29E]' : 'text-[#6B6B6B]'}`} style={F.serif}>{c.last}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
