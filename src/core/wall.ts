// =============================================================================
// wall.ts — What to work on the next time on the wall
//
// Bouldering stays the athlete's own time: nothing here is a session, only a
// focus for it. Three parts, each one drill:
//
//   TECHNIQUE  feet first (the athlete's own read), chosen from the styles
//              they fall on (`limiters.ts`) when there are enough tags,
//              otherwise rotated through the footwork drills
//   HEAD       "I'm scared and I rarely give 110%": try-hard burns, falling
//              on purpose, committing to the move, chosen from the falls
//              put down to the head and how often a go was given at 110%
//   STAMINA    when a week has gone without one, or pump leads the falls;
//              every session in the BASE phase. With little rope time it is
//              done on boulders: 4x4s, ARC traverses, up-down-up
//
// While a finger heals, a line says which grips are fine and which are not
// recommended yet, from how far the left ring finger is along. Nothing is
// taken away.
// =============================================================================

import { daysBetween, localDate } from './dates';
import { getLimiters, type Limiters } from './limiters';
import { RING_GOAL_PCT } from './rehab';
import type { SeasonPhase } from './season';
import type { ClimbSession } from './types';

export type DrillKind = 'TECHNIQUE' | 'HEAD' | 'STAMINA';

export interface WallDrill {
  id: string;
  kind: DrillKind;
  name: string;
  /** What to do, in two or three sentences. */
  how: string;
  /** How much, in a few words. */
  dose: string;
  /** Climb tags and fall reasons it answers. */
  answers: string[];
  /** Phases it suits best; empty for any. */
  phases?: SeasonPhase[];
  /** Needs a rope: offered only with a sport goal. */
  rope?: boolean;
}

export const WALL_DRILLS: WallDrill[] = [
  // Technique and feet.
  {
    id: 'silent-feet', kind: 'TECHNIQUE', name: 'Silent feet',
    how: 'Every foot goes on without a sound. Look at the hold until the foot is on it. A tap or a scrape means down and again.',
    dose: 'The warm-up: 5-6 easy problems', answers: ['feet', 'smear', 'slab', 'vertical'],
  },
  {
    id: 'hover-feet', kind: 'TECHNIQUE', name: 'Hover feet',
    how: 'Hold each foot a second just above the hold before placing it. Precision first, then weight.',
    dose: '4 problems two grades under your best', answers: ['feet', 'crimp', 'vertical'],
  },
  {
    id: 'sticky-feet', kind: 'TECHNIQUE', name: 'Sticky feet',
    how: 'Once a foot is placed it may not move, adjust or re-step until the hand moves on. Place it right the first time.',
    dose: '4 problems at flash level', answers: ['feet', 'smear', 'slab'],
  },
  {
    id: 'toes-on', kind: 'TECHNIQUE', name: 'Toes on, hips in',
    how: 'On steep ground keep both toes on through every move, pulling with the feet and the hips close to the wall. A foot cut means start again.',
    dose: '4 steep problems', answers: ['overhang', 'roof', 'tension', 'compression'],
  },
  {
    id: 'hooks', kind: 'TECHNIQUE', name: 'Heel and toe hooks',
    how: 'Find a heel or a toe hook on every problem, then try it on the other side too. Pull with the hamstring, not just rest on it.',
    dose: '4 steep problems', answers: ['heel', 'toe', 'overhang', 'roof', 'tension'],
  },
  {
    id: 'flag-it', kind: 'TECHNIQUE', name: 'Flag instead of matching',
    how: 'No matched feet: flag inside or outside on every move. Feel the hip turn into the wall.',
    dose: '5 vertical problems', answers: ['vertical', 'coordination', 'crimp'],
  },
  {
    id: 'squeeze', kind: 'TECHNIQUE', name: 'Squeeze from the feet',
    how: 'Compression and pinches: push the feet into the wall as hard as the hands squeeze, and keep the hips square.',
    dose: '3-4 compression problems, 3 goes each', answers: ['compression', 'pinch', 'volume', 'sloper'],
  },
  {
    id: 'rock-over', kind: 'TECHNIQUE', name: 'Hips over the foot',
    how: 'High feet: get the hips right over the foot before the hand leaves. Stand up slowly, no jump.',
    dose: '4 problems with high steps', answers: ['rockover', 'mantle', 'reach', 'slab'],
  },
  {
    id: 'read-first', kind: 'TECHNIQUE', name: 'Read before you touch',
    how: 'Before the first go on a new problem, say the hands and feet out loud, move by move. Then climb it as read.',
    dose: 'Every new problem today', answers: ['beta', 'coordination'],
  },
  {
    id: 'dyno-laps', kind: 'TECHNIQUE', name: 'Coordination laps',
    how: 'Easy dynos and deadpoints: aim the hand at the hold, not the area. Five goes each, stop while they stay crisp.',
    dose: '3 problems, 5 goes each', answers: ['dyno', 'deadpoint', 'coordination', 'power'],
  },
  // Head.
  {
    id: 'try-hard', kind: 'HEAD', name: 'Three goes at 110%',
    how: 'On your hardest project: three goes at full effort. Breathe out loud, grunt, keep pulling until you come off. Backing off is the only way to fail it.',
    dose: '3 goes, 3-4 min rest between', answers: ['backed-off', 'power'],
  },
  {
    id: 'fall-practice', kind: 'HEAD', name: 'Fall on purpose',
    how: 'Climb an easy problem and let go on purpose: feet first, bend the knees, roll back. A little higher each time, only over a good mat.',
    dose: '5 falls before the hard climbing', answers: ['scared', 'mantle'],
  },
  {
    id: 'commit-move', kind: 'HEAD', name: 'Commit the crux',
    how: 'On three problems, go for the crux move fully even when you think you will not stick it. Count how often you let go before you fell.',
    dose: '3 problems', answers: ['backed-off', 'dyno', 'deadpoint', 'scared'],
  },
  {
    id: 'flash-goes', kind: 'HEAD', name: 'Flash goes',
    how: 'Three new problems at your flash grade: read them, then one go each, all in. No second looks before the go.',
    dose: '3 problems, one go each', answers: ['beta', 'backed-off'],
  },
  {
    id: 'top-out', kind: 'HEAD', name: 'Calm at the top',
    how: 'On the tallest problems you can do: stop at the lip, one slow breath, then top out. Practise being high and in control.',
    dose: '3 tall problems', answers: ['scared', 'mantle'],
  },
  {
    id: 'lead-falls', kind: 'HEAD', name: 'Lead falls',
    how: 'On a steep route with a belayer you trust: clip, climb a move above, call "falling" and let go. A little higher each time.',
    dose: '3-5 falls', answers: ['scared'], rope: true,
  },
  // Stamina, mostly on boulders: the athlete ropes up rarely.
  {
    id: 'four-by-four', kind: 'STAMINA', name: '4x4',
    how: 'Four problems two or three grades under your best, back to back with no rest. Rest four minutes, do it four times.',
    dose: '4 sets, about 25 min', answers: ['pump'], phases: ['POWER', 'STRENGTH'],
  },
  {
    id: 'arc', kind: 'STAMINA', name: 'ARC traverse',
    how: 'Easy continuous climbing: traverse or up-down the easiest problems without stepping off. A light pump, never above 3/10.',
    dose: '3 x 10-15 min, 5 min rest', answers: ['pump'], phases: ['BASE'],
  },
  {
    id: 'up-down-up', kind: 'STAMINA', name: 'Up, down, up',
    how: 'Climb a problem, climb it down, climb it again without stepping off. Pick ones you flash.',
    dose: '4 problems, 2 rounds', answers: ['pump', 'feet'], phases: ['BASE', 'STRENGTH'],
  },
  {
    id: 'route-laps', kind: 'STAMINA', name: 'Route laps',
    how: 'Two routes two grades under your redpoint, back to back, lowered off and straight back up. Rest ten minutes.',
    dose: '2-3 rounds', answers: ['pump'], rope: true,
  },
];

export function drillById(id: string): WallDrill | undefined {
  return WALL_DRILLS.find(d => d.id === id);
}

/** Footwork first while there are not enough tags to say more: the athlete's own read. */
const FEET_ROTATION = ['silent-feet', 'hover-feet', 'sticky-feet', 'toes-on', 'hooks', 'flag-it'];
const HEAD_ROTATION = ['try-hard', 'fall-practice', 'commit-move', 'flash-goes', 'top-out'];

/** Days without a stamina drill before one is due. */
export const STAMINA_EVERY_DAYS = 7;

export interface FocusPick {
  drill: WallDrill;
  /** Why this one, in a short sentence. */
  why: string;
}

export interface WallFocus {
  technique: FocusPick;
  head: FocusPick;
  stamina: FocusPick | null;
  /** While a finger heals: which grips are fine, which are not recommended yet. */
  finger: string | null;
}

export interface WallInput {
  climbLog: ClimbSession[];
  phase?: SeasonPhase;
  /** A sport goal is being worked on: rope drills may come up. */
  rope?: boolean;
  healing?: boolean;
  /** The left ring finger as a % of the right, when tested. */
  ringPct?: number | null;
  now?: string;
}

/** The ids done in the most recent climbing sessions, newest first. */
function recentFocus(log: ClimbSession[]): string[] {
  return [...log].sort((a, b) => b.date.localeCompare(a.date)).flatMap(s => s.focusDone ?? []);
}

/** Score a drill against the limiters: higher answers more of what fails. */
function score(d: WallDrill, l: Limiters): number {
  let s = 0;
  l.weakest.forEach((w, i) => { if (d.answers.includes(w.tag)) s += 3 - i; });
  l.reasons.slice(0, 3).forEach((r, i) => { if (d.answers.includes(r.reason)) s += 3 - i; });
  return s;
}

function pickFrom(pool: WallDrill[], rotation: string[], l: Limiters, done: string[], useTags: boolean): { drill: WallDrill; matched: boolean } {
  const last = done[0];
  if (useTags) {
    const ranked = pool
      .map(d => ({ d, s: score(d, l) }))
      .filter(x => x.s > 0)
      // Not the same drill twice running when another answers as well.
      .sort((a, b) => b.s - a.s || Number(a.d.id === last) - Number(b.d.id === last));
    const best = ranked.find(x => x.d.id !== last) ?? ranked[0];
    if (best) return { drill: best.d, matched: true };
  }
  // The next in the rotation after the last one done.
  const lastIdx = rotation.findIndex(id => id === done.find(x => rotation.includes(x)));
  const id = rotation[(lastIdx + 1) % rotation.length];
  return { drill: pool.find(d => d.id === id) ?? pool[0], matched: false };
}

export function wallFocus(input: WallInput): WallFocus {
  const now = input.now ?? localDate();
  const l = getLimiters(input.climbLog, now);
  const done = recentFocus(input.climbLog);
  const allowed = (d: WallDrill) => !d.rope || input.rope;

  const tech = pickFrom(WALL_DRILLS.filter(d => d.kind === 'TECHNIQUE'), FEET_ROTATION, l, done, l.enough);
  const technique: FocusPick = {
    drill: tech.drill,
    why: tech.matched && l.weakest[0]
      ? `You fall most on ${l.weakest[0].label.toLowerCase()}.`
      : 'Feet first: your own read of what holds you back.',
  };

  // The head: try-hard leads while fewer than half the sessions had a 110% go.
  const tryHardShare = l.sessions ? l.tryHardSessions / l.sessions : 0;
  const headPool = WALL_DRILLS.filter(d => d.kind === 'HEAD' && allowed(d));
  let head: FocusPick;
  if (done[0] !== 'try-hard' && tryHardShare < 0.5) {
    head = {
      drill: drillById('try-hard')!,
      why: l.sessions ? `A 110% go in ${l.tryHardSessions} of ${l.sessions} sessions. Build the habit.` : 'One fully committed go, every session.',
    };
  } else {
    const h = pickFrom(headPool, HEAD_ROTATION, l, done, l.headFalls > 0);
    head = { drill: h.drill, why: h.matched ? `${l.headFalls} of ${l.falls} falls were the head.` : 'Courage is trained like strength: a little each time.' };
  }

  // Stamina: due after a week without, when pump leads the falls, or every session in BASE.
  const lastStamina = [...input.climbLog]
    .filter(s => (s.focusDone ?? []).some(id => drillById(id)?.kind === 'STAMINA'))
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null;
  const pumpLeads = l.reasons[0]?.reason === 'pump';
  const due = input.phase === 'BASE' || pumpLeads || !lastStamina || daysBetween(lastStamina, now) >= STAMINA_EVERY_DAYS;
  let stamina: FocusPick | null = null;
  if (due && input.phase !== 'PEAK') {
    const pool = WALL_DRILLS.filter(d => d.kind === 'STAMINA' && allowed(d));
    const fits = pool.filter(d => !d.phases || !input.phase || d.phases.includes(input.phase));
    const choice = (fits.length ? fits : pool).find(d => d.id !== done.find(x => drillById(x)?.kind === 'STAMINA')) ?? pool[0];
    stamina = {
      drill: choice,
      why: pumpLeads ? 'Pump leads your falls.'
        : input.phase === 'BASE' ? 'Base phase: stamina every session.'
        : lastStamina ? `Last stamina work ${daysBetween(lastStamina, now)} days ago.` : 'Stamina once a week, on boulders.',
    };
  }

  return { technique, head, stamina, finger: input.healing ? fingerLine(input.ringPct ?? null) : null };
}

/**
 * Which grips while the ring finger heals. Open hand and slopers spread the
 * load over the hand; crimps and pockets put it through one pulley. The order
 * grips come back in follows the usual return to climbing after a pulley or
 * lumbrical injury: open hand, then half crimp, pockets last.
 */
export function fingerLine(ringPct: number | null): string {
  const along = ringPct === null ? '' : ` Left ring at ${ringPct}% of the right; ${RING_GOAL_PCT}% clears it.`;
  if (ringPct !== null && ringPct >= RING_GOAL_PCT) return `Ring finger cleared.${along} Pockets last, and gently.`;
  if (ringPct !== null && ringPct >= 60) {
    return `Open hand, slopers and pinches: fine. Half crimps: easy ones only. Full crimps and pockets: not recommended yet.${along}`;
  }
  return `Open hand, slopers, pinches and jugs: fine. Crimps and pockets: not recommended yet.${along}`;
}

/** The drills of a focus, in order. */
export function focusDrills(f: WallFocus): FocusPick[] {
  return [f.technique, f.head, ...(f.stamina ? [f.stamina] : [])];
}
