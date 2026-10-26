'use client';

import { useCallback, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store/store';
import { sessionListFor } from '@/store/slices/workout-slice';
import { estimateDuration } from '@/core/engine';
import { isEditable, MAX_SETS } from '@/core/routines';
import { placeOf } from '@/core/reserve';
import { isHealing } from '@/core/recommend';
import { activeDay } from '@/core/today';
import { localDate } from '@/core/dates';
import { formatLoad, getLoadAxis, getOpeningLoad } from '@/core/load';
import {
  activeEdit, addIds, allowedToday, clearTarget, editExercise, editFromCircuit, editWarnings, isChanged,
  moveAt, packsFor, removeAt, similarTo, stepAt, stepTarget, swapAt, MAX_EDIT_ITEMS,
  type EditContext, type SessionEdit,
} from '@/core/session-edit';
import ExercisePicker from './ExercisePicker';
import PackList from './PackList';
import styles from './SessionEditor.module.css';
import packStyles from './ReservePicker.module.css';
import type { Circuit, Exercise, Mode } from '@/core/types';

/**
 * A session changed before starting it: swap, remove, move, sets and reps or
 * seconds, the load planned for today, and exercises or packs added. Every
 * change is saved as it is made and holds for today; KEEP FOR NEXT TIME keeps
 * it on this session until RESET. Rest is not on the screen: it is the
 * protocol's.
 */
export default function SessionEditor({ mode, circuit, onClose }: {
  mode: Mode;
  /** The session as written. */
  circuit: Circuit;
  onClose: () => void;
}) {
  const state = useStore(useShallow(s => ({
    energy: s.energy, progress: s.progress, benchmarkResults: s.benchmarkResults, blockStart: s.blockStart,
    sessionLog: s.sessionLog, climbLog: s.climbLog, tweaks: s.tweaks, dayPlan: s.dayPlan, loadLog: s.loadLog,
    sessionEdits: s.sessionEdits, setSessionEdit: s.setSessionEdit,
  })));
  const today = localDate();
  const stored = activeEdit(state.sessionEdits, circuit.id, today);
  const edit: SessionEdit = stored ?? editFromCircuit(circuit, today);
  const [picker, setPicker] = useState<{ swap: number | null } | null>(null);
  const [packs, setPacks] = useState(false);
  const [packsAdded, setPacksAdded] = useState<string[]>([]);

  const place = placeOf(mode, circuit.id);
  const lastPain = [...state.sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;
  const ctx: EditContext = {
    place, mode,
    healing: isHealing(state.sessionLog, state.climbLog),
    pain: lastPain,
    noKit: activeDay(state.dayPlan).noKit,
  };
  const allow = useCallback((e: Exercise) => allowedToday(e, ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx.place, ctx.mode, ctx.healing, ctx.pain, ctx.noKit]);

  const save = (next: SessionEdit) => {
    // Back to the session as written: nothing to keep.
    state.setSessionEdit(circuit.id, isChanged(circuit, next) ? { ...next, day: today } : null);
  };
  const changed = isChanged(circuit, edit);
  const running = sessionListFor({ ...state, mode }, circuit);
  const minutes = estimateDuration(running);
  const warnings = editWarnings(circuit, edit, place);
  const ids = edit.items.map(i => i.id);
  const swapping = picker?.swap !== null && picker?.swap !== undefined ? editExercise(circuit, edit.items[picker.swap]) : undefined;
  const similar = useMemo(() => (swapping ? similarTo(swapping, ctx, ids) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [swapping?.id, allow]);

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={`Edit ${circuit.title}`}>
      <div className="overlay-header">
        <span className={styles.crumb}>EDIT {mode} {circuit.circuitNum}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Done">X</button>
      </div>

      <div className={styles.scroll}>
        <div className={styles.field}>
          <div className={styles.intro}>
            <div className={styles.listHead}>
              <span className={styles.label}>{circuit.title}</span>
              <span className={styles.minutes}>{minutes} MIN AT {state.energy}</span>
            </div>
            <span className={styles.hint}>
            {changed ? (edit.kept ? 'Your version: kept until you reset it.' : 'Changed for today. Tomorrow it is back as written.') : 'As written. Every change holds for today.'}
            </span>
          </div>
          {edit.items.length === 0 && <div className={styles.empty}>Nothing left. Add an exercise or a pack below.</div>}
          {edit.items.length > 0 && (
            <ol className={styles.list}>
              {edit.items.map((it, i) => {
                const ex = editExercise(circuit, it);
                const num = String(i + 1).padStart(2, '0');
                if (!ex) {
                  return (
                    <li key={it.id} className={styles.card}>
                      <div className={styles.cardHead}>
                        <span className={styles.num}>{num}</span>
                        <span className={styles.name}>No longer in the app</span>
                        <button className={styles.icon} onClick={() => save(removeAt(edit, i))} aria-label="Remove">X</button>
                      </div>
                    </li>
                  );
                }
                const editable = isEditable(ex);
                const unit = ex.unit === 'sec' ? 's' : '';
                // What runs today (level, energy, deload), so the numbers match the session page.
                const runs = running.find(r => r.id === it.id);
                const sets = runs?.scaledSets ?? ex.sets;
                const work = runs?.scaledWork ?? ex.work;
                const axis = ex.ramp ? null : getLoadAxis(ex);
                const opening = axis ? getOpeningLoad({ ...ex, targetLoad: undefined }, state.loadLog) : 0;
                const added = !circuit.exercises.some(e => e.id === it.id);
                return (
                  <li key={it.id} className={styles.card}>
                    <div className={styles.cardHead}>
                      <span className={styles.num}>{num}</span>
                      <div className={styles.title}>
                        <span className={styles.name}>{ex.name}</span>
                        <span className={styles.tag}>{ex.block}{added ? ' · YOURS' : ''}</span>
                      </div>
                      <button className={styles.icon} onClick={() => save(removeAt(edit, i))} aria-label={`Remove ${ex.name}`}>X</button>
                    </div>

                    {editable ? (
                      <div className={styles.fields}>
                        <div className={styles.fieldBox}>
                          <span className={styles.fieldLabel}>SETS</span>
                          <span className={styles.stepper}>
                            <button className={styles.step} disabled={ex.sets <= 1} onClick={() => save(stepAt(circuit, edit, i, 'sets', -1))} aria-label="One set fewer">-</button>
                            <span className={it.sets !== undefined ? styles.valueChanged : styles.value}>{sets}</span>
                            <button className={styles.step} disabled={ex.sets >= MAX_SETS} onClick={() => save(stepAt(circuit, edit, i, 'sets', 1))} aria-label="One set more">+</button>
                          </span>
                        </div>
                        <div className={styles.fieldBox}>
                          <span className={styles.fieldLabel}>{ex.unit === 'sec' ? 'SECONDS' : 'REPS'}{ex.perSide ? ' / SIDE' : ''}</span>
                          <span className={styles.stepper}>
                            <button className={styles.step} onClick={() => save(stepAt(circuit, edit, i, 'work', -1))} aria-label="Less work">-</button>
                            <span className={it.work !== undefined ? styles.valueChanged : styles.value}>{work}{unit}</span>
                            <button className={styles.step} onClick={() => save(stepAt(circuit, edit, i, 'work', 1))} aria-label="More work">+</button>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={styles.fixed}>{sets} x {work}{unit}{ex.perSide ? ' /side' : ''} &middot; taken as written</div>
                    )}

                    {axis && (
                      <div className={styles.fieldBox}>
                        <span className={styles.fieldLabel}>
                          LOAD TODAY
                          {it.target !== undefined
                            ? <button className={styles.textBtn} onClick={() => save(clearTarget(edit, i))}>BACK TO LAST TIME</button>
                            : <span className={styles.fieldNote}>as last time</span>}
                        </span>
                        <span className={`${styles.stepper} ${styles.stepperWide}`}>
                          <button className={styles.step} onClick={() => save(stepTarget(circuit, edit, i, -1, opening))} aria-label="Less load">-</button>
                          <span className={it.target !== undefined ? styles.valueChanged : styles.value}>{formatLoad(it.target ?? opening, axis)}</span>
                          <button className={styles.step} onClick={() => save(stepTarget(circuit, edit, i, 1, opening))} aria-label="More load">+</button>
                        </span>
                      </div>
                    )}

                    <div className={styles.cardFoot}>
                      <button className={styles.icon} disabled={i === 0} onClick={() => save(moveAt(edit, i, -1))} aria-label={`Move ${ex.name} up`}>&uarr;</button>
                      <button className={styles.icon} disabled={i === edit.items.length - 1} onClick={() => save(moveAt(edit, i, 1))} aria-label={`Move ${ex.name} down`}>&darr;</button>
                      <button className={styles.swap} onClick={() => setPicker({ swap: i })}>SWAP</button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
          <div className={styles.addRow}>
            <button className={styles.add} disabled={edit.items.length >= MAX_EDIT_ITEMS} onClick={() => setPicker({ swap: null })}>+ EXERCISE</button>
            <button className={styles.add} disabled={edit.items.length >= MAX_EDIT_ITEMS} onClick={() => { setPacksAdded([]); setPacks(true); }}>+ PACK</button>
          </div>
          <span className={styles.hint}>Sets and reps as they run at {state.energy}. Rest stays as each exercise writes it; level picks the variation.</span>
        </div>

        {warnings.length > 0 && (
          <div className={styles.warnings}>
            {warnings.map(w => <p key={w}>{w}</p>)}
          </div>
        )}

        {changed && (
          <div className={styles.field}>
            <span className={styles.label}>FOR NEXT TIME</span>
            <div className={styles.chips}>
              <button
                className={`${styles.chip}${!edit.kept ? ` ${styles.chipOn}` : ''}`}
                aria-pressed={!edit.kept}
                onClick={() => save({ ...edit, kept: undefined })}
              >TODAY ONLY</button>
              <button
                className={`${styles.chip}${edit.kept ? ` ${styles.chipOn}` : ''}`}
                aria-pressed={Boolean(edit.kept)}
                onClick={() => save({ ...edit, kept: true })}
              >KEEP FOR NEXT TIME</button>
            </div>
            <button className={styles.delete} onClick={() => state.setSessionEdit(circuit.id, null)}>RESET TO THE PROGRAMME</button>
          </div>
        )}
      </div>

      <button className={styles.save} onClick={onClose}>
        DONE &middot; {edit.items.length} EXERCISE{edit.items.length === 1 ? '' : 'S'} &middot; {minutes} MIN
      </button>

      {picker && (
        <ExercisePicker
          place={place}
          taken={ids}
          title={picker.swap === null ? 'ADD EXERCISE' : `SWAP ${swapping?.name ?? ''}`.toUpperCase()}
          similar={picker.swap === null ? undefined : similar}
          allow={allow}
          onClose={() => setPicker(null)}
          onPick={id => {
            save(picker.swap === null ? addIds(circuit, edit, [id], mode) : swapAt(edit, picker.swap, id));
            setPicker(null);
          }}
        />
      )}

      {packs && (
        <div className={`overlay-panel overlay-enter ${packStyles.panel}`} style={{ zIndex: 60 }} role="dialog" aria-modal="true" aria-label="Add a pack">
          <div className="overlay-header">
            <span className={packStyles.crumb}>ADD A PACK TO {circuit.title}</span>
            <button className="overlay-close" onClick={() => setPacks(false)} aria-label="Close">X</button>
          </div>
          <div className={`${packStyles.place} ${styles.packIntro}`}>Each exercise goes where it belongs: heavy first, curls last.</div>
          <div className={packStyles.scroll}>
            <PackList
              offers={packsFor(ctx, ids)}
              added={packsAdded}
              energy={state.energy}
              progress={state.progress}
              onAdd={offer => { save(addIds(circuit, edit, offer.ids, mode)); setPacksAdded(a => [...a, offer.pack.id]); }}
            />
          </div>
          <button className={packStyles.done} onClick={() => setPacks(false)}>
            {packsAdded.length ? `DONE (${packsAdded.length} ADDED)` : 'BACK'}
          </button>
        </div>
      )}
    </div>
  );
}
