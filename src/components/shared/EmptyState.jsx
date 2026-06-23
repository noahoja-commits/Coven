import { F } from '../../styles/fonts';

// Atmospheric empty state — a flickering glyph + soft glow wrapping poetic copy + an optional CTA.
// glyph accepts an emoji string OR a sigil component (e.g. AllSeeingEye). Existing copy is preserved by callers.
export function EmptyState({ glyph = '✦', text, sub, action, onAction, className = '' }) {
  const Glyph = typeof glyph === 'function' ? glyph : null;
  return (
    <div className={`relative py-14 px-8 text-center ${className}`}>
      <div className="relative inline-flex items-center justify-center mb-3">
        <span aria-hidden className="absolute w-24 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,0,0,0.22), transparent 70%)' }} />
        {Glyph
          ? <Glyph width={48} height={48} className="relative text-[#5B5B5B] animate-flicker" />
          : <span className="relative text-[#5B5B5B] text-5xl animate-flicker leading-none">{glyph}</span>}
      </div>
      {text && <p className="text-[#A8A29E] text-sm italic" style={F.serif}>{text}</p>}
      {sub && <p className="text-[#6B6B6B] text-xs mt-1" style={F.ui}>{sub}</p>}
      {action && (
        <button onClick={onAction}
          className="mt-4 px-4 py-2 border border-[#5B0F1A] text-[#F5F1E8] bg-[#8B0000]/15 hover:bg-[#8B0000]/30 text-[10px] uppercase tracking-[0.25em] transition-colors"
          style={F.ui}>{action}</button>
      )}
    </div>
  );
}
