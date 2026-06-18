import { useState } from 'react';
import { X, Send, Lock, Trash2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { timeAgo } from '../../data/helpers';

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
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] flex items-center gap-1" style={F.scriptureSC}>
              <Lock size={11} /> · only you ·
            </span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>REFLECTIONS</h3>
          </div>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#A8A29E]"><X size={18} /></button>
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider ${draft.trim() ? 'bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              <Send size={11} /> inscribe
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {reflections.length === 0 ? (
            <div className="text-center py-12 text-[#6B6B6B] text-sm italic" style={F.serif}>
              · the journal is empty · write your first thought ·
            </div>
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {reflections.map(r => (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· {timeAgo(r.at)} ago ·</span>
                    <button onClick={() => onRemove && onRemove(r.id)} className="text-[#6B6B6B] hover:text-[#8B0000]"><Trash2 size={11} /></button>
                  </div>
                  <p className="text-[#F5F1E8] text-sm italic leading-relaxed whitespace-pre-wrap" style={F.scripture}>{r.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
