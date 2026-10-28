'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import {
  AVOIDS, BUILT_IN_PRESETS, CUSTOM_GROUPS, CUSTOM_TIMES, GOALS,
  areaNeeds, buildCustom, buildWarnings, cautionAreas, closedAreas, customMode, cycleTarget, isGoal, makePreset, presetName,
  suggestAreas, targetState,
  type Avoid, type BuildChoice, type BuildPreset, type CustomContext, type Target,
} from '@/core/custom';
import { isHealing, PAIN_MEMORY_DAYS } from '@/core/recommend';
import { legSoreness } from '@/core/activity';
import { activeDay } from '@/core/today';
import { getBlockWeek } from '@/core/block';
import { asksPainCheck, asksReadiness, applyFingerCheck } from '@/core/engine';
import { dayOf, daysBetween, localDate } from '@/core/dates';
import { CONFIG } from '@/core/config';
import type { Place } from '@/core/reserve';
import type { EnergyKey, ScaledExercise } from '@/core/types';
import PainCheck from './PainCheck';
import { routineFromList } from '@/core/routines';
import styles from './BuildSheet.module.css';

function dose(ex: ScaledExercise): string {
  const work = ex.unit === 'sec' ? `${ex.scaledWork}s` : `${ex.scaledWork}`;
  return `${ex.scaledSets} x ${work}${ex.perSide ? ' /side' : ''}`;
}

const AVOID_LABEL: Record<Avoid, string> = { JUMPING: 'NO JUMPING', GRIP: 'NO GRIP', FLOOR: 'NO FLOOR' };

/** The longest slot that fits today's TODAY time cap. */
const slotFor = (cap: number | null, fallback: number) =>
  cap === null ? fallback : [...CUSTOM_TIMES].reverse().find(m => m <= cap) ?? CUSTOM_TIMES[0];

/**
 * BUILD: a session made on the spot from where, how long, goals and areas
 * (each tapped in, out or off) and what to avoid. SUGGEST picks the areas
 * trained least lately; a preset fills everything in one tap. The preview is
 * the list the workout will run.
 */
export default function BuildSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    progress, sessionLog, climbLog, activityLog, benchmarkResults, tweaks, dayPlan, blockStart, energy, mode,
    buildPresets, setEnergy, startCustom, savePreset, deletePreset, saveRoutine,
  } = useStore();
  const [entered, setEntered] = useState(false);
  const [place, setPlace] = useState<Place>('HOME');
  const [minutes, setMinutes] = useState(30);
  // null: the suggestion stands until the athlete picks.
  const [include, setInclude] = useState<Target[] | null>(null);
  const [exclude, setExclude] = useState<Target[]>([]);
  const [avoid, setAvoid] = useState<Avoid[]>([]);
  const [preset, setPreset] = useState<BuildPreset | null>(null);
  const [naming, setNaming] = useState<string | null>(null);
  /** Naming a routine to freeze the list as it stands, or renaming the preset in use. */
  const [routineName, setRoutineName] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [savedRoutine, setSavedRoutine] = useState<string | null>(null);
  const [painOpen, setPainOpen] = useState(false);

  const today = localDate();
  const day = activeDay(dayPlan);
  const climbedToday = climbLog.some(c => c.date === today);
  const healing = isHealing(sessionLog, climbLog);
  const recentPain = [...sessionLog].reverse().find(
    s => s.pain !== undefined && daysBetween(dayOf(s.date), today) <= PAIN_MEMORY_DAYS,
  )?.pain ?? null;
  const ctx: CustomContext = {
    place, sessionLog, healing, pain: recentPain, day, legsSore: legSoreness(activityLog) !== null,
  };
  const closed = closedAreas(ctx);
  const cautions = cautionAreas(ctx);
  // Not recommended today: open to a tap, never suggested.
  const needs = useMemo(
    () => areaNeeds(progress, sessionLog, { ...cautions, ...closed }),
    // closed follows place, the logs and the day plan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress, sessionLog, place, healing, recentPain, dayPlan, activityLog],
  );
  const suggested: Target[] = suggestAreas(needs.filter(n => !exclude.includes(n.group)));

  // Open on a sensible start: the gym after a climb or from the CAVE tab, today's
  // time cap if one is set, and the suggested areas.
  useEffect(() => {
    if (!open) { setEntered(false); return; }
    const gym = !day.noKit && (mode === 'CAVE' || climbedToday);
    setPlace(gym ? 'GYM' : 'HOME');
    setMinutes(slotFor(day.minutes, gym ? 45 : 30));
    setInclude(null);
    setExclude([]);
    setAvoid([]);
    setPreset(null);
    setNaming(null);
    setRoutineName(null);
    setRenaming(null);
    setSavedRoutine(null);
    requestAnimationFrame(() => setEntered(true));
    // Only on opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const chosen = (include ?? suggested).filter(t => !closed[t] && !exclude.includes(t));
  const choice: BuildChoice = { place, minutes, include: chosen, exclude, avoid };
  const deload = place === 'GYM' && getBlockWeek(blockStart, sessionLog).deload;
  const session = useMemo(
    () => (chosen.length ? buildCustom({
      ...ctx, minutes, include: chosen, exclude, avoid, energy, progress, benchmarkResults, tweaks, deload,
      title: preset?.name,
    }) : null),
    // ctx is rebuilt from the same inputs every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chosen.join(), exclude.join(), avoid.join(), place, minutes, energy, progress, benchmarkResults, tweaks, deload, sessionLog, dayPlan, healing, recentPain, preset],
  );
  const warnings = buildWarnings(choice, needs, climbedToday, cautions);

  if (!open) return null;

  // Any change by hand makes it a custom build again.
  const edited = () => setPreset(null);
  const tap = (t: Target) => {
    // The first tap on a goal starts an empty plan; on an area, from the suggestion.
    const base = include ?? (isGoal(t) ? [] : suggested);
    const next = cycleTarget({ include: base, exclude }, t);
    setInclude(next.include);
    setExclude(next.exclude);
    edited();
  };
  const toggleAvoid = (a: Avoid) => { setAvoid(v => (v.includes(a) ? v.filter(x => x !== a) : [...v, a])); edited(); };
  const usePreset = (p: BuildPreset) => {
    setPlace(day.noKit ? 'HOME' : p.place);
    setMinutes(p.minutes);
    setInclude([...p.include]);
    setExclude([...p.exclude]);
    setAvoid([...p.avoid]);
    setPreset(p);
    setNaming(null);
  };
  const save = () => {
    const p = makePreset(choice, naming ?? '');
    savePreset(p);
    setPreset(p);
    setNaming(null);
  };
  const begin = () => {
    if (!session) return;
    if (asksReadiness(session.circuit)) setPainOpen(true);
    else { onClose(); startCustom(session.circuit, session.list, customMode(place)); }
  };
  const lastPain = [...sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;
  const lastReadiness = [...sessionLog].reverse().find(s => s.readiness !== undefined)?.readiness ?? null;
  const userPreset = preset && buildPresets.some(p => p.id === preset.id) ? preset : null;

  const Chip = ({ on, out, label, onClick, mark, disabled }: {
    on: boolean; out?: boolean; label: string; onClick: () => void; mark?: boolean; disabled?: boolean;
  }) => (
    <button
      className={`${styles.chip}${on ? ` ${styles.chipOn}` : ''}${out ? ` ${styles.chipOut}` : ''}${mark ? ` ${styles.chipMark}` : ''}`}
      aria-pressed={on || out}
      disabled={disabled}
      onClick={onClick}
    >{label}</button>
  );
  const TargetChip = ({ t, mark }: { t: Target; mark?: boolean }) => {
    const state = include === null && suggested.includes(t) && !exclude.includes(t) ? 'in' : targetState({ include: include ?? [], exclude }, t);
    return (
      <Chip
        on={state === 'in'}
        out={state === 'out'}
        mark={mark}
        label={state === 'out' ? `NO ${t}` : t}
        disabled={Boolean(closed[t]) && state !== 'out'}
        onClick={() => tap(t)}
      />
    );
  };

  return (
    <div className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`} role="dialog" aria-modal="true" aria-label="Build a session">
      <div className="overlay-header">
        <span className={styles.crumb}>BUILD{preset ? ` · ${preset.name}` : ''}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <section className={styles.section}>
          <div className={styles.label}>PRESETS</div>
          <div className={styles.chips}>
            {[...BUILT_IN_PRESETS, ...buildPresets].map(p => (
              <Chip key={p.id} on={preset?.id === p.id} label={p.name} onClick={() => usePreset(p)} />
            ))}
          </div>
          {userPreset && renaming === null && (
            <div className={styles.linkRow}>
              <button className={styles.link} onClick={() => setRenaming(userPreset.name)}>RENAME</button>
              <button className={styles.link} onClick={() => { deletePreset(userPreset.id); setPreset(null); }}>
                DELETE {userPreset.name}
              </button>
            </div>
          )}
          {userPreset && renaming !== null && (
            <div className={styles.saveRow}>
              <input
                className={styles.nameInput}
                value={renaming}
                maxLength={32}
                aria-label="Preset name"
                onChange={e => setRenaming(e.target.value)}
              />
              <button
                className={styles.saveBtn}
                onClick={() => {
                  const name = renaming.trim().toUpperCase();
                  if (name) { const p = { ...userPreset, name }; savePreset(p); setPreset(p); }
                  setRenaming(null);
                }}
              >SAVE</button>
              <button className={styles.link} onClick={() => setRenaming(null)}>CANCEL</button>
            </div>
          )}
        </section>

        <section className={styles.section}>
          <div className={styles.label}>WHERE</div>
          <div className={styles.chips}>
            <Chip on={place === 'HOME'} label="HOME" onClick={() => { setPlace('HOME'); edited(); }} />
            <Chip on={place === 'GYM'} label="CAVE" onClick={() => { setPlace('GYM'); edited(); }} disabled={day.noKit} />
          </div>
          <div className={styles.hint}>
            {day.noKit ? 'No kit today: mat only.' : place === 'HOME' ? 'Mat, band, portable edge.' : 'The gym: everything, dumbbells and rings included.'}
            {healing && ' Nothing gripped while the finger heals.'}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>TIME</div>
          <div className={styles.chips}>
            {CUSTOM_TIMES.map(m => (
              <Chip key={m} on={minutes === m} label={m === 90 ? '1H30' : m === 60 ? '1H' : `${m} MIN`} onClick={() => { setMinutes(m); edited(); }} />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>GOALS</div>
          <div className={styles.chips}>
            {GOALS.map(g => <TargetChip key={g} t={g} />)}
          </div>
          <div className={styles.label}>AREAS</div>
          <div className={styles.chips}>
            {CUSTOM_GROUPS.map(g => <TargetChip key={g} t={g} mark={suggested.includes(g)} />)}
          </div>
          <div className={styles.hint}>Tap once: in. Twice: out, nothing that touches it. Three times: off.</div>
          <div className={styles.suggest}>
            <div className={styles.suggestHead}>
              <span>NOT TRAINED ENOUGH</span>
              <button
                className={styles.suggestBtn}
                disabled={include === null}
                onClick={() => { setInclude(null); edited(); }}
              >{include ? 'USE SUGGESTION' : 'SUGGESTED'}</button>
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
          {Object.entries(cautions).map(([g, why]) => (
            <div key={g} className={styles.caution}>{g}: {why}</div>
          ))}
        </section>

        <section className={styles.section}>
          <div className={styles.label}>AVOID</div>
          <div className={styles.chips}>
            {AVOIDS.map(a => <Chip key={a} on={false} out={avoid.includes(a)} label={AVOID_LABEL[a]} onClick={() => toggleAvoid(a)} />)}
          </div>
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
          {warnings.map(w => <div key={w} className={styles.warn}>{w}</div>)}
          {!session && <div className={styles.hint}>Tap a goal or an area in.</div>}
          {session?.list.map(ex => (
            <div key={ex.id} className={styles.row}>
              <span className={styles.name}>{ex.displayName}</span>
              <span className={styles.meta}>{dose(ex)}</span>
            </div>
          ))}
          {session && (
            <div className={styles.hint}>
              {session.extraSets > 0
                ? `Key lifts first. The exercises ran out before ${minutes} minutes: ${session.extraSets} more ${session.extraSets === 1 ? 'set' : 'sets'} fill the time, rest as written. `
                : 'Key lifts first. Rest and sets as written: what does not fit is left out. '}
              A preset picks again next time; a routine keeps this exact list.
            </div>
          )}
          {session && naming === null && routineName === null && (
            <div className={styles.linkRow}>
              {!preset && <button className={styles.link} onClick={() => setNaming(presetName(choice))}>SAVE AS PRESET</button>}
              <button className={styles.link} onClick={() => setRoutineName(preset?.name ?? presetName(choice))}>SAVE THIS LIST AS A ROUTINE</button>
            </div>
          )}
          {savedRoutine && <div className={styles.hint}>Saved as the routine {savedRoutine}: TRAIN, MINE.</div>}
          {session && routineName !== null && (
            <div className={styles.saveRow}>
              <input
                className={styles.nameInput}
                value={routineName}
                maxLength={32}
                aria-label="Routine name"
                onChange={e => setRoutineName(e.target.value)}
              />
              <button
                className={styles.saveBtn}
                onClick={() => {
                  const name = routineName.trim().toUpperCase() || 'MY ROUTINE';
                  saveRoutine(routineFromList(session.list, name, place));
                  setSavedRoutine(name);
                  setRoutineName(null);
                }}
              >SAVE</button>
              <button className={styles.link} onClick={() => setRoutineName(null)}>CANCEL</button>
            </div>
          )}
          {naming !== null && (
            <div className={styles.saveRow}>
              <input
                className={styles.nameInput}
                value={naming}
                maxLength={32}
                aria-label="Preset name"
                onChange={e => setNaming(e.target.value)}
              />
              <button className={styles.saveBtn} onClick={save}>SAVE</button>
              <button className={styles.link} onClick={() => setNaming(null)}>CANCEL</button>
            </div>
          )}
        </section>
      </div>

      <button className={styles.start} disabled={!session} onClick={begin}>
        START{session ? ` · ${session.duration} MIN` : ''}
      </button>

      {session && (
        <PainCheck
          open={painOpen}
          title={session.circuit.title}
          askPain={asksPainCheck(session.circuit)}
          lastPain={lastPain}
          lastReadiness={lastReadiness}
          remainingFor={check => applyFingerCheck(session.list, check).filter(e => e.block !== 'WARMUP').length}
          onClose={() => setPainOpen(false)}
          onStart={check => { setPainOpen(false); onClose(); startCustom(session.circuit, session.list, customMode(place), check); }}
        />
      )}
    </div>
  );
}
