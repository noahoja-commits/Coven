import { useState } from 'react';
import { X, Send, Lock, Trash2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { EmptyState } from '../shared/EmptyState';

const journalDate = (ts) => {
  try { return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

export function ReflectionsModal({ reflections = [], onAdd, onRemove, onClose }) {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onAdd && onAdd(body);
    setDraft('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] flex flex-col animate-slide-up safe-pb">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] flex items-center gap-1" style={F.scriptureSC}>
              <Lock size={11} /> · only you ·
            </span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>REFLECTIONS</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-[#1A1A1A]">
          <textarea value={draft} onChange={e => setDraft(e.target.value.slice(0, 500))}
            placeholder="write to yourself..."
            rows={3}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#A89968] outline-none p-3 text-[#F5F1E8] text-sm italic resize-none"
            style={F.scripture} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{draft.length}/500</span>
            <button onClick={submit} disabled={!draft.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider ${draft.trim() ? 'bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              <Send size={11} /> inscribe
            </button>
          </div>
        </div>

        {/* the journal — aged-paper pages */}
        <div className="flex-1 overflow-y-auto bg-[#0A0808] p-3 space-y-3">
          {reflections.length === 0 ? (
            <EmptyState glyph="✎" text="· the journal is empty · write your first thought ·" />
          ) : (
            reflections.map(r => (
              <div key={r.id} className="relative p-4 shadow-md"
                style={{ background: 'linear-gradient(160deg, #ECE0C4 0%, #E2D2AC 100%)', color: '#2A1808', boxShadow: '0 2px 8px rgba(0,0,0,0.45)' }}>
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#8B6B4A]/30">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A5A35]" style={F.scriptureSC}>{journalDate(r.at)}</span>
                  <button onClick={() => onRemove && onRemove(r.id)} className="text-[#8B6B4A] hover:text-[#5B0F1A] p-1 transition-colors"><Trash2 size={11} /></button>
                </div>
                <p className="text-[15px] italic leading-relaxed whitespace-pre-wrap" style={{ ...F.scripture, color: '#2A1808' }}>{r.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
