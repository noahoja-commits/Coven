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
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>STUBS</div>
          <span className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto safe-pb p-4">
        {tickets === null ? (
          <p className="text-center text-[#6B6B6B] text-xs py-12 italic" style={F.serif}>· loading ·</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-[#6B6B6B]" style={F.serif}>
            <div className="text-3xl mb-3">𖤐</div>
            <p className="text-sm italic">no stubs yet — buy into a rite and keep the stub here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#6B6B6B] text-center pb-1" style={F.ui}>· the rites you've kept ·</p>
            {tickets.map(t => {
              const ev = t.event || {};
              const checkedIn = !!t.checked_in_at;
              return (
                <button key={t.id} onClick={() => ev.id && onOpenEvent && onOpenEvent(ev.id)}
                  className="relative w-full text-left flex items-stretch overflow-hidden border border-[#3A2F1A] hover:border-[#C9A961]/50 transition-colors group"
                  style={{ background: 'linear-gradient(95deg, #17110A 0%, #120D08 100%)' }}>
                  {/* torn perforation edge */}
                  <span className="w-2 shrink-0 border-r border-dashed border-[#3A2F1A]"
                    style={{ backgroundImage: 'radial-gradient(circle at left, #0A0A0A 2px, transparent 2px)', backgroundSize: '8px 8px', backgroundPosition: 'left center', backgroundRepeat: 'repeat-y' }} />
                  <div className="flex-1 min-w-0 p-3">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.display}>{(ev.name || 'a rite').toUpperCase()}</div>
                    <div className="text-[10px] text-[#C8102E] mt-0.5" style={F.ui}>
                      {[ev.event_date, ev.venue].filter(Boolean).join(' · ') || 'details soon'}
                    </div>
                    <div className="text-[10px] text-[#6B6B6B] mt-1" style={F.mono}>{money(t.amount_cents, t.currency)} · admit one</div>
                  </div>
                  {/* stub end */}
                  <div className="shrink-0 w-16 border-l border-dashed border-[#3A2F1A] flex flex-col items-center justify-center px-1 py-2 relative">
                    {checkedIn ? (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#C9A961] border border-[#C9A961]/50 px-1.5 py-0.5 rotate-[-8deg] flex items-center gap-0.5" style={F.ui}><Check size={9} /> kept</span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-[0.15em] text-[#C8102E]/70" style={F.ui}>stub</span>
                    )}
                    <span className="text-[8px] text-[#5B5B5B] mt-1" style={F.mono}>№{String(t.id || '').replace(/\D/g, '').slice(0, 4) || '0000'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
