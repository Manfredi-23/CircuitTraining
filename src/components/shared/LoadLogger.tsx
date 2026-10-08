'use client';

import { useStore } from '@/store/store';
import { getLoadAxis, getLastLoad, formatLoad, formatLoadDate } from '@/core/load';
import { benchmarkValueFromEntry, currentBodyweight, latestResult } from '@/core/benchmarks';
import { goalKg, percentOf } from '@/core/rehab';
import { hapticTap } from '@/native/native';
import { suggestLoad } from '@/core/progression';
import { getBlockWeek, deloads } from '@/core/block';
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
  const sessionLog = useStore(s => s.sessionLog);
  const blockStart = useStore(s => s.blockStart);
  const circuit = useStore(s => s.circuit);
  const setLoad = useStore(s => s.setLoad);

  const axis = getLoadAxis(exercise);
  if (!axis || pendingLoad === null) return null;

  const last = getLastLoad(loadLog, exercise.id);
  const delta = last && last.unit === axis.unit ? pendingLoad - last.value : null;

  // A test entered in kilos is judged in % bodyweight. Show the converted
  // figure, because that is the number the gates and standards read.
  const record = exercise.records;
  const converted = record && record.convert.endsWith('pct-bw')
    ? `= ${benchmarkValueFromEntry(record, pendingLoad, currentBodyweight(benchmarkResults))}% BW`
    : null;

  // The injured finger read against the healthy one: how far, and the goal.
  const cmp = exercise.comparesTo;
  const reference = cmp ? latestResult(benchmarkResults, cmp.benchmarkId) : null;
  const pct = cmp && reference ? percentOf(pendingLoad, reference.value) : null;
  const compared = !cmp ? null
    : pct === null ? `No ${cmp.label.toLowerCase()} result yet: run the test first`
    : `= ${pct}% of ${cmp.label.toLowerCase()} · goal ${cmp.goalPct}% (${formatLoad(goalKg(reference!.value, cmp.goalPct), axis)})`;

  // The next load, from how the last session went. One tap to take it.
  const deload = Boolean(circuit && deloads(circuit) && getBlockWeek(blockStart, sessionLog).deload);
  const suggestion = suggestLoad(exercise, loadLog, sessionLog, deload);

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
          {compared && (
            <span className={pct !== null && cmp && pct >= cmp.goalPct ? styles.deltaUp : styles.deltaDown}>{compared}</span>
          )}
          {record && (
            <span className={styles.deltaDown}>
              {exercise.ramp ? 'best clean attempt is saved' : 'saved on the last DONE'}
            </span>
          )}
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

      {suggestion && (
        <div className={styles.suggest}>
          <span className={styles.suggestText}>{suggestion.reason}</span>
          {suggestion.kind === 'up' && pendingLoad !== suggestion.value && (
            <button className={styles.suggestBtn} onClick={() => { setLoad(suggestion.value); void hapticTap(); }}>
              TRY {formatLoad(suggestion.value, axis)}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
