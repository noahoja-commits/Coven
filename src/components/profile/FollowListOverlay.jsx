import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';
import { Avatar } from '../shared/Avatar';
import { fetchFollowing, fetchFollowers, fetchMutuals } from '../../lib/db/social';

// Your own follow graph, tabbed: following / followers / mutuals. Self-loads each
// tab on demand (cached). Tapping a soul opens their profile.
const TABS = ['following', 'followers', 'mutuals'];

export function FollowListOverlay({ initialTab = 'following', myId, onClose, onOpenUser }) {
  const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : 'following');
  const [cache, setCache] = useState({}); // tab -> people[]
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!myId || cache[tab]) return;
    let on = true;
    setLoading(true);
    const load = tab === 'followers' ? fetchFollowers(myId)
      : tab === 'mutuals' ? fetchMutuals(myId)
      : fetchFollowing(myId).then(r => r.people || []);
    Promise.resolve(load)
      .then(people => { if (on) setCache(c => ({ ...c, [tab]: people || [] })); })
      .catch(() => { if (on) setCache(c => ({ ...c, [tab]: [] })); })
      .finally(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [tab, myId]); // eslint-disable-line react-hooks/exhaustive-deps

  const people = cache[tab] || [];
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] flex flex-col animate-fade-in">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em] uppercase" style={F.display}>SOULS</div>
          <span className="w-5" />
        </div>
        <div className="px-3 pb-2 flex gap-1.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider border transition-colors ${tab === t ? 'bg-[#5B0F1A] text-[#F5F1E8] border-[#8B0000]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
              style={F.ui}>{t}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto safe-pb">
        {loading && !people.length ? (
          <p className="px-4 py-16 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>· gathering ·</p>
        ) : people.length === 0 ? (
          <EmptyState glyph="✦" text="· no one here yet ·" />
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
