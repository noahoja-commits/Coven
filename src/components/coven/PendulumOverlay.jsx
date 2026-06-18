import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { F } from '../../styles/fonts';

// Answers cycle in this order: yes (right) / no (left) / ask again (still)
const ANSWERS = [
  { key: 'yes', label: 'yes', glyph: '✓', detail: 'the line tilts right.', tone: '#C9A961', angle: 25 },
  { key: 'no', label: 'no', glyph: '✗', detail: 'the line tilts left.', tone: '#8B0000', angle: -25 },
  { key: 'unclear', label: 'ask again', glyph: '○', detail: 'the line is still.', tone: '#8A8A92', angle: 0 },
];

export function PendulumOverlay({ onClose, onLog }) {
  const [question, setQuestion] = useState('');
  const [swinging, setSwinging] = useState(false);
  const [answer, setAnswer] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const ask = () => {
    if (!question.trim() || swinging) return;
    setSwinging(true);
    setAnswer(null);
    timeoutRef.current = setTimeout(() => {
      const result = ANSWERS[Math.floor(Math.random() * ANSWERS.length)];
      setAnswer(result);
      setSwinging(false);
      onLog && onLog({ kind: 'pendulum', question: question.trim(), answer: result.label });
    }, 2400);
  };

  const reset = () => {
    setQuestion('');
    setAnswer(null);
    setSwinging(false);
  };

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #14080C 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>PENDULUM</div>
          <button onClick={reset} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="reset"><RotateCcw size={16} /></button>
        </div>
      </div>

      <div className="relative px-6 pt-8 pb-12">
        <div className="text-center mb-6">
          <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· consult the line ·</div>
          <p className="text-[#A89968]/50 text-xs italic mt-1 max-w-xs mx-auto" style={F.scripture}>
            ask one yes-or-no question. the pendulum will answer.
          </p>
        </div>

        {/* Pendulum SVG */}
        <div className="relative w-full max-w-[280px] mx-auto h-[280px] mb-6">
          <svg viewBox="0 0 200 240" className="w-full h-full">
            {/* Anchor point */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="#A89968" strokeWidth="0.5" opacity="0.4" />
            <circle cx="100" cy="20" r="3" fill="#A89968" />

            {/* Tick marks */}
            <line x1="40" y1="200" x2="160" y2="200" stroke="#A89968" strokeWidth="0.3" opacity="0.3" />
            <text x="40" y="218" fontSize="8" textAnchor="middle" fill="#8B0000" opacity="0.6" style={{ fontFamily: 'IM Fell English SC, serif', letterSpacing: '0.2em' }}>NO</text>
            <text x="100" y="218" fontSize="8" textAnchor="middle" fill="#8A8A92" opacity="0.6" style={{ fontFamily: 'IM Fell English SC, serif', letterSpacing: '0.2em' }}>·</text>
            <text x="160" y="218" fontSize="8" textAnchor="middle" fill="#C9A961" opacity="0.6" style={{ fontFamily: 'IM Fell English SC, serif', letterSpacing: '0.2em' }}>YES</text>

            {/* The pendulum */}
            <g style={{
              transformOrigin: '100px 20px',
              transform: swinging
                ? 'rotate(0deg)'
                : answer
                  ? `rotate(${answer.angle}deg)`
                  : 'rotate(0deg)',
              transition: swinging ? 'none' : 'transform 1.4s cubic-bezier(.34, 1.56, .64, 1)',
              animation: swinging ? 'pendulum-swing 1.2s ease-in-out infinite' : 'none',
            }}>
              <line x1="100" y1="20" x2="100" y2="180" stroke="#A89968" strokeWidth="0.6" />
              <circle cx="100" cy="180" r="14" fill="#0A0204" stroke="#C9A961" strokeWidth="1" />
              <circle cx="100" cy="180" r="6" fill="#C9A961" opacity="0.5" />
            </g>
          </svg>
          <style>{`
            @keyframes pendulum-swing {
              0%, 100% { transform: rotate(-22deg); }
              50% { transform: rotate(22deg); }
            }
          `}</style>
        </div>

        {/* Question input or answer */}
        <div className="max-w-sm mx-auto">
          {!answer && (
            <>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 140))}
                placeholder="will I..."
                disabled={swinging}
                rows={2}
                className="w-full bg-[#0A0204] border border-[#A89968]/30 focus:border-[#C9A961] outline-none p-3 text-[#F5F1E8] text-base italic resize-none disabled:opacity-60"
                style={F.scripture}
              />
              <button onClick={ask} disabled={!question.trim() || swinging}
                className="mt-3 w-full py-3 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] disabled:opacity-40 disabled:hover:border-[#A89968]/40 disabled:hover:text-[#A89968] text-xs uppercase tracking-[0.3em] transition-colors"
                style={F.ui}>
                {swinging ? '· the line moves ·' : 'ask'}
              </button>
            </>
          )}

          {answer && (
            <div className="text-center">
              <p className="text-[#A89968]/60 text-xs italic mb-3" style={F.scripture}>"{question}"</p>
              <div className="text-7xl mb-2" style={{ color: answer.tone }}>{answer.glyph}</div>
              <div className="text-2xl tracking-[0.4em] uppercase mb-1" style={{ ...F.display, color: answer.tone }}>
                {answer.label}
              </div>
              <p className="text-[#A89968]/60 text-xs italic" style={F.scripture}>· {answer.detail} ·</p>
              <button onClick={reset}
                className="mt-6 px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E] hover:border-[#A89968]" style={F.ui}>
                ask again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
