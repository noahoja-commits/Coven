import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { GrainOverlay } from '../shared/Visuals';
import { useAuth } from '../../auth/AuthProvider';

// Shown when the user arrives via a password-recovery email link (AuthProvider
// flips `recovery` on the PASSWORD_RECOVERY event). They set a new password here;
// on success `recovery` clears and the app falls through to the normal surface.
export function ResetPasswordScreen() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('idle'); // idle | working | done
  const [error, setError] = useState('');

  const passOk = password.length >= 6;
  const match = password === confirm;
  const valid = passOk && match;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || status === 'working') return;
    setStatus('working'); setError('');
    const { error } = await updatePassword(password);
    if (error) {
      setStatus('idle');
      setError(error.message || 'could not update password');
      return;
    }
    setStatus('done');
  };

  return (
    <div className="phone-frame max-w-md mx-auto bg-[#0A0A0A] text-[#F5F1E8] relative overflow-hidden min-h-[100dvh]">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 28%, #1A0408 0%, #0A0204 60%, #050204 100%)'
      }} />
      <GrainOverlay opacity={0.06} />

      <div className="relative px-8 flex flex-col items-center justify-center min-h-[100dvh] text-center">
        <div className="text-[#C9A961] text-6xl mb-3 leading-none" style={F.brand}>Coven</div>

        {status === 'done' ? (
          <div className="animate-fade-in">
            <div className="text-4xl mb-4">✟</div>
            <h2 className="text-[#F5F1E8] text-lg mb-2" style={F.display}>PASSWORD CHANGED</h2>
            <p className="text-[#A8A29E] text-sm" style={F.serif}>your new password is set. entering the coven…</p>
          </div>
        ) : (
          <form onSubmit={submit} className="w-full max-w-xs animate-fade-in">
            <div className="text-[10px] uppercase tracking-[0.3em] text-[#9E2A33] mb-3" style={F.scriptureSC}>· set a new password ·</div>

            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 transition-colors">
              <Lock size={16} className="text-[#6B6B6B] shrink-0" />
              <input type="password" autoComplete="new-password" autoFocus
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="new password"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]" style={F.serif} />
            </div>
            <div className="flex items-center gap-2 border border-[#2A2A2A] focus-within:border-[#5B0F1A] bg-[#0A0204] px-3 py-2.5 mt-2 transition-colors">
              <Lock size={16} className="text-[#6B6B6B] shrink-0" />
              <input type="password" autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="confirm new password"
                className="flex-1 bg-transparent outline-none text-[#F5F1E8] text-sm placeholder:text-[#4A4A4A]" style={F.serif} />
            </div>

            {password.length > 0 && !passOk && (
              <p className="text-[#6B6B6B] text-[10px] mt-1.5 text-left" style={F.ui}>at least 6 characters</p>
            )}
            {confirm.length > 0 && !match && (
              <p className="text-[#6B6B6B] text-[10px] mt-1.5 text-left" style={F.ui}>passwords don't match</p>
            )}
            {error && <p className="text-[#8B0000] text-[11px] mt-2" style={F.ui}>{error}</p>}

            <button type="submit" disabled={!valid || status === 'working'}
              className="w-full mt-4 py-3 bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] text-xs uppercase tracking-[0.25em] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              style={F.ui}>
              {status === 'working'
                ? <><Loader2 size={14} className="animate-spin" /> saving</>
                : 'set password'}
            </button>

            <button type="button" onClick={() => signOut()}
              className="mt-5 text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#A8A29E] transition-colors p-2" style={F.ui}>
              cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
