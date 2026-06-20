import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from '../shared/Avatar';
import { fetchBlockedProfiles } from '../../lib/db/moderation';

// Manage blocked souls: list everyone the user has blocked, with unblock.
// onUnblock(id) handles the DB delete + updating the app's blocked set.
export function BlockedOverlay({ onBack, onUnblock }) {
  const [list, setList] = useState(null); // null = loading
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    let active = true;
    fetchBlockedProfiles().then(r => { if (active) setList(r); }).catch(() => { if (active) setList([]); });
    return () => { active = false; };
  }, []);

  const unblock = async (id) => {
    setBusy(id);
    try {
      await onUnblock(id);
      setList(prev => (prev || []).filter(p => p.id !== id));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] transition-colors flex items-center gap-1 -ml-1" style={F.ui}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">back</span>
          </button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>BLOCKED</div>
          <span className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto safe-pb">
        <p className="text-[10px] text-[#6B6B6B] px-4 pt-4 pb-2" style={F.serif}>
          blocked souls can't see you and you won't see them. ghost mode (hide your presence) lives
          in settings → self.
        </p>

        {list === null ? (
          <p className="text-center text-[#6B6B6B] text-xs py-12 italic" style={F.serif}>· loading ·</p>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-[#6B6B6B]" style={F.serif}>
            <div className="text-3xl mb-3">⚰</div>
            <p className="text-sm italic">you haven't blocked anyone.</p>
          </div>
        ) : (
          <div className="border-y border-[#1A1A1A] divide-y divide-[#1A1A1A]">
            {list.map(p => (
              <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                <Avatar url={p.avatarUrl} glyph={p.avatar} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm truncate" style={F.serif}>@{p.handle}</div>
                </div>
                <button onClick={() => unblock(p.id)} disabled={busy === p.id}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] disabled:opacity-40 transition-colors"
                  style={F.ui}>
                  {busy === p.id ? '…' : 'unblock'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
