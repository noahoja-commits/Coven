import { useState } from 'react';
import { ArrowLeft, Send, Flag } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { SacredHeart } from '../shared/Sigils';
import { Reaction } from '../shared/Reaction';
import { OrnamentRule, Grain } from '../shared/Sigils';

// Confessions are real anonymous posts. `userConfessions` is the live list of the
// current feed's anonymous posts (author masked server-side); confessing creates a
// real anonymous post via onConfess; reactions go through the normal post reactions.
// onReport reports + locally hides a confession (the backend auto-hides at 3 reporters).
export function ConfessionsOverlay({ onClose, userConfessions = [], onConfess, onReact, onReport }) {
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [hidden, setHidden] = useState({}); // id -> true once reported/hidden locally

  const report = (id) => {
    setHidden(h => ({ ...h, [id]: true }));
    onReport && onReport(id);
  };

  const submit = async () => {
    const body = draft.trim();
    if (!body || posting) return;
    setPosting(true);
    try {
      await (onConfess && onConfess(body));
      setDraft('');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #2D0F3F 0%, #14081F 50%, #050204 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#7B2CBF]/20 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>CONFESSIONS</div>
          <span className="w-5" />
        </div>
      </div>

      <div className="relative px-4 pt-6 pb-12">
        <div className="text-center mb-4">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· anonymous · ephemeral ·</div>
          <p className="text-[#A89968]/50 text-xs italic mt-1 max-w-xs mx-auto" style={F.scripture}>
            speak without your name. only witnesses.
          </p>
        </div>

        <div className="mb-6 max-w-md mx-auto">
          <textarea value={draft} onChange={e => setDraft(e.target.value.slice(0, 280))}
            placeholder="what couldn't you say with your name attached..."
            rows={3}
            disabled={posting}
            className="w-full bg-[#0A0204]/80 border border-[#7B2CBF]/30 focus:border-[#7B2CBF] outline-none p-3 text-[#F5F1E8] text-base italic resize-none placeholder:text-[#A89968]/30 disabled:opacity-60"
            style={F.scripture} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#A89968]/40" style={F.mono}>{draft.length}/280</span>
            <button onClick={submit} disabled={!draft.trim() || posting}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider ${draft.trim() && !posting ? 'bg-[#7B2CBF] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              <Send size={11} /> {posting ? 'sealing…' : 'confess'}
            </button>
          </div>
        </div>

        <OrnamentRule glyph="𖤐" color="#7B2CBF" tint="#A89968" className="mb-5 max-w-md mx-auto" />

        <div className="space-y-3 max-w-md mx-auto">
          {userConfessions.length === 0 ? (
            <EmptyState glyph={SacredHeart} text="· no confessions yet. be the first to unburden ·" />
          ) : userConfessions.filter(c => !hidden[c.id]).map(c => (
            <div key={c.id} className="relative overflow-hidden border border-[#7B2CBF]/20 bg-[#0A0204]/60 p-4">
              <Grain opacity={0.05} />
              <p className="relative text-[#F5F1E8] text-base italic leading-relaxed mb-3 illuminated" style={F.scripture}>{c.body}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center -ml-2">
                  <Reaction icon="🦇" count={c.reactions?.bat || 0} active={!!c.myReactions?.bat} onClick={() => onReact && onReact(c.id, 'bat')} />
                  <Reaction icon="💀" count={c.reactions?.skull || 0} active={!!c.myReactions?.skull} onClick={() => onReact && onReact(c.id, 'skull')} />
                  <Reaction icon="🔥" count={c.reactions?.fire || 0} active={!!c.myReactions?.fire} onClick={() => onReact && onReact(c.id, 'fire')} />
                </div>
                <div className="text-[10px] text-[#A89968]/50 flex items-center gap-2" style={F.scriptureSC}>
                  <button onClick={() => report(c.id)}
                    className="text-[#A89968]/40 hover:text-[#8B0000] transition-colors p-1 -m-1"
                    title="report this confession">
                    <Flag size={11} />
                  </button>
                  <span>· anonymous ·</span>
                  <span style={F.mono}>{c.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
