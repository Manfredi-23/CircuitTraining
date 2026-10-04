'use client';

import { useStore } from '@/store/store';
import { sessionProgress } from '@/core/session-progress';
import styles from './SessionProgressBar.module.css';

/**
 * Where you are in the session: one group per exercise, one cell per set.
 * Done in ink, the set in hand in accent, the rest faint. The same bar sits on
 * the workout card and on rest, where the accent cell is the set coming up.
 */
export default function SessionProgressBar() {
  const { exerciseList, stepIndex, setIndex } = useStore();
  const { groups, setsDone, setsTotal } = sessionProgress(exerciseList, stepIndex, setIndex);

  return (
    <div className={styles.wrap}>
      <div
        className={styles.bar}
        role="progressbar"
        aria-label="Session progress"
        aria-valuemin={0}
        aria-valuemax={setsTotal}
        aria-valuenow={setsDone}
      >
        {groups.map((cells, i) => (
          <div key={i} className={styles.group} style={{ flexGrow: cells.length }}>
            {cells.map((state, s) => (
              <div key={s} className={`${styles.cell} ${styles[state]}`} />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.meta}>
        <span>EXERCISE {Math.min(stepIndex + 1, exerciseList.length)}/{exerciseList.length}</span>
        <span>{setsDone}/{setsTotal} SETS</span>
      </div>
    </div>
  );
}
