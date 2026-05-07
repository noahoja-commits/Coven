import { useState } from 'react';
import { ChevronLeft, MessageCircle, Bookmark, Highlighter } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TEXTS, HIGHLIGHTS } from '../../data/library';

export function ReaderView({ textId, onBack }) {
  const text = TEXTS.find(t => t.id === textId);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [highlighted, setHighlighted] = useState({});
  const [selectedVerse, setSelectedVerse] = useState(null);

  if (!text) return null;
  const chapter = text.chapters[chapterIdx];

  return (
    <div className="absolute inset-0 z-50 animate-fade-in"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #EDE0C2 0%, #DDCDA8 65%, #B8A47C 100%)' }}>
      <div className="absolute inset-0 opacity-[0.06] mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.9\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(58, 34, 12, 0.25) 100%)'
      }} />
      <div className="absolute top-0 inset-x-0 z-10 bg-[#EDE0C2]/85 backdrop-blur-sm border-b border-[#8B6B4A]/30">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onBack} className="text-[#5B0F1A] flex items-center gap-1 -ml-1" style={F.scriptureSC}>
            <ChevronLeft size={18} /><span className="text-xs uppercase tracking-wider">Library</span>
          </button>
          <div className="text-[#2A1808] text-sm tracking-[0.2em]" style={F.scriptureSC}>{text.shortTitle.toUpperCase()}</div>
          <button className="text-[#5B0F1A]"><Bookmark size={16} /></button>
        </div>
      </div>
      <div className="absolute inset-0 pt-[60px] overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8">
          <div className="text-center mb-8">
            <div className="text-[#8B6B4A] text-[11px] uppercase tracking-[0.4em] mb-3" style={F.scriptureSC}>· {text.title} ·</div>
            <h1 className="text-[#2A1808] text-2xl sm:text-3xl mb-2" style={F.scripture}>{chapter.title}</h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-12 h-[1px] bg-[#8B6B4A]/50" />
              <span className="text-[#5B0F1A] text-base">{text.glyph}</span>
              <span className="w-12 h-[1px] bg-[#8B6B4A]/50" />
            </div>
          </div>
          <div className="space-y-4">
            {chapter.verses.map((v, i) => {
              const highlightKey = `${text.id}-${chapter.id}-${v.n}`;
              const isHighlighted = highlighted[highlightKey];
              const verseHighlights = HIGHLIGHTS[highlightKey];
              const isSelected = selectedVerse === highlightKey;
              return (
                <div key={i} className="relative group">
                  <p
                    onClick={() => setSelectedVerse(isSelected ? null : highlightKey)}
                    className={`cursor-pointer transition-colors ${isHighlighted ? 'bg-[#C9A961]/30' : ''}`}
                    style={{ ...F.scripture, fontSize: '17px', lineHeight: '1.8', color: '#2A1808' }}>
                    {i === 0 && v.text && (
                      <span className="float-left text-[64px] leading-[0.85] mr-2 mt-1 text-[#5B0F1A]" style={{ ...F.scripture, fontWeight: 'bold' }}>
                        {v.text.charAt(0)}
                      </span>
                    )}
                    {v.n > 0 && <span className="text-[#8B6B4A] text-[11px] mr-1.5 align-super" style={F.scriptureSC}>{v.n}</span>}
                    {i === 0 ? v.text.slice(1) : v.text}
                  </p>
                  {isSelected && (
                    <div className="mt-3 mb-4 px-4 py-3 bg-[#2A1808]/5 border-l-2 border-[#5B0F1A]/40 animate-fade-in">
                      <div className="flex gap-3 mb-3">
                        <button onClick={() => setHighlighted({ ...highlighted, [highlightKey]: !isHighlighted })}
                          className="flex items-center gap-1.5 text-[#5B0F1A] text-xs" style={F.scriptureSC}>
                          <Highlighter size={12} /> {isHighlighted ? 'unhighlight' : 'highlight'}
                        </button>
                        <button className="flex items-center gap-1.5 text-[#5B0F1A] text-xs" style={F.scriptureSC}>
                          <MessageCircle size={12} /> mark with thoughts
                        </button>
                      </div>
                      {verseHighlights && (
                        <div className="pt-3 border-t border-[#8B6B4A]/20 space-y-3">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B6B4A]" style={F.scriptureSC}>· marginalia from the coven ·</div>
                          {verseHighlights.map((h, idx) => (
                            <div key={idx} className="flex gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[#5B0F1A]/15 border border-[#5B0F1A]/30 flex items-center justify-center text-sm shrink-0">{h.avatar}</div>
                              <div className="flex-1">
                                <div className="text-[#5B0F1A] text-xs" style={F.scriptureSC}>{h.user}</div>
                                <p className="text-[#2A1808] text-sm italic mt-0.5" style={F.scripture}>"{h.comment}"</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-[#8B6B4A]" style={F.scriptureSC}>
                                  <span>♥ {h.likes}</span><span>·</span><span>{h.time}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-12 pt-8 border-t border-[#8B6B4A]/30 flex items-center justify-between">
            {chapterIdx > 0 ? (
              <button onClick={() => setChapterIdx(chapterIdx - 1)} className="text-[#5B0F1A] text-sm flex items-center gap-1" style={F.scriptureSC}>
                <ChevronLeft size={14} /> previous
              </button>
            ) : <span />}
            <span className="text-[#8B6B4A] text-[10px] uppercase tracking-[0.2em]" style={F.scriptureSC}>{chapterIdx + 1} of {text.chapters.length}</span>
            {chapterIdx < text.chapters.length - 1 ? (
              <button onClick={() => setChapterIdx(chapterIdx + 1)} className="text-[#5B0F1A] text-sm flex items-center gap-1" style={F.scriptureSC}>
                next →
              </button>
            ) : <span />}
          </div>
          <div className="mt-12 text-center">
            <span className="text-[#8B6B4A]/60 text-sm">· ☩ ·</span>
          </div>
        </div>
      </div>
    </div>
  );
}
