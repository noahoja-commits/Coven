import { supabase } from '../supabase';

// Downscale + compress an image File via canvas before upload — phone photos are
// multi-MB and would be slow/expensive to store and load. Animated/vector formats
// are passed through untouched.
async function compress(file, { maxEdge = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('not an image');
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  try {
    const dataUrl = await new Promise((res, rej) => {
      const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
    });
    const img = await new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = dataUrl;
    });
    let w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
    const scale = Math.min(1, maxEdge / Math.max(w, h));
    w = Math.round(w * scale); h = Math.round(h * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
    if (!blob) return file;
    const base = (file.name || 'image').replace(/\.\w+$/, '');
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
  } catch {
    return file; // if anything fails, fall back to the original
  }
}

// Compress, then upload to a public bucket. Returns the public URL.
// keyPrefix is usually the owner/user id so paths are namespaced.
export async function uploadImage(bucket, keyPrefix, file) {
  if (!file) throw new Error('no file');
  if (!file.type?.startsWith('image/')) throw new Error('please choose an image');
  if (file.size > 25 * 1024 * 1024) throw new Error('image is too large (max 25MB)');
  const out = await compress(file);
  const ext = out.type === 'image/jpeg' ? 'jpg' : (out.name?.split('.').pop() || 'png').toLowerCase();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${keyPrefix || 'anon'}/${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, out, {
    upsert: true, contentType: out.type || 'image/jpeg', cacheControl: '3600',
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
