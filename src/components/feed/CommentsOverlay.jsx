import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bookmark, CornerDownRight } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { Reaction } from '../shared/Reaction';
import { PostImage } from '../shared/Visuals';
import { renderRichText } from '../shared/RichText';
import { COMMENT_REACTIONS } from '../shared/ReactionGlyphs';

export function CommentsOverlay({ post, onClose, onComment, onReact, onReactComment, isBookmarked, onToggleBookmark, onOpenUser }) {
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null); // commentId being replied to
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [post?.comments?.length]);

  if (!post) return null;

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    onComment && onComment(body, replyTo);
    setDraft('');
    setReplyTo(null);
  };

  const comments = post.comments || [];
  const baseCount = post.baseCommentCount || 0;

  // Group: top-level comments + replies as a children list
  const topLevel = comments.filter(c => !c.parentId);
  const repliesByParent = comments.filter(c => c.parentId).reduce((acc, c) => {
    (acc[c.parentId] = acc[c.parentId] || []).push(c);
    return acc;
  }, {});
  const replyingToComment = replyTo ? comments.find(c => c.id === replyTo) : null;

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><ArrowLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <div className="text-[#F5F1E8] text-sm" style={F.display}>COMMENTS</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{baseCount + comments.length} total</div>
          </div>
          {onToggleBookmark && (
            <button onClick={onToggleBookmark}
              className={`tap p-2 ${isBookmarked ? 'text-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#C9A961]'}`}
              title={isBookmarked ? 'saved' : 'save'}>
              <Bookmark size={16} fill={isBookmarked ? '#C9A961' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {/* Original post mini */}
        <div className="px-4 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2.5 mb-2">
            <button onClick={() => !post.mine && onOpenUser && onOpenUser(post.user, post.avatar)}
              className="w-9 h-9 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
              {post.avatarUrl ? <img src={post.avatarUrl} alt="" className="w-full h-full object-cover" /> : post.avatar}
            </button>
            <div className="flex-1 min-w-0">
              <button onClick={() => !post.mine && onOpenUser && onOpenUser(post.user, post.avatar)}
                className="text-[#F5F1E8] text-sm hover:underline" style={F.ui}>{post.user}</button>
              <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{post.time}</div>
            </div>
          </div>
          {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}>{renderRichText(post.body, { onOpenUser })}</p>}
          {(post.kind === 'photo' || post.kind === 'video') && <div className="mb-3"><PostImage kind={post.img} /></div>}
          {post.kind === 'event' && (
            <div className="mb-3 border border-[#2A2A2A] bg-[#0F0F0F] p-3">
              <div className="text-[#F5F1E8] text-lg" style={F.display}>{post.event.name}</div>
              <div className="text-[#A8A29E] text-xs" style={F.serif}>{post.event.venue} · <span style={F.mono}>{post.event.date}</span></div>
            </div>
          )}
          <div className="flex items-center -ml-2">
            <Reaction icon="🦇" count={post.reactions?.bat} active={post.myReactions?.bat} onClick={() => onReact && onReact('bat')} />
            <Reaction icon="🔥" count={post.reactions?.fire} active={post.myReactions?.fire} onClick={() => onReact && onReact('fire')} />
            <Reaction icon="💀" count={post.reactions?.skull} active={post.myReactions?.skull} onClick={() => onReact && onReact('skull')} />
            <Reaction icon="💨" count={post.reactions?.smoke} active={post.myReactions?.smoke} onClick={() => onReact && onReact('smoke')} />
          </div>
        </div>

        {/* Comments */}
        {comments.length === 0 && baseCount === 0 && (
          <EmptyState glyph="☾" text="· no whispers yet · be the first ·" />
        )}
        {comments.length === 0 && baseCount > 0 && (
          <div className="px-4 py-10 text-center text-[#6B6B6B] text-xs italic" style={F.serif}>
            · {baseCount} {baseCount === 1 ? 'voice' : 'voices'} before yours · add to the chorus ·
          </div>
        )}
        {topLevel.map(c => {
          const replies = repliesByParent[c.id] || [];
          return (
            <div key={c.id} className="px-4 py-3 border-b border-[#1A1A1A]">
              <CommentRow c={c} onOpenUser={onOpenUser} onReactComment={onReactComment} onReply={() => setReplyTo(c.id)} />
              {replies.length > 0 && (
                <div className="mt-2 pl-7 border-l border-[#1A1A1A] space-y-2">
                  {replies.map(r => (
                    <CommentRow key={r.id} c={r} reply onOpenUser={onOpenUser} onReactComment={onReactComment} onReply={() => setReplyTo(c.id)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div className="h-4" />
      </div>

      {/* Composer */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 pb-3">
        {replyingToComment && (
          <div className="flex items-center gap-2 px-2 py-1 mb-1 bg-[#5B0F1A]/10 border-l-2 border-[#5B0F1A]">
            <CornerDownRight size={11} className="text-[#9E2A33]" />
            <span className="text-[10px] uppercase tracking-wider text-[#9E2A33]" style={F.ui}>replying to {replyingToComment.user}</span>
            <button onClick={() => setReplyTo(null)} className="tap ml-auto text-[#6B6B6B] hover:text-[#C9A961] text-xs">×</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-2xl px-3 py-2">
            <textarea
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={replyingToComment ? `reply to ${replyingToComment.user}...` : 'add a whisper...'}
              rows={1}
              className="w-full bg-transparent text-[#F5F1E8] text-sm outline-none resize-none placeholder:text-[#6B6B6B]"
              style={{ ...F.ui, maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={send}
            disabled={!draft.trim()}
            className={`tap w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${
              draft.trim() ? 'bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B]'
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentRow({ c, reply, onOpenUser, onReactComment, onReply }) {
  return (
    <div className="flex gap-2.5">
      <button onClick={() => !c.mine && onOpenUser && onOpenUser(c.user, c.avatar)}
        className={`${reply ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'} rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0`}>
        {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" /> : c.avatar}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <button onClick={() => !c.mine && onOpenUser && onOpenUser(c.user, c.avatar)}
            className="text-[#F5F1E8] text-sm hover:underline" style={F.ui}>{c.user}</button>
          <span className="text-[9px] text-[#6B6B6B]" style={F.mono}>{c.time}</span>
        </div>
        <p className="text-[#F5F1E8] text-sm mt-0.5 leading-relaxed" style={F.serif}>{renderRichText(c.body, { onOpenUser })}</p>
        <div className="flex items-center gap-1.5 mt-1 -ml-1">
          {COMMENT_REACTIONS.map(({ kind, Glyph }) => {
            const n = c.reactions?.[kind] || 0;
            const active = !!c.myReactions?.[kind];
            return (
              <button key={kind} onClick={() => onReactComment && onReactComment(c.id, kind)} title={kind}
                className={`tap flex items-center gap-1 px-1.5 py-0.5 transition-colors ${active ? 'text-[#9E2A33]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}>
                <Glyph width={12} height={12} />
                {n > 0 && <span className="text-[10px]" style={F.mono}>{n}</span>}
              </button>
            );
          })}
          {!reply && (
            <button onClick={onReply}
              className="text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#A8A29E] px-1.5 py-0.5" style={F.ui}>
              reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
