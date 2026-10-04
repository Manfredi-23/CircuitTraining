'use client';

import { useStore } from '@/store/store';
import { getCapacityLevel } from '@/core/engine';
import { CONFIG } from '@/core/config';
import { getLoadAxis, formatLoad } from '@/core/load';
import LoadLogger from '@/components/shared/LoadLogger';
import FormGuide from '@/components/shared/FormGuide';
import SessionProgressBar from '@/components/shared/SessionProgressBar';
import styles from './WorkoutScreen.module.css';

export default function WorkoutScreen() {
  const {
    mode, circuit, stepIndex, setIndex,
    currentExercise, swapActive, formGuideOpen, progress,
    exerciseDone, exerciseSkip, exitWorkout, toggleSwap, toggleFormGuide,
    rampBest, attemptMade, attemptFailed, finishRamp,
  } = useStore();

  if (!currentExercise || !circuit) return null;

  const hasVariations = currentExercise.variations && currentExercise.variations.length > 1;
  const baseName = currentExercise.variations?.[0]?.name || currentExercise.name;
  const ramp = currentExercise.ramp;
  const axis = getLoadAxis(currentExercise);
  const bestText = rampBest !== null && axis ? formatLoad(rampBest, axis) : null;
  const tagLead = currentExercise.section ?? currentExercise.block;

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={exitWorkout}>EXIT</button>
        <span className={styles.modeLabel}>{mode} [{circuit.title}]</span>
        <span className={styles.energyBadge}>{currentExercise.appliedIntensity}</span>
      </div>

      {/* Every set of the session, grouped by exercise */}
      <SessionProgressBar />

      {/* Scrollable content */}
      <div className={styles.scroll}>
        <div className={styles.roundTag}>
          {ramp
            ? `${tagLead} - ATTEMPT ${setIndex} OF UP TO ${ramp.maxAttempts}`
            : `${tagLead} - SET ${setIndex}/${currentExercise.scaledSets}`}
        </div>
        {ramp && (
          <div className={styles.rampBest}>
            {bestText ? `BEST CLEAN SO FAR: ${bestText}` : 'NO CLEAN ATTEMPT YET'}
          </div>
        )}

        <div key={`name-${stepIndex}`} className={`${styles.exName} ${styles.exNameEnter}`}>
          {currentExercise.displayName}
        </div>

        <div className={styles.muscleTags}>
          {currentExercise.capacities.map(c => (
            <span key={c} className={styles.muscleTag}>
              {CONFIG.capacityLabels[c].toUpperCase()} L{getCapacityLevel(progress, c)}
            </span>
          ))}
        </div>

        <div key={`reps-${stepIndex}`} className={`${styles.repsDisplay} ${styles.repsPop}`}>
          {currentExercise.unit === 'sec'
            ? `${currentExercise.scaledWork}s`
            : `x${currentExercise.scaledWork}`}
          {currentExercise.perSide ? <span className={styles.perSide}> / side</span> : null}
        </div>

        {/* Load prescription — where progression actually lives */}
        <div className={styles.loadLine}>{currentExercise.loadText}</div>

        {/* What is actually on the belt today, against what it was last time.
            Recorded when the final set is marked DONE. */}
        <LoadLogger exercise={currentExercise} />

        {currentExercise.note && <div className={styles.note}>{currentExercise.note}</div>}

        {/* Variation swap */}
        {hasVariations && currentExercise.activeVariation && currentExercise.activeVariation.minLevel > 1 && (
          <div className={styles.variationSwap}>
            <button className={styles.btnSwap} onClick={toggleSwap}>
              {swapActive ? 'REVERT' : 'SWAP'}
            </button>
            <span className={styles.swapOr}>or:</span>
            <span className={styles.baseName}>{swapActive ? currentExercise.name : baseName}</span>
          </div>
        )}

        {/* Progression rule */}
        <div className={styles.progressionBox}>
          <span className={styles.progressionLabel}>NEXT STEP</span>
          <p className={styles.progressionText}>{currentExercise.progression}</p>
        </div>

        <FormGuide exercise={currentExercise} open={formGuideOpen} onToggle={toggleFormGuide} />
      </div>

      {/* Actions */}
      {ramp ? (
        <>
          <div className={styles.rampLinks}>
            <button className={styles.linkBtn} onClick={exerciseSkip}>SKIP TEST</button>
            {bestText && (
              <button className={styles.linkBtn} onClick={finishRamp}>STOP HERE, SAVE {bestText}</button>
            )}
          </div>
          <div className={styles.actions}>
            <button className={styles.btnSkip} onClick={attemptFailed}>FAILED</button>
            <button className={styles.btnDone} onClick={attemptMade}>MADE IT</button>
          </div>
        </>
      ) : (
        <div className={styles.actions}>
          <button className={styles.btnSkip} onClick={exerciseSkip}>SKIP</button>
          <button className={styles.btnDone} onClick={exerciseDone}>DONE</button>
        </div>
      )}
    </div>
  );
}
