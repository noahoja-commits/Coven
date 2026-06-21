import { Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { moonPhase, dailyPrompt } from '../../data/helpers';
import { CRYSTAL_OPTIONS } from '../../data/crystals';
import { TRACKER_CATEGORIES } from '../../data/profile';

// The daily altar — a single personal-practice anchor at the top of home: the moon,
// today's rite (ritual streak), your crystal focus, a reflection prompt, and a quick-log
// row for your trackers. Pulls together pieces that were scattered across the profile.
export function DailyAltar({
  ritual = { streak: 0 }, ritualDoneToday, onPerformRitual,
  crystals = [], trackers = {}, onUpdateTracker, onOpenReflections, onOpenEphemeris,
}) {
  const moon = moonPhase();
  const focus = CRYSTAL_OPTIONS.find(c => crystals.includes(c.id)); // first carried = focus
  const prompt = dailyPrompt();
  const streak = ritual?.streak || 0;

  // Active trackers → resolve their glyph/label (preset or custom) for the quick-log row.
  const activeTrackers = Object.keys(trackers || {}).map(id => {
    const t = trackers[id];
    const preset = TRACKER_CATEGORIES.find(c => c.id === id);
    const def = preset || (t?.custom ? t : null);
    if (!def) return null;
    return { id, glyph: def.glyph || '✦', label: def.label || id };
  }).filter(Boolean).slice(0, 6);

  return (
    <div className="border-b border-[#1A1A1A] bg-gradient-to-b from-[#0E0608]/60 to-transparent">
      {/* Moon + rite */}
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-3">
        <button onClick={onOpenEphemeris} className="flex items-center gap-2 group" title="the heavens">
          <span className="text-[#C9A961] text-2xl leading-none group-hover:text-[#F5F1E8] transition-colors">{moon.glyph}</span>
          <span className="text-left">
            <span className="block text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>{moon.name}</span>
            <span className="block text-[10px] text-[#6B6B6B]" style={F.mono}>{Math.round(moon.illum * 100)}% lit</span>
          </span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>
            {streak > 0 ? `${streak}d rite` : 'no streak'}
          </span>
          <button onClick={() => !ritualDoneToday && onPerformRitual && onPerformRitual()}
            disabled={ritualDoneToday}
            className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border transition-colors ${ritualDoneToday
              ? 'border-[#C9A961]/40 text-[#C9A961]/80 cursor-default'
              : 'border-[#5B0F1A] text-[#F5F1E8] bg-[#8B0000]/15 hover:bg-[#8B0000]/30'}`}
            style={F.ui}>
            {ritualDoneToday ? '☩ kept' : '☩ mark the rite'}
          </button>
        </div>
      </div>

      {/* Focus + reflection prompt */}
      <div className="px-4 pb-3 space-y-2">
        {focus && (
          <div className="flex items-center gap-2 text-[11px]" style={F.serif}>
            <span style={{ color: focus.tint }} className="text-sm">{focus.glyph}</span>
            <span className="text-[#A89968] uppercase tracking-wider text-[10px]" style={F.ui}>focus</span>
            <span className="text-[#A8A29E]">{focus.intention} — <span className="italic text-[#6B6B6B]">{focus.meaning}</span></span>
          </div>
        )}
        <button onClick={onOpenReflections}
          className="w-full text-left flex items-start gap-2 p-2.5 border border-[#2A2A2A] hover:border-[#A89968]/40 bg-[#0A0204]/40 transition-colors group">
          <span className="text-[#A89968] text-sm mt-0.5">✎</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[9px] uppercase tracking-[0.3em] text-[#A89968]/70 mb-0.5" style={F.scriptureSC}>· reflect ·</span>
            <span className="block text-[#F5F1E8] text-sm italic leading-snug" style={F.scripture}>{prompt}</span>
          </span>
          <span className="text-[9px] uppercase tracking-wider text-[#6B6B6B] group-hover:text-[#C9A961] self-center" style={F.ui}>write</span>
        </button>
      </div>

      {/* Tracker quick-log */}
      {activeTrackers.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[9px] uppercase tracking-[0.25em] text-[#6B6B6B] shrink-0 mr-1" style={F.ui}>log</span>
          {activeTrackers.map(t => (
            <button key={t.id} onClick={() => onUpdateTracker && onUpdateTracker(t.id, 'log')}
              className="shrink-0 flex items-center gap-1 px-2 py-1 border border-[#2A2A2A] text-[#A8A29E] hover:text-[#F5F1E8] hover:border-[#5B0F1A] transition-colors"
              title={`log ${t.label}`} style={F.ui}>
              <span>{t.glyph}</span>
              <span className="text-[10px] lowercase">{t.label}</span>
              <Plus size={9} className="text-[#6B6B6B]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
