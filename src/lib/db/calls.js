import { supabase } from '../supabase';

// 1:1 live-call signalling over Supabase Realtime broadcast (no DB table, nothing persisted —
// same transient pattern as typing indicators). Model: every user listens on their OWN channel
// `call:<myId>`; to signal someone you publish to THEIR channel. Combined with non-trickle ICE
// (each side sends its full offer/answer only after ICE gathering completes), this avoids any
// candidate-timing races and needs no per-conversation channel.
//
// Signal payloads: { t, from, fromHandle, fromAvatar, convId, media, sdp?, reason? }
//   t: 'ring' (offer) | 'answer' | 'decline' | 'hangup' | 'busy'

export function subscribeMyCalls(myId, onSignal) {
  if (!myId) return () => {};
  const ch = supabase.channel(`call:${myId}`, { config: { broadcast: { self: false } } });
  ch.on('broadcast', { event: 'call' }, ({ payload }) => onSignal && onSignal(payload)).subscribe();
  return () => { try { supabase.removeChannel(ch); } catch { /* noop */ } };
}

// A sender bound to one peer's channel. subscribe() must land before send(), so we gate sends
// on a ready promise. Reused for the whole call, closed on teardown.
export function callSender(toUserId) {
  const ch = supabase.channel(`call:${toUserId}`, { config: { broadcast: { self: false } } });
  let resolve;
  const ready = new Promise((r) => { resolve = r; });
  ch.subscribe((status) => { if (status === 'SUBSCRIBED') resolve(); });
  return {
    send: async (payload) => { await ready; try { await ch.send({ type: 'broadcast', event: 'call', payload }); } catch { /* dropped signal — call UI surfaces failure via timeout */ } },
    close: () => { try { supabase.removeChannel(ch); } catch { /* noop */ } },
  };
}

// STUN (free, Google) always; TURN only if configured (needed on symmetric/mobile NATs —
// without it, some networks can't connect). Set VITE_TURN_URL/USER/CRED to add a relay.
export function iceServers() {
  const servers = [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }];
  const turnUrl = import.meta.env.VITE_TURN_URL;
  if (turnUrl) {
    servers.push({ urls: turnUrl, username: import.meta.env.VITE_TURN_USER || '', credential: import.meta.env.VITE_TURN_CRED || '' });
  }
  return servers;
}

// Resolve once ICE gathering is done (or after a timeout, so a stalled gatherer still connects).
export function waitForIce(pc, timeoutMs = 2500) {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') { resolve(); return; }
    const done = () => { pc.removeEventListener('icegatheringstatechange', check); clearTimeout(t); resolve(); };
    const check = () => { if (pc.iceGatheringState === 'complete') done(); };
    pc.addEventListener('icegatheringstatechange', check);
    const t = setTimeout(done, timeoutMs);
  });
}

export const callSupported = typeof RTCPeerConnection !== 'undefined'
  && typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
