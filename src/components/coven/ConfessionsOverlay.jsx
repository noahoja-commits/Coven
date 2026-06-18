import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Reaction } from '../shared/Reaction';

const SEED_CONFESSIONS = [
  { id: 'cf1', body: 'i still drive past their apartment on saturdays.', at: Date.now() - 1000 * 60 * 60 * 3, reactions: { bat: 12, fire: 0, skull: 8, smoke: 2 }, myReactions: {} },
  { id: 'cf2', body: 'i told everyone i was sober for a year. it’s been four months.', at: Date.now() - 1000 * 60 * 60 * 8, reactions: { bat: 28, fire: 4, skull: 19, smoke: 3 }, myReactions: {} },
  { id: 'cf3', body: 'i don\'t actually like the bands i wear shirts of. i just like the shirts.', at: Date.now() - 1000 * 60 * 60 * 14, reactions: { bat: 9, fire: 42, skull: 31, smoke: 7 }, myReactions: {} },
  { id: 'cf4', body: 'every time someone says "let\'s hang" i panic and never reply.', at: Date.now() - 1000 * 60 * 60 * 22, reactions: { bat: 71, fire: 8, skull: 102, smoke: 14 }, myReactions: {} },
  { id: 'cf5', body: 'st. john the divine is the only place i feel like a person.', at: Date.now() - 1000 * 60 * 60 * 30, reactions: { bat: 44, fire: 2, skull: 6, smoke: 0 }, myReactions: {} },
];

function ago(ts) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ConfessionsOverlay({ onClose, userConfessions = [] }) {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState([]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    setSubmitted(prev => [{ id: `cf${Date.now()}`, body, at: Date.now(), reactions: { bat: 0, fire: 0, skull: 0, smoke: 0 }, myReactions: {} }, ...prev]);
    setDraft('');
  };

  const all = [...submitted, ...userConfessions, ...SEED_CONFESSIONS];

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #2D0F3F 0%, #14081F 50%, #050204 100%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#7B2CBF]/20">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] -ml-1"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>CONFESSIONS</div>
          <span className="w-5" />
        </div>
      </div>

      <div className="relative px-4 pt-6 pb-12">
        <div className="text-center mb-4">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· anonymous · ephemeral ·</div>
          <p className="text-[#A89968]/50 text-xs italic mt-1 max-w-xs mx-auto" style={F.scripture}>
            speak without your name. no replies. only witnesses.
          </p>
        </div>

        <div className="mb-6 max-w-md mx-auto">
          <textarea value={draft} onChange={e => setDraft(e.target.value.slice(0, 280))}
            placeholder="what couldn't you say with your name attached..."
            rows={3}
            className="w-full bg-[#0A0204]/80 border border-[#7B2CBF]/30 focus:border-[#7B2CBF] outline-none p-3 text-[#F5F1E8] text-base italic resize-none placeholder:text-[#A89968]/30"
            style={F.scripture} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#A89968]/40" style={F.mono}>{draft.length}/280</span>
            <button onClick={submit} disabled={!draft.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider ${draft.trim() ? 'bg-[#7B2CBF] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              <Send size={11} /> confess
            </button>
          </div>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          {all.map(c => (
            <div key={c.id} className="border border-[#7B2CBF]/20 bg-[#0A0204]/60 p-4">
              <p className="text-[#F5F1E8] text-base italic leading-relaxed mb-3" style={F.scripture}>"{c.body}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center -ml-2">
                  <Reaction icon="🦇" count={c.reactions.bat} />
                  <Reaction icon="💀" count={c.reactions.skull} />
                  <Reaction icon="🔥" count={c.reactions.fire} />
                </div>
                <div className="text-[10px] text-[#A89968]/50 flex items-center gap-2" style={F.scriptureSC}>
                  <span>· anonymous ·</span>
                  <span style={F.mono}>{ago(c.at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
