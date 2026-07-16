import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { F } from '../../styles/fonts';
import { STICKER_PACKS } from '../../data/stickers';
import { searchGifs } from '../../lib/db/gifs';

// A bottom-sheet media picker with two tabs: GIFs (Tenor, via the server proxy) and Stickers
// (built-in goth glyph packs). onPickGif(url) sends an image; onPickSticker(glyph) inserts a
// glyph into the composer. Used by both the DM composer and the post composer.
export function GifStickerPicker({ onPickGif, onPickSticker, onClose }) {
  const [tab, setTab] = useState('gif'); // 'gif' | 'stickers'
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState(null); // null = loading, [] = none, [...] = results
  const [err, setErr] = useState(null);
  const debounce = useRef(null);

  useEffect(() => {
    if (tab !== 'gif') return undefined;
    setGifs(null); setErr(null);
    if (debounce.current) clearTimeout(debounce.current);
    let on = true;
    debounce.current = setTimeout(() => {
      searchGifs(query.trim())
        .then(r => { if (on) setGifs(r); })
        .catch(e => { if (on) { setGifs([]); setErr(e.message || 'gifs unavailable'); } });
    }, query.trim() ? 350 : 0);
    return () => { on = false; if (debounce.current) clearTimeout(debounce.current); };
  }, [query, tab]);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-[#0F0F0F] border-t border-[#2A2A2A] w-full sm:max-w-md sm:mb-4 sm:border sm:rounded-none h-[62vh] flex flex-col animate-slide-up safe-pb" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-3 h-12 border-b border-[#1A1A1A] shrink-0">
          {[['gif', 'GIFs'], ['stickers', 'stickers']].map(([id, lbl]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`tap px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${tab === id ? 'text-[#C9A961] border-b border-[#C9A961]' : 'text-[#6B6B6B] hover:text-[#A8A29E]'}`}
              style={F.ui}>{lbl}</button>
          ))}
          <span className="flex-1" />
          <button onClick={onClose} className="tap p-2 text-[#A8A29E] hover:text-[#C9A961]"><X size={18} /></button>
        </div>

        {tab === 'gif' ? (
          <>
            <div className="px-3 py-2 shrink-0">
              <div className="flex items-center gap-2 bg-[#0A0A0A] border border-[#2A2A2A] px-2.5 focus-within:border-[#C9A961]/50">
                <Search size={14} className="text-[#6B6B6B]" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="search gifs…"
                  className="flex-1 bg-transparent outline-none py-2 text-[13px] text-[#F5F1E8] placeholder:text-[#6B6B6B]" style={F.ui} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-2">
              {gifs === null ? (
                <div className="flex items-center justify-center h-full text-[#6B6B6B]"><Loader2 size={18} className="animate-spin" /></div>
              ) : err ? (
                <div className="text-center pt-16 px-8 text-[11px] text-[#6B6B6B] italic" style={F.serif}>{err === 'gifs not configured' ? 'gifs aren’t set up yet.' : 'couldn’t reach the gifs — try again.'}</div>
              ) : gifs.length === 0 ? (
                <div className="text-center pt-16 text-[11px] text-[#6B6B6B] italic" style={F.serif}>nothing found.</div>
              ) : (
                <div className="columns-2 gap-2">
                  {gifs.map(g => (
                    <button key={g.id} onClick={() => onPickGif(g.url)} className="tap mb-2 block w-full overflow-hidden border border-transparent hover:border-[#C9A961]/60 transition-colors">
                      <img src={g.preview} alt={g.alt} loading="lazy" className="w-full" style={{ aspectRatio: `${g.w}/${g.h}` }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-3 py-1 text-[8px] text-[#3F3F3F] text-right shrink-0" style={F.ui}>via tenor</div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {STICKER_PACKS.map(pack => (
              <div key={pack.id} className="mb-4">
                <div className="text-[9px] uppercase tracking-[0.25em] text-[#C9A961]/70 mb-1.5" style={F.scriptureSC}>· {pack.label} ·</div>
                <div className="grid grid-cols-6 gap-1">
                  {pack.stickers.map((s, i) => (
                    <button key={pack.id + i} onClick={() => onPickSticker(s)}
                      className="tap aspect-square flex items-center justify-center text-2xl hover:bg-[#1A1A1A] rounded transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
