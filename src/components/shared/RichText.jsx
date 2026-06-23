// Linkify #hashtags and @mentions in user-authored text. Pure function (no hooks) —
// safe to call inside any render. The @mention charset MATCHES the server regex in
// migration 0032 (notify_on_mention) so a rendered link targets exactly the handle
// that got notified. Missing a handler → that token renders as plain text.
export function renderRichText(text, { onOpenUser, onOpenHashtag } = {}) {
  if (!text) return null;
  const parts = String(text).split(/(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_.]+)/g);
  return parts.map((part, i) => {
    if (/^#[a-zA-Z0-9_]+$/.test(part)) {
      const tag = part.slice(1);
      if (!onOpenHashtag) return <span key={i}>{part}</span>;
      return (
        <button key={i} onClick={(e) => { e.stopPropagation(); onOpenHashtag(tag); }}
          className="text-[#A89968] hover:text-[#C9A961] hover:underline">{part}</button>
      );
    }
    if (/^@[a-zA-Z0-9_.]+$/.test(part)) {
      const handle = part.slice(1).replace(/\.$/, ''); // strip a trailing '.' for the nav target
      if (!onOpenUser || !handle) return <span key={i}>{part}</span>;
      return (
        <button key={i} onClick={(e) => { e.stopPropagation(); onOpenUser(handle); }}
          className="text-[#C9A961] hover:underline">{part}</button>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
