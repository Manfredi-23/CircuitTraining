'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CONFIG } from '@/core/config';
import { displaySubtitle } from '@/core/data-index';
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
  /** Change energy here: the list and the duration follow. */
  onEnergy?: (energy: EnergyKey) => void;
  /** Further actions above START, e.g. making it a routine. */
  extra?: ReactNode;
  /** Open the editor: swap, remove, move, sets, reps, load, add. */
  onEdit?: () => void;
  /** The session carries an edit: for today, or kept until reset. */
  edited?: 'TODAY' | 'KEPT' | null;
  /** Back to the session as written. */
  onReset?: () => void;
}

/**
 * The load line, without the words that say nothing: "No load" and a bare
 * "Bodyweight" are the default, so only a cue or a real load is shown.
 */
export function loadCue(text: string | undefined): string {
  const t = (text ?? '').replace(/^No load\.?\s*/i, '').trim();
  return /^(bodyweight|no load)\.?$/i.test(t) ? '' : t;
}

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
  open, mode, circuit, list, energy, duration, onClose, onStart, onEnergy, extra, onEdit, edited, onReset,
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
        <div className={styles.subtitle}>{displaySubtitle(circuit)}</div>
        <div className={styles.metaRow}>
          <div className={styles.meta}>{duration} min &middot; {energy} &middot; {list.length} exercises</div>
          {onEdit && <button className={styles.edit} onClick={onEdit}>EDIT</button>}
        </div>
        {edited && (
          <div className={styles.edited}>
            {edited === 'KEPT' ? 'YOUR VERSION, KEPT' : 'EDITED FOR TODAY'}
            {onReset && <button className={styles.reset} onClick={onReset}>RESET</button>}
          </div>
        )}
        <div className={styles.focus}>{circuit.focus}</div>
        {onEnergy && (
          <div className={styles.energy} role="tablist" aria-label="Energy">
            {(Object.keys(CONFIG.energy) as EnergyKey[]).map(e => (
              <button
                key={e}
                role="tab"
                aria-selected={e === energy}
                className={`${styles.energyTab}${e === energy ? ` ${styles.energyTabOn}` : ''}`}
                onClick={() => onEnergy(e)}
              >{e}</button>
            ))}
          </div>
        )}
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
              {ex.gated && <div className={styles.locked}>Stand-in until tested</div>}
              {loadCue(ex.loadText) && <div className={styles.load}>{loadCue(ex.loadText)}</div>}
            </div>
            <div className={styles.dose}>{ex.ramp ? `ramp, ${ex.scaledSets}-${ex.ramp.maxAttempts}` : dose(ex)}</div>
            </div>
          </li>
        ))}
      </ol>

      {circuit.note && <div className={styles.note}>{circuit.note}</div>}
      </div>

      {extra}
      <button className={styles.start} onClick={onStart}>START {circuit.title} &middot; {duration} MIN</button>
    </div>
  );
}
