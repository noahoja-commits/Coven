import { useState, useEffect } from 'react';
import { F } from '../../styles/fonts';
import { TRACKER_CATEGORIES } from '../../data/profile';
import { fetchPublicShrine, fetchMyTributes, setGraveTribute } from '../../lib/db/profileState';

// Another soul's PUBLIC shrine (migration 0061): their public memorials (with cross-user
// candles + flowers), public trackers, visible anniversaries, now-playing, kept stories.
// Renders nothing at all pre-migration or when the user has nothing public — zero clutter.

const HIGHLIGHT_BG = {
  red: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)',
  violet: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)',
  gold: 'linear-gradient(135deg, #3B2F0A 0%, #1A1408 70%, #0A0804 100%)',
  silver: 'linear-gradient(135deg, #2A2A30 0%, #14141A 70%, #0A0A10 100%)',
  black: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)',
};

// trackers store ms timestamps — a compact "3h ago" / "47 days"
function ago(ms) {
  const d = Date.now() - ms;
  if (d < 60_000) return 'just now';
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}
function streakDays(startMs) { return Math.max(0, Math.floor((Date.now() - startMs) / 86_400_000)); }

function Label({ children }) {
  return <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-2" style={F.display}>{children}</div>;
}

export function PublicShrine({ ownerId, meId, onToast }) {
  const [shrine, setShrine] = useState(null);
  const [mine, setMine] = useState({}); // graveId -> { candle, flower }

  useEffect(() => {
    if (!ownerId) return undefined;
    let on = true;
    fetchPublicShrine(ownerId).then(s => { if (on) setShrine(s); });
    if (meId && meId !== ownerId) fetchMyTributes(meId, ownerId).then(t => { if (on) setMine(t); });
    return () => { on = false; };
  }, [ownerId, meId]);

  if (!shrine) return null;

  const graves = Array.isArray(shrine.graves) ? shrine.graves : [];
  const trackerEntries = Object.entries(shrine.trackers || {})
    .map(([id, t]) => {
      const cat = TRACKER_CATEGORIES.find(c => c.id === id);
      const label = t.custom ? (t.label || 'ritual') : (cat?.label || id);
      const glyph = t.custom ? (t.glyph || '✦') : (cat?.glyph || '✦');
      const mode = t.custom ? (t.mode || 'last') : (cat?.mode || 'last');
      return { id, label, glyph, mode, lastAt: t.lastAt, streakStart: t.streakStart };
    })
    .filter(t => (t.mode === 'streak' ? t.streakStart : t.lastAt));
  const anniversaries = Array.isArray(shrine.anniversaries) ? shrine.anniversaries : [];
  const highlights = Array.isArray(shrine.highlights) ? shrine.highlights : [];
  const np = shrine.nowPlaying;

  const empty = !graves.length && !trackerEntries.length && !anniversaries.length && !highlights.length && !(np && np.title);
  if (empty) return null;

  const tribute = (graveId, kind, wasOn) => {
    if (!meId || meId === ownerId) return;
    setMine(prev => ({ ...prev, [graveId]: { ...(prev[graveId] || {}), [kind]: !wasOn } }));
    setShrine(prev => ({
      ...prev,
      graves: prev.graves.map(g => (g.id === graveId
        ? { ...g, [kind === 'candle' ? 'candles' : 'tributeFlowers']: Math.max(0, (g[kind === 'candle' ? 'candles' : 'tributeFlowers'] || 0) + (wasOn ? -1 : 1)) }
        : g)),
    }));
    setGraveTribute(meId, ownerId, graveId, kind, !wasOn).catch(() => {
      // roll back so the chip matches the server
      setMine(prev => ({ ...prev, [graveId]: { ...(prev[graveId] || {}), [kind]: wasOn } }));
      setShrine(prev => ({
        ...prev,
        graves: prev.graves.map(g => (g.id === graveId
          ? { ...g, [kind === 'candle' ? 'candles' : 'tributeFlowers']: Math.max(0, (g[kind === 'candle' ? 'candles' : 'tributeFlowers'] || 0) + (wasOn ? 1 : -1)) }
          : g)),
      }));
      onToast && onToast("couldn't leave your tribute — try again.", 'error');
    });
  };

  return (
    <div className="border-b border-[#1A1A1A]">
      {/* now playing */}
      {np && np.title && (
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'repeating-radial-gradient(circle, #0A0A0A 0 1px, #1F1F1F 1px 2px)', border: '1px solid #3F3F3F' }} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B]" style={F.ui}>now playing</div>
            <div className="text-[#F5F1E8] text-sm truncate" style={F.serif}>{np.title}{np.artist ? ` — ${np.artist}` : ''}</div>
          </div>
        </div>
      )}

      {/* kept stories */}
      {highlights.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <Label>kept stories</Label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {highlights.map(h => (
              <div key={h.id} className="w-16 h-20 shrink-0 border border-[#C9A961]/40 flex flex-col items-center justify-center p-1"
                style={{ background: HIGHLIGHT_BG[h.bg] || HIGHLIGHT_BG.black }}>
                <span className="text-2xl mb-1">{h.glyph}</span>
                <span className="text-[8px] text-white/70 text-center line-clamp-2" style={F.scripture}>{h.caption}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* the log — public trackers */}
      {trackerEntries.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <Label>the log</Label>
          <div className="flex flex-wrap gap-2">
            {trackerEntries.map(t => (
              <span key={t.id} className="inline-flex items-center gap-1.5 px-2 py-1 border border-[#2A2A2A] text-[11px] text-[#A8A29E]" style={F.ui}>
                <span className="text-[#9E2A33]">{t.glyph}</span>
                {t.label} · {t.mode === 'streak' ? `${streakDays(t.streakStart)} days` : ago(t.lastAt)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* in memoriam — light a candle / leave a flower */}
      {graves.length > 0 && (
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <Label>in memoriam</Label>
          <div className="divide-y divide-[#1C1A1A]">
            {graves.map(g => {
              const my = mine[g.id] || {};
              return (
                <div key={g.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <span className="text-[#5B0F1A] text-2xl shrink-0">⚱</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <h4 className="text-[#F5F1E8] text-base leading-tight" style={F.display}>{g.name}</h4>
                      {g.kind && <span className="text-[10px] text-[#9E2A33] uppercase tracking-wider shrink-0" style={F.ui}>{g.kind}</span>}
                    </div>
                    {g.dates && <div className="text-[10px] text-[#6B6B6B]" style={F.mono}>{g.dates}</div>}
                    {g.epitaph && <p className="text-[#A8A29E] text-sm mt-1 italic leading-snug" style={F.serif}>"{g.epitaph}"</p>}
                    {meId && meId !== ownerId ? (
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => tribute(g.id, 'candle', !!my.candle)}
                          className={`tap text-[10px] uppercase tracking-wider px-2 py-0.5 border ${my.candle ? 'border-[#C9A961]/60 text-[#C9A961]' : 'border-[#1C1A1A] text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961]'}`}
                          style={F.ui}>
                          🕯 {g.candles || 0}
                        </button>
                        <button onClick={() => tribute(g.id, 'flower', !!my.flower)}
                          className={`tap text-[10px] uppercase tracking-wider px-2 py-0.5 border ${my.flower ? 'border-[#C9A961]/60 text-[#C9A961]' : 'border-[#1C1A1A] text-[#9E2A33] hover:border-[#C9A961] hover:text-[#C9A961]'}`}
                          style={F.ui}>
                          ❀ {(g.tributeFlowers || 0) + (g.flowers || 0)}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#A8A29E]" style={F.ui}>
                        <span>🕯 {g.candles || 0}</span>
                        <span>❀ {(g.tributeFlowers || 0) + (g.flowers || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* anniversaries */}
      {anniversaries.length > 0 && (
        <div className="px-4 py-3">
          <Label>anniversaries</Label>
          <div className="space-y-1.5">
            {anniversaries.map(a => (
              <div key={a.id} className="flex items-baseline gap-2 text-sm">
                <span className="text-[10px] text-[#6B6B6B] shrink-0" style={F.mono}>{a.date}</span>
                <span className="text-[#F5F1E8]" style={F.serif}>{a.label}</span>
                {a.description && <span className="text-[#6B6B6B] text-xs truncate" style={F.serif}>· {a.description}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
