import { useState, useRef } from 'react';
import { X, Loader2, Check, ImagePlus, Link2, Music, Plus } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Button } from '../shared/Button';
import { uploadImage, uploadVideo, uploadAudio } from '../../lib/db/storage';

const GALLERY_MAX = 12;

// Edit your old-web ("MySpace") profile: About-me + Who-I'd-like-to-meet blurbs, a curated
// Top-Friends list (up to 8), and a photo/video gallery. Saves the blob to profile_state via
// onSave; other users see it (sanitized) through the public_shrine rpc (migrations 0069/0072).
export function MySpaceEditor({ initial = {}, following = [], meId, onSave, onClose }) {
  const [about, setAbout] = useState(initial.about || '');
  const [want, setWant] = useState(initial.want || '');
  const [gallery, setGallery] = useState(() => (Array.isArray(initial.gallery)
    ? initial.gallery.filter(g => g && g.url).slice(0, GALLERY_MAX) : []));
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [galErr, setGalErr] = useState(null);
  const fileRef = useRef(null);

  const addUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || gallery.length >= GALLERY_MAX) return;
    setUploading(true); setGalErr(null);
    try {
      const isVideo = file.type?.startsWith('video/');
      const url = isVideo ? await uploadVideo('post-images', meId, file) : await uploadImage('post-images', meId, file);
      setGallery(g => [...g, { url, type: isVideo ? 'video' : 'image' }].slice(0, GALLERY_MAX));
    } catch (err) { setGalErr(err?.message || 'upload failed'); }
    finally { setUploading(false); }
  };
  const addLink = () => {
    const u = linkUrl.trim();
    if (!u || gallery.length >= GALLERY_MAX) return;
    if (!/^https:\/\/\S+/i.test(u)) { setGalErr('paste a full https:// image or video link'); return; }
    const type = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(u) ? 'video' : 'image';
    setGallery(g => [...g, { url: u, type }].slice(0, GALLERY_MAX));
    setLinkUrl(''); setGalErr(null);
  };
  const removeMedia = (i) => setGallery(g => g.filter((_, j) => j !== i));
  // top is stored as handle strings; tolerate the resolved {handle,...} object shape too so a
  // value coming from public_shrine can never crash the editor.
  const [top, setTop] = useState(() => (Array.isArray(initial.top)
    ? initial.top.map(t => (typeof t === 'string' ? t : t?.handle)).filter(Boolean).slice(0, 8)
    : []));
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  // Details / interests, blog, song, theme.
  const [details, setDetails] = useState(() => ({ ...(initial.details || {}) }));
  const [blog, setBlog] = useState(() => (Array.isArray(initial.blog) ? initial.blog.slice(0, 20) : []));
  const [song, setSong] = useState(() => (initial.song && initial.song.url ? { ...initial.song } : { url: '', artist: '', track: '' }));
  const [theme, setTheme] = useState(() => ({ accent: initial.theme?.accent || '', bg: initial.theme?.bg || '' }));
  const [songUploading, setSongUploading] = useState(false);
  const songRef = useRef(null);

  const setDetail = (k, v) => setDetails(d => ({ ...d, [k]: v.slice(0, 600) }));
  const addBlog = () => setBlog(b => b.length >= 20 ? b : [{ title: '', body: '', at: new Date().toISOString().slice(0, 10) }, ...b]);
  const setBlogField = (i, k, v) => setBlog(b => b.map((e, j) => j === i ? { ...e, [k]: v } : e));
  const removeBlog = (i) => setBlog(b => b.filter((_, j) => j !== i));
  const uploadSong = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setSongUploading(true);
    try {
      const url = await uploadAudio('voice', `song/${meId || 'anon'}`, file);
      setSong(s => ({ ...s, url }));
    } catch (err) { setSong(s => ({ ...s })); setGalErr(err?.message || 'song upload failed (max 5MB audio)'); }
    finally { setSongUploading(false); }
  };

  const toggleFriend = (handle) => {
    setTop((cur) => cur.includes(handle) ? cur.filter(h => h !== handle) : (cur.length >= 8 ? cur : [...cur, handle]));
  };

  const q = query.trim().toLowerCase();
  const shown = following.filter(p => !q || (p.handle || '').toLowerCase().includes(q));

  const submit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const cleanDetails = {};
      for (const k of ['music', 'movies', 'books', 'heroes', 'general']) if ((details[k] || '').trim()) cleanDetails[k] = details[k].trim().slice(0, 600);
      const cleanBlog = blog.map(b => ({ title: (b.title || '').slice(0, 120), body: (b.body || '').slice(0, 4000), at: b.at || '' })).filter(b => b.title || b.body).slice(0, 20);
      const hex = (v) => (/^#[0-9a-f]{6}$/i.test(v) ? v : '');
      await onSave({
        about: about.trim().slice(0, 1500), want: want.trim().slice(0, 1500), top, gallery,
        details: cleanDetails, blog: cleanBlog,
        song: song.url ? { url: song.url, artist: (song.artist || '').slice(0, 120), track: (song.track || '').slice(0, 120) } : null,
        theme: { accent: hex(theme.accent), bg: hex(theme.bg) },
      });
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

          {/* Details / interests */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block" style={F.scriptureSC}>· details ·</label>
            <div className="space-y-1.5">
              {[['music', 'music'], ['movies', 'films'], ['books', 'books'], ['heroes', 'heroes'], ['general', 'general']].map(([k, ph]) => (
                <input key={k} value={details[k] || ''} onChange={e => setDetail(k, e.target.value)} placeholder={ph} className="field w-full text-[12px]" />
              ))}
            </div>
          </div>

          {/* Profile song */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block" style={F.scriptureSC}>· your song ·</label>
            <input ref={songRef} type="file" accept="audio/*" onChange={uploadSong} className="hidden" />
            <div className="flex gap-1.5 mb-1.5">
              <button onClick={() => songRef.current?.click()} disabled={songUploading}
                className="tap flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/50 text-[10px] uppercase tracking-wider disabled:opacity-50" style={F.ui}>
                {songUploading ? <><Loader2 size={12} className="animate-spin" /> uploading</> : <><Music size={12} /> {song.url ? 'replace song' : 'upload a song (≤5MB)'}</>}
              </button>
              {song.url && <button onClick={() => setSong({ url: '', artist: '', track: '' })} className="tap px-3 border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#8B0000]"><X size={13} /></button>}
            </div>
            {song.url && (
              <>
                <audio controls src={song.url} className="w-full h-8 mb-1.5" preload="none" />
                <div className="grid grid-cols-2 gap-1.5">
                  <input value={song.track || ''} onChange={e => setSong(s => ({ ...s, track: e.target.value }))} placeholder="track" className="field text-[12px]" />
                  <input value={song.artist || ''} onChange={e => setSong(s => ({ ...s, artist: e.target.value }))} placeholder="artist" className="field text-[12px]" />
                </div>
              </>
            )}
          </div>

          {/* Blog */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 flex items-center justify-between" style={F.scriptureSC}>
              <span>· blog ·</span>
              <button onClick={addBlog} className="tap flex items-center gap-1 text-[#A8A29E] hover:text-[#C9A961] normal-case tracking-normal"><Plus size={12} /> entry</button>
            </label>
            {blog.length === 0 ? (
              <p className="text-[11px] text-[#6B6B6B] italic" style={F.serif}>no entries yet — add one.</p>
            ) : blog.map((b, i) => (
              <div key={i} className="border border-[#1A1A1A] p-2 mb-1.5">
                <div className="flex gap-1.5 mb-1">
                  <input value={b.title || ''} onChange={e => setBlogField(i, 'title', e.target.value.slice(0, 120))} placeholder="title" className="field flex-1 text-[12px]" />
                  <button onClick={() => removeBlog(i)} className="tap px-2 text-[#6B6B6B] hover:text-[#8B0000]"><X size={13} /></button>
                </div>
                <textarea value={b.body || ''} onChange={e => setBlogField(i, 'body', e.target.value.slice(0, 4000))} rows={2} placeholder="write…" className="field w-full resize-none text-[12px]" />
              </div>
            ))}
          </div>

          {/* Theme colors */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 block" style={F.scriptureSC}>· colors ·</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-[11px] text-[#A8A29E]" style={F.ui}>
                accent <input type="color" value={/^#[0-9a-f]{6}$/i.test(theme.accent) ? theme.accent : '#c9a961'} onChange={e => setTheme(t => ({ ...t, accent: e.target.value }))} className="w-8 h-8 bg-transparent border border-[#2A2A2A]" />
              </label>
              <label className="flex items-center gap-2 text-[11px] text-[#A8A29E]" style={F.ui}>
                background <input type="color" value={/^#[0-9a-f]{6}$/i.test(theme.bg) ? theme.bg : '#0f0f0f'} onChange={e => setTheme(t => ({ ...t, bg: e.target.value }))} className="w-8 h-8 bg-transparent border border-[#2A2A2A]" />
              </label>
              {(theme.accent || theme.bg) && <button onClick={() => setTheme({ accent: '', bg: '' })} className="tap text-[10px] text-[#6B6B6B] hover:text-[#8B0000] uppercase" style={F.ui}>reset</button>}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C9A961] mb-1.5 flex items-center justify-between" style={F.scriptureSC}>
              <span>· your gallery ·</span>
              <span className="text-[#6B6B6B]" style={F.mono}>{gallery.length}/{GALLERY_MAX}</span>
            </label>
            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {gallery.map((m, i) => (
                  <div key={i} className="relative aspect-square border border-[#2A2A2A] overflow-hidden bg-[#0A0A0A]">
                    {m.type === 'video'
                      ? <video src={m.url} className="w-full h-full object-cover" muted playsInline />
                      : <img src={m.url} alt="" className="w-full h-full object-cover" />}
                    <button onClick={() => removeMedia(i)} className="tap absolute top-0.5 right-0.5 w-5 h-5 bg-black/80 border border-[#3F3F3F] text-[#F5F1E8] hover:text-[#8B0000] flex items-center justify-center"><X size={11} /></button>
                  </div>
                ))}
              </div>
            )}
            {gallery.length < GALLERY_MAX && (
              <>
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={addUpload} className="hidden" />
                <div className="flex gap-1.5">
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    className="tap flex-1 flex items-center justify-center gap-1.5 py-2 border border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/50 text-[10px] uppercase tracking-wider disabled:opacity-50" style={F.ui}>
                    {uploading ? <><Loader2 size={12} className="animate-spin" /> uploading</> : <><ImagePlus size={12} /> upload</>}
                  </button>
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addLink(); }}
                    placeholder="…or paste an image link (incl. Pinterest)" className="field flex-1 text-[12px]" />
                  <button onClick={addLink} className="tap px-3 border border-[#2A2A2A] text-[#C9A961] hover:border-[#C9A961]/50" title="add link"><Link2 size={14} /></button>
                </div>
              </>
            )}
            {galErr && <p className="text-[10px] text-[#9E2A33] mt-1 italic" style={F.serif}>{galErr}</p>}
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
