import { Share2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { shareCoven } from '../../lib/share';

const COVERS = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

// A polished invite card with a one-tap share. The ?event= deep link already opens
// EventDetail on load, so recipients land straight on the rite.
export function EventInviteCard({ event, goingCount = 0 }) {
  const cover = COVERS[event.cover] || COVERS.red;
  return (
    <div className="mx-4 my-4 border border-[#2A2A2A] overflow-hidden">
      <div className="p-4" style={{ background: cover }}>
        <div className="text-[9px] uppercase tracking-[0.4em] text-[#F5F1E8]/60" style={F.scriptureSC}>· you're invited ·</div>
        <div className="text-[#F5F1E8] text-lg mt-1 leading-tight" style={F.display}>{event.name.toUpperCase()}</div>
        <div className="text-[#F5F1E8]/80 text-[11px] mt-1" style={F.ui}>{[event.date, event.venue].filter(Boolean).join(' · ') || 'details soon'}</div>
        {goingCount > 0 && <div className="text-[#F5F1E8]/60 text-[10px] mt-2" style={F.ui}>{goingCount} going</div>}
      </div>
      <button onClick={() => shareCoven({ title: event.name, text: 'join me — ' + event.name, path: '?event=' + event.id })}
        className="w-full py-2.5 bg-[#0F0F0F] text-[#C9A961] text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 hover:bg-[#5B0F1A]/15 transition-colors" style={F.ui}>
        <Share2 size={13} /> share invite
      </button>
    </div>
  );
}
