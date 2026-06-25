import { useState } from 'react';
import { Plus, Eye, EyeOff, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TRACKER_CATEGORIES } from '../../data/profile';
import { timeAgo, daysBetween } from '../../data/helpers';

export function TrackerGrid({ trackers, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customGlyph, setCustomGlyph] = useState('✦');

  // Custom trackers carry their own def inline in the trackers state.
  const customCats = Object.entries(trackers)
    .filter(([, v]) => v && v.custom)
    .map(([id, v]) => ({ id, label: v.label, glyph: v.glyph || '✦', mode: v.mode || 'last' }));
  const allCats = [...TRACKER_CATEGORIES, ...customCats];

  // Show only categories that have data, unless editing
  const visibleCats = editing ? allCats : allCats.filter(c => trackers[c.id]);

  const addCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    onUpdate(null, 'addCustom', { label, glyph: customGlyph.trim().slice(0, 2) || '✦' });
    setCustomLabel(''); setCustomGlyph('✦'); setAdding(false);
  };

  return (
    <div className="border border-[#2A2A2A] bg-[#0F0F0F]">
      <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33]" style={F.scriptureSC}>· the log ·</div>
        <button onClick={() => setEditing(!editing)} className="text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#A8A29E]" style={F.ui}>
          {editing ? 'done' : 'edit'}
        </button>
      </div>
      <div className="grid grid-cols-2 divide-x divide-y divide-[#1A1A1A]">
        {visibleCats.map(cat => {
          const data = trackers[cat.id];
          let display = '—';
          if (data) {
            if (cat.mode === 'streak' && data.streakStart) {
              display = `${daysBetween(new Date(data.streakStart))}d`;
            } else if (data.lastAt) {
              display = timeAgo(data.lastAt);
            }
          }
          return (
            <div key={cat.id} className="px-3 py-2.5 flex items-center gap-2">
              <span className="text-[#5B0F1A] text-base" style={F.display}>{cat.glyph}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[#A8A29E] text-[10px] uppercase tracking-wider truncate" style={F.ui}>{cat.label}</div>
                <div className="text-[#F5F1E8] text-sm" style={F.mono}>{display}</div>
              </div>
              {editing ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => onUpdate(cat.id, 'togglePublic')}
                    className="p-1 text-[#6B6B6B] hover:text-[#A8A29E]"
                    title={data?.public ? 'public' : 'private'}>
                    {data?.public ? <Eye size={11} /> : <EyeOff size={11} />}
                  </button>
                  <button onClick={() => onUpdate(cat.id, data ? 'log' : 'add')}
                    className="p-1 text-[#5B0F1A] hover:text-[#8B0000]" title="log now">
                    {data ? <Plus size={11} /> : <Plus size={11} />}
                  </button>
                  {data && (
                    <button onClick={() => onUpdate(cat.id, 'remove')}
                      className="p-1 text-[#6B6B6B] hover:text-[#5B0F1A]" title="remove">
                      <X size={11} />
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={() => onUpdate(cat.id, 'log')}
                  className="px-2 py-1 text-[9px] uppercase tracking-wider border border-[#2A2A2A] text-[#9E2A33] hover:border-[#5B0F1A] hover:text-[#5B0F1A]"
                  style={F.ui}>now</button>
              )}
            </div>
          );
        })}
        {!editing && visibleCats.length === 0 && (
          <div className="col-span-2 px-3 py-6 text-center text-[#6B6B6B] text-xs" style={F.serif}>
            tap edit to start logging
          </div>
        )}
      </div>
      {editing && (
        <div className="px-3 py-2.5 border-t border-[#1A1A1A]">
          {adding ? (
            <div className="flex items-center gap-2">
              <input value={customGlyph} onChange={e => setCustomGlyph(e.target.value)} maxLength={2}
                className="w-9 text-center bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none py-1.5 text-[#F5F1E8]" />
              <input value={customLabel} onChange={e => setCustomLabel(e.target.value.slice(0, 24))} autoFocus
                placeholder="what do you want to log?"
                onKeyDown={e => { if (e.key === 'Enter') addCustom(); }}
                className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none px-2.5 py-1.5 text-[#F5F1E8] text-sm" style={F.serif} />
              <button onClick={addCustom} disabled={!customLabel.trim()}
                className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40" style={F.ui}>add</button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-[#9E2A33] hover:text-[#C9A961] border border-dashed border-[#3F3F3F] hover:border-[#5B0F1A]" style={F.ui}>
              <Plus size={11} /> custom tracker
            </button>
          )}
        </div>
      )}
    </div>
  );
}
