import { useState } from 'react';
import { X } from 'lucide-react';
import { F } from '../../styles/fonts';

const PROMPTS = [
  'looking for a smoke sesh',
  'down for whatever',
  'staying in tonight',
  'free pre-show, dm me',
  'last call somewhere good?',
  'home alone, drinking wine',
  'the cathedral after sunset',
  'who\u2019s rolling',
];

const humanDist = (m) => m < 950 ? `${Math.round(m / 50) * 50} m` : `${(m / 1609).toFixed(1)} mi`;
const radiusName = (m) => m < 700 ? 'block' : m < 2400 ? 'neighborhood' : m < 7000 ? 'area' : 'city';

export function TonightStatusModal({ current, onSave, onClose }) {
  const [text, setText] = useState(current?.text || '');
  const [neighborhood, setNeighborhood] = useState(current?.neighborhood || '');
  const [share, setShare] = useState(!!current?.share);
  const [fuzzM, setFuzzM] = useState(current?.fuzzM || 1609);

  const save = () => {
    onSave({
      text: text.trim(),
      neighborhood: neighborhood.trim(),
      setAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 12, // 12h
      share,
      fuzzM,
    });
    onClose();
  };

  const clear = () => {
    onSave(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 animate-slide-up safe-pb max-h-[90dvh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#5B0F1A]" style={F.ui}>· tonight ·</span>
            <h3 className="text-[#F5F1E8] text-lg leading-none mt-1" style={F.display}>SET YOUR STATUS</h3>
          </div>
          <button onClick={onClose} className="text-[#A8A29E] hover:text-[#F5F1E8] p-2 -m-1 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-4">
          <p className="text-[#A8A29E] text-xs mb-3" style={F.serif}>visible on the map to the coven for 12 hours, then it disappears.</p>

          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, 80))}
            placeholder="what are you up to tonight?"
            className="w-full h-24 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none p-3 text-[#F5F1E8] text-base resize-none"
            style={F.serif}
            maxLength={80}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-[9px] text-[#6B6B6B] uppercase tracking-wider" style={F.ui}>shown on the map &amp; your profile</span>
            <span className="text-[9px] text-[#6B6B6B]" style={F.mono}>{text.length}/80</span>
          </div>

          <input
            value={neighborhood}
            onChange={e => setNeighborhood(e.target.value.slice(0, 40))}
            placeholder="neighborhood (optional) — e.g. Ybor"
            className="w-full mt-3 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none px-3 py-2 text-[#F5F1E8] text-sm"
            style={F.serif}
            maxLength={40}
          />

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E] mb-2" style={F.ui}>· quick fills ·</div>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map(p => (
                <button key={p} onClick={() => setText(p)}
                  className="text-[11px] px-2 py-1 border border-[#2A2A2A] text-[#A8A29E] hover:border-[#5B0F1A] hover:text-[#F5F1E8] transition-colors"
                  style={F.serif}>{p}</button>
              ))}
            </div>
          </div>

          {/* share real location (opt-in) — broadcast only a fuzzed circle */}
          <div className="mt-4 border-t border-[#1A1A1A] pt-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C8102E]" style={F.ui}>· share location ·</div>
                <div className="text-[10px] text-[#6B6B6B] mt-0.5" style={F.serif}>show real distance to nearby souls</div>
              </div>
              <button type="button" role="switch" aria-checked={share} onClick={() => setShare(s => !s)}
                className={`w-11 h-6 rounded-full relative shrink-0 transition-colors ${share ? 'bg-[#8B0000]' : 'bg-[#2A2A2A]'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#F5F1E8] transition-transform ${share ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
              </button>
            </div>
            {share && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-[#6B6B6B]" style={F.ui}>your broadcast circle</span>
                  <span className="text-[10px] text-[#C9A961]" style={F.mono}>~{humanDist(fuzzM)} · {radiusName(fuzzM)}</span>
                </div>
                <input type="range" min="150" max="16000" step="50" value={fuzzM}
                  onChange={e => setFuzzM(Number(e.target.value))}
                  className="w-full accent-[#8B0000] cursor-pointer" />
                <div className="flex justify-between text-[8px] text-[#6B6B6B] uppercase tracking-wider mt-0.5" style={F.ui}>
                  <span>tight</span><span>wide</span>
                </div>
                <p className="text-[9px] text-[#6B6B6B] mt-2 leading-relaxed" style={F.serif}>
                  others see only a ~{humanDist(fuzzM)} circle — never your exact spot. your precise coords stay locked to you.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 border-t border-[#1A1A1A]">
          {current && (
            <button onClick={clear}
              className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#6B6B6B] hover:text-[#A8A29E]"
              style={F.ui}>clear</button>
          )}
          <button onClick={onClose}
            className="ml-auto px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A8A29E]"
            style={F.ui}>cancel</button>
          <button onClick={save} disabled={!text.trim() && !share}
            className="px-4 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40 disabled:cursor-not-allowed"
            style={F.ui}>{text.trim() ? 'set status' : (share ? 'go live' : 'set status')}</button>
        </div>
      </div>
    </div>
  );
}
