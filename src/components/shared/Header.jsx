import { useRef } from 'react';
import { Plus, MessageCircle, Bell, Search, Sparkles } from 'lucide-react';
import { F } from '../../styles/fonts';
import { buzz } from '../../lib/haptics';

export function Header({ tab, onDMs, onCompose, onLibrary, onLogo, onNotifications, onSearch, onSecret, communityName, unreadNotifications = 0, unreadDMs = 0, parchment = false }) {
  // Long-press the wordmark to summon the sigil canvas (hidden lore). A normal tap still
  // opens the Library; the long-press suppresses that tap.
  const pressTimer = useRef(null);
  const fired = useRef(false);
  const startPress = () => { fired.current = false; pressTimer.current = setTimeout(() => { fired.current = true; buzz('secret'); onSecret && onSecret(); }, 650); };
  const endPress = () => clearTimeout(pressTimer.current);
  const logoTap = () => { if (!fired.current) onLogo && onLogo(); };
  const titles = {
    home: null,
    communities: null,
    map: 'PROXIMITY',
    events: null,
    profile: null,
    fashion: null,
  };

  const textColor = parchment ? 'text-[#2A1808]' : 'text-[#F5F1E8]';
  const accentColor = parchment ? 'text-[#5B0F1A]' : 'text-[#A8A29E]';
  const bgColor = parchment ? 'bg-[#EDE0C2]/85' : 'bg-[#0A0A0A]/85';
  const borderColor = parchment ? 'border-[#5B0F1A]/20' : 'border-[#1A1A1A]';

  return (
    <div className={`absolute top-0 inset-x-0 z-20 safe-pt ${bgColor} backdrop-blur-md border-b ${borderColor}`}>
      <div className="px-4 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {communityName ? (
            <span className={`${textColor} text-base`} style={F.display}>{communityName}</span>
          ) : tab === 'home' ? (
            <button onClick={logoTap}
              onPointerDown={startPress} onPointerUp={endPress} onPointerLeave={endPress}
              className={`${textColor} text-3xl leading-none hover:text-[#C9A961] transition-colors select-none`}
              style={F.brand} title="The Library">Coven</button>
          ) : (
            <button onClick={onLogo}
              className={`${textColor} text-base tracking-[0.2em] hover:text-[#C9A961] transition-colors`}
              style={F.displayOrnate}>
              {(titles[tab] || tab.toUpperCase())}
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onLibrary} className={`${accentColor} hover:text-[#C9A961] transition-colors p-2`} title="the coven · portals"><Sparkles size={18} /></button>
          {tab === 'home' && (
            <button onClick={onCompose} className={`${accentColor} hover:text-[#F5F1E8] transition-colors p-2`} title="new post"><Plus size={20} /></button>
          )}
          <button onClick={onSearch} className={`${accentColor} hover:text-[#F5F1E8] transition-colors p-2`} title="search"><Search size={18} /></button>
          <button onClick={onNotifications} className={`${accentColor} hover:text-[#F5F1E8] transition-colors p-2`} title="notifications">
            <span className="relative inline-flex">
              <Bell size={18} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#8B0000] text-[#F5F1E8] text-[8px] flex items-center justify-center" style={F.mono}>
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </span>
          </button>
          <button onClick={onDMs} className={`${accentColor} hover:text-[#F5F1E8] transition-colors p-2`} title="whispers">
            <span className="relative inline-flex">
              <MessageCircle size={20} />
              {unreadDMs > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] px-0.5 rounded-full bg-[#8B0000] text-[#F5F1E8] text-[8px] flex items-center justify-center" style={F.mono}>
                  {unreadDMs > 9 ? '9+' : unreadDMs}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
