import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { STORIES } from '../../data/posts';

const STORY_DURATION = 5000;

const BG_STYLES = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  gold: 'linear-gradient(135deg, #3B2F0A 0%, #1A1408 70%, #0A0804 100%)',
  silver: 'linear-gradient(135deg, #2A2A30 0%, #14141A 70%, #0A0A10 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

const STORY_GLIMPSES = [
  { caption: 'add yours', empty: true },
  { caption: 'cellar door / bushwick', bg: 'linear-gradient(135deg, #1F0810 0%, #050204 100%)', glyph: '🦇' },
  { caption: 'thrifted velvet · $12', bg: 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)', glyph: '🕯' },
  { caption: 'home alone, drinking wine', bg: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 100%)', glyph: '✟' },
  { caption: 'who wants in', bg: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)', glyph: '☠' },
  { caption: 'st. john at dusk', bg: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)', glyph: '🌹' },
  { caption: 'drab majesty on loop', bg: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)', glyph: '🩸' },
];

export function StoryViewer({ startIndex = 0, myStories = [], meHandle = 'you', meAvatar = '🦇', onReply, onHighlight, onClose }) {
  const [saved, setSaved] = useState(false);
  const [reply, setReply] = useState('');
  const sendReply = () => {
    const body = reply.trim();
    if (!body) return;
    onReply && onReply(story.user, body);
    setReply('');
  };
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const tickRef = useRef(null);
  const startRef = useRef(Date.now());

  const rawStory = STORIES[index];
  const rawGlimpse = STORY_GLIMPSES[index] || STORY_GLIMPSES[1];
  const validMyStories = myStories.filter(s => s.expiresAt > Date.now());
  const showYours = rawStory?.self && validMyStories.length > 0;
  const story = showYours
    ? { ...rawStory, user: meHandle, avatar: meAvatar, live: false }
    : rawStory;
  const glimpse = showYours
    ? { caption: validMyStories[0].caption, bg: BG_STYLES[validMyStories[0].bg] || BG_STYLES.red, glyph: validMyStories[0].glyph }
    : rawGlimpse;

  useEffect(() => {
    setProgress(0);
    startRef.current = Date.now();
  }, [index]);

  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(1, elapsed / STORY_DURATION);
      setProgress(p);
      if (p >= 1) {
        if (index < STORIES.length - 1) {
          setIndex(i => i + 1);
        } else {
          onClose && onClose();
        }
      }
    }, 50);
    return () => clearInterval(tickRef.current);
  }, [index, paused, onClose]);

  // Pause progress on press
  const handleHoldStart = () => {
    setPaused(true);
    const elapsed = Date.now() - startRef.current;
    startRef.current = Date.now() - elapsed;
  };
  const handleHoldEnd = () => {
    setPaused(false);
    startRef.current = Date.now() - progress * STORY_DURATION;
  };

  const prev = () => {
    if (index > 0) setIndex(i => i - 1);
  };
  const next = () => {
    if (index < STORIES.length - 1) setIndex(i => i + 1);
    else onClose && onClose();
  };

  if (!story) return null;
  if (glimpse.empty) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#050204] flex flex-col items-center justify-center px-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={22} /></button>
        <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em] mb-3" style={F.scriptureSC}>· your story ·</div>
        <div className="w-24 h-24 rounded-full border border-dashed border-[#3F3F3F] flex items-center justify-center text-[#6B6B6B] text-3xl mb-4">+</div>
        <p className="text-[#A8A29E] text-sm italic text-center max-w-xs" style={F.serif}>
          ephemeral. visible to friends for 24 hours, then it disappears.
        </p>
        <button onClick={next} className="mt-6 px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>skip</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black" style={{ background: glimpse.bg }}
      onMouseDown={handleHoldStart} onMouseUp={handleHoldEnd} onMouseLeave={handleHoldEnd}
      onTouchStart={handleHoldStart} onTouchEnd={handleHoldEnd}>

      {/* Progress bars */}
      <div className="absolute top-2 left-2 right-2 z-20 flex gap-1">
        {STORIES.map((_, i) => (
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
          <div className="text-white text-sm" style={F.ui}>{story.user}</div>
          <div className="text-[10px] text-white/60" style={F.mono}>{story.live ? 'live · just now' : '2h ago'}</div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white p-2 -m-1 transition-colors"><X size={22} /></button>
      </div>

      {/* Tap zones */}
      <button onClick={prev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity">
        <ChevronLeft size={18} className="text-white/40" />
      </button>
      <button onClick={next} className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity">
        <ChevronRight size={18} className="text-white/40" />
      </button>

      {/* Glyph */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[200px] opacity-20" style={{ textShadow: '0 0 60px rgba(0,0,0,0.5)' }}>{glimpse.glyph}</div>
      </div>

      {/* Caption */}
      <div className="absolute bottom-16 left-0 right-0 px-6 text-center">
        <p className="text-white text-xl leading-tight" style={F.scripture}>"{glimpse.caption}"</p>
      </div>

      {/* Footer */}
      {!showYours && (
        <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-black/40 backdrop-blur-sm border border-white/15 rounded-full">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendReply(); } }}
              placeholder={`reply to ${story.user}...`}
              className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/50" style={F.ui} />
          </div>
          <button onClick={sendReply} disabled={!reply.trim()}
            className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center ${reply.trim() ? 'bg-[#8B0000] text-white' : 'bg-white/10 text-white/40'}`}>
            <Send size={14} />
          </button>
        </div>
      )}
      {showYours && (
        <div className="absolute bottom-4 left-0 right-0 px-4 flex items-center gap-2 justify-center">
          <p className="text-white/60 text-xs italic" style={F.serif}>disappears in {Math.floor((validMyStories[0].expiresAt - Date.now()) / (1000 * 60 * 60))}h</p>
          <button onClick={() => {
            if (saved) return;
            onHighlight && onHighlight({ glyph: validMyStories[0].glyph, caption: validMyStories[0].caption, bg: validMyStories[0].bg });
            setSaved(true);
          }}
            className={`px-3 py-1 text-[10px] uppercase tracking-wider border ${saved ? 'border-[#C9A961] text-[#C9A961]' : 'border-white/30 text-white/80 hover:border-white hover:text-white'}`}
            style={F.ui}>
            {saved ? '✓ kept' : 'keep'}
          </button>
        </div>
      )}
    </div>
  );
}
