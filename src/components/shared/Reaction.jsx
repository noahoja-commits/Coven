import { useState } from 'react';
import { F } from '../../styles/fonts';
import { buzz } from '../../lib/haptics';

export function Reaction({ icon, count, onClick, active }) {
  const [animate, setAnimate] = useState(false);
  const handle = () => {
    buzz('react');
    setAnimate(true);
    setTimeout(() => setAnimate(false), 600);
    onClick && onClick();
  };
  return (
    <button onClick={handle}
      className={`flex items-center gap-1 px-2 py-1 transition-colors ${active ? 'text-[#F5F1E8]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}>
      <span className={`text-sm leading-none ${animate ? 'flutter' : ''}`}>{icon}</span>
      <span className="text-xs" style={F.mono}>{count}</span>
    </button>
  );
}
