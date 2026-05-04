import { useState, useEffect, useRef } from 'react';
import {
  Search, Plus, Send, ChevronLeft, MapPin, Calendar, Users, User,
  MessageCircle, Hash, Flame, Skull, Cigarette, Wine, Music, Shirt,
  Dices, Sparkles, X, Heart, Bookmark, Share2, MoreHorizontal,
  Image as ImageIcon, Mic, Smile, ArrowUp, Filter, Bell
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// FONTS
// ─────────────────────────────────────────────────────────────────
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=VT323&display=swap';

const F = {
  brand: { fontFamily: '"UnifrakturCook", serif', fontWeight: 700 },
  display: { fontFamily: '"Cinzel", serif', letterSpacing: '0.08em' },
  serif: { fontFamily: '"Cormorant Garamond", serif' },
  ui: { fontFamily: '"Manrope", sans-serif' },
  mono: { fontFamily: '"VT323", monospace', letterSpacing: '0.04em' },
};

// ─────────────────────────────────────────────────────────────────
// MOCK DATA — make it feel populated and alive
// ─────────────────────────────────────────────────────────────────
const POSTS = [
  {
    id: 'p1', kind: 'text', user: 'lilith_xiv', avatar: '🦇', time: '4m',
    community: 'general', body: 'tonight at the crypt. one seat in my car from bushwick. dm if u smoke',
    reactions: { bat: 12, fire: 4, skull: 8, smoke: 23 }, comments: 7,
  },
  {
    id: 'p2', kind: 'photo', user: 'ash.in.october', avatar: '🕯', time: '21m',
    community: 'fashion', body: 'thrifted velvet. $12 at the salvation army on flatbush.',
    img: 'velvet', reactions: { bat: 47, fire: 89, skull: 12, smoke: 3 }, comments: 24,
  },
  {
    id: 'p3', kind: 'event', user: 'mortuary.dj', avatar: '⚰', time: '1h',
    community: 'partying',
    event: {
      name: 'SPECTRES vol. IV', venue: 'The Mortuary', date: 'sat may 9 · 11pm',
      tags: ['darkwave', 'ebm', '21+'], going: 184,
    },
    reactions: { bat: 203, fire: 156, skull: 88, smoke: 41 }, comments: 62,
  },
  {
    id: 'p4', kind: 'text', user: 'vesper.exe', avatar: '✟', time: '2h',
    community: 'general', body: 'why does every "goth" makeup tutorial start with a full beat. some of us just want a smudged eye and a cigarette',
    reactions: { bat: 89, fire: 12, skull: 144, smoke: 67 }, comments: 38,
  },
  {
    id: 'p5', kind: 'photo', user: 'cryptic.rose', avatar: '🌹', time: '3h',
    community: 'goth', body: 'st. john the divine at dusk. nothing like it.',
    img: 'cathedral', reactions: { bat: 312, fire: 28, skull: 19, smoke: 4 }, comments: 41,
  },
  {
    id: 'p6', kind: 'text', user: 'blackvelvet_99', avatar: '🩸', time: '5h',
    community: 'music', body: 'drab majesty new record might genuinely be their best. fight me',
    reactions: { bat: 67, fire: 41, skull: 8, smoke: 12 }, comments: 89,
  },
];

const STORIES = [
  { user: 'you', avatar: '+', live: false, self: true },
  { user: 'lilith_xiv', avatar: '🦇', live: true },
  { user: 'ash.in.october', avatar: '🕯', live: true },
  { user: 'vesper.exe', avatar: '✟', live: false },
  { user: 'mortis.kvlt', avatar: '☠', live: true },
  { user: 'cryptic.rose', avatar: '🌹', live: false },
  { user: 'blackvelvet', avatar: '🩸', live: false },
];

const COMMUNITIES = [
  { id: 'general', name: 'General', desc: 'the commons. everyone & everything.', members: 12400, icon: Hash, glyph: '✦', active: 'just now' },
  { id: 'goth', name: 'Goth & Alt', desc: 'the dark romantics, the black-clad, the unholy.', members: 11200, icon: Skull, glyph: '✟', active: '2m' },
  { id: 'music', name: 'Music & Bands', desc: 'darkwave, post-punk, ebm, witch house, beyond.', members: 9400, icon: Music, glyph: '♪', active: '4m' },
  { id: 'partying', name: 'Nightlife', desc: 'underground parties, warehouse raves, after hours.', members: 8900, icon: Sparkles, glyph: '◈', active: '6m' },
  { id: 'fashion', name: 'Fashion & Fits', desc: 'sick fits, indie brands, thrift hauls.', members: 6700, icon: Shirt, glyph: '✕', active: '11m' },
  { id: 'drinking', name: 'Drinking', desc: 'natural wine, cheap beer, dive bars, last call.', members: 4800, icon: Wine, glyph: '◐', active: '23m' },
  { id: 'smoking', name: 'Smoking', desc: 'the smoke spots. rotations, rolling, rooftops.', members: 3200, icon: Cigarette, glyph: '∽', active: '1h' },
  { id: 'gambling', name: 'Gambling', desc: 'cards, dice, the long odds. small but devout.', members: 1100, icon: Dices, glyph: '◇', active: '3h' },
];

const EVENTS = [
  { id: 'e1', name: 'SPECTRES vol. IV', venue: 'The Mortuary', neighborhood: 'Bushwick', date: 'sat · may 9', time: '11pm — late', tags: ['darkwave', 'ebm'], going: 184, host: 'mortuary.dj', cover: 'red' },
  { id: 'e2', name: 'Funeral Mass III', venue: 'Saint Vitus', neighborhood: 'Greenpoint', date: 'sun · may 10', time: '9pm', tags: ['doom', 'post-punk'], going: 92, host: 'parish.nyc', cover: 'violet' },
  { id: 'e3', name: 'Witch House Wednesday', venue: 'Bossa Nova Civic Club', neighborhood: 'Bushwick', date: 'wed · may 13', time: '10pm', tags: ['witch house', 'experimental'], going: 67, host: 'hex.collective', cover: 'black' },
  { id: 'e4', name: 'Black Lipstick Karaoke', venue: 'The Coffin Club', neighborhood: 'Lower East Side', date: 'thu · may 14', time: '8pm', tags: ['karaoke', 'free'], going: 41, host: 'coffin.club', cover: 'red' },
  { id: 'e5', name: 'CATHEDRAL', venue: 'Basement', neighborhood: 'Knockdown Center', date: 'fri · may 15', time: '11pm — 6am', tags: ['techno', 'industrial'], going: 312, host: 'basement.nyc', cover: 'violet' },
  { id: 'e6', name: 'velvet hours :: a darkwave night', venue: 'Friends and Lovers', neighborhood: 'Crown Heights', date: 'sat · may 16', time: '10pm', tags: ['darkwave', 'goth', '$10'], going: 128, host: 'velvethours', cover: 'black' },
];

const MAP_PINS = [
  { id: 'm1', kind: 'party', x: 32, y: 28, name: 'SPECTRES vol. IV', meta: 'sat 11pm · 184 going' },
  { id: 'm2', kind: 'gig', x: 58, y: 22, name: 'Funeral Mass III', meta: 'sun 9pm · 92 going' },
  { id: 'm3', kind: 'smoke', x: 44, y: 48, name: 'Roof @ Wyckoff', meta: 'rotation tonight · 8pm' },
  { id: 'm4', kind: 'bar', x: 71, y: 55, name: 'The Coffin Club', meta: 'open till 4am' },
  { id: 'm5', kind: 'fashion', x: 22, y: 62, name: 'Vermillion Vintage', meta: 'new drop sat 2pm' },
  { id: 'm6', kind: 'party', x: 65, y: 75, name: 'CATHEDRAL', meta: 'fri 11pm · 312 going' },
  { id: 'm7', kind: 'smoke', x: 78, y: 38, name: 'Maria Hernandez Pk', meta: '4 there now' },
  { id: 'm8', kind: 'gig', x: 38, y: 80, name: 'velvet hours', meta: 'sat 10pm · 128 going' },
];

const PIN_KIND = {
  party:   { label: 'party',   color: '#8B0000', emoji: '◈' },
  gig:     { label: 'show',    color: '#7B2CBF', emoji: '♪' },
  smoke:   { label: 'smoke',   color: '#6B6B6B', emoji: '∽' },
  bar:     { label: 'bar',     color: '#B45309', emoji: '◐' },
  fashion: { label: 'fits',    color: '#A8A29E', emoji: '✕' },
};

const FASHION = [
  { id: 'f1', brand: 'Vermillion Vintage', kind: 'thrift · NYC', price: '$$', tags: ['mens', 'velvet'], h: 280, color: 'red' },
  { id: 'f2', brand: 'KILL STAR', kind: 'indie · online', price: '$$', tags: ['unisex'], h: 200, color: 'black' },
  { id: 'f3', brand: 'Disturbia', kind: 'indie · online', price: '$$', tags: ['mens', 'womens'], h: 240, color: 'violet' },
  { id: 'f4', brand: 'Ash & Bone', kind: 'indie · NYC', price: '$$$', tags: ['mens'], h: 320, color: 'black' },
  { id: 'f5', brand: 'Widow', kind: 'indie · LA', price: '$$$', tags: ['womens'], h: 220, color: 'red' },
  { id: 'f6', brand: 'L\'Officiel', kind: 'thrift · online', price: '$', tags: ['mens'], h: 260, color: 'violet' },
  { id: 'f7', brand: 'Cathedral Co.', kind: 'indie · Berlin', price: '$$$', tags: ['mens', 'unisex'], h: 300, color: 'black' },
  { id: 'f8', brand: 'Goblin Market', kind: 'thrift · online', price: '$', tags: ['womens'], h: 180, color: 'red' },
];

const CONVERSATIONS = [
  { id: 'c1', user: 'lilith_xiv', avatar: '🦇', last: 'one seat. you in?', time: '2m', unread: 2 },
  { id: 'c2', user: 'ash.in.october', avatar: '🕯', last: 'sent you the link to the velvet shop', time: '14m', unread: 0 },
  { id: 'c3', user: 'the crypt crew', avatar: '✟', last: 'mortis: who\'s rolling', time: '23m', unread: 5, group: true },
  { id: 'c4', user: 'vesper.exe', avatar: '✟', last: 'lol fair', time: '1h', unread: 0 },
  { id: 'c5', user: 'mortuary.dj', avatar: '⚰', last: 'guestlist + 1 you got it', time: '3h', unread: 0 },
  { id: 'c6', user: 'cryptic.rose', avatar: '🌹', last: 'photo', time: '6h', unread: 0 },
  { id: 'c7', user: 'blackvelvet_99', avatar: '🩸', last: 'no but really tho', time: '1d', unread: 0 },
];

const PROFILE = {
  name: 'spectre.eve',
  pronouns: 'she / they',
  bio: 'velvet & venom · brooklyn · soft for cathedrals & cheap red wine',
  tags: ['goth', 'raver', 'smoker', 'NYC'],
  followers: 1284, following: 342, posts: 89,
  status: 'looking for a smoke sesh in bushwick',
};

// ─────────────────────────────────────────────────────────────────
// VISUAL HELPERS
// ─────────────────────────────────────────────────────────────────
const formatK = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

// Stylized "image" stand-ins so everything stays self-contained
function PostImage({ kind }) {
  if (kind === 'velvet') {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0F0608]">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 20%, #3B0A12 0%, #1A0408 45%, #0A0204 100%)'
        }} />
        <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full opacity-90">
          <defs>
            <radialGradient id="vel1" cx="50%" cy="35%">
              <stop offset="0%" stopColor="#5B0F1A" />
              <stop offset="60%" stopColor="#2A0710" />
              <stop offset="100%" stopColor="#0A0204" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="55" rx="38" ry="50" fill="url(#vel1)" />
          {Array.from({ length: 14 }).map((_, i) => (
            <path key={i}
              d={`M ${20 + i * 4.5} 30 Q ${22 + i * 4.5} 65, ${18 + i * 4.5} 110`}
              stroke="#1A0408" strokeWidth="0.6" fill="none" opacity="0.6" />
          ))}
          <ellipse cx="50" cy="40" rx="6" ry="8" fill="#0A0204" opacity="0.7" />
        </svg>
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm" style={F.mono}>
          <span className="text-[#F5F1E8] text-xs">35mm · pushed</span>
        </div>
      </div>
    );
  }
  if (kind === 'cathedral') {
    return (
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-[#0A0608]">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #2A1A2E 0%, #1A0F1F 40%, #08040A 100%)'
        }} />
        <svg viewBox="0 0 100 125" className="absolute inset-0 w-full h-full">
          {/* sky */}
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B1F3F" />
              <stop offset="100%" stopColor="#0A0610" />
            </linearGradient>
          </defs>
          <rect width="100" height="125" fill="url(#sky)" />
          {/* cathedral silhouette */}
          <path d="M 20 125 L 20 70 L 25 65 L 30 70 L 30 50 L 35 45 L 40 50 L 40 30 L 45 20 L 50 12 L 55 20 L 60 30 L 60 50 L 65 45 L 70 50 L 70 70 L 75 65 L 80 70 L 80 125 Z"
            fill="#050304" />
          {/* spire */}
          <path d="M 48 12 L 50 4 L 52 12" stroke="#050304" strokeWidth="0.5" fill="#050304" />
          {/* windows glow */}
          <rect x="44" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.7" />
          <rect x="48" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.5" />
          <rect x="52" y="55" width="3" height="8" fill="#5B0F1A" opacity="0.7" />
          <circle cx="50" cy="38" r="3" fill="#3B0A12" opacity="0.6" />
          {/* moon */}
          <circle cx="78" cy="22" r="6" fill="#F5F1E8" opacity="0.85" />
          <circle cx="76" cy="20" r="5" fill="#1A0F1F" />
        </svg>
        <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm" style={F.mono}>
          <span className="text-[#F5F1E8] text-xs">manhattan · 8:42pm</span>
        </div>
      </div>
    );
  }
  return null;
}

function FashionTile({ item }) {
  const palette = {
    red: 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)',
    black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
    violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  }[item.color];
  return (
    <div className="relative w-full overflow-hidden border border-[#1F1F1F] hover:border-[#3F3F3F] transition-colors group cursor-pointer"
      style={{ height: item.h, background: palette }}>
      {/* abstract garment shape */}
      <svg viewBox="0 0 100 140" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice">
        <path d="M 30 20 L 40 10 L 60 10 L 70 20 L 85 35 L 80 50 L 75 50 L 75 130 L 25 130 L 25 50 L 20 50 L 15 35 Z"
          fill="rgba(0,0,0,0.5)" stroke="rgba(245,241,232,0.08)" strokeWidth="0.3" />
        <line x1="50" y1="20" x2="50" y2="130" stroke="rgba(245,241,232,0.06)" strokeWidth="0.3" />
      </svg>
      {/* grain */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")' }} />
      {/* text */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="text-[#F5F1E8] text-sm" style={F.display}>{item.brand.toUpperCase()}</div>
        <div className="text-[#A8A29E] text-[11px] mt-0.5" style={F.ui}>{item.kind}</div>
        <div className="flex items-center gap-1.5 mt-2">
          {item.tags.map(t => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#3F3F3F] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
          ))}
          <span className="ml-auto text-[#A8A29E] text-xs" style={F.mono}>{item.price}</span>
        </div>
      </div>
    </div>
  );
}

// Reaction button with bat-flutter
function Reaction({ icon, count, onClick, active }) {
  const [animate, setAnimate] = useState(false);
  const handle = () => {
    setAnimate(true);
    setTimeout(() => setAnimate(false), 600);
    onClick && onClick();
  };
  return (
    <button onClick={handle}
      className={`flex items-center gap-1 px-2 py-1 transition-colors ${active ? 'text-[#F5F1E8]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}>
      <span className={`text-sm leading-none ${animate ? 'flutter' : ''}`}>{icon}</span>
      <span className="text-xs" style={F.mono}>{count}</span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────
function HomeScreen({ onOpenCommunity }) {
  return (
    <div className="pb-24">
      {/* Stories rail */}
      <div className="px-4 pt-3 pb-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.2em] mb-3" style={F.ui}>· tonight ·</div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
          {STORIES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-xl
                ${s.live ? 'ring-2 ring-[#8B0000] ring-offset-2 ring-offset-[#0A0A0A] animate-pulse-slow' : ''}
                ${s.self ? 'bg-[#141414] border border-dashed border-[#3F3F3F] text-[#6B6B6B]' : 'bg-[#141414] border border-[#2A2A2A]'}`}>
                {s.avatar}
                {s.live && <span className="absolute -bottom-0.5 right-0 w-2.5 h-2.5 bg-[#8B0000] rounded-full ring-2 ring-[#0A0A0A]" />}
              </div>
              <span className="text-[10px] text-[#A8A29E] max-w-[60px] truncate" style={F.ui}>{s.user}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="divide-y divide-[#1A1A1A]">
        {POSTS.map(post => (
          <article key={post.id} className="px-4 py-4">
            {/* header */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base">{post.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B]" style={F.ui}>
                  <span style={F.mono} className="text-xs">{post.time}</span>
                  <span>·</span>
                  <button onClick={() => onOpenCommunity(post.community)} className="hover:text-[#A8A29E] uppercase tracking-wider">#{post.community}</button>
                </div>
              </div>
              <button className="text-[#6B6B6B]"><MoreHorizontal size={16} /></button>
            </div>

            {/* body */}
            {post.body && (
              <p className="text-[#F5F1E8] text-[15px] leading-relaxed mb-3" style={F.serif}>{post.body}</p>
            )}

            {post.kind === 'photo' && <div className="mb-3"><PostImage kind={post.img} /></div>}

            {post.kind === 'event' && (
              <div className="mb-3 border border-[#2A2A2A] bg-[#0F0F0F] overflow-hidden">
                <div className="h-1.5" style={{ background: 'linear-gradient(90deg, #8B0000, #7B2CBF)' }} />
                <div className="p-4">
                  <div className="text-[10px] text-[#8B0000] uppercase tracking-[0.2em] mb-1" style={F.ui}>upcoming</div>
                  <div className="text-[#F5F1E8] text-xl mb-1" style={F.display}>{post.event.name}</div>
                  <div className="text-[#A8A29E] text-sm" style={F.serif}>{post.event.venue} · <span style={F.mono}>{post.event.date}</span></div>
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {post.event.tags.map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1A1A1A] flex items-center justify-between">
                    <span className="text-[#A8A29E] text-xs" style={F.ui}>{post.event.going} going</span>
                    <button className="text-[#F5F1E8] text-xs px-3 py-1 border border-[#3F3F3F] hover:border-[#8B0000] hover:text-[#8B0000] transition-colors uppercase tracking-wider" style={F.ui}>RSVP</button>
                  </div>
                </div>
              </div>
            )}

            {/* reactions */}
            <div className="flex items-center justify-between -ml-2">
              <div className="flex items-center">
                <Reaction icon="🦇" count={post.reactions.bat} />
                <Reaction icon="🔥" count={post.reactions.fire} />
                <Reaction icon="💀" count={post.reactions.skull} />
                <Reaction icon="💨" count={post.reactions.smoke} />
              </div>
              <button className="flex items-center gap-1.5 text-[#6B6B6B] hover:text-[#A8A29E] text-xs px-2 py-1" style={F.ui}>
                <MessageCircle size={13} /><span style={F.mono} className="text-xs">{post.comments}</span>
              </button>
            </div>
          </article>
        ))}
        <div className="py-12 text-center">
          <div className="text-[#3F3F3F] text-sm" style={F.serif}>· you've reached the bottom of tonight ·</div>
        </div>
      </div>
    </div>
  );
}

function CommunitiesScreen({ onOpenCommunity }) {
  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>SCENES</h2>
        <p className="text-[#A8A29E] text-sm" style={F.serif}>find your people. or hide from them.</p>
      </div>

      {/* search */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#141414] border border-[#1F1F1F]">
          <Search size={14} className="text-[#6B6B6B]" />
          <input placeholder="search scenes" className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]" style={F.ui} />
        </div>
      </div>

      <div className="divide-y divide-[#1A1A1A] border-t border-[#1A1A1A]">
        {COMMUNITIES.map(c => (
          <button key={c.id} onClick={() => onOpenCommunity(c.id)} className="w-full px-4 py-4 flex items-start gap-3 hover:bg-[#0F0F0F] transition-colors text-left">
            <div className="w-12 h-12 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-xl shrink-0" style={F.display}>
              {c.glyph}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-0.5">
                <h3 className="text-[#F5F1E8] text-base" style={F.display}>{c.name.toUpperCase()}</h3>
                <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>active {c.active}</span>
              </div>
              <p className="text-[#A8A29E] text-sm leading-snug mb-1.5" style={F.serif}>{c.desc}</p>
              <div className="flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
                <span><span style={F.mono} className="text-xs text-[#A8A29E]">{formatK(c.members)}</span> souls</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CommunityDetail({ id, onBack }) {
  const c = COMMUNITIES.find(x => x.id === id);
  const posts = POSTS.filter(p => p.community === id || id === 'general');
  if (!c) return null;
  return (
    <div className="pb-24">
      <div className="relative px-4 pt-3 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(ellipse at 50% 0%, #3B0A12 0%, transparent 60%)'
        }} />
        <button onClick={onBack} className="relative flex items-center gap-1 text-[#A8A29E] mb-3 -ml-1 text-sm" style={F.ui}>
          <ChevronLeft size={16} /> scenes
        </button>
        <div className="relative flex items-center gap-3">
          <div className="w-14 h-14 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#F5F1E8] text-2xl" style={F.display}>{c.glyph}</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#F5F1E8] text-xl" style={F.display}>{c.name.toUpperCase()}</h2>
            <p className="text-[#A8A29E] text-xs mt-0.5" style={F.serif}>{c.desc}</p>
          </div>
        </div>
        <div className="relative flex items-center gap-3 mt-4">
          <button className="flex-1 text-[#F5F1E8] text-xs py-2 border border-[#8B0000] bg-[#8B0000]/20 uppercase tracking-wider" style={F.ui}>joined</button>
          <button className="px-4 text-[#A8A29E] text-xs py-2 border border-[#2A2A2A] uppercase tracking-wider" style={F.ui}><Bell size={13} /></button>
        </div>
        <div className="relative flex items-center gap-4 mt-4 text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{formatK(c.members)}</span> souls</span>
          <span><span style={F.mono} className="text-xs text-[#A8A29E]">{Math.floor(c.members * 0.08)}</span> online</span>
          <span>active {c.active}</span>
        </div>
      </div>

      <div className="divide-y divide-[#1A1A1A]">
        {posts.length > 0 ? posts.map(post => (
          <article key={post.id} className="px-4 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">{post.avatar}</div>
              <div className="flex-1">
                <div className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</div>
                <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{post.time}</div>
              </div>
            </div>
            {post.body && <p className="text-[#F5F1E8] text-[15px] leading-relaxed" style={F.serif}>{post.body}</p>}
            {post.kind === 'photo' && <div className="mt-3"><PostImage kind={post.img} /></div>}
          </article>
        )) : (
          <div className="px-4 py-12 text-center">
            <div className="text-[#3F3F3F] text-4xl mb-3" style={F.display}>{c.glyph}</div>
            <div className="text-[#A8A29E] text-sm" style={F.serif}>quiet in here. be the first to break the silence.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MapScreen() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? MAP_PINS : MAP_PINS.filter(p => p.kind === filter);
  const activePin = MAP_PINS.find(p => p.id === active);

  return (
    <div className="absolute inset-0 top-[60px] bottom-[68px]">
      {/* Map canvas */}
      <div className="absolute inset-0 overflow-hidden bg-[#070708]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="#161618" strokeWidth="0.15" />
            </pattern>
            <radialGradient id="mapBg" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#0F0F12" />
              <stop offset="100%" stopColor="#050506" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#mapBg)" />
          <rect width="100" height="100" fill="url(#grid)" />
          {/* "river" */}
          <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#0A0E14" strokeWidth="6" fill="none" opacity="0.9" />
          <path d="M -5 35 Q 20 40, 35 50 T 70 65 T 110 75" stroke="#1A1F2E" strokeWidth="0.3" fill="none" opacity="0.5" />
          {/* "blocks" / parks */}
          <rect x="55" y="20" width="14" height="10" fill="#0E1410" opacity="0.8" />
          <rect x="20" y="65" width="10" height="12" fill="#0E1410" opacity="0.8" />
          <rect x="75" y="40" width="8" height="6" fill="#0E1410" opacity="0.8" />
          {/* major roads */}
          <line x1="0" y1="50" x2="100" y2="55" stroke="#15151A" strokeWidth="0.4" />
          <line x1="50" y1="0" x2="48" y2="100" stroke="#15151A" strokeWidth="0.4" />
          <line x1="0" y1="80" x2="100" y2="78" stroke="#15151A" strokeWidth="0.3" />
        </svg>

        {/* film grain */}
        <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\' opacity=\'0.3\'/></svg>")' }} />

        {/* Pins */}
        {filtered.map(p => {
          const k = PIN_KIND[p.kind];
          return (
            <button key={p.id}
              onClick={() => setActive(p.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}>
              <span className="absolute inset-0 -m-2 rounded-full opacity-50 animate-ping-slow"
                style={{ background: k.color }} />
              <span className="relative flex items-center justify-center w-7 h-7 rounded-full text-[#F5F1E8] text-sm shadow-lg"
                style={{ background: k.color, boxShadow: `0 0 12px ${k.color}` }}>
                {k.emoji}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top filter bar */}
      <div className="absolute top-3 left-3 right-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'all' },
          { id: 'party', label: 'parties' },
          { id: 'gig', label: 'shows' },
          { id: 'smoke', label: 'smoke' },
          { id: 'bar', label: 'bars' },
          { id: 'fashion', label: 'fits' },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider backdrop-blur-md transition-colors
              ${filter === t.id ? 'bg-[#8B0000] text-[#F5F1E8] border border-[#8B0000]' : 'bg-black/60 text-[#A8A29E] border border-[#2A2A2A]'}`}
            style={F.ui}>{t.label}</button>
        ))}
      </div>

      {/* Drop pin FAB */}
      <button className="absolute bottom-4 right-4 w-12 h-12 bg-[#8B0000] text-[#F5F1E8] flex items-center justify-center shadow-xl"
        style={{ boxShadow: '0 0 20px rgba(139,0,0,0.5)' }}>
        <Plus size={20} />
      </button>

      {/* "you are here" indicator */}
      <div className="absolute" style={{ left: '48%', top: '52%' }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <span className="absolute inset-0 -m-3 rounded-full bg-[#7B2CBF] opacity-30 animate-ping-slow" />
          <span className="relative block w-3 h-3 rounded-full bg-[#7B2CBF] ring-2 ring-[#0A0A0A]" />
        </div>
      </div>

      {/* Bottom sheet */}
      {activePin && (
        <div className="absolute inset-x-0 bottom-0 bg-[#0F0F0F] border-t border-[#2A2A2A] p-4 animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
              style={{ background: PIN_KIND[activePin.kind].color, boxShadow: `0 0 12px ${PIN_KIND[activePin.kind].color}` }}>
              {PIN_KIND[activePin.kind].emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider mb-0.5" style={{ ...F.ui, color: PIN_KIND[activePin.kind].color }}>
                {PIN_KIND[activePin.kind].label}
              </div>
              <h3 className="text-[#F5F1E8] text-base leading-tight" style={F.display}>{activePin.name.toUpperCase()}</h3>
              <p className="text-[#A8A29E] text-xs mt-0.5" style={F.mono}>{activePin.meta}</p>
            </div>
            <button onClick={() => setActive(null)} className="text-[#6B6B6B] -mt-1"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="py-2 border border-[#3F3F3F] text-[#A8A29E] text-xs uppercase tracking-wider" style={F.ui}>directions</button>
            <button className="py-2 bg-[#8B0000] text-[#F5F1E8] text-xs uppercase tracking-wider" style={F.ui}>i'm going</button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventsScreen() {
  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>RITES</h2>
          <p className="text-[#A8A29E] text-sm" style={F.serif}>what's coming. who's going.</p>
        </div>
        <button className="text-[#A8A29E]"><Filter size={16} /></button>
      </div>

      {/* week strip */}
      <div className="px-4 pb-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {['all', 'tonight', 'wknd', 'this wk', 'next wk'].map((t, i) => (
          <button key={t}
            className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border
              ${i === 0 ? 'bg-[#F5F1E8] text-[#0A0A0A] border-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
            style={F.ui}>{t}</button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {EVENTS.map(e => {
          const cover = {
            red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
            violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
            black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
          }[e.cover];
          return (
            <div key={e.id} className="border border-[#1F1F1F] overflow-hidden hover:border-[#3F3F3F] transition-colors">
              <div className="relative h-32 overflow-hidden" style={{ background: cover }}>
                <svg viewBox="0 0 200 60" className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="xMidYMid slice">
                  <path d="M 0 60 L 30 30 L 50 45 L 80 15 L 110 35 L 140 10 L 170 30 L 200 20 L 200 60 Z" fill="rgba(0,0,0,0.6)" />
                </svg>
                <div className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")' }} />
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] uppercase tracking-wider text-[#F5F1E8]" style={F.ui}>{e.date}</div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-[#F5F1E8] text-xl leading-tight" style={F.display}>{e.name.toUpperCase()}</h3>
                </div>
              </div>
              <div className="p-3 bg-[#0F0F0F]">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.serif}>{e.venue}</div>
                    <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{e.neighborhood} · <span style={F.mono} className="text-xs">{e.time}</span></div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[#F5F1E8] text-base" style={F.mono}>{e.going}</div>
                    <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>going</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  {e.tags.map(t => (
                    <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FashionScreen() {
  // masonry: split into 2 columns by index
  const col1 = FASHION.filter((_, i) => i % 2 === 0);
  const col2 = FASHION.filter((_, i) => i % 2 === 1);
  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-[#F5F1E8] text-2xl mb-1" style={F.display}>FITS</h2>
        <p className="text-[#A8A29E] text-sm" style={F.serif}>brands, drops, thrift spots — surfaced for the underrepresented.</p>
      </div>
      <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {['all', 'mens', 'womens', 'unisex', 'thrift', 'indie'].map((t, i) => (
          <button key={t}
            className={`shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border
              ${i === 0 ? 'bg-[#F5F1E8] text-[#0A0A0A] border-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
            style={F.ui}>{t}</button>
        ))}
      </div>
      <div className="px-3 grid grid-cols-2 gap-2">
        <div className="space-y-2">{col1.map(item => <FashionTile key={item.id} item={item} />)}</div>
        <div className="space-y-2">{col2.map(item => <FashionTile key={item.id} item={item} />)}</div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <div className="pb-24">
      {/* Header with cover */}
      <div className="relative h-36 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 30% 80%, #3B0A12 0%, #0A0204 60%), linear-gradient(180deg, #0A0610 0%, #0A0A0A 100%)'
        }} />
        <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="xMidYMid slice">
          <path d="M 0 100 L 20 60 L 35 75 L 55 40 L 75 65 L 95 30 L 115 55 L 140 25 L 170 55 L 200 35 L 200 100 Z" fill="#050304" />
        </svg>
      </div>

      <div className="px-4 -mt-10 relative">
        <div className="flex items-end gap-3">
          <div className="w-20 h-20 rounded-full bg-[#1A1A1A] border-2 border-[#0A0A0A] ring-1 ring-[#3F3F3F] flex items-center justify-center text-3xl">🌒</div>
          <div className="flex-1 pb-2 flex justify-end gap-2">
            <button className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>edit</button>
            <button className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]" style={F.ui}>share</button>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-[#F5F1E8] text-xl" style={F.display}>{PROFILE.name.toUpperCase()}</h2>
          <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-0.5" style={F.ui}>{PROFILE.pronouns}</div>
          <p className="text-[#F5F1E8] text-sm mt-2" style={F.serif}>{PROFILE.bio}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {PROFILE.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
            ))}
          </div>
        </div>

        {/* tonight status */}
        <div className="mt-4 p-3 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B0000] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#8B0000]" style={F.ui}>tonight</span>
          </div>
          <p className="text-[#F5F1E8] text-sm" style={F.serif}>"{PROFILE.status}"</p>
        </div>

        {/* stats */}
        <div className="grid grid-cols-3 mt-4 border border-[#1F1F1F] divide-x divide-[#1F1F1F]">
          <div className="py-3 text-center">
            <div className="text-[#F5F1E8] text-lg" style={F.mono}>{PROFILE.posts}</div>
            <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>posts</div>
          </div>
          <div className="py-3 text-center">
            <div className="text-[#F5F1E8] text-lg" style={F.mono}>{formatK(PROFILE.followers)}</div>
            <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>followers</div>
          </div>
          <div className="py-3 text-center">
            <div className="text-[#F5F1E8] text-lg" style={F.mono}>{PROFILE.following}</div>
            <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>following</div>
          </div>
        </div>

        {/* tabs */}
        <div className="flex border-b border-[#1F1F1F] mt-4">
          {['posts', 'saved', 'scenes'].map((t, i) => (
            <button key={t} className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] ${i === 0 ? 'text-[#F5F1E8] border-b border-[#8B0000]' : 'text-[#6B6B6B]'}`} style={F.ui}>{t}</button>
          ))}
        </div>

        {/* posts grid */}
        <div className="grid grid-cols-3 gap-0.5 mt-1">
          {[
            'red', 'violet', 'black', 'black', 'red', 'violet',
            'violet', 'black', 'red',
          ].map((c, i) => (
            <div key={i} className="aspect-square relative overflow-hidden" style={{
              background: {
                red: 'linear-gradient(135deg, #3B0A12, #0A0204)',
                violet: 'linear-gradient(135deg, #2D0F3F, #0A0410)',
                black: 'linear-gradient(135deg, #1F1F1F, #0A0A0A)',
              }[c]
            }}>
              <svg viewBox="0 0 50 50" className="absolute inset-0 w-full h-full opacity-40">
                <path d={i % 2 ? 'M 5 50 L 15 30 L 25 40 L 35 20 L 45 35 L 50 50 Z' : 'M 25 10 L 35 25 L 30 40 L 20 40 L 15 25 Z'} fill="rgba(0,0,0,0.6)" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// DMs OVERLAY
// ─────────────────────────────────────────────────────────────────
function DMsOverlay({ onClose }) {
  return (
    <div className="absolute inset-0 bg-[#0A0A0A] z-30 flex flex-col animate-slide-in-right">
      <div className="px-4 pt-3 pb-3 border-b border-[#1A1A1A] flex items-center gap-3">
        <button onClick={onClose} className="text-[#A8A29E]"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <h2 className="text-[#F5F1E8] text-base" style={F.display}>WHISPERS</h2>
        </div>
        <button className="text-[#A8A29E]"><Plus size={18} /></button>
      </div>
      <div className="px-4 py-3 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#1F1F1F]">
          <Search size={13} className="text-[#6B6B6B]" />
          <input placeholder="search whispers" className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]" style={F.ui} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-[#1A1A1A]">
        {CONVERSATIONS.map(c => (
          <button key={c.id} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#0F0F0F] text-left">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-lg">
                {c.avatar}
              </div>
              {c.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#8B0000] text-[#F5F1E8] text-[10px] flex items-center justify-center" style={F.mono}>{c.unread}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`truncate ${c.unread ? 'text-[#F5F1E8]' : 'text-[#A8A29E]'} text-sm`} style={F.ui}>{c.user}</span>
                <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{c.time}</span>
              </div>
              <p className={`truncate text-xs mt-0.5 ${c.unread ? 'text-[#F5F1E8]' : 'text-[#6B6B6B]'}`} style={F.serif}>{c.last}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPOSE OVERLAY
// ─────────────────────────────────────────────────────────────────
function ComposeOverlay({ onClose }) {
  const [text, setText] = useState('');
  const [scene, setScene] = useState('general');
  return (
    <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-md z-30 flex flex-col animate-fade-in">
      <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-[#1A1A1A]">
        <button onClick={onClose} className="text-[#A8A29E] text-sm" style={F.ui}>cancel</button>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B]" style={F.ui}>· compose ·</div>
        <button className="text-[#8B0000] text-sm uppercase tracking-wider" style={F.ui}>post</button>
      </div>
      <div className="flex-1 px-4 pt-4">
        <textarea
          autoFocus value={text} onChange={e => setText(e.target.value)}
          placeholder="say something..."
          className="w-full bg-transparent text-[#F5F1E8] text-lg outline-none resize-none placeholder:text-[#3F3F3F] min-h-[120px]"
          style={F.serif} />
      </div>
      <div className="px-4 py-3 border-t border-[#1A1A1A]">
        <div className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-2" style={F.ui}>post to</div>
        <div className="flex flex-wrap gap-1.5">
          {COMMUNITIES.slice(0, 6).map(c => (
            <button key={c.id} onClick={() => setScene(c.id)}
              className={`px-2.5 py-1 text-[11px] border uppercase tracking-wider
                ${scene === c.id ? 'bg-[#8B0000] border-[#8B0000] text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E]'}`}
              style={F.ui}>{c.name}</button>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 flex items-center gap-4 border-t border-[#1A1A1A]">
        <button className="text-[#A8A29E]"><ImageIcon size={18} /></button>
        <button className="text-[#A8A29E]"><MapPin size={18} /></button>
        <button className="text-[#A8A29E]"><Mic size={18} /></button>
        <button className="text-[#A8A29E] ml-auto"><Smile size={18} /></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CHROME
// ─────────────────────────────────────────────────────────────────
function Header({ tab, onDMs, onCompose, communityName }) {
  const titles = {
    home: null, // logo instead
    communities: null,
    map: 'PROXIMITY',
    events: null,
    profile: null,
    fashion: null,
  };
  return (
    <div className="absolute top-0 inset-x-0 z-20 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-[#1A1A1A]">
      <div className="px-4 h-[60px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {communityName ? (
            <span className="text-[#F5F1E8] text-base" style={F.display}>{communityName}</span>
          ) : tab === 'home' ? (
            <span className="text-[#F5F1E8] text-3xl leading-none" style={F.brand}>Coven</span>
          ) : (
            <span className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>
              {(titles[tab] || tab.toUpperCase())}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {tab === 'home' && (
            <button onClick={onCompose} className="text-[#A8A29E] hover:text-[#F5F1E8]"><Plus size={20} /></button>
          )}
          <button onClick={onDMs} className="text-[#A8A29E] hover:text-[#F5F1E8] relative">
            <MessageCircle size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#8B0000]" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, onChange }) {
  const items = [
    { id: 'home', label: 'feed', icon: Hash },
    { id: 'communities', label: 'scenes', icon: Users },
    { id: 'map', label: 'map', icon: MapPin },
    { id: 'events', label: 'rites', icon: Calendar },
    { id: 'profile', label: 'self', icon: User },
  ];
  return (
    <div className="absolute bottom-0 inset-x-0 z-20 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A]">
      <div className="grid grid-cols-5 h-[68px]">
        {items.map(it => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-[#F5F1E8]' : 'text-[#6B6B6B]'}`}>
              <div className="relative">
                {active && <span className="absolute inset-0 -m-1.5 bg-[#8B0000]/20 blur-md rounded-full" />}
                <Icon size={18} strokeWidth={active ? 1.75 : 1.25} className="relative" />
              </div>
              <span className="text-[9px] uppercase tracking-[0.18em]" style={F.ui}>{it.label}</span>
              {active && <span className="absolute top-0 w-8 h-[1px] bg-[#8B0000]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('home');
  const [community, setCommunity] = useState(null);
  const [showDMs, setShowDMs] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const scrollRef = useRef(null);

  // Inject Google Fonts + custom keyframes
  useEffect(() => {
    const link = document.createElement('link');
    link.href = FONT_HREF;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { scrollbar-width: none; }
      @keyframes flutter {
        0%, 100% { transform: translateY(0) rotate(0); }
        20% { transform: translateY(-3px) rotate(-12deg); }
        40% { transform: translateY(-6px) rotate(8deg); }
        60% { transform: translateY(-4px) rotate(-6deg); }
        80% { transform: translateY(-2px) rotate(4deg); }
      }
      .flutter { animation: flutter 0.6s ease-in-out; display: inline-block; }
      @keyframes pulseSlow { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
      .animate-pulse-slow { animation: pulseSlow 2.5s ease-in-out infinite; }
      @keyframes pingSlow {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .animate-ping-slow { animation: pingSlow 2.5s cubic-bezier(0,0,0.2,1) infinite; }
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slide-up { animation: slideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in { animation: fadeIn 0.25s ease-out; }
      @keyframes screenIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-screen-in { animation: screenIn 0.3s ease-out; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  // scroll to top on tab change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [tab, community]);

  const handleOpenCommunity = (id) => {
    setCommunity(id);
    setTab('communities');
  };

  // Special case: fashion is a "community" but renders the fashion screen
  const isFashion = community === 'fashion';

  let content;
  if (community && tab === 'communities') {
    content = isFashion
      ? <FashionScreen />
      : <CommunityDetail id={community} onBack={() => setCommunity(null)} />;
  } else {
    switch (tab) {
      case 'home': content = <HomeScreen onOpenCommunity={handleOpenCommunity} />; break;
      case 'communities': content = <CommunitiesScreen onOpenCommunity={(id) => setCommunity(id)} />; break;
      case 'map': content = <MapScreen />; break;
      case 'events': content = <EventsScreen />; break;
      case 'profile': content = <ProfileScreen />; break;
      default: content = <HomeScreen onOpenCommunity={handleOpenCommunity} />;
    }
  }

  const communityName = community && tab === 'communities'
    ? COMMUNITIES.find(c => c.id === community)?.name?.toUpperCase()
    : null;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-0 sm:p-6" style={F.ui}>
      {/* Phone frame */}
      <div className="relative w-full sm:w-[400px] h-screen sm:h-[860px] sm:max-h-[90vh] sm:rounded-[44px] overflow-hidden bg-[#0A0A0A] sm:border sm:border-[#1F1F1F]"
        style={{ boxShadow: '0 30px 100px rgba(139,0,0,0.15), 0 0 1px rgba(245,241,232,0.05)' }}>

        {/* film grain layer */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none z-10 mix-blend-overlay"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

        {/* vignette */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />

        <Header
          tab={tab}
          communityName={communityName}
          onDMs={() => setShowDMs(true)}
          onCompose={() => setShowCompose(true)}
        />

        {/* Scrollable content */}
        <div ref={scrollRef} className="absolute inset-0 top-[60px] bottom-[68px] overflow-y-auto overflow-x-hidden">
          <div key={`${tab}-${community || 'root'}`} className="animate-screen-in">
            {tab !== 'map' && content}
          </div>
        </div>

        {/* Map renders absolutely so it can fill */}
        {tab === 'map' && content}

        <BottomNav tab={tab} onChange={(t) => { setTab(t); setCommunity(null); }} />

        {showDMs && <DMsOverlay onClose={() => setShowDMs(false)} />}
        {showCompose && <ComposeOverlay onClose={() => setShowCompose(false)} />}
      </div>
    </div>
  );
}
