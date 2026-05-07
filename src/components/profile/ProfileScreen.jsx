import { useState } from 'react';
import { Settings, Pencil, Plus, Heart, MoreHorizontal, ChevronRight } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TrackerGrid } from '../trackers/TrackerGrid';
import { timeAgo, daysBetween, sunSign } from '../../data/helpers';

export function ProfileScreen({ profile, graves, anniversaries, trackers, onUpdateTracker, onOpenTonightStatus, onOpenSettings, mementoMoriOn, settings }) {
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
        <div className="absolute inset-0 opacity-15" style={{
          background: 'radial-gradient(ellipse at 50% 0%, #5B0F1A 0%, transparent 60%)'
        }} />

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
            <button onClick={onOpenSettings} className="text-[#6B6B6B] hover:text-[#A8A29E]"><Settings size={16} /></button>
          </div>
        </div>

        <div className="relative flex items-start gap-4">
          {/* Avatar with candle */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border ${settings?.ghostMode ? 'border-[#7B2CBF]' : 'border-[#3F3F3F]'} flex items-center justify-center text-3xl ${settings?.ghostMode ? '' : ''}`}
              style={settings?.ghostMode ? { boxShadow: '0 0 20px rgba(123, 44, 191, 0.5)' } : {}}>🦇</div>
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
            <button className="text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>+ add</button>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {graves.map(g => (
              <div key={g.id} className="px-3 py-3 flex items-start gap-3">
                <span className="text-[#5B0F1A] text-2xl shrink-0">⚱</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <h4 className="text-[#F5F1E8] text-base leading-tight" style={F.display}>{g.name}</h4>
                    <span className="text-[10px] text-[#A89968] uppercase tracking-wider shrink-0" style={F.ui}>{g.kind}</span>
                  </div>
                  <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{g.dates}</div>
                  <p className="text-[#A8A29E] text-sm mt-1 italic leading-snug" style={F.serif}>"{g.epitaph}"</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[#5B0F1A] text-xs">❀</span>
                    <span className="text-[10px] text-[#A8A29E]" style={F.ui}>{g.flowers} flowers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anniversaries */}
      {anniversaries.length > 0 && (
        <div className="mx-4 mb-4 border border-[#2A2A2A] bg-[#0F0F0F]">
          <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· anniversaries ·</span>
            <button onClick={() => setShowAllAnniv(!showAllAnniv)} className="text-[10px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>
              {showAllAnniv ? 'less' : 'all'}
            </button>
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
      )}

      {/* Tabs */}
      <div className="border-y border-[#1A1A1A] flex">
        {['grid', 'rsvp\u2019d', 'wares'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] ${tab === t ? 'text-[#F5F1E8] border-b border-[#8B0000]' : 'text-[#6B6B6B]'}`}
            style={F.ui}>{t}</button>
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
      {tab !== 'grid' && (
        <div className="px-4 py-12 text-center text-[#6B6B6B] text-sm" style={F.serif}>
          {tab === 'rsvp\u2019d' ? 'no rites lined up.' : 'no wares listed yet.'}
        </div>
      )}
    </div>
  );
}
