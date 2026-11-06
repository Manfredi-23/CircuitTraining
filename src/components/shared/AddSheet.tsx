'use client';

import { useMemo, useState } from 'react';
import { exerciseLibrary } from '@/core/reserve';
import { estimateDuration, scaleExercise } from '@/core/engine';
import { allowedToday, cautionToday, packsFor, type EditContext, type PackOffer } from '@/core/session-edit';
import { blockSize, groupBlock, groupList, PACK_GROUPS } from '@/core/alternatives';
import { MUSCLE_GROUPS, type MuscleGroup } from '@/core/exercise-tags';
import type { EnergyKey, Exercise, Progress } from '@/core/types';
import ExercisePicker from './ExercisePicker';
import PackList from './PackList';
import styles from './AddSheet.module.css';

const DAY_FMT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' });
const lastText = (day: string | null) => {
  if (!day) return 'never done';
  const [y, m, d] = day.split('-').map(Number);
  return `last ${DAY_FMT.format(new Date(y, m - 1, d))}`;
};

/**
 * + ADD at the bottom of a list (v45): BY GROUP, where a tap on ABS, CHEST,
 * UPPER BACK... adds a ready block of two or three, the group's packs, and
 * the group ONE BY ONE; SEARCH ALL for anything else. Each addition says
 * what it adds in minutes. What goes where is the caller's: heavy first,
 * curls last.
 */
export default function AddSheet({ title, ctx, taken, lastDone, energy, progress, leftNow, full = false, onAdd, onClose }: {
  /** The session added to: "FULL BODY". */
  title: string;
  ctx: EditContext;
  /** In the list already. */
  taken: string[];
  lastDone: Map<string, string>;
  energy: EnergyKey;
  progress: Progress;
  /** Minutes left in a running session: each addition then says what it makes in all. */
  leftNow?: number;
  /** The list holds as many as it may. */
  full?: boolean;
  onAdd: (ids: string[]) => void;
  onClose: () => void;
}) {
  const lib = exerciseLibrary();
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [packsAdded, setPacksAdded] = useState<string[]>([]);
  const [search, setSearch] = useState(false);

  const minutesOf = (ids: string[]) => {
    const exs = ids.map(id => lib.get(id)).filter((e): e is Exercise => Boolean(e));
    return exs.length ? estimateDuration(exs.map(e => scaleExercise(e, energy, progress))) : 0;
  };
  const plus = (m: number) => `+${m} MIN${leftNow !== undefined ? `, ${leftNow + m} LEFT IN ALL` : ''}`;

  const key = `${group}|${taken.join()}|${ctx.place}|${ctx.healing}|${ctx.pain}|${ctx.noKit}`;
  const block = useMemo(() => (group ? groupBlock(group, ctx, taken, lastDone) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, lastDone]);
  const list = useMemo(() => (group ? groupList(group, ctx, taken, lastDone) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, lastDone]);
  const packs: PackOffer[] = useMemo(
    () => (group ? packsFor(ctx, taken).filter(o => PACK_GROUPS[o.pack.id]?.includes(group)) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  const add = (ids: string[]) => {
    if (!ids.length || full) return;
    onAdd(ids);
    setAdded(a => [...a, ...ids.filter(id => !a.includes(id))]);
  };
  const allow = useMemo(() => (e: Exercise) => allowedToday(e, ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]);
  const caution = useMemo(() => (e: Exercise) => cautionToday(e, ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]);

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={`Add to ${title}`}>
      <div className="overlay-header">
        <span className={styles.crumb}>ADD TO {title}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <section className={styles.section}>
          <div className={styles.label}>BY GROUP</div>
          <div className={styles.groups} role="group" aria-label="Groups">
            {MUSCLE_GROUPS.map(g => (
              <button
                key={g}
                className={`${styles.chip}${g === group ? ` ${styles.chipOn}` : ''}`}
                aria-pressed={g === group}
                onClick={() => setGroup(g === group ? null : g)}
              >{g}</button>
            ))}
          </div>
          {!group && <p className={styles.hint}>A group adds a block of {blockSize('ABS')}, done least recently first; or pick one by one. Each goes where it belongs: heavy first, curls last.</p>}
          {full && <p className={styles.caution}>The session holds as many exercises as it may. Take one out first.</p>}
        </section>

        {group && (
          <>
            <section className={styles.section}>
              {block.length ? (
                <button className={styles.block} disabled={full} onClick={() => add(block)}>
                  <span className={styles.blockHead}>
                    <span className={styles.blockTitle}>ADD {block.length} FOR {group}</span>
                    <span className={styles.blockMin}>{plus(minutesOf(block))}</span>
                  </span>
                  <span className={styles.blockItems}>{block.map(id => lib.get(id)?.name).join(' · ')}</span>
                </button>
              ) : (
                <p className={styles.hint}>
                  {list.some(e => !taken.includes(e.exercise.id))
                    ? `What is left in ${group} is not recommended today. It is below, labelled.`
                    : `Everything in ${group} for this place is in already.`}
                </p>
              )}
              {added.length > 0 && <p className={styles.added}>Added: {added.map(id => lib.get(id)?.name).join(', ')}.</p>}
            </section>

            {packs.length > 0 && (
              <section className={styles.section}>
                <div className={styles.label}>READY-MADE</div>
                <PackList
                  offers={packs}
                  added={packsAdded}
                  energy={energy}
                  progress={progress}
                  leftNow={leftNow}
                  onAdd={offer => { add(offer.ids); setPacksAdded(p => [...p, offer.pack.id]); }}
                />
              </section>
            )}

            <section className={styles.section}>
              <div className={styles.label}>ONE BY ONE</div>
              {list.map(({ exercise: e, main, lastDone: last, caution: why }) => {
                const has = taken.includes(e.id);
                return (
                  <button key={e.id} className={styles.row} disabled={has || full} onClick={() => add([e.id])}>
                    <span className={styles.body}>
                      <span className={styles.name}>{e.name}</span>
                      <span className={styles.meta}>
                        {main ? '' : 'also · '}{e.sets} x {e.work}{e.unit === 'sec' ? 's' : ''}{e.perSide ? ' /side' : ''} &middot; {lastText(last)} &middot; +{minutesOf([e.id])} MIN
                      </span>
                      {why && <span className={styles.caution}>{why}</span>}
                    </span>
                    <span className={styles.plus}>{has ? 'IN' : '+'}</span>
                  </button>
                );
              })}
            </section>
          </>
        )}
      </div>

      <div className={styles.foot}>
        <button className={styles.search} onClick={() => setSearch(true)}>SEARCH ALL</button>
        <button className={styles.done} onClick={onClose}>{added.length ? `DONE (${added.length} ADDED)` : 'BACK'}</button>
      </div>

      {search && (
        <ExercisePicker
          place={ctx.place}
          taken={taken}
          title="ADD EXERCISE"
          allow={allow}
          caution={caution}
          onClose={() => setSearch(false)}
          onPick={id => { add([id]); setSearch(false); }}
        />
      )}
    </div>
  );
}
