'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/store';
import { useTimer, formatTime } from '@/hooks/use-timer';
import { getLoadAxis, formatLoad } from '@/core/load';
import FormGuide from '@/components/shared/FormGuide';
import SessionProgressBar from '@/components/shared/SessionProgressBar';
import ReservePicker from '@/components/shared/ReservePicker';
import Led from '@/components/shared/Led';
import styles from './RestScreen.module.css';

/** The rest ring is LEDs: one goes out for each 1/48 of the rest. */
const RING_DOTS = 48;
const RING_R = 90;
const RING_SIZE = 196;

/**
 * Time added per tap. Rest on maximal work is a floor, never a ceiling: IRCRA
 * rests five minutes between tests, and a set that is not ready yet is a
 * lower-quality set.
 */
const EXTRA_REST_SEC = 60;

export default function RestScreen() {
  const { currentExercise, setIndex, rampBest, endRest } = useStore();
  const startedRef = useRef(false);
  const nextRef = useRef('');
  /** Rest as written plus any time added, so the ring stays in proportion. */
  const [total, setTotal] = useState(currentExercise?.scaledRest || 1);
  /**
   * Rest is the time to read up on what is coming. A new exercise opens with
   * its form guide out; the next set of the same one keeps it folded, since
   * it was just read on the card.
   */
  const [formOpen, setFormOpen] = useState(setIndex === 1);
  const [reserveOpen, setReserveOpen] = useState(false);

  // Rest always returns to the workout screen. Completion is decided by the
  // workout slice when the last set of the last exercise is done, so there is
  // never a rest period hanging off the end of a session.
  const timer = useTimer(endRest);

  // Start timer on mount. The alert body names what is waiting, so the lock
  // screen alone is enough to get you back on the mat. During rest the store
  // already points at the next piece of work: the same exercise on its next
  // set, or the next exercise on set 1.
  useEffect(() => {
    if (!startedRef.current && currentExercise) {
      startedRef.current = true;
      const next = currentExercise.ramp
        ? `${currentExercise.displayName} — attempt ${setIndex}`
        : `${currentExercise.displayName} — set ${setIndex}/${currentExercise.scaledSets}`;
      nextRef.current = next;
      timer.start(currentExercise.scaledRest, next);
    }
    return () => { startedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRest = () => {
    timer.extend(EXTRA_REST_SEC, nextRef.current);
    setTotal(t => t + EXTRA_REST_SEC);
  };

  const progress = timer.remaining / total;
  const litDots = Math.ceil(Math.max(0, Math.min(1, progress)) * RING_DOTS);

  const ex = currentExercise;
  const newExercise = setIndex === 1;
  const axis = ex ? getLoadAxis(ex) : null;
  const bestText = ex?.ramp && rampBest !== null && axis ? formatLoad(rampBest, axis) : null;
  const nextTag = !ex ? ''
    : ex.ramp ? `ATTEMPT ${setIndex} OF UP TO ${ex.ramp.maxAttempts}`
    : `SET ${setIndex}/${ex.scaledSets}`;

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Flash overlay rendered here so it's active during rest */}
      <div className={`timer-flash${timer.flashActive ? ' flash-active' : ''}`} />

      <SessionProgressBar />

      <div className={styles.timerRow}>
        <div className={styles.ringWrap}>
          <svg className={styles.ring} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} aria-hidden="true">
            {Array.from({ length: RING_DOTS }, (_, i) => {
              const a = (i / RING_DOTS) * 2 * Math.PI - Math.PI / 2;
              return (
                <circle
                  key={i}
                  cx={RING_SIZE / 2 + RING_R * Math.cos(a)}
                  cy={RING_SIZE / 2 + RING_R * Math.sin(a)}
                  r={3.4}
                  className={i < litDots ? (timer.isWarning ? styles.dotWarn : styles.dotOn) : styles.dotOff}
                />
              );
            })}
          </svg>
          <div className={styles.time} aria-live="polite" aria-label={`${formatTime(timer.remaining)} of rest left`}>
            <Led text={formatTime(timer.remaining)} dot={5.4} lit={timer.isWarning ? 'var(--accent)' : 'var(--ink)'} unlit="none" label="" />
          </div>
        </div>
        <div className={styles.timerSide}>
          <div className={styles.label}>REST</div>
          <button className={styles.btnSkip} onClick={addRest}>+60S</button>
          <button className={styles.btnSkip} onClick={timer.skip}>SKIP REST</button>
        </div>
      </div>

      {/* What the rest is for: the next piece of work, ready to read */}
      {ex && (
        <div className={styles.scroll}>
          <div className={styles.nextCard}>
            <div className={styles.nextTag}>
              {newExercise ? 'UP NEXT' : 'NEXT SET'} &middot; {ex.section ?? ex.block} &middot; {nextTag}
            </div>
            {ex.ramp && (
              <div className={styles.rampBest}>
                {bestText ? `BEST CLEAN SO FAR: ${bestText}` : 'NO CLEAN ATTEMPT YET'}
              </div>
            )}
            <div className={styles.nextName}>{ex.displayName}</div>
            <div className={styles.nextWork}>
              <Led text={ex.unit === 'sec' ? `${ex.scaledWork}s` : `x${ex.scaledWork}`} dot={5} unlit="none" label={ex.unit === 'sec' ? `${ex.scaledWork} seconds` : `${ex.scaledWork} reps`} />
              {ex.perSide ? <span className={styles.perSide}>/ side</span> : null}
            </div>
            <div className={styles.loadLine}>{ex.loadText}</div>
            {ex.note && <div className={styles.note}>{ex.note}</div>}
          </div>

          <FormGuide exercise={ex} open={formOpen} onToggle={() => setFormOpen(o => !o)} brief />

          <button className={styles.btnAdd} onClick={() => setReserveOpen(true)}>+ ADD EXERCISE</button>
        </div>
      )}

      <ReservePicker open={reserveOpen} onClose={() => setReserveOpen(false)} />
    </div>
  );
}

