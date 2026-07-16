import { useState, useEffect } from 'react';
import { MessageCircle, UserPlus, UserCheck, VolumeX, Volume2, Send, Trash2, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { borderStyle, bannerStyle } from '../../data/decor';
import { TarotFrame, arcanaFor, Grain } from '../shared/Sigils';
import { relativeTime } from '../../lib/time';
import { fetchProfileWall, addProfileComment, deleteProfileComment } from '../../lib/db/profileState';

const DETAIL_ROWS = [['music', 'music'], ['movies', 'films'], ['books', 'books'], ['heroes', 'heroes'], ['general', 'general']];

// Cross-user comments / testimonials wall (migration 0073). Fetches its own data.
function ProfileWall({ ownerId, meId, self, accent, onOpenUser }) {
  const [comments, setComments] = useState(null); // null = loading
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const load = () => { if (ownerId) fetchProfileWall(ownerId).then(setComments).catch(() => setComments([])); };
  useEffect(load, [ownerId]);
  const post = async () => {
    const b = draft.trim(); if (!b || posting) return;
    setPosting(true);
    try { await addProfileComment(ownerId, meId, b); setDraft(''); load(); }
    finally { setPosting(false); }
  };
  const remove = async (id) => { try { await deleteProfileComment(id); load(); } catch { /* noop */ } };
  if (comments === null) return null;
  return (
    <div className="border border-[#2A2A2A] mt-3">
      <div className="px-2 py-1 border text-[#F5F1E8] text-[11px] uppercase tracking-[0.18em]" style={{ ...F.display, background: `linear-gradient(to right, ${accent}22, transparent)`, borderColor: `${accent}44` }}>
        the wall {comments.length > 0 && <span className="text-[#6B6B6B]">· {comments.length}</span>}
      </div>
      {!self && (
        <div className="flex gap-1.5 p-2 border-b border-[#1A1A1A]">
          <input value={draft} onChange={e => setDraft(e.target.value.slice(0, 1000))} onKeyDown={e => { if (e.key === 'Enter') post(); }}
            placeholder="leave a mark on their wall…" className="field flex-1 text-[12px]" />
          <button onClick={post} disabled={posting || !draft.trim()} className="tap px-3 border border-[#2A2A2A] text-[#C9A961] disabled:opacity-40" title="post">
            {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
      )}
      {comments.length === 0 ? (
        <p className="px-2 py-3 text-[11px] text-[#6B6B6B] italic" style={F.serif}>no marks yet.</p>
      ) : comments.map(c => (
        <div key={c.id} className="flex items-start gap-2 px-2 py-2 border-b border-[#141414] last:border-b-0">
          <button onClick={() => onOpenUser && onOpenUser(c.handle)} className="tap w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm overflow-hidden shrink-0">
            {c.avatarUrl ? <img src={c.avatarUrl} alt="" className="w-full h-full object-cover" /> : c.avatar}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <button onClick={() => onOpenUser && onOpenUser(c.handle)} className="tap text-[11px] text-[#C9A961] truncate" style={F.ui}>{c.handle}</button>
              <span className="text-[9px] text-[#6B6B6B]" style={F.mono}>{relativeTime(c.createdAt)}</span>
            </div>
            <p className="text-[12px] text-[#F5F1E8] break-words whitespace-pre-wrap" style={F.serif}>{c.body}</p>
          </div>
          {(self || c.authorId === meId) && (
            <button onClick={() => remove(c.id)} className="tap text-[#6B6B6B] hover:text-[#8B0000] shrink-0" title="remove"><Trash2 size={12} /></button>
          )}
        </div>
      ))}
    </div>
  );
}

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
  isFollowing, isMuted, onToggleFollow, onWhisper, onToggleMute, onBlock, onReport,
  myspace = null, onOpenUser, self = false, onEditProfile, onEditMyspace, onShowFollowers, onShowFollowing,
  ownerId, meId }) {
  const about = myspace?.about || user.bio || '';
  const want = myspace?.want || '';
  const top = Array.isArray(myspace?.top) ? myspace.top.slice(0, 8) : [];
  const gallery = Array.isArray(myspace?.gallery) ? myspace.gallery.filter(m => m && m.url).slice(0, 12) : [];
  const details = myspace?.details || {};
  const blog = Array.isArray(myspace?.blog) ? myspace.blog.filter(b => b && (b.title || b.body)) : [];
  const song = myspace?.song && myspace.song.url ? myspace.song : null;
  // Custom goth accent (validated hex from public_shrine, or a raw hex on self); defaults to gold.
  const accent = /^#[0-9a-f]{6}$/i.test(myspace?.theme?.accent || '') ? myspace.theme.accent : '#C9A961';
  const cardBg = /^#[0-9a-f]{6}$/i.test(myspace?.theme?.bg || '') ? myspace.theme.bg : null;
  const hdr = (children) => (
    <div className="px-2 py-1 border text-[#F5F1E8] text-[11px] uppercase tracking-[0.18em]"
      style={{ ...F.display, background: `linear-gradient(to right, ${accent}2E, transparent)`, borderColor: `${accent}55` }}>{children}</div>
  );
  // On your OWN profile the contact box becomes an edit box; on others' it's follow/whisper/mute.
  const contactActions = self
    ? [
        { label: 'edit profile', icon: UserCheck, onClick: onEditProfile },
        { label: 'edit old-web profile', icon: MessageCircle, onClick: onEditMyspace },
      ]
    : [
        { label: isFollowing ? 'following' : 'add to coven', icon: isFollowing ? UserCheck : UserPlus, onClick: onToggleFollow, on: isFollowing },
        { label: 'send a whisper', icon: MessageCircle, onClick: onWhisper },
        { label: isMuted ? 'unmute' : 'mute', icon: isMuted ? VolumeX : Volume2, onClick: onToggleMute, on: isMuted },
      ];

  return (
    <div className="relative px-3 pt-4 pb-4 border-b border-[#1A1A1A] overflow-hidden" style={cardBg ? { background: cardBg } : undefined}>
      <div className="absolute inset-0 opacity-15" style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent} 0%, transparent 60%)` }} />
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
            <SectionHeader>{self ? 'your shrine' : `contacting ${user.handle}`}</SectionHeader>
            <div className="divide-y divide-[#1A1A1A]">
              {contactActions.map((a) => (
                <button key={a.label} onClick={a.onClick}
                  className={`tap w-full flex items-center gap-2 px-2 py-1.5 text-[10px] uppercase tracking-wider transition-colors ${a.on ? 'text-[#C9A961]' : 'text-[#A8A29E] hover:text-[#F5F1E8] hover:bg-[#0F0F0F]'}`}
                  style={F.ui}>
                  <a.icon size={12} /> {a.label}
                </button>
              ))}
              {!self && (
              <div className="flex">
                <button onClick={() => { if (onBlock) onBlock(); }} className="tap flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>⛒ block</button>
                <button onClick={() => { if (onReport) onReport(); }} className="tap flex-1 px-2 py-1.5 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#9E2A33] border-l border-[#1A1A1A]" style={F.ui}>⚑ report</button>
              </div>
              )}
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
            <p className="px-2 py-2 text-[#F5F1E8] text-[13px] leading-relaxed whitespace-pre-wrap" style={F.serif}>
              {about ? about : <span className="text-[#6B6B6B] italic">this soul keeps their story in shadow.</span>}
            </p>
          </div>

          {want && (
            <div className="border border-[#2A2A2A]">
              <SectionHeader>who {user.handle} would like to meet</SectionHeader>
              <p className="px-2 py-2 text-[#F5F1E8] text-[13px] leading-relaxed whitespace-pre-wrap" style={F.serif}>{want}</p>
            </div>
          )}

          {song && (
            <div className="border border-[#2A2A2A]">
              {hdr(`${user.handle}'s song`)}
              <div className="px-2 py-2">
                {(song.track || song.artist) && (
                  <div className="text-[11px] mb-1.5" style={F.ui}>
                    <span className="text-[#F5F1E8]">{song.track || 'untitled'}</span>
                    {song.artist && <span className="text-[#6B6B6B]"> · {song.artist}</span>}
                  </div>
                )}
                <audio controls src={song.url} preload="none" className="w-full h-9" />
              </div>
            </div>
          )}

          {DETAIL_ROWS.some(([k]) => details[k]) && (
            <div className="border border-[#2A2A2A]">
              {hdr(`${user.handle}: details`)}
              <div>
                {DETAIL_ROWS.map(([k, label]) => details[k] ? <InfoRow key={k} k={label} v={details[k]} /> : null)}
              </div>
            </div>
          )}

          {blog.length > 0 && (
            <div className="border border-[#2A2A2A]">
              {hdr(`${user.handle}'s blog`)}
              <div className="divide-y divide-[#1A1A1A]">
                {blog.map((b, i) => (
                  <div key={i} className="px-2 py-2">
                    {b.title && <div className="text-[#F5F1E8] text-[12px] mb-0.5" style={F.ui}>{b.title}</div>}
                    {b.at && <div className="text-[9px] text-[#6B6B6B] mb-1" style={F.mono}>{b.at}</div>}
                    {b.body && <p className="text-[#A8A29E] text-[12px] leading-relaxed whitespace-pre-wrap" style={F.serif}>{b.body}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gallery.length > 0 && (
            <div className="border border-[#2A2A2A]">
              <SectionHeader>{user.handle}'s gallery</SectionHeader>
              <div className="grid grid-cols-3 gap-1 p-1">
                {gallery.map((m, i) => (
                  <a key={i} href={m.url} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden bg-[#0A0A0A] border border-[#1A1A1A]">
                    {m.type === 'video'
                      ? <video src={m.url} className="w-full h-full object-cover" muted playsInline />
                      : <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />}
                  </a>
                ))}
              </div>
            </div>
          )}

          {top.length > 0 && (
            <div className="border border-[#2A2A2A]">
              <SectionHeader>{user.handle}'s coven · top {top.length}</SectionHeader>
              <div className="grid grid-cols-4 gap-2 p-2">
                {top.map((f) => (
                  <button key={f.handle} onClick={() => onOpenUser && onOpenUser(f.handle)} className="tap flex flex-col items-center gap-1 group">
                    <div className="w-full aspect-square overflow-hidden border border-[#3F3F3F] bg-[#1A1A1A] flex items-center justify-center text-xl group-hover:border-[#C9A961]/60 transition-colors">
                      {f.avatarUrl ? <img src={f.avatarUrl} alt="" className="w-full h-full object-cover" /> : (f.avatar || '✦')}
                    </div>
                    <span className="text-[9px] text-[#A8A29E] truncate max-w-full group-hover:text-[#C9A961]" style={F.ui}>{f.handle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* The wall — cross-user comments/testimonials (migration 0073). Spans full width. */}
      {ownerId && <ProfileWall ownerId={ownerId} meId={meId} self={self} accent={accent} onOpenUser={onOpenUser} />}
    </div>
  );
}
