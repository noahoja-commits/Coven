import { ChevronLeft } from 'lucide-react';
import { F } from '../../styles/fonts';

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#5B0F1A]' : 'bg-[#2A2A2A]'}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#F5F1E8] transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

function Slider({ value, onChange, min = 0, max = 1, step = 0.05 }) {
  return (
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="w-24 accent-[#5B0F1A]" />
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#A89968] px-4 pb-2" style={F.scriptureSC}>· {title} ·</div>
      <div className="border-y border-[#1A1A1A] divide-y divide-[#1A1A1A]">{children}</div>
    </div>
  );
}

function Row({ label, desc, children }) {
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[#F5F1E8] text-sm" style={F.serif}>{label}</div>
        {desc && <div className="text-[10px] text-[#6B6B6B] mt-0.5" style={F.serif}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export function SettingsScreen({ settings, onChange, onBack, onLogout }) {
  const set = (key, value) => onChange({ ...settings, [key]: value });
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] flex items-center gap-1 -ml-1" style={F.ui}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">back</span>
          </button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>SETTINGS</div>
          <span className="w-12" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <Section title="appearance">
          <Row label="Parchment mode" desc="invert the world. cream & oxblood for daylight reading.">
            <Toggle on={settings.parchmentMode} onChange={v => set('parchmentMode', v)} />
          </Row>
          <Row label="Film grain" desc="texture overlay. atmospheric.">
            <Slider value={settings.grainIntensity} onChange={v => set('grainIntensity', v)} min={0} max={0.2} step={0.01} />
          </Row>
          <Row label="Vignette" desc="dark edges around the screen.">
            <Toggle on={settings.vignette} onChange={v => set('vignette', v)} />
          </Row>
          <Row label="Soft blur" desc="slight haze on backgrounds.">
            <Toggle on={settings.blur} onChange={v => set('blur', v)} />
          </Row>
        </Section>

        <Section title="atmosphere">
          <Row label="Weather mood" desc="tint the app with the weather outside.">
            <Toggle on={settings.weatherMood} onChange={v => set('weatherMood', v)} />
          </Row>
          <Row label="Sound on" desc="ambient track when you tap the Coven 3 times.">
            <Toggle on={settings.soundOn} onChange={v => set('soundOn', v)} />
          </Row>
        </Section>

        <Section title="rituals">
          <Row label="The Deck (Tarot)" desc="one card a day on the home rail.">
            <Toggle on={settings.tarotEnabled} onChange={v => set('tarotEnabled', v)} />
          </Row>
          <Row label="Daily Vespers" desc="a passage at sunset. one-word reaction. lost forever.">
            <Toggle on={settings.vespersEnabled} onChange={v => set('vespersEnabled', v)} />
          </Row>
          <Row label="The Vigil" desc="sunday midnight. souls present.">
            <Toggle on={settings.vigilEnabled} onChange={v => set('vigilEnabled', v)} />
          </Row>
        </Section>

        <Section title="self">
          <Row label="Memento mori" desc="days lived. days remaining.">
            <Toggle on={settings.mementoMori} onChange={v => set('mementoMori', v)} />
          </Row>
          <Row label="Show expected days" desc="the second number. ~80 years estimated.">
            <Toggle on={settings.mementoExpected} onChange={v => set('mementoExpected', v)} />
          </Row>
          <Row label="Ghost mode" desc="hide tonight, online, last seen, and your map pin.">
            <Toggle on={settings.ghostMode} onChange={v => set('ghostMode', v)} />
          </Row>
        </Section>

        <Section title="account">
          <Row label="Edit profile">
            <span className="text-[#6B6B6B] text-sm">›</span>
          </Row>
          <Row label="Privacy & blocked">
            <span className="text-[#6B6B6B] text-sm">›</span>
          </Row>
          <Row label="Notifications">
            <span className="text-[#6B6B6B] text-sm">›</span>
          </Row>
          <Row label="Help & feedback">
            <span className="text-[#6B6B6B] text-sm">›</span>
          </Row>
        </Section>

        <div className="px-4 mt-4">
          <button onClick={onLogout} className="w-full py-3 text-[#5B0F1A] text-xs uppercase tracking-[0.25em] border border-[#2A2A2A] hover:border-[#5B0F1A]" style={F.ui}>
            sign out
          </button>
        </div>

        <div className="text-center mt-12 mb-8">
          <div className="text-[#A89968] text-3xl mb-2" style={F.brand}>Coven</div>
          <div className="text-[10px] text-[#6B6B6B] uppercase tracking-[0.3em]" style={F.ui}>v0.1 · early ritual</div>
          <div className="text-[10px] text-[#3F3F3F] mt-1" style={F.scripture}>"made for the ones in the dark."</div>
        </div>
      </div>
    </div>
  );
}

export const DEFAULT_SETTINGS = {
  parchmentMode: false,
  grainIntensity: 0.07,
  vignette: true,
  blur: false,
  weatherMood: false,
  soundOn: false,
  tarotEnabled: true,
  vespersEnabled: true,
  vigilEnabled: true,
  mementoMori: true,
  mementoExpected: false,
  ghostMode: false,
};
