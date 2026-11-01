'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CONFIG } from '@/core/config';
import { displaySubtitle } from '@/core/data-index';
import type { Circuit, EnergyKey, ScaledExercise } from '@/core/types';
import { useStore } from '@/store/store';
import { phaseRuns, PHASE_PURPOSE } from '@/core/phases';
import { transferOf } from '@/core/transfer';
import { addsLine, afterLine, bodyWeek, setsByArea } from '@/core/body-week';
import { exerciseLibrary } from '@/core/reserve';
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
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const progress = useStore(s => s.progress);

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

  // Phases (PREP, SKILL, STRENGTH...) head the list unless the session has its own sections (ASSESS).
  const runs = list.some(e => e.section) ? [] : phaseRuns(list);
  const runAt = new Map(runs.map(r => [r.start, r]));
  // What this session adds to the week, and the week after it.
  const adds = setsByArea(list);
  const addText = addsLine(adds);
  const after = addText ? afterLine(bodyWeek({ sessionLog, climbLog, progress }), adds, 3) : '';
  const lib = exerciseLibrary();

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
        {addText && (
          <div className={styles.adds}>
            <div><b>THIS SESSION</b> {addText}</div>
            {after && <div><b>WEEK AFTER</b> {after}</div>}
          </div>
        )}
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
            {runAt.has(i) && (
              <div className={styles.phase}>
                <span className={styles.section}>{runAt.get(i)!.phase} &middot; {runAt.get(i)!.minutes} MIN</span>
                <span className={styles.purpose}>{PHASE_PURPOSE[runAt.get(i)!.phase]}</span>
              </div>
            )}
            <div className={styles.row}>
            <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
            <div className={styles.body}>
              <div className={styles.name}>{ex.displayName}</div>
              {ex.gated && <div className={styles.locked}>Stand-in until tested</div>}
              {ex.slot && (
                <div className={styles.slot}>
                  {ex.slot}: the one done least recently. Also {(ex.options ?? []).map(id => lib.get(id)?.name).filter(Boolean).join(', ')}{onEdit ? ' (SWAP in EDIT).' : '.'}
                </div>
              )}
              {transferOf(ex).length > 0 && (
                <div className={styles.chips}>{transferOf(ex).map(t => <span key={t} className={styles.chip}>{t}</span>)}</div>
              )}
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
