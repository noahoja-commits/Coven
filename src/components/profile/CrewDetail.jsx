import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Users } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CREWS } from '../../data/crews';

export function CrewDetail({ crewId, messages = [], onSend, onBack }) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);
  const crew = CREWS.find(c => c.id === crewId);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  if (!crew) return null;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    onSend && onSend(body);
    setDraft('');
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onBack} className="text-[#A8A29E] -ml-1"><ArrowLeft size={20} /></button>
          <div className="w-9 h-9 border border-[#2A2A2A] flex items-center justify-center text-[#A89968] text-lg shrink-0">{crew.glyph}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm truncate" style={F.display}>{crew.name}</div>
            <div className="text-[10px] text-[#6B6B6B] flex items-center gap-1" style={F.mono}>
              <Users size={9} /> {crew.members}/{crew.maxMembers}
            </div>
          </div>
        </div>
      </div>

      {/* About strip */}
      <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#0F0F0F]">
        <p className="text-[#A8A29E] text-xs italic leading-snug" style={F.serif}>{crew.description}</p>
        {crew.nextEvent && (
          <div className="mt-2 text-[10px] text-[#5B0F1A] uppercase tracking-wider" style={F.ui}>· next: {crew.nextEvent} ·</div>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          {crew.memberAvatars.map((a, i) => (
            <div key={i} className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xs">{a}</div>
          ))}
          {crew.members > crew.memberAvatars.length && (
            <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[10px] text-[#6B6B6B]" style={F.mono}>
              +{crew.members - crew.memberAvatars.length}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-[#6B6B6B] text-xs italic" style={F.serif}>
            · the crew is quiet · break the silence ·
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.from === 'me';
            const prev = messages[i - 1];
            const showFrom = !mine && (!prev || prev.from !== m.from);
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                {showFrom && (
                  <div className="text-[10px] text-[#6B6B6B] mb-0.5 ml-1" style={F.mono}>{m.from}</div>
                )}
                <div className={`max-w-[78%] px-3 py-2 text-sm break-words ${
                  mine
                    ? 'bg-[#8B0000] text-[#F5F1E8] rounded-l-2xl rounded-tr-2xl rounded-br-md'
                    : 'bg-[#141414] text-[#F5F1E8] border border-[#1F1F1F] rounded-r-2xl rounded-tl-2xl rounded-bl-md'
                }`} style={F.serif}>
                  {m.body}
                </div>
                <div className="text-[9px] text-[#6B6B6B] mt-0.5 px-1" style={F.mono}>{m.time}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 pb-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#141414] border border-[#1F1F1F] rounded-2xl px-3 py-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="address the coven..."
              rows={1}
              className="w-full bg-transparent text-[#F5F1E8] text-sm outline-none resize-none placeholder:text-[#6B6B6B]"
              style={{ ...F.ui, maxHeight: '120px' }}
            />
          </div>
          <button onClick={send} disabled={!draft.trim()}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${draft.trim() ? 'bg-[#8B0000] text-[#F5F1E8]' : 'bg-[#141414] border border-[#1F1F1F] text-[#6B6B6B]'}`}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
