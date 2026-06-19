import { Component } from 'react';

// Catches any render-time crash so a bug shows a recover screen instead of a
// black void (a missing import once took the whole app down). Resets on reload.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Keep a breadcrumb in the console for debugging; never crash here.
    try { console.error('Coven crashed:', error, info?.componentStack); } catch { /* noop */ }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100dvh', background: '#0A0A0A', color: '#F5F1E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '2rem', flexDirection: 'column', gap: '1rem',
        }}>
          <div style={{ fontFamily: 'Cinzel, Georgia, serif', fontSize: '2.5rem', color: '#C9A961' }}>Coven</div>
          <p style={{ color: '#A8A29E', fontStyle: 'italic', maxWidth: '20rem' }}>
            something broke in the dark. reload to return.
          </p>
          <button
            onClick={() => { try { window.location.reload(); } catch { /* noop */ } }}
            style={{
              marginTop: '0.5rem', padding: '0.6rem 1.4rem', background: '#8B0000', color: '#F5F1E8',
              border: 'none', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '0.75rem', cursor: 'pointer',
            }}>
            reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
