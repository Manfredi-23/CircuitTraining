'use client';

import { useStore } from '@/store/store';
import { CONFIG } from '@/core/config';
import { getBenchmark } from '@/core/benchmarks';
import styles from './CompleteScreen.module.css';

export default function CompleteScreen() {
  const {
    mode, energy, circuit, sessionStartTime, sessionLevelUps,
    setScreen, pickHumorLine, openClimbLog, benchmarkResults,
  } = useStore();

  const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;

  // After a test session, show what was saved: the confirmation the stepper
  // itself cannot give, since a result commits on the last DONE.
  const today = new Date().toISOString().slice(0, 10);
  const savedToday = mode === 'TEST'
    ? benchmarkResults.filter(r => r.date.slice(0, 10) === today)
    : [];

  const handleDone = () => {
    pickHumorLine();
    setScreen('home');
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
