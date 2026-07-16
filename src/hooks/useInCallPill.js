import { useEffect } from 'react';

// iOS's green in-call / screen-recording status-bar pill grows the status bar without
// updating env(safe-area-inset-top) — that inset is computed once at PWA launch. So a
// fixed-height header stays put while the real safe area gets taller, and the pill
// overlaps it. We can't read the pill directly, so we infer it: watch innerHeight
// (via visualViewport when available, since it ignores on-screen-keyboard resizes)
// against a baseline captured on load, and treat a small shrink as the pill appearing.
const BASELINE_DELAY_MS = 300; // let the initial layout / chrome settle before capturing baseline
const MIN_PILL_DELTA = 18; // pill is ~20-30px; keyboard/rotation shifts are much larger
const MAX_PILL_DELTA = 34;

export function useInCallPill() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;
    let baseline = null;

    const captureBaseline = () => {
      baseline = viewport ? viewport.height : window.innerHeight;
    };
    const timer = setTimeout(captureBaseline, BASELINE_DELAY_MS);

    const onResize = () => {
      if (baseline == null) return;
      const current = viewport ? viewport.height : window.innerHeight;
      const shrink = baseline - current;
      const isPill = shrink >= MIN_PILL_DELTA && shrink <= MAX_PILL_DELTA;
      root.style.setProperty('--pill-offset', isPill ? '24px' : '0px');
    };

    const target = viewport || window;
    target.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      target.removeEventListener('resize', onResize);
      root.style.setProperty('--pill-offset', '0px');
    };
  }, []);
}
