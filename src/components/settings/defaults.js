// Default app settings. Lives apart from SettingsScreen.jsx so App can seed
// localStorage without pulling the whole settings UI into the main bundle (it's lazy).
export const DEFAULT_SETTINGS = {
  parchmentMode: false,
  grainIntensity: 0.12,
  grainStyle: 'fine',
  mediaTreatment: 'none',
  vignette: true,
  colorMood: 'none',
  shockMode: 'none',
  quickSwitch: true,
  shakeShuffle: true,
  reactiveTaps: true,
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
  livingTheme: true,
  familiar: true,
  myspaceProfile: false, // opt-in retro two-column profile layout (goth-styled MySpace)
  quietHours: { enabled: false, start: '22:00', end: '08:00' },
};
