// Generates the PWA/Apple icon PNGs from a vector sigil (gold waning crescent
// on #0A0A0A). Run: node scripts/gen-icons.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0A0A0A"/>
  <circle cx="256" cy="256" r="124" fill="#C9A961"/>
  <circle cx="300" cy="236" r="106" fill="#0A0A0A"/>
  <circle cx="322" cy="320" r="11" fill="#C9A961"/>
</svg>`;

const buf = Buffer.from(svg);
const out = 'public';
mkdirSync(out, { recursive: true });

const targets = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['pwa-512-maskable.png', 512], // crescent sits well within the maskable safe zone
  ['apple-touch-icon.png', 180],
];

for (const [name, size] of targets) {
  await sharp(buf).resize(size, size).png().toFile(`${out}/${name}`);
  console.log(`✓ ${out}/${name} (${size}px)`);
}
console.log('Done.');
