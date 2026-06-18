import { useState } from 'react';
import { ChevronLeft, MessageCircle, Bookmark, Highlighter } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TEXTS, HIGHLIGHTS } from '../../data/library';

export function ReaderView({ textId, onBack, marginalia = [], onAddMarginalia, onRemoveMarginalia, meHandle = 'you', meAvatar = '✟' }) {
  const isBookmarked = (verseKey) => marginalia.some(m => m.verseKey === verseKey && m.type === 'bookmark');
  const toggleBookmark = (verseKey, verseText, chapterTitle) => {
    const existing = marginalia.find(m => m.verseKey === verseKey && m.type === 'bookmark');
    if (existing) onRemoveMarginalia && onRemoveMarginalia(existing.id);
    else onAddMarginalia && onAddMarginalia({ verseKey, type: 'bookmark', verseText, chapterTitle });
  };
  const text = TEXTS.find(t => t.id === textId);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [selectedVerse, setSelectedVerse] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [composingFor, setComposingFor] = useState(null);

  if (!text) return null;
  const chapter = text.chapters[chapterIdx];

  // Build a map of my marginalia keyed by verse
  const myByVerse = marginalia.reduce((acc, m) => {
    acc[m.verseKey] = acc[m.verseKey] || [];
    acc[m.verseKey].push(m);
    return acc;
  }, {});

  const toggleHighlight = (verseKey) => {
    const existing = (myByVerse[verseKey] || []).find(m => m.type === 'highlight');
    if (existing) onRemoveMarginalia && onRemoveMarginalia(existing.id);
    else onAddMarginalia && onAddMarginalia({ verseKey, type: 'highlight', user: meHandle, avatar: meAvatar });
  };

  const saveNote = (verseKey) => {
    const body = noteDraft.trim();
    if (!body) return;
    onAddMarginalia && onAddMarginalia({ verseKey, type: 'note', body, user: meHandle, avatar: meAvatar });
    setNoteDraft('');
    setComposingFor(null);
  };

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
          <button onClick={onBack} className="text-[#5B0F1A] flex items-center gap-1 p-2 -m-1 transition-colors" style={F.scriptureSC}>
            <ChevronLeft size={20} /><span className="text-xs uppercase tracking-wider">Library</span>
          </button>
          <div className="text-[#2A1808] text-sm tracking-[0.2em]" style={F.scriptureSC}>{text.shortTitle.toUpperCase()}</div>
          <button className="text-[#5B0F1A] p-2 -m-1 transition-colors"><Bookmark size={16} /></button>
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
              const verseKey = `${text.id}-${chapter.id}-${v.n}`;
              const myMarks = myByVerse[verseKey] || [];
              const isHighlighted = myMarks.some(m => m.type === 'highlight');
              const myNotes = myMarks.filter(m => m.type === 'note');
              const verseHighlights = HIGHLIGHTS[verseKey];
              const isSelected = selectedVerse === verseKey;
              return (
                <div key={i} className="relative group">
                  <p
                    onClick={() => setSelectedVerse(isSelected ? null : verseKey)}
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
                      <div className="flex gap-3 mb-3 flex-wrap">
                        <button onClick={() => toggleHighlight(verseKey)}
                          className="flex items-center gap-1.5 text-[#5B0F1A] text-xs" style={F.scriptureSC}>
                          <Highlighter size={12} /> {isHighlighted ? 'unhighlight' : 'highlight'}
                        </button>
                        <button onClick={() => setComposingFor(composingFor === verseKey ? null : verseKey)}
                          className="flex items-center gap-1.5 text-[#5B0F1A] text-xs" style={F.scriptureSC}>
                          <MessageCircle size={12} /> mark with thoughts
                        </button>
                        <button onClick={() => toggleBookmark(verseKey, v.text, chapter.title)}
                          className="flex items-center gap-1.5 text-[#5B0F1A] text-xs" style={F.scriptureSC}>
                          <Bookmark size={12} fill={isBookmarked(verseKey) ? '#5B0F1A' : 'none'} /> {isBookmarked(verseKey) ? 'unsave' : 'save passage'}
                        </button>
                      </div>
                      {composingFor === verseKey && (
                        <div className="mb-3">
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="leave a thought in the margin..."
                            rows={2}
                            autoFocus
                            className="w-full bg-[#EDE0C2] border border-[#8B6B4A]/40 focus:border-[#5B0F1A] outline-none p-2 text-[#2A1808] text-sm italic resize-none"
                            style={F.scripture} />
                          <div className="flex gap-2 mt-1">
                            <button onClick={() => setComposingFor(null)}
                              className="text-[10px] uppercase tracking-wider text-[#8B6B4A] hover:text-[#5B0F1A] px-2 py-1" style={F.scriptureSC}>cancel</button>
                            <button onClick={() => saveNote(verseKey)} disabled={!noteDraft.trim()}
                              className="ml-auto text-[10px] uppercase tracking-wider bg-[#5B0F1A] text-[#EDE0C2] px-3 py-1 disabled:opacity-40" style={F.scriptureSC}>inscribe</button>
                          </div>
                        </div>
                      )}
                      {myNotes.length > 0 && (
                        <div className="pt-3 border-t border-[#8B6B4A]/20 space-y-2 mb-3">
                          <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B6B4A]" style={F.scriptureSC}>· your marginalia ·</div>
                          {myNotes.map((m) => (
                            <div key={m.id} className="flex gap-2.5 items-start">
                              <div className="w-7 h-7 rounded-full bg-[#C9A961]/20 border border-[#C9A961]/40 flex items-center justify-center text-sm shrink-0">{m.avatar}</div>
                              <div className="flex-1">
                                <p className="text-[#2A1808] text-sm italic" style={F.scripture}>"{m.body}"</p>
                              </div>
                              <button onClick={() => onRemoveMarginalia && onRemoveMarginalia(m.id)}
                                className="text-[10px] text-[#8B6B4A] hover:text-[#5B0F1A] uppercase tracking-wider" style={F.scriptureSC}>×</button>
                            </div>
                          ))}
                        </div>
                      )}
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
