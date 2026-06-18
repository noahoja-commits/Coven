import { useState } from 'react';
import { Settings, Pencil, Plus, Heart, MoreHorizontal, ChevronRight, Music, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TrackerGrid } from '../trackers/TrackerGrid';
import { timeAgo, daysBetween, sunSign } from '../../data/helpers';
import { CREWS } from '../../data/crews';
import { ACHIEVEMENTS, earnedAchievements } from '../../data/achievements';

const SHRINE_THEMES = {
  oxblood: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)',
  violet: 'radial-gradient(ellipse at 50% 0%, #2D0F3F 0%, transparent 60%)',
  gold: 'radial-gradient(ellipse at 50% 0%, #3B2F0A 0%, transparent 60%)',
  silver: 'radial-gradient(ellipse at 50% 0%, #2A2A30 0%, transparent 60%)',
  cathedral: 'linear-gradient(180deg, #1F0810 0%, transparent 100%)',
};

export function ProfileScreen({ profile, graves, anniversaries, trackers, onUpdateTracker, onOpenTonightStatus, onOpenSettings, mementoMoriOn, settings, onEditProfile, onLightCandle, onOpenCrew, onBrowseCrews, onAddGrave, onAddAnniversary, onOpenNowPlaying, onOpenReflections, reflectionsCount = 0, nowPlaying, activityLog = [], sigils = [], bookmarks = [], onOpenComments, onOpenPost, ritual, ritualDoneToday, onPerformRitual, crystals = [], onToggleCrystal, pinnedPost, shrineTheme = 'oxblood', onSetShrineTheme, storyHighlights = [], onRemoveHighlight, achievementState = {} }) {
  const earned = earnedAchievements(achievementState);
  const earnedIds = new Set(earned.map(a => a.id));
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [tab, setTab] = useState('grid');
  const [showAllAnniv, setShowAllAnniv] = useState(false);

  // Memento mori calc
  const daysLived = profile.birthday ? daysBetween(new Date(profile.birthday)) : 0;
  // life expectancy ~80 years = 29200 days
  const daysExpected = Math.max(0, 29200 - daysLived);
  const sign = sunSign(profile.birthday);

  // Candle burn calc — 8 hours total
  const candleBurnMs = 1000 * 60 * 60 * 8;
  const candleAge = profile.candleLit ? Date.now() - profile.candleLit.at : Infinity;
  const candleActive = candleAge < candleBurnMs;
  const candlePct = candleActive ? Math.max(0, 1 - candleAge / candleBurnMs) : 0;

  return (
    <div className="pb-24">
      {/* Header card */}
      <div className="relative px-4 pt-4 pb-5 border-b border-[#1A1A1A] overflow-hidden">
        <div className="absolute inset-0 opacity-25" style={{ background: SHRINE_THEMES[shrineTheme] || SHRINE_THEMES.oxblood }} />

        <div className="relative flex justify-between items-start mb-4">
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]" style={F.ui}>· self ·</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Grave shortcut top-right */}
            {graves.length > 0 && (
              <button className="text-[10px] text-[#6B6B6B] hover:text-[#A8A29E] uppercase tracking-wider flex items-center gap-1" style={F.ui}>
                <span className="text-base">⚱</span>
                <span>{graves[0].name}</span>
              </button>
            )}
            <button onClick={() => setShowThemePicker(true)} className="text-[#6B6B6B] hover:text-[#A8A29E]" title="shrine theme">✦</button>
            <button onClick={onEditProfile} className="text-[#6B6B6B] hover:text-[#A8A29E]" title="edit profile"><Pencil size={14} /></button>
            <button onClick={onOpenSettings} className="text-[#6B6B6B] hover:text-[#A8A29E]"><Settings size={16} /></button>
          </div>
        </div>

        <div className="relative flex items-start gap-4">
          {/* Avatar with candle */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border ${settings?.ghostMode ? 'border-[#7B2CBF]' : 'border-[#3F3F3F]'} flex items-center justify-center text-3xl ${settings?.ghostMode ? '' : ''}`}
              style={settings?.ghostMode ? { boxShadow: '0 0 20px rgba(123, 44, 191, 0.5)' } : {}}>{profile.avatar || '🦇'}</div>
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
              {profile.pronouns} {sign && <span className="ml-2 text-[#A89968]">{sign.glyph} {sign.name.toLowerCase()}</span>}
            </div>
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
          <div className="relative mt-3 text-[10px] text-[#A89968] flex items-center gap-1.5" style={F.serif}>
            <span className="opacity-60">🕯</span>
            <span><span style={F.ui} className="text-[#6B6B6B] uppercase tracking-wider mr-1">last lit by</span>{profile.candleLit.lastBy} · {timeAgo(profile.candleLit.at)}</span>
          </div>
        )}

        {/* Stats */}
        <div className="relative flex items-center gap-5 mt-4 pt-4 border-t border-[#1A1A1A]">
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.posts}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>posts</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.followers}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>followers</span></div>
          <div><span className="text-[#F5F1E8] text-base block leading-none" style={F.mono}>{profile.following}</span><span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>following</span></div>
        </div>
      </div>

      {/* Pinned post */}
      {pinnedPost && (
        <button onClick={() => onOpenComments && onOpenComments(pinnedPost.id)}
          className="block w-full text-left mx-4 mt-3 p-3 border border-[#C9A961]/40 bg-gradient-to-br from-[#C9A961]/10 to-transparent hover:border-[#C9A961] transition-colors" style={{ width: 'calc(100% - 2rem)' }}>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#C9A961] mb-1.5 flex items-center gap-1.5" style={F.ui}>
            <span>📌</span> · pinned to the shrine ·
          </div>
          {pinnedPost.body && <p className="text-[#F5F1E8] text-sm leading-snug italic line-clamp-3" style={F.serif}>"{pinnedPost.body}"</p>}
          <div className="text-[10px] text-[#A89968] mt-1" style={F.mono}>{pinnedPost.time}</div>
        </button>
      )}

      {/* Story highlights */}
      {storyHighlights.length > 0 && (
        <div className="mx-4 mt-3 border border-[#2A2A2A] bg-[#0F0F0F]" style={{ width: 'calc(100% - 2rem)' }}>
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· kept stories ·</span>
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
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· tint your shrine ·</span>
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
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1" style={F.ui}>· daily ritual ·</div>
          <div className="flex items-baseline gap-2">
            <span className="text-[#C9A961] text-2xl leading-none" style={F.mono}>{ritual?.streak || 0}</span>
            <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>{(ritual?.streak || 0) === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="text-[10px] text-[#A89968] mt-0.5 italic" style={F.serif}>
            {ritualDoneToday ? '· marked for today ·' : 'tap to mark'}
          </div>
        </button>
        <CrystalsBlock crystals={crystals} onToggleCrystal={onToggleCrystal} />
      </div>

      {/* Now playing */}
      <button onClick={onOpenNowPlaying} className="w-full text-left mx-4 mt-4 p-3 border border-[#2A2A2A] bg-gradient-to-br from-[#A89968]/10 to-transparent hover:border-[#A89968]/50 transition-colors group" style={{ width: 'calc(100% - 2rem)' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] flex items-center gap-1.5" style={F.ui}>
            <Music size={11} /> · now playing ·
          </span>
          <Pencil size={11} className="text-[#6B6B6B] group-hover:text-[#A8A29E]" />
        </div>
        {nowPlaying ? (
          <p className="text-[#F5F1E8] text-sm leading-snug" style={F.serif}>
            <span className="text-[#C9A961]">{nowPlaying.artist}</span>
            {nowPlaying.artist && nowPlaying.track && <span className="text-[#A89968]/60"> · </span>}
            <span className="italic">{nowPlaying.track}</span>
          </p>
        ) : (
          <p className="text-[#6B6B6B] text-sm italic" style={F.serif}>tap to set what's on rotation</p>
        )}
      </button>

      {/* Reflections (private) */}
      <button onClick={onOpenReflections} className="w-full text-left mx-4 mt-3 p-3 border border-[#2A2A2A] bg-[#0F0F0F] hover:border-[#A89968]/40 transition-colors group flex items-center gap-2" style={{ width: 'calc(100% - 2rem)' }}>
        <span className="text-[#A89968] text-base">✎</span>
        <span className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.ui}>· reflections · only you ·</span>
          <span className="block text-[#A8A29E] text-xs italic" style={F.serif}>
            {reflectionsCount > 0 ? `${reflectionsCount} ${reflectionsCount === 1 ? 'entry' : 'entries'}` : 'write to yourself'}
          </span>
        </span>
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
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· memento mori ·</span>
            <span className="text-[#6B6B6B] text-base">☠</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[#F5F1E8] text-2xl leading-none" style={F.mono}>{daysLived.toLocaleString()}</div>
              <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-1" style={F.ui}>days lived</div>
            </div>
            {settings?.mementoExpected !== false && (
              <div>
                <div className="text-[#A89968] text-2xl leading-none" style={F.mono}>~{daysExpected.toLocaleString()}</div>
                <div className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mt-1" style={F.ui}>days expected</div>
              </div>
            )}
          </div>
          <p className="text-[#6B6B6B] text-[11px] mt-2 italic" style={F.serif}>"remember, mortal, that thou must die."</p>
        </div>
      )}

      {/* Graves */}
      {graves.length > 0 && (
        <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· in memoriam ·</span>
            <button onClick={onAddGrave} className="text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961]" style={F.ui}>+ add</button>
          </div>
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
                      <h4 className="text-[#F5F1E8] text-base leading-tight" style={F.display}>{g.name}</h4>
                      <span className="text-[10px] text-[#A89968] uppercase tracking-wider shrink-0" style={F.ui}>{g.kind}</span>
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
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border transition-colors ${candleBurning ? 'border-[#C9A961]/40 text-[#C9A961]/80 cursor-default' : 'border-[#2A2A2A] text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961]'}`}
                        style={F.ui}>
                        {candleBurning ? '🕯 lit' : '🕯 light a candle'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sigil journal */}
      {sigils.length > 0 && (
        <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· sealed sigils ·</span>
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
      {CREWS.filter(c => c.isMember).length > 0 && (
        <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· your crews ·</span>
            <button onClick={onBrowseCrews} className="text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961]" style={F.ui}>browse</button>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {CREWS.filter(c => c.isMember).map(c => (
              <button key={c.id} onClick={() => onOpenCrew && onOpenCrew(c.id)}
                className="w-full text-left px-3 py-3 flex items-start gap-3 hover:bg-[#0A0A0A] transition-colors">
                <div className="w-10 h-10 shrink-0 border border-[#2A2A2A] flex items-center justify-center text-[#A89968] text-lg">{c.glyph}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h4 className="text-[#F5F1E8] text-sm truncate" style={F.display}>{c.name}</h4>
                    <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{c.members}/{c.maxMembers}</span>
                  </div>
                  <p className="text-[#A8A29E] text-xs italic mb-1 leading-snug" style={F.serif}>{c.description}</p>
                  {c.nextEvent && (
                    <div className="text-[10px] text-[#5B0F1A] uppercase tracking-wider" style={F.ui}>→ {c.nextEvent}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Anniversaries */}
      <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
        <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· anniversaries ·</span>
          <div className="flex items-center gap-3">
            <button onClick={onAddAnniversary} className="text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961]" style={F.ui}>+ add</button>
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
                  <span className="text-[#A89968] text-base shrink-0">✦</span>
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
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· marks earned ·</span>
          <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{earned.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[#1A1A1A]">
          {ACHIEVEMENTS.map(a => {
            const has = earnedIds.has(a.id);
            return (
              <div key={a.id}
                title={`${a.name} — ${a.desc}`}
                className={`relative aspect-square flex flex-col items-center justify-center p-1 bg-[#0F0F0F] ${has ? '' : 'opacity-25 grayscale'}`}>
                <span className={`text-2xl ${has ? 'text-[#C9A961]' : 'text-[#6B6B6B]'}`}>{a.glyph}</span>
                <span className="text-[8px] text-center uppercase tracking-wider mt-0.5 text-[#A8A29E] line-clamp-1" style={F.ui}>{a.name}</span>
              </div>
            );
          })}
        </div>
      </div>

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
        <div className="grid grid-cols-3 gap-px bg-[#1A1A1A]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square relative overflow-hidden bg-[#0A0A0A]">
              <div className="absolute inset-0" style={{
                background: i % 3 === 0
                  ? 'linear-gradient(135deg, #3B0A12 0%, #1A0408 70%, #0A0204 100%)'
                  : i % 3 === 1
                  ? 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)'
                  : 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)'
              }} />
              <div className="absolute inset-0 flex items-center justify-center text-[#3F3F3F] text-3xl" style={F.display}>
                {['✟', '⚱', '☩', '⛧', '✦', '☽'][i % 6]}
              </div>
            </div>
          ))}
        </div>
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
                  {post.kind === 'event' && <p className="text-[#A89968] text-sm mt-1" style={F.display}>{post.event.name}</p>}
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
                <span className="text-[#A89968] text-base shrink-0 w-6 text-center">{entry.glyph || '\u00b7'}</span>
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

const CRYSTAL_OPTIONS = [
  { id: 'obsidian', name: 'obsidian', glyph: '◆', color: '#1A1A1A', tint: '#2A2A2A' },
  { id: 'onyx', name: 'onyx', glyph: '◆', color: '#0A0A0A', tint: '#5B0F1A' },
  { id: 'amethyst', name: 'amethyst', glyph: '◇', color: '#2D0F3F', tint: '#7B2CBF' },
  { id: 'jet', name: 'jet', glyph: '◆', color: '#0A0204', tint: '#1F1F1F' },
  { id: 'garnet', name: 'garnet', glyph: '◆', color: '#3B0A12', tint: '#8B0000' },
  { id: 'moonstone', name: 'moonstone', glyph: '◯', color: '#1A1A2A', tint: '#8A8A92' },
  { id: 'tourmaline', name: 'tourmaline', glyph: '◆', color: '#1A1F2E', tint: '#3F3F3F' },
  { id: 'labradorite', name: 'labradorite', glyph: '◇', color: '#2A2A30', tint: '#7B5C3A' },
  { id: 'bloodstone', name: 'bloodstone', glyph: '◆', color: '#1F0A0A', tint: '#5B0F1A' },
  { id: 'smoky', name: 'smoky quartz', glyph: '◇', color: '#2A1F1F', tint: '#A89968' },
];

function CrystalsBlock({ crystals, onToggleCrystal }) {
  const [open, setOpen] = useState(false);
  const carried = CRYSTAL_OPTIONS.filter(c => crystals.includes(c.id));

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="p-3 border border-[#2A2A2A] hover:border-[#A89968]/40 bg-[#0F0F0F] text-left transition-colors">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] mb-1" style={F.ui}>· crystals carried ·</div>
        {carried.length === 0 ? (
          <div className="text-[#6B6B6B] text-sm italic" style={F.serif}>none yet</div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {carried.map(c => (
              <span key={c.id} className="text-base" style={{ color: c.tint }} title={c.name}>{c.glyph}</span>
            ))}
          </div>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in" onClick={() => setOpen(false)}>
          <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· choose up to 6 ·</span>
                <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>STONES CARRIED</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {CRYSTAL_OPTIONS.map(c => {
                const has = crystals.includes(c.id);
                return (
                  <button key={c.id} onClick={() => onToggleCrystal(c.id)}
                    className={`flex items-center gap-2 p-2 border transition-colors ${has ? 'border-[#C9A961] bg-[#C9A961]/10' : 'border-[#2A2A2A] hover:border-[#3F3F3F]'}`}>
                    <span className="text-2xl" style={{ color: c.tint }}>{c.glyph}</span>
                    <span className="text-[#F5F1E8] text-sm" style={F.serif}>{c.name}</span>
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
