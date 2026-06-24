import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, Map } from 'lucide-react';
import { F } from '../../styles/fonts';
import { fetchEventTickets, checkInTicket } from '../../lib/db/tickets';

export function TicketManager({ event, onClose, onEditVenueMap }) {
  const [tickets, setTickets] = useState(null);

  useEffect(() => {
    let active = true;
    fetchEventTickets(event.id).then(t => { if (active) setTickets(t); }).catch(() => { if (active) setTickets([]); });
    return () => { active = false; };
  }, [event.id]);

  const doCheckIn = async (id) => {
    const at = await checkInTicket(id).catch(() => null);
    if (at) setTickets(prev => prev.map(t => (t.id === id ? { ...t, checked_in_at: at } : t)));
  };

  const paid = (tickets || []).filter(t => t.status === 'paid');
  const revenue = paid.reduce((s, t) => s + (t.amount_cents || 0), 0);
  const checkedIn = paid.filter(t => t.checked_in_at).length;
  const money = (c) => `$${(c / 100) % 1 === 0 ? (c / 100).toFixed(0) : (c / 100).toFixed(2)}`;

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto safe-pb">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>DOOR</div>
          <span className="w-9" />
        </div>
      </div>

      <div className="px-4 py-4 border-b border-[#1A1A1A]">
        <div className="text-[#F5F1E8] text-lg" style={F.display}>{event.name.toUpperCase()}</div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div><div className="text-[#F5F1E8] text-xl" style={F.mono}>{paid.length}</div><div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>sold</div></div>
          <div><div className="text-[#C9A961] text-xl" style={F.mono}>{money(revenue)}</div><div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>gross</div></div>
          <div><div className="text-[#F5F1E8] text-xl" style={F.mono}>{checkedIn}</div><div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>checked in</div></div>
        </div>
        {onEditVenueMap && (
          <button onClick={onEditVenueMap}
            className="tap mt-3 w-full py-2 border border-[#2A2A2A] text-[#A8A29E] text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-colors" style={F.ui}>
            <Map size={13} /> festival mode · venue map
          </button>
        )}
      </div>

      {tickets === null ? (
        <div className="py-16 text-center text-[#6B6B6B]"><Loader2 size={18} className="animate-spin inline" /></div>
      ) : paid.length === 0 ? (
        <div className="py-16 text-center text-[#6B6B6B] text-sm" style={F.serif}>· no tickets sold yet ·</div>
      ) : (
        <div className="divide-y divide-[#1A1A1A]">
          {paid.map(t => {
            const who = t.buyer?.handle || t.buyer_email || 'guest';
            const inDoor = !!t.checked_in_at;
            return (
              <div key={t.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm shrink-0">{t.buyer?.avatar || '✦'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{who}</div>
                  <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{money(t.amount_cents)} · {t.id.slice(0, 8)}</div>
                </div>
                {inDoor ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#5B8A3A] px-2 py-1" style={F.ui}><Check size={12} /> in</span>
                ) : (
                  <button onClick={() => doCheckIn(t.id)}
                    className="tap text-[10px] uppercase tracking-wider px-3 py-1.5 border border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-colors" style={F.ui}>
                    check in
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
