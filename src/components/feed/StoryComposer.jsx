import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { uploadImage } from '../../lib/db/storage';

const GLYPHS = ['🦇', '🕯', '✟', '⚱', '☠', '🩸', '🌹', '🌙', '⛧', '☩', '✦', '☽', '⚰', '♰', '🜏', '⛤'];
const BACKGROUNDS = [
  { id: 'red', label: 'oxblood', bg: 'linear-gradient(135deg, #5B0F1A 0%, #1A0408 70%, #0A0204 100%)' },
  { id: 'violet', label: 'violet', bg: 'linear-gradient(135deg, #2D0F3F 0%, #14081F 70%, #0A0410 100%)' },
  { id: 'gold', label: 'gold', bg: 'linear-gradient(135deg, #3B2F0A 0%, #1A1408 70%, #0A0804 100%)' },
  { id: 'silver', label: 'silver', bg: 'linear-gradient(135deg, #2A2A30 0%, #14141A 70%, #0A0A10 100%)' },
  { id: 'black', label: 'pitch', bg: 'linear-gradient(135deg, #1F1F1F 0%, #0A0A0A 100%)' },
];

export function StoryComposer({ meId, onClose, onPost }) {
  const [glyph, setGlyph] = useState('🦇');
  const [caption, setCaption] = useState('');
  const [bg, setBg] = useState(BACKGROUNDS[0]);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const canPost = (caption.trim() || imgFile) && !busy;

  const onPickImage = (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    if (!file.type?.startsWith('image/')) { setError('please choose an image'); return; }
    setError(''); setImgFile(file); setImgPreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!canPost) return;
    setBusy(true); setError('');
    try {
      const payload = { glyph, caption: caption.trim(), bg: bg.id };
      if (imgFile) payload.image_url = await uploadImage('story-images', meId, imgFile);
      onPost && onPost(payload);
      onClose && onClose();
    } catch (err) { setError(err?.message || 'could not post'); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[55] bg-black flex flex-col animate-fade-in">
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10 z-10 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 -m-1 transition-colors"><X size={20} /></button>
          <div className="text-white text-sm tracking-[0.3em]" style={F.display}>YOUR STORY</div>
          <button onClick={submit} disabled={!canPost}
            className={`text-white text-xs px-3 py-1.5 uppercase tracking-wider flex items-center gap-1.5 ${canPost ? 'bg-[#8B0000]' : 'bg-white/10 opacity-50'}`}
            style={F.ui}>{busy ? <><Loader2 size={12} className="animate-spin" /> posting</> : 'post'}</button>
        </div>
      </div>

      {/* Preview */}
      <div className="relative flex-1 overflow-hidden" style={{ background: imgPreview ? '#000' : bg.bg }}>
        {imgPreview ? (
          <img src={imgPreview} alt="" className="absolute inset-0 w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[200px] opacity-20" style={{ textShadow: '0 0 60px rgba(0,0,0,0.5)' }}>{glyph}</div>
          </div>
        )}
        <div className="absolute bottom-16 left-0 right-0 px-6 text-center">
          {caption ? (
            <p className="text-white text-xl leading-tight" style={F.scripture}>"{caption}"</p>
          ) : (
            <p className="text-white/30 text-base italic" style={F.scripture}>your caption appears here</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-md border-t border-white/10 p-4 space-y-3 safe-pb">
        {error && <div className="text-[11px] text-[#FF6B6B] text-center" style={F.ui}>{error}</div>}
        <div className="flex items-center gap-2">
          <input
            value={caption}
            onChange={e => setCaption(e.target.value.slice(0, 80))}
            placeholder="say something..."
            className="flex-1 bg-white/5 border border-white/10 focus:border-white/30 outline-none p-2.5 text-white text-sm placeholder:text-white/40"
            style={F.serif}
            autoFocus
          />
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
          <button onClick={() => imgPreview ? (setImgFile(null), setImgPreview(null)) : fileRef.current?.click()}
            className={`shrink-0 w-10 h-10 flex items-center justify-center border ${imgPreview ? 'border-[#C9A961] text-[#C9A961]' : 'border-white/20 text-white/70 hover:text-white'}`}
            title={imgPreview ? 'remove photo' : 'add a photo'}>
            {imgPreview ? <X size={16} /> : <ImageIcon size={16} />}
          </button>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2" style={F.scriptureSC}>· glyph ·</div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {GLYPHS.map(g => (
              <button key={g} onClick={() => setGlyph(g)}
                className={`shrink-0 w-9 h-9 flex items-center justify-center text-lg border transition-colors ${glyph === g ? 'border-white bg-white/10' : 'border-white/10 hover:border-white/30'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2" style={F.scriptureSC}>· background ·</div>
          <div className="flex gap-1.5">
            {BACKGROUNDS.map(b => (
              <button key={b.id} onClick={() => setBg(b)}
                className={`flex-1 h-8 border-2 transition-colors ${bg.id === b.id ? 'border-white' : 'border-white/10'}`}
                style={{ background: b.bg }} title={b.label} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
