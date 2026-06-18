import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { MAP_PINS, PIN_KIND } from '../../data/map';
import { EVENTS } from '../../data/events';

export function MapScreen({ events = EVENTS, rsvp = {}, onToggleRsvp, tonightStatus, onOpenTonightStatus }) {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? MAP_PINS : MAP_PINS.filter(p => p.kind === filter);
  const activePin = MAP_PINS.find(p => p.id === active);
  // Find an event matching the active pin by name
  const matchedEvent = activePin && events.find(e => e.name.toLowerCase() === activePin.name.toLowerCase());

  return (
    <div className="absolute inset-0 top-[60px] bottom-[68px]">
      <div className="absolute inset-0 overflow-hidden bg-[#070708]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#161618" strokeWidth="0.15" />
            </pattern>
            <radialGradient id="mapBg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#0F0F12" />
              <stop offset="100%" stopColor="#050506" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#mapBg)" />
          <rect width="100" height="100" fill="url(#grid)" />
          <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#0A0E14" strokeWidth="6" fill="none" opacity="0.9" />
          <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#1A1F2E" strokeWidth="0.3" fill="none" opacity="0.5" />
          <rect x="55" y="20" width="14" height="10" fill="#0E1410" opacity="0.8" />
          <rect x="20" y="65" width="10" height="12" fill="#0E1410" opacity="0.8" />
          <rect x="75" y="40" width="8" height="6" fill="#0E1410" opacity="0.8" />
          <line x1="0" y1="50" x2="100" y2="55" stroke="#15151A" strokeWidth="0.4" />
          <line x1="50" y1="0" x2="48" y2="100" stroke="#15151A" strokeWidth="0.4" />
          <line x1="0" y1="80" x2="100" y2="78" stroke="#15151A" strokeWidth="0.3" />
        </svg>

        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.3\'/></svg>")' }} />

        {filtered.map(p => {
          const k = PIN_KIND[p.kind];
          if (!k) return null;
          return (
            <button key={p.id}
              onClick={() => setActive(p.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <span className="absolute inset-0 -m-2 rounded-full opacity-50 animate-ping-slow"
                style={{ background: k.color }} />
              <span className="relative flex items-center justify-center w-7 h-7 rounded-full text-[#F5F1E8] text-sm shadow-lg"
                style={{ background: k.color, boxShadow: `0 0 12px ${k.color}` }}>
                {k.emoji}
              </span>
            </button>
          );
        })}
      </div>

      <div className="absolute top-3 left-3 right-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'all' },
          { id: 'party', label: 'parties' },
          { id: 'gig', label: 'shows' },
          { id: 'smoke', label: 'smoke' },
          { id: 'bar', label: 'bars' },
          { id: 'fashion', label: 'fits' },
          { id: 'prayer', label: 'prayers' },
          { id: 'ritual', label: 'rituals' },
          { id: 'shop', label: 'shops' },
          { id: 'tattoo', label: 'tattoo' },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider backdrop-blur-md transition-colors
              ${filter === t.id ? 'bg-[#8B0000] text-[#F5F1E8] border border-[#8B0000]' : 'bg-black/60 text-[#A8A29E] border border-[#2A2A2A]'}`}
            style={F.ui}>{t.label}</button>
        ))}
      </div>

      <button onClick={onOpenTonightStatus}
        className="absolute bottom-4 right-4 w-12 h-12 bg-[#8B0000] text-[#F5F1E8] flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 0 20px rgba(139,0,0,0.5)' }}
        title="drop your tonight pin">
        <Plus size={20} />
      </button>

      <button onClick={onOpenTonightStatus} className="absolute" style={{ left: '48%', top: '52%' }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 -m-3 rounded-full bg-[#7B2CBF] opacity-30 animate-ping-slow" />
          <span className="relative block w-3 h-3 rounded-full bg-[#7B2CBF] ring-2 ring-[#0A0A0A]" />
          {tonightStatus?.text && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 bg-black/80 backdrop-blur-sm border border-[#7B2CBF]/40 text-[10px] text-[#F5F1E8]" style={F.ui}>
              you · {tonightStatus.text.slice(0, 24)}
            </div>
          )}
        </div>
      </button>

      {activePin && (
        <div className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] border-t border-[#2A2A2A] p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
              style={{ background: PIN_KIND[activePin.kind].color, boxShadow: `0 0 12px ${PIN_KIND[activePin.kind].color}` }}>
              {PIN_KIND[activePin.kind].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ ...F.ui, color: PIN_KIND[activePin.kind].color }}>
                {PIN_KIND[activePin.kind].label}
              </div>
              <h3 className="text-[#F5F1E8] text-base leading-tight" style={F.display}>{activePin.name.toUpperCase()}</h3>
              <p className="text-[#A8A29E] text-xs mt-0.5" style={F.mono}>{activePin.meta}</p>
            </div>
            <button onClick={() => setActive(null)} className="text-[#6B6B6B] -mt-1"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="py-2 border border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider" style={F.ui}>directions</button>
            <button
              onClick={() => matchedEvent && onToggleRsvp && onToggleRsvp(matchedEvent.id)}
              disabled={!matchedEvent}
              className={`py-2 text-xs uppercase tracking-wider ${matchedEvent && rsvp[matchedEvent.id] ? 'bg-[#5B0F1A] text-[#F5F1E8]' : matchedEvent ? 'bg-[#8B0000] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              {matchedEvent && rsvp[matchedEvent.id] ? 'going ✓' : matchedEvent ? "i'm going" : 'pinned'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
