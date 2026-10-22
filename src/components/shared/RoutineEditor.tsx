'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import {
  addItem, isEditable, itemExercise, moveItem, removeItem, renameRoutine, routineMinutes, routineWarnings,
  stepItem, swapItem, MAX_ITEMS, NAME_MAX, type Routine,
} from '@/core/routines';
import { exerciseLibrary } from '@/core/reserve';
import ExercisePicker from './ExercisePicker';
import styles from './RoutineEditor.module.css';

/**
 * A routine, edited in place: name, where, and the list. Each exercise can
 * move up or down, be swapped for another, lose or gain sets and reps or
 * seconds within bounds, or go. Rest is not on the screen: it is the
 * protocol's. Warnings say what a coach would point out; nothing is blocked.
 */
export default function RoutineEditor({ routine, isNew, onClose }: {
  routine: Routine;
  isNew: boolean;
  onClose: () => void;
}) {
  const progress = useStore(s => s.progress);
  const energy = useStore(s => s.energy);
  const saveRoutine = useStore(s => s.saveRoutine);
  const deleteRoutine = useStore(s => s.deleteRoutine);
  const [r, setR] = useState<Routine>(routine);
  const [name, setName] = useState(routine.name);
  const [picker, setPicker] = useState<{ swap: number | null } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lib = exerciseLibrary();
  const warnings = routineWarnings(r);
  const minutes = r.items.length ? routineMinutes(r, progress, energy) : 0;

  const save = () => {
    saveRoutine(renameRoutine(r, name));
    onClose();
  };

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label="Edit routine">
      <div className="overlay-header">
        <span className={styles.crumb}>{isNew ? 'NEW ROUTINE' : 'EDIT ROUTINE'}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close without saving">X</button>
      </div>

      <div className={styles.scroll}>
        <label className={styles.field}>
          <span className={styles.label}>NAME</span>
          <input
            className={styles.input}
            value={name}
            maxLength={NAME_MAX}
            onChange={e => setName(e.target.value.toUpperCase())}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>WHERE</span>
          <div className={styles.chips}>
            {(['HOME', 'GYM'] as const).map(p => (
              <button
                key={p}
                className={`${styles.chip}${r.place === p ? ` ${styles.chipOn}` : ''}`}
                aria-pressed={r.place === p}
                onClick={() => setR({ ...r, place: p })}
              >{p === 'HOME' ? 'HOME' : 'CAVE'}</button>
            ))}
          </div>
          <span className={styles.hint}>{r.place === 'HOME' ? 'Logged as DAILY: mat, band, portable edge.' : 'Logged as CAVE: the gym, everything in it.'}</span>
        </div>

        <div className={styles.field}>
          <div className={styles.listHead}>
            <span className={styles.label}>EXERCISES</span>
            <span className={styles.minutes}>{r.items.length ? `${minutes} MIN AT ${energy}` : ''}</span>
          </div>
          {r.items.length === 0 && <div className={styles.empty}>No exercises yet. Add the first one below.</div>}
          {r.items.length > 0 && (
            <ol className={styles.list}>
              {r.items.map((it, i) => {
                const base = lib.get(it.id);
                const ex = itemExercise(it);
                if (!base || !ex) {
                  return (
                    <li key={it.id} className={styles.item}>
                      <span className={styles.name}>No longer in the app</span>
                      <button className={styles.icon} onClick={() => setR(removeItem(r, i))} aria-label="Remove">X</button>
                    </li>
                  );
                }
                const edit = isEditable(base);
                const unit = ex.unit === 'sec' ? 's' : '';
                return (
                  <li key={it.id} className={styles.item}>
                    <div className={styles.itemTop}>
                      <span className={styles.name}>{ex.name}</span>
                      <button className={styles.icon} disabled={i === 0} onClick={() => setR(moveItem(r, i, -1))} aria-label={`Move ${ex.name} up`}>&uarr;</button>
                      <button className={styles.icon} disabled={i === r.items.length - 1} onClick={() => setR(moveItem(r, i, 1))} aria-label={`Move ${ex.name} down`}>&darr;</button>
                      <button className={styles.icon} onClick={() => setR(removeItem(r, i))} aria-label={`Remove ${ex.name}`}>X</button>
                    </div>
                    <div className={styles.itemBottom}>
                      {edit ? (
                        <>
                          <span className={styles.stepper}>
                            <button className={styles.step} onClick={() => setR(stepItem(r, i, 'sets', -1))} aria-label="One set fewer">-</button>
                            <span className={it.sets !== undefined ? styles.valueChanged : styles.value}>{ex.sets}<small> x</small></span>
                            <button className={styles.step} onClick={() => setR(stepItem(r, i, 'sets', 1))} aria-label="One set more">+</button>
                          </span>
                          <span className={styles.stepper}>
                            <button className={styles.step} onClick={() => setR(stepItem(r, i, 'work', -1))} aria-label="Less work">-</button>
                            <span className={it.work !== undefined ? styles.valueChanged : styles.value}>{ex.work}{unit}<small>{ex.perSide ? '/s' : ''}</small></span>
                            <button className={styles.step} onClick={() => setR(stepItem(r, i, 'work', 1))} aria-label="More work">+</button>
                          </span>
                        </>
                      ) : (
                        <span className={styles.fixed}>{ex.sets} x {ex.work}{unit} &middot; taken as written</span>
                      )}
                      <button className={styles.swap} onClick={() => setPicker({ swap: i })}>SWAP</button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <button className={styles.add} disabled={r.items.length >= MAX_ITEMS} onClick={() => setPicker({ swap: null })}>
            + ADD EXERCISE{r.items.length >= MAX_ITEMS ? ` (${MAX_ITEMS} MAX)` : ''}
          </button>
          <span className={styles.hint}>Rest stays as each exercise writes it. Level picks the variation; energy and the deload week still scale sets.</span>
        </div>

        {warnings.length > 0 && (
          <div className={styles.warnings}>
            {warnings.map(w => <p key={w}>{w}</p>)}
          </div>
        )}

        {!isNew && (
          <div className={styles.field}>
            {!confirmDelete ? (
              <button className={styles.delete} onClick={() => setConfirmDelete(true)}>DELETE ROUTINE</button>
            ) : (
              <div className={styles.confirm}>
                <p>Delete {r.name}? It also leaves the weekly plan. Sessions already done stay in the log.</p>
                <div className={styles.confirmRow}>
                  <button className={styles.deleteNow} onClick={() => { deleteRoutine(r.id); onClose(); }}>DELETE</button>
                  <button className={styles.keep} onClick={() => setConfirmDelete(false)}>KEEP IT</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <button className={styles.save} disabled={!r.items.length || !name.trim()} onClick={save}>
        SAVE{r.items.length ? ` · ${r.items.length} EXERCISE${r.items.length === 1 ? '' : 'S'}` : ''}
      </button>

      {picker && (
        <ExercisePicker
          place={r.place}
          taken={r.items.map(i => i.id)}
          title={picker.swap === null ? 'ADD EXERCISE' : `SWAP ${lib.get(r.items[picker.swap]?.id)?.name ?? ''}`.toUpperCase()}
          onClose={() => setPicker(null)}
          onPick={id => {
            setR(picker.swap === null ? addItem(r, id) : swapItem(r, picker.swap, id));
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
