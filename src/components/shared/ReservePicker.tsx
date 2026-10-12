'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { RESERVE_GROUPS, closedGroups, placeOf, reserveFor, type ReserveGroup } from '@/core/reserve';
import { daysBetween, localDate } from '@/core/dates';
import { legSoreness } from '@/core/activity';
import type { Exercise } from '@/core/types';
import styles from './ReservePicker.module.css';

const GROUP_LABEL: Record<ReserveGroup, string> = {
  CORE: 'CORE', ARMS: 'ARMS', SHOULDERS: 'SHLDR', LEGS: 'LEGS', MOBILITY: 'MOBIL', FINGERS: 'FINGR',
};

function dose(e: Exercise): string {
  return `${e.sets} x ${e.unit === 'sec' ? `${e.work}s` : e.work}${e.perSide ? ' /side' : ''}`;
}

function ago(date: string | null): string {
  if (!date) return 'never done';
  const d = daysBetween(date, localDate());
  return d === 0 ? 'done today' : d === 1 ? 'yesterday' : `${d} days ago`;
}

/**
 * The reserve: extra exercises for the running session, by area. Only what
 * the place has and what is safe today; least recently done first. Picks go
 * into the session after the exercise in hand, in block order.
 */
export default function ReservePicker({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mode = useStore(s => s.mode);
  const circuit = useStore(s => s.circuit);
  const exerciseList = useStore(s => s.exerciseList);
  const sessionPain = useStore(s => s.sessionPain);
  const sessionLog = useStore(s => s.sessionLog);
  const activityLog = useStore(s => s.activityLog);
  const addExtra = useStore(s => s.addExtra);
  const [group, setGroup] = useState<ReserveGroup>('CORE');
  const [added, setAdded] = useState<string[]>([]);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) { setAdded([]); requestAnimationFrame(() => setEntered(true)); } else setEntered(false);
  }, [open]);

  const ctx = circuit ? { mode, circuitId: circuit.id, list: exerciseList, pain: sessionPain, sessionLog } : null;
  // Keep what was added in this visit on screen, marked ADDED, instead of letting it vanish.
  const reserve = useMemo(
    () => (ctx ? reserveFor({ ...ctx, list: ctx.list.filter(e => !added.includes(e.id)) }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, mode, circuit, sessionPain, sessionLog, added.length],
  );

  if (!open || !circuit || !ctx || !reserve) return null;
  const closed = closedGroups(ctx);
  const items = reserve[group];
  const sore = group === 'LEGS' && legSoreness(activityLog) !== null;

  return (
    <div
      className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Add an exercise"
    >
      <div className="overlay-header">
        <span className={styles.crumb}>ADD TO {circuit.title}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>
      <div className={styles.place}>
        {placeOf(mode, circuit.id) === 'HOME' ? 'Home: mat, band, portable edge.' : 'Gym: everything.'}
        {mode === 'HEAL' && ' Nothing gripped while the finger heals.'}
      </div>

      <div className={styles.tabs} role="tablist" aria-label="Area">
        {RESERVE_GROUPS.map(g => (
          <button
            key={g}
            role="tab"
            aria-selected={g === group}
            className={`${styles.tab}${g === group ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setGroup(g)}
          >{GROUP_LABEL[g]}</button>
        ))}
      </div>

      <div className={styles.scroll}>
        {closed[group] && <div className={styles.empty}>{closed[group]}</div>}
        {!closed[group] && items.length === 0 && <div className={styles.empty}>Nothing more here for this place.</div>}
        {sore && <div className={styles.warn}>Legs still sore from the last activity. Go easy.</div>}
        {group === 'ARMS' && items.length > 0 && <div className={styles.empty}>Extras: recorded, no XP.</div>}
        {items.map(({ exercise, lastDone, curl }) => {
          const done = added.includes(exercise.id);
          return (
            <div key={exercise.id} className={styles.row}>
              <div className={styles.body}>
                <div className={styles.name}>{exercise.name}</div>
                <div className={styles.meta}>
                  {dose(exercise)} &middot; {ago(lastDone)}
                  {curl && mode === 'DAILY' && ' · goes last'}
                </div>
              </div>
              <button
                className={`${styles.add}${done ? ` ${styles.addDone}` : ''}`}
                disabled={done}
                onClick={() => { addExtra(exercise.id); setAdded(a => [...a, exercise.id]); }}
              >{done ? 'ADDED' : 'ADD'}</button>
            </div>
          );
        })}
      </div>

      <button className={styles.done} onClick={onClose}>
        {added.length ? `DONE (${added.length} ADDED)` : 'BACK'}
      </button>
    </div>
  );
}
