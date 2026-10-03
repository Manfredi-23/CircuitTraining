'use client';

import { useStore } from '@/store/store';
import { getLoadAxis, getLastLoad, formatLoad, formatLoadDate } from '@/core/load';
import { benchmarkValueFromEntry, currentBodyweight } from '@/core/benchmarks';
import { hapticTap } from '@/native/native';
import type { ScaledExercise } from '@/core/types';
import styles from './LoadLogger.module.css';

/**
 * The load stepper on the workout card.
 *
 * Opens on what you lifted last time for this exercise, so adding load is a
 * decision against a known number rather than a guess. The value is written to
 * the log when the exercise's last set is marked DONE — no separate save, and
 * nothing recorded for work that was skipped.
 *
 * On a TEST exercise the same stepper enters the result, which is saved as a
 * benchmark on DONE and opens any gate it clears.
 *
 * Renders nothing for exercises with no load axis: bodyweight and band work
 * progress through the variation ladder, and a number there would be noise.
 */
export default function LoadLogger({ exercise }: { exercise: ScaledExercise }) {
  const pendingLoad = useStore(s => s.pendingLoad);
  const adjustLoad = useStore(s => s.adjustLoad);
  const loadLog = useStore(s => s.loadLog);
  const benchmarkResults = useStore(s => s.benchmarkResults);

  const axis = getLoadAxis(exercise);
  if (!axis || pendingLoad === null) return null;

  const last = getLastLoad(loadLog, exercise.id);
  const delta = last && last.unit === axis.unit ? pendingLoad - last.value : null;

  // A test entered in kilos is judged in % bodyweight. Show the converted
  // figure, because that is the number the gates and standards read.
  const record = exercise.records;
  const converted = record && record.convert !== 'identity'
    ? `= ${benchmarkValueFromEntry(record, pendingLoad, currentBodyweight(benchmarkResults))}% BW`
    : null;

  const step = (steps: number) => {
    adjustLoad(steps);
    void hapticTap();
  };

  return (
    <div className={styles.box}>
      <div className={styles.head}>
        <span className={styles.label}>{axis.label}</span>
        <span className={styles.last}>
          {last
            ? `LAST ${formatLoad(last.value, axis)} · ${formatLoadDate(last.date)}`
            : 'FIRST TIME'}
        </span>
      </div>

      <div className={styles.stepper}>
        <button
          className={styles.stepBtn}
          onClick={() => step(-1)}
          disabled={pendingLoad <= axis.min}
          aria-label={`Decrease ${axis.label.toLowerCase()}`}
        >
          -
        </button>

        <div className={styles.valueWrap}>
          <span className={styles.value}>{formatLoad(pendingLoad, axis)}</span>
          {delta !== null && delta !== 0 && (
            <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>
              {delta > 0 ? '+' : ''}{Number.isInteger(delta) ? delta : delta.toFixed(1)} vs last
            </span>
          )}
          {converted && <span className={styles.deltaDown}>{converted}</span>}
          {record && <span className={styles.deltaDown}>saved on the last DONE</span>}
        </div>

        <button
          className={styles.stepBtn}
          onClick={() => step(1)}
          disabled={pendingLoad >= axis.max}
          aria-label={`Increase ${axis.label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
