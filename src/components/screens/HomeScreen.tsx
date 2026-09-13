'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useStore } from '@/store/store';
import { getModeData } from '@/core/data-index';
import { getCapacityLevel, getReadiness, buildList, estimateDuration } from '@/core/engine';
import { CONFIG } from '@/core/config';
import { useSwipe } from '@/hooks/use-swipe';
import SettingsOverlay from '@/components/shared/SettingsOverlay';
import type { Mode, EnergyKey } from '@/core/types';
import styles from './HomeScreen.module.css';

export default function HomeScreen() {
  const {
    mode, circuitIndex, energy, humorLine,
    pendingDecayEvents, progress, benchmarkResults,
    setMode, changeCircuit, setEnergy, setScreen,
    startWorkout, dismissDecay,
  } = useStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const circuits = getModeData(mode);
  const circuit = circuits[circuitIndex];

  const handleSwipe = useCallback((dir: number) => {
    changeCircuit(dir);
    setCardKey(k => k + 1);
  }, [changeCircuit]);

  const { bind, swipeInProgress } = useSwipe({
    onSwipeLeft: () => handleSwipe(1),
    onSwipeRight: () => handleSwipe(-1),
  });

  const handleCardClick = () => {
    if (!swipeInProgress.current) startWorkout();
  };

  // Dots map the weakest capacity this session trains to a filled count.
  const minLevel = circuit.capacities.reduce(
    (min, c) => Math.min(min, getCapacityLevel(progress, c)),
    CONFIG.levels.length,
  );
  const filledDots = minLevel <= 2 ? 1 : minLevel <= 4 ? 2 : 3;

  // Recovery state for this session's key capacities. Fingers need 48h.
  const readiness = getReadiness(circuit, progress);

  // Duration is computed from the session as it will actually be prescribed at
  // this level and energy, rather than read off a hardcoded number.
  const duration = estimateDuration(buildList(circuit, energy, progress, benchmarkResults));

  // Derank message
  const derankMsg = pendingDecayEvents.length > 0
    ? CONFIG.derankMessages[Math.floor(Math.random() * CONFIG.derankMessages.length)]
        .replace('{capacity}', CONFIG.capacityLabels[pendingDecayEvents[0].capacity])
        .replace('{level}', String(pendingDecayEvents[0].level))
    : null;

  return (
    <div className="screen screen-enter">
      {/* Logo */}
      <div className={styles.logoWrap}>
        <Image src="/images/logo.svg" alt="7Bit" width={120} height={48} className={styles.logo} priority />
        <div className={styles.humorLine}>{humorLine}</div>
      </div>

      {/* Mode tabs */}
      <div className={styles.modeTabs} role="tablist">
        {CONFIG.modes.map(m => (
          <button
            key={m}
            role="tab"
            aria-selected={m === mode}
            className={`${styles.modeTab}${m === mode ? ` ${styles.modeTabActive}` : ''}`}
            onClick={() => { setMode(m as Mode); setCardKey(k => k + 1); }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Derank banner */}
      {derankMsg && (
        <div className={styles.derankBanner}>
          <span className={styles.derankText}>{derankMsg}</span>
          <button className={styles.derankDismiss} onClick={dismissDecay}>X</button>
        </div>
      )}

      {/* Recovery warning — the app should not reward training fingers too soon */}
      {readiness.level !== 'ready' && (
        <div className={`${styles.readinessBanner} ${readiness.level === 'rest' ? styles.readinessRest : ''}`}>
          {readiness.message}
        </div>
      )}

      {/* Circuit card — keyed wrapper forces remount for slide animation */}
      <div key={cardKey} className={styles.cardSlide}>
        <div
          {...bind()}
          className={styles.card}
          onClick={handleCardClick}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
          role="button"
          tabIndex={0}
          aria-label={`Start ${circuit.title} workout`}
        >
          <span className={styles.cardNum}>{circuit.circuitNum}</span>

        <div className={styles.titleBlock}>
          <div className={styles.cardTitle}>{circuit.title}</div>
          <div className={styles.titleDivider}>
            <span className={styles.cardSubtitle}>{circuit.subtitle}</span>
          </div>
        </div>

        {/* circuit.focus is intentionally not rendered here: the v9 card is a
            fixed 342x342 and a third text line collides with the illustration.
            It belongs on a session-detail view in the iOS rebuild. */}
        <div className={styles.illustrationWrap}>
          <Image
            src={`/images/${circuit.illustration}`}
            alt={circuit.title}
            width={200}
            height={200}
            className={`${styles.illustration} ${styles.illusPop}`}
          />
        </div>

        {/* Energy tabs */}
        <div className={styles.energyTabs} role="tablist">
          {(Object.keys(CONFIG.energy) as EnergyKey[]).map(e => (
            <button
              key={e}
              role="tab"
              aria-selected={e === energy}
              className={`${styles.energyTab}${e === energy ? ` ${styles.energyTabActive}` : ''}`}
              onClick={(ev) => { ev.stopPropagation(); setEnergy(e); }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div className={styles.infoBar} onClick={e => e.stopPropagation()}>
          <span className={styles.duration}>{duration} min.</span>
          <div className={styles.dots}>
            {[0, 1, 2].map(i => (
              <div key={i} className={`${styles.dot}${i < filledDots ? ` ${styles.dotFilled}` : ''}`} />
            ))}
          </div>
        </div>
        </div>
      </div>

      {/* Action buttons */}
      <button
        className={`${styles.actionBtn} ${styles.actionBtnAccent}`}
        onClick={() => setScreen('stats')}
      >
        STATS <span className={styles.actionBtnArrow}>&rarr;</span>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => setSettingsOpen(true)}
      >
        Settings <span className={styles.actionBtnArrow}>&rarr;</span>
      </button>

      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
