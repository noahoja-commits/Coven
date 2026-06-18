import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { GrainOverlay } from '../shared/Visuals';
import { useAuth } from '../../auth/AuthProvider';

export function SignInScreen() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || status === 'sending') return;
    setStatus('sending'); setError('');
    const { error } = await signInWithEmail(email.trim());
    if (error) { setStatus('error'); setError(error.message || 'something went wrong'); }
    else setStatus('sent');
  };

  return (
    <div className="phone-frame max-w-md mx-auto bg-[#0A0A0A] text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 28%, #1A0408 0%, #0A0204 60%, #050204 100%)'
      }} />
      <GrainOverlay opacity={0.06} />

      <div className="relative px-8 flex flex-col items-center justify-center min-h-[100dvh] text-center">
        <div className="text-[#C9A961] text-6xl mb-3 leading-none" style={F.brand}>Coven</div>
        <p className="text-[#A8A29E] text-sm mb-12" style={F.serif}>a gathering place for the nocturnal</p>

        {status === 'sent' ? (
          <div className="animate-fade-in">
            <div className="text-4xl mb-4">✟</div>
            <h2 className="text-[#F5F1E8] text-lg mb-2" style={F.display}>CHECK YOUR EMAIL</h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed" style={F.serif}>
              a sigil-link is on its way to<br /><span className="text-[#C9A961]">{email.trim()}</span>.
              <br />open it on this device to enter.
            </p>
            <button onClick={() => { setStatus('idle'); setEmail(''); }}
              className="mt-8 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
              use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full max-w-xs animate-fade-in">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968] mb-3" style={F.scriptureSC}>· enter ·</div>
            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 transition-colors">
              <Mail size={16} className="text-[#6B6B6B] shrink-0" />
              <input
                type="email" inputMode="email" autoComplete="email" autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your email"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]"
                style={F.serif} />
            </div>
            {status === 'error' && (
              <p className="text-[#8B0000] text-[11px] mt-2" style={F.ui}>{error}</p>
            )}
            <button type="submit" disabled={!valid || status === 'sending'}
              className="w-full mt-4 py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              style={F.ui}>
              {status === 'sending' ? <><Loader2 size={14} className="animate-spin" /> sending</> : 'send me a link'}
            </button>
            <p className="text-[10px] text-[#6B6B6B] mt-4 leading-relaxed" style={F.serif}>
              no password. we'll email you a one-time link to step inside.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
