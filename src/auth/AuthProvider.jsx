import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getProfileById } from '../lib/db/profiles';

const AuthCtx = createContext(null);
export function useAuth() { return useContext(AuthCtx); }

const DEV_BYPASS = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' && import.meta.env.DEV;
const DEV_USER_ID = '00000000-0000-0000-0000-000000000dev';
const DEV_SESSION = { user: { id: DEV_USER_ID, email: 'dev@local' } };
const DEV_PROFILE = {
  id: DEV_USER_ID, handle: 'devuser', avatar: null, avatar_url: null,
  bio: '', city: '', created_at: new Date().toISOString(),
  is_system: false, pronouns: '', scenes: [], tags: [], birthday: null,
};

export function AuthProvider({ children }) {
  const [session, setSession] = useState(DEV_BYPASS ? DEV_SESSION : null);
  const [dbProfile, setDbProfile] = useState(DEV_BYPASS ? DEV_PROFILE : null);
  const [loading, setLoading] = useState(!DEV_BYPASS);
  // True after the user lands via a password-recovery email link — the app then
  // shows the "set a new password" screen instead of the normal logged-in surface.
  const [recovery, setRecovery] = useState(false);

  const loadProfile = useCallback(async (uid) => {
    if (!uid) { setDbProfile(null); return; }
    try { setDbProfile(await getProfileById(uid)); }
    catch { setDbProfile(null); }
  }, []);

  useEffect(() => {
    if (DEV_BYPASS || !isSupabaseConfigured) { setLoading(false); return; }
    let active = true;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      // A corrupt/expired token (e.g. the account was deleted) — clear it so we
      // don't loop on failed refreshes; fall back to the sign-in screen.
      if (error) {
        try { await supabase.auth.signOut(); } catch { /* noop */ }
        setSession(null); setDbProfile(null); setLoading(false);
        return;
      }
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      // strip the magic-link token from the URL once parsed
      if (window.location.hash.includes('access_token')) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setLoading(false);
    })();

    // Defer profile loads out of the auth callback (supabase-js warns against
    // calling its own client synchronously inside onAuthStateChange).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (_event === 'PASSWORD_RECOVERY') setRecovery(true);
      setSession(sess);
      setTimeout(() => { if (active) loadProfile(sess?.user?.id); }, 0);
    });

    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const signInWithPassword = useCallback(
    (email, password) => supabase.auth.signInWithPassword({ email, password }),
    []
  );

  const signUpWithPassword = useCallback(
    (email, password) => supabase.auth.signUp({ email, password }),
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setDbProfile(null);
    setRecovery(false);
  }, []);

  // Send a password-reset email; the link returns to the app in recovery mode.
  const resetPasswordForEmail = useCallback(
    (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }),
    []
  );

  // Set a new password (valid while in recovery mode). Clears recovery on success.
  const updatePassword = useCallback(async (password) => {
    const res = await supabase.auth.updateUser({ password });
    if (!res.error) setRecovery(false);
    return res;
  }, []);

  const refreshProfile = useCallback(
    () => loadProfile(session?.user?.id),
    [loadProfile, session]
  );

  const value = {
    configured: isSupabaseConfigured,
    session,
    userId: session?.user?.id || null,
    dbProfile,
    loading,
    recovery,
    signInWithPassword,
    signUpWithPassword,
    resetPasswordForEmail,
    updatePassword,
    signOut,
    refreshProfile,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
