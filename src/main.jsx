import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './index.css';

// When a new service worker takes control (a fresh deploy), reload once so the
// new code applies immediately — no manual cache clear / reinstall. The PWA is
// configured with registerType:'autoUpdate' (skipWaiting + clientsClaim), so a
// new SW claims the page and fires 'controllerchange'. Guard against reload loops.
if ('serviceWorker' in navigator) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
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
