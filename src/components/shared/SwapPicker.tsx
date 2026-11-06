'use client';

import { useMemo } from 'react';
import { allowedToday, cautionToday, similarTo, type EditContext } from '@/core/session-edit';
import { otherKitFor } from '@/core/alternatives';
import { kitText } from '@/core/exercise-tags';
import type { Exercise } from '@/core/types';
import ExercisePicker from './ExercisePicker';

/**
 * SWAP from a swipe (v45): SIMILAR, OTHER KIT (the same job without the kit
 * that is taken) and SEARCH ALL, only what may go in today. In a running
 * session (`live`) nothing gated is offered: a gate substitutes when a
 * session is built, not when an exercise is dropped into one.
 */
export default function SwapPicker({ exercise, ctx, taken, live = false, onPick, onClose }: {
  exercise: Exercise;
  ctx: EditContext;
  taken: string[];
  live?: boolean;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const key = `${exercise.id}|${ctx.place}|${ctx.mode}|${ctx.healing}|${ctx.pain}|${ctx.noKit}|${taken.join()}|${live}`;
  const similar = useMemo(
    () => similarTo(exercise, ctx, taken).filter(e => !live || !e.exercise.gate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const otherKit = useMemo(
    () => otherKitFor(exercise, ctx, taken, { liveSession: live }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const allow = useMemo(
    () => (e: Exercise) => allowedToday(e, ctx) && !(live && e.gate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const caution = useMemo(
    () => (e: Exercise) => cautionToday(e, ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return (
    <ExercisePicker
      place={ctx.place}
      taken={taken}
      title="SWAP"
      replacing={exercise.name}
      similar={similar}
      otherKit={otherKit}
      kit={kitText(exercise) || undefined}
      allow={allow}
      caution={caution}
      onPick={onPick}
      onClose={onClose}
    />
  );
}
