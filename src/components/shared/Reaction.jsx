import { useState } from 'react';
import { F } from '../../styles/fonts';
import { buzz } from '../../lib/haptics';

export function Reaction({ icon, glyph: Glyph, count, onClick, active }) {
  const [animate, setAnimate] = useState(false);
  const handle = () => {
    buzz('react');
    setAnimate(true);
    setTimeout(() => setAnimate(false), 600);
    onClick && onClick();
  };
  return (
    <button onClick={handle}
      className={`flex items-center gap-1 px-2 py-1 transition-colors ${active ? 'text-[#9E2A33] drop-shadow-[0_0_3px_rgba(158,42,51,0.3)]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}>
      <span className={`leading-none flex items-center ${animate ? 'flutter' : ''}`}>
        {Glyph ? <Glyph width={15} height={15} /> : <span className="text-sm">{icon}</span>}
      </span>
      <span className="text-xs" style={F.mono}>{count}</span>
    </button>
  );
}
