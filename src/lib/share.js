// Share a deep link to a piece of Coven. Uses the native share sheet when available,
// falls back to copying the link. `path` is a query string like `?u=spectre`.
// Returns 'shared' | 'copied' | 'cancelled'.
export async function shareCoven({ title = 'Coven', text = '', path = '' }) {
  const url = `${window.location.origin}/${path}`;
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      return 'shared';
    }
  } catch {
    return 'cancelled'; // user dismissed the sheet
  }
  try {
    await navigator.clipboard?.writeText(url);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}
