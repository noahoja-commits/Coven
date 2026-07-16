import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, Play, Square, X, Users, LogOut, Phone, Video, Smile } from 'lucide-react';
import { F } from '../../styles/fonts';
import { uploadAudio } from '../../lib/db/storage';
import { isStickerMessage } from '../../data/stickers';
import { GifStickerPicker } from './GifStickerPicker';
import { fetchConversationMembers } from '../../lib/db/dm';
import { useTypingIndicator } from '../../hooks/useTypingIndicator';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const REACT_KINDS = ['bat', 'fire', 'skull', 'smoke'];
const REACT_EMOJI = { bat: '🦇', fire: '🔥', skull: '💀', smoke: '💨' };

export function ChatThread({ conversation, messages, onSend, onBack, onRetry, onReact, onOpenPost, onOpenUser, onLeaveGroup, onStartCall, initialDraft = '', meHandle = '' }) {
  const [draft, setDraft] = useState(initialDraft);
  const { typingUser, onInput } = useTypingIndicator(conversation?.id, meHandle);
  const [trayMsg, setTrayMsg] = useState(null);
  const [members, setMembers] = useState(null); // null = closed; [] = loading/empty; [..] = open
  const scrollRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [sendingAudio, setSendingAudio] = useState(false);
  const [showPicker, setShowPicker] = useState(false); // GIF/sticker picker
  const [sendErr, setSendErr] = useState(null); // surfaced voice-note failure (was silently swallowed)
  const recorderRef = useRef(null);
  const recTimerRef = useRef(null);
  const isTouchRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup on unmount: stop recording, revoke object URLs, stop streams
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stream?.getTracks().forEach(t => t.stop());
        recorderRef.current.stop();
      }
      clearInterval(recTimerRef.current);
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length]);

  // Escape should peel the members sheet / reaction tray FIRST, not close the whole conversation.
  // Capture phase + stopPropagation runs before App's window-level Escape handler so it doesn't
  // also pop the conversation off the overlay stack.
  useEffect(() => {
    if (members === null && !trayMsg) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      if (members !== null) setMembers(null);
      else if (trayMsg) setTrayMsg(null);
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [members, trayMsg]);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  const send = () => {
    const b = draft.trim();
    if (b) { onSend(b); setDraft(''); }
  };

  // ── Audio recording ──
  const canRecord = typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia;

  const startRecording = () => {
    // Guard: prevent re-entrancy (rapid taps)
    if (recording || recorderRef.current) return;
    // Ignore if this is a synthesized mouse event from a prior touch
    if (isTouchRef.current) { isTouchRef.current = false; return; }

    try {
      const constraints = { audio: true };
      navigator.mediaDevices.getUserMedia(constraints).then(stream => {
        if (!mountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        // Pick best supported audio mime type; fall back to browser default
        let mime = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mime)) mime = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mime)) mime = '';
        const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
        recorder.stream = stream; // attach stream for cleanup
        recorderRef.current = recorder;
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          recorderRef.current = null; // release the ref so the next mic press can record again
          if (!mountedRef.current) return;
          if (chunks.length === 0) {
            // No audio data captured (instant tap-release)
            discardAudio();
            return;
          }
          // Use the recorder's ACTUAL negotiated type — on Safari/iOS the requested webm is
          // unsupported and it records audio/mp4, so forcing 'audio/webm' here mislabels the blob
          // and the uploaded file's extension, breaking playback. recorder.mimeType is truthful.
          const actualType = recorder.mimeType || mime || 'audio/webm';
          const blob = new Blob(chunks, { type: actualType });
          setAudioBlob(blob);
          setAudioPreview(URL.createObjectURL(blob));
        };
        recorder.start();
        setRecording(true);
        setRecDuration(0);
        const startedAt = Date.now();
        recTimerRef.current = setInterval(() => {
          if (!mountedRef.current) { clearInterval(recTimerRef.current); return; }
          const elapsed = (Date.now() - startedAt) / 1000;
          setRecDuration(elapsed);
          if (elapsed >= 60) stopRecording(); // cap at 60s
        }, 200);
      }).catch(() => { /* mic denied or unavailable */ });
    } catch { /* getUserMedia unavailable */ }
  };

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(recTimerRef.current);
  };

  const discardAudio = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setAudioBlob(null);
    setAudioPreview(null);
    setRecDuration(0);
    recorderRef.current = null;
  };

  const sendAudio = async () => {
    if (!audioBlob || audioBlob.size === 0 || !audioPreview) return;
    setSendingAudio(true);
    setSendErr(null);
    try {
      const fd = new Date();
      const key = `${conversation?.id || 'dm'}/${fd.getFullYear()}${String(fd.getMonth()+1).padStart(2,'0')}`;
      const url = await uploadAudio('voice', key, audioBlob);
      await onSend('🎙️ voice note', url);
      discardAudio();
    } catch (e) {
      // Surface the failure instead of swallowing it — a silent catch is exactly why voice notes
      // "just don't work" with no feedback. Keep the preview so the user can retry.
      if (mountedRef.current) setSendErr(e?.message || "couldn't send that voice note — try again.");
    }
    if (mountedRef.current) setSendingAudio(false);
  };

  const isAudioMessage = (m) => !!m.audioUrl;

  // Touch event handlers: set flag to suppress synthesized mouse events
  const onMicTouchStart = (e) => { e.preventDefault(); isTouchRef.current = true; startRecording(); };
  const onMicTouchEnd = (e) => { e.preventDefault(); isTouchRef.current = true; stopRecording(); };
  const onMicMouseDown = () => { if (!isTouchRef.current) startRecording(); };
  const onMicMouseUp = () => { if (!isTouchRef.current) stopRecording(); };
  const onMicMouseLeave = () => { if (!isTouchRef.current) stopRecording(); };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#0A0A0A] z-40 animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1A1A1A]">
        <button onClick={onBack} className="tap text-[#A8A29E] hover:text-[#F5F1E8] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0" style={F.ui}>
          {conversation?.avatarUrl ? (
            <img src={conversation.avatarUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <span className="text-sm">{conversation?.avatar || '✦'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm text-[#F5F1E8] truncate" style={F.ui}>{conversation?.user || '...'}</div>
          <div className="text-[10px] text-[#6B6B6B]" style={F.ui}>
            {conversation?.group ? 'coven · group' : 'whisper'}
          </div>
        </div>
        {!conversation?.group && onStartCall && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button onClick={() => onStartCall('audio')} className="tap p-2 text-[#A8A29E] hover:text-[#C9A961]" title="voice call"><Phone size={16} /></button>
            <button onClick={() => onStartCall('video')} className="tap p-2 text-[#A8A29E] hover:text-[#C9A961]" title="video call"><Video size={16} /></button>
          </div>
        )}
        {conversation?.group && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => { setMembers([]); fetchConversationMembers(conversation.id).then(setMembers).catch(() => setMembers(null)); }}
              className="tap p-2 text-[#A8A29E] hover:text-[#C9A961]" title="members"><Users size={16} /></button>
            {onLeaveGroup && (
              <button onClick={() => { if (confirm('Leave this circle? You can be re-invited (or rejoin, if it\'s a public crew).')) onLeaveGroup(conversation.id); }}
                className="tap p-2 text-[#A8A29E] hover:text-[#8B0000]" title="leave circle"><LogOut size={16} /></button>
            )}
          </div>
        )}
      </div>

      {/* Members sheet */}
      {members !== null && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setMembers(null)}>
          <div className="w-full max-h-[60%] overflow-y-auto bg-[#0F0F0F] border-t border-[#2A2A2A] p-4" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#9E2A33] mb-3" style={F.display}>
              in this circle {members.length > 0 && <span className="text-[#6B6B6B]">· {members.length}</span>}
            </div>
            {members.length === 0 ? (
              <div className="text-[#6B6B6B] text-xs py-4 text-center" style={F.serif}>summoning…</div>
            ) : members.map(m => {
              const isSelf = m.handle === meHandle;
              // Your own row isn't a link — onOpenUser(self) is a no-op in App, but the wired
              // handler ALSO closes the conversation first, so tapping yourself would eject you
              // to the feed with nothing opened. Render self as a plain, non-tappable row.
              return (
                <button key={m.userId} disabled={isSelf}
                  onClick={isSelf ? undefined : () => { setMembers(null); onOpenUser && onOpenUser(m.handle); }}
                  className={`tap w-full flex items-center gap-3 py-2 text-left px-2 -mx-2 ${isSelf ? 'cursor-default' : 'hover:bg-[#1A1A1A]'}`}>
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center overflow-hidden shrink-0">
                    {m.avatarUrl ? <img src={m.avatarUrl} className="w-full h-full object-cover" alt="" /> : <span className="text-sm">{m.avatar}</span>}
                  </span>
                  <span className="text-sm text-[#F5F1E8]" style={F.ui}>{m.handle}{isSelf && <span className="text-[#6B6B6B]"> · you</span>}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {(messages || []).map((m, i) => {
          const mine = m.from === 'me';
          const audioMsg = isAudioMessage(m);
          const imageMsg = !!m.imageUrl;
          const stickerMsg = !audioMsg && !imageMsg && !m.forwardedPost && isStickerMessage(m.body);
          return (
            <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              {conversation?.group && !mine && (
                <div className="text-[10px] text-[#A8A29E] px-1 pb-0.5" style={F.ui}>{m.from}</div>
              )}
              <div
                className={`relative max-w-[78%] group ${mine ? 'items-end' : 'items-start'}`}
                onClick={() => {
                  if (m.failed) { onRetry?.(m.id); return; }   // tap a failed whisper to resend it
                  if (!m.pending && onReact) setTrayMsg(trayMsg === m.id ? null : m.id);
                }}
              >
                {trayMsg === m.id && onReact && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full px-2 py-1 z-10 shadow-lg"
                    onClick={e => e.stopPropagation()}>
                    {REACT_KINDS.map(k => (
                      <button key={k} onClick={() => { onReact(m.id, k); setTrayMsg(null); }}
                        className="tap text-sm hover:scale-125 transition-transform px-1">{REACT_EMOJI[k]}</button>
                    ))}
                  </div>
                )}
                <div
                  className={`text-sm leading-relaxed text-[#F5F1E8] ${
                    imageMsg || stickerMsg
                      ? '' // GIFs/stickers render bare — no bubble bg/padding
                      : `px-3 py-2 ${mine
                          ? m.failed ? 'bg-[#8B0000]/20 border border-[#8B0000]/60' : m.pending ? 'bg-[#8B0000]/60' : 'bg-[#8B0000]'
                          : 'bg-[#141414]'} ${mine ? 'rounded-l-2xl rounded-tr-2xl rounded-br-md' : 'rounded-r-2xl rounded-tl-2xl rounded-bl-md'}`
                  }`}>
                  {imageMsg ? (
                    <img src={m.imageUrl} alt="gif" className="rounded-lg max-w-[200px] max-h-[240px] w-auto" style={m.pending ? { opacity: 0.6 } : undefined} onClick={e => e.stopPropagation()} />
                  ) : stickerMsg ? (
                    <div className="text-5xl leading-none py-1">{m.body}</div>
                  ) : audioMsg ? (
                    // Stop the tap from bubbling to the bubble's reaction-tray toggle, so hitting
                    // play/scrub on the voice note doesn't also pop the emoji tray (mirror forwardedPost).
                    <div className="flex items-center gap-2 min-w-[180px]" onClick={e => e.stopPropagation()}>
                      <audio controls src={m.audioUrl} className="h-9 w-full" preload="metadata" />
                    </div>
                  ) : m.forwardedPost ? (
                    <div onClick={e => { e.stopPropagation(); if (m.forwardedPost.id) onOpenPost?.(m.forwardedPost.id); }}
                      className="cursor-pointer">
                      {m.forwardedPost.removed ? (
                        <div className="text-[#6B6B6B] italic text-xs">post removed</div>
                      ) : (
                        <div className="border border-[#2A2A2A] rounded-lg p-2 mb-1 bg-[#0A0A0A]/50">
                          <div className="text-[10px] text-[#A8A29E]" style={F.ui}>@{m.forwardedPost.handle}</div>
                          {m.forwardedPost.body && <div className="text-xs mt-0.5">{m.forwardedPost.body}</div>}
                        </div>
                      )}
                      {m.body && <div>{m.body}</div>}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{m.body || ''}</div>
                  )}
                </div>
                {REACT_KINDS.some(k => (m.reactions?.[k] || 0) > 0) && (
                  <div className="flex gap-1 mt-0.5">
                    {REACT_KINDS.map(k => {
                      const count = m.reactions?.[k] || 0;
                      if (!count) return null;
                      return (
                        <button key={k} onClick={e => { e.stopPropagation(); onReact?.(m.id, k); }}
                          className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                            m.myReactions?.[k] ? 'bg-[#C9A961]/20 border-[#C9A961]/40 text-[#C9A961]' : 'bg-[#1A1A1A] border-[#2A2A2A] text-[#A8A29E]'
                          }`} style={F.ui}>
                          {REACT_EMOJI[k]} {count}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className={`text-[9px] text-[#6B6B6B] mt-0.5 px-1 ${mine ? 'text-right' : 'text-left'}`} style={F.ui}>
                  {m.failed ? 'failed — tap to retry' : m.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {typingUser && (
        <div className="px-4 pb-1 text-[11px] text-[#A8A29E] italic" style={F.serif}>{typingUser} is whispering…</div>
      )}

      {/* Composer */}
      <div className="border-t border-[#1A1A1A] bg-[#0A0A0A] px-3 py-2 pb-3 safe-pb">
        {sendErr && (
          <div className="mb-2 px-3 py-1.5 bg-[#5B0F1A]/20 border border-[#5B0F1A]/50 text-[#9E2A33] text-[11px]" style={F.ui}>{sendErr}</div>
        )}
        {audioPreview ? (
          <div className="flex items-center gap-2 bg-[#141414] border border-[#2A2A2A] rounded-2xl px-3 py-2">
            <audio controls src={audioPreview} className="flex-1 h-9" preload="metadata" />
            <button onClick={discardAudio} disabled={sendingAudio}
              className="tap w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[#A8A29E] hover:text-[#F5F1E8]">
              <X size={14} />
            </button>
            <button onClick={sendAudio} disabled={sendingAudio}
              className={`tap w-8 h-8 rounded-full flex items-center justify-center ${
                sendingAudio ? 'bg-[#6B6B6B]' : 'bg-[#8B0000] text-[#F5F1E8]'
              }`}>
              <Send size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            {canRecord && (
              <button
                onMouseDown={onMicMouseDown}
                onMouseUp={onMicMouseUp}
                onMouseLeave={onMicMouseLeave}
                onTouchStart={onMicTouchStart}
                onTouchEnd={onMicTouchEnd}
                className={`tap w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors select-none ${
                  recording
                    ? 'bg-[#8B0000] text-[#F5F1E8] animate-pulse'
                    : 'bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#F5F1E8]'
                }`}
              >
                {recording ? (
                  <span className="text-[10px] font-mono">{formatDuration(recDuration)}</span>
                ) : (
                  <Mic size={15} />
                )}
              </button>
            )}
            <button onClick={() => setShowPicker(true)} title="gifs & stickers"
              className="tap w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B] hover:text-[#C9A961] transition-colors">
              <Smile size={15} />
            </button>
            <div className="flex-1 bg-[#141414] border border-[#2A2A2A] focus-within:border-[#C9A961]/50 rounded-2xl px-3 py-2 transition-colors">
              <textarea
                value={draft}
                maxLength={4000}
                onChange={(e) => { setDraft(e.target.value.slice(0, 4000)); onInput(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="whisper..."
                rows={1}
                className="w-full bg-transparent text-[#F5F1E8] text-sm outline-none resize-none placeholder:text-[#6B6B6B]"
                style={{ ...F.ui, maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={send}
              disabled={!draft.trim()}
              className={`tap w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${
                draft.trim()
                  ? 'bg-[#8B0000] text-[#F5F1E8]'
                  : 'bg-[#141414] border border-[#2A2A2A] text-[#6B6B6B]'
              }`}
            >
              <Send size={15} />
            </button>
          </div>
        )}
      </div>

      {showPicker && (
        <GifStickerPicker
          onPickGif={(url) => { setShowPicker(false); onSend('🖼️ gif', null, url); }}
          onPickSticker={(glyph) => { setShowPicker(false); setDraft(d => (d ? d + glyph : glyph)); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

const ChevronLeft = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
