// Verify the caller's Supabase session JWT (from the Authorization: Bearer header)
// and return the authenticated user. Payment endpoints run with the service-role
// key (which bypasses RLS), so they MUST authenticate the caller here and act on
// the verified user id — never on a userId taken from the request body.
// Files prefixed with "_" are not exposed as routes by Vercel.
export async function verifyUser(req, supa) {
  const auth = req.headers.authorization || req.headers.Authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const { data, error } = await supa.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}
