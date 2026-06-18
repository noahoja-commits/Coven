import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { GrainOverlay } from '../shared/Visuals';
import { useAuth } from '../../auth/AuthProvider';

export function SignInScreen() {
  const { signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState('in'); // 'in' | 'up'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | working | confirm
  const [error, setError] = useState('');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passOk = password.length >= 6;
  const valid = emailOk && passOk;
  const isUp = mode === 'up';

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || status === 'working') return;
    setStatus('working'); setError('');
    const fn = isUp ? signUpWithPassword : signInWithPassword;
    const { data, error } = await fn(email.trim(), password);
    if (error) {
      setStatus('idle');
      setError(error.message || 'something went wrong');
      return;
    }
    // Sign-up with email confirmation still ON returns a user but no session.
    if (isUp && !data.session) { setStatus('confirm'); return; }
    // Otherwise AuthProvider's onAuthStateChange takes over and the app advances.
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

        {status === 'confirm' ? (
          <div className="animate-fade-in">
            <div className="text-4xl mb-4">✟</div>
            <h2 className="text-[#F5F1E8] text-lg mb-2" style={F.display}>CONFIRM YOUR EMAIL</h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed" style={F.serif}>
              we sent a confirmation to<br /><span className="text-[#C9A961]">{email.trim()}</span>.
              <br />confirm it, then come back and sign in.
            </p>
            <button onClick={() => { setStatus('idle'); setMode('in'); }}
              className="mt-8 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
              back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full max-w-xs animate-fade-in">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968] mb-3" style={F.scriptureSC}>
              · {isUp ? 'join the coven' : 'enter'} ·
            </div>

            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 transition-colors">
              <Mail size={16} className="text-[#6B6B6B] shrink-0" />
              <input
                type="email" inputMode="email" autoComplete="email" autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your email"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]"
                style={F.serif} />
            </div>

            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 mt-2 transition-colors">
              <Lock size={16} className="text-[#6B6B6B] shrink-0" />
              <input
                type="password" autoComplete={isUp ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="password"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]"
                style={F.serif} />
            </div>
            {isUp && password.length > 0 && !passOk && (
              <p className="text-[#6B6B6B] text-[10px] mt-1.5 text-left" style={F.ui}>at least 6 characters</p>
            )}
            {error && <p className="text-[#8B0000] text-[11px] mt-2" style={F.ui}>{error}</p>}

            <button type="submit" disabled={!valid || status === 'working'}
              className="w-full mt-4 py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              style={F.ui}>
              {status === 'working'
                ? <><Loader2 size={14} className="animate-spin" /> {isUp ? 'creating' : 'entering'}</>
                : (isUp ? 'create account' : 'enter')}
            </button>

            <button type="button" onClick={() => { setMode(isUp ? 'in' : 'up'); setError(''); }}
              className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
              {isUp ? 'already have an account? sign in' : 'new here? create an account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
