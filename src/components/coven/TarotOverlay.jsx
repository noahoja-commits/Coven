import { useState, useEffect } from 'react';
import { ArrowLeft, Shuffle, Clock, Send } from 'lucide-react';
import { F } from '../../styles/fonts';
import { TAROT_DECK, getDailyCard } from '../../data/tarot';

function CardFace({ card, reversed, large = false }) {
  return (
    <div
      className={`relative mx-auto border-2 border-[#A89968]/40 ${large ? 'w-[260px] h-[400px]' : 'w-[200px] h-[300px]'} flex flex-col items-center justify-between p-4`}
      style={{
        background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)',
        transform: reversed ? 'rotate(180deg)' : 'none',
        boxShadow: '0 0 40px rgba(201, 169, 97, 0.15)',
      }}
    >
      <div className="absolute inset-0 m-2 border border-[#A89968]/20 pointer-events-none" />
      <div className="text-[#A89968] text-xs uppercase tracking-[0.3em]" style={F.scriptureSC}>
        {card.type === 'major' ? `· ${String(card.id).padStart(2, '0')} ·` : '· minor ·'}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="text-[#C9A961] text-6xl" style={{ filter: 'drop-shadow(0 0 8px rgba(201, 169, 97, 0.3))' }}>
          {card.symbol || (card.suit === 'wands' ? '🜂' : card.suit === 'cups' ? '🜄' : card.suit === 'swords' ? '🜁' : '🜃')}
        </div>
        <div className="text-[#F5F1E8] text-center text-base leading-tight px-2" style={F.scripture}>
          {card.name}
        </div>
      </div>
      <div className="text-[#A89968] text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>
        · the deck ·
      </div>
    </div>
  );
}

export function TarotOverlay({ onClose, history = {}, onRecord, onLogDivination, divinationLog = [], onShare }) {
  const [pull, setPull] = useState(() => getDailyCard());
  const [mode, setMode] = useState('daily'); // 'daily' | 'browse' | 'history'

  // Record today's daily on first open if not already recorded
  const todayKey = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (!history[todayKey]) {
      const daily = getDailyCard();
      onRecord && onRecord(todayKey, { card: daily.card.name, reversed: daily.reversed, symbol: daily.card.symbol });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reshuffle = () => {
    const idx = Math.floor(Math.random() * TAROT_DECK.length);
    const reversed = Math.random() < 0.33;
    setPull({ card: TAROT_DECK[idx], reversed });
  };

  const [browseCard, setBrowseCard] = useState(null);
  const [oracleQ, setOracleQ] = useState('');
  const [oracleAnswer, setOracleAnswer] = useState(null);
  const drawOracle = () => {
    if (!oracleQ.trim()) return;
    const idx = Math.floor(Math.random() * TAROT_DECK.length);
    const result = { card: TAROT_DECK[idx], reversed: Math.random() < 0.4 };
    setOracleAnswer(result);
    onLogDivination && onLogDivination({ kind: 'oracle', question: oracleQ.trim(), answer: `${result.card.name}${result.reversed ? ' · reversed' : ''}` });
  };
  const resetOracle = () => { setOracleQ(''); setOracleAnswer(null); };

  const [spread, setSpread] = useState(null);
  const drawSpread = () => {
    const seen = new Set();
    const cards = [];
    while (cards.length < 3) {
      const idx = Math.floor(Math.random() * TAROT_DECK.length);
      if (seen.has(idx)) continue;
      seen.add(idx);
      cards.push({ card: TAROT_DECK[idx], reversed: Math.random() < 0.33 });
    }
    setSpread(cards);
  };

  const historyEntries = Object.entries(history)
    .map(([date, c]) => ({ date, ...c }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto safe-pb"
      style={{ background: 'radial-gradient(ellipse at 50% 30%, #14080C 0%, #050204 80%)' }}>
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence baseFrequency=\'0.85\'/></filter><rect width=\'200\' height=\'200\' filter=\'url(%23n)\'/></svg>")' }} />

      <div className="sticky top-0 z-10 bg-[#050204]/95 backdrop-blur-md border-b border-[#A89968]/15 safe-pt">
        <div className="px-4 h-[60px] flex items-center justify-between">
          <button onClick={onClose} className="text-[#A89968] hover:text-[#C9A961] p-2 -m-1 transition-colors"><ArrowLeft size={20} /></button>
          <div className="text-[#C9A961] text-base tracking-[0.3em]" style={F.display}>THE DECK</div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMode('history')} className={`text-[10px] uppercase tracking-wider ${mode === 'history' ? 'text-[#C9A961]' : 'text-[#A89968]'}`} style={F.ui} title="history">
              <Clock size={14} />
            </button>
            <button onClick={() => setMode(mode === 'oracle' ? 'daily' : 'oracle')}
              className={`text-[10px] uppercase tracking-wider ${mode === 'oracle' ? 'text-[#C9A961]' : 'text-[#A89968]'}`} style={F.ui}>
              oracle
            </button>
            <button onClick={() => setMode(mode === 'spread' ? 'daily' : 'spread')}
              className={`text-[10px] uppercase tracking-wider ${mode === 'spread' ? 'text-[#C9A961]' : 'text-[#A89968]'}`} style={F.ui}>
              spread
            </button>
            <button onClick={() => setMode(mode === 'browse' ? 'daily' : 'browse')}
              className="text-[#A89968] text-[10px] uppercase tracking-wider" style={F.ui}>
              {mode === 'browse' ? 'today' : 'browse'}
            </button>
          </div>
        </div>
      </div>

      {mode === 'daily' && (
        <div className="relative px-6 pt-8 pb-12">
          <div className="text-center mb-6">
            <div className="text-[#A89968] text-[10px] uppercase tracking-[0.5em] mb-1" style={F.scriptureSC}>· today’s pull ·</div>
            <div className="text-[#A89968]/60 text-xs italic" style={F.scripture}>
              {pull.reversed ? 'drawn reversed' : 'drawn upright'}
            </div>
          </div>

          <CardFace card={pull.card} reversed={pull.reversed} large />

          <div className="mt-8 max-w-sm mx-auto text-center space-y-3">
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>
              {pull.card.name}{pull.reversed && ' · reversed'}
            </h2>
            <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>
              "{pull.reversed ? pull.card.reversed : pull.card.upright}"
            </p>
            {pull.card.element && (
              <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>
                · {pull.card.element} ·
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <button onClick={reshuffle}
              className="flex items-center gap-2 px-5 py-2.5 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.25em]"
              style={F.ui}>
              <Shuffle size={13} /> pull another
            </button>
            {onShare && (
              <button onClick={() => onShare(pull)}
                className="flex items-center gap-2 px-5 py-2.5 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.25em]"
                style={F.ui}>
                <Send size={13} /> share
              </button>
            )}
          </div>

          <p className="mt-10 text-center text-[#A89968]/40 text-[10px] italic" style={F.scripture}>
            · the deck remembers ·
          </p>
        </div>
      )}

      {mode === 'history' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· the deck remembers ·</div>
            <p className="text-[#A89968]/60 text-xs italic mt-1" style={F.scripture}>{historyEntries.length} days recorded</p>
          </div>
          {divinationLog.length > 0 && (
            <div className="mb-6 max-w-sm mx-auto">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]/60 mb-2" style={F.scriptureSC}>· questions asked ·</div>
              <div className="space-y-1">
                {divinationLog.slice(0, 8).map(d => (
                  <div key={d.id} className="px-3 py-2 border border-[#A89968]/15 bg-[#0A0204]/30">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-[#A89968]/60" style={F.scriptureSC}>{d.kind === 'pendulum' ? '◯ pendulum' : '✦ oracle'}</span>
                    </div>
                    <p className="text-[#A8A29E] text-xs italic" style={F.scripture}>"{d.question}"</p>
                    <p className="text-[#C9A961] text-xs mt-0.5" style={F.scripture}>→ {d.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {historyEntries.length === 0 && divinationLog.length === 0 ? (
            <div className="text-center py-12 text-[#A89968]/40 text-sm italic" style={F.scripture}>
              · no pulls yet · today is your first ·
            </div>
          ) : historyEntries.length > 0 && (
            <div className="space-y-1 max-w-sm mx-auto">
              {historyEntries.map(entry => (
                <div key={entry.date} className="flex items-center gap-3 px-3 py-2 border border-[#A89968]/20 bg-[#0A0204]/40">
                  <div className="w-10 text-[10px] text-[#A89968]" style={F.mono}>
                    {entry.date.slice(5).replace('-', '/')}
                  </div>
                  <div className="w-7 h-10 border border-[#A89968]/40 flex items-center justify-center"
                    style={{ background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)', transform: entry.reversed ? 'rotate(180deg)' : 'none' }}>
                    <span className="text-[#C9A961] text-base">{entry.symbol || '✦'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#F5F1E8] text-sm truncate" style={F.scripture}>{entry.card}</div>
                    <div className="text-[10px] text-[#A89968]/60" style={F.scriptureSC}>
                      {entry.reversed ? 'reversed' : 'upright'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'oracle' && (
        <div className="relative px-6 pt-8 pb-12">
          <div className="text-center mb-6">
            <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· ask the deck ·</div>
            <p className="text-[#A89968]/60 text-xs italic mt-1" style={F.scripture}>one question. one card. trust what falls.</p>
          </div>
          {!oracleAnswer ? (
            <div className="max-w-sm mx-auto">
              <textarea value={oracleQ} onChange={e => setOracleQ(e.target.value.slice(0, 140))}
                placeholder="what should I..."
                rows={2}
                className="w-full bg-[#0A0204] border border-[#A89968]/30 focus:border-[#C9A961] outline-none p-3 text-[#F5F1E8] text-base italic resize-none"
                style={F.scripture} />
              <button onClick={drawOracle} disabled={!oracleQ.trim()}
                className="mt-3 w-full py-3 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] disabled:opacity-40 text-xs uppercase tracking-[0.3em]"
                style={F.ui}>draw a card</button>
            </div>
          ) : (
            <div className="max-w-sm mx-auto text-center space-y-4">
              <p className="text-[#A89968]/60 text-xs italic" style={F.scripture}>"{oracleQ}"</p>
              <CardFace card={oracleAnswer.card} reversed={oracleAnswer.reversed} />
              <h2 className="text-[#F5F1E8] text-xl" style={F.brand}>
                {oracleAnswer.card.name}{oracleAnswer.reversed && ' · reversed'}
              </h2>
              <p className="text-[#A8A29E] text-sm leading-relaxed italic" style={F.scripture}>
                "{oracleAnswer.reversed ? oracleAnswer.card.reversed : oracleAnswer.card.upright}"
              </p>
              <button onClick={resetOracle}
                className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A89968] hover:border-[#C9A961]" style={F.ui}>
                ask again
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'spread' && (
        <div className="relative px-4 pt-6 pb-12">
          <div className="text-center mb-5">
            <div className="text-[#A89968] text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>· past · present · future ·</div>
            <p className="text-[#A89968]/60 text-xs italic mt-1" style={F.scripture}>three cards. one breath.</p>
          </div>
          {!spread ? (
            <div className="flex flex-col items-center pt-12">
              <div className="flex gap-3 mb-8">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-[80px] h-[120px] border border-[#A89968]/30 flex items-center justify-center"
                    style={{ background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)' }}>
                    <span className="text-[#A89968]/30 text-2xl">✦</span>
                  </div>
                ))}
              </div>
              <button onClick={drawSpread}
                className="px-5 py-2.5 border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961] text-xs uppercase tracking-[0.3em]" style={F.ui}>
                draw the spread
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                {spread.map((s, i) => {
                  const label = ['past', 'present', 'future'][i];
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className="text-[9px] uppercase tracking-[0.3em] text-[#A89968]/60 mb-1" style={F.scriptureSC}>· {label} ·</div>
                      <div className="w-[90px] h-[135px] border-2 border-[#A89968]/40 flex flex-col items-center justify-center p-2"
                        style={{
                          background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)',
                          transform: s.reversed ? 'rotate(180deg)' : 'none',
                          boxShadow: '0 0 20px rgba(201, 169, 97, 0.15)',
                        }}>
                        <div className="text-[#C9A961] text-3xl mb-1">{s.card.symbol || (s.card.suit === 'wands' ? '🜂' : s.card.suit === 'cups' ? '🜄' : s.card.suit === 'swords' ? '🜁' : '🜃')}</div>
                        <div className="text-[#F5F1E8] text-[10px] text-center leading-tight" style={F.scripture}>{s.card.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="space-y-3 max-w-sm mx-auto">
                {spread.map((s, i) => {
                  const label = ['past', 'present', 'future'][i];
                  return (
                    <div key={i} className="border border-[#A89968]/20 bg-[#0A0204]/40 p-3">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-[#A89968]" style={F.scriptureSC}>· {label} · {s.card.name}{s.reversed ? ' · reversed' : ''} ·</div>
                      <p className="text-[#A8A29E] text-xs italic mt-1.5 leading-relaxed" style={F.scripture}>
                        "{s.reversed ? s.card.reversed : s.card.upright}"
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center pt-2">
                <button onClick={drawSpread}
                  className="px-4 py-2 text-[10px] uppercase tracking-wider border border-[#2A2A2A] text-[#A89968] hover:border-[#C9A961]" style={F.ui}>
                  draw again
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'browse' && !browseCard && (
        <div className="relative px-4 pt-6 pb-12 grid grid-cols-3 gap-2">
          {TAROT_DECK.map(card => (
            <button key={card.id}
              onClick={() => setBrowseCard(card)}
              className="aspect-[2/3] border border-[#A89968]/30 hover:border-[#C9A961] flex flex-col items-center justify-center gap-1 p-1"
              style={{ background: 'linear-gradient(180deg, #14080C 0%, #0A0204 100%)' }}>
              <div className="text-[#C9A961] text-2xl">{card.symbol || (card.suit === 'wands' ? '🜂' : card.suit === 'cups' ? '🜄' : card.suit === 'swords' ? '🜁' : '🜃')}</div>
              <div className="text-[#F5F1E8] text-[9px] text-center leading-tight px-1" style={F.scripture}>{card.name}</div>
            </button>
          ))}
        </div>
      )}

      {mode === 'browse' && browseCard && (
        <div className="relative px-6 pt-6 pb-12">
          <button onClick={() => setBrowseCard(null)} className="text-[10px] uppercase tracking-wider text-[#A89968] hover:text-[#C9A961] mb-4" style={F.ui}>
            ← back to deck
          </button>
          <div className="max-w-sm mx-auto text-center space-y-4">
            <div className="text-[#A89968]/60 text-[10px] uppercase tracking-[0.4em]" style={F.scriptureSC}>
              · {browseCard.type === 'major' ? `arcanum ${String(browseCard.id).padStart(2, '0')}` : `${browseCard.suit} · ${browseCard.rank || ''}`} ·
            </div>
            <CardFace card={browseCard} large />
            <h2 className="text-[#F5F1E8] text-2xl" style={F.brand}>{browseCard.name}</h2>
            {browseCard.element && (
              <div className="text-[#A89968]/70 text-[10px] uppercase tracking-[0.3em]" style={F.scriptureSC}>· {browseCard.element} ·</div>
            )}
            <div className="text-left space-y-3 pt-2">
              <div className="border border-[#C9A961]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] mb-1" style={F.scriptureSC}>· upright ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.scripture}>"{browseCard.upright}"</p>
              </div>
              <div className="border border-[#8B0000]/20 bg-[#0A0204]/40 p-3">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] mb-1" style={F.scriptureSC}>· reversed ·</div>
                <p className="text-[#A8A29E] text-sm italic leading-relaxed" style={F.scripture}>"{browseCard.reversed}"</p>
              </div>
            </div>
            <button onClick={() => { setPull({ card: browseCard, reversed: false }); setBrowseCard(null); setMode('daily'); }}
              className="mt-2 px-4 py-2 text-[10px] uppercase tracking-wider border border-[#A89968]/40 text-[#A89968] hover:border-[#C9A961] hover:text-[#C9A961]" style={F.ui}>
              draw this card
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
