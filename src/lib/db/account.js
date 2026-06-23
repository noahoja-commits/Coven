import { supabase } from '../supabase';

// Permanently delete the current user's account via the service-role endpoint.
// The server verifies the bearer token and deletes only the verified user.
export async function deleteAccount() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('not signed in');
  const res = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('could not delete account');
  return true;
}
