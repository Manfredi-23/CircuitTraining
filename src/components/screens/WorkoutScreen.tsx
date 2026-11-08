'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { getCapacityLevel } from '@/core/engine';
import { CONFIG } from '@/core/config';
import { getLoadAxis, formatLoad } from '@/core/load';
import { describeTweak } from '@/core/adjust';
import LoadLogger from '@/components/shared/LoadLogger';
import FormGuide from '@/components/shared/FormGuide';
import SessionProgressBar from '@/components/shared/SessionProgressBar';
import AdjustControls from '@/components/shared/AdjustControls';
import ReservePicker from '@/components/shared/ReservePicker';
import Led from '@/components/shared/Led';
import { formatTime } from '@/hooks/use-timer';
import { phaseOf, phaseTag } from '@/core/phases';
import { focusOf, transferLine } from '@/core/transfer';
import { lastTimeNote } from '@/core/notes';
import { exerciseLibrary } from '@/core/reserve';
import { localDate } from '@/core/dates';
import { editContextFor } from '@/core/alternatives';
import SwipeRow from '@/components/shared/SwipeRow';
import SwapPicker from '@/components/shared/SwapPicker';
import styles from './WorkoutScreen.module.css';

/** Long names step down so the name stays on two lines and the reps lead. */
function nameSize(name: string): string {
  if (name.length > 40) return ` ${styles.exNameLong}`;
  if (name.length > 19) return ` ${styles.exNameMid}`;
  return '';
}

export default function WorkoutScreen() {
  const {
    mode, circuit, stepIndex, setIndex,
    currentExercise, swapActive, formGuideOpen, progress,
    exerciseDone, exerciseSkip, exitWorkout, toggleSwap, toggleFormGuide,
    rampBest, attemptMade, attemptFailed, finishRamp, finishNow, energy, switchEnergy,
  } = useStore();
  const tweaks = useStore(s => s.tweaks);
  const restOverrun = useStore(s => s.restOverrun);
  const exerciseList = useStore(s => s.exerciseList);
  const exerciseNotes = useStore(s => s.exerciseNotes);
  const setExerciseNote = useStore(s => s.setExerciseNote);
  const chooseOption = useStore(s => s.chooseOption);
  const swapLive = useStore(s => s.swapLive);
  const sessionPain = useStore(s => s.sessionPain);
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const loadLog = useStore(s => s.loadLog);
  const benchmarkResults = useStore(s => s.benchmarkResults);
  const dayPlan = useStore(s => s.dayPlan);
  const [reserveOpen, setReserveOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  if (!currentExercise || !circuit) return null;

  const hasVariations = currentExercise.variations && currentExercise.variations.length > 1;
  const baseName = currentExercise.variations?.[0]?.name || currentExercise.name;
  const ramp = currentExercise.ramp;
  const axis = getLoadAxis(currentExercise);
  const bestText = rampBest !== null && axis ? formatLoad(rampBest, axis) : null;
  // What the exercise is for in the session: its phase and place in it, or the test section.
  const tagLead = currentExercise.section ?? phaseTag(exerciseList, stepIndex);
  const tweakText = describeTweak(currentExercise, tweaks[currentExercise.id]);
  const forLine = transferLine(currentExercise);
  const focus = phaseOf(currentExercise) === 'SKILL' ? focusOf(currentExercise) : null;
  const today = localDate();
  const lastNote = lastTimeNote(exerciseNotes, currentExercise.id, today);
  const todayNote = exerciseNotes[currentExercise.id]?.day === today ? exerciseNotes[currentExercise.id].text : '';
  const lib = exerciseLibrary();
  const choices = setIndex === 1 ? (currentExercise.options ?? []).filter(id => lib.has(id) && !exerciseList.some(e => e.id === id)) : [];
  // Before its first set the exercise in hand can be swapped (v45): the rack is busy, the box is taken.
  const canSwap = setIndex === 1 && !ramp && currentExercise.block !== 'TEST';
  const swipe = canSwap ? [
    { label: 'SWAP', aria: `Swap ${currentExercise.displayName}`, onClick: () => setSwapOpen(true) },
    { label: 'OUT', aria: `Skip ${currentExercise.displayName}`, onClick: exerciseSkip },
  ] : null;

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={exitWorkout}>EXIT</button>
        <span className={styles.modeLabel}>{mode} &middot; {circuit.title}</span>
        <span className={styles.energyBadge}>{currentExercise.appliedIntensity}</span>
      </div>

      {/* Every set of the session, grouped by exercise */}
      <SessionProgressBar />

      {/* Scrollable content */}
      <div className={styles.scroll}>
        {/* The app slept through the end of rest: say so, the next set is already late */}
        {restOverrun >= 15 && (
          <div className={styles.overrun} role="status">
            REST ENDED {formatTime(restOverrun)} AGO
          </div>
        )}
        <div className={styles.roundTag}>
          {ramp
            ? `${tagLead} · ATTEMPT ${setIndex} OF UP TO ${ramp.maxAttempts}`
            : `${tagLead} · SET ${setIndex}/${currentExercise.scaledSets}`}
        </div>
        {ramp && (
          <div className={styles.rampBest}>
            {bestText ? `BEST CLEAN SO FAR: ${bestText}` : 'NO CLEAN ATTEMPT YET'}
          </div>
        )}

        <SwipeRow actions={swipe}>
          <div
            key={`name-${stepIndex}`}
            className={`${styles.exName} ${styles.exNameEnter}${nameSize(currentExercise.displayName)}`}
          >
            {currentExercise.displayName}
          </div>
        </SwipeRow>

        {/* What it is for on the wall; the capacity levels when it serves no move directly. */}
        {forLine ? <div className={styles.forLine}>{forLine}</div> : (
          <div className={styles.muscleTags}>
            {currentExercise.capacities.map(c => (
              <span key={c} className={styles.muscleTag}>
                {CONFIG.capacityLabels[c].toUpperCase()} L{getCapacityLevel(progress, c)}
              </span>
            ))}
          </div>
        )}

        <div key={`reps-${stepIndex}`} className={styles.repsDisplay}>
          <Led
            text={currentExercise.unit === 'sec' ? `${currentExercise.scaledWork}s` : `x${currentExercise.scaledWork}`}
            dot={8}
            unlit="none"
            animate
            label={currentExercise.unit === 'sec' ? `${currentExercise.scaledWork} seconds` : `${currentExercise.scaledWork} reps`}
          />
          {currentExercise.perSide ? <span className={styles.perSide}>/ side</span> : null}
        </div>

        {/* Skill work: one external cue, large. What the movement does, not the body part. */}
        {focus && <div className={styles.focus}>{focus}</div>}

        {lastNote && <div className={styles.lastNote}><b>LAST TIME</b> {lastNote.text}</div>}

        {/* Load prescription — where progression actually lives */}
        <div className={styles.loadLine}>{currentExercise.loadText}</div>

        {/* What is actually on the belt today, against what it was last time.
            Recorded when the final set is marked DONE. */}
        <LoadLogger exercise={currentExercise} />

        {currentExercise.note && <div className={styles.note}>{currentExercise.note}</div>}

        <FormGuide exercise={currentExercise} open={formGuideOpen} onToggle={toggleFormGuide} />

        {/* Everything that changes the session, folded away while a set is on */}
        <button
          className={styles.adjustToggle}
          aria-expanded={adjustOpen}
          onClick={() => setAdjustOpen(o => !o)}
        >
          <span className={styles.adjustText}>
            <span className={styles.adjustTitle}>ADJUST</span>
            <span className={styles.adjustSub}>{tweakText ?? 'Easier, harder, sets, swap, note, add, energy, finish'}</span>
          </span>
          <span className={styles.adjustMark} aria-hidden="true">{adjustOpen ? '-' : '+'}</span>
        </button>

        {adjustOpen && (
          <div className={styles.adjustBody}>
            {/* Harder / easier for good, sets for today */}
            <AdjustControls />

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

            {/* A choice slot: another exercise for the same job, before its first set */}
            {choices.length > 0 && (
              <div className={styles.choice}>
                <span className={styles.choiceLabel}>{currentExercise.slot ?? 'SAME JOB'}: OR</span>
                {choices.map(id => (
                  <button key={id} className={styles.choiceBtn} onClick={() => chooseOption(id)}>{lib.get(id)!.name}</button>
                ))}
              </div>
            )}

            {canSwap && (
              <button className={styles.btnSwapOther} onClick={() => setSwapOpen(true)}>
                SWAP FOR ANOTHER EXERCISE
                <span className={styles.swapHint}>Similar, other kit, or any. Or swipe the name left.</span>
              </button>
            )}

            {/* Progression rule */}
            <div className={styles.progressionBox}>
              <span className={styles.progressionLabel}>NEXT STEP</span>
              <p className={styles.progressionText}>{currentExercise.progression}</p>
            </div>

            {/* Feeling better or worse than at the start: the rest of the session follows */}
            {!ramp && (
              <div className={styles.energyRow} role="group" aria-label="Energy for the rest of the session">
                <span className={styles.energyLabel}>ENERGY</span>
                {(['FRESH', 'NORMAL', 'TIRED'] as const).map(e => (
                  <button
                    key={e}
                    aria-pressed={e === energy}
                    className={`${styles.energyBtn}${e === energy ? ` ${styles.energyBtnOn}` : ''}`}
                    onClick={() => switchEnergy(e)}
                  >{e}</button>
                ))}
              </div>
            )}

            {/* One line for next time: shown as LAST TIME when this exercise comes up again */}
            <label className={styles.noteField}>
              <span className={styles.noteLabel}>NOTE FOR NEXT TIME</span>
              <input
                key={currentExercise.id}
                className={styles.noteInput}
                defaultValue={todayNote}
                maxLength={140}
                placeholder="e.g. right knee caves on the step-down"
                onBlur={e => setExerciseNote(currentExercise.id, e.target.value)}
              />
            </label>

            {/* More than written: the reserve, or stop here and keep what was done */}
            <div className={styles.extraRow}>
              <button className={styles.btnAdd} onClick={() => setReserveOpen(true)}>+ ADD EXERCISE</button>
              <button className={styles.linkBtn} onClick={finishNow}>FINISH NOW</button>
            </div>
          </div>
        )}
      </div>

      <ReservePicker open={reserveOpen} onClose={() => setReserveOpen(false)} />
      {swapOpen && canSwap && (
        <SwapPicker
          exercise={currentExercise}
          ctx={editContextFor(mode, circuit.id, { sessionLog, climbLog, dayPlan, loadLog, benchmarkResults }, sessionPain)}
          taken={exerciseList.map(e => e.id)}
          live
          onClose={() => setSwapOpen(false)}
          onPick={id => { swapLive(stepIndex, id); setSwapOpen(false); }}
        />
      )}

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
