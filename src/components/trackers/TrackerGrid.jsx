import { useState } from 'react';
import { Plus, Eye, EyeOff, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TRACKER_CATEGORIES } from '../../data/profile';
import { timeAgo, daysBetween } from '../../data/helpers';

export function TrackerGrid({ trackers, onUpdate }) {
  const [editing, setEditing] = useState(false);

  // Show only categories that have data, unless editing
  const visibleCats = editing
    ? TRACKER_CATEGORIES
    : TRACKER_CATEGORIES.filter(c => trackers[c.id]);

  return (
    <div className="border border-[#2A2A2A] bg-[#0F0F0F]">
      <div className="px-3 py-2 border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· the log ·</div>
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
                  className="px-2 py-1 text-[9px] uppercase tracking-wider border border-[#2A2A2A] text-[#A89968] hover:border-[#5B0F1A] hover:text-[#5B0F1A]"
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
    </div>
  );
}
