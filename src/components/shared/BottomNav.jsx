import { F } from '../../styles/fonts';
import { NavSigil } from './Sigils';
import { buzz } from '../../lib/haptics';

export function BottomNav({ tab, onChange, parchment = false }) {
  const items = [
    { id: 'home', label: 'feed' },
    { id: 'communities', label: 'scenes' },
    { id: 'map', label: 'map' },
    { id: 'events', label: 'rites' },
    { id: 'fits', label: 'fits' },
    { id: 'profile', label: 'self' },
  ];

  const bgColor = parchment ? 'bg-[#EDE0C2]/95' : 'bg-[#0A0A0A]/95';
  const borderColor = parchment ? 'border-[#5B0F1A]/20' : 'border-[#1A1A1A]';
  const activeColor = parchment ? 'text-[#2A1808]' : 'text-[#F5F1E8]';
  const inactiveColor = parchment ? 'text-[#8B6B4A]' : 'text-[#6B6B6B]';

  return (
    <div className={`absolute bottom-0 inset-x-0 z-20 safe-pb ${bgColor} backdrop-blur-md border-t ${borderColor}`}>
      <div className="grid grid-cols-6 h-[68px]">
        {items.map(it => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => { buzz('nav'); onChange(it.id); }}
              className={`relative flex flex-col items-center justify-center gap-1 transition-colors ${active ? activeColor : inactiveColor}`}>
              <div className="relative">
                {active && <span className="absolute inset-0 -m-1.5 bg-[#8B0000]/20 blur-md rounded-full" />}
                <NavSigil name={it.id} size={19} className={`relative transition-opacity ${active ? 'opacity-100' : 'opacity-80'}`} />
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em]" style={F.ui}>{it.label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-[#8B0000]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
