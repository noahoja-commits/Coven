import { useState, useMemo } from 'react';
import { Check, Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';

export function EventsScreen({ events = [], rsvp = {}, onToggleRsvp, onOpenEvent, onCreateEvent }) {
  const allTags = useMemo(() => {
    const s = new Set();
    events.forEach(e => (e.tags || []).forEach(t => s.add(t)));
    return ['all', ...Array.from(s)];
  }, [events]);
  const [activeTag, setActiveTag] = useState('all');

  const filtered = activeTag === 'all' ? events : events.filter(e => (e.tags || []).includes(activeTag));

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>RITES</h2>
          <p className="text-[#A8A29E] text-sm" style={F.serif}>what's coming. who's going.</p>
        </div>
        <button onClick={onCreateEvent} className="btn btn-primary">
          <Plus size={13} /> host
        </button>
      </div>

      {allTags.length > 1 && (
        <div className="px-4 pb-4 flex gap-1.5 overflow-x-auto no-scrollbar">
          {allTags.map(t => (
            <button key={t}
              onClick={() => setActiveTag(t)}
              className={`tap shrink-0 chip ${activeTag === t ? 'chip-gold' : 'hover:border-[#3F3F3F]'}`}
              style={F.ui}>{t}</button>
          ))}
        </div>
      )}

      <div className="px-4 space-y-3">
        {events.length === 0 && (
          <EmptyState glyph="◈" text="no rites yet." action="host the first one" onAction={onCreateEvent} />
        )}
        {events.length > 0 && filtered.length === 0 && (
          <div className="text-center py-8 text-[#6B6B6B] text-xs" style={F.mono}>
            no rites for "{activeTag}"
          </div>
        )}
        {filtered.map(e => {
          const cover = {
            red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
            violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
            black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
          }[e.cover] || 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)';
          return (
            <div key={e.id} role="button" tabIndex={0}
              onClick={() => onOpenEvent && onOpenEvent(e.id)}
              onKeyDown={(ev) => { if (ev.key === 'Enter') onOpenEvent && onOpenEvent(e.id); }}
              className="tap block w-full text-left border border-[#1C1A1A] overflow-hidden hover:border-[#3F3F3F] transition-colors cursor-pointer">
              <div className="relative h-32 overflow-hidden" style={{ background: cover }}>
                <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
                  <path d="M 0 60 L 30 30 L 50 45 L 80 15 L 110 35 L 140 10 L 170 30 L 200 20 L 200 60 Z" fill="rgba(0,0,0,0.6)" />
                </svg>
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-wider text-[#F5F1E8]" style={F.ui}>{e.date}</div>
                {(e.ageRestriction === '18' || e.ageRestriction === '21') && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-[#8B0000]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider text-[#F5F1E8]" style={F.ui}>{e.ageRestriction}+</div>
                )}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-[#F5F1E8] text-xl leading-tight" style={F.display}>{e.name.toUpperCase()}</h3>
                </div>
              </div>
              <div className="p-3 bg-[#0F0F0F]">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.serif}>{e.venue || e.host}</div>
                    <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{e.neighborhood}{e.neighborhood && e.time ? ' · ' : ''}<span style={F.mono} className="text-xs">{e.time}</span></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[#F5F1E8] text-base" style={F.mono}>{e.going + (rsvp[e.id] ? 1 : 0)}</div>
                    <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>going</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {(e.tags || []).map(t => (
                    <span key={t} className="chip" style={F.ui}>{t}</span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(ev) => { ev.stopPropagation(); onToggleRsvp && onToggleRsvp(e.id); }}
                  className={`btn w-full mt-3 ${rsvp[e.id] ? 'btn-primary' : 'btn-ghost'}`}>
                  {rsvp[e.id] ? <><Check size={12} /> going</> : 'rsvp'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
