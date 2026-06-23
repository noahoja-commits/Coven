// A single unsent post draft, persisted to localStorage (matches the useLocalStorage
// `coven:v1:` prefix). Media isn't saved — File objects can't serialize.
const KEY = 'coven:v1:postDraft';

const hasContent = (o) => !!(o && (String(o.text || '').trim() || (o.poll && o.poll.options?.some(x => String(x).trim()))));

export function saveDraft(obj) {
  try {
    if (hasContent(obj)) localStorage.setItem(KEY, JSON.stringify({ text: obj.text || '', community: obj.community, anonymous: !!obj.anonymous, poll: obj.poll || null }));
    else localStorage.removeItem(KEY);
  } catch { /* noop */ }
}

export function loadDraft() {
  try { const v = localStorage.getItem(KEY); const o = v ? JSON.parse(v) : null; return hasContent(o) ? o : null; }
  catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}
