import { useState, useEffect } from 'react';
import { ChevronLeft, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchMyTickets } from '../../lib/db/tickets';

// Tickets the current user has bought. Door check-in is handled host-side
// (TicketManager looks people up by handle/email), so this is a confirmation +
// reference view — what you paid into, when, and whether you've been checked in.
export function MyTicketsOverlay({ meId, onBack, onOpenEvent }) {
  const [tickets, setTickets] = useState(null); // null = loading

  useEffect(() => {
    let active = true;
    fetchMyTickets(meId).then(t => { if (active) setTickets(t); }).catch(() => { if (active) setTickets([]); });
    return () => { active = false; };
  }, [meId]);

  const money = (cents, cur) => `${(cur || 'usd').toUpperCase() === 'USD' ? '$' : ''}${((cents || 0) / 100).toFixed(2)}`;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] transition-colors flex items-center gap-1 -ml-1" style={F.ui}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">back</span>
          </button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>TICKETS</div>
          <span className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto safe-pb p-4">
        {tickets === null ? (
          <p className="text-center text-[#6B6B6B] text-xs py-12 italic" style={F.serif}>· loading ·</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-[#6B6B6B]" style={F.serif}>
            <div className="text-3xl mb-3">𖤐</div>
            <p className="text-sm italic">no tickets yet — buy into a rite and it'll appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => {
              const ev = t.event || {};
              const checkedIn = !!t.checked_in_at;
              return (
                <button key={t.id} onClick={() => ev.id && onOpenEvent && onOpenEvent(ev.id)}
                  className="w-full text-left border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#5B0F1A]/50 transition-colors p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.display}>{ev.name || 'a rite'}</div>
                    <div className="text-[10px] text-[#A8A29E] mt-0.5" style={F.ui}>
                      {[ev.event_date, ev.venue].filter(Boolean).join(' · ') || 'details soon'}
                    </div>
                    <div className="text-[10px] text-[#6B6B6B] mt-1" style={F.mono}>{money(t.amount_cents, t.currency)} · {t.status}</div>
                  </div>
                  {checkedIn ? (
                    <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#C9A961]" style={F.ui}><Check size={12} /> in</span>
                  ) : (
                    <span className="text-[9px] uppercase tracking-[0.18em] text-[#5B0F1A] border border-[#5B0F1A]/40 px-2 py-1" style={F.ui}>ticket</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
