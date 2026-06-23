import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { uploadImage } from '../../lib/db/storage';
import { BORDERS, BANNERS, borderStyle, bannerStyle } from '../../data/decor';

// A cohesive occult/gothic sigil set — mourning, moon, cross, and alchemical marks.
const AVATAR_OPTIONS = ['🦇', '🕯', '🥀', '🌹', '🌙', '🌑', '☾', '☽', '⛧', '⛤', '🜏', '𖤐', '☠', '💀', '⚰', '⚱', '✝', '✟', '☦', '♰', '†', '⸸', '☥', '🔮', '🕸', '🗝', '🦴', '⚜', '✦', '✧'];
const VIBE_OPTIONS = ['goth', 'raver', 'smoker', 'witch', 'mystic', 'darkwave', 'tradgoth', 'industrial', 'romantic', 'doomer', 'punk', 'NYC', 'LA', 'PDX', 'Berlin', 'sober', 'soft', 'feral'];

export function ProfileEditModal({ profile, meId, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [pronouns, setPronouns] = useState(profile.pronouns || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [birthday, setBirthday] = useState(profile.birthday || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🦇');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null);
  const [tags, setTags] = useState(profile.tags || []);
  const [border, setBorder] = useState(profile.decor?.border || 'none');
  const [banner, setBanner] = useState(profile.decor?.banner || 'none');
  const [bannerAnimated, setBannerAnimated] = useState(!!profile.decor?.animated);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length >= 6 ? prev : [...prev, t]);

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    setUploading(true); setError('');
    try { setAvatarUrl(await uploadImage('avatars', meId, file)); }
    catch (err) { setError(err?.message || 'upload failed'); }
    finally { setUploading(false); }
  };

  const save = () => {
    if (uploading) return;
    onSave({ ...profile, name: name.trim() || profile.name, pronouns, bio, birthday, avatar, avatarUrl, tags, decor: { border, banner, animated: bannerAnimated } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] overflow-y-auto safe-pb animate-slide-up">
        <div className="sticky top-0 z-10 bg-[#0F0F0F] flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· edit ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>YOUR PROFILE</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-5">
          {/* Avatar photo */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· portrait ·</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-full overflow-hidden border border-[#3F3F3F] bg-[#0A0A0A] flex items-center justify-center text-2xl relative shrink-0">
                {uploading ? <Loader2 size={18} className="animate-spin text-[#C9A961]" />
                  : avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span>{avatar}</span>}
              </button>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="text-[10px] uppercase tracking-wider px-3 py-1.5 border border-[#3F3F3F] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] flex items-center gap-1.5" style={F.ui}>
                  <Camera size={12} /> {avatarUrl ? 'change photo' : 'upload photo'}
                </button>
                {avatarUrl && (
                  <button onClick={() => setAvatarUrl(null)} className="text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#8B0000]" style={F.ui}>use a glyph instead</button>
                )}
              </div>
            </div>
            {error && <div className="text-[11px] text-[#8B0000] mt-1.5" style={F.ui}>{error}</div>}
          </div>

          {/* Glyph (used when no photo) */}
          <div className={avatarUrl ? 'opacity-40' : ''}>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· your sigil ·</div>
            <div className="grid grid-cols-6 gap-1.5 p-2 border border-[#1A1A1A] bg-[#0A0204]/60">
              {AVATAR_OPTIONS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={`aspect-square flex items-center justify-center text-xl rounded-sm border transition-all ${avatar === a ? 'border-[#C9A961] bg-gradient-to-b from-[#5B0F1A]/30 to-[#2D0F3F]/20 text-[#C9A961] scale-105' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/40 hover:text-[#F5F1E8]'}`}
                  style={avatar === a ? { boxShadow: '0 0 0 1px rgba(201,169,97,0.5), 0 0 12px rgba(201,169,97,0.4)' } : undefined}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Decorations — border + banner */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· border ·</div>
            <div className="flex flex-wrap gap-1.5">
              {BORDERS.map(b => (
                <button key={b.id} onClick={() => setBorder(b.id)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border transition-colors ${border === b.id ? 'border-[#8B0000] bg-[#5B0F1A]/25 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={F.ui}>{b.label}</button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xl" style={borderStyle(border)}>{avatarUrl ? '🦇' : avatar}</span>
              <span className="text-[10px] text-[#6B6B6B] italic" style={F.serif}>preview</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· banner ·</div>
            <div className="flex flex-wrap gap-1.5">
              {BANNERS.map(b => (
                <button key={b.id} onClick={() => setBanner(b.id)}
                  className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border transition-colors ${banner === b.id ? 'border-[#8B0000] bg-[#5B0F1A]/25 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={F.ui}>{b.label}</button>
              ))}
            </div>
            {banner !== 'none' && (
              <>
                <button onClick={() => setBannerAnimated(a => !a)}
                  className={`mt-2 px-2.5 py-1 text-[10px] uppercase tracking-wider border transition-colors ${bannerAnimated ? 'border-[#8B0000] bg-[#5B0F1A]/25 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={F.ui}>{bannerAnimated ? '✓ animated' : 'animate banner'}</button>
                <div className={`mt-2 h-10 border border-[#1A1A1A] overflow-hidden ${bannerAnimated ? 'banner-animated' : ''}`} style={bannerStyle(banner) || undefined} />
              </>
            )}
          </div>

          {/* Handle */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· handle ·</label>
            <input type="text" value={name} onChange={e => setName(e.target.value.slice(0, 30))}
              placeholder="your_handle"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-base"
              style={F.serif} />
          </div>

          {/* Pronouns */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· pronouns ·</label>
            <input type="text" value={pronouns} onChange={e => setPronouns(e.target.value.slice(0, 20))}
              placeholder="she / they"
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm"
              style={F.ui} />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· bio ·</label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 140))}
              placeholder="velvet & venom · brooklyn"
              rows={3}
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm resize-none"
              style={F.serif} />
            <div className="text-right text-[9px] text-[#6B6B6B] mt-0.5" style={F.mono}>{bio.length}/140</div>
          </div>

          {/* Birthday */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· born ·</label>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
              className="w-full mt-1.5 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-2.5 text-[#F5F1E8] text-sm"
              style={F.mono} />
            <div className="text-[9px] text-[#6B6B6B] mt-0.5 italic" style={F.serif}>used for memento mori &amp; your sign</div>
          </div>

          {/* Vibes */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#A89968]" style={F.scriptureSC}>· vibes · ({tags.length}/6)</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {VIBE_OPTIONS.map(v => (
                <button key={v} onClick={() => toggleTag(v)}
                  className={`text-[11px] px-2 py-1 border uppercase tracking-wider transition-colors ${tags.includes(v) ? 'bg-[#8B0000]/15 border-[#8B0000] text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#3F3F3F]'}`}
                  style={F.ui}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0F0F0F] flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]"
            style={F.ui}>cancel</button>
          <button onClick={save}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]"
            style={F.ui}>save</button>
        </div>
      </div>
    </div>
  );
}
