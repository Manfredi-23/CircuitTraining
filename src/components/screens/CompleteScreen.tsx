'use client';

import { useStore } from '@/store/store';
import { CONFIG } from '@/core/config';
import styles from './CompleteScreen.module.css';

export default function CompleteScreen() {
  const {
    mode, energy, circuit, sessionStartTime, sessionLevelUps,
    setScreen, pickHumorLine,
  } = useStore();

  const duration = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;

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

      <div className={styles.spacer} />
      <button className={styles.btnDone} onClick={handleDone}>DONE</button>
    </div>
  );
}
