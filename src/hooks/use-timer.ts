import { useState, useRef, useCallback, useEffect } from 'react';
import { CONFIG } from '@/core/config';
import { getAudioContext } from './audio-context';
import { useWakeLock } from './use-wake-lock';
import { hapticWarning, hapticDone } from '@/native/native';

function beep(freq: number, duration: number, volume: number): void {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch { /* audio not available */ }
}

function warningBeeps(): void {
  beep(880, 80, 0.25);
  setTimeout(() => beep(880, 80, 0.25), 130);
  setTimeout(() => beep(1100, 120, 0.3), 280);
}

function doneBeep(): void {
  beep(523, 150, 0.4);
  setTimeout(() => beep(659, 150, 0.4), 160);
  setTimeout(() => beep(784, 300, 0.5), 320);
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

interface UseTimerReturn {
  start: (seconds: number) => void;
  stop: () => void;
  skip: () => void;
  remaining: number;
  isRunning: boolean;
  isWarning: boolean;
  flashActive: boolean;
}

/**
 * Rest timer.
 *
 * Counts against a wall-clock deadline rather than by decrementing a counter
 * once per tick. iOS throttles and then suspends timers as soon as the app is
 * backgrounded or the screen locks, so a decrementing timer silently loses the
 * time you were away; reading the clock means the countdown is still correct
 * when you come back. The screen is also held awake while it runs.
 */
export function useTimer(onDone?: () => void): UseTimerReturn {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef(0);
  /** Guards the one-shot cues, which must not re-fire on a resumed tick. */
  const warnedRef = useRef(false);
  const finishedRef = useRef(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useWakeLock(isRunning);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    setIsRunning(false);
    setIsWarning(false);
  }, [clear]);

  const flash = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), CONFIG.ui.restFlashDuration);
  }, []);

  const start = useCallback((seconds: number) => {
    clear();
    deadlineRef.current = Date.now() + seconds * 1000;
    warnedRef.current = false;
    finishedRef.current = false;
    setRemaining(seconds);
    setIsRunning(true);
    setIsWarning(false);

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setRemaining(left);

      if (!warnedRef.current && left <= CONFIG.ui.restWarningAt && left > 0) {
        warnedRef.current = true;
        setIsWarning(true);
        warningBeeps();
        void hapticWarning();
        flash();
      }

      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clear();
        setIsRunning(false);
        setIsWarning(false);
        doneBeep();
        void hapticDone();
        flash();
        onDoneRef.current?.();
      }
    };

    // Sub-second ticking keeps the displayed number honest against the clock
    // without the countdown ever appearing to skip.
    intervalRef.current = setInterval(tick, 250);
  }, [clear, flash]);

  const skip = useCallback(() => {
    finishedRef.current = true;
    stop();
    setRemaining(0);
    onDoneRef.current?.();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => clear, [clear]);

  return { start, stop, skip, remaining, isRunning, isWarning, flashActive };
}
