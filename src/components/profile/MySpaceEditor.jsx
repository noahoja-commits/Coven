import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Button } from '../shared/Button';

// Edit your old-web ("MySpace") profile: About-me + Who-I'd-like-to-meet blurbs and a curated
// Top-Friends list (up to 8), picked from the people you follow. Saves the blob to profile_state
// via onSave; other users see it (sanitized) through the public_shrine rpc (migration 0069).
export function MySpaceEditor({ initial = {}, following = [], onSave, onClose }) {
  const [about, setAbout] = useState(initial.about || '');
  const [want, setWant] = useState(initial.want || '');
  // top is stored as handle strings; tolerate the resolved {handle,...} object shape too so a
  // value coming from public_shrine can never crash the editor.
  const [top, setTop] = useState(() => (Array.isArray(initial.top)
    ? initial.top.map(t => (typeof t === 'string' ? t : t?.handle)).filter(Boolean).slice(0, 8)
    : []));
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');

  const toggleFriend = (handle) => {
    setTop((cur) => cur.includes(handle) ? cur.filter(h => h !== handle) : (cur.length >= 8 ? cur : [...cur, handle]));
  };

  const q = query.trim().toLowerCase();
  const shown = following.filter(p => !q || (p.handle || '').toLowerCase().includes(q));

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave({ about: about.trim().slice(0, 1500), want: want.trim().slice(0, 1500), top });
      onClose();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[92vh] flex flex-col animate-slide-up safe-pb">
        <div className="px-4 h-[60px] flex items-center justify-between border-b border-[#1A1A1A] shrink-0">
          <div className="text-[#F5F1E8] text-base tracking-[0.22em]" style={F.display}>YOUR OLD-WEB PROFILE</div>
          <button onClick={onClose} className="tap p-2 -mr-1 text-[#A8A29E] hover:text-[#C9A961]"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block" style={F.scriptureSC}>· about me ·</label>
            <textarea value={about} onChange={e => setAbout(e.target.value.slice(0, 1500))} rows={4}
              placeholder="the long version. what you're about, what you're into…" className="field w-full resize-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block" style={F.scriptureSC}>· who i'd like to meet ·</label>
            <textarea value={want} onChange={e => setWant(e.target.value.slice(0, 1500))} rows={3}
              placeholder="the souls you're hoping the dark sends your way…" className="field w-full resize-none" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 flex items-center justify-between" style={F.scriptureSC}>
              <span>· top of the coven ·</span>
              <span className="text-[#6B6B6B]" style={F.mono}>{top.length}/8</span>
            </label>
            {top.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {top.map(h => (
                  <button key={h} onClick={() => toggleFriend(h)}
                    className="tap flex items-center gap-1 px-2 py-1 border border-[#C9A961]/50 text-[#C9A961] text-[10px]" style={F.ui}>
                    {h} <X size={10} />
                  </button>
                ))}
              </div>
            )}
            {following.length === 0 ? (
              <p className="text-[11px] text-[#6B6B6B] italic" style={F.serif}>follow some souls first — they'll appear here to pin.</p>
            ) : (
              <>
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="search who you follow…"
                  className="field w-full mb-2 text-[12px]" />
                <div className="max-h-44 overflow-y-auto border border-[#1A1A1A] divide-y divide-[#141414]">
                  {shown.map(p => {
                    const on = top.includes(p.handle);
                    return (
                      <button key={p.handle} onClick={() => toggleFriend(p.handle)}
                        className={`tap w-full flex items-center gap-2 px-2 py-1.5 text-left ${on ? 'bg-[#5B0F1A]/15' : 'hover:bg-[#0F0F0F]'}`}>
                        <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : (p.avatar || '✦')}
                        </div>
                        <span className="flex-1 text-[12px] text-[#F5F1E8] truncate" style={F.ui}>{p.handle}</span>
                        {on && <Check size={13} className="text-[#C9A961] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#1A1A1A] flex items-center justify-end gap-2 shrink-0">
          <Button variant="ghost" onClick={onClose}>cancel</Button>
          <Button variant="primary" onClick={submit} disabled={saving}>
            {saving ? <><Loader2 size={13} className="animate-spin" /> saving</> : 'save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
