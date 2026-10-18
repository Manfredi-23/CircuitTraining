'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import {
  CUSTOM_GROUPS, CUSTOM_TIMES, areaNeeds, buildCustom, closedAreas, customMode, suggestAreas, type CustomContext,
} from '@/core/custom';
import { isHealing, PAIN_MEMORY_DAYS } from '@/core/recommend';
import { legSoreness } from '@/core/activity';
import { activeDay } from '@/core/today';
import { getBlockWeek } from '@/core/block';
import { asksPainCheck, applyPainCheck } from '@/core/engine';
import { dayOf, daysBetween, localDate } from '@/core/dates';
import { CONFIG } from '@/core/config';
import type { Place, ReserveGroup } from '@/core/reserve';
import type { EnergyKey, ScaledExercise } from '@/core/types';
import PainCheck from './PainCheck';
import styles from './BuildSheet.module.css';

function dose(ex: ScaledExercise): string {
  const work = ex.unit === 'sec' ? `${ex.scaledWork}s` : `${ex.scaledWork}`;
  return `${ex.scaledSets} x ${work}${ex.perSide ? ' /side' : ''}`;
}

/**
 * BUILD: a session made on the spot from where, how long and which areas.
 * SUGGEST picks the areas trained least lately. The preview is the list the
 * workout will run.
 */
export default function BuildSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    progress, sessionLog, climbLog, activityLog, benchmarkResults, tweaks, dayPlan, blockStart, energy, mode,
    setEnergy, startCustom,
  } = useStore();
  const [entered, setEntered] = useState(false);
  const [place, setPlace] = useState<Place>('HOME');
  const [minutes, setMinutes] = useState(20);
  const [groups, setGroups] = useState<ReserveGroup[] | null>(null);
  const [painOpen, setPainOpen] = useState(false);

  const today = localDate();
  const day = activeDay(dayPlan);
  const healing = isHealing(sessionLog, climbLog);
  const recentPain = [...sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  )?.pain ?? null;
  const ctx: CustomContext = {
    place, sessionLog, healing, pain: recentPain, day, legsSore: legSoreness(activityLog) !== null,
  };
  const closed = closedAreas(ctx);
  const needs = useMemo(
    () => areaNeeds(progress, sessionLog, closed),
    // closed follows place, the logs and the day plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress, sessionLog, place, healing, recentPain, dayPlan, activityLog],
  );
  const suggested = suggestAreas(needs);

  // Open on a sensible start: the gym after a climb or from the CAVE tab, today's
  // time cap if one is set, and the suggested areas.
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    const gym = !day.noKit && (mode === 'CAVE' || climbLog.some(c => c.date === today));
    setPlace(gym ? 'GYM' : 'HOME');
    setMinutes(day.minutes ?? (gym ? 45 : 20));
    setGroups(null);
    requestAnimationFrame(() => setEntered(true));
    // Only on opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Until the athlete picks, the suggestion stands.
  const chosen = (groups ?? suggested).filter(g => !closed[g]);
  const deload = place === 'GYM' && getBlockWeek(blockStart, sessionLog).deload;
  const session = useMemo(
    () => (chosen.length ? buildCustom({
      ...ctx, minutes, groups: chosen, energy, progress, benchmarkResults, tweaks, deload,
    }) : null),
    // ctx is rebuilt from the same inputs every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosen.join(), place, minutes, energy, progress, benchmarkResults, tweaks, deload, sessionLog, dayPlan, healing, recentPain],
  );

  if (!open) return null;

  const toggle = (g: ReserveGroup) => {
    const base = groups ?? suggested;
    setGroups(base.includes(g) ? base.filter(x => x !== g) : [...base, g]);
  };
  const begin = () => {
    if (!session) return;
    if (asksPainCheck(session.circuit)) setPainOpen(true);
    else { onClose(); startCustom(session.circuit, session.list, customMode(place)); }
  };
  const lastPain = [...sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;

  const Chip = ({ on, label, onClick, mark, disabled }: { on: boolean; label: string; onClick: () => void; mark?: boolean; disabled?: boolean }) => (
    <button
      className={`${styles.chip}${on ? ` ${styles.chipOn}` : ''}${mark ? ` ${styles.chipMark}` : ''}`}
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
    >{label}</button>
  );

  return (
    <div className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`} role="dialog" aria-modal="true" aria-label="Build a session">
      <div className="overlay-header">
        <span className={styles.crumb}>BUILD</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <section className={styles.section}>
          <div className={styles.label}>WHERE</div>
          <div className={styles.chips}>
            <Chip on={place === 'HOME'} label="HOME" onClick={() => setPlace('HOME')} />
            <Chip on={place === 'GYM'} label="CAVE" onClick={() => setPlace('GYM')} disabled={day.noKit} />
          </div>
          <div className={styles.hint}>
            {day.noKit ? 'No kit today: mat only.' : place === 'HOME' ? 'Mat, band, portable edge.' : 'The gym: everything, home kit included.'}
            {healing && ' Nothing gripped while the finger heals.'}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>TIME</div>
          <div className={styles.chips}>
            {CUSTOM_TIMES.map(m => <Chip key={m} on={minutes === m} label={`${m} MIN`} onClick={() => setMinutes(m)} />)}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>AREAS</div>
          <div className={styles.chips}>
            {CUSTOM_GROUPS.map(g => (
              <Chip
                key={g}
                on={chosen.includes(g)}
                mark={suggested.includes(g)}
                label={g}
                disabled={Boolean(closed[g])}
                onClick={() => toggle(g)}
              />
            ))}
          </div>
          <div className={styles.suggest}>
            <div className={styles.suggestHead}>
              <span>NOT TRAINED ENOUGH</span>
              <button
                className={styles.suggestBtn}
                disabled={groups === null}
                onClick={() => setGroups(null)}
              >{groups ? 'USE SUGGESTION' : 'SUGGESTED'}</button>
            </div>
            {needs.filter(n => suggested.includes(n.group)).map(n => (
              <div key={n.group} className={styles.need}>
                <span className={styles.needGroup}>{n.group}</span> {n.reason}
              </div>
            ))}
          </div>
          {Object.entries(closed).map(([g, why]) => (
            <div key={g} className={styles.hint}>{g}: {why}</div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.label}>ENERGY</div>
          <div className={styles.chips}>
            {(Object.keys(CONFIG.energy) as EnergyKey[]).map(e => (
              <Chip key={e} on={energy === e} label={e} onClick={() => setEnergy(e)} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>
            SESSION{session && <span className={styles.duration}>{session.duration} MIN</span>}
          </div>
          {!session && <div className={styles.hint}>Pick at least one area.</div>}
          {session?.list.map(ex => (
            <div key={ex.id} className={styles.row}>
              <span className={styles.name}>{ex.displayName}</span>
              <span className={styles.meta}>{dose(ex)}</span>
            </div>
          ))}
          {session && <div className={styles.hint}>Least recently done first. Rest and sets as written: what does not fit is left out.</div>}
        </section>
      </div>

      <button className={styles.start} disabled={!session} onClick={begin}>
        START{session ? ` · ${session.duration} MIN` : ''}
      </button>

      {session && (
        <PainCheck
          open={painOpen}
          title={session.circuit.title}
          lastPain={lastPain}
          remainingFor={pain => applyPainCheck(session.list, pain).filter(e => e.block !== 'WARMUP').length}
          onClose={() => setPainOpen(false)}
          onStart={pain => { setPainOpen(false); onClose(); startCustom(session.circuit, session.list, customMode(place), pain); }}
        />
      )}
    </div>
  );
}
