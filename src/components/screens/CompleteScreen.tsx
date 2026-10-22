'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { getLoadAxis } from '@/core/load';
import { saveWorkout } from '@/native/health';
import { CONFIG } from '@/core/config';
import { getBenchmark } from '@/core/benchmarks';
import ScalePicker from '@/components/shared/ScalePicker';
import styles from './CompleteScreen.module.css';

export default function CompleteScreen() {
  const {
    mode, energy, circuit, sessionStartTime, sessionLevelUps,
    setTab, pickHumorLine, openClimbLog, benchmarkResults,
    sessionLog, rateLastSession, rateExercise, sessionPBs, exerciseList,
  } = useStore();
  const last = sessionLog[sessionLog.length - 1];
  const effort = last?.effort;
  // Loaded work that was actually done: the load suggestion reads how each felt.
  const loaded = exerciseList.filter(ex => !ex.records && !ex.ramp && getLoadAxis(ex) && (last?.sets?.[ex.id] ?? 0) > 0);
  const health = useStore(s => s.settings.health);

  // Saved to Apple Health once, when the screen first shows. DAILY is core
  // and mobility work; CAVE and TEST are strength.
  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || !health.connected || !health.writeWorkouts || !sessionStartTime || !circuit) return;
    savedRef.current = true;
    void saveWorkout(new Date(sessionStartTime), new Date(), mode === 'DAILY' ? 'core' : 'strength', `${mode} ${circuit.title}`);
  }, [health.connected, health.writeWorkouts, sessionStartTime, circuit, mode]);

  const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;

  // After a test session, show what was saved: the confirmation the stepper
  // itself cannot give, since a result commits on the last DONE.
  const today = new Date().toISOString().slice(0, 10);
  const savedToday = mode === 'TEST'
    ? benchmarkResults.filter(r => r.date.slice(0, 10) === today)
    : [];

  const handleDone = () => {
    pickHumorLine();
    setTab('today');
  };

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      <div className={styles.spacer} />

      <div className={styles.top}>
        <div className={styles.check}>[OK]</div>
        <div className={styles.title}>SESSION COMPLETE</div>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Duration</span>
          <span className={styles.metaVal}>{duration} min</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Session</span>
          <span className={styles.metaVal}>{mode} [{circuit?.title}]</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>Energy</span>
          <span className={styles.metaVal}>{energy}</span>
        </div>
      </div>

      {/* Session effort x minutes is the training load the LOAD chart and the
          load suggestions read. Asked once, here, while it is still fresh. */}
      <div className={styles.effort}>
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
          {loaded.map(ex => (
            <div key={ex.id} className={styles.feelRow}>
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
          ))}
          <div className={styles.feelHint}>Easy or right: next time one step on. Hard: hold. Skip it and the session effort decides.</div>
        </div>
      )}

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

      <div className={styles.spacer} />
      {/* Sessions built to follow a climbing session prompt for the climbs themselves. */}
      {circuit?.stacksOnSession && (
        <button className={styles.btnLog} onClick={() => { pickHumorLine(); openClimbLog(); }}>
          LOG TODAY&apos;S CLIMBS <span>&rarr;</span>
        </button>
      )}
      <button className={styles.btnDone} onClick={handleDone}>DONE</button>
    </div>
  );
}
