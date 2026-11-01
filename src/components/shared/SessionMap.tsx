'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { phaseRuns, PHASE_PURPOSE } from '@/core/phases';
import { finishTime, minutesLeft } from '@/core/session-time';
import { isAhead, setsEditable } from '@/core/live-edit';
import type { ScaledExercise } from '@/core/types';
import styles from './SessionMap.module.css';

function dose(ex: ScaledExercise): string {
  if (ex.ramp) return `ramp, up to ${ex.ramp.maxAttempts}`;
  return `${ex.scaledSets} x ${ex.unit === 'sec' ? `${ex.scaledWork}s` : ex.scaledWork}${ex.perSide ? ' /side' : ''}`;
}

/**
 * The session map (v43): the whole session, phase by phase, opened from the
 * progress bar. What is done says so; the exercise in hand is marked NOW;
 * anything still to come can go to the end (LATER, for a busy rack), come
 * out, move up or down, or take a set more or less. Rest never shows.
 */
export default function SessionMap({ open, onClose }: { open: boolean; onClose: () => void }) {
  const list = useStore(s => s.exerciseList);
  const stepIndex = useStore(s => s.stepIndex);
  const setIndex = useStore(s => s.setIndex);
  const doneSets = useStore(s => s.doneSets);
  const circuit = useStore(s => s.circuit);
  const editAhead = useStore(s => s.editAhead);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setEntered(true)); else setEntered(false);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !circuit) return null;
  const runs = phaseRuns(list);
  const left = minutesLeft(list, stepIndex, setIndex);

  return (
    <div className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`} role="dialog" aria-modal="true" aria-label="The whole session">
      <div className="overlay-header">
        <span className={styles.crumb}>{circuit.title}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>
      <div className={styles.head}>
        <span className={styles.left}>{left} MIN LEFT</span>
        <span className={styles.finish}>DONE ~{finishTime(list, stepIndex, setIndex)}</span>
      </div>
      <p className={styles.hint}>Anything still to come: LATER moves it to the end, X takes it out for today.</p>

      <div className={styles.scroll}>
        {runs.map(run => (
          <section key={`${run.phase}-${run.start}`} className={styles.phase}>
            <div className={styles.phaseHead}>
              <span className={styles.phaseName}>{run.phase}</span>
              <span className={styles.phaseMin}>{run.minutes} MIN</span>
            </div>
            <div className={styles.purpose}>{PHASE_PURPOSE[run.phase]}</div>
            <ol className={styles.list}>
              {list.slice(run.start, run.end).map((ex, k) => {
                const i = run.start + k;
                const ahead = isAhead(stepIndex, i, list.length);
                const state = i < stepIndex ? ((doneSets[ex.id] ?? 0) > 0 ? `DONE ${doneSets[ex.id]}/${ex.scaledSets}` : 'SKIPPED')
                  : i === stepIndex ? 'NOW' : '';
                return (
                  <li key={ex.id} className={`${styles.row}${i < stepIndex ? ` ${styles.past}` : ''}${i === stepIndex ? ` ${styles.now}` : ''}`}>
                    <div className={styles.line}>
                      <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                      <span className={styles.name}>{ex.displayName}</span>
                      <span className={styles.dose}>{state || dose(ex)}</span>
                    </div>
                    {ahead && (
                      <div className={styles.actions}>
                        <button onClick={() => editAhead('up', i)} disabled={!isAhead(stepIndex, i - 1, list.length)} aria-label={`Move ${ex.displayName} up`}>UP</button>
                        <button onClick={() => editAhead('down', i)} disabled={i === list.length - 1} aria-label={`Move ${ex.displayName} down`}>DOWN</button>
                        {setsEditable(ex) && <button onClick={() => editAhead('fewer', i)} aria-label="One set fewer">-SET</button>}
                        {setsEditable(ex) && <button onClick={() => editAhead('more', i)} aria-label="One set more">+SET</button>}
                        <button onClick={() => editAhead('later', i)} disabled={i === list.length - 1}>LATER</button>
                        <button className={styles.drop} onClick={() => editAhead('drop', i)} aria-label={`Take ${ex.displayName} out`}>X</button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      <button className={styles.back} onClick={onClose}>BACK TO THE SET</button>
    </div>
  );
}
