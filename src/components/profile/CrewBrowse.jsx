import { ArrowLeft, Users, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { CREWS } from '../../data/crews';

export function CrewBrowse({ requests = {}, onRequest, onOpen, onClose }) {
  return (
    <div className="absolute inset-0 z-40 bg-[#0A0A0A] animate-slide-in-right overflow-y-auto pb-12">
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center gap-3">
          <button onClick={onClose} className="text-[#A8A29E] -ml-1"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>CREWS</div>
            <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{CREWS.length} circles · find yours</div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-[#1A1A1A]">
        {CREWS.map(c => {
          const isMember = c.isMember;
          const isPending = !!requests[c.id];
          return (
            <div key={c.id} className="px-4 py-4 flex items-start gap-3">
              <button onClick={() => isMember && onOpen && onOpen(c.id)}
                className="w-12 h-12 shrink-0 border border-[#2A2A2A] flex items-center justify-center text-[#A89968] text-xl">
                {c.glyph}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <button onClick={() => isMember && onOpen && onOpen(c.id)}
                    className="text-[#F5F1E8] text-base text-left" style={F.display}>{c.name}</button>
                  <span className="text-[10px] text-[#6B6B6B] shrink-0 flex items-center gap-1" style={F.mono}>
                    <Users size={9} /> {c.members}/{c.maxMembers}
                  </span>
                </div>
                <p className="text-[#A8A29E] text-xs italic leading-snug mb-1" style={F.serif}>{c.description}</p>
                {c.nextEvent && (
                  <div className="text-[10px] text-[#5B0F1A] uppercase tracking-wider mb-2" style={F.ui}>→ {c.nextEvent}</div>
                )}
                {c.activity && (
                  <div className="text-[10px] text-[#6B6B6B] italic mb-2" style={F.serif}>· {c.activity} ·</div>
                )}
                <div className="mt-2">
                  {isMember ? (
                    <button onClick={() => onOpen && onOpen(c.id)}
                      className="text-[10px] uppercase tracking-wider px-3 py-1 border border-[#8B0000] bg-[#8B0000]/15 text-[#F5F1E8] flex items-center gap-1.5"
                      style={F.ui}>
                      <Check size={11} /> member · open
                    </button>
                  ) : isPending ? (
                    <button disabled className="text-[10px] uppercase tracking-wider px-3 py-1 border border-[#A89968]/40 text-[#A89968] cursor-default" style={F.ui}>
                      · pending ·
                    </button>
                  ) : (
                    <button onClick={() => onRequest && onRequest(c.id)}
                      className="text-[10px] uppercase tracking-wider px-3 py-1 border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8]" style={F.ui}>
                      request to join
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
