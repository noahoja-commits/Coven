// Photographic horror assets (in /public/horror). These are real photos, processed
// heavily at render time (grayscale + contrast crush + grain + vignette) so they read
// like found-footage stills rather than stock photos. Sourced from Pexels & Unsplash —
// both free for commercial use, no attribution required, modification allowed. See
// public/horror/CREDITS.txt for the source list.
export const HORROR_SRC = {
  // photographs (Pexels/Unsplash)
  skull:  '/horror/skull.jpg',  // skull-painted face, glaring eyes — the lunge / slam
  mask:   '/horror/mask.jpg',   // dead leather skin-mask, hollow sockets — the loomer
  torn:   '/horror/torn.jpg',   // torn, rotting face — strikes
  wraith: '/horror/wraith.jpg', // clawed wraith lunging from the dark
  eyes:   '/horror/eyes.jpg',   // a pair of eyes in total black — subliminal / corner
  peer:   '/horror/peer.jpg',   // a face dissolving out of black — subliminal / lurker
  // generated (Canva) — gaunt faces emerging from pure black, already near-vignetted
  scream: '/horror/scream.jpg', // bald gaunt SCREAMING face out of black — the slam
  hollow: '/horror/hollow.jpg', // hollow-eyed dead stare emerging from black
  half:   '/horror/half.jpg',   // half a withered face, one bulging eye — half in the dark
  grin:   '/horror/grin.jpg',   // cracked face, a WRONG too-wide grin baring teeth — the loomer
  lunger: '/horror/lunger.jpg', // a clawed creature lunging at you, hands reaching — the slam
  // the most disturbing set — photoreal screaming ghouls + crouching figures (user-supplied)
  ghoulA:  '/horror/scream-a.jpg',  // cracked screaming ghoul, blood weeping — slam
  ghoulB:  '/horror/scream-b.jpg',  // cracked screaming ghoul, gaping mouth — slam
  ghoulFace:'/horror/ghoulface.jpg',// skull-faced ghoul, sigil brow, blood drip — slam
  crouchA: '/horror/crouch-a.jpg',  // skeletal thing crouching in a black doorway — lurker
  crouchB: '/horror/crouch-b.jpg',  // pale figure crouched in the dark, watching — lurker
  forest:  '/horror/forest.jpg',    // a pale figure in the trees, found-footage — subliminal
};

// the GHOUL video — the moving centrepiece of the paralysis scare (autoplay/muted/loop)
export const GHOUL_VIDEO = '/horror/ghoul.mp4';

// the faces that work full-bleed as a lunge/jumpscare (photoreal ghouls first — they hit hardest)
export const SCARE_FACES = [HORROR_SRC.ghoulFace, HORROR_SRC.ghoulA, HORROR_SRC.ghoulB, HORROR_SRC.lunger, HORROR_SRC.scream, HORROR_SRC.grin, HORROR_SRC.skull, HORROR_SRC.half, HORROR_SRC.wraith, HORROR_SRC.torn];
// the quieter "it's watching from the corner" set (crouching figures lurk best)
export const LURK_FACES = [HORROR_SRC.crouchA, HORROR_SRC.crouchB, HORROR_SRC.forest, HORROR_SRC.hollow, HORROR_SRC.mask, HORROR_SRC.grin, HORROR_SRC.peer];

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
