import { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { SectionLabel } from '../shared/SectionLabel';
import { uploadImage } from '../../lib/db/storage';
import { BORDERS, BANNERS, borderStyle, bannerStyle } from '../../data/decor';
import { ARCHETYPES } from '../../data/archetypes';
import { PRESET_AVATARS } from '../../lib/avatars';
import { GLYPHS as AVATAR_OPTIONS, DEFAULT_GLYPH } from '../../data/glyphs';
const VIBE_OPTIONS = ['goth', 'raver', 'smoker', 'witch', 'mystic', 'darkwave', 'tradgoth', 'industrial', 'romantic', 'doomer', 'punk', 'NYC', 'LA', 'PDX', 'Berlin', 'sober', 'soft', 'feral'];

export function ProfileEditModal({ profile, meId, onSave, onClose, onSetShrineTheme }) {
  const [name, setName] = useState(profile.name || '');
  const [pronouns, setPronouns] = useState(profile.pronouns || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [birthday, setBirthday] = useState(profile.birthday || '');
  const [avatar, setAvatar] = useState(profile.avatar || DEFAULT_GLYPH);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || null);
  const [tags, setTags] = useState(profile.tags || []);
  const [border, setBorder] = useState(profile.decor?.border || 'none');
  const [banner, setBanner] = useState(profile.decor?.banner || 'none');
  const [bannerAnimated, setBannerAnimated] = useState(!!profile.decor?.animated);
  const [archetype, setArchetype] = useState(profile.archetype || '');
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
    onSave({ ...profile, name: name.trim() || profile.name, pronouns, bio, birthday, avatar, avatarUrl, tags, archetype: archetype || null, decor: { border, banner, animated: bannerAnimated } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90dvh] overflow-y-auto safe-pb animate-slide-up">
        <div className="sticky top-0 z-10 bg-[#0F0F0F] flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <SectionLabel rule={false}>edit</SectionLabel>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>YOUR PROFILE</h3>
          </div>
          <button onClick={onClose} className="tap text-[#A8A29E] hover:text-[#C9A961] p-2 -m-1"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-5">
          {/* Avatar photo */}
          <div>
            <SectionLabel rule={false} className="mb-2">portrait</SectionLabel>
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickPhoto} className="hidden" />
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()}
                className="tap w-16 h-16 rounded-full overflow-hidden border border-[#3F3F3F] bg-[#0A0A0A] flex items-center justify-center text-2xl relative shrink-0">
                {uploading ? <Loader2 size={18} className="animate-spin text-[#C9A961]" />
                  : avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span>{avatar}</span>}
              </button>
              <div className="flex flex-col gap-1.5 items-start">
                <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-ghost">
                  <Camera size={12} /> {avatarUrl ? 'change photo' : 'upload photo'}
                </button>
                {avatarUrl && (
                  <button onClick={() => setAvatarUrl(null)} className="btn btn-quiet">use a glyph instead</button>
                )}
              </div>
            </div>
            {error && <div className="text-[11px] text-[#8B0000] mt-1.5" style={F.ui}>{error}</div>}

            {/* Preset portrait sigils — appears only once custom avatar art exists in /public/avatars */}
            {PRESET_AVATARS.length > 0 && (
              <div className="mt-3">
                <SectionLabel rule={false} className="mb-2">or choose a portrait</SectionLabel>
                <div className="grid grid-cols-6 gap-1.5 p-2 border border-[#1A1A1A] bg-[#0A0204]/60">
                  {PRESET_AVATARS.map(a => (
                    <button key={a.id} onClick={() => setAvatarUrl(a.src)} title={a.label}
                      className={`tap aspect-square rounded-sm overflow-hidden border ${avatarUrl === a.src ? 'border-[#C9A961]/80' : 'border-[#2A2A2A] hover:border-[#C9A961]/40'}`}
                      style={avatarUrl === a.src ? { boxShadow: '0 0 12px rgba(201,169,97,0.25)' } : undefined}>
                      <img src={a.src} alt={a.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Glyph (used when no photo) */}
          <div className={avatarUrl ? 'opacity-40' : ''}>
            <SectionLabel rule={false} className="mb-2">your sigil</SectionLabel>
            <div className="grid grid-cols-6 gap-1.5 p-2 border border-[#1A1A1A] bg-[#0A0204]/60">
              {AVATAR_OPTIONS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={`tap aspect-square flex items-center justify-center text-xl rounded-sm border ${avatar === a ? 'border-[#C9A961]/70 text-[#C9A961]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/40 hover:text-[#F5F1E8]'}`}
                  style={avatar === a ? { boxShadow: '0 0 12px rgba(201,169,97,0.18)' } : undefined}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Archetype — a self-declared identity that also applies a matching shrine theme */}
          <div>
            <SectionLabel rule={false} className="mb-2">archetype</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setArchetype('')}
                className={`tap px-2.5 py-1 text-[10px] uppercase tracking-wider border ${!archetype ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                style={{ ...F.ui, boxShadow: !archetype ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>none</button>
              {ARCHETYPES.map(a => (
                <button key={a.id} onClick={() => { setArchetype(a.id); onSetShrineTheme && onSetShrineTheme(a.shrineTheme); }}
                  className={`tap px-2.5 py-1 text-[10px] uppercase tracking-wider border flex items-center gap-1 ${archetype === a.id ? 'text-[#F5F1E8]' : 'text-[#A8A29E] hover:border-[#5B0F1A]/60 border-[#2A2A2A]'}`}
                  style={archetype === a.id ? { borderColor: a.accent, background: `${a.accent}22` } : { ...F.ui }}>
                  <span style={{ color: a.accent }}>{a.glyph}</span>{a.label}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-[#6B6B6B] mt-1.5" style={F.serif}>shows as a badge on your profile + sets a matching shrine theme.</p>
          </div>

          {/* Decorations — border + banner */}
          <div>
            <SectionLabel rule={false} className="mb-2">border</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {BORDERS.map(b => (
                <button key={b.id} onClick={() => setBorder(b.id)}
                  className={`tap px-2.5 py-1 text-[10px] uppercase tracking-wider border ${border === b.id ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={{ ...F.ui, boxShadow: border === b.id ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{b.label}</button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="w-12 h-12 rounded-full bg-[#1A1A1A] flex items-center justify-center text-xl" style={borderStyle(border)}>{avatarUrl ? DEFAULT_GLYPH : avatar}</span>
              <span className="text-[10px] text-[#6B6B6B] italic" style={F.serif}>preview</span>
            </div>
          </div>
          <div>
            <SectionLabel rule={false} className="mb-2">banner</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {BANNERS.map(b => (
                <button key={b.id} onClick={() => setBanner(b.id)}
                  className={`tap px-2.5 py-1 text-[10px] uppercase tracking-wider border ${banner === b.id ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={{ ...F.ui, boxShadow: banner === b.id ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{b.label}</button>
              ))}
            </div>
            {banner !== 'none' && (
              <>
                <button onClick={() => setBannerAnimated(a => !a)}
                  className={`tap mt-2 px-2.5 py-1 text-[10px] uppercase tracking-wider border ${bannerAnimated ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A]/60'}`}
                  style={{ ...F.ui, boxShadow: bannerAnimated ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{bannerAnimated ? '✓ animated' : 'animate banner'}</button>
                <div className={`mt-2 h-10 border border-[#1A1A1A] overflow-hidden ${bannerAnimated ? 'banner-animated' : ''}`} style={bannerStyle(banner) || undefined} />
              </>
            )}
          </div>

          {/* Handle */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· handle ·</label>
            <input type="text" value={name} onChange={e => setName(e.target.value.slice(0, 30))}
              placeholder="your_handle"
              className="field mt-1.5" />
          </div>

          {/* Pronouns */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· pronouns ·</label>
            <input type="text" value={pronouns} onChange={e => setPronouns(e.target.value.slice(0, 20))}
              placeholder="she / they"
              className="field mt-1.5"
              style={F.ui} />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· bio ·</label>
            <textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 140))}
              placeholder="velvet & venom · brooklyn"
              rows={3}
              className="field mt-1.5 resize-none" />
            <div className="text-right text-[9px] text-[#6B6B6B] mt-0.5" style={F.mono}>{bio.length}/140</div>
          </div>

          {/* Birthday */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· born ·</label>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
              className="field mt-1.5"
              style={F.mono} />
            <div className="text-[9px] text-[#6B6B6B] mt-0.5 italic" style={F.serif}>used for memento mori &amp; your sign</div>
          </div>

          {/* Vibes */}
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.scriptureSC}>· vibes · ({tags.length}/6)</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {VIBE_OPTIONS.map(v => (
                <button key={v} onClick={() => toggleTag(v)}
                  className={`tap text-[11px] px-2 py-1 border uppercase tracking-wider ${tags.includes(v) ? 'border-[#C9A961]/70 text-[#F5F1E8]' : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#3F3F3F]'}`}
                  style={{ ...F.ui, boxShadow: tags.includes(v) ? '0 0 12px rgba(201,169,97,0.18)' : 'none' }}>{v}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0F0F0F] flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          <button onClick={onClose} className="btn btn-ghost ml-auto">cancel</button>
          <button onClick={save} className="btn btn-primary">save</button>
        </div>
      </div>
    </div>
  );
}
