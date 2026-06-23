import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';

// Two-step destructive confirm: the user must type "delete" before the button arms.
// onConfirm is async (calls the delete endpoint + signs out); errors surface inline
// and the user stays signed in so they can retry.
export function DeleteAccountModal({ onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const armed = text.trim().toLowerCase() === 'delete';

  const go = async () => {
    if (!armed || working) return;
    setWorking(true); setError('');
    try {
      await onConfirm();
      // success → caller signs out; modal unmounts with the app.
    } catch {
      setWorking(false);
      setError("couldn't delete your account — try again, or email noahoja@gmail.com.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#5B0F1A]/40 w-full max-w-xs p-5 animate-slide-up">
        <div className="text-[#8B0000] text-base tracking-[0.2em] mb-2" style={F.display}>DELETE ACCOUNT</div>
        <p className="text-[#A8A29E] text-sm leading-relaxed mb-4" style={F.serif}>
          This permanently erases your account, posts, messages, and everything tied to you. It cannot be undone.
        </p>
        <label className="block text-[10px] uppercase tracking-[0.2em] text-[#6B6B6B] mb-1.5" style={F.ui}>type “delete” to confirm</label>
        <input value={text} onChange={e => { setText(e.target.value); setError(''); }} disabled={working}
          placeholder="delete"
          className="w-full bg-[#0A0204] border border-[#2A2A2A] focus:border-[#8B0000] outline-none p-2.5 text-[#F5F1E8] text-sm disabled:opacity-60" style={F.serif} />
        {error && <p className="text-[#8B0000] text-[11px] mt-2" style={F.ui}>{error}</p>}
        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} disabled={working} className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#A8A29E] hover:text-[#F5F1E8] disabled:opacity-40" style={F.ui}>cancel</button>
          <button onClick={go} disabled={!armed || working}
            className="px-3 py-2 text-[10px] uppercase tracking-wider bg-[#8B0000] hover:bg-[#5B0F1A] text-[#F5F1E8] disabled:opacity-40 flex items-center gap-2" style={F.ui}>
            {working ? <><Loader2 size={12} className="animate-spin" /> deleting</> : 'delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
}
