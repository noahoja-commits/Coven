import { ErrorBoundary } from './ErrorBoundary';
import { F } from '../styles/fonts';

// Wraps one feature so a render crash inside it shows a compact inline retry instead of
// the whole-app fallback. Renders its children with NO extra DOM when healthy (the
// ErrorBoundary passes children straight through), so it never affects layout.
//   variant 'feature' → centered "this corner went dark · try again"
//   variant 'post'    → a thin skipped-post row (used per feed item)
export function FeatureBoundary({ children, label, variant = 'feature' }) {
  const fallback = (err, reset) => {
    if (variant === 'post') {
      return (
        <div className="px-4 py-3 border-b border-[#141318] flex items-center justify-between" aria-hidden>
          <span className="text-[10px] italic text-[#4A4A4A]" style={F.serif}>a post failed to load</span>
          <button onClick={reset} className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#C9A961] px-2 py-1" style={F.ui}>retry</button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-center py-10 px-4">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6B6B6B]" style={F.ui}>this corner went dark</span>
        <button onClick={reset} className="btn btn-ghost">try again</button>
      </div>
    );
  };
  return <ErrorBoundary label={label} fallback={fallback}>{children}</ErrorBoundary>;
}
