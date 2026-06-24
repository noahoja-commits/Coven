// Hand-drawn familiar art — a refined seated black cat and a little winged horned demon.
// Silhouette-style with rim light + glowing eyes so they read as real creatures at small size,
// not emoji. Both face the same way and share proportions so the transform feels crafted.

export function CatFamiliar({ size = 30, glow = false, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="catBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1c20" />
          <stop offset="0.5" stopColor="#0d0d10" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
      </defs>
      {/* tail — sweeping curl along the right */}
      <path d="M26 33 C36 33 37 21 30 18 C34 20 33 28 26 29 Z" fill="url(#catBody)" stroke="#000" strokeWidth="0.4" />
      {/* seated body + head + ears as one silhouette */}
      <path d="M20 39 C10 39 7.5 31 9.5 24 C8 19.5 8.5 13.5 12 11 L9.5 3.5 C9.2 2.4 10.2 2 11 2.7 L16 7 C17.2 6.4 18.5 6.1 20 6.1 C21.5 6.1 22.8 6.4 24 7 L29 2.7 C29.8 2 30.8 2.4 30.5 3.5 L28 11 C31.5 13.5 32 19.5 30.5 24 C32.5 31 30 39 20 39 Z"
        fill="url(#catBody)" stroke="#26262c" strokeWidth="0.5" />
      {/* inner-ear shadow */}
      <path d="M12 4.5 L13.5 9 L15.5 7.2 Z M28 4.5 L26.5 9 L24.5 7.2 Z" fill="#000" opacity="0.5" />
      {/* glowing eyes */}
      <g style={glow ? { filter: 'drop-shadow(0 0 2px rgba(201,169,97,0.9))' } : undefined}>
        <ellipse cx="16" cy="16.5" rx="1.7" ry="2.6" fill="#C9A961" />
        <ellipse cx="24" cy="16.5" rx="1.7" ry="2.6" fill="#C9A961" />
        <ellipse cx="16" cy="16.5" rx="0.55" ry="2.2" fill="#1a0e02" />
        <ellipse cx="24" cy="16.5" rx="0.55" ry="2.2" fill="#1a0e02" />
      </g>
      {/* nose + whisker hint */}
      <path d="M20 20.5 l-1.4 1.2 h2.8 Z" fill="#2a1014" />
    </svg>
  );
}

export function DemonFamiliar({ size = 32, className = '', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 42" className={className} style={style} aria-hidden>
      <defs>
        <linearGradient id="demonBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0d12" />
          <stop offset="0.5" stopColor="#140509" />
          <stop offset="1" stopColor="#080205" />
        </linearGradient>
        <radialGradient id="demonEye" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff5a4a" />
          <stop offset="0.5" stopColor="#C8102E" />
          <stop offset="1" stopColor="#5b0f1a" />
        </radialGradient>
      </defs>
      {/* bat wings, behind */}
      <path d="M14 17 C5 11 1 12 2 19 C4 17 6 18 7 21 C4 20 3 22 4 26 C7 23 9 24 11 27 C9 22 11 19 14 18 Z"
        fill="url(#demonBody)" stroke="#3a0f16" strokeWidth="0.5" />
      <path d="M26 17 C35 11 39 12 38 19 C36 17 34 18 33 21 C36 20 37 22 36 26 C33 23 31 24 29 27 C31 22 29 19 26 18 Z"
        fill="url(#demonBody)" stroke="#3a0f16" strokeWidth="0.5" />
      {/* horns */}
      <path d="M14.5 9 C11 5 11.5 1.5 14 1 C12.8 2.6 13.4 4.6 16 6.5 Z" fill="#1a0a0c" stroke="#3a0f16" strokeWidth="0.4" />
      <path d="M25.5 9 C29 5 28.5 1.5 26 1 C27.2 2.6 26.6 4.6 24 6.5 Z" fill="#1a0a0c" stroke="#3a0f16" strokeWidth="0.4" />
      {/* tail with spade tip */}
      <path d="M24 33 C32 36 33 28 28 26 C31 28 30 32 25 31 Z" fill="url(#demonBody)" />
      <path d="M27.5 24.5 l3 -2.5 l-0.4 3.4 l-2.6 0.6 Z" fill="#1a0a0c" />
      {/* head + lean body + legs */}
      <path d="M20 40 C14 40 12 35 13 31 C10.5 28 10.5 23 13 21 C11.5 18 12 13 16 11 C17 9.5 18.4 9 20 9 C21.6 9 23 9.5 24 11 C28 13 28.5 18 27 21 C29.5 23 29.5 28 27 31 C28 35 26 40 20 40 Z M16 38 L17 41.5 M24 38 L23 41.5"
        fill="url(#demonBody)" stroke="#3a0f16" strokeWidth="0.6" strokeLinejoin="round" />
      {/* clawed feet hint */}
      <path d="M15 39.5 l-1.4 1.6 m1.8 -1.6 l0.2 2 M25 39.5 l1.4 1.6 m-1.8 -1.6 l-0.2 2" stroke="#1a0a0c" strokeWidth="0.9" strokeLinecap="round" />
      {/* glowing eyes + a wicked brow */}
      <path d="M14.5 16 L18 17.5 M25.5 16 L22 17.5" stroke="#3a0f16" strokeWidth="0.8" strokeLinecap="round" />
      <ellipse cx="16.6" cy="18.4" rx="1.7" ry="1.5" fill="url(#demonEye)" style={{ filter: 'drop-shadow(0 0 2.5px rgba(200,16,46,0.95))' }} />
      <ellipse cx="23.4" cy="18.4" rx="1.7" ry="1.5" fill="url(#demonEye)" style={{ filter: 'drop-shadow(0 0 2.5px rgba(200,16,46,0.95))' }} />
      <ellipse cx="16.6" cy="18.4" rx="0.4" ry="1.2" fill="#1a0205" />
      <ellipse cx="23.4" cy="18.4" rx="0.4" ry="1.2" fill="#1a0205" />
      {/* fanged grin */}
      <path d="M17.5 23 q2.5 2 5 0 M18 23 l0.5 1.6 l0.6 -1.4 M22 23 l-0.5 1.6 l-0.6 -1.4" stroke="#1a0205" strokeWidth="0.7" fill="#d8c9b0" strokeLinejoin="round" />
    </svg>
  );
}
