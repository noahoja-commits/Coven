import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import { F } from '../../styles/fonts';

const REACTION_KINDS = [['bat', '🦇'], ['fire', '🔥'], ['skull', '💀'], ['smoke', '💨']];

export function ChatThread({ conversation, messages, onSend, onBack, onRetry, onReact, onOpenPost, initialDraft = '' }) {
  const [draft, setDraft] = useState(initialDraft);
  const [seenAt, setSeenAt] = useState(null); // simulated remote read after delay
  const [trayFor, setTrayFor] = useState(null); // message id whose reaction tray is open
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // When you send a message, simulate the other reading it 4-9s later
    const last = messages?.[messages.length - 1];
    if (last?.from === 'me') {
      const delay = 4000 + Math.random() * 5000;
      const t = setTimeout(() => setSeenAt(last.id), delay);
      return () => clearTimeout(t);
    }
  }, [messages?.length]);

  if (!conversation) return null;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    onSend && onSend(body);
    setDraft('');
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
            {conversation.avatarUrl ? <img src={conversation.avatarUrl} alt="" className="w-full h-full object-cover" /> : conversation.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{conversation.user}</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>
              {conversation.group ? 'coven · group' : 'whisper'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {(messages || []).map((m, i) => {
          const mine = m.from === 'me';
          const prev = (messages || [])[i - 1];
          const showFrom = conversation.group && !mine && (!prev || prev.from !== m.from);
          const isLast = i === messages.length - 1;
          const seen = mine && isLast && seenAt === m.id;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {showFrom && (
                <div className="text-[10px] text-[#6B6B6B] mb-0.5 ml-1" style={F.mono}>{m.from}</div>
              )}
              <div
                onClick={() => {
                  if (m.failed) { onRetry && onRetry(m.id); return; }
                  if (onReact && !m.pending) setTrayFor(t => t === m.id ? null : m.id);
                }}
                className={`max-w-[78%] px-3 py-2 text-sm break-words ${(m.failed || (onReact && !m.pending)) ? 'cursor-pointer' : ''} ${
                  mine
                    ? `text-[#F5F1E8] rounded-l-2xl rounded-tr-2xl rounded-br-md ${m.failed ? 'bg-[#3a0d0d] border border-[#8B0000]' : m.pending ? 'bg-[#8B0000]/60' : 'bg-[#8B0000]'}`
                    : 'bg-[#141414] text-[#F5F1E8] border border-[#2A2A2A] rounded-r-2xl rounded-tl-2xl rounded-bl-md'
                }`}
                style={F.serif}
              >
                {m.forwardedPost && (
                  <div
                    onClick={(e) => { e.stopPropagation(); if (!m.forwardedPost.removed && onOpenPost) onOpenPost(m.forwardedPost.id); }}
                    className={`${m.body ? 'mb-1.5' : ''} px-2 py-1.5 rounded-lg bg-black/30 border border-white/10 ${m.forwardedPost.removed ? '' : 'cursor-pointer'}`}
                  >
                    {m.forwardedPost.removed ? (
                      <div className="text-[11px] italic opacity-70">post removed</div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 mb-0.5 opacity-80">
                          <span className="text-xs leading-none">{m.forwardedPost.avatar || '✦'}</span>
                          <span className="text-[10px] uppercase tracking-wider truncate">{m.forwardedPost.handle || 'someone'}</span>
                        </div>
                        {m.forwardedPost.img && <div className="text-[11px] opacity-70 mb-0.5">🖼 image</div>}
                        {m.forwardedPost.body && <div className="text-[12px] leading-snug opacity-90">{m.forwardedPost.body.slice(0, 140)}{m.forwardedPost.body.length > 140 ? '…' : ''}</div>}
                      </>
                    )}
                  </div>
                )}
                {m.body}
              </div>
              {/* reaction tray — tap a whisper to open */}
              {trayFor === m.id && onReact && (
                <div className={`flex gap-0.5 mt-1 px-1.5 py-1 rounded-full bg-[#141414] border border-[#2A2A2A] ${mine ? 'self-end' : 'self-start'}`}>
                  {REACTION_KINDS.map(([k, icon]) => (
                    <button key={k}
                      onClick={(e) => { e.stopPropagation(); onReact(m.id, k); setTrayFor(null); }}
                      className="text-base leading-none px-1.5 py-0.5 hover:scale-125 transition-transform">{icon}</button>
                  ))}
                </div>
              )}
              {/* reaction chips */}
              {m.reactions && REACTION_KINDS.some(([k]) => m.reactions[k] > 0) && (
                <div className={`flex flex-wrap gap-1 mt-1 ${mine ? 'self-end justify-end' : 'self-start'}`}>
                  {REACTION_KINDS.filter(([k]) => m.reactions[k] > 0).map(([k, icon]) => (
                    <button key={k}
                      onClick={(e) => { e.stopPropagation(); onReact && onReact(m.id, k); }}
                      className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-colors ${
                        m.myReactions?.[k]
                          ? 'border-[#8B0000] bg-[#8B0000]/25 text-[#F5F1E8]'
                          : 'border-[#2A2A2A] bg-[#141414] text-[#A8A29E] hover:text-[#F5F1E8]'
                      }`}>
                      <span className="leading-none">{icon}</span><span style={F.mono}>{m.reactions[k]}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="text-[9px] text-[#6B6B6B] mt-0.5 px-1 flex items-center gap-1" style={F.mono}>
                {m.failed ? (
                  <span className="text-[#C97a7a]">failed — tap to retry</span>
                ) : <>
                  {m.time}
                  {mine && isLast && (
                    seen ? <span className="text-[#C9A961] flex items-center gap-0.5"><CheckCheck size={10} /> seen</span>
                         : <Check size={10} />
                  )}
                </>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 pb-3 safe-pb">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-2xl px-3 py-2">
            <textarea
              value={draft}
              maxLength={4000}
              onChange={(e) => setDraft(e.target.value.slice(0, 4000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="whisper..."
              rows={1}
              className="w-full bg-transparent text-[#F5F1E8] text-sm outline-none resize-none placeholder:text-[#6B6B6B]"
              style={{ ...F.ui, maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
              draft.trim()
                ? 'bg-[#8B0000] text-[#F5F1E8]'
                : 'bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B]'
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
