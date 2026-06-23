import { useState } from 'react';
import { X, Moon, Lock, Trash2 } from 'lucide-react';
import { F } from '../../styles/fonts';

const journalDate = (ts) => {
  try { return new Date(ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); }
  catch { return ''; }
};

// A private dream log (own-only, stored in profile_state). Title + body per entry.
export function DreamJournalModal({ dreams = [], onAdd, onRemove, onClose }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    const b = body.trim();
    if (!b) return;
    onAdd && onAdd(title.trim(), b);
    setTitle(''); setBody('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] flex flex-col animate-slide-up safe-pb">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C8102E] flex items-center gap-1" style={F.scriptureSC}>
              <Lock size={11} /> · only you ·
            </span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1 flex items-center gap-2" style={F.display}><Moon size={15} className="text-[#C8102E]" /> DREAM JOURNAL</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 border-b border-[#1A1A1A]">
          <input value={title} onChange={e => setTitle(e.target.value.slice(0, 80))}
            placeholder="a title for the dream (optional)"
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#A89968] outline-none p-2.5 text-[#F5F1E8] text-sm mb-2"
            style={F.serif} />
          <textarea value={body} onChange={e => setBody(e.target.value.slice(0, 800))}
            placeholder="what did you see in the dark..."
            rows={3}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#A89968] outline-none p-3 text-[#F5F1E8] text-sm italic resize-none"
            style={F.scripture} />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[#6B6B6B]" style={F.mono}>{body.length}/800</span>
            <button onClick={submit} disabled={!body.trim()}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider ${body.trim() ? 'bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#6B6B6B]'}`}
              style={F.ui}>
              <Moon size={11} /> record
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#0A0808] p-3 space-y-3">
          {dreams.length === 0 ? (
            <div className="text-center py-12 text-[#6B6B6B] text-sm italic" style={F.serif}>
              · no dreams recorded · what woke you ·
            </div>
          ) : (
            dreams.map(d => (
              <div key={d.id} className="relative p-4 shadow-md"
                style={{ background: 'linear-gradient(160deg, #1A1430 0%, #100C20 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#5C5C8A]/30">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#A6A6D0]" style={F.scriptureSC}>{journalDate(d.at)}</span>
                  <button onClick={() => onRemove && onRemove(d.id)} className="text-[#8A8AB0] hover:text-[#8B0000] p-1 transition-colors"><Trash2 size={11} /></button>
                </div>
                {d.title && <div className="text-[#E8E0FF] text-sm mb-1" style={F.display}>{d.title}</div>}
                <p className="text-[14px] italic leading-relaxed whitespace-pre-wrap text-[#C8C0E8]" style={F.scripture}>{d.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
