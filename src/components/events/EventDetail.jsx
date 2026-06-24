import { useState } from 'react';
import { ArrowLeft, Check, MapPin, Calendar, Users, Share2, Ticket } from 'lucide-react';
import { F } from '../../styles/fonts';
import { shareCoven } from '../../lib/share';
import { downloadICS } from '../../lib/ics';
import { EventInviteCard } from './EventInviteCard';
import { SectionLabel } from '../shared/SectionLabel';

const COVERS = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

export function EventDetail({ event, isGoing, onToggleRsvp, onBack, onOpenUser, attendees = [], meHandle, onBuy, onManageTickets, onDelete, waitlist = { count: 0, mine: false }, onJoinWaitlist, onLeaveWaitlist, recaps = [], onStartRecap, onOpenRecap }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!event) return null;

  const isPast = !!event.dateRaw && new Date(event.dateRaw) < new Date();

  const cover = COVERS[event.cover] || COVERS.red;
  const others = attendees.filter(a => a.handle && a.handle !== meHandle);
  const goingCount = (event.going || 0) + (isGoing ? 1 : 0);
  const shown = others.slice(0, 12);
  const overflow = Math.max(0, goingCount - shown.length - (isGoing ? 1 : 0));
  const paid = event.ticketed && event.priceCents > 0;
  const soldOut = paid && event.capacity != null && event.sold >= event.capacity;
  const priceLabel = `$${(event.priceCents / 100) % 1 === 0 ? (event.priceCents / 100).toFixed(0) : (event.priceCents / 100).toFixed(2)}`;

  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>RITE</div>
          <div className="flex items-center gap-1">
            <button onClick={() => downloadICS(event)}
              className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="add to calendar"><Calendar size={18} /></button>
            <button onClick={() => shareCoven({ title: event.name, text: `${event.name} · ${event.date} on Coven`, path: `?event=${event.id}` })}
              className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors" title="share this rite"><Share2 size={18} /></button>
          </div>
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
        {(event.venue || event.neighborhood) && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-[#C8102E]" />
            {event.venue && <span className="text-[#F5F1E8]" style={F.serif}>{event.venue}</span>}
            {event.neighborhood && <span className="text-[#6B6B6B]" style={F.ui}>· {event.neighborhood}</span>}
          </div>
        )}
        {event.time && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-[#C8102E]" />
            <span className="text-[#A8A29E]" style={F.mono}>{event.time}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <Users size={14} className="text-[#C8102E]" />
          <span className="text-[#A8A29E]" style={F.mono}>{goingCount} going</span>
        </div>
        <button onClick={() => onOpenUser && onOpenUser(event.host)}
          className="tap text-[10px] uppercase tracking-wider text-[#C8102E] hover:text-[#C9A961]" style={F.ui}>
          · hosted by {event.host} ·
        </button>
      </div>

      {/* Description */}
      {event.description && (
        <div className="px-4 py-4 border-b border-[#1A1A1A]">
          <p className="text-[#A8A29E] text-sm leading-relaxed whitespace-pre-wrap" style={F.serif}>{event.description}</p>
        </div>
      )}

      {/* Tags */}
      {event.tags.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex flex-wrap gap-1.5">
          {event.tags.map(t => (
            <span key={t} className="chip">{t}</span>
          ))}
        </div>
      )}

      {/* Going list */}
      <div className="px-4 py-4 border-b border-[#1A1A1A]">
        <SectionLabel className="mb-3">souls going</SectionLabel>
        {goingCount === 0 ? (
          <p className="text-[#6B6B6B] text-xs italic" style={F.serif}>· no one yet — be the first ·</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {isGoing && (
              <div className="flex items-center gap-1.5 px-2 py-1 border border-[#8B0000] bg-[#8B0000]/15">
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs">⛧</div>
                <span className="text-[#F5F1E8] text-xs" style={F.ui}>you</span>
              </div>
            )}
            {shown.map(a => (
              <button key={a.handle} onClick={() => onOpenUser && onOpenUser(a.handle)}
                className={`tap flex items-center gap-1.5 px-2 py-1 border transition-colors ${a.isMutual ? 'border-[#C9A961]/60 bg-[#C9A961]/5' : 'border-[#2A2A2A] hover:border-[#3F3F3F]'}`}>
                <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xs">{a.avatar}</div>
                <span className={`text-xs ${a.isMutual ? 'text-[#F5F1E8]' : 'text-[#A8A29E]'}`} style={F.ui}>{a.handle}</span>
                {a.isMutual && <span className="text-[#C9A961] text-[10px] leading-none" title="mutual — you follow each other">★</span>}
              </button>
            ))}
            {overflow > 0 && (
              <div className="flex items-center px-2 py-1 border border-[#2A2A2A] text-[#6B6B6B] text-xs" style={F.mono}>+{overflow}</div>
            )}
          </div>
        )}
      </div>

      <EventInviteCard event={event} goingCount={goingCount} />

      {/* Recap thread — after the rite, collect photos + words */}
      {isPast && (
        <div className="px-4 pt-2">
          <SectionLabel rule={false} className="mb-2 justify-between" action={meHandle && (
            <button onClick={() => onStartRecap && onStartRecap(event.id)}
              className="tap text-[10px] uppercase tracking-wider text-[#C9A961] hover:text-[#F5F1E8]" style={F.ui}>+ share a recap</button>
          )}>the recap</SectionLabel>
          {recaps.length === 0 ? (
            <p className="text-[11px] text-[#6B6B6B] italic pb-2" style={F.serif}>no recaps yet — be the first to share how the rite went.</p>
          ) : (
            <div className="space-y-1.5 pb-2">
              {recaps.map(p => (
                <button key={p.id} onClick={() => onOpenRecap && onOpenRecap(p)}
                  className="tap w-full text-left flex items-start gap-2.5 p-2 border border-[#1A1A1A] hover:border-[#2A2A2A] bg-[#0A0204]/40 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-sm shrink-0 overflow-hidden">
                    {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#A8A29E] text-[11px]" style={F.ui}>{p.user}</div>
                    {p.body && <div className="text-[#F5F1E8] text-xs leading-snug line-clamp-2" style={F.serif}>{p.body}</div>}
                    {p.img && <div className="text-[10px] text-[#6B6B6B] mt-0.5">🖼 photo</div>}
                    <div className="text-[9px] text-[#6B6B6B] mt-0.5" style={F.mono}>{p.baseCommentCount > 0 ? `${p.baseCommentCount} replies` : 'tap to comment'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="px-4 pt-4 sticky bottom-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A] to-transparent pb-4">
        {paid ? (
          event.mine ? (
            <button onClick={() => onManageTickets && onManageTickets(event)}
              className="tap w-full py-3 text-xs uppercase tracking-[0.3em] bg-[#5B0F1A] hover:bg-[#8B0000] text-[#F5F1E8] transition-colors flex items-center justify-center gap-2" style={F.ui}>
              <Ticket size={14} /> {event.sold} sold · door list
            </button>
          ) : soldOut ? (
            <button
              onClick={() => (waitlist.mine ? onLeaveWaitlist : onJoinWaitlist) && (waitlist.mine ? onLeaveWaitlist : onJoinWaitlist)(event.id)}
              className={`tap w-full py-3 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-colors ${
                waitlist.mine
                  ? 'bg-[#5B0F1A] text-[#F5F1E8] hover:bg-[#3a0a12]'
                  : 'bg-[#1A1A1A] border border-[#5B0F1A] text-[#C8102E] hover:bg-[#5B0F1A]/20'
              }`} style={F.ui}>
              {waitlist.mine
                ? <><Check size={14} /> on the waitlist{waitlist.count ? ` · ${waitlist.count}` : ''}</>
                : <>sold out · join waitlist{waitlist.count ? ` (${waitlist.count})` : ''}</>}
            </button>
          ) : (
            <button onClick={() => onBuy && onBuy(event.id)}
              className="tap w-full py-3 text-xs uppercase tracking-[0.3em] bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] transition-colors flex items-center justify-center gap-2" style={F.ui}>
              <Ticket size={14} /> buy ticket · {priceLabel}
            </button>
          )
        ) : (
          <button onClick={() => onToggleRsvp && onToggleRsvp(event.id)}
            className={`tap w-full py-3 text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-2 ${isGoing ? 'bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#8B0000] text-[#F5F1E8] hover:bg-[#5B0F1A]'}`}
            style={F.ui}>
            {isGoing ? <><Check size={14} /> going</> : 'rsvp · i’m going'}
          </button>
        )}
        {event.mine && (
          event.sold > 0 ? (
            <p className="mt-3 text-center text-[10px] text-[#6B6B6B] italic" style={F.serif}>can’t delete — {event.sold} ticket{event.sold === 1 ? '' : 's'} sold.</p>
          ) : (
            <button onClick={() => { if (confirmDelete) { onDelete && onDelete(event.id); } else { setConfirmDelete(true); } }}
              className="tap w-full mt-2 py-2.5 text-[10px] uppercase tracking-[0.25em] text-[#8B0000] hover:text-[#5B0F1A] transition-colors" style={F.ui}>
              {confirmDelete ? 'tap again to delete forever' : 'delete event'}
            </button>
          )
        )}
      </div>
    </div>
  );
}
