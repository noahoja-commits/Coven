import { Component } from 'react';
import { logError } from '../lib/logError';

// Catches any render-time crash so a bug shows a recover screen instead of a black void
// (a missing import once took the whole app down). Two modes:
//   • no `fallback` prop → the full-page "reload to return" screen (top-level use).
//   • `fallback` prop → render it instead (a node, or (error, reset) => node) so a single
//     feature can fail to an inline retry without taking the whole app down.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  reset() { this.setState({ error: null }); }

  componentDidCatch(error, info) {
    // Keep a breadcrumb in the console + best-effort telemetry; never crash here.
    try { console.error('Coven crashed:', error, info?.componentStack); } catch { /* noop */ }
    try { logError(error?.message || 'render crash', { stack: error?.stack, where: this.props.label || 'ErrorBoundary' }); } catch { /* noop */ }
  }

  render() {
    if (this.state.error) {
      // Inline per-feature fallback (doesn't blank the whole app).
      if (this.props.fallback !== undefined) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback(this.state.error, this.reset)
          : this.props.fallback;
      }
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
