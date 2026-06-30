import { useState, useEffect } from 'react';
import { F } from '../../styles/fonts';
import { fetchLinkPreview } from '../../lib/linkPreview';

// Renders an Open Graph card for a URL found in a post body. Self-fetching + cached;
// renders nothing until a preview with a title comes back (so a failed/blocked fetch
// just shows the plain link in the body, nothing broken).
export function LinkPreviewCard({ url }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let on = true;
    setData(null);
    if (!url) return undefined;
    fetchLinkPreview(url).then(d => { if (on && d && d.title) setData(d); }).catch(() => {});
    return () => { on = false; };
  }, [url]);

  if (!data) return null;
  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { /* noop */ }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow"
      onClick={(e) => e.stopPropagation()}
      className="block mt-2 border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#C9A961]/40 transition-colors bg-[#0F0F0F]">
      {data.image && (
        <div className="aspect-[1.91/1] bg-[#141414] overflow-hidden">
          <img src={data.image} alt="" loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-2.5">
        <div className="text-[10px] uppercase tracking-wider text-[#6B6B6B] mb-0.5" style={F.ui}>{data.siteName || host}</div>
        <div className="text-sm text-[#F5F1E8] line-clamp-2 leading-snug" style={F.ui}>{data.title}</div>
        {data.description && <div className="text-xs text-[#A8A29E] line-clamp-2 mt-1" style={F.serif}>{data.description}</div>}
      </div>
    </a>
  );
}
