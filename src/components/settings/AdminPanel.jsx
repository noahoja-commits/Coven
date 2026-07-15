import { useEffect, useState } from 'react';
import { X, Loader2, RefreshCw } from 'lucide-react';
import { F } from '../../styles/fonts';
import { Avatar } from '../shared/Avatar';
import { relativeTime } from '../../lib/time';
import { fetchAdminPresence, fetchAdminReports, resolveReport, adminRemoveContent, adminUserAction } from '../../lib/db/admin';

const ONLINE_MS = 5 * 60 * 1000; // heartbeat is ~2 min; within 5 = "here now"

// One admin action button with a tap-again confirm (destructive actions only).
function ActionBtn({ label, confirmLabel, onRun, tone = 'gold' }) {
  const [arm, setArm] = useState(false);
  const [busy, setBusy] = useState(false);
  const colors = tone === 'red'
    ? 'border-[#5B0F1A] text-[#9E2A33] hover:border-[#9E2A33]'
    : 'border-[#2A2A2A] text-[#A8A29E] hover:border-[#C9A961]/60 hover:text-[#C9A961]';
  const run = async () => {
    if (busy) return;
    if (confirmLabel && !arm) { setArm(true); setTimeout(() => setArm(false), 3000); return; }
    setBusy(true);
    try { await onRun(); } finally { setBusy(false); setArm(false); }
  };
  return (
    <button onClick={run} disabled={busy}
      className={`tap px-2 py-1 text-[9px] uppercase tracking-[0.15em] border transition-colors ${colors}`} style={F.ui}>
      {busy ? <Loader2 size={10} className="animate-spin" /> : (arm ? (confirmLabel || label) : label)}
    </button>
  );
}

export function AdminPanel({ meId, onClose, onToast, onOpenUser }) {
  const [tab, setTab] = useState('souls'); // 'souls' | 'reports'
  const [souls, setSouls] = useState(null); // null = loading
  const [reports, setReports] = useState(null);

  const load = () => {
    fetchAdminPresence().then(setSouls).catch(() => setSouls([]));
    fetchAdminReports().then(setReports).catch(() => setReports([]));
  };
  useEffect(load, []);

  const act = async (fn, okMsg) => {
    try { await fn(); onToast && onToast(okMsg); load(); }
    catch (e) { onToast && onToast(e.message || 'that failed — try again.', 'error'); }
  };

  const now = Date.now();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-[#0F0F0F] border border-[#2A2A2A] w-full sm:max-w-md sm:m-4 h-[92vh] sm:h-[80vh] flex flex-col animate-slide-up safe-pb">
        <div className="px-4 h-[60px] flex items-center justify-between border-b border-[#1A1A1A] shrink-0">
          <div className="text-[#F5F1E8] text-base tracking-[0.25em]" style={F.display}>INNER SANCTUM</div>
          <div className="flex items-center gap-1">
            <button onClick={load} className="tap p-2 text-[#A8A29E] hover:text-[#C9A961] transition-colors" title="refresh"><RefreshCw size={16} /></button>
            <button onClick={onClose} className="tap p-2 -mr-1 text-[#A8A29E] hover:text-[#C9A961] transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="flex border-b border-[#1A1A1A] shrink-0">
          {[['souls', 'souls'], ['reports', `reports${reports?.length ? ` · ${reports.length}` : ''}`]].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${tab === id ? 'text-[#C9A961] border-b border-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
              style={F.ui}>{lbl}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'souls' && (
            souls === null ? <div className="py-16 text-center text-[#6B6B6B] text-xs" style={F.serif}>summoning…</div>
            : souls.length === 0 ? <div className="py-16 text-center text-[#6B6B6B] text-sm italic px-8" style={F.serif}>no souls have checked in yet — presence starts recording once this update ships.</div>
            : souls.map(s => {
              const online = now - new Date(s.lastSeenAt).getTime() < ONLINE_MS;
              const banned = s.bannedUntil && new Date(s.bannedUntil).getTime() > now;
              return (
                <div key={s.userId} className="px-4 py-3 flex items-center gap-3 border-b border-[#141414]">
                  <button onClick={() => onOpenUser && onOpenUser(s.handle)} className="tap shrink-0">
                    <Avatar url={s.avatarUrl} glyph={s.avatar} size={34} className={`ring-1 ${banned ? 'ring-[#5B0F1A] opacity-50' : 'ring-[#2A2A2A]'}`} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate flex items-center gap-1.5" style={F.ui}>
                      {online && <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#C9A961] shrink-0" title="here now" />}
                      <span className="truncate">{s.handle}</span>
                      {s.isAdmin && <span className="text-[8px] uppercase tracking-[0.15em] text-[#C9A961]/70 border border-[#C9A961]/40 px-1 shrink-0">admin</span>}
                      {banned && <span className="text-[8px] uppercase tracking-[0.15em] text-[#9E2A33] border border-[#5B0F1A] px-1 shrink-0">banished</span>}
                    </div>
                    <div className="text-[10px] text-[#6B6B6B] truncate" style={F.mono}>
                      {online ? 'here now' : `seen ${relativeTime(s.lastSeenAt)}`}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <ActionBtn label="sign out" confirmLabel="confirm?" onRun={() => act(() => adminUserAction('signout', s.userId), `${s.handle} signed out everywhere.`)} />
                    {s.userId !== meId && (banned
                      ? <ActionBtn label="unban" onRun={() => act(() => adminUserAction('unban', s.userId), `${s.handle} unbanished.`)} />
                      : <ActionBtn label="banish" confirmLabel="banish?" tone="red" onRun={() => act(() => adminUserAction('ban', s.userId), `${s.handle} banished + signed out.`)} />)}
                  </div>
                </div>
              );
            })
          )}

          {tab === 'reports' && (
            reports === null ? <div className="py-16 text-center text-[#6B6B6B] text-xs" style={F.serif}>summoning…</div>
            : reports.length === 0 ? <div className="py-16 text-center text-[#6B6B6B] text-sm italic px-8" style={F.serif}>the queue is empty. nothing needs your judgment.</div>
            : reports.map(r => (
              <div key={r.id} className="px-4 py-3 border-b border-[#141414]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[8px] uppercase tracking-[0.15em] text-[#C9A961]/70 border border-[#C9A961]/40 px-1">{r.kind}</span>
                  {r.count > 1 && <span className="text-[9px] text-[#9E2A33]" style={F.mono}>×{r.count} reporters</span>}
                  <span className="text-[9px] text-[#6B6B6B] ml-auto" style={F.mono}>{relativeTime(r.createdAt)}</span>
                </div>
                {r.handle && (
                  <button onClick={() => onOpenUser && onOpenUser(r.handle)} className="tap text-[#A8A29E] text-xs hover:text-[#C9A961]" style={F.ui}>{r.handle}</button>
                )}
                {r.preview && <p className="text-[11px] text-[#A8A29E] mt-0.5 line-clamp-2" style={F.serif}>{r.preview}</p>}
                {r.reason && <p className="text-[10px] text-[#6B6B6B] italic mt-0.5" style={F.serif}>“{r.reason}”</p>}
                <div className="flex gap-1.5 mt-2">
                  {r.kind === 'post' && (
                    <ActionBtn label="remove post" confirmLabel="delete forever?" tone="red"
                      onRun={() => act(async () => { await adminRemoveContent('post', r.targetId); await resolveReport(r.id); }, 'post removed.')} />
                  )}
                  <ActionBtn label="dismiss" onRun={() => act(() => resolveReport(r.id), 'report dismissed.')} />
                </div>
              </div>
            ))
          )}
        </div>

        <p className="px-4 py-2 text-[9px] text-[#6B6B6B] italic border-t border-[#1A1A1A] shrink-0" style={F.serif}>
          hacked account? banish + sign out kills their sessions now; logins stay blocked until unbanned. access tokens already issued die within the hour.
        </p>
      </div>
    </div>
  );
}
