import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeTyping, broadcastTyping, broadcastTypingStop } from '../lib/db/dm';

const TYPING_DEBOUNCE_MS = 2000;    // send "typing" at most once per 2s
const TYPING_TIMEOUT_MS = 3000;     // auto-stop after 3s of no keystrokes
const STOP_DELAY_MS = 1500;         // keep showing indicator after last broadcast

/**
 * Hook for DM typing indicators.
 *
 * Provides:
 * - `onInput()` — call on every keystroke (debounced broadcast)
 * - `typingUser` — the handle of the remote user currently typing, or null
 *
 * @param {string|number} convId - Active conversation ID (null if no conversation open)
 * @param {string} meHandle - Current user's handle (to exclude self from broadcasts we receive)
 * @returns {{ typingUser: string|null, onInput: () => void }}
 */
export function useTypingIndicator(convId, meHandle) {
  const [typingUser, setTypingUser] = useState(null);
  const typingTimers = useRef({});     // userHandle → timeout ID for auto-clearing
  const lastBroadcast = useRef(0);     // timestamp of last "typing" broadcast
  const stopTimer = useRef(null);      // timeout to clear indicator after stop received
  const inputTimer = useRef(null);     // timeout to send "typing_stop" after inactivity

  // Subscribe to typing broadcasts for this conversation
  useEffect(() => {
    if (!convId) return;

    const onTyping = (user) => {
      if (user === meHandle) return; // ignore our own broadcasts
      setTypingUser(user);
      // Auto-clear after TYPING_TIMEOUT_MS if no new broadcasts arrive
      clearTimeout(typingTimers.current[user]);
      typingTimers.current[user] = setTimeout(() => {
        setTypingUser((current) => current === user ? null : current);
      }, TYPING_TIMEOUT_MS);
    };

    const onTypingStop = (user) => {
      if (user === meHandle) return;
      // Debounce the visual clear — wait STOP_DELAY_MS so rapid start/stop
      // doesn't cause flickering
      clearTimeout(stopTimer.current);
      stopTimer.current = setTimeout(() => {
        setTypingUser((current) => current === user ? null : current);
      }, STOP_DELAY_MS);
      clearTimeout(typingTimers.current[user]);
    };

    const unsub = subscribeTyping(convId, onTyping, onTypingStop);
    return () => {
      unsub();
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
      clearTimeout(stopTimer.current);
      clearTimeout(inputTimer.current);
      setTypingUser(null);
    };
  }, [convId, meHandle]);

  // Broadcast that we're typing — call on every keystroke
  const onInput = useCallback(() => {
    if (!convId || !meHandle) return;

    const now = Date.now();
    // Throttle: only send "typing" once per TYPING_DEBOUNCE_MS
    if (now - lastBroadcast.current > TYPING_DEBOUNCE_MS) {
      broadcastTyping(convId, meHandle);
      lastBroadcast.current = now;
    }

    // Reset the "stop typing" timer — auto-send typing_stop after inactivity
    clearTimeout(inputTimer.current);
    inputTimer.current = setTimeout(() => {
      broadcastTypingStop(convId, meHandle);
    }, TYPING_TIMEOUT_MS);
  }, [convId, meHandle]);

  return { typingUser, onInput };
}
