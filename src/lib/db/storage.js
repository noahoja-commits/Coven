import { supabase } from '../supabase';

// Downscale + compress an image File via canvas before upload — phone photos are
// multi-MB and would be slow/expensive to store and load. The canvas re-encode
// also strips EXIF/GPS metadata as a side effect (a privacy feature — keep it).
// GIF passes through untouched: it has no EXIF/GPS container, and a canvas
// re-encode would flatten the animation for zero privacy gain.
async function compress(file, { maxEdge = 1600, quality = 0.82 } = {}) {
  if (!file || !file.type?.startsWith('image/')) throw new Error('not an image');
  if (file.type === 'image/gif') return file;
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

// Neutralize location/metadata atoms in MP4-family videos without re-encoding.
// Phone cameras write GPS into moov→udta ('©xyz' Apple, 'loci' 3GPP) and
// moov→meta (com.apple.quicktime.location.*). Renaming those boxes to 'free'
// (a standard skip box) hides them from every parser while keeping byte
// offsets intact — no remux, no quality loss, zero dependencies. Fail-open:
// any parse trouble returns the original file (the composer notice covers it).
// webm/ogg pass through — no standard GPS atom to strip.
async function stripVideoLocation(file) {
  const mp4Family = /^video\/(mp4|quicktime|x-m4v)$/i.test(file.type || '') || /\.(mp4|mov|m4v)$/i.test(file.name || '');
  if (!mp4Family) return file;
  try {
    const buf = await file.arrayBuffer();
    const dv = new DataView(buf);
    const bytes = new Uint8Array(buf);
    let changed = false;
    const fourcc = (o) => String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
    // Walk sibling boxes in [start, end). Inside moov (and its trak children),
    // rename udta/meta boxes in place; recurse only where those can live.
    const walk = (start, end, inMoov) => {
      let off = start;
      while (off + 8 <= end) {
        let size = dv.getUint32(off), header = 8;
        const type = fourcc(off + 4);
        if (size === 1) { // 64-bit largesize (never legit under the 30MB cap)
          if (off + 16 > end || dv.getUint32(off + 8) !== 0) return;
          size = dv.getUint32(off + 12); header = 16;
        } else if (size === 0) { size = end - off; } // box runs to EOF
        if (size < header || off + size > end) return; // malformed — stop, fail open
        if (inMoov && (type === 'udta' || type === 'meta')) {
          bytes[off + 4] = 0x66; bytes[off + 5] = 0x72; bytes[off + 6] = 0x65; bytes[off + 7] = 0x65; // 'free'
          changed = true;
        } else if (type === 'moov' || (inMoov && type === 'trak')) {
          walk(off + header, off + size, true);
        }
        off += size;
      }
    };
    walk(0, buf.byteLength, false);
    if (!changed) return file;
    return new File([buf], file.name || 'video.mp4', { type: file.type || 'video/mp4' });
  } catch {
    return file;
  }
}

// Compress, then upload to a public bucket. Returns the public URL.
// Upload a video as-is (no client-side compression — browsers can't transcode),
// but strip location metadata first (see stripVideoLocation).
// Hard size cap keeps the free Supabase storage/egress quota from blowing up.
export async function uploadVideo(bucket, keyPrefix, file) {
  if (!file) throw new Error('no file');
  if (!file.type?.startsWith('video/')) throw new Error('please choose a video');
  if (file.size > 30 * 1024 * 1024) throw new Error('video is too large (max 30MB) — trim it or lower the quality');
  const out = await stripVideoLocation(file);
  const ext = (file.name?.split('.').pop() || file.type.split('/')[1] || 'mp4').toLowerCase();
  const safeExt = ['mp4', 'webm', 'mov', 'm4v', 'ogg'].includes(ext) ? ext : 'mp4';
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${keyPrefix || 'anon'}/${Date.now()}-${rand}.${safeExt}`;
  const { error } = await supabase.storage.from(bucket).upload(path, out, {
    upsert: true, contentType: out.type || 'video/mp4', cacheControl: '3600',
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// keyPrefix is usually the owner/user id so paths are namespaced.
export async function uploadImage(bucket, keyPrefix, file) {
  if (!file) throw new Error('no file');
  if (!file.type?.startsWith('image/')) throw new Error('please choose an image');
  // SVG is rejected outright: it's scriptable (XSS surface on a public bucket),
  // and rasterizing it isn't safe either — compress() falls back to the ORIGINAL
  // file when canvas fails (e.g. foreignObject taints it), which would silently
  // upload the unsanitized markup. No legit phone photo is an SVG.
  if (file.type === 'image/svg+xml' || /\.svg$/i.test(file.name || '')) throw new Error("svg files can't be uploaded — use a png or jpg");
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

/** Upload an audio blob (voice note, audio post) to a public bucket. Returns the public URL. */
export async function uploadAudio(bucket, keyPrefix, file) {
  if (!file) throw new Error('no file');
  if (!file.type?.startsWith('audio/')) throw new Error('please choose an audio file');
  if (file.size > 5 * 1024 * 1024) throw new Error('audio is too large (max 5MB)');
  const ext = (file.name?.split('.').pop() || file.type.split('/')[1] || 'webm').toLowerCase();
  const safeExt = ['webm', 'ogg', 'mp3', 'm4a', 'wav', 'opus'].includes(ext) ? ext : 'webm';
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${keyPrefix || 'anon'}/${Date.now()}-${rand}.${safeExt}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true, contentType: file.type || 'audio/webm', cacheControl: '3600',
  });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
