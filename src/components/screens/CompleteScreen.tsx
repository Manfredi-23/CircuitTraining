'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { formatLoad, getLoadAxis } from '@/core/load';
import { saveWorkout } from '@/native/health';
import { CONFIG } from '@/core/config';
import { getBenchmark } from '@/core/benchmarks';
import { getBlockWeek, deloads } from '@/core/block';
import { suggestLoad } from '@/core/progression';
import { totalXP } from '@/core/engine';
import ScalePicker from '@/components/shared/ScalePicker';
import WeekRail from '@/components/shared/WeekRail';
import Led from '@/components/shared/Led';
import UndoToast from '@/components/shell/UndoToast';
import styles from './CompleteScreen.module.css';

export default function CompleteScreen() {
  const {
    mode, energy, circuit, sessionStartTime, sessionLevelUps,
    setTab, pickHumorLine, openClimbLog, benchmarkResults, clearUndo,
    sessionLog, rateLastSession, rateExercise, sessionPBs, exerciseList,
    loadLog, blockStart, progress, startXP,
  } = useStore();
  const last = sessionLog[sessionLog.length - 1];
  const effort = last?.effort;
  // Loaded work that was actually done: the load suggestion reads how each felt.
  const loaded = exerciseList.filter(ex => !ex.records && !ex.ramp && getLoadAxis(ex) && (last?.sets?.[ex.id] ?? 0) > 0);
  const health = useStore(s => s.settings.health);
  const deload = Boolean(circuit && deloads(circuit) && getBlockWeek(blockStart, sessionLog).deload);

  // Saved to Apple Health once, when the screen first shows. DAILY is core
  // and mobility work; CAVE and TEST are strength.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || !health.connected || !health.writeWorkouts || !sessionStartTime || !circuit) return;
    savedRef.current = true;
    void saveWorkout(new Date(sessionStartTime), new Date(), mode === 'DAILY' ? 'core' : 'strength', `${mode} ${circuit.title}`);
  }, [health.connected, health.writeWorkouts, sessionStartTime, circuit, mode]);

  const duration = last?.duration ?? 0;
  const setsDone = Object.values(last?.sets ?? {}).reduce((a, b) => a + b, 0);
  const setsPlanned = Object.values(last?.planned ?? {}).reduce((a, b) => a + b, 0);
  const xp = Math.max(0, totalXP(progress) - startXP);

  // After a test session, show what was saved: the confirmation the stepper
  // itself cannot give, since a result commits on the last DONE.
  const today = new Date().toISOString().slice(0, 10);
  const savedToday = mode === 'TEST'
    ? benchmarkResults.filter(r => r.date.slice(0, 10) === today)
    : [];

  const handleDone = () => {
    clearUndo();
    pickHumorLine();
    setTab('today');
  };

  return (
    <div className={`screen screen-enter ${styles.screen}`}>

      <div className={styles.top}>
        <div className={styles.title}>SESSION COMPLETE</div>
        <div className={styles.sub}>{mode} &middot; {circuit?.title} &middot; {energy}</div>
      </div>

      {/* What the session was, in the figures the rest of the app uses */}
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <span className={styles.tileLabel}>MINUTES</span>
          <Led text={String(duration)} dot={5} label={`${duration} minutes`} />
        </div>
        {setsPlanned > 0 && (
          <div className={styles.tile}>
            <span className={styles.tileLabel}>SETS</span>
            <span className={styles.tileFig}>
              <Led text={String(setsDone)} dot={5} label={`${setsDone} of ${setsPlanned} sets`} />
              <span className={styles.tileOf}>/{setsPlanned}</span>
            </span>
          </div>
        )}
        <div className={styles.tile}>
          <span className={styles.tileLabel}>XP</span>
          <Led text={`+${xp}`} dot={5} lit={xp > 0 ? 'var(--accent)' : 'var(--ink)'} label={`${xp} XP earned`} />
        </div>
      </div>

      {sessionLevelUps.length > 0 && (
        <div className={styles.levelupList}>
          {sessionLevelUps.map((lu, i) => (
            <div
              key={`${lu.capacity}-${lu.level}`}
              className={styles.levelupItem}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              {CONFIG.capacityLabels[lu.capacity].toUpperCase()} &gt; L{lu.level}! {lu.unlocks}
            </div>
          ))}
        </div>
      )}

      {sessionPBs.length > 0 && (
        <div className={styles.saved}>
          <div className={styles.savedTitle}>PERSONAL BEST</div>
          {sessionPBs.map(pb => (
            <div key={pb} className={styles.savedRow}><span>{pb}</span></div>
          ))}
        </div>
      )}

      {savedToday.length > 0 && (
        <div className={styles.saved}>
          <div className={styles.savedTitle}>SAVED</div>
          {savedToday.map(r => {
            const b = getBenchmark(r.benchmarkId);
            return (
              <div key={r.benchmarkId} className={styles.savedRow}>
                <span>{b?.name ?? r.benchmarkId}</span>
                <b>{r.value} {b?.short ?? ''}</b>
              </div>
            );
          })}
        </div>
      )}

      {/* Session effort x minutes is the training load the LOAD chart and the
          load suggestions read. Asked once, here, while it is still fresh. */}
      <div className={`${styles.effort} dot-rule`}>
        <div className={styles.effortTitle}>HOW HARD WAS THAT?</div>
        <ScalePicker
          min={1}
          max={10}
          value={effort}
          onChange={rateLastSession}
          label="Session effort, 1 to 10"
          lowText="VERY EASY"
          highText="MAXIMAL"
        />
      </div>

      {loaded.length > 0 && (
        <div className={styles.feel}>
          <div className={styles.effortTitle}>HOW DID EACH ONE FEEL?</div>
          {loaded.map(ex => {
            // Next time's load, read live: it moves as the feel and effort are given.
            const next = suggestLoad(ex, loadLog, sessionLog, deload);
            const axis = getLoadAxis(ex);
            return (
              <div key={ex.id} className={styles.feelItem}>
                <div className={styles.feelRow}>
                  <span className={styles.feelName}>{ex.displayName}</span>
                  <span className={styles.feelChips}>
                    {(['EASY', 'RIGHT', 'HARD'] as const).map(f => (
                      <button
                        key={f}
                        className={`${styles.feelChip}${last?.feel?.[ex.id] === f ? ` ${styles.feelChipOn}` : ''}`}
                        aria-pressed={last?.feel?.[ex.id] === f}
                        onClick={() => rateExercise(ex.id, f)}
                      >{f}</button>
                    ))}
                  </span>
                </div>
                {next && axis && (
                  <div className={styles.next}>
                    NEXT TIME <b>{formatLoad(next.value, axis)}</b>{next.kind === 'up' ? ' (one step on)' : ' (hold)'}
                  </div>
                )}
              </div>
            );
          })}
          <div className={styles.feelHint}>Easy or right: next time one step on. Hard: hold. Skip it and the session effort decides.</div>
        </div>
      )}

      <div className={`${styles.week} dot-rule`}>
        <div className={styles.effortTitle}>THIS WEEK</div>
        <WeekRail />
      </div>

      <div className={styles.spacer} />
      {/* Sessions built to follow a climbing session prompt for the climbs themselves. */}
      {circuit?.stacksOnSession && (
        <button className={styles.btnLog} onClick={() => { clearUndo(); pickHumorLine(); openClimbLog(); }}>
          LOG TODAY&apos;S CLIMBS <span>&rarr;</span>
        </button>
      )}
      <button className={styles.btnDone} onClick={handleDone}>DONE</button>
      <UndoToast bottom={128} />
    </div>
  );
}
