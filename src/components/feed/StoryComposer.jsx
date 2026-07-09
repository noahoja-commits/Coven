import { useState, useRef } from 'react';
import { Image, X } from 'lucide-react';
import { F } from '../../styles/fonts';
import { GLYPHS, DEFAULT_GLYPH } from '../../data/glyphs';
import { uploadImage } from '../../lib/db/storage';

// bg ids must match StoryViewer's BG_STYLES keys (red/violet/gold/silver/black)
// so the stored value renders correctly there and stays consistent with older stories.
const BGS = ['red', 'violet', 'gold', 'silver', 'black'];

const BG_STYLES = {
  red: 'from-[#5B0F1A] to-[#2A050A]',
  violet: 'from-[#3A1A5A] to-[#1A0A2A]',
  gold: 'from-[#5A4A1A] to-[#2A220A]',
  silver: 'from-[#3A3A3A] to-[#1A1A1A]',
  black: 'from-[#0A0A0A] to-[#000000]',
};

export function StoryComposer({ meId, onClose, onPost, attachedPost }) {
  const [glyph, setGlyph] = useState(DEFAULT_GLYPH);
  const [caption, setCaption] = useState('');
  const [bg, setBg] = useState('red');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const r = new FileReader();
    r.onload = () => setImagePreview(r.result);
    r.readAsDataURL(file);
  };

  const post = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage('story-images', meId, image);
      }
      const payload = { glyph, caption, bg, image_url: imageUrl };
      if (attachedPost?.id) payload.post_id = attachedPost.id;
      await onPost(payload);
    } catch (e) {
      // upload or parent handler failed — surface it so the user isn't left guessing.
      console.warn('story post failed', e?.message || e);
      setError(e?.message || "couldn't post your story — try again.");
      setBusy(false);
      return;
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#F5F1E8] transition-colors">
          <X size={20} />
        </button>
        <span className="text-sm text-[#F5F1E8] uppercase tracking-widest" style={F.ui}>new story</span>
        <button
          onClick={post}
          disabled={busy}
          className={`tap text-xs uppercase tracking-widest px-4 py-1.5 rounded-full transition-colors ${
            busy ? 'opacity-40' : 'bg-[#8B0000] text-[#F5F1E8]'
          }`} style={F.ui}
        >
          {busy ? '...' : 'share'}
        </button>
      </div>

      {error && (
        <div className="px-4 py-2 text-[11px] text-[#8B0000] text-center bg-[#8B0000]/10 border-b border-[#8B0000]/30" style={F.ui}>{error}</div>
      )}

      {/* Preview */}
      <div className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-b ${BG_STYLES[bg]} p-6`}>
        {/* Attached post preview (share-to-story) */}
        {attachedPost && (
          <div className="w-full max-w-[280px] mb-4 bg-[#0A0A0A]/60 border border-[#C9A961]/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[10px] overflow-hidden">
                {attachedPost.avatarUrl ? (
                  <img src={attachedPost.avatarUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <span>{attachedPost.avatar || '✦'}</span>
                )}
              </div>
              <span className="text-[10px] text-[#A8A29E]" style={F.ui}>
                {attachedPost.anonymous ? 'anonymous' : attachedPost.user}
              </span>
            </div>
            {attachedPost.body && (
              <p className="text-xs text-[#F5F1E8]/80 leading-relaxed line-clamp-3" style={F.serif}>
                {attachedPost.body}
              </p>
            )}
            {attachedPost.img && (
              <div className="mt-1 rounded-lg overflow-hidden">
                <PostImage kind={attachedPost.img} />
              </div>
            )}
          </div>
        )}

        {/* Glyph */}
        <div className="text-6xl mb-4">{glyph}</div>

        {/* Caption */}
        {caption && (
          <p className="text-lg text-center text-[#F5F1E8]/90 max-w-[280px] leading-relaxed" style={F.serif}>
            "{caption}"
          </p>
        )}

        {/* Image preview */}
        {imagePreview && (
          <div className="mt-4 w-32 h-32 rounded-xl overflow-hidden border border-white/10">
            <img src={imagePreview} className="w-full h-full object-cover" alt="" />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-4 py-3 space-y-3">
        {/* Glyph picker */}
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {GLYPHS.map(g => (
            <button key={g} onClick={() => setGlyph(g)}
              className={`tap w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm transition-colors ${
                glyph === g ? 'bg-[#8B0000] text-[#F5F1E8]' : 'bg-[#1A1A1A] text-[#A8A29E]'
              }`}>{g}</button>
          ))}
        </div>

        {/* Caption */}
        <input
          value={caption}
          maxLength={80}
          onChange={e => setCaption(e.target.value)}
          placeholder="caption..."
          className="field w-full text-sm"
        />

        {/* Background + Image */}
        <div className="flex items-center gap-2">
          {BGS.map(b => (
            <button key={b} onClick={() => setBg(b)}
              className={`tap w-8 h-8 rounded-full border-2 transition-colors bg-gradient-to-b ${BG_STYLES[b]} ${
                bg === b ? 'border-[#C9A961]' : 'border-transparent'
              }`} />
          ))}
          <div className="flex-1" />
          <button onClick={() => fileRef.current?.click()}
            className="tap w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#A8A29E]">
            <Image size={14} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
          {imagePreview && (
            <button onClick={() => { setImage(null); setImagePreview(null); }}
              className="tap text-[#8B0000] text-xs" style={F.ui}>remove</button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostImage({ kind }) {
  if (!kind) return null;
  if (kind.startsWith('http') || kind.startsWith('data:')) {
    const isVideo = /\.(mp4|webm|mov|m4v|ogg)$/i.test(kind);
    return isVideo
      ? <video src={kind} className="w-full rounded-lg" controls />
      : <img src={kind} className="w-full rounded-lg" alt="" />;
  }
  return null;
}
