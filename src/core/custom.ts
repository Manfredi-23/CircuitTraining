// =============================================================================
// custom.ts — A session built on the spot
//
// BUILD on the home screen makes a session from a few choices:
//
// - WHERE: HOME (mat, band, portable edge) or CAVE (the gym, home kit too,
//   plus dumbbells and rings or TRX).
// - TIME: 15 / 30 / 45 / 60 / 90 minutes; the session is filled up to it,
//   whole exercises at a time.
// - TARGETS, each tapped in, out or off:
//   - GOALS: PULL POWER, PUSH POWER, CHEST, BALANCE. Each is an ordered list
//     of exercises, the key lift first.
//   - AREAS: core, pull, arms, shoulders, legs, mobility, fingers, from the
//     reserve (reserve.ts), least recently done first.
//   A target tapped out takes every exercise that touches it out of the
//   session, wherever it came from: NO CORE also drops a plank picked for the
//   shoulders.
// - AVOID: NO JUMPING, NO GRIP, NO FLOOR.
// - SUGGEST: the areas trained least lately, from how long each capacity has
//   gone untrained against the days before it starts to fade, and this week's
//   hard core sets against their targets.
// - PRESETS: a saved set of these choices, four built in.
//
// The same rules hold as anywhere else: only the kit the place has, nothing
// gripped and no finger work or pulling while a finger heals, no finger work
// after a pain score of 3+, and a sore area on the TODAY sheet is closed. The
// one-arm rungs in PULL POWER keep their gates. Targets take turns, so two
// get an even share. The gym opens with the pulse raiser, home with cat-cow.
// Heavy blocks go first and curls close the session, as in a DAILY: discs are
// most swollen in the first hour after waking, and a custom session may be a
// morning one.
//
// Rest and sets are never touched to make it fit: an exercise that would run
// over is left out and the next one tried, and there is about one working
// exercise per four minutes at most. Pure functions, no React.
// =============================================================================

import { CONFIG } from './config';
import { WARMUP_PULSE } from './data-cave';
import { buildList, estimateDuration, loadsFingers, PAIN_REDUCE_FROM } from './engine';
import { getCoreVolume, getFreshness, CORE_TARGETS, type CoreGroup } from './insights';
import { exerciseLibrary, isCurl, reserveEntry, reserveFor, type EntryFlags, type Place, type ReserveGroup } from './reserve';
import { localDate, mondayOf, daysBetween } from './dates';
import { needsKit, type ActiveDay } from './today';
import type {
  BlockType, Capacity, Circuit, EnergyKey, Exercise, Mode, Progress, ScaledExercise, SessionLogEntry, Tweaks, BenchmarkResult,
} from './types';

export const CUSTOM_GROUPS: ReserveGroup[] = ['CORE', 'PULL', 'ARMS', 'SHOULDERS', 'LEGS', 'MOBILITY', 'FINGERS'];
export const CUSTOM_TIMES = [15, 30, 45, 60, 90];
export const CUSTOM_PREFIX = 'custom-';

export type Goal = 'PULL POWER' | 'PUSH POWER' | 'CHEST' | 'BALANCE';
export const GOALS: Goal[] = ['PULL POWER', 'PUSH POWER', 'CHEST', 'BALANCE'];
export type Target = ReserveGroup | Goal;
export const isGoal = (t: Target): t is Goal => (GOALS as string[]).includes(t);

export type Avoid = 'JUMPING' | 'GRIP' | 'FLOOR';
export const AVOIDS: Avoid[] = ['JUMPING', 'GRIP', 'FLOOR'];

interface GoalEntry extends EntryFlags {
  id: string;
}

/**
 * Each goal's exercises in priority order: the key lift first, then what
 * supports it. HOME entries run anywhere; GYM ones only at the gym.
 */
const GOAL_ENTRIES: Record<Goal, GoalEntry[]> = {
  // The fresh, level-scaled weighted pull-up, then the one-arm path with its
  // gates (assisted rungs substitute the lopsided ladder until a tested pull-up
  // opens them; negatives stay hidden), then the lock-offs.
  'PULL POWER': [
    { id: 'cave-weighted-pullup', place: 'GYM', grip: true },
    { id: 'cave01-oap-assisted', place: 'GYM', grip: true },
    { id: 'cave01-oap-negative', place: 'GYM', grip: true },
    { id: 'cave-lockoff', place: 'GYM', grip: true },
  ],
  'PUSH POWER': [
    { id: 'extra-plyo-pushup', place: 'HOME', grip: false, floor: true, jump: true },
    { id: 'extra-ring-dip', place: 'GYM', grip: true },
    { id: 'heal-weighted-pushup', place: 'GYM', grip: false, floor: true },
    { id: 'heal-pike-pushup', place: 'HOME', grip: false, floor: true },
  ],
  CHEST: [
    { id: 'extra-db-floor-press', place: 'GYM', grip: true, floor: true },
    { id: 'extra-ring-pushup', place: 'GYM', grip: true, floor: true },
    { id: 'extra-feet-up-pushup', place: 'HOME', grip: false, floor: true },
    { id: 'extra-ring-fly', place: 'GYM', grip: true },
    { id: 'extra-diamond-pushup', place: 'HOME', grip: false, floor: true },
  ],
  // Balance at home on the floor; the footwork drills need the gym's walls.
  BALANCE: [
    { id: 'extra-sl-balance', place: 'HOME', grip: false },
    { id: 'extra-sl-reach', place: 'HOME', grip: false },
    { id: 'heal-stork', place: 'GYM', grip: false },
    { id: 'heal-silent-feet', place: 'GYM', grip: false },
    { id: 'heal-sticky-feet', place: 'GYM', grip: false },
  ],
};

/** The two weighted pull-ups are one movement: never both in a session. */
const SAME_MOVEMENT: string[][] = [['cave-weighted-pullup', 'addon-weighted-pullup']];

/** The capacities each area trains. ARMS are extras with none, so never suggested. */
const GROUP_CAPACITIES: Record<ReserveGroup, Capacity[]> = {
  CORE: ['tension'],
  PULL: ['pull'],
  ARMS: [],
  SHOULDERS: ['press', 'shoulder'],
  LEGS: ['legs'],
  MOBILITY: ['mobility'],
  FINGERS: ['forearm'],
};

const ILLUSTRATION: Record<Target, string> = {
  CORE: 'core.svg', PULL: 'pullups.svg', ARMS: 'dumbbell.svg', SHOULDERS: 'pushups.svg',
  LEGS: 'squats.svg', MOBILITY: 'morning.svg', FINGERS: 'hangboard.svg',
  'PULL POWER': 'pullups.svg', 'PUSH POWER': 'pushups.svg', CHEST: 'pushups.svg', BALANCE: 'squats.svg',
};

/** The session's mode in the log: home sessions count as DAILY, gym ones as CAVE. */
export const customMode = (place: Place): Mode => (place === 'HOME' ? 'DAILY' : 'CAVE');

export const isCustom = (circuitId: string) => circuitId.startsWith(CUSTOM_PREFIX);

/** Where an exercise can run and what it asks, from the reserve or a goal list. */
export function flagsOf(id: string): Partial<EntryFlags> {
  return reserveEntry(id) ?? GOALS.flatMap(g => GOAL_ENTRIES[g]).find(e => e.id === id) ?? {};
}

const TRUNK_PROTOCOLS = new Set(['trunk-hypertrophy', 'back-strength', 'daily-trunk', 'dynamic-core', 'tension-iso']);

/** Whether an exercise touches a target, so tapping the target out removes it. */
export function touches(t: Target, ex: Exercise): boolean {
  if (reserveEntry(ex.id)?.group === t) return true;
  if (isGoal(t) && GOAL_ENTRIES[t].some(g => g.id === ex.id)) return true;
  switch (t) {
    case 'CORE': return TRUNK_PROTOCOLS.has(ex.protocolId ?? '');
    case 'LEGS': return ex.capacities[0] === 'legs';
    case 'PULL': case 'PULL POWER': return ex.capacities.includes('pull');
    case 'SHOULDERS': return ['press', 'shoulder'].includes(ex.capacities[0] ?? '');
    case 'PUSH POWER': return ex.capacities[0] === 'press';
    case 'MOBILITY': return ex.block === 'MOBILITY';
    case 'FINGERS': return loadsFingers(ex);
    default: return false;
  }
}

/** Whether an exercise is ruled out by an AVOID chip. */
export function avoided(ex: Exercise, avoid: Avoid[]): boolean {
  const f = flagsOf(ex.id);
  return (avoid.includes('JUMPING') && Boolean(f.jump))
    || (avoid.includes('GRIP') && Boolean(f.grip))
    || (avoid.includes('FLOOR') && Boolean(f.floor));
}

// ---- Which targets are open ------------------------------------------------------

export interface CustomContext {
  place: Place;
  sessionLog: SessionLogEntry[];
  /** A finger is healing (recommend.isHealing). */
  healing: boolean;
  /** The latest pain score of the last two days, or null. */
  pain: number | null;
  day: ActiveDay;
  /** Legs sore from a long descent in the activity log. */
  legsSore?: boolean;
}

/** Targets that cannot be picked here today, with the reason. */
export function closedAreas(ctx: CustomContext): Partial<Record<Target, string>> {
  const out: Partial<Record<Target, string>> = {};
  const home = ctx.place === 'HOME' || ctx.day.noKit;
  if (home) { out.PULL = 'No bar at home.'; out['PULL POWER'] = 'No bar at home.'; }
  if (ctx.healing) {
    out.FINGERS = 'Not while a finger heals.';
    out['PULL POWER'] ??= 'No pulling while a finger heals.';
  } else if (ctx.pain !== null && ctx.pain >= PAIN_REDUCE_FROM) out.FINGERS = `Finger pain ${ctx.pain}/10 lately.`;
  else if (ctx.day.sore.includes('FOREARMS')) out.FINGERS = 'Forearms sore today.';
  if (ctx.day.sore.includes('LEGS') || ctx.legsSore) out.LEGS = 'Legs sore today.';
  if (ctx.day.sore.includes('SHOULDERS')) {
    for (const t of ['SHOULDERS', 'PULL', 'PULL POWER', 'PUSH POWER', 'CHEST'] as Target[]) out[t] ??= 'Shoulders sore today.';
  }
  return out;
}

// ---- Suggestion ------------------------------------------------------------------

export interface AreaNeed {
  group: ReserveGroup;
  /** 1 or more: due. Higher is more overdue. */
  score: number;
  /** Why, in a few words, e.g. "legs 16 days, fades after 21". */
  reason: string;
}

const CORE_LABEL: Record<CoreGroup, string> = { abs: 'abs', obliques: 'obliques', back: 'lower back' };

/**
 * How much each open area is owed, most first. A capacity is due as it nears
 * the days before it starts to fade; never trained counts as due. Core also
 * counts this week's hard sets against the targets, pro rata to the day of
 * the week, so Monday is not always behind.
 */
export function areaNeeds(progress: Progress, sessionLog: SessionLogEntry[], closed: Partial<Record<Target, string>> = {}, now = new Date()): AreaNeed[] {
  const fresh = new Map(getFreshness(progress, now).map(r => [r.capacity, r]));
  const out: AreaNeed[] = [];
  for (const group of CUSTOM_GROUPS) {
    const caps = GROUP_CAPACITIES[group];
    if (closed[group] || !caps.length) continue;
    let score = 0;
    let reason = '';
    for (const c of caps) {
      const r = fresh.get(c)!;
      const s = r.days === null ? 1 : r.days / r.graceDays;
      if (s > score || !reason) {
        score = s;
        const label = CONFIG.capacityLabels[c].toLowerCase();
        reason = r.days === null ? `${label} never trained` : `${label} ${r.days} day${r.days === 1 ? '' : 's'}, fades after ${r.graceDays}`;
      }
    }
    if (group === 'CORE') {
      const today = localDate(now);
      const share = (daysBetween(mondayOf(today), today) + 1) / 7;
      const volume = getCoreVolume(sessionLog, now);
      for (const g of Object.keys(CORE_TARGETS) as CoreGroup[]) {
        const expected = CORE_TARGETS[g] * share;
        const behind = expected > 0 ? 1 - volume[g] / expected : 0;
        // Half the week's pro rata sets or fewer is as due as a fading capacity.
        const s = behind * 2;
        if (s > score) {
          score = s;
          reason = `${CORE_LABEL[g]} ${volume[g]} of ${CORE_TARGETS[g]} sets this week`;
        }
      }
    }
    out.push({ group, score: Math.round(score * 100) / 100, reason });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** The areas to suggest: everything due (score 0.7 or more), at most three; else the two most owed. */
export function suggestAreas(needs: AreaNeed[]): ReserveGroup[] {
  const due = needs.filter(n => n.score >= 0.7).slice(0, 3);
  return (due.length ? due : needs.slice(0, 2)).map(n => n.group);
}

// ---- Building --------------------------------------------------------------------

export interface CustomInput extends CustomContext {
  minutes: number;
  /** Targets tapped in: they take turns giving exercises. */
  include: Target[];
  /** Targets tapped out: nothing that touches them goes in. */
  exclude?: Target[];
  avoid?: Avoid[];
  energy: EnergyKey;
  progress: Progress;
  benchmarkResults: BenchmarkResult[];
  tweaks: Tweaks;
  deload?: boolean;
  /** Shown as the session title, e.g. a preset's name. */
  title?: string;
}

export interface CustomSession {
  circuit: Circuit;
  list: ScaledExercise[];
  duration: number;
}

const BLOCK_RANK: Record<BlockType, number> = {
  WARMUP: 0, PRIMARY: 1, TEST: 1, SECONDARY: 2, ACCESSORY: 3, PREHAB: 4, MOBILITY: 5,
};

/** Openers first, then heavy to light, then curls. Stable within a block. */
function order(openers: Exercise[], picks: Exercise[]): Exercise[] {
  const rest = picks
    .map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const ca = isCurl(a.e.id) ? 1 : 0;
      const cb = isCurl(b.e.id) ? 1 : 0;
      return ca - cb || BLOCK_RANK[a.e.block] - BLOCK_RANK[b.e.block] || a.i - b.i;
    })
    .map(x => x.e);
  return [...openers, ...rest];
}

const label = (targets: Target[]) => targets.map(t => t.toLowerCase()).join(' - ');

function circuitOf(input: CustomInput, include: Target[], exercises: Exercise[], duration: number): Circuit {
  const lib = exerciseLibrary();
  const caps = Array.from(new Set(exercises.filter(e => e.block !== 'WARMUP').flatMap(e => e.capacities)));
  const where = input.place === 'HOME' ? 'home' : 'cave';
  const substitutes = exercises
    .map(e => (e.gate?.substituteId ? lib.get(e.gate.substituteId) : undefined))
    .filter((e): e is Exercise => Boolean(e));
  const out = (input.exclude ?? []).map(t => `no ${t.toLowerCase()}`);
  return {
    id: `${CUSTOM_PREFIX}${where}`,
    circuitNum: 'C',
    title: input.title ?? 'CUSTOM',
    subtitle: [where, label(include), ...out].filter(Boolean).join(' - '),
    focus: `Built for ${input.minutes} minutes: ${include.map(g => g.toLowerCase()).join(', ')}.`,
    capacities: caps,
    illustration: ILLUSTRATION[include[0] ?? 'CORE'],
    duration,
    // Home is a DAILY: repeatable, no deload. The gym one follows the block
    // and, like CAVE 02 and 03, may stack straight on a bouldering session.
    recoveryHours: input.place === 'HOME' ? 0 : 24,
    stacksOnSession: input.place === 'GYM' ? true : undefined,
    exercises,
    ...(substitutes.length ? { substitutes } : {}),
  };
}

/**
 * The session for these choices. Targets take turns, each giving its next
 * exercise; one that would take the session over the time is passed over for
 * the next. At least one working exercise always goes in.
 */
export function buildCustom(input: CustomInput): CustomSession {
  const lib = exerciseLibrary();
  const closed = closedAreas(input);
  const exclude = input.exclude ?? [];
  const avoid = input.avoid ?? [];
  const include = input.include.filter(t => !closed[t] && !exclude.includes(t));
  const place: Place = input.day.noKit ? 'HOME' : input.place;
  const reserve = reserveFor({
    mode: customMode(place), circuitId: `${CUSTOM_PREFIX}build`, list: [], pain: input.pain, sessionLog: input.sessionLog,
    noKit: input.day.noKit, place, healing: input.healing,
  });

  // The gym warm-up hangs from a bar; while a finger heals or with NO GRIP the
  // HEAL warm-up stands in. Home opens with cat-cow, a floor drill.
  const gymOpener = input.healing || avoid.includes('GRIP') ? lib.get('heal-warmup') : (WARMUP_PULSE as Exercise);
  const homeOpener = avoid.includes('FLOOR') || exclude.includes('MOBILITY') ? undefined : lib.get('morn-catcow');
  const opener = place === 'GYM' ? gymOpener : homeOpener;
  const openers = opener ? [opener] : [];

  const allowed = (e: Exercise) => !openers.some(o => o.id === e.id)
    && !exclude.some(t => touches(t, e))
    && !avoided(e, avoid);

  // At the gym, what only the gym has goes first among the equally stale:
  // the bodyweight squat can wait for a morning at home.
  const gymFirst = (p: Place) => (place === 'GYM' && p === 'HOME' ? 1 : 0);
  const queueFor = (t: Target): Exercise[] => {
    if (isGoal(t)) {
      return GOAL_ENTRIES[t]
        .filter(g => place === 'GYM' || g.place === 'HOME')
        .filter(g => !(input.healing && g.grip))
        .map(g => lib.get(g.id))
        .filter((e): e is Exercise => Boolean(e) && !(input.day.noKit && needsKit(e!)) && !(input.healing && loadsFingers(e!)));
    }
    return [...reserve[t]]
      .sort((a, b) => (a.lastDone ?? '').localeCompare(b.lastDone ?? '') || gymFirst(a.place) - gymFirst(b.place))
      .map(i => i.exercise);
  };
  const queues = include.map(t => queueFor(t).filter(allowed));

  // Fewer exercises done properly beat a long tail of two-set ones: about one
  // working exercise per four minutes. Short mobility and prehab drills do not count.
  const most = Math.max(3, Math.min(14, Math.round(input.minutes / 4)));
  const LIGHT = new Set<BlockType>(['MOBILITY', 'PREHAB']);
  const picks: Exercise[] = [];
  const full = () => picks.filter(e => !LIGHT.has(e.block)).length >= most || picks.length >= 18;
  const sameAsPicked = (e: Exercise) => picks.some(p => p.id === e.id)
    || SAME_MOVEMENT.some(group => group.includes(e.id) && picks.some(p => group.includes(p.id)));
  const build = (list: Exercise[]) => {
    const circuit = circuitOf(input, include, order(openers, list), 0);
    return buildList(circuit, input.energy, input.progress, input.benchmarkResults, { deload: input.deload, tweaks: input.tweaks });
  };

  let added = true;
  while (added && !full()) {
    added = false;
    for (const q of queues) {
      while (q.length && !full()) {
        const next = q.shift()!;
        if (sameAsPicked(next)) continue;
        const trial = build([...picks, next]);
        // A closed gate with no substitute hides the exercise: nothing to add.
        const shown = next.gate?.substituteId ?? next.id;
        if (!trial.some(e => e.id === next.id || e.id === shown)) continue;
        // The first working exercise always goes in, so a short cap still gives a session.
        if (picks.length > 0 && estimateDuration(trial) > input.minutes) continue;
        picks.push(next);
        added = true;
        break;
      }
    }
  }

  const exercises = order(openers, picks);
  const list = build(picks);
  const duration = estimateDuration(list);
  return { circuit: circuitOf(input, include, exercises, duration), list, duration };
}

// ---- Choices, presets, warnings -------------------------------------------------

export interface BuildChoice {
  place: Place;
  minutes: number;
  include: Target[];
  exclude: Target[];
  avoid: Avoid[];
}

export interface BuildPreset extends BuildChoice {
  id: string;
  name: string;
}

export const BUILT_IN_PRESETS: BuildPreset[] = [
  { id: 'pull-day', name: 'PULL DAY', place: 'GYM', minutes: 60, include: ['PULL POWER', 'SHOULDERS'], exclude: [], avoid: [] },
  { id: 'push-chest', name: 'PUSH + CHEST', place: 'GYM', minutes: 45, include: ['PUSH POWER', 'CHEST'], exclude: [], avoid: [] },
  { id: 'legs-balance', name: 'LEGS + BALANCE', place: 'GYM', minutes: 45, include: ['LEGS', 'BALANCE'], exclude: [], avoid: [] },
  { id: 'quick-home', name: 'QUICK HOME', place: 'HOME', minutes: 15, include: ['MOBILITY', 'SHOULDERS'], exclude: ['CORE'], avoid: [] },
];

export type TargetState = 'in' | 'out' | 'off';

export function targetState(choice: Pick<BuildChoice, 'include' | 'exclude'>, t: Target): TargetState {
  return choice.include.includes(t) ? 'in' : choice.exclude.includes(t) ? 'out' : 'off';
}

/** One tap on a target: off, then in, then out, then off again. */
export function cycleTarget(choice: Pick<BuildChoice, 'include' | 'exclude'>, t: Target): Pick<BuildChoice, 'include' | 'exclude'> {
  const include = choice.include.filter(x => x !== t);
  const exclude = choice.exclude.filter(x => x !== t);
  const state = targetState(choice, t);
  if (state === 'off') include.push(t);
  else if (state === 'in') exclude.push(t);
  return { include, exclude };
}

/** A short default name for a saved preset, e.g. "PULL POWER + SHOULDERS 60". The time is never cut. */
export function presetName(choice: BuildChoice): string {
  const what = choice.include.length ? choice.include.join(' + ') : 'CUSTOM';
  const time = ` ${choice.minutes}`;
  return `${what.slice(0, 32 - time.length).trim()}${time}`;
}

/** A new user preset from these choices. */
export function makePreset(choice: BuildChoice, name: string, now = Date.now()): BuildPreset {
  return { ...choice, include: [...choice.include], exclude: [...choice.exclude], avoid: [...choice.avoid], id: `user-${now}`, name: (name.trim() || presetName(choice)).toUpperCase().slice(0, 32) };
}

/** Lines worth saying before START: a due area left out, and power after a climb. */
export function buildWarnings(choice: BuildChoice, needs: AreaNeed[], climbedToday: boolean): string[] {
  const out: string[] = [];
  for (const n of needs) {
    if (n.score >= 0.7 && choice.exclude.includes(n.group)) out.push(`${n.group} is behind (${n.reason}). Left out today.`);
  }
  const power = choice.include.some(t => t === 'PULL POWER' || t === 'PUSH POWER');
  if (power && climbedToday && choice.minutes >= 60) {
    out.push('You climbed today: an hour or more of power on top is mostly fatigue. 30 minutes gets the strength.');
  }
  return out;
}
