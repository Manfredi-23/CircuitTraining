'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { sessionProgress } from '@/core/session-progress';
import { phasesOf } from '@/core/phases';
import { finishTime, minutesLeft } from '@/core/session-time';
import SessionMap from './SessionMap';
import styles from './SessionProgressBar.module.css';

/**
 * Where you are in the session: one group per exercise, one cell per set, a
 * wider gap where a phase changes (PREP, SKILL, STRENGTH...). Done in ink, the
 * set in hand in accent, the rest faint. The same bar sits on the workout
 * card and on rest, where the accent cell is the set coming up. Under it the
 * minutes left and the finish time; a tap opens the session map.
 */
export default function SessionProgressBar() {
  const { exerciseList, stepIndex, setIndex } = useStore();
  const [mapOpen, setMapOpen] = useState(false);
  // The finish time moves with the clock while a set is on.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  const { groups, setsDone, setsTotal } = sessionProgress(exerciseList, stepIndex, setIndex);
  const phases = phasesOf(exerciseList);
  const left = minutesLeft(exerciseList, stepIndex, setIndex);

  return (
    <>
      <button
        className={styles.wrap}
        onClick={() => setMapOpen(true)}
        aria-label={`Session: exercise ${Math.min(stepIndex + 1, exerciseList.length)} of ${exerciseList.length}, ${left} minutes left. Open the whole session.`}
      >
        <div
          className={styles.bar}
          role="progressbar"
          aria-label="Session progress"
          aria-valuemin={0}
          aria-valuemax={setsTotal}
          aria-valuenow={setsDone}
        >
          {groups.map((cells, i) => (
            <div
              key={i}
              className={`${styles.group}${i > 0 && phases[i] !== phases[i - 1] ? ` ${styles.phaseStart}` : ''}`}
              style={{ flexGrow: cells.length }}
            >
              {cells.map((state, s) => (
                <div key={s} className={`${styles.cell} ${styles[state]}`} />
              ))}
            </div>
          ))}
        </div>
        <div className={styles.meta}>
          <span>EXERCISE {Math.min(stepIndex + 1, exerciseList.length)}/{exerciseList.length} &middot; {setsDone}/{setsTotal} SETS</span>
          <span className={styles.time}>{left} MIN LEFT &middot; ~{finishTime(exerciseList, stepIndex, setIndex)}</span>
        </div>
      </button>
      <SessionMap open={mapOpen} onClose={() => setMapOpen(false)} />
    </>
  );
}
