import { F } from '../../styles/fonts';

// A "· label ·" section header flanked by hairline gold rules — the app's editorial divider.
// `rule` (default true) draws the flanking lines; `action` renders a small control on the right.
export function SectionLabel({ children, action, rule = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {rule && <span className="rule flex-1" />}
      <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] whitespace-nowrap" style={F.scriptureSC}>· {children} ·</span>
      {rule && <span className="rule flex-1" />}
      {action}
    </div>
  );
}
