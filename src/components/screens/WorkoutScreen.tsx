'use client';

import { useStore } from '@/store/store';
import { getCapacityLevel } from '@/core/engine';
import { getProtocol } from '@/core/protocols';
import { CONFIG } from '@/core/config';
import LoadLogger from '@/components/shared/LoadLogger';
import type { FormGuide } from '@/core/types';
import styles from './WorkoutScreen.module.css';

const FORM_SECTIONS: { key: keyof FormGuide; label: string }[] = [
  { key: 'setup', label: 'SETUP' },
  { key: 'execution', label: 'EXECUTION' },
  { key: 'cue', label: 'CUE' },
  { key: 'breathing', label: 'BREATHING' },
  { key: 'mistakes', label: 'MISTAKES' },
];

export default function WorkoutScreen() {
  const {
    mode, circuit, exerciseList, stepIndex, setIndex,
    currentExercise, swapActive, formGuideOpen, progress,
    exerciseDone, exerciseSkip, exitWorkout, toggleSwap, toggleFormGuide,
  } = useStore();

  if (!currentExercise || !circuit) return null;

  const totalSteps = exerciseList.length;
  const pct = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  const hasVariations = currentExercise.variations && currentExercise.variations.length > 1;
  const baseName = currentExercise.variations?.[0]?.name || currentExercise.name;
  const protocol = getProtocol(currentExercise.protocolId);

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={exitWorkout}>EXIT</button>
        <span className={styles.modeLabel}>{mode} [{circuit.title}]</span>
        <span className={styles.energyBadge}>{currentExercise.appliedIntensity}</span>
        <span className={styles.step}>{stepIndex + 1}/{totalSteps}</span>
      </div>

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      {/* Scrollable content */}
      <div className={styles.scroll}>
        <div className={styles.roundTag}>
          {currentExercise.block} - SET {setIndex}/{currentExercise.scaledSets}
        </div>

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

        {/* Form guide */}
        {currentExercise.form && (
          <>
            <div className={styles.formToggle} onClick={toggleFormGuide}>
              <span className={styles.btnFormToggle}>FORM GUIDE</span>
              <span className={styles.btnFormToggle}>{formGuideOpen ? '-' : '+'}</span>
            </div>
            {formGuideOpen && (
              <div className={styles.formContent}>
                {FORM_SECTIONS.map(({ key, label }) => (
                  currentExercise.form?.[key] ? (
                    <div key={key} className={styles.formSection}>
                      <span className={styles.formLabel}>{label}</span>
                      <p className={styles.formText}>{currentExercise.form[key]}</p>
                    </div>
                  ) : null
                ))}
                {protocol && (
                  <div className={styles.formSection}>
                    <span className={styles.formLabel}>WHY</span>
                    <p className={styles.formText}>{protocol.rationale}</p>
                    <p className={styles.formSource}>{protocol.source}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.btnSkip} onClick={exerciseSkip}>SKIP</button>
        <button className={styles.btnDone} onClick={exerciseDone}>DONE</button>
      </div>
    </div>
  );
}
