import { useState } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

const AVATAR_OPTIONS = ['🦇', '🕯', '✟', '⚱', '☠', '🩸', '🌹', '🌙', '⛧', '☩', '✦', '☽', '⚰', '♰', '🜏'];
const VIBE_OPTIONS = ['goth', 'raver', 'smoker', 'witch', 'mystic', 'darkwave', 'tradgoth', 'industrial', 'romantic', 'doomer', 'punk', 'NYC', 'LA', 'PDX', 'Berlin', 'sober', 'soft', 'feral'];

export function ProfileEditModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile.name || '');
  const [pronouns, setPronouns] = useState(profile.pronouns || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [birthday, setBirthday] = useState(profile.birthday || '');
  const [avatar, setAvatar] = useState(profile.avatar || '🦇');
  const [tags, setTags] = useState(profile.tags || []);

  const toggleTag = (t) => setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : prev.length >= 6 ? prev : [...prev, t]);

  const save = () => {
    onSave({ ...profile, name: name.trim() || profile.name, pronouns, bio, birthday, avatar, tags });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 z-10 bg-[#0F0F0F] flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#A89968]" style={F.scriptureSC}>· edit ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>YOUR PROFILE</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-5">
          {/* Avatar */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#A89968] mb-2" style={F.scriptureSC}>· sigil ·</div>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_OPTIONS.map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={`w-10 h-10 flex items-center justify-center text-xl border transition-colors ${avatar === a ? 'border-[#C9A961] bg-[#C9A961]/10' : 'border-[#2A2A2A] hover:border-[#3F3F3F]'}`}>
                  {a}
                </button>
              ))}
            </div>
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
