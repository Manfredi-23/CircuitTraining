'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store/store';
import { circuitFor, sessionListFor } from '@/store/slices/workout-slice';
import { activeEdit, addIds, editFromCircuit, isChanged, itemIndexOf, removeAt, swapAt, MAX_EDIT_ITEMS, type SessionEdit } from '@/core/session-edit';
import { editContextFor } from '@/core/alternatives';
import { lastDoneMap } from '@/core/slots';
import { ROUTINE_PREFIX } from '@/core/routines';
import { localDate } from '@/core/dates';
import { asksPainCheck, asksReadiness, applyFingerCheck, estimateDuration, scaleExercise, type FingerCheck } from '@/core/engine';
import SessionInfo from '@/components/shared/SessionInfo';
import PainCheck from '@/components/shared/PainCheck';
import SessionEditor from '@/components/shared/SessionEditor';
import SwapPicker from '@/components/shared/SwapPicker';
import AddSheet from '@/components/shared/AddSheet';
import type { Circuit, Mode, ScaledExercise } from '@/core/types';

export interface LaunchTarget {
  mode: Mode;
  circuit: Circuit;
  /** Actions shown above START in the session view, e.g. MAKE IT MINE. */
  extra?: ReactNode;
}

/**
 * Opening and starting a session from anywhere: `show` opens what is in it
 * (with energy and START), `start` goes straight to the pain check when the
 * session loads the fingers, or into the workout. Programme sessions, routines
 * and built sessions all run through `startCustom` with the list built the
 * same way, so the session shown is the session run.
 */
export function useLauncher() {
  // Only what the session list and the pain check read: a rerender on any
  // other change (a timer tick, a stats filter) would rebuild every list.
  const state = useStore(useShallow(s => ({
    energy: s.energy, progress: s.progress, benchmarkResults: s.benchmarkResults, blockStart: s.blockStart,
    sessionLog: s.sessionLog, tweaks: s.tweaks, dayPlan: s.dayPlan, sessionEdits: s.sessionEdits, climbLog: s.climbLog,
    setEnergy: s.setEnergy, selectCircuit: s.selectCircuit, startCustom: s.startCustom, setSessionEdit: s.setSessionEdit,
  })));
  const [info, setInfo] = useState<LaunchTarget | null>(null);
  const [pain, setPain] = useState<LaunchTarget | null>(null);
  const [editing, setEditing] = useState(false);
  // A swipe on the session page (v45): SWAP opens the picker, OUT takes it out
  // for today with a short UNDO, + ADD opens the groups.
  const [swapping, setSwapping] = useState<ScaledExercise | null>(null);
  const [adding, setAdding] = useState(false);
  const [undoEdit, setUndoEdit] = useState<{ text: string; prev: SessionEdit | null } | null>(null);
  useEffect(() => {
    if (!undoEdit) return;
    const t = window.setTimeout(() => setUndoEdit(null), 6000);
    return () => window.clearTimeout(t);
  }, [undoEdit]);
  const lastDone = useMemo(() => lastDoneMap(state.sessionLog), [state.sessionLog]);

  const listOf = (t: LaunchTarget) => sessionListFor({ ...state, mode: t.mode }, t.circuit);
  /** The session as it runs today, with the edit made on its page. */
  const runs = (t: LaunchTarget) => circuitFor(state, t.circuit);
  const run = (t: LaunchTarget, check?: FingerCheck) => {
    state.selectCircuit(t.mode, t.circuit.id);
    state.startCustom(runs(t), listOf(t), t.mode, check);
  };
  const start = (t: LaunchTarget) => {
    setInfo(null);
    setEditing(false);
    setSwapping(null);
    setAdding(false);
    if (asksReadiness(runs(t))) setPain(t);
    else run(t);
  };
  const lastPain = [...state.sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;
  const lastReadiness = [...state.sessionLog].reverse().find(s => s.readiness !== undefined)?.readiness ?? null;
  const remaining = (t: LaunchTarget, check: FingerCheck) =>
    applyFingerCheck(listOf(t), check, runs(t), ex => scaleExercise(ex, state.energy, state.progress, { tweaks: state.tweaks }))
      .filter(e => e.block !== 'WARMUP').length;

  const infoList = info ? listOf(info) : [];
  const today = localDate();
  const edit = info ? activeEdit(state.sessionEdits, info.circuit.id, today) : null;
  const working = info ? edit ?? editFromCircuit(info.circuit, today) : null;
  const ctx = info ? editContextFor(info.mode, info.circuit.id, state) : null;
  const saveEdit = (next: SessionEdit) => {
    if (!info) return;
    state.setSessionEdit(info.circuit.id, isChanged(info.circuit, next) ? { ...next, day: today } : null);
  };
  const close = () => { setInfo(null); setEditing(false); setSwapping(null); setAdding(false); setUndoEdit(null); };
  const rowActions = (ex: ScaledExercise) => {
    if (!info || !working) return null;
    const at = itemIndexOf(info.circuit, working, ex.id);
    if (at < 0) return null;
    const acts = [];
    if (ex.block !== 'TEST') acts.push({ label: 'SWAP', aria: `Swap ${ex.displayName}`, onClick: () => setSwapping(ex) });
    acts.push({
      label: 'OUT',
      aria: `Take ${ex.displayName} out`,
      onClick: () => { setUndoEdit({ text: `${ex.displayName} out.`, prev: edit }); saveEdit(removeAt(working, at)); },
    });
    return acts;
  };
  const element = (
    <>
      {info && (
        <SessionInfo
          open
          mode={info.mode}
          circuit={info.circuit}
          list={infoList}
          energy={state.energy}
          duration={estimateDuration(infoList)}
          onEnergy={state.setEnergy}
          extra={info.extra}
          // A routine is edited in its own editor (EDIT ROUTINE).
          onEdit={info.circuit.id.startsWith(ROUTINE_PREFIX) ? undefined : () => setEditing(true)}
          edited={edit ? (edit.kept ? 'KEPT' : 'TODAY') : null}
          onReset={() => { setUndoEdit(null); state.setSessionEdit(info.circuit.id, null); }}
          onKeep={() => edit && state.setSessionEdit(info.circuit.id, { ...edit, kept: true })}
          rowActions={rowActions}
          onAdd={() => setAdding(true)}
          undo={undoEdit ? { text: undoEdit.text, onUndo: () => { state.setSessionEdit(info.circuit.id, undoEdit.prev); setUndoEdit(null); } } : null}
          onClose={close}
          onStart={() => start(info)}
        />
      )}
      {info && swapping && working && ctx && (
        <SwapPicker
          exercise={swapping}
          ctx={ctx}
          taken={infoList.map(e => e.id)}
          onClose={() => setSwapping(null)}
          onPick={id => {
            const at = itemIndexOf(info.circuit, working, swapping.id);
            if (at >= 0) saveEdit(swapAt(working, at, id));
            setSwapping(null);
          }}
        />
      )}
      {info && adding && working && ctx && (
        <AddSheet
          title={info.circuit.title}
          ctx={ctx}
          taken={infoList.map(e => e.id)}
          lastDone={lastDone}
          energy={state.energy}
          progress={state.progress}
          full={working.items.length >= MAX_EDIT_ITEMS}
          onAdd={ids => {
            // Read the edit as it stands now: several adds in one visit stack.
            const now = activeEdit(useStore.getState().sessionEdits, info.circuit.id, today) ?? editFromCircuit(info.circuit, today);
            saveEdit(addIds(info.circuit, now, ids, info.mode));
          }}
          onClose={() => setAdding(false)}
        />
      )}
      {info && editing && (
        <SessionEditor mode={info.mode} circuit={info.circuit} onClose={() => setEditing(false)} />
      )}
      {pain && (
        <PainCheck
          open
          title={pain.circuit.title}
          askPain={asksPainCheck(runs(pain))}
          lastPain={lastPain}
          lastReadiness={lastReadiness}
          remainingFor={check => remaining(pain, check)}
          onClose={() => setPain(null)}
          onStart={check => { const t = pain; setPain(null); run(t, check); }}
        />
      )}
    </>
  );

  return { show: (t: LaunchTarget | null) => { setInfo(t); setSwapping(null); setAdding(false); setUndoEdit(null); }, start, listOf, element };
}
