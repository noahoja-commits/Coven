import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { logError } from './lib/logError.js';
import './index.css';

// Catch anything that escapes React (async throws, forgotten promise .catch). Observe only
// — never preventDefault, so the browser/devtools still see it. Best-effort breadcrumb.
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    try { logError(e?.message || 'window error', { stack: e?.error?.stack, where: 'window.error' }); } catch { /* noop */ }
  });
  window.addEventListener('unhandledrejection', (e) => {
    try { const r = e?.reason; logError(r?.message || String(r) || 'unhandled rejection', { stack: r?.stack, where: 'unhandledrejection' }); } catch { /* noop */ }
  });
}

// When a new service worker takes control (a fresh deploy), reload once so the
// new code applies immediately — no manual cache clear / reinstall. The PWA is
// configured with registerType:'autoUpdate' (skipWaiting + clientsClaim), so a
// new SW claims the page and fires 'controllerchange'. Guard against reload loops.
//
// IMPORTANT: on a first-ever visit the page starts UNCONTROLLED, and the freshly
// installed SW's clientsClaim also fires 'controllerchange' (null → SW). That is an
// install, not a deploy — reloading there would wipe in-progress input (e.g. the signup
// form) and any deep-link intent App.jsx already consumed. So skip that first,
// install-time takeover and only reload on genuine later updates.
if ('serviceWorker' in navigator) {
  let reloaded = false;
  let controlled = !!navigator.serviceWorker.controller; // false on a first, uncontrolled visit
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) { controlled = true; return; } // initial install claim — not a deploy
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
