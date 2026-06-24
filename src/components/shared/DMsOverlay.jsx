import { useState, useRef } from 'react';
import { X, Search, Edit3, Archive } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from './EmptyState';
import { ClawMark } from './Sigils';

export function DMsOverlay({ conversations = [], onClose, onOpenConversation, onNewGroup, onBury }) {
  const [query, setQuery] = useState('');
  const [showBuried, setShowBuried] = useState(false);
  const searchRef = useRef(null);

  const filtered = conversations.filter(c => {
    if (!!c.buried !== showBuried) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.user.toLowerCase().includes(q) || c.last.toLowerCase().includes(q);
  });

  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-slide-in-right">
      <div className="absolute top-0 inset-x-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>WHISPERS</div>
          <button
            onClick={onNewGroup}
            className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"
            title="new whisper circle"
            aria-label="new whisper"
          >
            <Edit3 size={20} />
          </button>
        </div>
      </div>
      <div className="pt-[60px] pb-24">
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#2A2A2A]">
            <Search size={14} className="text-[#6B6B6B]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search whispers"
              className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]"
              style={F.ui}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="tap text-[#6B6B6B] hover:text-[#C9A961]"
                aria-label="clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => setShowBuried(false)}
              className={`tap px-3 py-1 text-[10px] uppercase tracking-wider border ${!showBuried ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:text-[#C9A961]'}`}
              style={!showBuried ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}>inbox</button>
            <button onClick={() => setShowBuried(true)}
              className={`tap px-3 py-1 text-[10px] uppercase tracking-wider border flex items-center gap-1 ${showBuried ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:text-[#C9A961]'}`}
              style={showBuried ? { ...F.ui, boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : F.ui}><Archive size={10} /> buried</button>
          </div>
        </div>
        <div className="divide-y divide-[#1A1A1A]">
          {filtered.length === 0 && (
            <EmptyState glyph={ClawMark} text={showBuried ? '· nothing buried ·' : '· no whispers ·'} />
          )}
          {filtered.map(c => (
            // Archive lives in its own column (a sibling of the open-conversation button)
            // so it can never overlap the timestamp, and stays visible/tappable on touch.
            <div key={c.id} className="group flex items-stretch hover:bg-[#0F0F0F]">
              <button
                onClick={() => onOpenConversation?.(c.id)}
                className="flex-1 min-w-0 pl-4 py-3 flex items-center gap-3 text-left"
              >
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg shrink-0">
                  {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" /> : c.avatar}
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
              <button onClick={(e) => { e.stopPropagation(); onBury && onBury(c.id); }}
                className="tap shrink-0 px-4 flex items-center text-[#5B5B5B] hover:text-[#C8102E] opacity-70 group-hover:opacity-100 transition-opacity"
                title={showBuried ? 'restore' : 'bury'} aria-label={showBuried ? 'restore' : 'bury'}>
                <Archive size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
