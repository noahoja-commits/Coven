// Mode registry — drives the picker (label + one-line vibe). Order = picker order.
// Lives apart from ShockOverlay.jsx so App/settings can read the registry without
// pulling the whole ~78 kB overlay implementation into the main bundle (it's lazy).
export const SHOCK_MODES = [
  { id: 'none', label: 'None', desc: 'pure brutalist base' },
  { id: 'lament', label: 'Lament', desc: 'a mourning letter · rain & candlelight · heartbreaking' },
  { id: 'egodeath', label: 'Ego Death', desc: 'the I dissolves · hypnotic vortex · the watching eye', secret: true },
  { id: 'paralysis', label: 'Sleep Paralysis', desc: 'pure horror · a wraith lunges from the dark', secret: true, transient: true },
  { id: 'insomnia', label: 'Insomnia', desc: 'electric blue · heartbeat · 3:33am' },
  { id: 'dead-channel', label: 'Dead Channel', desc: '1-bit dither · tracking roll · no signal' },
  { id: 'emergency', label: 'Emergency', desc: 'twin radar · alert ticker · infernal signal' },
  { id: 'spatter', label: 'Blood Rite', desc: 'spatter · running blood · pentagram' },
  { id: 'scream', label: 'The Scream', desc: 'convulse · cracks · red rings' },
  { id: 'glitch', label: 'Corruption', desc: 'rgb shudder · datamosh · 666' },
  { id: 'inferno', label: 'Pyre', desc: 'towering fire · embers · ash · smoke' },
  { id: 'void', label: 'Black Mass', desc: 'twin circles · portal vortex · ave satanas' },
  { id: 'cathedral', label: 'Sanctum', desc: 'god-rays · rose window · dust' },
  { id: 'rebirth', label: 'Rebirth', desc: 'poster · marquee · spinning 666' },
  { id: 'requiem', label: 'Requiem', desc: 'stark b&w · the weeping eye' },
  { id: 'mist', label: 'Mist', desc: 'sepia fog · a ghost · falling leaves' },
  { id: 'reliquary', label: 'Reliquary', desc: 'gothic arch · rose window · candles' },
  { id: 'alchemy', label: 'Alchemy', desc: 'twin orbits · planets · constellation' },
  { id: 'keepsake', label: 'Keepsake', desc: 'sepia collage · candlelight · torn paper' },
  { id: 'xerox', label: 'Xerox', desc: 'zine photocopy · toner streaks · lyrics' },
  { id: 'duotone', label: 'See No Evil', desc: 'blue riso · misregister · stencil' },
  { id: 'vow', label: 'The Vow', desc: 'black-metal filigree · glowing skull · till death' },
];
