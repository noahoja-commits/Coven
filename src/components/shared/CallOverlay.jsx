import { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { F } from '../../styles/fonts';
import { callSender, iceServers, waitForIce } from '../../lib/db/calls';

// A single 1:1 call — drives WebRTC for both roles. Non-trickle ICE: each side sends its full
// offer/answer only after gathering completes, so there are no candidate-timing races and no
// per-conversation channel is needed. Incoming answer/decline/hangup signals arrive via the
// `signal` prop (App routes them here from its global call subscription).
//
// call = { role:'outgoing'|'incoming', peerId, peerHandle, peerAvatar, convId, media:'video'|'audio', offer? }
export function CallOverlay({ call, meId, meHandle, meAvatar, signal, onEnd }) {
  const [status, setStatus] = useState(call.role === 'incoming' ? 'incoming' : 'calling'); // incoming|calling|connecting|connected|ended
  const [statusText, setStatusText] = useState('');
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const isVideo = call.media === 'video';

  const pcRef = useRef(null);
  const senderRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const endedRef = useRef(false);
  const ringTimerRef = useRef(null);

  const cleanup = () => {
    clearTimeout(ringTimerRef.current);
    try { pcRef.current?.close(); } catch { /* noop */ }
    try { localStreamRef.current?.getTracks().forEach(t => t.stop()); } catch { /* noop */ }
    try { senderRef.current?.close(); } catch { /* noop */ }
    pcRef.current = null; localStreamRef.current = null;
  };

  const finish = (text) => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (text) setStatusText(text);
    setStatus('ended');
    cleanup();
    setTimeout(() => onEnd && onEnd(), text ? 1200 : 0);
  };

  const hangup = () => {
    senderRef.current?.send({ t: 'hangup', from: meId }).catch(() => {});
    finish();
  };
  const decline = () => {
    // Callee rejecting a ring — reuse a fresh sender since we haven't built one yet.
    const s = senderRef.current || callSender(call.peerId);
    s.send({ t: 'decline', from: meId }).catch(() => {});
    finish();
  };

  // Build the peer connection, wire media + remote track + failure states. Shared by both roles.
  const buildPc = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
    if (endedRef.current) { stream.getTracks().forEach(t => t.stop()); return null; }
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pcRef.current = pc;
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0]; };
    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === 'connected') { setStatus('connected'); setStatusText(''); }
      else if (st === 'failed') finish('connection lost');
      else if (st === 'disconnected') setStatusText('reconnecting…');
    };
    return pc;
  };

  // ── Outgoing: get media, make offer, ring the peer, wait for the answer. ──
  useEffect(() => {
    if (call.role !== 'outgoing') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const pc = await buildPc();
        if (!pc || cancelled) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitForIce(pc);
        if (cancelled || endedRef.current) return;
        senderRef.current = callSender(call.peerId);
        await senderRef.current.send({
          t: 'ring', from: meId, fromHandle: meHandle, fromAvatar: meAvatar,
          convId: call.convId, media: call.media, sdp: pc.localDescription,
        });
        setStatus('calling');
        ringTimerRef.current = setTimeout(() => finish('no answer'), 40000);
      } catch (e) {
        finish(e?.name === 'NotAllowedError' ? 'camera/mic blocked' : "couldn't start the call");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Incoming accept: get media, answer the stored offer. ──
  const accept = async () => {
    setStatus('connecting');
    try {
      const pc = await buildPc();
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await waitForIce(pc);
      if (endedRef.current) return;
      senderRef.current = callSender(call.peerId);
      await senderRef.current.send({ t: 'answer', from: meId, sdp: pc.localDescription });
    } catch (e) {
      finish(e?.name === 'NotAllowedError' ? 'camera/mic blocked' : "couldn't connect");
    }
  };

  // ── Route incoming signals from App (answer for the caller; decline/hangup for either). ──
  useEffect(() => {
    if (!signal) return;
    if (signal.t === 'answer' && pcRef.current && !pcRef.current.currentRemoteDescription) {
      setStatus('connecting');
      clearTimeout(ringTimerRef.current);
      pcRef.current.setRemoteDescription(new RTCSessionDescription(signal.sdp)).catch(() => finish('connection failed'));
    } else if (signal.t === 'decline') {
      finish('call declined');
    } else if (signal.t === 'busy') {
      finish('they’re on another call');
    } else if (signal.t === 'hangup') {
      finish('call ended');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  useEffect(() => () => cleanup(), []); // stop media on unmount no matter what

  const toggleMute = () => {
    const on = !muted; setMuted(on);
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !on; });
  };
  const toggleCam = () => {
    const on = !camOff; setCamOff(on);
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !on; });
  };

  const label = status === 'incoming' ? `incoming ${isVideo ? 'video ' : ''}call`
    : status === 'calling' ? 'ringing…'
    : status === 'connecting' ? 'connecting…'
    : status === 'connected' ? 'connected'
    : statusText || 'call ended';

  return (
    <div className="fixed inset-0 z-[80] bg-[#050204] flex flex-col animate-fade-in">
      {/* Remote video / avatar backdrop */}
      <div className="absolute inset-0 flex items-center justify-center">
        {isVideo && status === 'connected' ? (
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#3B0A12] to-[#0A0A0A] border border-[#5B0F1A] flex items-center justify-center text-5xl overflow-hidden" style={{ boxShadow: '0 0 40px rgba(139,0,0,0.4)' }}>
              {call.peerAvatar && String(call.peerAvatar).startsWith('http')
                ? <img src={call.peerAvatar} alt="" className="w-full h-full object-cover" />
                : (call.peerAvatar || '✦')}
            </div>
            <div className="text-[#F5F1E8] text-xl" style={F.brand}>{call.peerHandle}</div>
          </div>
        )}
      </div>

      {/* Local PiP (video calls once we have media) */}
      {isVideo && status !== 'incoming' && (
        <video ref={localVideoRef} autoPlay playsInline muted
          className="absolute top-4 right-4 w-24 h-32 object-cover rounded-lg border border-[#2A2A2A] bg-black z-10" style={{ transform: 'scaleX(-1)' }} />
      )}

      {/* Status */}
      <div className="relative z-10 pt-16 text-center pointer-events-none">
        {status === 'connected' && isVideo && (
          <div className="text-[#F5F1E8] text-lg" style={F.brand}>{call.peerHandle}</div>
        )}
        <div className="text-[#C9A961] text-xs uppercase tracking-[0.25em] mt-1" style={F.ui}>{label}</div>
      </div>

      {/* Controls */}
      <div className="relative z-10 mt-auto pb-12 px-8 safe-pb">
        {status === 'incoming' ? (
          <div className="flex items-center justify-center gap-16">
            <button onClick={decline} className="tap flex flex-col items-center gap-2">
              <span className="w-16 h-16 rounded-full bg-[#8B0000] text-[#F5F1E8] flex items-center justify-center"><PhoneOff size={26} /></span>
              <span className="text-[10px] uppercase tracking-wider text-[#A8A29E]" style={F.ui}>decline</span>
            </button>
            <button onClick={accept} className="tap flex flex-col items-center gap-2">
              <span className="w-16 h-16 rounded-full bg-[#1E6B3A] text-[#F5F1E8] flex items-center justify-center animate-pulse"><Phone size={26} /></span>
              <span className="text-[10px] uppercase tracking-wider text-[#A8A29E]" style={F.ui}>accept</span>
            </button>
          </div>
        ) : status === 'ended' ? (
          <div className="text-center text-[#6B6B6B] text-sm italic" style={F.serif}>{statusText || 'call ended'}</div>
        ) : (
          <div className="flex items-center justify-center gap-6">
            <button onClick={toggleMute} className={`tap w-14 h-14 rounded-full flex items-center justify-center border ${muted ? 'bg-[#C9A961] text-[#0A0608] border-[#C9A961]' : 'bg-[#141414] text-[#F5F1E8] border-[#2A2A2A]'}`}>
              {muted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            <button onClick={hangup} className="tap w-16 h-16 rounded-full bg-[#8B0000] text-[#F5F1E8] flex items-center justify-center" style={{ boxShadow: '0 0 22px rgba(139,0,0,0.6)' }}>
              <PhoneOff size={26} />
            </button>
            {isVideo && (
              <button onClick={toggleCam} className={`tap w-14 h-14 rounded-full flex items-center justify-center border ${camOff ? 'bg-[#C9A961] text-[#0A0608] border-[#C9A961]' : 'bg-[#141414] text-[#F5F1E8] border-[#2A2A2A]'}`}>
                {camOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
