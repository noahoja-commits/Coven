import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Trash2, Eye } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchStoryReactors } from '../../lib/db/stories';
import { recordView, fetchViewCounts } from '../../lib/db/views';
import { STORY_GLYPH_FOR } from '../shared/ReactionGlyphs';

const STORY_REACTIONS = ['🦇', '🔥', '💀', '🥀', '🕯'];

const STORY_DURATION = 5000;

const BG_STYLES = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  gold: 'linear-gradient(135deg, #3B2F0A 0%, #1A1408 70%, #0A0804 100%)',
  silver: 'linear-gradient(135deg, #2A2A30 0%, #14141A 70%, #0A0A10 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

function ago(ts) {
  const m = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export function StoryViewer({ stories = [], startIndex = 0, onReply, onReactStory, onDelete, onClose, onSeen }) {
  const [index, setIndex] = useState(startIndex);
  const [reply, setReply] = useState('');
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [myReactions, setMyReactions] = useState({}); // {storyId: kind}
  const [reactors, setReactors] = useState([]);        // who reacted to my story
  const [seenCount, setSeenCount] = useState(0);       // unique views of my story
  const startRef = useRef(Date.now());

  const story = stories[index];

  useEffect(() => { setProgress(0); startRef.current = Date.now(); }, [index]);

  // Mark each story watched as it's shown (drives the "seen" ring on the rail) and record a
  // real unique view server-side. Skip your own — viewing your own story shouldn't count.
  useEffect(() => {
    if (story?.id && !story.mine) { onSeen?.(story.id); recordView('story', story.id); }
  }, [story?.id, story?.mine, onSeen]);

  // When viewing your own story, load who reacted + the unique-view count.
  useEffect(() => {
    let on = true;
    if (story?.mine && story?.id) {
      fetchStoryReactors(story.id).then(r => { if (on) setReactors(r); }).catch(() => {});
      fetchViewCounts('story', [story.id]).then(m => { if (on) setSeenCount(m[story.id] || 0); }).catch(() => {});
    } else { setReactors([]); setSeenCount(0); }
    return () => { on = false; };
  }, [story?.id, story?.mine]);

  const react = (kind) => {
    if (!story) return;
    setMyReactions(m => ({ ...m, [story.id]: kind }));
    onReactStory && onReactStory(story.id, kind);
  };

  useEffect(() => {
    if (paused || !story) return;
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - startRef.current) / STORY_DURATION);
      setProgress(p);
      if (p >= 1) {
        if (index < stories.length - 1) setIndex(i => i + 1);
        else onClose && onClose();
      }
    }, 50);
    return () => clearInterval(t);
  }, [index, paused, story, stories.length, onClose]);

  if (!story) return null;

  const prev = () => { if (index > 0) setIndex(i => i - 1); };
  const next = () => { if (index < stories.length - 1) setIndex(i => i + 1); else onClose && onClose(); };
  const sendReply = () => {
    const body = reply.trim();
    if (!body) return;
    onReply && onReply(story.user, body);
    setReply('');
  };
  const hold = (on) => () => {
    setPaused(on);
    if (!on) startRef.current = Date.now() - progress * STORY_DURATION;
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[60] bg-black" style={{ background: BG_STYLES[story.bg] || BG_STYLES.red }}
      onMouseDown={hold(true)} onMouseUp={hold(false)} onMouseLeave={hold(false)}
      onTouchStart={hold(true)} onTouchEnd={hold(false)}>

      {/* Progress bars */}
      <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/20 overflow-hidden">
            <div className="h-full bg-white" style={{
              width: i < index ? '100%' : i === index ? `${progress * 100}%` : '0%',
              transition: i === index ? 'none' : 'width 0.2s',
            }} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4 flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-white/20 flex items-center justify-center text-base">{story.avatar}</div>
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm" style={F.ui}>{story.mine ? 'you' : story.user}</div>
          <div className="text-[10px] text-white/60" style={F.mono}>{ago(story.createdAt)}</div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white p-2 -m-1 transition-colors"><X size={22} /></button>
      </div>

      {/* Tap zones */}
      <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"><ChevronLeft size={18} className="text-white/40" /></button>
      <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"><ChevronRight size={18} className="text-white/40" /></button>

      {/* Photo, or glyph backdrop */}
      {story.imageUrl ? (
        <img src={story.imageUrl} alt="" className="post-media absolute inset-0 w-full h-full object-contain" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[200px] opacity-20" style={{ textShadow: '0 0 60px rgba(0,0,0,0.5)' }}>{story.glyph}</div>
        </div>
      )}

      {/* Attached post (share-to-story) */}
      {story.attachedPost && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 flex justify-center pointer-events-none">
          <div className="w-full max-w-[280px] bg-[#0A0A0A]/70 backdrop-blur-sm border border-[#C9A961]/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[10px] overflow-hidden">
                {story.attachedPost.avatarUrl ? <img src={story.attachedPost.avatarUrl} className="w-full h-full object-cover" alt="" /> : <span>{story.attachedPost.avatar || '✦'}</span>}
              </div>
              <span className="text-[10px] text-white/70" style={F.ui}>{story.attachedPost.user}</span>
            </div>
            {story.attachedPost.body && <p className="text-xs text-white/85 leading-relaxed line-clamp-4" style={F.serif}>{story.attachedPost.body}</p>}
            {story.attachedPost.img && story.attachedPost.img.startsWith('http') && (
              <div className="mt-1.5 rounded-lg overflow-hidden"><img src={story.attachedPost.img} className="w-full" alt="" /></div>
            )}
          </div>
        </div>
      )}

      {story.caption && (
        <div className="absolute bottom-16 left-0 right-0 px-6 text-center">
          <p className="text-white text-xl leading-tight" style={F.scripture}>"{story.caption}"</p>
        </div>
      )}

      {/* Footer */}
      {story.mine ? (
        <div className="absolute bottom-4 left-0 right-0 px-4 flex flex-col items-center gap-2">
          {reactors.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm border border-white/15 rounded-full max-w-full overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-white/60 uppercase tracking-wider shrink-0" style={F.ui}>{reactors.length} reacted</span>
              {reactors.slice(0, 8).map(r => {
                const G = STORY_GLYPH_FOR[r.kind];
                return <span key={r.userId} className="shrink-0 text-[#F5F1E8]" title={r.user}>{G ? <G width={16} height={16} /> : r.kind}</span>;
              })}
            </div>
          )}
          <div className="flex items-center gap-2">
            {seenCount > 0 && (
              <span className="flex items-center gap-1 text-white/70 text-xs" style={F.mono} title="unique views"><Eye size={12} /> {seenCount}</span>
            )}
            <p className="text-white/60 text-xs italic" style={F.serif}>disappears in {Math.max(0, Math.floor((story.expiresAt - Date.now()) / 3600000))}h</p>
            <button onClick={() => { onDelete && onDelete(story.id); onClose && onClose(); }}
              className="flex items-center gap-1 px-3 py-1 text-[10px] uppercase tracking-wider border border-white/30 text-white/80 hover:border-[#8B0000] hover:text-[#8B0000] transition-colors" style={F.ui}>
              <Trash2 size={11} /> remove
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-4 left-0 right-0 px-4 flex flex-col gap-2">
          <div className="flex items-center justify-center gap-3">
            {STORY_REACTIONS.map(r => {
              const G = STORY_GLYPH_FOR[r];
              return (
                <button key={r} onClick={() => react(r)}
                  className={`transition-transform text-[#F5F1E8] ${myReactions[story.id] === r ? 'scale-150 text-[#C9A961] drop-shadow-[0_0_6px_rgba(201,169,97,0.5)]' : 'opacity-70 hover:opacity-100 hover:scale-110'}`}>
                  {G ? <G width={26} height={26} /> : <span className="text-2xl">{r}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-black/40 backdrop-blur-sm border border-white/15 rounded-full">
            <input value={reply} onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendReply(); } }}
              placeholder={`reply to ${story.user}...`}
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/50" style={F.ui} />
          </div>
          <button onClick={sendReply} disabled={!reply.trim()}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${reply.trim() ? 'bg-[#8B0000] hover:bg-[#5B0F1A] text-white' : 'bg-white/10 text-white/40'}`}>
            <Send size={14} />
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
