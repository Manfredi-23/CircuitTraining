'use client';

import { useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store/store';
import { circuitFor, sessionListFor } from '@/store/slices/workout-slice';
import { activeEdit } from '@/core/session-edit';
import { ROUTINE_PREFIX } from '@/core/routines';
import { localDate } from '@/core/dates';
import { asksPainCheck, asksReadiness, applyFingerCheck, estimateDuration, scaleExercise, type FingerCheck } from '@/core/engine';
import SessionInfo from '@/components/shared/SessionInfo';
import PainCheck from '@/components/shared/PainCheck';
import SessionEditor from '@/components/shared/SessionEditor';
import type { Circuit, Mode } from '@/core/types';

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
    sessionLog: s.sessionLog, tweaks: s.tweaks, dayPlan: s.dayPlan, sessionEdits: s.sessionEdits,
    setEnergy: s.setEnergy, selectCircuit: s.selectCircuit, startCustom: s.startCustom, setSessionEdit: s.setSessionEdit,
  })));
  const [info, setInfo] = useState<LaunchTarget | null>(null);
  const [pain, setPain] = useState<LaunchTarget | null>(null);
  const [editing, setEditing] = useState(false);

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
    if (asksReadiness(runs(t))) setPain(t);
    else run(t);
  };
  const lastPain = [...state.sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;
  const lastReadiness = [...state.sessionLog].reverse().find(s => s.readiness !== undefined)?.readiness ?? null;
  const remaining = (t: LaunchTarget, check: FingerCheck) =>
    applyFingerCheck(listOf(t), check, runs(t), ex => scaleExercise(ex, state.energy, state.progress, { tweaks: state.tweaks }))
      .filter(e => e.block !== 'WARMUP').length;

  const infoList = info ? listOf(info) : [];
  const edit = info ? activeEdit(state.sessionEdits, info.circuit.id, localDate()) : null;
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
          onReset={() => state.setSessionEdit(info.circuit.id, null)}
          onClose={() => { setInfo(null); setEditing(false); }}
          onStart={() => start(info)}
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

  return { show: (t: LaunchTarget | null) => setInfo(t), start, listOf, element };
}
