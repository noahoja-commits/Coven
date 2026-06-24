import { useState, useEffect } from 'react';
import { Settings, Pencil, Plus, Heart, MoreHorizontal, ChevronRight, Music, X, Lock, Share2 } from 'lucide-react';
import { shareCoven } from '../../lib/share';
import { F } from '../../styles/fonts';
import { TrackerGrid } from '../trackers/TrackerGrid';
import { timeAgo, daysBetween, sunSign } from '../../data/helpers';
import { ACHIEVEMENTS, earnedAchievements } from '../../data/achievements';
import { fetchUserPosts } from '../../lib/db/posts';
import { borderStyle, bannerStyle } from '../../data/decor';
import { moodActive } from '../../data/moods';
import { CRYSTAL_OPTIONS } from '../../data/crystals';
import { SHRINE_OBJECTS, earnedShrine } from '../../data/shrine';
import { PostGrid } from './PostGrid';
import { TarotFrame, arcanaFor, Grain } from '../shared/Sigils';
import { ArcanaCard } from './ArcanaCard';
import { DarkRecapModal } from './DarkRecapModal';

const SHRINE_THEMES = {
  oxblood: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)',
  violet: 'radial-gradient(ellipse at 50% 0%, #2D0F3F 0%, transparent 60%)',
  gold: 'radial-gradient(ellipse at 50% 0%, #3B2F0A 0%, transparent 60%)',
  silver: 'radial-gradient(ellipse at 50% 0%, #2A2A30 0%, transparent 60%)',
  cathedral: 'linear-gradient(180deg, #1F0810 0%, transparent 100%)',
};

export function ProfileScreen({ profile, graves, anniversaries, trackers, onUpdateTracker, onOpenTonightStatus, onOpenSettings, mementoMoriOn, settings, onEditProfile, onLightCandle, crews = [], onOpenCrew, onBrowseCrews, onAddGrave, onAddAnniversary, onOpenNowPlaying, onOpenReflections, onOpenDreams, dreamsCount = 0, onOpenTickets, reflectionsCount = 0, nowPlaying, activityLog = [], sigils = [], bookmarks = [], onOpenComments, onOpenPost, ritual, ritualDoneToday, onPerformRitual, crystals = [], onToggleCrystal, pinnedPost, shrineTheme = 'oxblood', onSetShrineTheme, storyHighlights = [], onRemoveHighlight, achievementState = {}, onShowFollowers, onShowFollowing, joinedScenes = [], onOpenScene, onOpenMood,
shrine = [], onSetShrine, flameLitAt = 0, onTendFlame }) {
  const mood = moodActive(profile.mood) ? profile.mood : null;
  const earned = earnedAchievements(achievementState);
  const earnedIds = new Set(earned.map(a => a.id));
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedMark, setSelectedMark] = useState(null);
  const [tab, setTab] = useState('grid');
  const [nudgeHidden, setNudgeHidden] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showArcana, setShowArcana] = useState(false);
  const recapStats = {
    posts: profile.posts || 0,
    streak: ritual?.streak || 0,
    sigils: sigils.length,
    achievementsEarned: earned.length,
    achievementsTotal: ACHIEVEMENTS.length,
    topScene: joinedScenes[0]?.name || '',
  };
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  useEffect(() => {
    let on = true;
    if (!profile?.id) { setPostsLoading(false); return; }
    setPostsLoading(true);
    fetchUserPosts(profile.id).then(p => { if (on) { setMyPosts(p); setPostsLoading(false); } }).catch(() => { if (on) setPostsLoading(false); });
    return () => { on = false; };
  }, [profile?.id]);
  const [showAllAnniv, setShowAllAnniv] = useState(false);

  // Memento mori calc — whole days since birth, computed from LOCAL calendar
  // dates (parse "YYYY-MM-DD" as local midnight, not UTC) so there's no
  // timezone off-by-one. Missing/invalid birthday → null (handled in render).
  const daysLived = (() => {
    if (!profile.birthday) return null;
    const [y, m, d] = String(profile.birthday).split('-').map(Number);
    if (!y || !m || !d) return null;
    const birth = new Date(y, m - 1, d);
    const now = new Date();
    const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.floor((todayMid - birth) / 86400000));
  })();
  // life expectancy ~80 years (accounts for leap days: 80 × 365.25 ≈ 29220)
  const LIFE_DAYS = Math.round(80 * 365.25);
  const daysExpected = daysLived == null ? null : Math.max(0, LIFE_DAYS - daysLived);
  const sign = sunSign(profile.birthday);

  // Candle burn calc — 8 hours total
  const candleBurnMs = 1000 * 60 * 60 * 8;
  const candleAge = profile.candleLit ? Date.now() - profile.candleLit.at : Infinity;
  const candleActive = candleAge < candleBurnMs;
  const candlePct = candleActive ? Math.max(0, 1 - candleAge / candleBurnMs) : 0;

  return (
    <div className="pb-24">
      {/* Header card — framed as a tarot arcana */}
      <div className="relative px-4 pt-4 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ background: SHRINE_THEMES[shrineTheme] || SHRINE_THEMES.oxblood }} />
        <Grain opacity={0.06} />
        <TarotFrame />
        {profile.decor?.banner && profile.decor.banner !== 'none' && (
          <div className={`absolute top-0 inset-x-0 h-24 pointer-events-none ${profile.decor?.animated ? 'banner-animated' : ''}`} style={bannerStyle(profile.decor.banner) || undefined} />
        )}

        <div className="relative flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <ArcanaCard handle={profile.name} onTap={() => setShowArcana(true)} />
            {(() => { const a = arcanaFor(profile.name); return (
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E] truncate" style={F.display}>{a.numeral} · {a.name}</span>
            ); })()}
          </div>
          <div className="flex items-center gap-2">
            {/* Grave shortcut top-right — surfaces the first PUBLIC memorial only;
                private ones aren't promoted to the header chip. */}
            {(() => {
              const headline = graves.find(g => !g.private);
              return headline ? (
                <button onClick={onAddGrave} className="text-[10px] text-[#6B6B6B] hover:text-[#A8A29E] uppercase tracking-wider flex items-center gap-1" style={F.ui}>
                  <span className="text-base">⚱</span>
                  <span>{headline.name}</span>
                </button>
              ) : null;
            })()}
            <button onClick={() => shareCoven({ title: `@${profile.name} on Coven`, text: profile.bio || 'a soul in the coven', path: `?u=${profile.name}` })}
              className="text-[#6B6B6B] hover:text-[#A8A29E]" title="share your profile"><Share2 size={14} /></button>
            <button onClick={() => setShowThemePicker(true)} className="text-[#6B6B6B] hover:text-[#A8A29E]" title="shrine theme">✦</button>
            <button onClick={onOpenMood} className="text-[#6B6B6B] hover:text-[#A8A29E] text-sm leading-none" title="set your mood"
              style={mood ? { color: mood.color, textShadow: `0 0 8px ${mood.color}99` } : undefined}>{mood ? mood.glyph : '☁'}</button>
            <button onClick={onEditProfile} className="text-[#6B6B6B] hover:text-[#A8A29E]" title="edit profile"><Pencil size={14} /></button>
            <button onClick={onOpenSettings} className="text-[#6B6B6B] hover:text-[#A8A29E]"><Settings size={16} /></button>
          </div>
        </div>

        <div className="relative flex items-start gap-4">
          {/* Avatar with candle */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border ${settings?.ghostMode ? 'border-[#7B2CBF]' : 'border-[#3F3F3F]'} flex items-center justify-center text-3xl`}
              style={settings?.ghostMode ? { boxShadow: '0 0 20px rgba(123, 44, 191, 0.5)' } : mood ? { boxShadow: `0 0 22px ${mood.color}88` } : borderStyle(profile.decor?.border)}>{profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : (profile.avatar || '🦇')}</div>
            {/* Candle indicator */}
            {candleActive && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0A0A0A] border border-[#C9A961]/40 flex items-center justify-center" title={`lit by ${profile.candleLit.lastBy}`}>
                <span className="text-base animate-flicker">🕯</span>
                <span className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-[#C9A961]" style={{ width: `${candlePct * 100}%` }} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[#F5F1E8] text-xl truncate" style={F.brand}>{profile.name}</h2>
            </div>
            <div className="text-[#6B6B6B] text-[10px] uppercase tracking-wider mb-1" style={F.ui}>
              {profile.pronouns} {sign && <span className="ml-2 text-[#C8102E]">{sign.glyph} {sign.name.toLowerCase()}</span>}
            </div>
            {mood && (
              <button onClick={onOpenMood} className="inline-flex items-center gap-1 px-2 py-0.5 mb-1 border text-[10px] uppercase tracking-wider"
                style={{ borderColor: `${mood.color}66`, color: mood.color, textShadow: `0 0 6px ${mood.color}66`, ...F.ui }}>
                <span>{mood.glyph}</span><span>{mood.label}</span>
              </button>
            )}
            <p className="text-[#A8A29E] text-sm leading-snug" style={F.serif}>{profile.bio}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {profile.tags.map(t => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 border border-[#2A2A2A] text-[#A8A29E] uppercase tracking-wider" style={F.ui}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Candle attribution */}
        {candleActive && (
          <div className="relative mt-3 text-[10px] text-[#C8102E] flex items-center gap-1.5" style={F.serif}>
            <span className="opacity-60">🕯</span>
            <span><span style={F.ui} className="text-[#6B6B6B] uppercase tracking-wider mr-1">last lit by</span>{profile.candleLit.lastBy} · {timeAgo(profile.candleLit.at)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="relative flex items-center gap-5 mt-4 pt-4 border-t border-[#1A1A1A]">
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.posts}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>posts</span></div>
          <button onClick={onShowFollowers} className="text-left hover:opacity-80 transition-opacity"><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.followers}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>followers</span></button>
          <button onClick={onShowFollowing} className="text-left hover:opacity-80 transition-opacity"><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.following}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>following</span></button>
        </div>

        <button onClick={() => setShowRecap(true)}
          className="relative w-full mt-3 py-2 text-[10px] uppercase tracking-[0.25em] text-[#C8102E] border border-[#2A2A2A] hover:border-[#5B0F1A] hover:text-[#C9A961] transition-colors" style={F.ui}>
          ✦ your dark recap
        </button>
        {showRecap && <DarkRecapModal stats={recapStats} onClose={() => setShowRecap(false)} />}
        {showArcana && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center animate-fade-in p-6"
            onClick={() => setShowArcana(false)}>
            <div onClick={e => e.stopPropagation()}>
              <ArcanaCard handle={profile.name} mode="full" />
              <button onClick={() => setShowArcana(false)}
                className="mt-4 mx-auto block text-[10px] uppercase tracking-[0.3em] text-[#C8102E]/70 hover:text-[#C9A961]" style={F.ui}>· close ·</button>
            </div>
          </div>
        )}

        {/* Scenes you're in */}
        {joinedScenes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] mb-2" style={F.ui}>· scenes you're in ·</div>
            <div className="flex flex-wrap gap-1.5">
              {joinedScenes.map(s => (
                <button key={s.id} onClick={() => onOpenScene && onOpenScene(s.id)}
                  className="flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] hover:border-[#5B0F1A] text-[#A8A29E] hover:text-[#F5F1E8] text-[11px] transition-colors" style={F.ui}>
                  <span>{s.glyph}</span><span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pinned post */}
      {pinnedPost && (
        <button onClick={() => onOpenComments && onOpenComments(pinnedPost.id)}
          className="block w-full text-left mx-4 mt-3 p-3 border border-[#C9A961]/40 bg-gradient-to-br from-[#C9A961]/10 to-transparent hover:border-[#C9A961] transition-colors" style={{ width: 'calc(100% - 2rem)' }}>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C9A961] mb-1.5 flex items-center gap-1.5" style={F.ui}>
            <span>📌</span> · pinned to the shrine ·
          </div>
          {pinnedPost.body && <p className="text-[#F5F1E8] text-sm leading-snug italic line-clamp-3" style={F.serif}>"{pinnedPost.body}"</p>}
          <div className="text-[10px] text-[#C8102E] mt-1" style={F.mono}>{pinnedPost.time}</div>
        </button>
      )}

      {/* Story highlights */}
      {storyHighlights.length > 0 && (
        <div className="mx-4 mt-3 border border-[#2A2A2A] bg-[#0F0F0F]" style={{ width: 'calc(100% - 2rem)' }}>
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· kept stories ·</span>
            <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{storyHighlights.length}</span>
          </div>
          <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
            {storyHighlights.map(h => (
              <div key={h.id} className="relative shrink-0 group">
                <div className="w-16 h-20 border border-[#C9A961]/40 flex flex-col items-center justify-center p-1"
                  style={{
                    background: ({
                      red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
                      violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
                      gold: 'linear-gradient(135deg, #3B2F0A 0%, #1A1408 70%, #0A0804 100%)',
                      silver: 'linear-gradient(135deg, #2A2A30 0%, #14141A 70%, #0A0A10 100%)',
                      black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
                    })[h.bg] || 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)'
                  }}>
                  <span className="text-2xl mb-1">{h.glyph}</span>
                  <span className="text-[8px] text-white/70 text-center line-clamp-2" style={F.scripture}>{h.caption}</span>
                </div>
                <button onClick={() => onRemoveHighlight && onRemoveHighlight(h.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#8B0000] text-xs opacity-0 group-hover:opacity-100 p-1 transition-colors">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Theme picker modal */}
      {showThemePicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setShowThemePicker(false)}>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· tint your shrine ·</span>
                <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>THEME</h3>
              </div>
              <button onClick={() => setShowThemePicker(false)} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {Object.keys(SHRINE_THEMES).map(name => (
                <button key={name} onClick={() => { onSetShrineTheme && onSetShrineTheme(name); setShowThemePicker(false); }}
                  className={`relative h-20 border-2 ${shrineTheme === name ? 'border-[#C9A961]' : 'border-[#2A2A2A]'} overflow-hidden`}>
                  <div className="absolute inset-0 bg-[#0A0A0A]" />
                  <div className="absolute inset-0 opacity-60" style={{ background: SHRINE_THEMES[name] }} />
                  <div className="absolute bottom-1 left-2 text-[10px] uppercase tracking-wider text-[#F5F1E8]" style={F.ui}>{name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Daily ritual + crystals strip */}
      <div className="mx-4 mt-4 grid grid-cols-2 gap-2" style={{ width: 'calc(100% - 2rem)' }}>
        <button onClick={onPerformRitual} disabled={ritualDoneToday}
          className={`p-3 border text-left transition-colors ${ritualDoneToday ? 'border-[#C9A961]/40 bg-[#C9A961]/5' : 'border-[#2A2A2A] hover:border-[#A89968]/40 bg-[#0F0F0F]'}`}>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E] mb-1" style={F.ui}>· daily ritual ·</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#C9A961] text-2xl leading-none" style={F.mono}>{ritual?.streak || 0}</span>
            <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{(ritual?.streak || 0) === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="text-[10px] text-[#C8102E] mt-0.5 italic" style={F.serif}>
            {ritualDoneToday ? '· marked for today ·' : 'tap to mark'}
          </div>
        </button>
        <CrystalsBlock crystals={crystals} onToggleCrystal={onToggleCrystal} />
      </div>

      {/* Your flame + altar shrine */}
      <SelfFlame flameLitAt={flameLitAt} onTend={onTendFlame} />
      <ShrineBlock shrine={shrine} onSetShrine={onSetShrine} state={achievementState} />

      {/* Now playing */}
      <button onClick={onOpenNowPlaying} className="w-full text-left mx-4 mt-4 p-3 border border-[#2A2A2A] bg-gradient-to-br from-[#A89968]/10 to-transparent hover:border-[#A89968]/50 transition-colors group" style={{ width: 'calc(100% - 2rem)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E] flex items-center gap-1.5" style={F.ui}>
            <Music size={11} /> · now playing ·
          </span>
          <Pencil size={11} className="text-[#6B6B6B] group-hover:text-[#A8A29E]" />
        </div>
        {nowPlaying ? (
          <div className="flex items-center gap-2.5">
            {/* spinning record — faster + emphasized when on repeat */}
            <span className="relative shrink-0 w-7 h-7 rounded-full animate-spin" style={{
              animationDuration: nowPlaying.loop ? '1.8s' : '3s',
              background: 'radial-gradient(circle at center, #C9A961 0 14%, #0A0A0A 15% 42%, #1A1A1A 43% 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(201,169,97,0.25)',
            }}>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#0A0A0A]" />
            </span>
            <p className="text-[#F5F1E8] text-sm leading-snug min-w-0" style={F.serif}>
              <span className="text-[#C9A961]">{nowPlaying.artist}</span>
              {nowPlaying.artist && nowPlaying.track && <span className="text-[#C8102E]/60"> · </span>}
              <span className="italic">{nowPlaying.track}</span>
              {nowPlaying.loop && <span className="ml-1.5 align-middle text-[9px] uppercase tracking-wider text-[#C9A961] border border-[#C9A961]/40 px-1 py-0.5" style={F.ui}>↻ repeat</span>}
            </p>
          </div>
        ) : (
          <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>tap to set what's on rotation</p>
        )}
      </button>

      {/* Reflections (private) */}
      <button onClick={onOpenReflections} className="w-full text-left mx-4 mt-3 p-3 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#A89968]/40 transition-colors group flex items-center gap-2" style={{ width: 'calc(100% - 2rem)' }}>
        <span className="text-[#C8102E] text-base">✎</span>
        <span className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.ui}>· reflections · only you ·</span>
          <span className="block text-[#A8A29E] text-xs italic" style={F.serif}>
            {reflectionsCount > 0 ? `${reflectionsCount} ${reflectionsCount === 1 ? 'entry' : 'entries'}` : 'write to yourself'}
          </span>
        </span>
      </button>

      {/* Dream journal (private) */}
      <button onClick={onOpenDreams} className="w-full text-left mx-4 mt-3 p-3 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#5C5C8A]/50 transition-colors group flex items-center gap-2" style={{ width: 'calc(100% - 2rem)' }}>
        <span className="text-[#A6A6D0] text-base">☾</span>
        <span className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A6A6D0]" style={F.ui}>· dream journal · only you ·</span>
          <span className="block text-[#A8A29E] text-xs italic" style={F.serif}>
            {dreamsCount > 0 ? `${dreamsCount} ${dreamsCount === 1 ? 'dream' : 'dreams'} recorded` : 'what did you see in the dark'}
          </span>
        </span>
      </button>

      {/* Your tickets (rites you've bought into) */}
      <button onClick={onOpenTickets} className="w-full text-left mx-4 mt-3 p-3 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#A89968]/40 transition-colors group flex items-center gap-2" style={{ width: 'calc(100% - 2rem)' }}>
        <span className="text-[#C8102E] text-base">𖤐</span>
        <span className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.ui}>· your tickets ·</span>
          <span className="block text-[#A8A29E] text-xs italic" style={F.serif}>rites you've paid into</span>
        </span>
        <ChevronRight size={16} className="text-[#3F3F3F]" />
      </button>

      {/* Tonight status — clickable */}
      <button onClick={onOpenTonightStatus} className="w-full text-left mx-4 my-4 p-3 border border-[#2A2A2A] bg-gradient-to-br from-[#5B0F1A]/15 to-transparent hover:border-[#5B0F1A]/50 transition-colors group" style={{ width: 'calc(100% - 2rem)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#5B0F1A]" style={F.ui}>· tonight ·</span>
          <Pencil size={11} className="text-[#6B6B6B] group-hover:text-[#A8A29E]" />
        </div>
        {profile.status ? (
          <p className="text-[#F5F1E8] text-base leading-snug" style={F.serif}>"{profile.status}"</p>
        ) : (
          <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>tap to set what you're up to tonight</p>
        )}
      </button>

      {/* The log (tracker) */}
      <div className="px-4 pb-4">
        <TrackerGrid trackers={trackers} onUpdate={onUpdateTracker} />
      </div>

      {/* Memento mori */}
      {mementoMoriOn !== false && (
        <div className="mx-4 mb-4 p-3 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· memento mori ·</span>
            <span className="text-[#6B6B6B] text-base">☠</span>
          </div>
          {daysLived == null ? (
            <p className="text-[#A8A29E] text-sm" style={F.serif}>add your birthday to count the days.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[#F5F1E8] text-2xl leading-none" style={F.mono}>{daysLived.toLocaleString()}</div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-1" style={F.ui}>days lived</div>
              </div>
              {settings?.mementoExpected !== false && (
                <div>
                  <div className="text-[#C8102E] text-2xl leading-none" style={F.mono}>~{daysExpected.toLocaleString()}</div>
                  <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-1" style={F.ui}>days left · est</div>
                </div>
              )}
            </div>
          )}
          <p className="text-[#6B6B6B] text-[11px] mt-2 italic" style={F.serif}>"remember, mortal, that thou must die."</p>
        </div>
      )}

      {/* Graves */}
      <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· in memoriam ·</span>
          <button onClick={onAddGrave} className="text-[10px] uppercase tracking-wider text-[#C8102E] hover:text-[#C9A961]" style={F.ui}>+ add</button>
        </div>
        {graves.length > 0 ? (
          <div className="divide-y divide-[#1A1A1A]">
            {graves.map(g => {
              const candleAge = g.candleLitAt ? Date.now() - g.candleLitAt : Infinity;
              const candleBurning = candleAge < 1000 * 60 * 60 * 24;
              return (
                <div key={g.id} className="px-3 py-3 flex items-start gap-3">
                  <span className="text-[#5B0F1A] text-2xl shrink-0 relative">
                    ⚱
                    {candleBurning && <span className="absolute -top-1 -right-1 text-sm animate-flicker">🕯</span>}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <h4 className="text-[#F5F1E8] text-base leading-tight flex items-center gap-1.5" style={F.display}>
                        {g.name}
                        {g.private && <Lock size={11} className="text-[#6B6B6B] shrink-0" title="private — only you can see this" />}
                      </h4>
                      <span className="text-[10px] text-[#C8102E] uppercase tracking-wider shrink-0" style={F.ui}>{g.kind}</span>
                    </div>
                    <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{g.dates}</div>
                    <p className="text-[#A8A29E] text-sm mt-1 italic leading-snug" style={F.serif}>"{g.epitaph}"</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[#5B0F1A] text-xs">❀</span>
                        <span className="text-[10px] text-[#A8A29E]" style={F.ui}>{g.flowers} flowers</span>
                      </div>
                      <button onClick={() => onLightCandle && onLightCandle(g.id)}
                        disabled={candleBurning}
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border transition-colors ${candleBurning ? 'border-[#C9A961]/40 text-[#C9A961]/80 cursor-default' : 'border-[#2A2A2A] text-[#C8102E] hover:border-[#C9A961] hover:text-[#C9A961]'}`}
                        style={F.ui}>
                        {candleBurning ? '🕯 lit' : '🕯 light a candle'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <button onClick={onAddGrave} className="w-full px-3 py-5 text-center text-[#6B6B6B] text-xs italic hover:text-[#A8A29E] transition-colors" style={F.serif}>
            lay your dead to rest — add a memorial
          </button>
        )}
      </div>

      {/* Sigil journal */}
      {sigils.length > 0 && (
        <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· sealed sigils ·</span>
            <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{sigils.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[#1A1A1A]">
            {sigils.slice(0, 9).map(s => (
              <div key={s.id} className="aspect-square bg-[#050204] relative flex items-center justify-center group">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#A89968" strokeWidth="0.3" opacity="0.4" />
                  {s.letters && s.letters.length > 0 && (
                    <>
                      <polyline points={s.letters.map((l) => {
                        const i = l.charCodeAt(0) - 97;
                        const angle = (i / 26) * Math.PI * 2 - Math.PI / 2;
                        return `${50 + Math.cos(angle) * 32},${50 + Math.sin(angle) * 32}`;
                      }).join(' ')} fill="none" stroke="#C9A961" strokeWidth="1" strokeLinejoin="round" />
                      <circle cx={50 + Math.cos((s.letters[0].charCodeAt(0) - 97) / 26 * Math.PI * 2 - Math.PI / 2) * 32}
                        cy={50 + Math.sin((s.letters[0].charCodeAt(0) - 97) / 26 * Math.PI * 2 - Math.PI / 2) * 32}
                        r="2" fill="none" stroke="#C9A961" strokeWidth="0.8" />
                    </>
                  )}
                </svg>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] text-[#C9A961] truncate" style={F.scripture}>"{s.intention}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crews */}
      <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· your crews ·</span>
          <button onClick={onBrowseCrews} className="text-[10px] uppercase tracking-wider text-[#C8102E] hover:text-[#C9A961]" style={F.ui}>browse</button>
        </div>
        {crews.length > 0 ? (
          <div className="divide-y divide-[#1A1A1A]">
            {crews.map(c => (
              <button key={c.id} onClick={() => onOpenCrew && onOpenCrew(c.id)}
                className="w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-[#0A0A0A] transition-colors">
                <div className="w-10 h-10 shrink-0 border border-[#2A2A2A] flex items-center justify-center text-[#C8102E] text-lg">{c.glyph}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h4 className="text-[#F5F1E8] text-sm truncate" style={F.display}>{c.name}</h4>
                    <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{c.members}</span>
                  </div>
                  {c.description && <p className="text-[#A8A29E] text-xs italic leading-snug" style={F.serif}>{c.description}</p>}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <button onClick={onBrowseCrews} className="w-full px-3 py-5 text-center text-[#6B6B6B] text-xs italic hover:text-[#A8A29E] transition-colors" style={F.serif}>
            you haven't joined a circle yet — browse crews
          </button>
        )}
      </div>

      {/* Anniversaries */}
      <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· anniversaries ·</span>
          <div className="flex items-center gap-3">
            <button onClick={onAddAnniversary} className="text-[10px] uppercase tracking-wider text-[#C8102E] hover:text-[#C9A961]" style={F.ui}>+ add</button>
            {anniversaries.length > 0 && (
              <button onClick={() => setShowAllAnniv(!showAllAnniv)} className="text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
                {showAllAnniv ? 'less' : 'all'}
              </button>
            )}
          </div>
        </div>
          <div className="divide-y divide-[#1A1A1A]">
            {anniversaries.filter(a => showAllAnniv || a.visible).map(a => {
              const days = daysBetween(new Date(a.date));
              const years = (days / 365).toFixed(1);
              return (
                <div key={a.id} className="px-3 py-2.5 flex items-center gap-3">
                  <span className="text-[#C8102E] text-base shrink-0">✦</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F5F1E8] text-sm" style={F.serif}>{a.label}</div>
                    {a.description && <div className="text-[10px] text-[#6B6B6B]" style={F.ui}>{a.description}</div>}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[#F5F1E8] text-sm" style={F.mono}>{years}y</div>
                    <div className="text-[9px] text-[#6B6B6B] uppercase" style={F.ui}>{a.visible ? 'public' : 'private'}</div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      {/* Achievements */}
      <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· marks earned ·</span>
          <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{earned.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[#1A1A1A]">
          {ACHIEVEMENTS.map(a => {
            const has = earnedIds.has(a.id);
            const active = selectedMark?.id === a.id;
            return (
              <button key={a.id}
                onClick={() => setSelectedMark(active ? null : a)}
                className={`relative aspect-square flex flex-col items-center justify-center p-1 transition-colors ${active ? 'bg-[#5B0F1A]/20' : 'bg-[#0F0F0F]'} ${has ? '' : 'opacity-25 grayscale'}`}>
                <span className={`text-2xl ${has ? 'text-[#C9A961]' : 'text-[#6B6B6B]'}`}>{a.glyph}</span>
                <span className="text-[8px] text-center uppercase tracking-wider mt-0.5 text-[#A8A29E] line-clamp-1" style={F.ui}>{a.name}</span>
              </button>
            );
          })}
        </div>
        {/* tap a mark to see what it is + how to earn it */}
        <div className="px-3 py-2.5 border-t border-[#1A1A1A]">
          {selectedMark ? (
            <div className="flex items-center gap-2.5">
              <span className={`text-xl ${earnedIds.has(selectedMark.id) ? 'text-[#C9A961]' : 'text-[#6B6B6B]'}`}>{selectedMark.glyph}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[#F5F1E8] text-xs uppercase tracking-wider" style={F.ui}>{selectedMark.name}</div>
                <div className="text-[10px] text-[#C8102E]/80 italic" style={F.serif}>{selectedMark.desc}</div>
              </div>
              <span className={`text-[9px] uppercase tracking-[0.18em] ${earnedIds.has(selectedMark.id) ? 'text-[#C9A961]' : 'text-[#6B6B6B]'}`} style={F.ui}>
                {earnedIds.has(selectedMark.id) ? '✓ earned' : 'locked'}
              </span>
            </div>
          ) : (
            <p className="text-[10px] text-[#6B6B6B] italic text-center" style={F.serif}>tap a mark to see what it means</p>
          )}
        </div>
      </div>

      {/* Finish-your-shrine nudge (own profile, no portrait yet) */}
      {!profile?.avatarUrl && !nudgeHidden && (
        <div className="mx-4 my-3 border border-[#3F2A14] bg-[#0F0A06]/60 p-3 flex items-center gap-3">
          <span className="text-2xl shrink-0">🕯</span>
          <div className="flex-1 min-w-0">
            <div className="text-[#C9A961] text-[11px] uppercase tracking-[0.25em]" style={F.scriptureSC}>· your shrine is unfinished ·</div>
            <p className="text-[#A8A29E] text-xs italic mt-0.5" style={F.serif}>add a portrait so souls recognize you.</p>
          </div>
          <button onClick={onEditProfile} className="shrink-0 px-3 py-1.5 text-[9px] uppercase tracking-wider bg-[#5B0F1A] hover:bg-[#8B0000] text-[#F5F1E8]" style={F.ui}>tend it</button>
          <button onClick={() => setNudgeHidden(true)} className="shrink-0 text-[#6B6B6B] hover:text-[#A8A29E] p-1 -m-1" title="dismiss"><X size={14} /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-y border-[#1A1A1A] flex">
        {['grid', 'saved', 'activity'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] ${tab === t ? 'text-[#F5F1E8] border-b border-[#8B0000]' : 'text-[#6B6B6B]'}`}
            style={F.ui}>
            {t}
            {t === 'saved' && bookmarks.length > 0 && <span className="ml-1.5 text-[#C9A961]" style={F.mono}>{bookmarks.length}</span>}
            {t === 'activity' && activityLog.length > 0 && <span className="ml-1.5 text-[#C9A961]" style={F.mono}>{activityLog.length}</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {tab === 'grid' && (
        <PostGrid posts={myPosts} loading={postsLoading} emptyText="you haven't posted yet" onOpen={onOpenComments} />
      )}
      {tab === 'saved' && (
        bookmarks.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>
            \u00b7 nothing saved yet. tap the bookmark on any post \u00b7
          </div>
        ) : (
          <div className="divide-y divide-[#1A1A1A]">
            {bookmarks.map(post => (
              <button key={post.id} onClick={() => onOpenComments && onOpenComments(post.id)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-[#0F0F0F] text-left transition-colors">
                <div className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-base shrink-0">{post.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#F5F1E8] text-sm" style={F.ui}>{post.user}</span>
                    <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{post.time}</span>
                  </div>
                  {post.body && <p className="text-[#A8A29E] text-sm mt-1 line-clamp-2" style={F.serif}>{post.body}</p>}
                  {post.kind === 'event' && <p className="text-[#C8102E] text-sm mt-1" style={F.display}>{post.event.name}</p>}
                </div>
              </button>
            ))}
          </div>
        )
      )}

      {tab === 'activity' && (
        activityLog.length === 0 ? (
          <div className="px-4 py-12 text-center text-[#6B6B6B] text-sm italic" style={F.serif}>
            \u00b7 the night is still \u00b7
          </div>
        ) : (
          <div className="divide-y divide-[#1A1A1A]">
            {activityLog.map(entry => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                <span className="text-[#C8102E] text-base shrink-0 w-6 text-center">{entry.glyph || '\u00b7'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#F5F1E8] text-sm" style={F.serif}>{entry.label}</div>
                  {entry.detail && <div className="text-[11px] text-[#A8A29E] italic line-clamp-2 mt-0.5" style={F.serif}>{entry.detail}</div>}
                  <div className="text-[10px] text-[#6B6B6B] mt-0.5" style={F.mono}>{timeAgo(entry.at)}</div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// Your own flame — lit by tending it; burns down over ~48h and gutters out if you stay away.
const FLAME_MS = 48 * 60 * 60 * 1000;
function SelfFlame({ flameLitAt = 0, onTend }) {
  const elapsed = Date.now() - (flameLitAt || 0);
  const lit = flameLitAt > 0 && elapsed < FLAME_MS;
  const pct = lit ? Math.max(0, 1 - elapsed / FLAME_MS) : 0;
  const low = lit && pct < 0.25;
  return (
    <button onClick={onTend}
      className="w-full text-left mx-4 mt-4 p-3 border border-[#2A2A2A] bg-gradient-to-br from-[#5B0F1A]/10 to-transparent hover:border-[#5B0F1A]/50 transition-colors flex items-center gap-3"
      style={{ width: 'calc(100% - 2rem)' }}>
      <span className={`text-2xl ${lit ? 'animate-flicker' : 'opacity-40 grayscale'}`}>🕯</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.ui}>· your flame ·</div>
        <div className="text-[#A8A29E] text-xs italic mt-0.5" style={F.serif}>
          {!lit ? 'your flame has gone out — tap to light it' : low ? 'guttering — tend it before it dies' : 'burning. return to tend it.'}
        </div>
        <div className="mt-1.5 h-1 bg-[#1A1A1A] overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${Math.round(pct * 100)}%`, background: low ? '#8B0000' : '#C9A961' }} />
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[#C8102E] shrink-0" style={F.ui}>{lit ? 'tend' : 'light'}</span>
    </button>
  );
}

// The altar — arrange objects you've earned through practice. Up to 5 on the shrine.
function ShrineBlock({ shrine = [], onSetShrine, state = {} }) {
  const [open, setOpen] = useState(false);
  const earned = new Set(earnedShrine(state).map(o => o.id));
  const placed = SHRINE_OBJECTS.filter(o => shrine.includes(o.id)).slice(0, 5);
  const toggle = (id) => {
    if (!earned.has(id)) return;
    const has = shrine.includes(id);
    const next = has ? shrine.filter(x => x !== id) : (shrine.length < 5 ? [...shrine, id] : shrine);
    onSetShrine && onSetShrine(next);
  };
  return (
    <>
      <button onClick={() => setOpen(true)}
        className="w-full text-left mx-4 mt-4 p-3 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#A89968]/40 transition-colors" style={{ width: 'calc(100% - 2rem)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.ui}>· the altar ·</span>
          <span className="text-[10px] text-[#6B6B6B]" style={F.ui}>{earned.size}/{SHRINE_OBJECTS.length} earned</span>
        </div>
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map(i => (
            <span key={i} className="w-8 h-8 flex items-center justify-center border border-[#1A1A1A] bg-[#0A0204]/60 text-lg">
              {placed[i] ? placed[i].glyph : <span className="text-[#2A2A2A] text-xs">·</span>}
            </span>
          ))}
          <span className="ml-auto text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>arrange →</span>
        </div>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· place up to 5 · earned by practice ·</span>
                <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>THE ALTAR</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1"><X size={20} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {SHRINE_OBJECTS.map(o => {
                const got = earned.has(o.id);
                const on = shrine.includes(o.id);
                return (
                  <button key={o.id} onClick={() => toggle(o.id)} disabled={!got}
                    className={`flex items-start gap-2 p-2 border text-left transition-colors ${on ? 'border-[#C9A961] bg-[#C9A961]/10' : got ? 'border-[#2A2A2A] hover:border-[#3F3F3F]' : 'border-[#1A1A1A] opacity-50'}`}>
                    <span className={`text-2xl shrink-0 leading-none mt-0.5 ${got ? '' : 'grayscale opacity-60'}`}>{o.glyph}</span>
                    <span className="min-w-0">
                      <span className="block text-[#F5F1E8] text-sm" style={F.serif}>{o.name}</span>
                      <span className="block text-[10px] text-[#6B6B6B] italic mt-0.5 leading-snug" style={F.serif}>{got ? 'earned' : o.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CrystalsBlock({ crystals, onToggleCrystal }) {
  const [open, setOpen] = useState(false);
  const carried = CRYSTAL_OPTIONS.filter(c => crystals.includes(c.id));
  const focus = carried[0]; // first stone carried = your current intention

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="p-3 border border-[#2A2A2A] hover:border-[#A89968]/40 bg-[#0F0F0F] text-left transition-colors">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E] mb-1" style={F.ui}>· crystals carried ·</div>
        {carried.length === 0 ? (
          <div className="text-[#6B6B6B] text-sm italic" style={F.serif}>none yet — carry a stone, set an intention</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1">
              {carried.map(c => (
                <span key={c.id} className="text-base" style={{ color: c.tint }} title={`${c.name} — ${c.intention}`}>{c.glyph}</span>
              ))}
            </div>
            {focus && (
              <div className="text-[10px] text-[#C8102E]/80 mt-1.5 italic" style={F.serif}>· focus: {focus.intention} ·</div>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E]" style={F.scriptureSC}>· choose up to 6 · first sets your focus ·</span>
                <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>STONES CARRIED</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {CRYSTAL_OPTIONS.map(c => {
                const has = crystals.includes(c.id);
                return (
                  <button key={c.id} onClick={() => onToggleCrystal(c.id)}
                    className={`flex items-start gap-2 p-2 border text-left transition-colors ${has ? 'border-[#C9A961] bg-[#C9A961]/10' : 'border-[#2A2A2A] hover:border-[#3F3F3F]'}`}>
                    <span className="text-2xl shrink-0 leading-none mt-0.5" style={{ color: c.tint }}>{c.glyph}</span>
                    <span className="min-w-0">
                      <span className="block text-[#F5F1E8] text-sm" style={F.serif}>{c.name}</span>
                      <span className="block text-[10px] text-[#C8102E]/80 uppercase tracking-wider" style={F.ui}>{c.intention}</span>
                      <span className="block text-[10px] text-[#6B6B6B] italic mt-0.5 leading-snug" style={F.serif}>{c.meaning}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
