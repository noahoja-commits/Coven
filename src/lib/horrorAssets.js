// Photographic horror assets (in /public/horror). These are real photos, processed
// heavily at render time (grayscale + contrast crush + grain + vignette) so they read
// like found-footage stills rather than stock photos. Sourced from Pexels & Unsplash —
// both free for commercial use, no attribution required, modification allowed. See
// public/horror/CREDITS.txt for the source list.
export const HORROR_SRC = {
  skull:  '/horror/skull.jpg',  // skull-painted face, glaring eyes — the lunge / slam
  mask:   '/horror/mask.jpg',   // dead leather skin-mask, hollow sockets — the loomer
  torn:   '/horror/torn.jpg',   // torn, rotting face — strikes
  wraith: '/horror/wraith.jpg', // clawed wraith lunging from the dark
  eyes:   '/horror/eyes.jpg',   // a pair of eyes in total black — subliminal / corner
  peer:   '/horror/peer.jpg',   // a face dissolving out of black — subliminal / lurker
};

// the faces that work full-bleed as a lunge/jumpscare
export const SCARE_FACES = [HORROR_SRC.skull, HORROR_SRC.wraith, HORROR_SRC.torn];
// the quieter "it's watching from the corner" set
export const LURK_FACES = [HORROR_SRC.mask, HORROR_SRC.peer, HORROR_SRC.torn];

let primed = false;
// Warm the browser cache on the arming gesture so a jumpscare never flashes a blank
// frame while the JPEG loads. Safe to call repeatedly.
export function preloadHorrorImages() {
  if (primed || typeof Image === 'undefined') return;
  primed = true;
  for (const src of Object.values(HORROR_SRC)) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }
}

export function pick(list, seed) {
  const i = Math.abs(Math.floor(seed)) % list.length;
  return list[i];
}
