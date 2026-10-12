'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { adjustable, describeTweak, setBounds } from '@/core/adjust';
import { hapticTap } from '@/native/native';
import styles from './AdjustControls.module.css';

/**
 * HARDER / EASIER and +/- SET on the workout card.
 *
 * HARDER and EASIER change the exercise for good (a variation rung, or reps
 * and seconds) and say what they changed; the change shows under the buttons
 * with a RESET until it is undone. Sets are today only.
 */
export default function AdjustControls() {
  const ex = useStore(s => s.currentExercise);
  const tweaks = useStore(s => s.tweaks);
  const setIndex = useStore(s => s.setIndex);
  const adjustExercise = useStore(s => s.adjustExercise);
  const resetTweak = useStore(s => s.resetTweak);
  const changeSets = useStore(s => s.changeSets);
  const [message, setMessage] = useState<{ id: string; text: string } | null>(null);

  if (!ex) return null;
  const canAdjust = adjustable(ex);
  const bounds = setBounds(ex, setIndex);
  if (!canAdjust && !bounds) return null;

  const tweakText = describeTweak(ex, tweaks[ex.id]);
  const shown = message?.id === ex.id ? message.text : null;
  const tap = (dir: 1 | -1) => {
    void hapticTap();
    setMessage({ id: ex.id, text: adjustExercise(dir) });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {canAdjust && (
          <>
            <button className={styles.btn} onClick={() => tap(-1)}>EASIER</button>
            <button className={styles.btn} onClick={() => tap(1)}>HARDER</button>
          </>
        )}
        {bounds && (
          <>
            <button
              className={styles.btn}
              disabled={ex.scaledSets <= bounds[0]}
              onClick={() => changeSets(-1)}
              aria-label="One set fewer today"
            >-SET</button>
            <button
              className={styles.btn}
              disabled={ex.scaledSets >= bounds[1]}
              onClick={() => changeSets(1)}
              aria-label="One set more today"
            >+SET</button>
          </>
        )}
      </div>
      {shown && <div className={styles.message} aria-live="polite">{shown}</div>}
      {tweakText && (
        <div className={styles.tweak}>
          <span>{tweakText}</span>
          <button className={styles.reset} onClick={() => { resetTweak(); setMessage(null); }}>RESET</button>
        </div>
      )}
      {canAdjust && !tweakText && !shown && (
        <div className={styles.hint}>Harder and easier are kept for next time. Sets are today only.</div>
      )}
    </div>
  );
}
