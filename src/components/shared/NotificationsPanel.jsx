import { useState } from 'react';
import { X, Bell, Heart, MessageCircle, UserPlus, Calendar, ShoppingBag, Trash2, AtSign } from 'lucide-react';
import { F } from '../../styles/fonts';
import { timeAgo } from '../../data/helpers';

const KIND_ICON = {
  reaction: { icon: Heart, color: '#8B0000' },
  react: { icon: Heart, color: '#8B0000' },
  story_react: { icon: Heart, color: '#C9A961' },
  follow: { icon: UserPlus, color: '#7B2CBF' },
  dm: { icon: MessageCircle, color: '#A8A29E' },
  comment: { icon: MessageCircle, color: '#A89968' },
  reply: { icon: MessageCircle, color: '#A89968' },
  event: { icon: Calendar, color: '#C9A961' },
  crew: { icon: MessageCircle, color: '#7B2CBF' },
  crew_join: { icon: UserPlus, color: '#7B2CBF' },
  rsvp: { icon: Calendar, color: '#C9A961' },
  mention: { icon: AtSign, color: '#A89968' },
  oddity: { icon: ShoppingBag, color: '#5B0F1A' },
  candle: { icon: Bell, color: '#C9A961' },
  tonight: { icon: Bell, color: '#8B0000' },
  vespers: { icon: Bell, color: '#C9A961' },
};

// Collapse consecutive same-post reactions into one row ("X and N others reacted…").
// Only reactions group (the spammy kind); everything else stays a singleton.
function groupNotifs(list) {
  const out = [];
  for (const n of list) {
    const key = (n.kind === 'react' || n.kind === 'reaction') && n.postId ? `react:${n.postId}` : null;
    const prev = out[out.length - 1];
    if (key && prev && prev._key === key) {
      prev.count += 1;
      prev.read = prev.read && n.read;
      if (n.user && !prev.actors.includes(n.user)) prev.actors.push(n.user);
      prev.ids.push(n.id);
    } else {
      out.push({ ...n, _key: key, count: 1, actors: n.user ? [n.user] : [], ids: [n.id] });
    }
  }
  return out;
}

export function NotificationsPanel({ notifications, onClose, onMarkAllRead, onMarkRead, onTap, onClearAll }) {
  const [pressTimer, setPressTimer] = useState(null);

  const handlePressStart = () => {
    const t = setTimeout(() => {
      onMarkAllRead();
    }, 600);
    setPressTimer(t);
  };
  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
    setPressTimer(null);
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1 transition-colors"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>NOTIFICATIONS</div>
          <button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            className="tap text-[#C8102E] hover:text-[#C9A961] text-[10px] uppercase tracking-wider"
            style={F.ui}
            title="long press to mark all read">
            {unread > 0 ? `${unread} new` : '—'}
          </button>
        </div>
      </div>
      {unread > 0 && (
        <div className="px-4 py-2 bg-[#5B0F1A]/10 border-b border-[#5B0F1A]/30 text-[10px] text-[#C8102E] uppercase tracking-wider text-center" style={F.ui}>
          long-press "{unread} new" to mark all read
        </div>
      )}
      {notifications.length > 0 && (
        <div className="px-4 py-2 border-b border-[#1A1A1A] flex items-center justify-end">
          <button onClick={onClearAll}
            className="tap flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>
            <Trash2 size={10} /> clear all
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center pt-24 px-6">
            <div className="text-[#3F3F3F] text-5xl mb-3" style={F.display}>·</div>
            <p className="text-[#A8A29E] text-sm" style={F.serif}>quiet for now.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1A1A1A]">
            {groupNotifs(notifications).map(n => {
              const k = KIND_ICON[n.kind] || KIND_ICON.reaction;
              const Icon = k.icon;
              const extra = n.count - 1;
              return (
                <button key={n.id}
                  onClick={() => { n.ids.forEach(id => onMarkRead && onMarkRead(id)); onTap && onTap(n); }}
                  className={`tap w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] transition-colors ${!n.read ? 'bg-[#0F0506]' : ''}`}>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">
                    {n.avatarUrl ? <img src={n.avatarUrl} alt="" className="w-full h-full object-cover" /> : n.avatar}
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center" style={{ color: k.color }}>
                      <Icon size={9} />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#F5F1E8] text-sm leading-snug" style={F.serif}>
                      {n.user && <span style={F.ui}>{n.user} </span>}
                      {extra > 0 && <span style={F.ui} className="text-[#C8102E]">and {extra} {extra === 1 ? 'other' : 'others'} </span>}
                      <span className="text-[#A8A29E]">{n.text}</span>
                    </p>
                    {n.target && <p className="text-[10px] text-[#6B6B6B] truncate mt-0.5" style={F.serif}>"{n.target}"</p>}
                    <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{n.time} ago</span>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#8B0000] shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
