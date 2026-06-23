import { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { GrainOverlay } from '../shared/Visuals';
import { useAuth } from '../../auth/AuthProvider';
import { LegalScreen } from '../legal/LegalScreen';

export function SignInScreen() {
  const { signInWithPassword, signUpWithPassword, resetPasswordForEmail } = useAuth();
  const [mode, setMode] = useState('in'); // 'in' | 'up' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle | working | confirm | sent
  const [error, setError] = useState('');
  const [legal, setLegal] = useState(null); // null | 'terms' | 'privacy'

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const passOk = password.length >= 6;
  const isUp = mode === 'up';
  const isReset = mode === 'reset';
  const valid = isReset ? emailOk : (emailOk && passOk);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || status === 'working') return;
    setStatus('working'); setError('');

    if (isReset) {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) { setStatus('idle'); setError(error.message || 'could not send reset email'); return; }
      setStatus('sent');
      return;
    }

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

        {status === 'confirm' || status === 'sent' ? (
          <div className="animate-fade-in">
            <div className="text-4xl mb-4">✟</div>
            <h2 className="text-[#F5F1E8] text-lg mb-2" style={F.display}>
              {status === 'sent' ? 'CHECK YOUR EMAIL' : 'CONFIRM YOUR EMAIL'}
            </h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed" style={F.serif}>
              {status === 'sent' ? 'we sent a password reset link to' : 'we sent a confirmation to'}
              <br /><span className="text-[#C9A961]">{email.trim()}</span>.
              <br />{status === 'sent' ? 'open it to set a new password.' : 'confirm it, then come back and sign in.'}
            </p>
            <button onClick={() => { setStatus('idle'); setMode('in'); }}
              className="mt-8 text-[10px] uppercase tracking-[0.25em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
              back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full max-w-xs animate-fade-in">
            {isReset ? (
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#C8102E] mb-4" style={F.scriptureSC}>· reset password ·</div>
            ) : (
              <div className="flex border border-[#2A2A2A] mb-5">
                <button type="button" onClick={() => { setMode('in'); setError(''); }}
                  className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${!isUp ? 'bg-[#5B0F1A] text-[#F5F1E8]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
                  style={F.ui}>sign in</button>
                <button type="button" onClick={() => { setMode('up'); setError(''); }}
                  className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${isUp ? 'bg-[#5B0F1A] text-[#F5F1E8]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
                  style={F.ui}>create account</button>
              </div>
            )}

            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 transition-colors">
              <Mail size={16} className="text-[#6B6B6B] shrink-0" />
              <input
                type="email" inputMode="email" autoComplete="email" autoFocus
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your email"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]"
                style={F.serif} />
            </div>

            {!isReset && (
              <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 mt-2 transition-colors">
                <Lock size={16} className="text-[#6B6B6B] shrink-0" />
                <input
                  type="password" autoComplete={isUp ? 'new-password' : 'current-password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="password"
                  className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]"
                  style={F.serif} />
              </div>
            )}
            {isUp && password.length > 0 && !passOk && (
              <p className="text-[#6B6B6B] text-[10px] mt-1.5 text-left" style={F.ui}>at least 6 characters</p>
            )}
            {error && <p className="text-[#8B0000] text-[11px] mt-2" style={F.ui}>{error}</p>}
            {!isUp && !isReset && /invalid login/i.test(error) && (
              <button type="button" onClick={() => { setMode('up'); setError(''); }}
                className="mt-2 text-[11px] text-[#C9A961] hover:text-[#F5F1E8] underline block mx-auto transition-colors" style={F.ui}>
                no account with that email? create one →
              </button>
            )}

            <button type="submit" disabled={!valid || status === 'working'}
              className="w-full mt-4 py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              style={F.ui}>
              {status === 'working'
                ? <><Loader2 size={14} className="animate-spin" /> {isReset ? 'sending' : isUp ? 'creating' : 'entering'}</>
                : (isReset ? 'send reset link' : isUp ? 'create account' : 'enter')}
            </button>

            {mode === 'in' && (
              <button type="button" onClick={() => { setMode('reset'); setError(''); }}
                className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-1 block mx-auto" style={F.ui}>
                forgot your password?
              </button>
            )}

            {isReset && (
              <button type="button" onClick={() => { setMode('in'); setError(''); }}
                className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
                back to sign in
              </button>
            )}

            {!isReset && (
              <p className="mt-7 text-[10px] leading-relaxed text-[#6B6B6B]" style={F.ui}>
                by continuing you agree to our{' '}
                <button type="button" onClick={() => setLegal('terms')} className="text-[#C8102E] underline">Terms</button>{' '}and{' '}
                <button type="button" onClick={() => setLegal('privacy')} className="text-[#C8102E] underline">Privacy Policy</button>.
              </p>
            )}
          </form>
        )}
      </div>
      {legal && <LegalScreen initialDoc={legal} onBack={() => setLegal(null)} />}
    </div>
  );
}
