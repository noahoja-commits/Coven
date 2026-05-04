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
  'https://fonts.googleapis.com/css2?family=UnifrakturCook:wght@700&family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600;700&family=VT323&family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&display=swap';

const F = {
  brand: { fontFamily: '"UnifrakturCook", serif', fontWeight: 700 },
  display: { fontFamily: '"Cinzel", serif', letterSpacing: '0.08em' },
  serif: { fontFamily: '"Cormorant Garamond", serif' },
  ui: { fontFamily: '"Manrope", sans-serif' },
  mono: { fontFamily: '"VT323", monospace', letterSpacing: '0.04em' },
  scripture: { fontFamily: '"IM Fell English", serif' },
  scriptureSC: { fontFamily: '"IM Fell English SC", serif' },
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
  { id: 'm9',  kind: 'prayer', x: 52, y: 42, name: 'St. John the Divine', meta: 'open · vespers 6pm' },
  { id: 'm10', kind: 'prayer', x: 28, y: 70, name: 'Old St. Patrick\u2019s', meta: 'mass 8am · candles always' },
  { id: 'm11', kind: 'prayer', x: 82, y: 28, name: 'Green-Wood Chapel', meta: 'gates close at dusk' },
  { id: 'm12', kind: 'ritual', x: 18, y: 35, name: 'Prospect grove', meta: 'new moon circle · sat 9pm' },
  { id: 'm13', kind: 'ritual', x: 60, y: 60, name: 'Crescent Hill', meta: 'open · bring an offering' },
  { id: 'm14', kind: 'ritual', x: 88, y: 70, name: 'Rooftop circle, Bushwick', meta: 'fri midnight · 7 invited' },
];

const PIN_KIND = {
  party:   { label: 'party',   color: '#8B0000', emoji: '◈' },
  gig:     { label: 'show',    color: '#7B2CBF', emoji: '♪' },
  smoke:   { label: 'smoke',   color: '#6B6B6B', emoji: '∽' },
  bar:     { label: 'bar',     color: '#B45309', emoji: '◐' },
  fashion: { label: 'fits',    color: '#A8A29E', emoji: '✕' },
  prayer:  { label: 'prayer',  color: '#C9A961', emoji: '✟' },
  ritual:  { label: 'ritual',  color: '#6B0F8C', emoji: '⛧' },
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
// THE LIBRARY — sacred + profane texts
// NOTE: full passages should be extracted from your PDFs and pasted
// into the `chapters` arrays below. Real opening text is included
// here as a starting point. All texts are public domain.
// ─────────────────────────────────────────────────────────────────
const TEXTS = [
  {
    id: 'kjv',
    title: 'The Authorized King James Bible',
    shortTitle: 'King James Bible',
    author: 'Translated A.D. 1611',
    era: '1611',
    category: 'scripture',
    glyph: '✟',
    cover: 'oxblood',
    sigil: 'cross',
    description: 'The 1611 Authorized Version. Old and New Testament.',
    chapters: [
      {
        id: 'gen-1', title: 'Genesis · Chapter I',
        verses: [
          { n: 1, text: 'In the beginning God created the heaven and the earth.' },
          { n: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
          { n: 3, text: 'And God said, Let there be light: and there was light.' },
          { n: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
          { n: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
          { n: 6, text: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.' },
          { n: 7, text: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.' },
        ],
      },
      {
        id: 'psalm-23', title: 'The Book of Psalms · Psalm XXIII',
        verses: [
          { n: 1, text: 'The LORD is my shepherd; I shall not want.' },
          { n: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
          { n: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\u2019s sake.' },
          { n: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
          { n: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
          { n: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
        ],
      },
      {
        id: 'john-1', title: 'The Gospel of John · Chapter I',
        verses: [
          { n: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
          { n: 2, text: 'The same was in the beginning with God.' },
          { n: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
          { n: 4, text: 'In him was life; and the life was the light of men.' },
          { n: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
        ],
      },
      { id: 'rev-1', title: 'The Revelation · Chapter I', verses: [{ n: 1, text: 'The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass\u2026' }, { n: 0, text: '[ Paste the rest of the chapter from your PDF here. ]' }] },
    ],
  },
  {
    id: 'solomon-key',
    title: 'The Key of Solomon the King',
    shortTitle: 'Clavicula Salomonis',
    author: 'attr. Solomon · trans. S. L. MacGregor Mathers',
    era: 'XV c.',
    category: 'grimoire',
    glyph: '✶',
    cover: 'darkleather',
    sigil: 'pentacle',
    description: 'The principal grimoire of ceremonial magic. Conjurations, pentacles, and the art of the magical circle.',
    chapters: [
      {
        id: 'preface', title: 'Preface · Of the Key',
        verses: [
          { n: 1, text: 'Solomon, the Son of David, King of Israel, hath said that the beginning of our Key is to fear God, to adore Him, to honour Him with contrition of heart, to invoke Him in all matters which we wish to undertake, and to operate with very great devotion, for thus God will lead us in the right way.' },
          { n: 2, text: 'When, therefore, thou shalt have a desire to acquire the knowledge of magical arts and sciences, it is necessary to have prepared the order of hours, days, and of the position of the Moon, without the observation of which thou canst reap no fruit.' },
        ],
      },
      {
        id: 'book1-ch1', title: 'Book the First · Chapter I',
        verses: [
          { n: 1, text: 'Concerning the divine love which ought to precede the acquisition of this knowledge.' },
          { n: 2, text: 'When any one wisheth to acquire the knowledge and practice of this our holy Art, he must, before all things, take heed unto himself that he be in good health, of good moral character, and free from all impediment of sin.' },
          { n: 0, text: '[ Continue from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'grimorium-verum',
    title: 'Grimorium Verum',
    shortTitle: 'The True Grimoire',
    author: 'attr. Alibeck the Egyptian, Memphis, 1517',
    era: 'XVIII c.',
    category: 'grimoire',
    glyph: '◬',
    cover: 'midnight',
    sigil: 'triangle',
    description: 'The True Grimoire. Hierarchy of spirits, characters, and operations of practical magic.',
    chapters: [
      {
        id: 'intro', title: 'Approbation',
        verses: [
          { n: 1, text: 'There are without doubt many Grimoires, but none of them give true and certain knowledge save this, which contains the secrets of the True Magick.' },
          { n: 2, text: 'In the spirit hierarchy that follows, the three superior spirits are Lucifer, Beelzebuth, and Astaroth. Beneath them stand their lieutenants, and beneath them, those who serve.' },
          { n: 0, text: '[ Paste the listings of spirits and characters from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'picatrix',
    title: 'Picatrix',
    shortTitle: 'Ghāyat al-Ḥakīm',
    author: 'attr. al-Majrīṭī · X–XI c.',
    era: 'XI c.',
    category: 'grimoire',
    glyph: '☉',
    cover: 'fadedgreen',
    sigil: 'sun',
    description: 'The Aim of the Sage. The most influential treatise on astrological magic in the medieval West.',
    chapters: [
      {
        id: 'b1-ch1', title: 'Book the First · Of Wisdom',
        verses: [
          { n: 1, text: 'The Sages have said: Wisdom is a sacred mountain, and he who would ascend it must first wash himself of all that is unclean, and bind his soul to the rhythm of the heavens.' },
          { n: 2, text: 'Know therefore that all things below partake of the influence of things above, and the wise man is he who reads in the stars the language of God.' },
          { n: 0, text: '[ Paste subsequent passages from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'honorius',
    title: 'The Sworn Book of Honorius',
    shortTitle: 'Liber Iuratus Honorii',
    author: 'attr. Honorius of Thebes',
    era: 'XIII c.',
    category: 'grimoire',
    glyph: '✠',
    cover: 'oxblood',
    sigil: 'crossfleury',
    description: 'The sworn book. One of the foundational texts of Christian magic.',
    chapters: [
      {
        id: 'oath', title: 'The Sworn Oath',
        verses: [
          { n: 1, text: 'I swear by the living God, by the Father, by the Son, and by the Holy Spirit, by the four-and-twenty Elders standing before the throne, that I shall not reveal the contents of this book to any save those whom I have proven to be of pure heart and holy purpose.' },
          { n: 0, text: '[ Paste the rest from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'goetia',
    title: 'The Lesser Key of Solomon',
    shortTitle: 'Goetia',
    author: 'compiled c. 1641 · trans. Mathers / Crowley',
    era: 'XVII c.',
    category: 'grimoire',
    glyph: '⛧',
    cover: 'black',
    sigil: 'goetic',
    description: 'The Goetia — the seventy-two spirits which Solomon bound, with their names, offices, and seals.',
    chapters: [
      {
        id: 'spirits-1-3', title: 'Of the Spirits · I — III',
        verses: [
          { n: 1, text: 'The first principal spirit is a King ruling in the East, called Bael. He maketh thee to go invisible. He ruleth over 66 Legions of Infernal Spirits. He appeareth in divers shapes, sometimes like a Cat, sometimes like a Toad, and sometimes like a Man, and sometimes all these forms at once.' },
          { n: 2, text: 'The second spirit is a Duke called Agares. He is under the power of the East, and cometh up in the form of an old fair Man, riding upon a crocodile, carrying a goshawk upon his fist. He maketh them to run that stand still, and bringeth back runaways.' },
          { n: 3, text: 'The third spirit is a mighty and strong Prince, ruling in the part of the North, by name Vassago. He is of good nature, and his office is to declare things past and to come, and to discover all things hid or lost.' },
          { n: 0, text: '[ Paste the remaining 69 spirits from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'grand-grimoire',
    title: 'The Grand Grimoire',
    shortTitle: 'Le Grand Grimoire',
    author: 'attr. Antonio Venitiana del Rabina',
    era: 'XVIII c.',
    category: 'grimoire',
    glyph: '☿',
    cover: 'darkleather',
    sigil: 'caduceus',
    description: 'The Red Dragon. Containing the dread art of the Pact, and the means of compelling the spirits.',
    chapters: [
      {
        id: 'pact', title: 'Of the Great Pact',
        verses: [
          { n: 1, text: 'Whosoever wisheth to make compact with the spirit Lucifuge Rofocale must first prepare himself with three days of fasting, that his body and soul may be made subtle and apt for the work that follows.' },
          { n: 0, text: '[ Paste the rest of the working from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'abramelin',
    title: 'The Sacred Magic of Abra-Melin the Mage',
    shortTitle: 'Abramelin',
    author: 'Abraham of Worms · trans. Mathers, 1898',
    era: 'XV c.',
    category: 'grimoire',
    glyph: '✡',
    cover: 'fadedgreen',
    sigil: 'hexagram',
    description: 'A grimoire of the fifteenth century, as delivered by Abraham the Jew unto his son Lamech.',
    chapters: [
      {
        id: 'b1-ch1', title: 'Book the First · Chapter I',
        verses: [
          { n: 1, text: 'I, Abraham, the Son of Simon, do leave unto thee, my son Lamech, this our Sacred Magic, the which I have received from my forefathers, and which I have proved by long experience, that thou mayest after my death use it for thy good and for the good of thy fellow men.' },
          { n: 2, text: 'The end of this Holy Magic is the obtaining of the Knowledge and Conversation of thy Holy Guardian Angel, which is the foundation of all true wisdom and of all true power.' },
          { n: 0, text: '[ Paste the rest of the operation from your PDF here. ]' },
        ],
      },
    ],
  },
];

// Mock community highlights — keyed as "bookId-chapterId-verseN"
const HIGHLIGHTS = {
  'kjv-gen-1-2': [
    { user: 'cryptic.rose', avatar: '🌹', comment: 'the silence before. everything begins in darkness.', likes: 47, time: '2d' },
    { user: 'vesper.exe', avatar: '✟', comment: '"without form, and void" — the most goth opening in literature', likes: 89, time: '5d' },
  ],
  'kjv-psalm-23-4': [
    { user: 'ash.in.october', avatar: '🕯', comment: 'i read this every winter. it always lands different.', likes: 34, time: '1w' },
  ],
  'kjv-john-1-5': [
    { user: 'lilith_xiv', avatar: '🦇', comment: 'the entire thesis of the album i\'m writing tbh', likes: 156, time: '3d' },
    { user: 'mortuary.dj', avatar: '⚰', comment: 'comprehended ≠ overcame. the dark just doesn\'t get it.', likes: 72, time: '4d' },
  ],
  'goetia-spirits-1-3-1': [
    { user: 'mortis.kvlt', avatar: '☠', comment: 'bael appearing as a cat, a toad, and a man simultaneously is the most fucked up flex', likes: 203, time: '6h' },
  ],
  'solomon-key-preface-1': [
    { user: 'cryptic.rose', avatar: '🌹', comment: 'fear → adore → honour → invoke. the order matters.', likes: 28, time: '1d' },
  ],
};

// ─────────────────────────────────────────────────────────────────
// LIBRARY — visual helpers
// ─────────────────────────────────────────────────────────────────
function BookSigil({ kind, color = '#5B0F1A' }) {
  const props = { stroke: color, strokeWidth: 0.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'cross':
      return <g {...props}><line x1="20" y1="8" x2="20" y2="32" /><line x1="12" y1="16" x2="28" y2="16" /></g>;
    case 'pentacle':
      return <g {...props}><circle cx="20" cy="20" r="9" /><path d="M 20 11 L 27 25 L 13 17 L 27 17 L 13 25 Z" /></g>;
    case 'triangle':
      return <g {...props}><path d="M 20 10 L 29 28 L 11 28 Z" /><circle cx="20" cy="22" r="3" /></g>;
    case 'sun':
      return <g {...props}><circle cx="20" cy="20" r="5" />{Array.from({length:8}).map((_,i)=>{const a=(i*Math.PI)/4;return <line key={i} x1={20+Math.cos(a)*8} y1={20+Math.sin(a)*8} x2={20+Math.cos(a)*11} y2={20+Math.sin(a)*11}/>})}<circle cx="20" cy="20" r="1.5" fill={color} /></g>;
    case 'crossfleury':
      return <g {...props}><line x1="20" y1="8" x2="20" y2="32" /><line x1="10" y1="18" x2="30" y2="18" /><circle cx="20" cy="8" r="1.5" /><circle cx="20" cy="32" r="1.5" /><circle cx="10" cy="18" r="1.5" /><circle cx="30" cy="18" r="1.5" /></g>;
    case 'goetic':
      return <g {...props}><circle cx="20" cy="20" r="10" /><path d="M 20 10 L 28.66 25 L 11.34 25 Z" /><path d="M 20 30 L 11.34 15 L 28.66 15 Z" /></g>;
    case 'caduceus':
      return <g {...props}><line x1="20" y1="8" x2="20" y2="32" /><path d="M 20 14 Q 14 18 20 22 Q 26 26 20 30" /><path d="M 20 14 Q 26 18 20 22 Q 14 26 20 30" /></g>;
    case 'hexagram':
      return <g {...props}><path d="M 20 9 L 29 25 L 11 25 Z" /><path d="M 20 31 L 11 15 L 29 15 Z" /></g>;
    default:
      return null;
  }
}

function BookCover({ book, onClick, progress = 0 }) {
  const palettes = {
    oxblood: { bg: 'linear-gradient(135deg, #4A0F18 0%, #2A0810 60%, #1A0408 100%)', border: '#6B1A24', accent: '#C9A961', spine: '#6B1A24' },
    darkleather: { bg: 'linear-gradient(135deg, #3A2418 0%, #1F140C 60%, #0F0A06 100%)', border: '#5C3A24', accent: '#B89968', spine: '#5C3A24' },
    midnight: { bg: 'linear-gradient(135deg, #1A1A2E 0%, #0F0F1F 60%, #08081A 100%)', border: '#2D2D4A', accent: '#9B8FB8', spine: '#2D2D4A' },
    fadedgreen: { bg: 'linear-gradient(135deg, #1F2E20 0%, #121F14 60%, #0A140A 100%)', border: '#3A4D2D', accent: '#A89968', spine: '#3A4D2D' },
    black: { bg: 'linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%)', border: '#2D2D2D', accent: '#9B7B7B', spine: '#2D2D2D' },
  };
  const p = palettes[book.cover] || palettes.darkleather;

  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div className="relative aspect-[3/4] overflow-hidden border" style={{ background: p.bg, borderColor: p.border, boxShadow: '4px 4px 0 rgba(0,0,0,0.4), inset 0 0 30px rgba(0,0,0,0.6)' }}>
        {/* leather grain */}
        <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\'><filter id=\'n\'><feTurbulence baseFrequency=\'1.2\' numOctaves=\'2\'/></filter><rect width=\'120\' height=\'120\' filter=\'url(%23n)\'/></svg>")' }} />
        {/* ornamental frame */}
        <svg viewBox="0 0 100 133" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <rect x="6" y="8" width="88" height="117" fill="none" stroke={p.accent} strokeWidth="0.4" opacity="0.7" />
          <rect x="8" y="10" width="84" height="113" fill="none" stroke={p.accent} strokeWidth="0.2" opacity="0.5" />
          {/* corner flourishes */}
          {[[8,10],[92,10],[8,123],[92,123]].map(([x,y],i)=>(
            <g key={i} stroke={p.accent} strokeWidth="0.3" fill="none" opacity="0.6">
              <circle cx={x} cy={y} r="1.5" />
              <circle cx={x} cy={y} r="0.5" fill={p.accent} />
            </g>
          ))}
        </svg>
        {/* sigil */}
        <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-12 h-12">
          <svg viewBox="0 0 40 40" className="w-full h-full" style={{ filter: `drop-shadow(0 0 4px ${p.accent}40)` }}>
            <BookSigil kind={book.sigil} color={p.accent} />
          </svg>
        </div>
        {/* title */}
        <div className="absolute inset-x-3 top-[42%] text-center">
          <div className="text-[10px] uppercase tracking-[0.25em] mb-1.5 leading-tight" style={{ ...F.scriptureSC, color: p.accent }}>
            {book.shortTitle}
          </div>
          <div className="h-px w-8 mx-auto mb-2" style={{ background: p.accent, opacity: 0.6 }} />
          <div className="text-[8px] uppercase tracking-[0.2em] leading-snug" style={{ ...F.ui, color: p.accent, opacity: 0.7 }}>
            {book.era}
          </div>
        </div>
        {/* spine effect on left */}
        <div className="absolute left-0 inset-y-0 w-1.5" style={{ background: `linear-gradient(90deg, rgba(0,0,0,0.6), transparent)` }} />
        {/* progress */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 h-0.5" style={{ width: `${progress}%`, background: p.accent }} />
        )}
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[#F5F1E8] text-xs leading-tight" style={F.serif}>{book.title}</div>
        <div className="text-[9px] text-[#6B6B6B] uppercase tracking-wider mt-0.5" style={F.ui}>{book.category}</div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// LIBRARY — overlay + reader
// ─────────────────────────────────────────────────────────────────
function LibraryOverlay({ onClose, progress }) {
  const [openBook, setOpenBook] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = TEXTS.filter(b => {
    if (filter !== 'all' && b.category !== filter) return false;
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.shortTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (openBook) {
    const book = TEXTS.find(b => b.id === openBook);
    return <ReaderView book={book} onBack={() => setOpenBook(null)} onCloseLibrary={onClose} />;
  }

  return (
    <div className="absolute inset-0 z-30 animate-fade-in" style={{ background: '#0A0608' }}>
      {/* atmospheric backdrop */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #1F0F08 0%, #0A0608 60%, #050204 100%)',
      }} />
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\' numOctaves=\'3\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      {/* header */}
      <div className="relative px-4 pt-3 pb-3 border-b border-[#1A0F0A]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="flex items-center gap-1 text-[#A89968] text-sm" style={F.ui}>
            <ChevronLeft size={16} /> coven
          </button>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#6B5C3A]" style={F.ui}>· library ·</div>
          <button className="text-[#A89968]"><Search size={16} /></button>
        </div>
        <h2 className="text-center text-[#C9A961] text-3xl leading-none" style={F.brand}>The Grimoires</h2>
        <p className="text-center text-[#6B5C3A] text-xs mt-1.5 italic" style={F.scripture}>sacred texts, profane works, the keys between</p>
      </div>

      {/* search */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 border" style={{ background: '#0F0808', borderColor: '#2A1810' }}>
          <Search size={13} className="text-[#6B5C3A]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="search the library"
            className="bg-transparent text-[#C9A961] text-sm outline-none flex-1 placeholder:text-[#6B5C3A]"
            style={F.scripture} />
        </div>
      </div>

      {/* filters */}
      <div className="relative px-4 pb-4 flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'all texts' },
          { id: 'scripture', label: 'scripture' },
          { id: 'grimoire', label: 'grimoires' },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className="shrink-0 px-3 py-1 text-[10px] uppercase tracking-wider border transition-colors"
            style={{
              ...F.ui,
              background: filter === t.id ? '#C9A961' : 'transparent',
              color: filter === t.id ? '#0A0608' : '#A89968',
              borderColor: filter === t.id ? '#C9A961' : '#2A1810',
            }}>{t.label}</button>
        ))}
      </div>

      {/* shelf */}
      <div className="relative h-[calc(100%-220px)] overflow-y-auto px-4 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B5C3A] text-sm italic" style={F.scripture}>no text by that name in this house</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {filtered.map(book => (
              <BookCover key={book.id} book={book} progress={progress[book.id] || 0} onClick={() => setOpenBook(book.id)} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <div className="inline-block w-16 h-px" style={{ background: '#2A1810' }} />
          <div className="text-[10px] text-[#6B5C3A] my-2 uppercase tracking-[0.3em]" style={F.scriptureSC}>· finis ·</div>
          <div className="inline-block w-16 h-px" style={{ background: '#2A1810' }} />
        </div>
      </div>
    </div>
  );
}

function ReaderView({ book, onBack, onCloseLibrary }) {
  const [chapterIdx, setChapterIdx] = useState(0);
  const [showTOC, setShowTOC] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [bookmarked, setBookmarked] = useState(false);

  const ch = book.chapters[chapterIdx];
  const totalChapters = book.chapters.length;
  const progress = ((chapterIdx + 1) / totalChapters) * 100;

  return (
    <div className="absolute inset-0 z-30 flex flex-col animate-fade-in" style={{ background: '#0A0608' }}>
      {/* header (dark) */}
      <div className="relative px-3 pt-3 pb-2 border-b border-[#1A0F0A] flex items-center justify-between" style={{ background: '#0A0608' }}>
        <button onClick={onBack} className="text-[#A89968] flex items-center gap-1 text-sm" style={F.ui}>
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 text-center px-2">
          <div className="text-[#C9A961] text-xs leading-tight truncate" style={F.scriptureSC}>{book.shortTitle.toUpperCase()}</div>
          <div className="text-[9px] text-[#6B5C3A] uppercase tracking-wider mt-0.5" style={F.ui}>chapter {chapterIdx + 1} / {totalChapters}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setBookmarked(!bookmarked)} className={bookmarked ? 'text-[#C9A961]' : 'text-[#A89968]'}>
            <Bookmark size={16} fill={bookmarked ? '#C9A961' : 'none'} />
          </button>
          <button onClick={() => setShowTOC(true)} className="text-[#A89968]" style={{ ...F.scriptureSC, fontSize: 13 }}>☰</button>
        </div>
      </div>

      {/* THE PAGE */}
      <div className="flex-1 overflow-y-auto relative" style={{
        background: 'radial-gradient(ellipse at 50% 30%, #EDE0C2 0%, #DDCDA8 65%, #B8A47C 100%)',
      }}>
        {/* parchment grain */}
        <div className="absolute inset-0 opacity-[0.30] mix-blend-multiply pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'160\' height=\'160\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.7\' numOctaves=\'3\'/></filter><rect width=\'160\' height=\'160\' filter=\'url(%23n)\' opacity=\'0.5\'/></svg>")' }} />
        {/* edge vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          boxShadow: 'inset 0 0 60px rgba(80, 50, 20, 0.4), inset 0 0 20px rgba(40, 20, 10, 0.5)'
        }} />
        {/* aged stains */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120,80,40,0.4) 0%, transparent 25%), radial-gradient(circle at 85% 15%, rgba(100,60,30,0.3) 0%, transparent 20%), radial-gradient(circle at 75% 65%, rgba(140,90,50,0.25) 0%, transparent 15%)'
        }} />

        <article className="relative px-7 py-10 max-w-prose mx-auto">
          {/* ornament */}
          <div className="text-center mb-4">
            <div className="text-[#5B0F1A] text-2xl leading-none" style={F.brand}>· · ·</div>
          </div>

          {/* chapter title */}
          <h2 className="text-center text-[#3A1F0A] text-xl mb-1" style={F.brand}>
            {ch.title}
          </h2>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-px w-8" style={{ background: '#5B0F1A', opacity: 0.5 }} />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#5B0F1A]" style={F.scriptureSC}>{book.era}</span>
            <div className="h-px w-8" style={{ background: '#5B0F1A', opacity: 0.5 }} />
          </div>

          {/* verses */}
          <div style={{ ...F.scripture, color: '#2A1808', fontSize: '17px', lineHeight: '1.75' }}>
            {ch.verses.map((v, i) => {
              const hKey = `${book.id}-${ch.id}-${v.n}`;
              const hl = HIGHLIGHTS[hKey];
              const isPlaceholder = v.text.startsWith('[');

              if (isPlaceholder) {
                return (
                  <p key={i} className="text-center my-6 italic text-[#6B4A2A]" style={{ ...F.scripture, fontSize: '13px' }}>
                    {v.text}
                  </p>
                );
              }

              return (
                <p key={i} className="mb-4">
                  {/* drop cap on first verse */}
                  {i === 0 && (
                    <span className="float-left text-[#5B0F1A] mr-2 leading-[0.85]" style={{ ...F.brand, fontSize: '60px' }}>
                      {v.text.charAt(0)}
                    </span>
                  )}
                  {v.n > 0 && (
                    <span className="text-[#5B0F1A] mr-1.5 align-super" style={{ ...F.scriptureSC, fontSize: '11px' }}>
                      {v.n}
                    </span>
                  )}
                  <span
                    onClick={() => hl && setActiveHighlight({ key: hKey, verse: v, highlights: hl })}
                    className={hl ? 'cursor-pointer relative' : ''}
                    style={hl ? { textDecoration: 'underline', textDecorationColor: '#5B0F1A', textDecorationThickness: '1.5px', textUnderlineOffset: '4px', backgroundColor: 'rgba(91,15,26,0.08)' } : {}}>
                    {i === 0 ? v.text.slice(1) : v.text}
                  </span>
                  {hl && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[#5B0F1A] align-super" style={{ ...F.ui, fontSize: '9px' }}>
                      <MessageCircle size={9} />{hl.length}
                    </span>
                  )}
                </p>
              );
            })}
          </div>

          {/* end ornament */}
          <div className="text-center mt-10 mb-4">
            <div className="text-[#5B0F1A] text-2xl leading-none" style={F.brand}>· ❦ ·</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.3em] text-[#5B0F1A]/70" style={F.scriptureSC}>chapter ends</div>
          </div>
        </article>
      </div>

      {/* footer nav (dark) */}
      <div className="relative px-4 py-2.5 border-t border-[#1A0F0A] flex items-center gap-3" style={{ background: '#0A0608' }}>
        <button
          disabled={chapterIdx === 0}
          onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
          className={`text-xs uppercase tracking-wider ${chapterIdx === 0 ? 'text-[#3A2A1A]' : 'text-[#A89968]'}`}
          style={F.scriptureSC}>← prev</button>
        <div className="flex-1 h-1 relative" style={{ background: '#1A0F0A' }}>
          <div className="absolute inset-y-0 left-0" style={{ width: `${progress}%`, background: '#C9A961' }} />
        </div>
        <button
          disabled={chapterIdx === totalChapters - 1}
          onClick={() => setChapterIdx(i => Math.min(totalChapters - 1, i + 1))}
          className={`text-xs uppercase tracking-wider ${chapterIdx === totalChapters - 1 ? 'text-[#3A2A1A]' : 'text-[#A89968]'}`}
          style={F.scriptureSC}>next →</button>
      </div>

      {/* TOC overlay */}
      {showTOC && (
        <div className="absolute inset-0 z-40 animate-fade-in" style={{ background: 'rgba(10,6,8,0.95)', backdropFilter: 'blur(8px)' }}>
          <div className="px-4 pt-4 pb-3 border-b border-[#1A0F0A] flex items-center justify-between">
            <div className="text-[#C9A961] text-base" style={F.brand}>Contents</div>
            <button onClick={() => setShowTOC(false)} className="text-[#A89968]"><X size={18} /></button>
          </div>
          <div className="p-4">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#6B5C3A] mb-3" style={F.scriptureSC}>{book.shortTitle}</div>
            <div className="space-y-1">
              {book.chapters.map((c, i) => (
                <button key={c.id}
                  onClick={() => { setChapterIdx(i); setShowTOC(false); }}
                  className="w-full text-left flex items-baseline gap-3 py-2.5 px-2 hover:bg-[#1A0F0A] transition-colors border-b border-[#1A0F0A]/50">
                  <span className="text-[10px] text-[#6B5C3A] w-6" style={F.scriptureSC}>{String(i+1).padStart(2,'0')}</span>
                  <span className={`flex-1 text-sm ${i === chapterIdx ? 'text-[#C9A961]' : 'text-[#A89968]'}`} style={F.scripture}>
                    {c.title}
                  </span>
                  {i === chapterIdx && <span className="text-[#C9A961] text-xs" style={F.scriptureSC}>· now</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* highlight sheet */}
      {activeHighlight && (
        <div className="absolute inset-x-0 bottom-0 z-40 animate-slide-up" style={{ background: '#0F0808', borderTop: '1px solid #2A1810', maxHeight: '70%' }}>
          <div className="p-4 border-b border-[#1A0F0A] flex items-start justify-between">
            <div className="flex-1 pr-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#6B5C3A] mb-1" style={F.scriptureSC}>marginalia</div>
              <p className="text-[#C9A961] text-sm italic leading-snug" style={F.scripture}>"{activeHighlight.verse.text.slice(0, 120)}{activeHighlight.verse.text.length > 120 ? '…' : ''}"</p>
            </div>
            <button onClick={() => setActiveHighlight(null)} className="text-[#A89968]"><X size={16} /></button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: '300px' }}>
            {activeHighlight.highlights.map((h, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1A0F0A] border border-[#2A1810] flex items-center justify-center text-sm shrink-0">{h.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#A89968] text-xs" style={F.ui}>{h.user}</span>
                    <span className="text-[9px] text-[#6B5C3A]" style={F.mono}>{h.time}</span>
                  </div>
                  <p className="text-[#C9A961] text-sm mt-1 leading-snug" style={F.scripture}>{h.comment}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#6B5C3A]" style={F.ui}>
                    <span>♥ {h.likes}</span>
                    <button>reply</button>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-2 mt-2 text-[#A89968] text-xs uppercase tracking-wider border border-[#2A1810] hover:border-[#C9A961] hover:text-[#C9A961] transition-colors" style={F.scriptureSC}>+ add your marginal note</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// THE COVEN MENU — portal between sections (Library, Oddities, etc.)
// ─────────────────────────────────────────────────────────────────
const PORTALS = [
  { id: 'library', name: 'The Library', tagline: 'sacred texts, profane works', glyph: '✦', stat: '8 grimoires' },
  { id: 'oddities', name: 'Oddities', tagline: 'wares of the uncanny', glyph: '❦', stat: '127 listings' },
];

function CovenMenu({ onClose, onSelect }) {
  return (
    <div className="absolute inset-0 z-30 animate-fade-in" onClick={onClose}
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(91,15,26,0.35) 0%, rgba(10,6,8,0.92) 50%, rgba(5,3,4,0.98) 100%)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      }}>
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="relative pt-12 pb-6 px-5" onClick={e => e.stopPropagation()}>
        {/* Wordmark */}
        <div className="text-center mb-1">
          <div className="text-[#F5F1E8] text-5xl leading-none" style={F.brand}>Coven</div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div className="h-px w-8" style={{ background: '#5B0F1A' }} />
            <div className="text-[10px] uppercase tracking-[0.4em] text-[#A89968]" style={F.scriptureSC}>portals</div>
            <div className="h-px w-8" style={{ background: '#5B0F1A' }} />
          </div>
        </div>

        {/* Portal cards */}
        <div className="mt-10 space-y-3">
          {PORTALS.map(p => (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className="w-full flex items-center gap-4 p-4 border bg-[#0F0808] hover:bg-[#1A0F0A] hover:border-[#C9A961] transition-all group"
              style={{ borderColor: '#2A1810' }}>
              <div className="w-14 h-14 flex items-center justify-center text-3xl shrink-0"
                style={{ background: 'radial-gradient(circle, #1F0F08 0%, #0A0608 100%)', border: '1px solid #3A2A1A', color: '#C9A961' }}>
                {p.glyph}
              </div>
              <div className="flex-1 text-left">
                <div className="text-[#F5F1E8] text-lg leading-tight" style={F.brand}>{p.name}</div>
                <div className="text-[#A89968] text-xs mt-0.5 italic" style={F.scripture}>{p.tagline}</div>
                <div className="text-[9px] uppercase tracking-wider text-[#6B5C3A] mt-1.5" style={F.scriptureSC}>{p.stat}</div>
              </div>
              <ChevronLeft size={16} className="text-[#6B5C3A] rotate-180 group-hover:text-[#C9A961] transition-colors" />
            </button>
          ))}
        </div>

        {/* Coming soon hint */}
        <div className="mt-8 text-center">
          <div className="text-[10px] text-[#3A2A1A] uppercase tracking-[0.3em]" style={F.scriptureSC}>more portals to come</div>
        </div>

        {/* Close */}
        <button onClick={onClose}
          className="mt-8 mx-auto block text-[#6B5C3A] text-xs uppercase tracking-[0.3em] hover:text-[#C9A961] transition-colors"
          style={F.ui}>× close</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// ODDITIES — marketplace data
// ─────────────────────────────────────────────────────────────────
const ODDITY_CATEGORIES = [
  { id: 'all', label: 'all wares' },
  { id: 'clothing', label: 'clothing' },
  { id: 'jewelry', label: 'jewelry' },
  { id: 'ritual', label: 'ritual' },
  { id: 'art', label: 'art' },
  { id: 'books', label: 'books' },
  { id: 'records', label: 'records' },
  { id: 'curio', label: 'curiosities' },
];

const CONDITION_LABELS = {
  new: 'new',
  likenew: 'like new',
  used: 'used',
  worn: 'well-worn',
};

const ODDITIES = [
  {
    id: 'od1', title: 'Victorian mourning brooch — jet & hair', price: 240, priceMode: 'firm',
    condition: 'used', category: 'jewelry', size: 'one size', gender: null,
    description: 'Authentic Victorian mourning brooch with hand-woven mourning hair under glass. Estate sale in Albany, late 1880s. Slight patina to the metal, no damage. Comes with the original silk-lined case.',
    photo: { shape: 'jewelry', palette: 'oxblood' },
    seller: { user: 'cryptic.rose', avatar: '🌹', rating: 4.9, sales: 23 },
    location: 'Brooklyn, NY', shippable: true,
    tags: ['victorian', 'mourning', 'antique', 'oddity'],
    posted: '2d', saved: 47, views: 312,
  },
  {
    id: 'od2', title: 'Black velvet duster coat', price: 85, priceMode: 'obo',
    condition: 'likenew', category: 'clothing', size: 'XS / S', gender: 'womens',
    description: 'Long black crushed velvet duster, ankle-length, fully lined. Worn twice. Discontinued style from Killstar. Has a small loose thread on the inside collar but unnoticeable when worn.',
    photo: { shape: 'duster', palette: 'black' },
    seller: { user: 'lilith_xiv', avatar: '🦇', rating: 5.0, sales: 11 },
    location: 'Bushwick, NY', shippable: true,
    tags: ['velvet', 'duster', 'killstar', 'goth'],
    posted: '5h', saved: 23, views: 89,
  },
  {
    id: 'od3', title: 'Hand-cast pewter pentacle pendant', price: 45, priceMode: 'firm',
    condition: 'new', category: 'ritual', size: '1.5" pendant', gender: null,
    description: 'Made by me. Solid pewter, sand-cast in my Greenpoint studio. Each one slightly different by nature of the process. Comes on a 22" black waxed cord — can swap for a chain on request.',
    photo: { shape: 'pentacle', palette: 'silver' },
    seller: { user: 'mortis.kvlt', avatar: '☠', rating: 4.8, sales: 67 },
    location: 'Greenpoint, NY', shippable: true,
    tags: ['handmade', 'pewter', 'ritual', 'pentacle'],
    posted: '1d', saved: 89, views: 412,
  },
  {
    id: 'od4', title: 'Joy Division — Closer, UK 1st press', price: 320, priceMode: 'obo',
    condition: 'used', category: 'records', size: '12" LP', gender: null,
    description: 'UK first pressing on Factory Records, FACT 25. Vinyl is VG+, a few light surface marks but no skips. Sleeve is VG, some shelf wear at the corners. Original inner sleeve.',
    photo: { shape: 'record', palette: 'black' },
    seller: { user: 'blackvelvet_99', avatar: '🩸', rating: 4.7, sales: 34 },
    location: 'Manhattan, NY', shippable: true,
    tags: ['joy division', 'first press', 'factory', 'post-punk'],
    posted: '3d', saved: 41, views: 287,
  },
  {
    id: 'od5', title: 'Antique leather Bible, 1887', price: 110, priceMode: 'firm',
    condition: 'used', category: 'books', size: '7" × 10"', gender: null,
    description: 'Family Bible, leather bound, gilt edges still mostly intact. Front board is detached but present. Has original handwritten genealogy on the inside flyleaf — names and dates from 1887 to 1932.',
    photo: { shape: 'book', palette: 'oxblood' },
    seller: { user: 'ash.in.october', avatar: '🕯', rating: 4.9, sales: 19 },
    location: 'Crown Heights, NY', shippable: true,
    tags: ['antique', 'bible', 'leather', 'occult'],
    posted: '6h', saved: 18, views: 76,
  },
  {
    id: 'od6', title: 'Plaster skull, hand-cast', price: 60, priceMode: 'trade',
    condition: 'new', category: 'curio', size: 'life-size', gender: null,
    description: 'Cast from a real anatomical specimen — mine. Plaster, hand-finished with a slight tea stain for an aged look. Open to trades for occult books, jewelry, or other curiosities.',
    photo: { shape: 'skull', palette: 'bone' },
    seller: { user: 'mortis.kvlt', avatar: '☠', rating: 4.8, sales: 67 },
    location: 'Greenpoint, NY', shippable: true,
    tags: ['skull', 'plaster', 'memento mori', 'handmade'],
    posted: '4d', saved: 134, views: 567,
  },
  {
    id: 'od7', title: 'Custom leather chest harness', price: 180, priceMode: 'firm',
    condition: 'new', category: 'clothing', size: 'M (chest 38–42")', gender: 'mens',
    description: 'Made to order. Real leather, hand-stitched, brass hardware. Adjustable straps. This one is in stock M but I can make any size — message me for custom orders. Lead time ~2 weeks.',
    photo: { shape: 'harness', palette: 'black' },
    seller: { user: 'vesper.exe', avatar: '✟', rating: 5.0, sales: 89 },
    location: 'Bushwick, NY', shippable: true,
    tags: ['leather', 'harness', 'handmade', 'mens'],
    posted: '12h', saved: 78, views: 245,
  },
  {
    id: 'od8', title: 'Bauhaus — In the Flat Field, 1st US press', price: 95, priceMode: 'obo',
    condition: 'used', category: 'records', size: '12" LP', gender: null,
    description: 'First US pressing on 4AD. Vinyl is VG, sleeve has minor ringwear but everything\u2019s intact. Plays great. From my college years — time to let it go.',
    photo: { shape: 'record', palette: 'midnight' },
    seller: { user: 'blackvelvet_99', avatar: '🩸', rating: 4.7, sales: 34 },
    location: 'Manhattan, NY', shippable: true,
    tags: ['bauhaus', 'first press', '4ad', 'goth'],
    posted: '2d', saved: 28, views: 198,
  },
  {
    id: 'od9', title: 'Smoky quartz scrying ball, 4"', price: 220, priceMode: 'firm',
    condition: 'new', category: 'ritual', size: '4" diameter', gender: null,
    description: 'Real smoky quartz, polished to a mirror finish. Comes with a hand-carved walnut stand. Cleared with sage and moonlight before shipping.',
    photo: { shape: 'orb', palette: 'midnight' },
    seller: { user: 'cryptic.rose', avatar: '🌹', rating: 4.9, sales: 23 },
    location: 'Brooklyn, NY', shippable: true,
    tags: ['crystal', 'scrying', 'quartz', 'divination'],
    posted: '1w', saved: 56, views: 421,
  },
  {
    id: 'od10', title: 'Vintage 90s black silk slip dress', price: 65, priceMode: 'obo',
    condition: 'used', category: 'clothing', size: 'M', gender: 'womens',
    description: 'Vintage 90s black silk slip dress, bias cut, ankle length. Some wear at the hem but no holes or stains. Looks incredible with combat boots.',
    photo: { shape: 'dress', palette: 'black' },
    seller: { user: 'lilith_xiv', avatar: '🦇', rating: 5.0, sales: 11 },
    location: 'Bushwick, NY', shippable: true,
    tags: ['vintage', '90s', 'silk', 'womens'],
    posted: '8h', saved: 34, views: 134,
  },
  {
    id: 'od11', title: 'Original linocut print — "Vespers"', price: 90, priceMode: 'firm',
    condition: 'new', category: 'art', size: '11" × 14", ed. of 30', gender: null,
    description: 'Hand-pulled linocut on archival paper. Numbered edition of 30 — this is #14. Black ink on cream stock. Signed and dated. Ships flat in protective sleeve.',
    photo: { shape: 'art', palette: 'oxblood' },
    seller: { user: 'ash.in.october', avatar: '🕯', rating: 4.9, sales: 19 },
    location: 'Crown Heights, NY', shippable: true,
    tags: ['linocut', 'print', 'art', 'handmade'],
    posted: '3d', saved: 67, views: 234,
  },
  {
    id: 'od12', title: 'Doc Martens 1460s, well-worn', price: 45, priceMode: 'obo',
    condition: 'worn', category: 'clothing', size: '11 US (mens)', gender: 'mens',
    description: 'Real Docs, real worn. Bought new in 2018, lived in. Soles still good, leather is patinated as hell. They have stories.',
    photo: { shape: 'boot', palette: 'black' },
    seller: { user: 'vesper.exe', avatar: '✟', rating: 5.0, sales: 89 },
    location: 'Bushwick, NY', shippable: true,
    tags: ['docs', 'boots', 'punk', 'mens'],
    posted: '4h', saved: 12, views: 56,
  },
];

// ─────────────────────────────────────────────────────────────────
// ODDITIES — visuals
// ─────────────────────────────────────────────────────────────────
const ODDITY_PALETTES = {
  oxblood: { bg: 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)', stroke: '#5B0F1A', fill: '#0A0204' },
  black: { bg: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)', stroke: '#3F3F3F', fill: '#000' },
  silver: { bg: 'linear-gradient(135deg, #2A2A2E 0%, #15151A 100%)', stroke: '#A8A29E', fill: '#0A0A0A' },
  midnight: { bg: 'linear-gradient(135deg, #1A1A2E 0%, #0F0F1F 70%, #08081A 100%)', stroke: '#5C5C8A', fill: '#08081A' },
  bone: { bg: 'linear-gradient(135deg, #3A3228 0%, #1F1A14 70%, #0F0C08 100%)', stroke: '#C9B898', fill: '#0F0C08' },
};

function OddityImage({ shape, palette, className = '' }) {
  const p = ODDITY_PALETTES[palette] || ODDITY_PALETTES.black;
  const stroke = { stroke: p.stroke, strokeWidth: 0.4, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' };
  const ghost = { stroke: p.stroke, strokeWidth: 0.25, fill: 'none', opacity: 0.3 };

  const shapes = {
    duster: <g><path {...stroke} d="M 35 18 L 45 12 L 55 12 L 65 18 L 80 35 L 78 50 L 73 50 L 73 130 L 27 130 L 27 50 L 22 50 L 20 35 Z" /><line {...stroke} x1="50" y1="18" x2="50" y2="130" /><circle {...ghost} cx="50" cy="35" r="0.8" fill={p.stroke} /><circle {...ghost} cx="50" cy="50" r="0.8" fill={p.stroke} /><circle {...ghost} cx="50" cy="65" r="0.8" fill={p.stroke} /><circle {...ghost} cx="50" cy="80" r="0.8" fill={p.stroke} /></g>,
    dress: <g><path {...stroke} d="M 38 18 L 45 13 L 55 13 L 62 18 L 60 30 L 58 50 L 70 130 L 30 130 L 42 50 L 40 30 Z" /><line {...stroke} x1="50" y1="18" x2="50" y2="130" /></g>,
    harness: <g><path {...stroke} d="M 30 30 L 70 30 L 70 38 L 30 38 Z" /><path {...stroke} d="M 30 75 L 70 75 L 70 83 L 30 83 Z" /><line {...stroke} x1="35" y1="38" x2="40" y2="75" /><line {...stroke} x1="65" y1="38" x2="60" y2="75" /><line {...stroke} x1="50" y1="30" x2="50" y2="83" /><circle {...stroke} cx="50" cy="56" r="4" /></g>,
    boot: <g><path {...stroke} d="M 30 50 L 30 100 L 32 110 L 75 110 L 75 100 L 70 95 L 55 95 L 50 50 Z" /><line {...stroke} x1="35" y1="60" x2="48" y2="60" /><line {...stroke} x1="35" y1="68" x2="49" y2="68" /><line {...stroke} x1="35" y1="76" x2="50" y2="76" /><line {...stroke} x1="35" y1="84" x2="51" y2="84" /></g>,
    jewelry: <g><path {...stroke} d="M 25 30 Q 50 10 75 30" /><circle {...stroke} cx="50" cy="55" r="14" /><circle {...stroke} cx="50" cy="55" r="10" /><circle {...stroke} cx="50" cy="55" r="2" fill={p.stroke} /><path {...stroke} d="M 50 41 L 52 55 L 50 69 L 48 55 Z" /></g>,
    pentacle: <g><circle {...stroke} cx="50" cy="60" r="22" /><circle {...stroke} cx="50" cy="60" r="20" strokeWidth="0.2" /><path {...stroke} d="M 50 42 L 67 73 L 33 53 L 67 53 L 33 73 Z" /></g>,
    record: <g><circle {...stroke} cx="50" cy="60" r="32" fill={p.fill} /><circle {...ghost} cx="50" cy="60" r="28" /><circle {...ghost} cx="50" cy="60" r="24" /><circle {...ghost} cx="50" cy="60" r="20" /><circle {...ghost} cx="50" cy="60" r="16" /><circle {...stroke} cx="50" cy="60" r="10" fill={p.stroke} fillOpacity="0.3" /><circle fill={p.fill} cx="50" cy="60" r="1.5" /></g>,
    book: <g><path {...stroke} d="M 28 18 L 72 18 L 72 105 L 28 105 Z" fill={p.fill} fillOpacity="0.4" /><line {...stroke} x1="34" y1="18" x2="34" y2="105" /><path {...stroke} d="M 42 35 L 58 35" /><path {...stroke} d="M 42 50 L 58 50" /><circle {...stroke} cx="50" cy="70" r="6" /><path {...stroke} d="M 50 64 L 50 76 M 44 70 L 56 70" /></g>,
    skull: <g><path {...stroke} d="M 30 50 Q 30 25 50 25 Q 70 25 70 50 L 70 70 Q 70 80 60 80 L 60 88 L 55 88 L 55 80 L 45 80 L 45 88 L 40 88 L 40 80 Q 30 80 30 70 Z" fill={p.fill} fillOpacity="0.3" /><ellipse {...stroke} cx="42" cy="55" rx="4" ry="5" fill={p.fill} /><ellipse {...stroke} cx="58" cy="55" rx="4" ry="5" fill={p.fill} /><path {...stroke} d="M 47 67 L 50 70 L 53 67" /><line {...stroke} x1="42" y1="78" x2="42" y2="84" /><line {...stroke} x1="48" y1="78" x2="48" y2="84" /><line {...stroke} x1="52" y1="78" x2="52" y2="84" /><line {...stroke} x1="58" y1="78" x2="58" y2="84" /></g>,
    art: <g><rect {...stroke} x="22" y="22" width="56" height="76" /><rect {...stroke} x="26" y="26" width="48" height="68" strokeWidth="0.25" /><path {...stroke} d="M 35 70 L 45 50 L 50 60 L 60 40 L 65 70 Z" /><circle {...stroke} cx="58" cy="42" r="3" fill={p.stroke} fillOpacity="0.5" /></g>,
    orb: <g><defs><radialGradient id={`orb-${palette}`} cx="35%" cy="35%"><stop offset="0%" stopColor={p.stroke} stopOpacity="0.5" /><stop offset="100%" stopColor={p.fill} /></radialGradient></defs><circle cx="50" cy="55" r="26" fill={`url(#orb-${palette})`} stroke={p.stroke} strokeWidth="0.4" /><ellipse cx="42" cy="46" rx="5" ry="3" fill={p.stroke} fillOpacity="0.6" transform="rotate(-30 42 46)" /><path {...stroke} d="M 30 85 L 70 85 L 65 98 L 35 98 Z" /></g>,
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ background: p.bg }}>
      <svg viewBox="0 0 100 130" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
        {shapes[shape] || shapes.book}
      </svg>
      <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'><filter id=\'n\'><feTurbulence baseFrequency=\'1.0\'/></filter><rect width=\'80\' height=\'80\' filter=\'url(%23n)\'/></svg>")' }} />
    </div>
  );
}

function PriceLabel({ price, mode, size = 'sm' }) {
  const cls = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-sm';
  if (mode === 'trade') return <span className={`${cls} text-[#C9A961]`} style={F.brand}>· trade ·</span>;
  if (mode === 'offer') return <span className={`${cls} text-[#C9A961]`} style={F.brand}>best offer</span>;
  return (
    <span className={`${cls} text-[#F5F1E8]`} style={F.display}>
      <span className="text-[#A89968]">$</span>{price}
      {mode === 'obo' && <span className="text-[10px] text-[#A89968] ml-1.5 italic" style={F.scripture}>or best</span>}
    </span>
  );
}

function OddityCard({ item, onClick }) {
  return (
    <button onClick={onClick} className="group block w-full text-left">
      <div className="relative aspect-[3/4] overflow-hidden border border-[#1F1F1F] group-hover:border-[#3F3F3F] transition-colors">
        <OddityImage shape={item.photo.shape} palette={item.photo.palette} />
        {/* corner stamp */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#5B0F1A]"
          style={{ ...F.scriptureSC, fontSize: '8px', letterSpacing: '0.2em', color: '#5B0F1A' }}>
          FOR SALE
        </div>
        {/* condition badge */}
        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-[#0A0A0A]/80 backdrop-blur-sm text-[9px] uppercase tracking-wider text-[#A8A29E]" style={F.ui}>
          {CONDITION_LABELS[item.condition]}
        </div>
        {/* save count */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-[#A8A29E]" style={F.mono}>
          <Heart size={10} /> {item.saved}
        </div>
      </div>
      <div className="mt-2 px-0.5">
        <div className="text-[#F5F1E8] text-xs leading-snug line-clamp-2 min-h-[28px]" style={F.serif}>{item.title}</div>
        <div className="flex items-baseline justify-between mt-1">
          <PriceLabel price={item.price} mode={item.priceMode} size="sm" />
          <span className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{item.posted}</span>
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// ODDITIES — overlays
// ─────────────────────────────────────────────────────────────────
function OdditiesOverlay({ onClose }) {
  const [openItem, setOpenItem] = useState(null);
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('new');

  let filtered = ODDITIES.filter(item => {
    if (filter !== 'all' && item.category !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.tags.some(t => t.includes(search.toLowerCase()))) return false;
    return true;
  });
  if (sort === 'low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'saved') filtered = [...filtered].sort((a, b) => b.saved - a.saved);

  if (composing) return <OddityCompose onClose={() => setComposing(false)} />;
  if (openItem) {
    const item = ODDITIES.find(i => i.id === openItem);
    return <OddityDetail item={item} onBack={() => setOpenItem(null)} />;
  }

  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-fade-in flex flex-col">
      {/* header */}
      <div className="px-4 pt-3 pb-3 border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onClose} className="flex items-center gap-1 text-[#A89968] text-sm" style={F.ui}>
            <ChevronLeft size={16} /> coven
          </button>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#6B5C3A]" style={F.ui}>· market ·</div>
          <div className="w-12" />
        </div>
        <div className="text-center">
          <h2 className="text-[#F5F1E8] text-3xl leading-none" style={F.brand}>Oddities</h2>
          <div className="mt-1.5 text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· clothing · curios · the uncanny ·</div>
        </div>
      </div>

      {/* search + sort */}
      <div className="px-4 pt-3 pb-2 flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-[#141414] border border-[#1F1F1F]">
          <Search size={13} className="text-[#6B6B6B]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="search wares" className="bg-transparent text-[#F5F1E8] text-sm outline-none flex-1 placeholder:text-[#6B6B6B]" style={F.ui} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="bg-[#141414] border border-[#1F1F1F] text-[#A8A29E] text-xs px-2 outline-none uppercase tracking-wider"
          style={F.ui}>
          <option value="new">newest</option>
          <option value="low">price ↑</option>
          <option value="high">price ↓</option>
          <option value="saved">most saved</option>
        </select>
      </div>

      {/* category chips */}
      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto no-scrollbar border-b border-[#1A1A1A]">
        {ODDITY_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className="shrink-0 px-3 py-1.5 text-[10px] uppercase tracking-wider border transition-colors"
            style={{
              ...F.ui,
              background: filter === c.id ? '#C9A961' : 'transparent',
              color: filter === c.id ? '#0A0A0A' : '#A89968',
              borderColor: filter === c.id ? '#C9A961' : '#2A2A2A',
            }}>{c.label}</button>
        ))}
      </div>

      {/* count */}
      <div className="px-4 py-2 flex items-center justify-between text-[10px] text-[#6B5C3A] uppercase tracking-wider border-b border-[#1A1A1A]" style={F.scriptureSC}>
        <span>{filtered.length} {filtered.length === 1 ? 'ware' : 'wares'}</span>
        <span>· tonight{'\u2019'}s market ·</span>
      </div>

      {/* grid */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-24">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#6B5C3A] text-sm italic" style={F.scripture}>nothing here matches that. try a different word.</div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-4">
            {filtered.map(item => (
              <OddityCard key={item.id} item={item} onClick={() => setOpenItem(item.id)} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <div className="text-[10px] text-[#3A2A1A] uppercase tracking-[0.3em]" style={F.scriptureSC}>· end of market ·</div>
        </div>
      </div>

      {/* sell FAB */}
      <button onClick={() => setComposing(true)}
        className="absolute bottom-4 right-4 px-4 h-12 bg-[#C9A961] text-[#0A0A0A] flex items-center gap-2 shadow-xl uppercase tracking-wider text-xs"
        style={{ ...F.scriptureSC, boxShadow: '0 0 20px rgba(201,169,97,0.3)' }}>
        <Plus size={16} /> sell
      </button>
    </div>
  );
}

function OddityDetail({ item, onBack }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-fade-in flex flex-col">
      {/* header */}
      <div className="px-3 pt-3 pb-2 border-b border-[#1A1A1A] flex items-center justify-between">
        <button onClick={onBack} className="text-[#A89968]"><ChevronLeft size={20} /></button>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#6B5C3A]" style={F.scriptureSC}>item No. {item.id.replace('od', '').padStart(3, '0')}</div>
        <button className="text-[#A89968]"><Share2 size={16} /></button>
      </div>

      {/* body scroll */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* photo */}
        <div className="relative aspect-square">
          <OddityImage shape={item.photo.shape} palette={item.photo.palette} />
          <div className="absolute top-3 right-3 px-2 py-1 bg-[#0A0A0A]/85 backdrop-blur-sm border border-[#5B0F1A]"
            style={{ ...F.scriptureSC, fontSize: '10px', letterSpacing: '0.25em', color: '#5B0F1A' }}>FOR SALE</div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex gap-1">
              <span className="px-1.5 py-0.5 bg-[#0A0A0A]/85 backdrop-blur-sm text-[10px] uppercase tracking-wider text-[#A8A29E] border border-[#1F1F1F]" style={F.ui}>photo 1 / 1</span>
            </div>
          </div>
        </div>

        {/* title + price */}
        <div className="px-4 pt-5 pb-4 border-b border-[#1A1A1A]">
          <h1 className="text-[#F5F1E8] text-2xl leading-tight" style={F.brand}>{item.title}</h1>
          <div className="mt-3 flex items-baseline justify-between">
            <PriceLabel price={item.price} mode={item.priceMode} size="lg" />
            <div className="flex items-center gap-3 text-[10px] text-[#6B6B6B]" style={F.mono}>
              <span><Heart size={10} className="inline mr-0.5" /> {item.saved}</span>
              <span>· {item.views} views</span>
            </div>
          </div>
        </div>

        {/* facts row */}
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-[#1A1A1A]">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#6B5C3A]" style={F.scriptureSC}>condition</div>
            <div className="text-[#F5F1E8] text-sm" style={F.serif}>{CONDITION_LABELS[item.condition]}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#6B5C3A]" style={F.scriptureSC}>size</div>
            <div className="text-[#F5F1E8] text-sm" style={F.serif}>{item.size}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#6B5C3A]" style={F.scriptureSC}>category</div>
            <div className="text-[#F5F1E8] text-sm capitalize" style={F.serif}>{item.category}</div>
          </div>
          {item.gender && (
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#6B5C3A]" style={F.scriptureSC}>fit</div>
              <div className="text-[#F5F1E8] text-sm capitalize" style={F.serif}>{item.gender}</div>
            </div>
          )}
        </div>

        {/* description */}
        <div className="px-4 py-4 border-b border-[#1A1A1A]">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-2" style={F.scriptureSC}>description</div>
          <p className="text-[#F5F1E8] text-[15px] leading-relaxed" style={F.serif}>{item.description}</p>
          <div className="flex items-center gap-1.5 mt-4 flex-wrap">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
            ))}
          </div>
        </div>

        {/* seller */}
        <div className="px-4 py-4 border-b border-[#1A1A1A]">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-3" style={F.scriptureSC}>seller</div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-xl">{item.seller.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[#F5F1E8] text-sm" style={F.ui}>{item.seller.user}</div>
              <div className="flex items-center gap-2 text-[11px] text-[#A89968] mt-0.5" style={F.mono}>
                <span>★ {item.seller.rating}</span>
                <span className="text-[#6B5C3A]">·</span>
                <span>{item.seller.sales} sales</span>
              </div>
            </div>
            <button className="px-3 py-1.5 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A89968]" style={F.ui}>profile</button>
          </div>
        </div>

        {/* location */}
        <div className="px-4 py-4 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-[#6B5C3A]" />
            <span className="text-[#A8A29E] text-xs" style={F.ui}>{item.location}</span>
            {item.shippable && <span className="text-[10px] text-[#6B5C3A] uppercase tracking-wider ml-auto" style={F.ui}>· ships</span>}
          </div>
        </div>

        {/* posted */}
        <div className="px-4 py-3 text-[10px] text-[#6B5C3A] uppercase tracking-wider" style={F.scriptureSC}>posted {item.posted} ago · ID {item.id}</div>
      </div>

      {/* sticky action bar */}
      <div className="absolute inset-x-0 bottom-0 px-3 py-3 bg-[#0A0A0A] border-t border-[#1A1A1A] flex items-center gap-2">
        <button onClick={() => setSaved(!saved)}
          className={`p-3 border ${saved ? 'border-[#5B0F1A] text-[#5B0F1A] bg-[#5B0F1A]/10' : 'border-[#2A2A2A] text-[#A89968]'}`}>
          <Heart size={16} fill={saved ? '#5B0F1A' : 'none'} />
        </button>
        <button className="flex-1 h-11 bg-[#C9A961] text-[#0A0A0A] uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          style={F.scriptureSC}>
          <MessageCircle size={14} /> message seller
        </button>
      </div>
    </div>
  );
}

function OddityCompose({ onClose }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priceMode, setPriceMode] = useState('firm');
  const [category, setCategory] = useState('clothing');
  const [condition, setCondition] = useState('used');
  const [size, setSize] = useState('');
  const [gender, setGender] = useState('unisex');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [shippable, setShippable] = useState(true);

  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] animate-fade-in flex flex-col">
      <div className="px-3 pt-3 pb-2 border-b border-[#1A1A1A] flex items-center justify-between">
        <button onClick={onClose} className="text-[#A89968] text-sm" style={F.ui}>cancel</button>
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#6B5C3A]" style={F.scriptureSC}>· list a ware ·</div>
        <button className="text-[#C9A961] text-sm uppercase tracking-wider" style={F.scriptureSC}>post</button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {/* photos */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-2" style={F.scriptureSC}>photos · up to 5</div>
          <div className="grid grid-cols-5 gap-1.5">
            {[0,1,2,3,4].map(i => (
              <button key={i} className="aspect-square border border-dashed border-[#2A2A2A] text-[#3F3F3F] flex items-center justify-center hover:border-[#C9A961] hover:text-[#C9A961] transition-colors">
                {i === 0 ? <ImageIcon size={16} /> : <Plus size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* title */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>title</div>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="what are you selling?"
            className="w-full bg-[#141414] border border-[#1F1F1F] px-3 py-2.5 text-[#F5F1E8] text-sm outline-none placeholder:text-[#3F3F3F]" style={F.serif} />
        </div>

        {/* price + mode */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>price</div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center bg-[#141414] border border-[#1F1F1F] px-3">
              <span className="text-[#A89968] text-base mr-1" style={F.display}>$</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0" className="bg-transparent text-[#F5F1E8] text-base outline-none flex-1 py-2.5 placeholder:text-[#3F3F3F]" style={F.display} />
            </div>
            <select value={priceMode} onChange={e => setPriceMode(e.target.value)}
              className="bg-[#141414] border border-[#1F1F1F] text-[#A89968] text-xs px-3 outline-none uppercase tracking-wider" style={F.ui}>
              <option value="firm">firm</option>
              <option value="obo">or best</option>
              <option value="trade">trade</option>
              <option value="offer">offers</option>
            </select>
          </div>
        </div>

        {/* category */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>category</div>
          <div className="flex flex-wrap gap-1.5">
            {ODDITY_CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className="px-2.5 py-1 text-[11px] border uppercase tracking-wider"
                style={{ ...F.ui, background: category === c.id ? '#C9A961' : 'transparent', color: category === c.id ? '#0A0A0A' : '#A89968', borderColor: category === c.id ? '#C9A961' : '#2A2A2A' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* condition */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>condition</div>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(CONDITION_LABELS).map(([id, label]) => (
              <button key={id} onClick={() => setCondition(id)}
                className="py-2 text-[10px] border uppercase tracking-wider"
                style={{ ...F.ui, background: condition === id ? '#C9A961' : 'transparent', color: condition === id ? '#0A0A0A' : '#A89968', borderColor: condition === id ? '#C9A961' : '#2A2A2A' }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* size */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>size</div>
          <input value={size} onChange={e => setSize(e.target.value)}
            placeholder='e.g. M, 32x30, "one size", 4" diameter'
            className="w-full bg-[#141414] border border-[#1F1F1F] px-3 py-2.5 text-[#F5F1E8] text-sm outline-none placeholder:text-[#3F3F3F]" style={F.serif} />
        </div>

        {/* gender (clothing only) */}
        {category === 'clothing' && (
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>fit</div>
            <div className="grid grid-cols-3 gap-1.5">
              {['mens', 'womens', 'unisex'].map(g => (
                <button key={g} onClick={() => setGender(g)}
                  className="py-2 text-[10px] border uppercase tracking-wider"
                  style={{ ...F.ui, background: gender === g ? '#C9A961' : 'transparent', color: gender === g ? '#0A0A0A' : '#A89968', borderColor: gender === g ? '#C9A961' : '#2A2A2A' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* description */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>description</div>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="condition details, history, fit notes, anything a buyer should know..."
            className="w-full bg-[#141414] border border-[#1F1F1F] px-3 py-2.5 text-[#F5F1E8] text-sm outline-none placeholder:text-[#3F3F3F] resize-none min-h-[100px]" style={F.serif} />
        </div>

        {/* tags */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>tags</div>
          <input value={tags} onChange={e => setTags(e.target.value)}
            placeholder="comma separated · e.g. velvet, vintage, 90s, womens"
            className="w-full bg-[#141414] border border-[#1F1F1F] px-3 py-2.5 text-[#F5F1E8] text-sm outline-none placeholder:text-[#3F3F3F]" style={F.serif} />
        </div>

        {/* location + shippable */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1.5" style={F.scriptureSC}>location</div>
          <input placeholder="brooklyn, ny"
            className="w-full bg-[#141414] border border-[#1F1F1F] px-3 py-2.5 text-[#F5F1E8] text-sm outline-none placeholder:text-[#3F3F3F]" style={F.serif} />
          <button onClick={() => setShippable(!shippable)}
            className="mt-3 flex items-center gap-2 text-[#A89968] text-xs" style={F.ui}>
            <span className={`w-4 h-4 border ${shippable ? 'bg-[#C9A961] border-[#C9A961]' : 'border-[#3F3F3F]'} flex items-center justify-center`}>
              {shippable && <span className="text-[#0A0A0A] text-xs leading-none">✓</span>}
            </span>
            i can ship this
          </button>
        </div>

        <div className="pt-4 pb-2 text-center text-[10px] text-[#3A2A1A] uppercase tracking-[0.3em]" style={F.scriptureSC}>· ❦ ·</div>
      </div>
    </div>
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
          { id: 'prayer', label: 'prayers' },
          { id: 'ritual', label: 'rituals' },
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
function Header({ tab, onDMs, onCompose, onLibrary, communityName }) {
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
            <button onClick={onLibrary} className="text-[#F5F1E8] text-3xl leading-none hover:text-[#C9A961] transition-colors" style={F.brand} title="The Library">Coven</button>
          ) : (
            <button onClick={onLibrary} className="text-[#F5F1E8] text-base tracking-[0.3em] hover:text-[#C9A961] transition-colors" style={F.display}>
              {(titles[tab] || tab.toUpperCase())}
            </button>
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
  const [activePortal, setActivePortal] = useState(null); // null | 'menu' | 'library' | 'oddities'
  const [readingProgress] = useState({ kjv: 12, goetia: 4, 'solomon-key': 8 }); // mock per-book progress %
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
    <div className="w-full bg-black flex items-center justify-center p-0 sm:p-6" style={{ ...F.ui, minHeight: '100dvh' }}>
      {/* Phone frame */}
      <div className="relative w-full sm:w-[400px] sm:h-[860px] sm:max-h-[90vh] sm:rounded-[44px] overflow-hidden bg-[#0A0A0A] sm:border sm:border-[#1F1F1F] phone-frame"
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
          onLibrary={() => setActivePortal('menu')}
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
        {activePortal === 'menu' && <CovenMenu onClose={() => setActivePortal(null)} onSelect={(id) => setActivePortal(id)} />}
        {activePortal === 'library' && <LibraryOverlay onClose={() => setActivePortal(null)} progress={readingProgress} />}
        {activePortal === 'oddities' && <OdditiesOverlay onClose={() => setActivePortal(null)} />}
      </div>
    </div>
  );
}
