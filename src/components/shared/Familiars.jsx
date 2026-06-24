// Hand-drawn familiar art — a refined seated black cat and the little demon it becomes.
// Both share the SAME seated silhouette (bell haunches + round head) so the transform reads as
// one creature changing: the cat's pointed ears become curved horns, bat wings + a spaded tail
// unfurl, and the eyes kindle from gold to ember-red. Silhouette-style with rim light + glowing
// eyes so they read as real little creatures at small size, not emoji.

// Shared seated body — bell-shaped haunches tapering to a round head. Drawn on a 40×44 grid.
function SeatedBody({ fill, rim }) {
  return (
    <>
      {/* haunches: a soft bell, wide seated base narrowing to the shoulders */}
      <path d="M14 20 C10.5 26 9 32 9.2 37 C9.3 40 11 41.5 14 41.5 L26 41.5 C29 41.5 30.7 40 30.8 37 C31 32 29.5 26 26 20 Z"
        fill={fill} stroke={rim} strokeWidth="0.5" />
      {/* front paws peeking under the base */}
      <ellipse cx="15.5" cy="41" rx="2.4" ry="1.5" fill={fill} stroke={rim} strokeWidth="0.4" />
      <ellipse cx="24.5" cy="41" rx="2.4" ry="1.5" fill={fill} stroke={rim} strokeWidth="0.4" />
      {/* head: a clean round skull seated on the shoulders */}
      <circle cx="20" cy="15" r="7.6" fill={fill} stroke={rim} strokeWidth="0.5" />
    </>
  );
}

export function CatFamiliar({ size = 30, glow = false, className = '', style }) {
  return (
    <svg width={size} height={(size * 44) / 40} viewBox="0 0 40 44" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26262b" />
          <stop offset="0.45" stopColor="#101013" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
      </defs>
      {/* tail — a long sweep curling around the right of the base */}
      <path d="M28 39 C39 39 40 24 30.5 22 C36.5 25 35 34 27 33.5 Z" fill="url(#catBody)" stroke="#1a1a1f" strokeWidth="0.4" strokeLinejoin="round" />
      {/* pointed triangular ears */}
      <path d="M12.5 11 L13.6 1.6 L19 8.5 Z" fill="url(#catBody)" stroke="#26262c" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M27.5 11 L26.4 1.6 L21 8.5 Z" fill="url(#catBody)" stroke="#26262c" strokeWidth="0.4" strokeLinejoin="round" />
      {/* inner-ear hollow */}
      <path d="M14 8 L14.7 3.5 L17.4 8 Z" fill="#000" opacity="0.55" />
      <path d="M26 8 L25.3 3.5 L22.6 8 Z" fill="#000" opacity="0.55" />
      <SeatedBody fill="url(#catBody)" rim="#26262c" />
      {/* glowing almond eyes with slit pupils */}
      <g style={glow ? { filter: 'drop-shadow(0 0 2.5px rgba(201,169,97,0.95))' } : undefined}>
        <path d="M13.6 15.4 Q16.4 13.4 18.4 15.6 Q16.2 17 13.6 15.4 Z" fill="#C9A961" />
        <path d="M26.4 15.4 Q23.6 13.4 21.6 15.6 Q23.8 17 26.4 15.4 Z" fill="#C9A961" />
        <ellipse cx="16" cy="15.4" rx="0.6" ry="1.9" fill="#160c02" />
        <ellipse cx="24" cy="15.4" rx="0.6" ry="1.9" fill="#160c02" />
      </g>
      {/* muzzle: nose + soft mouth */}
      <path d="M20 18.2 l-1.3 1.1 h2.6 Z" fill="#caa37a" opacity="0.8" />
      <path d="M20 19.3 q-1.4 1.3 -2.7 0.4 M20 19.3 q1.4 1.3 2.7 0.4" stroke="#000" strokeWidth="0.4" fill="none" opacity="0.5" />
      {/* whiskers */}
      <g stroke="#9a948c" strokeWidth="0.3" opacity="0.45" strokeLinecap="round">
        <path d="M18 18.6 L11.5 17.8 M18 19.3 L11.8 19.8" />
        <path d="M22 18.6 L28.5 17.8 M22 19.3 L28.2 19.8" />
      </g>
    </svg>
  );
}

export function DemonFamiliar({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={(size * 44) / 40} viewBox="0 0 40 44" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="demonBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a121a" />
          <stop offset="0.45" stopColor="#1a070c" />
          <stop offset="1" stopColor="#080205" />
        </linearGradient>
        <radialGradient id="demonEye" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff6a52" />
          <stop offset="0.5" stopColor="#C8102E" />
          <stop offset="1" stopColor="#5b0f1a" />
        </radialGradient>
      </defs>
      {/* bat wings, spread behind the body with scalloped membranes */}
      <path d="M15 21 C7 14 1.5 14 1 20 C3.3 18.6 5 19.4 6 22 C3.4 21.4 2.2 22.8 2.6 26 C5.4 23.6 7.4 24.2 9 27 C7.2 23.2 9.4 21 13 20.4 Z"
        fill="url(#demonBody)" stroke="#4a121c" strokeWidth="0.5" strokeLinejoin="round" />
      <path d="M25 21 C33 14 38.5 14 39 20 C36.7 18.6 35 19.4 34 22 C36.6 21.4 37.8 22.8 37.4 26 C34.6 23.6 32.6 24.2 31 27 C32.8 23.2 30.6 21 27 20.4 Z"
        fill="url(#demonBody)" stroke="#4a121c" strokeWidth="0.5" strokeLinejoin="round" />
      {/* curved horns rising where the cat's ears were */}
      <path d="M13.8 10 C10 6.5 10 2.5 12.8 1.4 C11.6 3.6 12.4 5.8 16 8.2 Z" fill="#2a0c11" stroke="#4a121c" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M26.2 10 C30 6.5 30 2.5 27.2 1.4 C28.4 3.6 27.6 5.8 24 8.2 Z" fill="#2a0c11" stroke="#4a121c" strokeWidth="0.4" strokeLinejoin="round" />
      {/* spaded tail curling around the right of the base */}
      <path d="M28 38 C37 39 38.5 27 31 24.5 C36 27 34.5 35 27.5 33.5 Z" fill="url(#demonBody)" stroke="#4a121c" strokeWidth="0.4" strokeLinejoin="round" />
      <path d="M30 22 l3.4 -2 l-0.2 3.8 l-3.1 0.3 Z" fill="#2a0c11" stroke="#4a121c" strokeWidth="0.3" strokeLinejoin="round" />
      <SeatedBody fill="url(#demonBody)" rim="#4a121c" />
      {/* heavy brow casting the eyes into a glare */}
      <path d="M13.4 13.6 L18.4 15.4 M26.6 13.6 L21.6 15.4" stroke="#4a121c" strokeWidth="0.9" strokeLinecap="round" />
      {/* glowing ember eyes */}
      <g style={{ filter: 'drop-shadow(0 0 3px rgba(200,16,46,0.95))' }}>
        <path d="M13.8 16 Q16.4 13.9 18.6 16.2 Q16.2 17.7 13.8 16 Z" fill="url(#demonEye)" />
        <path d="M26.2 16 Q23.6 13.9 21.4 16.2 Q23.8 17.7 26.2 16 Z" fill="url(#demonEye)" />
        <ellipse cx="16.1" cy="15.9" rx="0.5" ry="1.6" fill="#1a0205" />
        <ellipse cx="23.9" cy="15.9" rx="0.5" ry="1.6" fill="#1a0205" />
      </g>
      {/* fanged grin */}
      <path d="M16.5 19.4 Q20 22.4 23.5 19.4" stroke="#1a0205" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M17.6 19.9 l0.7 1.7 l0.7 -1.5 Z M22.4 19.9 l-0.7 1.7 l-0.7 -1.5 Z" fill="#e8dcc4" />
    </svg>
  );
}
