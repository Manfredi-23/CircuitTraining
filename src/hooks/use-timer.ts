import { useState, useRef, useCallback, useEffect } from 'react';
import { CONFIG } from '@/core/config';
import { getAudioContext } from './audio-context';

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

export function useTimer(onDone?: () => void): UseTimerReturn {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const totalRef = useRef(0);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setIsWarning(false);
  }, []);

  const flash = useCallback(() => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), CONFIG.ui.restFlashDuration);
  }, []);

  const start = useCallback((seconds: number) => {
    stop();
    totalRef.current = seconds;
    setRemaining(seconds);
    setIsRunning(true);
    setIsWarning(false);

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1;

        if (next === CONFIG.ui.restWarningAt) {
          setIsWarning(true);
          warningBeeps();
          flash();
        }

        if (next <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          setIsWarning(false);
          doneBeep();
          flash();
          onDoneRef.current?.();
          return 0;
        }

        return next;
      });
    }, 1000);
  }, [stop, flash]);

  const skip = useCallback(() => {
    stop();
    setRemaining(0);
    onDoneRef.current?.();
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return { start, stop, skip, remaining, isRunning, isWarning, flashActive };
}
