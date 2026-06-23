import { ChevronLeft, ChevronRight } from 'lucide-react';
import { F } from '../../styles/fonts';
import { setHaptics } from '../../lib/haptics';

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

function Segmented({ value, onChange, options }) {
  return (
    <div className="flex border border-[#2A2A2A] divide-x divide-[#2A2A2A]">
      {options.map(([val, label]) => (
        <button key={val} onClick={() => onChange(val)}
          className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors ${value === val ? 'bg-[#8B0000] text-[#F5F1E8]' : 'text-[#A8A29E] hover:text-[#F5F1E8]'}`}
          style={F.ui}>
          {label}
        </button>
      ))}
    </div>
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

export function SettingsScreen({ settings, onChange, onToggleSound, onBack, onLogout, onRerunOnboarding, mutedKeywords = [], onSetMutedKeywords, payoutStatus, payoutBusy = false, onSetupPayouts, pushState = 'off', onEnablePush, onDisablePush, onEditProfile, onOpenBlocked, onOpenLegal, onDeleteAccount }) {
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
      <div className="bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#1A1A1A] safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#A8A29E] hover:text-[#F5F1E8] transition-colors flex items-center gap-1 -ml-1" style={F.ui}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">back</span>
          </button>
          <div className="text-[#F5F1E8] text-base tracking-[0.3em]" style={F.display}>SETTINGS</div>
          <span className="w-12" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4 safe-pb">
        <Section title="appearance">
          <Row label="Parchment mode" desc="invert the world. cream & oxblood for daylight reading.">
            <Toggle on={settings.parchmentMode} onChange={v => set('parchmentMode', v)} />
          </Row>
          <Row label="Film grain" desc="texture overlay. atmospheric.">
            <Slider value={settings.grainIntensity} onChange={v => set('grainIntensity', v)} min={0} max={0.2} step={0.01} />
          </Row>
          <Row label="Grain style" desc="fine film noise, or a coarse halftone print screen.">
            <Segmented value={settings.grainStyle || 'fine'} onChange={v => set('grainStyle', v)}
              options={[['fine', 'fine'], ['print', 'print']]} />
          </Row>
          <Row label="Media treatment" desc="filter photos like a lookbook. noir, or oxblood duotone.">
            <Segmented value={settings.mediaTreatment || 'none'} onChange={v => set('mediaTreatment', v)}
              options={[['none', 'none'], ['noir', 'noir'], ['oxblood', 'blood']]} />
          </Row>
          <Row label="Vignette" desc="dark edges around the screen.">
            <Toggle on={settings.vignette} onChange={v => set('vignette', v)} />
          </Row>
          <Row label="Color mood" desc="wash the whole app in a mood.">
            <Segmented
              value={settings.colorMood || 'none'}
              onChange={v => set('colorMood', v)}
              options={[['none', 'none'], ['bloodMoon', 'blood'], ['ash', 'ash']]}
            />
          </Row>
        </Section>

        <Section title="atmosphere">
          <Row label="Living theme" desc="the app keeps vampire hours — darker after midnight, faint grey at dawn, deepest at 3am. posts fade as they age.">
            <Toggle on={settings.livingTheme !== false} onChange={v => set('livingTheme', v)} />
          </Row>
          <Row label="Ambient glow" desc="a slow ember light breathes behind the dark. candlelit.">
            <Toggle on={settings.ambientGlow !== false} onChange={v => set('ambientGlow', v)} />
          </Row>
          <Row label="The familiar" desc="a small black cat pads around the screen. tap to feed it.">
            <Toggle on={settings.familiar !== false} onChange={v => set('familiar', v)} />
          </Row>
          <Row label="Weather mood" desc="tint the app with the weather outside.">
            <Toggle on={settings.weatherMood} onChange={v => set('weatherMood', v)} />
          </Row>
          <Row label="Sound on" desc="a low ambient drone while you wander. turn up your volume — on iPhone, flip the side silent switch off.">
            <Toggle on={settings.soundOn} onChange={v => (onToggleSound ? onToggleSound(v) : set('soundOn', v))} />
          </Row>
          <Row label="Haptics" desc="a faint buzz when you react, like, or keep the rite. (android/chrome; iphone ignores it.)">
            <Toggle on={settings.haptics !== false} onChange={v => { set('haptics', v); setHaptics(v); }} />
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
          <Row label="Ghost mode" desc="go invisible — pull your tonight status and map pin so no one can see where you are.">
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
          <Row label="Push to this device"
            desc={
              pushState === 'on' ? 'on — you\'ll be summoned even when the app is closed.'
              : pushState === 'denied' ? 'blocked. enable notifications for Coven in your device Settings, then return.'
              : pushState === 'unsupported' ? 'on iPhone: add Coven to your Home Screen and open it from there (iOS 16.4+).'
              : 'off — get whispered to when someone reaches for you.'
            }>
            {pushState === 'on' ? (
              <Toggle on onChange={() => onDisablePush && onDisablePush()} />
            ) : pushState === 'denied' || pushState === 'unsupported' ? (
              <span className="text-[9px] uppercase tracking-[0.18em] text-[#5B0F1A]" style={F.ui}>
                {pushState === 'denied' ? 'blocked' : 'install'}
              </span>
            ) : (
              <Toggle on={false} onChange={() => onEnablePush && onEnablePush()} />
            )}
          </Row>
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
          <Row label="Quiet hours">
            <Toggle on={settings.quietHours?.enabled || false} onChange={v => set('quietHours', { ...(settings.quietHours || { start: '22:00', end: '08:00' }), enabled: v })} />
          </Row>
          {settings.quietHours?.enabled && (
            <div className="px-4 pb-3 flex items-center gap-2 text-[11px] text-[#A8A29E]" style={F.ui}>
              <span>from</span>
              <input type="time" value={settings.quietHours?.start || '22:00'} onChange={e => set('quietHours', { ...settings.quietHours, start: e.target.value })}
                className="bg-[#0A0A0A] border border-[#2A2A2A] px-2 py-1 text-[#F5F1E8]" />
              <span>to</span>
              <input type="time" value={settings.quietHours?.end || '08:00'} onChange={e => set('quietHours', { ...settings.quietHours, end: e.target.value })}
                className="bg-[#0A0A0A] border border-[#2A2A2A] px-2 py-1 text-[#F5F1E8]" />
            </div>
          )}
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
                <button onClick={onSetupPayouts} disabled={payoutBusy}
                  className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] transition-colors disabled:opacity-60 disabled:cursor-wait" style={F.ui}>
                  {payoutBusy ? 'opening Stripe…' : (payoutStatus?.hasAccount ? 'finish payout setup' : 'set up payouts')}
                </button>
              </>
            )}
          </div>
        </Section>

        <Section title="account">
          {[
            { label: 'Edit profile', onClick: onEditProfile },
            { label: 'Privacy & blocked', onClick: onOpenBlocked },
            { label: 'Terms, Privacy & Guidelines', onClick: onOpenLegal },
            { label: 'Help & feedback', onClick: () => { window.location.href = 'mailto:noahoja@gmail.com?subject=Coven%20feedback'; } },
          ].map(item => (
            <button key={item.label} onClick={item.onClick}
              className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-[#0F0F0F] transition-colors">
              <span className="flex-1 text-[#F5F1E8] text-sm" style={F.serif}>{item.label}</span>
              <ChevronRight size={16} className="text-[#3F3F3F]" />
            </button>
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
          {onDeleteAccount && (
            <button onClick={onDeleteAccount} className="w-full py-3 text-[#8B0000] text-[10px] uppercase tracking-[0.25em] hover:text-[#5B0F1A]" style={F.ui}>
              delete account
            </button>
          )}
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
  grainIntensity: 0.12,
  grainStyle: 'fine',
  mediaTreatment: 'none',
  vignette: true,
  colorMood: 'none',
  weatherMood: false,
  soundOn: false,
  tarotEnabled: true,
  vespersEnabled: true,
  vigilEnabled: true,
  mementoMori: true,
  mementoExpected: false,
  ghostMode: false,
  haptics: true,
  ambientGlow: true,
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
};
