'use client';

import { useEffect, useState } from 'react';
import type { Circuit, EnergyKey, ScaledExercise } from '@/core/types';
import styles from './SessionInfo.module.css';

interface SessionInfoProps {
  open: boolean;
  mode: string;
  circuit: Circuit;
  /** The list exactly as it would run now: this level, this energy, these gates. */
  list: ScaledExercise[];
  energy: EnergyKey;
  duration: number;
  onClose: () => void;
  onStart: () => void;
}

const formatRest = (s: number) =>
  s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`;

function dose(ex: ScaledExercise): string {
  const work = ex.unit === 'sec' ? `${ex.scaledWork}s` : `${ex.scaledWork}`;
  return `${ex.scaledSets} x ${work}${ex.perSide ? ' /side' : ''}`;
}

/**
 * Everything a session contains, before starting it. Built from the same list
 * the workout will run, so what is shown here is what you will be asked to do
 * at today's level and energy, locked exercises already swapped for their
 * stand-ins.
 */
export default function SessionInfo({
  open, mode, circuit, list, energy, duration, onClose, onStart,
}: SessionInfoProps) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setEntered(true));
    else setEntered(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${circuit.title} exercises`}
    >
      <div className="overlay-header">
        <span className={styles.crumb}>{mode} {circuit.circuitNum}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.head}>
        <div className={styles.title}>{circuit.title}</div>
        <div className={styles.subtitle}>{circuit.subtitle}</div>
        <div className={styles.meta}>{duration} min &middot; {energy} &middot; {list.length} exercises</div>
        <div className={styles.focus}>{circuit.focus}</div>
      </div>

      <div className={styles.scroll}>
      <ol className={styles.list}>
        {list.map((ex, i) => (
          <li key={ex.id} className={styles.rowWrap}>
            {ex.section && ex.section !== list[i - 1]?.section && (
              <div className={styles.section}>{ex.section}</div>
            )}
            <div className={styles.row}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            <div className={styles.body}>
              <div className={styles.name}>{ex.displayName}</div>
              <div className={styles.tags}>
                {ex.block}
                {ex.gated && <span className={styles.locked}> &middot; STAND-IN UNTIL TESTED</span>}
              </div>
              <div className={styles.load}>{ex.loadText}</div>
            </div>
            <div className={styles.dose}>
              <div>{ex.ramp ? `ramp, ${ex.scaledSets}-${ex.ramp.maxAttempts}` : dose(ex)}</div>
              <div className={styles.rest}>rest {formatRest(ex.scaledRest)}</div>
            </div>
            </div>
          </li>
        ))}
      </ol>

      {circuit.note && <div className={styles.note}>{circuit.note}</div>}
      </div>

      <button className={styles.start} onClick={onStart}>START {circuit.title}</button>
    </div>
  );
}
