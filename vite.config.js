import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Coven',
        short_name: 'Coven',
        description: 'a gathering place for the nocturnal',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        // Never serve the index.html navigation fallback for hashed build assets — if a
        // precache is mid-update, an asset request must 404/network, never return HTML
        // (which black-screens the app via a CSS/JS MIME mismatch). Defense-in-depth.
        navigateFallbackDenylist: [/^\/assets\//, /\.[a-f0-9]{8}\.(css|js)$/, /^\/sw-push\.js$/],
        // Load our push/notificationclick handlers into the generated SW.
        importScripts: ['/sw-push.js'],
        // The maplibre map chunk (~1MB) only loads on the map tab — don't precache it at
        // install; runtime-cache it on first open instead. Cuts the SW install payload ~1MB.
        globIgnores: ['**/RealMap-*.js', '**/RealMap-*.css'],
        // Precache only the static shell. NEVER cache Supabase auth/API/realtime —
        // serve them network-only so tokens & RLS-scoped data are always fresh.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/assets\/RealMap-[^/]*\.(js|css)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'coven-map', expiration: { maxEntries: 4 } },
          },
          {
            urlPattern: ({ url }) => url.hostname.endsWith('.supabase.co'),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  // maplibre-gl (the real map, lazy-loaded) ships BigInt literals, which the low
  // target below can't downlevel. Tell esbuild BigInt is fine: our own code uses no
  // BigInt, so this only affects the maplibre chunk — which only loads on browsers
  // that support BigInt anyway (and the stylized map covers everyone else).
  esbuild: { supported: { bigint: true } },
  build: {
    // Broaden device support: esbuild transpiles modern syntax (optional chaining,
    // nullish coalescing, logical assignment) down so older Android/Samsung browsers
    // (~2018-19) run the app, not just Vite's default Safari14/Chrome87 floor.
    target: ['es2019', 'safari12', 'chrome79', 'firefox68', 'edge79'],
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
