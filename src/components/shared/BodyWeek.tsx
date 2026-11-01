'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { getModeData } from '@/core/data-index';
import { getReadiness, estimateDuration } from '@/core/engine';
import { BODY_LABEL, bodyWeek, servesArea, type AreaWeek, type BodyArea } from '@/core/body-week';
import { getLimiters } from '@/core/limiters';
import { packForFalls } from '@/core/transfer';
import { PACKS } from '@/core/session-edit';
import { routineCircuit } from '@/core/routines';
import type { Circuit, Mode, ScaledExercise } from '@/core/types';
import styles from './BodyWeek.module.css';

const CELLS = 8;

/** The packs that answer an area, for TRAIN THIS. */
const AREA_PACKS: Partial<Record<BodyArea, string[]>> = {
  FEET: ['feet', 'hooks'], CORE: ['core-finisher'], BACK: ['back'], LEGS: ['legs', 'balance-power'],
  MOBILITY: ['mobility-10'], PUSH: ['shoulder-care'], FINGERS: ['fingers-light'],
};

const MODES: Mode[] = ['DAILY', 'CAVE', 'HEAL'];

/**
 * BODY THIS WEEK (v43): every area, Monday to today, in one glance. Sets done
 * against the week's band as a row of dots, the numbers, and a word: DUE,
 * ON TRACK, ENOUGH, TOO MUCH, RECOVERING, HEALING. The area today's pick serves
 * is the one lit orange. A tap on a row opens TRAIN THIS: every session that
 * puts real work into that area, and the packs that do.
 */
export default function BodyWeek({ highlight, listOf, onOpen }: {
  /** The area today's pick serves most. */
  highlight: BodyArea | null;
  listOf: (t: { mode: Mode; circuit: Circuit }) => ScaledExercise[];
  onOpen: (t: { mode: Mode; circuit: Circuit }) => void;
}) {
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const progress = useStore(s => s.progress);
  const routines = useStore(s => s.routines);
  const [area, setArea] = useState<BodyArea | null>(null);
  const week = useMemo(() => bodyWeek({ sessionLog, climbLog, progress }), [sessionLog, climbLog, progress]);
  const fall = useMemo(() => packForFalls(getLimiters(climbLog)), [climbLog]);

  const row = (w: AreaWeek) => {
    const lit = Math.min(CELLS, Math.round((w.sets / Math.max(1, w.min)) * CELLS));
    const loud = w.status === 'DUE' || w.status === 'TOO MUCH';
    return (
      <button key={w.area} className={styles.row} onClick={() => setArea(w.area)} aria-label={`${w.area}: ${w.detail}, ${w.status}. Show what trains it.`}>
        <span className={`${styles.area}${highlight === w.area ? ` ${styles.areaOn}` : ''}`}>{BODY_LABEL[w.area]}</span>
        <span className={styles.dots} aria-hidden="true">
          {Array.from({ length: CELLS }, (_, i) => <span key={i} className={i < lit ? styles.dotOn : styles.dotOff} />)}
          {w.sets > w.min && <span className={styles.over}>+</span>}
        </span>
        <span className={styles.detail}>{w.detail}</span>
        <span className={`${styles.status}${loud ? ` ${styles.statusLoud}` : ''}`}>{w.status}</span>
      </button>
    );
  };

  return (
    <section className={styles.panel} aria-label="Body this week">
      <div className={styles.head}>
        <h2 className="section-label">BODY THIS WEEK</h2>
        <span className={styles.period}>MON - TODAY</span>
      </div>
      <div className={styles.rows}>{week.map(row)}</div>
      {fall && (
        <p className={styles.fall}>
          {fall.reason} The {PACKS.find(p => p.id === fall.packId)?.name} pack trains it: EDIT any session, or + ADD mid-session.
        </p>
      )}
      {area && (
        <TrainThis
          area={area}
          week={week.find(w => w.area === area)!}
          routines={routines}
          listOf={listOf}
          onOpen={t => { setArea(null); onOpen(t); }}
          onClose={() => setArea(null)}
        />
      )}
    </section>
  );
}

function TrainThis({ area, week, routines, listOf, onOpen, onClose }: {
  area: BodyArea;
  week: AreaWeek;
  routines: ReturnType<typeof useStore.getState>['routines'];
  listOf: (t: { mode: Mode; circuit: Circuit }) => ScaledExercise[];
  onOpen: (t: { mode: Mode; circuit: Circuit }) => void;
  onClose: () => void;
}) {
  const progress = useStore(s => s.progress);
  const candidates = useMemo(() => {
    const out: Array<{ item: { mode: Mode; circuit: Circuit; routine: boolean }; list: ScaledExercise[] }> = [];
    for (const mode of MODES) for (const circuit of getModeData(mode)) out.push({ item: { mode, circuit, routine: false }, list: listOf({ mode, circuit }) });
    for (const r of routines) {
      const circuit = routineCircuit(r);
      const mode: Mode = r.place === 'HOME' ? 'DAILY' : 'CAVE';
      out.push({ item: { mode, circuit, routine: true }, list: listOf({ mode, circuit }) });
    }
    return servesArea(area, out).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area, routines]);
  const packs = (AREA_PACKS[area] ?? []).map(id => PACKS.find(p => p.id === id)?.name).filter(Boolean);

  return (
    <div className={`overlay-panel overlay-enter ${styles.overlay}`} role="dialog" aria-modal="true" aria-label={`Train ${area}`}>
      <div className="overlay-header">
        <span className={styles.crumb}>TRAIN THIS</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>
      <div className={styles.thisHead}>
        <div className={styles.thisTitle}>{BODY_LABEL[area]}</div>
        <div className={styles.thisSub}>{week.detail} this week &middot; {week.status}</div>
      </div>
      <div className={styles.scroll}>
        {candidates.length === 0 && <p className={styles.none}>No session puts two or more sets into {area.toLowerCase()}. A pack does.</p>}
        {candidates.map(({ item, sets }) => {
          const ready = getReadiness(item.circuit, progress);
          return (
            <button key={item.circuit.id} className={styles.cand} onClick={() => onOpen(item)}>
              <span className={styles.candBody}>
                <span className={styles.candTitle}>{item.routine ? 'ROUTINE' : `${item.mode} ${item.circuit.circuitNum}`} &middot; {item.circuit.title}</span>
                <span className={ready.level === 'ready' ? styles.candWhy : styles.candWarn}>
                  {sets} sets of {area.toLowerCase()}{ready.level === 'ready' ? '' : ` · ${ready.message}`}
                </span>
              </span>
              <span className={styles.candMin}>{estimateDuration(listOf(item))}<small> min</small></span>
            </button>
          );
        })}
        {packs.length > 0 && (
          <p className={styles.packs}>
            Or a pack on top of any session: {packs.join(', ')}. EDIT on the session page, or + ADD mid-session.
          </p>
        )}
      </div>
    </div>
  );
}
