'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/store/store';
import { getModeData } from '@/core/data-index';
import { getCapacityLevel, getReadiness, estimateDuration, asksPainCheck, applyPainCheck } from '@/core/engine';
import { getBlockWeek } from '@/core/block';
import { recommend } from '@/core/recommend';
import { healthReadiness } from '@/core/health';
import { localDate } from '@/core/dates';
import { sessionListFor } from '@/store/slices/workout-slice';
import { CONFIG } from '@/core/config';
import { useSwipe } from '@/hooks/use-swipe';
import SettingsOverlay from '@/components/shared/SettingsOverlay';
import SessionInfo from '@/components/shared/SessionInfo';
import PainCheck from '@/components/shared/PainCheck';
import type { Mode, EnergyKey } from '@/core/types';
import styles from './HomeScreen.module.css';

export default function HomeScreen() {
  const {
    mode, circuitIndex, energy, humorLine,
    pendingDecayEvents, progress, benchmarkResults, sessionLog, climbLog, blockStart,
    recommendedOn, showRecommended, health, settings, energySuggestedOn, suggestEnergy,
    setMode, changeCircuit, setEnergy, setScreen, openClimbLog,
    startWorkout, dismissDecay,
  } = useStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [painOpen, setPainOpen] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const circuits = getModeData(mode);
  const circuit = circuits[circuitIndex];

  // Apple Health: sleep and HRV against the athlete's own week suggest an
  // energy. Applied once a day; any tap on the tabs overrides it.
  const healthDay = useMemo(
    () => (settings.health.connected ? healthReadiness(health) : null),
    [health, settings.health.connected],
  );
  // Where this week sits in the training block, and what today calls for.
  const block = getBlockWeek(blockStart, sessionLog);
  const recommendation = useMemo(
    () => recommend({ sessionLog, climbLog, progress, benchmarkResults, block, tired: healthDay?.energy === 'TIRED' }),
    // block is derived from blockStart and sessionLog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionLog, climbLog, progress, benchmarkResults, blockStart, healthDay],
  );
  const isRecommended = recommendation?.circuitId === circuit.id;

  useEffect(() => {
    const today = localDate();
    if (!healthDay || energySuggestedOn === today) return;
    suggestEnergy(healthDay.energy, today);
  }, [healthDay, energySuggestedOn, suggestEnergy]);

  // Open on the recommendation once a day; after that the athlete's own
  // choice of card stands.
  useEffect(() => {
    const today = localDate();
    if (recommendedOn === today || !recommendation) return;
    showRecommended(recommendation.mode, recommendation.circuitId, today);
    setCardKey(k => k + 1);
  }, [recommendation, recommendedOn, showRecommended]);

  const handleSwipe = useCallback((dir: number) => {
    changeCircuit(dir);
    setCardKey(k => k + 1);
  }, [changeCircuit]);

  const { bind, swipeInProgress } = useSwipe({
    onSwipeLeft: () => handleSwipe(1),
    onSwipeRight: () => handleSwipe(-1),
  });

  // Finger sessions ask how fingers and wrists feel before they start.
  const begin = () => {
    if (asksPainCheck(circuit)) setPainOpen(true);
    else startWorkout();
  };
  const lastPain = [...sessionLog].reverse().find(s => s.pain !== undefined)?.pain ?? null;

  const handleCardClick = () => {
    if (!swipeInProgress.current) begin();
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
  const list = sessionListFor({ energy, progress, benchmarkResults, blockStart, sessionLog }, circuit);
  const duration = estimateDuration(list);

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
        {/* On the recommended card the line under the logo says why it is the
            one for today; on any other card it is the usual joke. */}
        <div className={styles.humorLine}>
          {isRecommended && recommendation ? recommendation.reason : humorLine}
        </div>
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

      {/* A rough night: say why TIRED was picked */}
      {healthDay?.energy === 'TIRED' && (
        <div className={styles.readinessBanner}>
          TIRED suggested: {healthDay.reasons.join(', ')}.
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
          {/* The dot-matrix figures animate themselves. Under reduced motion the
              page swaps in the still key pose: an SVG loaded as an image does
              not reliably see that preference itself. */}
          <picture className={styles.illustrationPicture}>
            <source
              media="(prefers-reduced-motion: reduce)"
              srcSet={`/images/still/${circuit.illustration}`}
            />
            <Image
              src={`/images/${circuit.illustration}`}
              alt={circuit.title}
              width={200}
              height={200}
              className={`${styles.illustration} ${styles.illusPop}`}
            />
          </picture>
        </div>

        {/* Energy tabs */}
        <div className={styles.energyTabs} role="tablist">
          {(Object.keys(CONFIG.energy) as EnergyKey[]).map(e => (
            <button
              key={e}
              role="tab"
              aria-selected={e === energy}
              className={`${styles.energyTab}${e === energy ? ` ${styles.energyTabActive}` : ''}${e === healthDay?.energy ? ` ${styles.energyTabSuggested}` : ''}`}
              title={e === healthDay?.energy ? `Suggested by Apple Health: ${healthDay.reasons.join(', ')}` : undefined}
              onClick={(ev) => { ev.stopPropagation(); setEnergy(e); }}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Info bar */}
        <div className={styles.infoBar} onClick={e => e.stopPropagation()}>
          <span className={styles.duration}>
            {duration} min.
            <span className={block.deload ? styles.blockDeload : styles.blockWeek}>
              {block.deload ? 'DELOAD' : `WEEK ${block.week}/${block.buildWeeks}`}
            </span>
          </span>
          <div className={styles.infoRight}>
            <div className={styles.dots}>
              {[0, 1, 2].map(i => (
                <div key={i} className={`${styles.dot}${i < filledDots ? ` ${styles.dotFilled}` : ''}`} />
              ))}
            </div>
            <button
              className={styles.infoBtn}
              onClick={() => setInfoOpen(true)}
              aria-label={`What is in ${circuit.title}`}
            >
              i
            </button>
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
        onClick={() => openClimbLog()}
      >
        CLIMB LOG <span className={styles.actionBtnArrow}>&rarr;</span>
      </button>

      <button
        className={styles.actionBtn}
        onClick={() => setSettingsOpen(true)}
      >
        Settings <span className={styles.actionBtnArrow}>&rarr;</span>
      </button>

      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PainCheck
        open={painOpen}
        title={circuit.title}
        lastPain={lastPain}
        remainingFor={pain => applyPainCheck(list, pain).filter(e => e.block !== 'WARMUP').length}
        onClose={() => setPainOpen(false)}
        onStart={pain => { setPainOpen(false); startWorkout(pain); }}
      />
      <SessionInfo
        open={infoOpen}
        mode={mode}
        circuit={circuit}
        list={list}
        energy={energy}
        duration={duration}
        onClose={() => setInfoOpen(false)}
        onStart={() => { setInfoOpen(false); begin(); }}
      />
    </div>
  );
}
