import { ArrowLeft, Check, MapPin, Calendar, Users, Share2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EVENTS } from '../../data/events';

const ATTENDEE_POOL = [
  { handle: 'lilith_xiv', avatar: '🦇' },
  { handle: 'ash.in.october', avatar: '🕯' },
  { handle: 'mortis.kvlt', avatar: '☠' },
  { handle: 'vesper.exe', avatar: '✟' },
  { handle: 'cryptic.rose', avatar: '🌹' },
  { handle: 'blackvelvet_99', avatar: '🩸' },
  { handle: 'parish.nyc', avatar: '☩' },
];

function eventAttendees(event) {
  // Deterministic pool slice
  const n = Math.min(event.going, ATTENDEE_POOL.length);
  return ATTENDEE_POOL.slice(0, n);
}

const COVERS = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

export function EventDetail({ eventId, isGoing, onToggleRsvp, onBack, onOpenUser }) {
  const event = EVENTS.find(e => e.id === eventId);
  if (!event) return null;

  const cover = COVERS[event.cover] || COVERS.red;
  const attendees = eventAttendees(event);
  const goingCount = event.going + (isGoing ? 1 : 0);

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>RITE</div>
          <button className="text-[#A8A29E]" title="share"><Share2 size={16} /></button>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-44 overflow-hidden" style={{ background: cover }}>
        <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
          <path d="M 0 60 L 30 30 L 50 45 L 80 15 L 110 35 L 140 10 L 170 30 L 200 20 L 200 60 Z" fill="rgba(0,0,0,0.6)" />
        </svg>
        <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-wider text-[#F5F1E8]" style={F.ui}>
          {event.date}
        </div>
        <div className="absolute bottom-3 left-4 right-4">
          <h1 className="text-[#F5F1E8] text-2xl leading-tight" style={F.display}>{event.name.toUpperCase()}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="px-4 py-4 space-y-2 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={14} className="text-[#A89968]" />
          <span className="text-[#F5F1E8]" style={F.serif}>{event.venue}</span>
          <span className="text-[#6B6B6B]" style={F.ui}>· {event.neighborhood}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-[#A89968]" />
          <span className="text-[#A8A29E]" style={F.mono}>{event.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-[#A89968]" />
          <span className="text-[#A8A29E]" style={F.mono}>{goingCount} going</span>
        </div>
        <button onClick={() => onOpenUser && onOpenUser(event.host)}
          className="text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961]" style={F.ui}>
          · hosted by {event.host} ·
        </button>
      </div>

      {/* Tags */}
      <div className="px-4 py-3 border-b border-[#1A1A1A] flex flex-wrap gap-1.5">
        {event.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
        ))}
      </div>

      {/* Going list */}
      <div className="px-4 py-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-3" style={F.scriptureSC}>· souls going ·</div>
        <div className="flex flex-wrap gap-2">
          {isGoing && (
            <div className="flex items-center gap-1.5 px-2 py-1 border border-[#8B0000] bg-[#8B0000]/15">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs">⛧</div>
              <span className="text-[#F5F1E8] text-xs" style={F.ui}>you</span>
            </div>
          )}
          {attendees.map(a => (
            <button key={a.handle} onClick={() => onOpenUser && onOpenUser(a.handle)}
              className="flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] hover:border-[#3F3F3F]">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs">{a.avatar}</div>
              <span className="text-[#A8A29E] text-xs" style={F.ui}>{a.handle}</span>
            </button>
          ))}
          {event.going > attendees.length && (
            <div className="flex items-center px-2 py-1 border border-[#2A2A2A] text-[#6B6B6B] text-xs" style={F.mono}>
              +{event.going - attendees.length}
            </div>
          )}
        </div>
      </div>

      {/* RSVP CTA */}
      <div className="px-4 pt-4 sticky bottom-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pb-4">
        <button onClick={() => onToggleRsvp && onToggleRsvp(event.id)}
          className={`w-full py-3 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 ${isGoing ? 'bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#8B0000] text-[#F5F1E8] hover:bg-[#5B0F1A]'}`}
          style={F.ui}>
          {isGoing ? <><Check size={14} /> going</> : 'rsvp · i’m going'}
        </button>
      </div>
    </div>
  );
}
