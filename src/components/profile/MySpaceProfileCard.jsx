import { MessageCircle, UserPlus, UserCheck, VolumeX, Volume2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { borderStyle, bannerStyle } from '../../data/decor';
import { TarotFrame, arcanaFor, Grain } from '../shared/Sigils';

// A MySpace-era profile CARD — two-column contact-table layout, retro section headers —
// rendered in Coven's muted goth palette (oxblood / gold / bone), NOT literal MySpace blue,
// per the project's "muted, never cartoony" visual direction. Reuses the exact data the
// UserProfileOverlay already fetched (no extra queries, no migration). Opt-in via
// settings.myspaceProfile; the classic card renders when it's off.
//
// On a phone the two columns stack (left rail first) — the natural mobile adaptation of the
// desktop MySpace grid.

function SectionHeader({ children }) {
  return (
    <div className="px-2 py-1 bg-gradient-to-r from-[#5B0F1A] to-[#2A0710] border border-[#3F0A12] text-[#F5F1E8] text-[11px] uppercase tracking-[0.18em]" style={F.display}>
      {children}
    </div>
  );
}

function InfoRow({ k, v }) {
  if (!v) return null;
  return (
    <div className="flex gap-2 px-2 py-1 border-b border-[#1A1A1A] last:border-b-0">
      <span className="text-[#C9A961] text-[10px] uppercase tracking-wider shrink-0 w-24" style={F.ui}>{k}</span>
      <span className="text-[#A8A29E] text-[11px] flex-1 break-words" style={F.serif}>{v}</span>
    </div>
  );
}

export function MySpaceProfileCard({ user, stats, arche, mood, memberSince, sunSign,
  isFollowing, isMuted, onToggleFollow, onWhisper, onToggleMute, onBlock, onReport }) {
  const contactActions = [
    { label: isFollowing ? 'following' : 'add to coven', icon: isFollowing ? UserCheck : UserPlus, onClick: onToggleFollow, on: isFollowing },
    { label: 'send a whisper', icon: MessageCircle, onClick: onWhisper },
    { label: isMuted ? 'unmute' : 'mute', icon: isMuted ? VolumeX : Volume2, onClick: onToggleMute, on: isMuted },
  ];

  return (
    <div className="relative px-3 pt-4 pb-4 border-b border-[#1A1A1A] overflow-hidden">
      <div className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)' }} />
      {user.decor?.banner && user.decor.banner !== 'none' && (
        <div className={`absolute top-0 inset-x-0 h-20 pointer-events-none ${user.decor?.animated ? 'banner-animated' : ''}`} style={bannerStyle(user.decor.banner) || undefined} />
      )}
      <Grain opacity={0.06} />

      {/* Retro profile title bar */}
      <div className="relative mb-3">
        <h2 className="text-[#F5F1E8] text-2xl leading-tight" style={F.brand}>{user.handle}</h2>
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] flex items-center gap-1.5" style={F.display}>
          {(() => { const a = arcanaFor(user.handle); return <span>{a.numeral} · {a.name}</span>; })()}
          {arche && <span style={{ color: arche.accent }}>· {arche.glyph} {arche.label}</span>}
        </div>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-4">
        {/* LEFT RAIL — photo, status, contact box, info table */}
        <div className="sm:w-40 shrink-0 space-y-3">
          <div className="relative flex flex-col items-center sm:block">
            <div className="relative w-36 h-36 sm:w-full sm:h-auto sm:aspect-square">
              <TarotFrame />
              <div className="w-full h-full sm:h-auto sm:aspect-square overflow-hidden bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border border-[#3F3F3F] flex items-center justify-center text-5xl"
                style={mood ? { boxShadow: `0 0 22px ${mood.color}88` } : borderStyle(user.decor?.border)}>
                {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.avatar}
              </div>
            </div>
            {mood && (
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] uppercase tracking-wider"
                style={{ borderColor: `${mood.color}66`, color: mood.color, textShadow: `0 0 6px ${mood.color}66`, ...F.ui }}>
                <span>{mood.glyph}</span><span>{mood.label}</span>
              </div>
            )}
            {user.pronouns && <div className="text-[#6B6B6B] text-[10px] uppercase tracking-wider mt-1" style={F.ui}>{user.pronouns}</div>}
          </div>

          {/* Contacting {handle} — the classic MySpace contact table */}
          <div className="border border-[#2A2A2A]">
            <SectionHeader>contacting {user.handle}</SectionHeader>
            <div className="divide-y divide-[#1A1A1A]">
              {contactActions.map((a) => (
                <button key={a.label} onClick={a.onClick}
                  className={`tap w-full flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${a.on ? 'text-[#C9A961]' : 'text-[#A8A29E] hover:text-[#F5F1E8] hover:bg-[#0F0F0F]'}`}
                  style={F.ui}>
                  <a.icon size={12} /> {a.label}
                </button>
              ))}
              <div className="flex">
                <button onClick={() => { if (onBlock) onBlock(); }} className="tap flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>⛒ block</button>
                <button onClick={() => { if (onReport) onReport(); }} className="tap flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#9E2A33] border-l border-[#1A1A1A]" style={F.ui}>⚑ report</button>
              </div>
            </div>
          </div>

          {/* Stats block */}
          <div className="border border-[#2A2A2A]">
            <SectionHeader>the ledger</SectionHeader>
            <div className="grid grid-cols-3 text-center py-2">
              {[['posts', stats.posts], ['coven', stats.followers], ['kept', stats.following]].map(([lbl, n]) => (
                <div key={lbl}>
                  <div className="text-[#F5F1E8] text-base leading-none" style={F.mono}>{n}</div>
                  <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN — general info + blurbs */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="border border-[#2A2A2A]">
            <SectionHeader>{user.handle}: general info</SectionHeader>
            <div>
              <InfoRow k="archetype" v={arche ? `${arche.glyph} ${arche.label}` : null} />
              <InfoRow k="from" v={user.city} />
              <InfoRow k="sign" v={sunSign} />
              <InfoRow k="member since" v={memberSince} />
              <InfoRow k="mood" v={mood ? mood.label : null} />
              <InfoRow k="marks" v={user.tags?.length ? user.tags.join(', ') : null} />
            </div>
          </div>

          <div className="border border-[#2A2A2A]">
            <SectionHeader>about {user.handle}</SectionHeader>
            <p className="px-2 py-2 text-[#F5F1E8] text-[13px] leading-relaxed" style={F.serif}>
              {user.bio ? user.bio : <span className="text-[#6B6B6B] italic">this soul keeps their story in shadow.</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
