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

export function SettingsScreen({ settings, onChange, onBack, onLogout, onRerunOnboarding, mutedKeywords = [], onSetMutedKeywords, payoutStatus, onSetupPayouts }) {
  const set = (key, value) => onChange({ ...settings, [key]: value });
  const addKeyword = (e) => {
    e.preventDefault();
    const val = (e.target.elements.kw.value || '').trim().toLowerCase();
    if (!val || mutedKeywords.includes(val)) return;
    onSetMutedKeywords && onSetMutedKeywords([...mutedKeywords, val]);
    e.target.reset();
  };
  const removeKeyword = (k) => {
    onSetMutedKeywords && onSetMutedKeywords(mutedKeywords.filter(x => x !== k));
  };
  return (
    <div className="absolute inset-0 z-50 bg-[#0A0A0A] animate-slide-in-right flex flex-col">
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A]">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] transition-colors flex items-center gap-1 -ml-1" style={F.ui}>
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

        <Section title="muted words">
          <div className="px-4 py-3">
            <p className="text-[10px] text-[#6B6B6B] mb-2" style={F.serif}>posts containing these words won't show in your feed.</p>
            <form onSubmit={addKeyword} className="flex gap-2 mb-2">
              <input name="kw" placeholder="word or phrase"
                className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] focus:border-[#5B0F1A] outline-none px-2.5 py-1.5 text-[#F5F1E8] text-sm"
                style={F.serif} />
              <button type="submit"
                className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8]" style={F.ui}>mute</button>
            </form>
            {mutedKeywords.length === 0 ? (
              <p className="text-[10px] text-[#6B6B6B] italic" style={F.serif}>· nothing muted ·</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {mutedKeywords.map(k => (
                  <button key={k} onClick={() => removeKeyword(k)}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] border border-[#5B0F1A]/40 bg-[#5B0F1A]/10 text-[#A8A29E] hover:text-[#F5F1E8] hover:bg-[#5B0F1A]/20"
                    style={F.ui}>
                    {k} <span className="text-[#8B0000]">×</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Section>

        <Section title="notifications">
          {[
            { id: 'reaction', label: 'Reactions' },
            { id: 'reply', label: 'Replies & comments' },
            { id: 'follow', label: 'Follows' },
            { id: 'dm', label: 'Whispers' },
            { id: 'event', label: 'Rites & events' },
            { id: 'crew', label: 'Crews' },
            { id: 'candle', label: 'Candles lit' },
            { id: 'tonight', label: 'Tonight statuses' },
            { id: 'vespers', label: 'Vespers passages' },
          ].map(k => {
            const on = (settings.notificationKinds || {})[k.id] !== false;
            return (
              <Row key={k.id} label={k.label}>
                <Toggle on={on} onChange={v => set('notificationKinds', { ...(settings.notificationKinds || {}), [k.id]: v })} />
              </Row>
            );
          })}
        </Section>

        <Section title="get paid">
          <div className="px-4 py-3">
            {payoutStatus?.enabled ? (
              <div className="flex items-start gap-2">
                <span className="text-[#C9A961] text-sm mt-0.5">✓</span>
                <p className="text-[#A8A29E] text-sm" style={F.serif}>payouts active — ticket sales for your rites deposit to your bank automatically (you keep the rest after the platform fee).</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] text-[#6B6B6B] mb-2" style={F.serif}>
                  {payoutStatus?.hasAccount ? 'finish onboarding to start receiving ticket money.' : 'connect a bank to sell tickets and get paid automatically when people buy.'}
                </p>
                <button onClick={onSetupPayouts}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] transition-colors" style={F.ui}>
                  {payoutStatus?.hasAccount ? 'finish payout setup' : 'set up payouts'}
                </button>
              </>
            )}
          </div>
        </Section>

        <Section title="account">
          {['Edit profile', 'Privacy & blocked', 'Notifications', 'Help & feedback'].map(label => (
            <Row key={label} label={label}>
              <span className="text-[9px] uppercase tracking-[0.18em] text-[#3F3F3F]" style={F.ui}>soon</span>
            </Row>
          ))}
        </Section>

        <div className="px-4 mt-4 space-y-2">
          {onRerunOnboarding && (
            <button onClick={onRerunOnboarding}
              className="w-full py-3 text-[#A89968] text-xs uppercase tracking-[0.25em] border border-[#2A2A2A] hover:border-[#A89968]" style={F.ui}>
              re-do onboarding
            </button>
          )}
          <button onClick={onLogout} className="w-full py-3 text-[#5B0F1A] text-xs uppercase tracking-[0.25em] border border-[#2A2A2A] hover:border-[#5B0F1A]" style={F.ui}>
            sign out
          </button>
        </div>

        <div className="text-center mt-12 mb-8">
          <div className="text-[#C9A961] text-3xl mb-2" style={F.brand}>Coven</div>
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
