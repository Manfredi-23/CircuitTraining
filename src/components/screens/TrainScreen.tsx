'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { displaySubtitle, getModeData } from '@/core/data-index';
import { estimateDuration, getReadiness } from '@/core/engine';
import { lastDone } from '@/core/recommend';
import { daysBetween, localDate } from '@/core/dates';
import { CONFIG } from '@/core/config';
import { useToday } from '@/hooks/use-today';
import { useLauncher } from '@/hooks/use-launcher';
import ScreenHeader from '@/components/shell/ScreenHeader';
import Led from '@/components/shared/Led';
import BuildSheet from '@/components/shared/BuildSheet';
import RoutineEditor from '@/components/shared/RoutineEditor';
import WeekPlanner from '@/components/shared/WeekPlanner';
import { blankRoutine, routineCircuit, routineFromCircuit, routineMode, type Routine } from '@/core/routines';
import { activeEdit } from '@/core/session-edit';
import type { Circuit, Mode } from '@/core/types';
import styles from './TrainScreen.module.css';

type Shelf = Mode | 'MINE';
const SHELVES: Shelf[] = [...(CONFIG.modes as Mode[]), 'MINE'];

const SHELF_LINE: Record<Shelf, string> = {
  DAILY: 'Short home sessions before breakfast. Mat, band, portable edge.',
  CAVE: 'Gym sessions. 01, 04 and 05 for a day without climbing; 02 and 03 after bouldering.',
  TEST: 'The benchmark battery. Every six to eight weeks.',
  HEAL: 'Training around an injured finger: nothing gripped, nothing pulled.',
  MINE: 'Sessions you build or keep.',
};

const ago = (n: number | null) => (n === null ? 'not done yet' : n === 0 ? 'done today' : n === 1 ? 'yesterday' : `${n} days ago`);

/**
 * TRAIN is the library: every programme session as a list, by tab, with how
 * long it runs at today's energy, whether it is recovered, when it was last
 * done, and which one is today's pick. MINE holds the athlete's own.
 */
export default function TrainScreen({ onSettings }: { onSettings: () => void }) {
  const mode = useStore(s => s.mode);
  const energy = useStore(s => s.energy);
  const setEnergy = useStore(s => s.setEnergy);
  const progress = useStore(s => s.progress);
  const sessionLog = useStore(s => s.sessionLog);
  const routines = useStore(s => s.routines);
  const { recommendation } = useToday();
  const [editing, setEditing] = useState<{ routine: Routine; isNew: boolean } | null>(null);
  const launcher = useLauncher();
  const [shelf, setShelf] = useState<Shelf>(mode);
  const [buildOpen, setBuildOpen] = useState(false);
  const today = localDate();

  /** MAKE IT MINE copies the session as it stands, with an edit made on its page. */
  const mineFrom = (m: Mode, c: Circuit): Routine => {
    const r = routineFromCircuit(c, m);
    const edit = activeEdit(useStore.getState().sessionEdits, c.id, today);
    return edit ? { ...r, items: edit.items.map(({ id, sets, work }) => ({ id, ...(sets !== undefined ? { sets } : {}), ...(work !== undefined ? { work } : {}) })) } : r;
  };

  const extraFor = (m: Mode, c: Circuit, routine?: Routine) => (
    <button
      className={styles.extra}
      onClick={() => {
        launcher.show(null);
        setEditing(routine ? { routine, isNew: false } : { routine: mineFrom(m, c), isNew: true });
      }}
    >
      {routine ? 'EDIT ROUTINE' : 'MAKE IT MINE: COPY AS A ROUTINE'}
    </button>
  );

  const row = (m: Mode, c: Circuit, routine?: Routine) => {
    const minutes = estimateDuration(launcher.listOf({ mode: m, circuit: c }));
    const readiness = getReadiness(c, progress);
    const last = lastDone(sessionLog, c.id);
    const recommended = recommendation?.circuitId === c.id;
    return (
      <button key={c.id} className={styles.row} onClick={() => launcher.show({ mode: m, circuit: c, extra: extraFor(m, c, routine) })}>
        <Led
          text={routine ? (routine.place === 'HOME' ? 'H' : 'C') : c.circuitNum}
          dot={4}
          lit={recommended ? 'var(--accent)' : 'var(--ink)'}
          unlit="none"
          className={styles.num}
          label={routine ? 'Routine' : `${m} ${c.circuitNum}`}
        />
        <span className={styles.body}>
          <span className={styles.title}>
            {c.title}
            {recommended && <span className={styles.tag}>TODAY</span>}
          </span>
          <span className={styles.sub}>{displaySubtitle(c)}</span>
          <span className={readiness.level === 'ready' ? styles.meta : styles.metaWarn}>
            {readiness.level === 'ready' ? (last === null ? 'Not done yet' : `Last ${ago(daysBetween(last, today))}`) : readiness.message}
          </span>
        </span>
        <span className={styles.min}>{minutes}<small> min</small></span>
      </button>
    );
  };

  return (
    <div className={`screen screen-enter tab-screen ${styles.screen}`}>
      <ScreenHeader title="TRAIN" sub={SHELF_LINE[shelf]} onSettings={onSettings} />

      <div className={styles.shelves} role="tablist" aria-label="Programme">
        {SHELVES.map(s => (
          <button
            key={s}
            role="tab"
            aria-selected={s === shelf}
            className={`${styles.shelf}${s === shelf ? ` ${styles.shelfOn}` : ''}`}
            onClick={() => setShelf(s)}
          >{s}</button>
        ))}
      </div>

      {shelf !== 'MINE' && (
        <>
          <div className={styles.energyRow}>
            <span className={styles.energyLabel}>ENERGY</span>
            {(Object.keys(CONFIG.energy) as (keyof typeof CONFIG.energy)[]).map(e => (
              <button
                key={e}
                className={`${styles.energyChip}${e === energy ? ` ${styles.energyChipOn}` : ''}`}
                aria-pressed={e === energy}
                onClick={() => setEnergy(e)}
              >{e}</button>
            ))}
          </div>
          <div className={styles.list}>
            {getModeData(shelf).map(c => row(shelf, c))}
          </div>
        </>
      )}

      {shelf === 'MINE' && (
        <>
          <section className={styles.mine}>
            <div className={styles.mineHead}>
              <h2 className="section-label">YOUR ROUTINES</h2>
              <button className={styles.newBtn} onClick={() => setEditing({ routine: blankRoutine('MY ROUTINE', 'HOME'), isNew: true })}>+ NEW</button>
            </div>
            {routines.length === 0 ? (
              <div className={styles.emptyMine}>
                Fixed lists you keep: these exercises, in this order. Start one with + NEW, copy any programme
                session with MAKE IT MINE, or save a built session as a routine.
              </div>
            ) : (
              <div className={styles.list}>
                {routines.map(r => row(routineMode(r), routineCircuit(r), r))}
              </div>
            )}
          </section>

          <div className="dot-rule">
          <button className={styles.build} onClick={() => setBuildOpen(true)}>
            <span>
              <span className={styles.buildTitle}>BUILD A SESSION</span>
              <span className={styles.buildSub}>Picked for you from where, how long and what to train. Different every time; save the one you like as a routine.</span>
            </span>
            <span aria-hidden="true">&rarr;</span>
          </button>
          </div>

          <WeekPlanner />
        </>
      )}

      <BuildSheet open={buildOpen} onClose={() => setBuildOpen(false)} />
      {launcher.element}
      {editing && <RoutineEditor routine={editing.routine} isNew={editing.isNew} onClose={() => setEditing(null)} />}
    </div>
  );
}
