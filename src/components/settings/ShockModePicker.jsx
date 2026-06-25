import { X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SHOCK_MODES } from '../shared/ShockOverlay';

// Tiny representative swatch per mode (just the picker thumbnail — the real effect is full-screen).
const SWATCH = {
  none: 'linear-gradient(135deg, #1A0408, #0A0204)',
  insomnia: 'linear-gradient(135deg, #2748ff, #0a1478)',
  'dead-channel': 'repeating-linear-gradient(to bottom, #E8E8E8 0 1px, #0A0A0A 1px 3px)',
  emergency: 'radial-gradient(circle at 50% 50%, #0A1420, #050810), repeating-radial-gradient(#9fb4d4 0 0.5px, transparent 1px 6px)',
  spatter: 'radial-gradient(circle at 30% 20%, #780000 0 18%, transparent 30%), #1A0408',
  scream: 'radial-gradient(ellipse at center, #1A0408 30%, #9E2A33)',
  glitch: 'linear-gradient(180deg, #9E2A33 0 20%, #00c8c8 40% 45%, #5E3B73 70% 78%, #0A0204)',
  inferno: 'radial-gradient(ellipse at 50% 120%, #ff5a00, #9E2A33 45%, #0A0204 75%)',
  void: 'radial-gradient(ellipse at center, #1A0408 4%, #000 70%)',
  cathedral: 'repeating-linear-gradient(72deg, transparent 0 6px, rgba(201,169,97,0.4) 6px 8px, transparent 8px 14px), #0A0204',
  rebirth: 'linear-gradient(135deg, #9E2A33 0 12%, #0A0204 12%)',
  requiem: 'linear-gradient(180deg, #fff 0 50%, #000 50%)',
  mist: 'linear-gradient(160deg, #e1cda5, #6b5a3c)',
  reliquary: 'radial-gradient(ellipse at 50% 30%, #2a2a30, #0A0A0A), repeating-radial-gradient(#d6cfc0 0 0.5px, transparent 1px 7px)',
  alchemy: 'radial-gradient(circle at 50% 50%, #14141a, #050508), repeating-radial-gradient(#bcb4a2 0 0.4px, transparent 1px 9px)',
  keepsake: 'radial-gradient(ellipse at 50% 120%, #ffb14a 0 8%, #6b5a3c 30%, #1a1208 80%)',
  xerox: 'repeating-linear-gradient(91deg, #0A0A0A 0 1px, #E8E8E8 1px 4px)',
  duotone: 'linear-gradient(135deg, #2748ff, #0a1478), repeating-radial-gradient(rgba(255,255,255,0.5) 0 1px, transparent 2px 7px)',
  vow: 'radial-gradient(ellipse at 50% 30%, #2a2228, #060406 75%), linear-gradient(0deg, #8B0000 0 2%, transparent 2%)',
};

// Live mode picker — translucent so the effect plays behind it while you try modes.
// Secret modes stay hidden until they've been discovered (then they appear here, unlocked).
export function ShockModePicker({ current = 'none', unlocked = [], onPick, onClose }) {
  // Transient modes (e.g. paralysis) are NOT selectable themes — they only play as timed scares.
  const modes = SHOCK_MODES.filter(m => !m.transient && (!m.secret || unlocked.includes(m.id)));
  return (
    <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between px-4 h-[60px] safe-pt">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33]" style={F.scriptureSC}>· how the dark manifests ·</div>
          <h2 className="text-[#F5F1E8] text-xl leading-none mt-0.5" style={F.displayOrnate}>SHOCK MODE</h2>
        </div>
        <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={22} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-6 safe-pb">
        <p className="text-[10px] text-[#6B6B6B] italic px-1 pb-3" style={F.serif}>tap a mode to feel it live · this menu stays open so you can flip between them.</p>
        <div className="grid grid-cols-2 gap-2.5">
          {modes.map(m => {
            const active = current === m.id;
            return (
              <button key={m.id} onClick={() => onPick && onPick(m.id)}
                className={`relative text-left border overflow-hidden transition-all ${active ? 'border-[#9E2A33]' : 'border-[#2A2A2A] hover:border-[#5B0F1A]'}`}>
                <div className="h-16 w-full" style={{ background: SWATCH[m.id] || SWATCH.none, backgroundSize: m.id === 'emergency' ? 'cover, 6px 6px' : undefined }} />
                <div className="px-2.5 py-2">
                  <div className={`text-sm leading-none ${active ? 'text-[#9E2A33]' : 'text-[#F5F1E8]'}`} style={F.displayOrnate}>{m.label}</div>
                  <div className="text-[9px] uppercase tracking-wider text-[#6B6B6B] mt-1" style={F.ui}>{m.desc}</div>
                </div>
                {active && <span className="absolute top-1.5 right-1.5 text-[#9E2A33] text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
