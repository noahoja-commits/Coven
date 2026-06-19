import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Hash, EyeOff, Eye, BarChart2, Plus, Minus, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { COMMUNITIES } from '../../data/communities';
import { uploadImage } from '../../lib/db/storage';

export function ComposeOverlay({ meId, onClose, onPost }) {
  const [text, setText] = useState('');
  const [community, setCommunity] = useState('general');
  const [anonymous, setAnonymous] = useState(false);
  const [poll, setPoll] = useState(null); // null or {options: ['', '']}
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const pollOk = !poll || poll.options.filter(o => o.trim()).length >= 2;
  const canPost = (text.trim().length > 0 || imgFile) && pollOk && !busy;

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type?.startsWith('image/')) { setError('please choose an image'); return; }
    setError('');
    setImgFile(file);
    setImgPreview(URL.createObjectURL(file));
  };
  const clearImage = () => { setImgFile(null); setImgPreview(null); };

  const submit = async () => {
    if (!canPost) return;
    setBusy(true); setError('');
    try {
      const payload = { body: text.trim(), community, anonymous };
      if (poll) {
        const opts = poll.options.map(o => o.trim()).filter(Boolean);
        if (opts.length >= 2) payload.poll = opts;
      }
      if (imgFile) {
        payload.img = await uploadImage('post-images', meId, imgFile);
        payload.kind = 'photo';
      }
      onPost && onPost(payload);
      setText(''); clearImage();
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
    <div className="absolute inset-0 z-30 bg-[#0A0A0A] flex flex-col animate-fade-in">
      <div className="bg-[#0A0A0A] border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
          <div className="text-[#F5F1E8] text-sm tracking-[0.25em]" style={F.display}>NEW POST</div>
          <button onClick={submit} disabled={!canPost}
            className={`text-[#F5F1E8] text-xs px-3 py-1.5 uppercase tracking-wider transition-opacity flex items-center gap-1.5 ${canPost ? 'bg-[#8B0000] hover:bg-[#5B0F1A]' : 'bg-[#3F0A12] opacity-50 cursor-not-allowed'}`}
            style={F.ui}>{busy ? <><Loader2 size={12} className="animate-spin" /> posting</> : 'post'}</button>
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
        <div className="flex-1 px-4 py-4 overflow-y-auto">
          <textarea value={text} onChange={e => setText(e.target.value.slice(0, 2000))} maxLength={2000}
            placeholder="speak..."
            className="w-full bg-transparent text-[#F5F1E8] text-base outline-none resize-none placeholder:text-[#3F3F3F]"
            style={{ ...F.serif, minHeight: poll ? '120px' : (imgPreview ? '120px' : '60vh') }}
            autoFocus />
          {imgPreview && (
            <div className="mt-3 relative inline-block">
              <img src={imgPreview} alt="" className="max-h-72 w-auto border border-[#2A2A2A]" />
              <button onClick={clearImage} className="absolute top-1 right-1 w-7 h-7 bg-black/80 border border-[#3F3F3F] text-[#F5F1E8] flex items-center justify-center" title="remove image"><X size={14} /></button>
            </div>
          )}
          {poll && (
            <div className="mt-4 border border-[#7B2CBF]/30 bg-[#7B2CBF]/5 p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#7B2CBF] mb-1" style={F.scriptureSC}>· poll ·</div>
              {poll.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={opt} onChange={e => updateOption(i, e.target.value.slice(0, 48))}
                    placeholder={`option ${i + 1}`}
                    className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#7B2CBF] outline-none px-2 py-1.5 text-[#F5F1E8] text-sm"
                    style={F.serif} />
                  {poll.options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="text-[#6B6B6B] hover:text-[#8B0000]"><Minus size={14} /></button>
                  )}
                </div>
              ))}
              {poll.options.length < 4 && (
                <button onClick={addOption} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961]" style={F.ui}>
                  <Plus size={11} /> add option
                </button>
              )}
            </div>
          )}
        </div>
        {error && <div className="px-4 py-2 text-[11px] text-[#8B0000] text-center" style={F.ui}>{error}</div>}
        <div className="border-t border-[#1A1A1A] px-4 py-3 flex items-center gap-4">
          <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={!!poll}
            className={`${imgPreview ? 'text-[#C9A961]' : 'text-[#A8A29E] hover:text-[#F5F1E8]'} disabled:opacity-30`} title="add a photo"><ImageIcon size={18} /></button>
          <button onClick={togglePoll} disabled={!!imgFile} className={`${poll ? 'text-[#7B2CBF]' : 'text-[#A8A29E] hover:text-[#F5F1E8]'} disabled:opacity-30`} title="poll"><BarChart2 size={18} /></button>
          <button onClick={() => setAnonymous(!anonymous)}
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-colors ${anonymous ? 'text-[#7B2CBF]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
            style={F.ui} title="post as confession">
            {anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{anonymous ? 'confession' : 'identified'}</span>
          </button>
          <span className="ml-auto text-[10px] text-[#6B6B6B]" style={F.mono}>{text.length}</span>
        </div>
        {anonymous && (
          <div className="px-4 py-2 bg-[#7B2CBF]/10 border-t border-[#7B2CBF]/30 text-[10px] text-[#A89968] text-center" style={F.serif}>
            · posted as <span className="text-[#7B2CBF]">anonymous · the confessor</span> ·
          </div>
        )}
      </div>
    </div>
  );
}
