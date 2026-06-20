import { useState } from 'react';
import { X, Music, Send } from 'lucide-react';
import { F } from '../../styles/fonts';

const SUGGESTIONS = [
  { artist: 'Drab Majesty', track: 'Vanity' },
  { artist: 'Cold Cave', track: 'Confetti' },
  { artist: 'Bauhaus', track: 'Bela Lugosi’s Dead' },
  { artist: 'Joy Division', track: 'Atmosphere' },
  { artist: 'Boy Harsher', track: 'Tower' },
  { artist: 'Lebanon Hanover', track: 'Gallowdance' },
  { artist: 'Molchat Doma', track: 'Sudno' },
  { artist: 'Soft Kill', track: 'Choke' },
];

export function NowPlayingModal({ current, onSave, onShare, onClose }) {
  const [artist, setArtist] = useState(current?.artist || '');
  const [track, setTrack] = useState(current?.track || '');

  const save = () => {
    const a = artist.trim();
    const t = track.trim();
    if (!a && !t) { onSave(null); return; }
    onSave({ artist: a, track: t, setAt: Date.now() });
  };

  const share = () => {
    const a = artist.trim();
    const t = track.trim();
    if (!a && !t) return;
    onSave({ artist: a, track: t, setAt: Date.now() });
    onShare && onShare({ artist: a, track: t });
  };

  const clear = () => onSave(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up max-h-[90dvh] overflow-y-auto safe-pb">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· on rotation ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>WHAT YOU'RE SPINNING</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[10px] text-[#6B6B6B] italic leading-snug" style={F.serif}>
            type in the track you're listening to — Coven doesn't read your music apps, this is yours to set and share.
          </p>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· artist ·</label>
            <input value={artist} onChange={e => setArtist(e.target.value.slice(0, 60))}
              placeholder="Drab Majesty"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm"
              style={F.serif} />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· track ·</label>
            <input value={track} onChange={e => setTrack(e.target.value.slice(0, 80))}
              placeholder="Vanity"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm italic"
              style={F.serif} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· quick pick ·</div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {SUGGESTIONS.map(s => (
                <button key={s.artist + s.track} onClick={() => { setArtist(s.artist); setTrack(s.track); }}
                  className="text-[10px] px-2 py-1 border border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] flex items-center gap-1.5"
                  style={F.ui}>
                  <Music size={9} /> {s.artist} · {s.track}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          {current && (
            <button onClick={clear}
              className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#A8A29E]" style={F.ui}>clear</button>
          )}
          <button onClick={onClose}
            className="ml-auto px-3 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>cancel</button>
          <button onClick={share} disabled={!artist.trim() && !track.trim()}
            className="px-3 py-2 text-[10px] uppercase tracking-wider border border-[#A89968] text-[#A89968] hover:text-[#C9A961] hover:border-[#C9A961] flex items-center gap-1.5 disabled:opacity-40" style={F.ui}>
            <Send size={11} /> share
          </button>
          <button onClick={save}
            className="px-3 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]" style={F.ui}>set</button>
        </div>
      </div>
    </div>
  );
}
