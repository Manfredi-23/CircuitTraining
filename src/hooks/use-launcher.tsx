'use client';

import { useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store/store';
import { sessionListFor } from '@/store/slices/workout-slice';
import { asksPainCheck, applyPainCheck, estimateDuration } from '@/core/engine';
import SessionInfo from '@/components/shared/SessionInfo';
import PainCheck from '@/components/shared/PainCheck';
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
    sessionLog: s.sessionLog, tweaks: s.tweaks, dayPlan: s.dayPlan,
    setEnergy: s.setEnergy, selectCircuit: s.selectCircuit, startCustom: s.startCustom,
  })));
  const [info, setInfo] = useState<LaunchTarget | null>(null);
  const [pain, setPain] = useState<LaunchTarget | null>(null);

  const listOf = (t: LaunchTarget) => sessionListFor({ ...state, mode: t.mode }, t.circuit);
  const run = (t: LaunchTarget, score?: number) => {
    state.selectCircuit(t.mode, t.circuit.id);
    state.startCustom(t.circuit, listOf(t), t.mode, score);
  };
  const start = (t: LaunchTarget) => {
    setInfo(null);
    if (asksPainCheck(t.circuit)) setPain(t);
    else run(t);
  };
  const lastPain = [...state.sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;

  const infoList = info ? listOf(info) : [];
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
          onClose={() => setInfo(null)}
          onStart={() => start(info)}
        />
      )}
      {pain && (
        <PainCheck
          open
          title={pain.circuit.title}
          lastPain={lastPain}
          remainingFor={p => applyPainCheck(listOf(pain), p).filter(e => e.block !== 'WARMUP').length}
          onClose={() => setPain(null)}
          onStart={p => { const t = pain; setPain(null); run(t, p); }}
        />
      )}
    </>
  );

  return { show: (t: LaunchTarget | null) => setInfo(t), start, listOf, element };
}
