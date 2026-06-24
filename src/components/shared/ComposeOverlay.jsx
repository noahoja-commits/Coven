import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Hash, EyeOff, Eye, BarChart2, Plus, Minus, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { COMMUNITIES } from '../../data/communities';
import { uploadImage, uploadVideo } from '../../lib/db/storage';
import { searchProfiles } from '../../lib/db/profiles';
import { saveDraft, loadDraft, clearDraft } from '../../lib/drafts';

export function ComposeOverlay({ meId, onClose, onPost, initialCommunity }) {
  const [text, setText] = useState('');
  const [community, setCommunity] = useState(initialCommunity || 'general');
  const [anonymous, setAnonymous] = useState(false);
  const [coauthor, setCoauthor] = useState(null); // { id, handle } — co-signed post
  const [coOpen, setCoOpen] = useState(false);
  const [coSearch, setCoSearch] = useState('');
  const [coResults, setCoResults] = useState([]);
  const [poll, setPoll] = useState(null); // null or {options: ['', '']}
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaKind, setMediaKind] = useState(null); // 'image' | 'video'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const taRef = useRef(null);

  // @-autocomplete (self-contained — no App.jsx state).
  const [mentionQuery, setMentionQuery] = useState(null); // the @frag after the caret, or null
  const [mentionResults, setMentionResults] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);

  // Unsent-draft save/restore (captured once on mount so the auto-save below can't wipe it).
  const [pendingDraft, setPendingDraft] = useState(() => loadDraft());
  useEffect(() => {
    // Don't let the empty-on-mount state's auto-save wipe a restorable draft from
    // localStorage before the user has decided to restore or discard it.
    if (pendingDraft && !text.trim() && !poll) return;
    const t = setTimeout(() => saveDraft({ text, community, anonymous, poll }), 600);
    return () => clearTimeout(t);
  }, [text, community, anonymous, poll, pendingDraft]);
  const restoreDraft = () => {
    if (!pendingDraft) return;
    setText(pendingDraft.text || '');
    if (pendingDraft.community) setCommunity(pendingDraft.community);
    setAnonymous(!!pendingDraft.anonymous);
    setPoll(pendingDraft.poll || null);
    setPendingDraft(null);
  };
  const discardDraft = () => { clearDraft(); setPendingDraft(null); };

  const syncMention = () => {
    const ta = taRef.current; if (!ta) return;
    const before = ta.value.slice(0, ta.selectionStart);
    const m = before.match(/@([a-zA-Z0-9_.]*)$/);
    setMentionQuery(m ? m[1] : null);
  };

  useEffect(() => {
    if (mentionQuery == null || mentionQuery.length < 1) { setMentionResults([]); return; }
    let on = true;
    const t = setTimeout(() => {
      searchProfiles(mentionQuery, { limit: 6 })
        .then(rows => { if (on) { setMentionResults(rows || []); setMentionIndex(0); } })
        .catch(() => { if (on) setMentionResults([]); });
    }, 180);
    return () => { on = false; clearTimeout(t); };
  }, [mentionQuery]);

  const insertMention = (handle) => {
    const ta = taRef.current;
    const caret = ta ? ta.selectionStart : text.length;
    const before = text.slice(0, caret).replace(/@([a-zA-Z0-9_.]*)$/, `@${handle} `);
    const next = (before + text.slice(caret)).slice(0, 2000);
    setText(next);
    setMentionQuery(null); setMentionResults([]);
    requestAnimationFrame(() => { if (ta) { ta.focus(); ta.setSelectionRange(before.length, before.length); } });
  };

  const onTextKeyDown = (e) => {
    if (!mentionResults.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => (i + 1) % mentionResults.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => (i - 1 + mentionResults.length) % mentionResults.length); }
    else if (e.key === 'Enter') { e.preventDefault(); insertMention(mentionResults[mentionIndex].handle); }
    else if (e.key === 'Escape') { setMentionQuery(null); setMentionResults([]); }
  };

  const pollOk = !poll || poll.options.filter(o => o.trim()).length >= 2;
  const canPost = (text.trim().length > 0 || mediaFile) && pollOk && !busy;

  const onPickMedia = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const isVideo = file.type?.startsWith('video/');
    const isImage = file.type?.startsWith('image/');
    if (!isVideo && !isImage) { setError('please choose a photo or video'); return; }
    if (isVideo && file.size > 30 * 1024 * 1024) { setError('video is too large (max 30MB) — trim it or lower the quality'); return; }
    setError('');
    setMediaFile(file);
    setMediaKind(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };
  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null); setMediaPreview(null); setMediaKind(null);
  };

  // Co-author search.
  useEffect(() => {
    const q = coSearch.trim();
    if (!q) { setCoResults([]); return undefined; }
    let on = true;
    const t = setTimeout(() => {
      searchProfiles(q, { limit: 6 }).then(r => { if (on) setCoResults((r || []).filter(u => u.id !== meId)); }).catch(() => {});
    }, 250);
    return () => { on = false; clearTimeout(t); };
  }, [coSearch, meId]);

  const submit = async () => {
    if (!canPost) return;
    setBusy(true); setError('');
    try {
      const payload = { body: text.trim(), community, anonymous };
      if (coauthor && !anonymous) { payload.coauthorId = coauthor.id; payload.coauthorHandle = coauthor.handle; }
      if (poll) {
        const opts = poll.options.map(o => o.trim()).filter(Boolean);
        if (opts.length >= 2) payload.poll = opts;
      }
      if (mediaFile) {
        if (mediaKind === 'video') {
          payload.img = await uploadVideo('post-images', meId, mediaFile);
          payload.kind = 'video';
        } else {
          payload.img = await uploadImage('post-images', meId, mediaFile);
          payload.kind = 'photo';
        }
      }
      onPost && onPost(payload);
      setText(''); clearMedia(); clearDraft(); setPendingDraft(null); setCoauthor(null);
    } catch (err) {
      setError(err?.message || 'could not post — try again');
      setBusy(false);
    }
  };

  const togglePoll = () => setPoll(p => p ? null : { options: ['', ''] });
  const updateOption = (i, v) => setPoll(p => ({ ...p, options: p.options.map((o, j) => j === i ? v : o) }));
  const addOption = () => setPoll(p => p.options.length < 4 ? { ...p, options: [...p.options, ''] } : p);
  const removeOption = (i) => setPoll(p => p.options.length > 2 ? { ...p, options: p.options.filter((_, j) => j !== i) } : p);

  return (
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] flex flex-col animate-fade-in safe-pb">
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>NEW POST</div>
          <button onClick={submit} disabled={!canPost} className="btn btn-primary">{busy ? <><Loader2 size={12} className="animate-spin" /> posting</> : 'post'}</button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center gap-2">
          <Hash size={14} className="text-[#6B6B6B]" />
          <select value={community} onChange={e => setCommunity(e.target.value)}
            className="bg-transparent text-[#F5F1E8] text-sm outline-none" style={F.ui}>
            {COMMUNITIES.map(c => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.name}</option>)}
          </select>
        </div>
        {pendingDraft && !text && (
          <div className="px-4 py-2 bg-[#5B0F1A]/15 border-b border-[#5B0F1A]/30 flex items-center gap-3 text-[11px]" style={F.ui}>
            <span className="flex-1 text-[#C8102E]">you have an unsent draft.</span>
            <button onClick={restoreDraft} className="btn btn-quiet text-[#C9A961] hover:text-[#F5F1E8]">restore</button>
            <button onClick={discardDraft} className="btn btn-quiet">discard</button>
          </div>
        )}
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <textarea ref={taRef} value={text}
            onChange={e => { setText(e.target.value.slice(0, 2000)); syncMention(); }}
            onKeyUp={syncMention} onClick={syncMention} onKeyDown={onTextKeyDown}
            maxLength={2000}
            placeholder="speak..."
            className="w-full bg-transparent text-[#F5F1E8] text-base outline-none resize-none placeholder:text-[#3F3F3F]"
            style={{ ...F.serif, minHeight: poll ? '120px' : (mediaPreview ? '120px' : '60vh') }}
            autoFocus />
          {mediaPreview && (
            <div className="mt-3 relative inline-block">
              {mediaKind === 'video' ? (
                <video src={mediaPreview} controls playsInline className="max-h-72 w-auto border border-[#2A2A2A]" />
              ) : (
                <img src={mediaPreview} alt="" className="max-h-72 w-auto border border-[#2A2A2A]" />
              )}
              <button onClick={clearMedia} className="tap absolute top-1 right-1 w-7 h-7 bg-black/80 border border-[#3F3F3F] text-[#F5F1E8] hover:text-[#C9A961] flex items-center justify-center" title="remove"><X size={14} /></button>
            </div>
          )}
          {mediaKind === 'video' && (
            <p className="mt-1.5 text-[10px] text-[#C8102E]/70 italic" style={F.serif}>
              heads up — camera videos can carry your location; Coven can't strip that from video yet.
            </p>
          )}
          {poll && (
            <div className="mt-4 border border-[#7B2CBF]/30 bg-[#7B2CBF]/5 p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#7B2CBF] mb-1" style={F.scriptureSC}>· poll ·</div>
              {poll.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={opt} onChange={e => updateOption(i, e.target.value.slice(0, 48))}
                    placeholder={`option ${i + 1}`}
                    className="field flex-1 focus:border-[#7B2CBF] text-sm" />
                  {poll.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="tap text-[#6B6B6B] hover:text-[#C9A961]"><Minus size={14} /></button>
                  )}
                </div>
              ))}
              {poll.options.length < 4 && (
                <button onClick={addOption} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#C8102E] hover:text-[#C9A961]" style={F.ui}>
                  <Plus size={11} /> add option
                </button>
              )}
            </div>
          )}
        </div>
        {mentionResults.length > 0 && (
          <div className="border-t border-[#2A2A2A] bg-[#141414] max-h-44 overflow-y-auto">
            {mentionResults.map((u, i) => (
              <button key={u.id} onMouseDown={(e) => { e.preventDefault(); insertMention(u.handle); }}
                className={`w-full px-4 py-2 flex items-center gap-2.5 text-left ${i === mentionIndex ? 'bg-[#5B0F1A]/20' : 'hover:bg-[#0F0F0F]'}`}>
                <span className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-sm overflow-hidden shrink-0">
                  {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : u.avatar}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[#F5F1E8] text-sm truncate" style={F.ui}>@{u.handle}</span>
                  {u.bio && <span className="block text-[10px] text-[#6B6B6B] truncate" style={F.serif}>{u.bio}</span>}
                </span>
              </button>
            ))}
          </div>
        )}
        {error && <div className="px-4 py-2 text-[11px] text-[#8B0000] text-center" style={F.ui}>{error}</div>}
        <div className="border-t border-[#1A1A1A] px-4 py-3 flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={onPickMedia} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={!!poll}
            className={`tap ${mediaPreview ? 'text-[#C9A961]' : 'text-[#A8A29E] hover:text-[#C9A961]'} disabled:opacity-30`} title="add a photo or video"><ImageIcon size={18} /></button>
          <button onClick={togglePoll} disabled={!!mediaFile} className={`tap ${poll ? 'text-[#7B2CBF]' : 'text-[#A8A29E] hover:text-[#C9A961]'} disabled:opacity-30`} title="poll"><BarChart2 size={18} /></button>
          <button onClick={() => setAnonymous(!anonymous)}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${anonymous ? 'text-[#7B2CBF]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
            style={F.ui} title="post as confession">
            {anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{anonymous ? 'confession' : 'identified'}</span>
          </button>
          {!anonymous && (
            <div className="relative">
              {coauthor ? (
                <button onClick={() => setCoauthor(null)} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#C9A961] hover:text-[#8B0000]" style={F.ui} title="remove co-author">
                  with @{coauthor.handle} ✕
                </button>
              ) : (
                <button onClick={() => setCoOpen(o => !o)} className="text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#A8A29E]" style={F.ui} title="co-sign with a soul">+ co-sign</button>
              )}
              {coOpen && !coauthor && (
                <div className="absolute bottom-full mb-2 left-0 w-52 bg-[#0F0F0F] border border-[#2A2A2A] z-20">
                  <input value={coSearch} onChange={e => setCoSearch(e.target.value)} placeholder="search a soul…" autoFocus
                    className="field text-xs" style={F.ui} />
                  {coResults.map(u => (
                    <button key={u.id} onClick={() => { setCoauthor({ id: u.id, handle: u.handle }); setCoOpen(false); setCoSearch(''); setCoResults([]); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-[#A8A29E] hover:bg-[#1A1A1A] flex items-center gap-2" style={F.ui}>
                      <span>{u.avatar}</span>@{u.handle}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="ml-auto text-[10px] text-[#6B6B6B]" style={F.mono}>{text.length}</span>
        </div>
        {anonymous && (
          <div className="px-4 py-2 bg-[#7B2CBF]/10 border-t border-[#7B2CBF]/30 text-[10px] text-[#C8102E] text-center" style={F.serif}>
            · posted as <span className="text-[#7B2CBF]">anonymous · the confessor</span> ·
          </div>
        )}
      </div>
    </div>
  );
}
