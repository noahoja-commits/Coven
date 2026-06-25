// Retry a flaky async fn a couple times before giving up — so one transient network blip
// doesn't silently lose data the user expected to see. Backs off slightly between tries.
export async function withRetry(fn, { tries = 2, delay = 400 } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((r) => setTimeout(r, delay * (i + 1)));
    }
  }
  throw lastErr;
}
