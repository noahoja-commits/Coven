import { ArrowLeft } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from '../shared/Avatar';

// A simple people list for your own followers / following. `people` is an array of
// { id, handle, avatar, avatarUrl, bio }. Tapping a soul opens their profile.
export function FollowListOverlay({ title, people = [], onClose, onOpenUser }) {
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col animate-fade-in">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em] uppercase" style={F.display}>{title}</div>
          <span className="w-5" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto safe-pb">
        {people.length === 0 ? (
          <p className="px-4 py-16 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>· no one here yet ·</p>
        ) : (
          <div className="divide-y divide-[#141414]">
            {people.map(p => (
              <button key={p.id || p.handle} onClick={() => onOpenUser && onOpenUser(p.handle)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
                <Avatar url={p.avatarUrl} glyph={p.avatar} size={40} className="ring-1 ring-[#2A2A2A] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm truncate" style={F.ui}>{p.handle}</div>
                  {p.bio && <div className="text-[11px] text-[#6B6B6B] truncate" style={F.serif}>{p.bio}</div>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
