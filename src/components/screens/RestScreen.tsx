'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { useTimer, formatTime } from '@/hooks/use-timer';
import styles from './RestScreen.module.css';

const CIRCUMFERENCE = 2 * Math.PI * 54; // 339.3

export default function RestScreen() {
  const { currentExercise, setScreen } = useStore();
  const startedRef = useRef(false);

  // Rest always returns to the workout screen. Completion is decided by the
  // workout slice when the last set of the last exercise is done, so there is
  // never a rest period hanging off the end of a session.
  const timer = useTimer(() => setScreen('workout'));

  // Start timer on mount
  useEffect(() => {
    if (!startedRef.current && currentExercise) {
      startedRef.current = true;
      timer.start(currentExercise.scaledRest);
    }
    return () => { startedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = currentExercise?.scaledRest || 1;
  const progress = timer.remaining / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Flash overlay rendered here so it's active during rest */}
      <div className={`timer-flash${timer.flashActive ? ' flash-active' : ''}`} />

      <div className={styles.label}>REST</div>

      <div className={styles.ringWrap}>
        <svg className={styles.ring} viewBox="0 0 120 120">
          <circle className={styles.ringBg} cx="60" cy="60" r="54" />
          <circle
            className={`${styles.ringFill}${timer.isWarning ? ` ${styles.ringWarning}` : ''}`}
            cx="60" cy="60" r="54"
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className={`${styles.time}${timer.isWarning ? ` ${styles.timeWarning}` : ''}`} aria-live="polite">
          {formatTime(timer.remaining)}
        </div>
      </div>

      <button className={styles.btnSkip} onClick={timer.skip}>SKIP REST</button>
    </div>
  );
}

