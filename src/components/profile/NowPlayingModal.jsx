import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';

export function NowPlayingModal({ current, onSave, onShare, onClose }) {
  const [artist, setArtist] = useState(current?.artist || '');
  const [track, setTrack] = useState(current?.track || '');
  const [loop, setLoop] = useState(!!current?.loop);

  const save = () => {
    const a = artist.trim();
    const t = track.trim();
    if (!a && !t) { onSave(null); return; }
    onSave({ artist: a, track: t, loop, setAt: Date.now() });
  };

  const share = () => {
    const a = artist.trim();
    const t = track.trim();
    if (!a && !t) return;
    onSave({ artist: a, track: t, loop, setAt: Date.now() });
    onShare && onShare({ artist: a, track: t });
  };

  const clear = () => onSave(null);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up max-h-[90dvh] overflow-y-auto safe-pb">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <SectionLabel rule={false}>on rotation</SectionLabel>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>WHAT YOU'RE SPINNING</h3>
          </div>
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[10px] text-[#6B6B6B] italic leading-snug" style={F.serif}>
            type in the track you're listening to — Coven doesn't read your music apps, this is yours to set and share.
          </p>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· artist ·</label>
            <input value={artist} onChange={e => setArtist(e.target.value.slice(0, 60))}
              placeholder="Drab Majesty"
              className="field mt-1.5" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33]" style={F.scriptureSC}>· track ·</label>
            <input value={track} onChange={e => setTrack(e.target.value.slice(0, 80))}
              placeholder="the song on repeat"
              className="field mt-1.5 italic" />
          </div>
          <button onClick={() => setLoop(l => !l)}
            className={`tap w-full flex items-center justify-between p-2.5 border ${loop ? 'border-[#C9A961]/70' : 'border-[#2A2A2A] hover:border-[#5B0F1A]/60'}`}
            style={{ boxShadow: loop ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#9E2A33] flex items-center gap-1.5" style={F.ui}>↻ on repeat</span>
            <span className={`text-xs ${loop ? 'text-[#C9A961]' : 'text-[#6B6B6B]'}`} style={F.ui}>{loop ? 'looping' : 'off'}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          {current && (
            <button onClick={clear} className="btn btn-quiet">clear</button>
          )}
          <button onClick={onClose} className="btn btn-ghost ml-auto">cancel</button>
          <button onClick={share} disabled={!artist.trim() && !track.trim()} className="btn btn-ghost">
            <Send size={11} /> share
          </button>
          <button onClick={save} className="btn btn-primary">set</button>
        </div>
      </div>
    </div>
  );
}
