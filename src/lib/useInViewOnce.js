import { useEffect, useRef } from 'react';

// Fire `cb` exactly once, the first time the element is at least ~half visible.
// Used to record a view when a post/listing actually scrolls onto the screen
// (rather than just existing in the list). No-op if IntersectionObserver is absent.
export function useInViewOnce(cb, deps = []) {
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    done.current = false;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      // Fallback: no observer → count it on mount so the feature still works.
      if (el && !done.current) { done.current = true; cb(); }
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          cb();
          io.disconnect();
        }
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}
