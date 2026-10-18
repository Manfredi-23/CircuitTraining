// =============================================================================
// custom.ts — A session built on the spot
//
// BUILD on the home screen takes four choices and makes a session from them:
//
// - WHERE: HOME (mat, band, portable edge) or CAVE (the gym, home kit too).
// - TIME: the session is filled up to it, whole exercises at a time.
// - AREAS: core, pull, arms, shoulders, legs, mobility, fingers.
// - SUGGEST: the areas trained least lately, from how long each capacity has
//   gone untrained against the days before it starts to fade, and this week's
//   hard core sets against their targets.
//
// The exercises come from the reserve (reserve.ts), so the same rules hold as
// anywhere else: only the kit the place has, nothing gated, tested or warm-up,
// nothing gripped and no finger work while a finger heals or after a pain
// score of 3+, and a sore area on the TODAY sheet is not offered. Areas take
// turns, least recently done first, so two areas get an even share. The gym
// opens with the pulse raiser, home with cat-cow. Heavy blocks go first and
// curls close the session, as in a DAILY: discs are most swollen in the first
// hour after waking, and a custom session may be a morning one.
//
// Rest and sets are never touched to make it fit: an exercise that would run
// over is left out and the next one tried, and there is about one working
// exercise per four minutes at most. Pure functions, no React.
// =============================================================================

import { CONFIG } from './config';
import { WARMUP_PULSE } from './data-cave';
import { buildList, estimateDuration, PAIN_REDUCE_FROM } from './engine';
import { getCoreVolume, getFreshness, CORE_TARGETS, type CoreGroup } from './insights';
import { exerciseLibrary, isCurl, reserveFor, type Place, type ReserveGroup } from './reserve';
import { localDate, mondayOf, daysBetween } from './dates';
import type { ActiveDay } from './today';
import type {
  BlockType, Capacity, Circuit, EnergyKey, Exercise, Mode, Progress, ScaledExercise, SessionLogEntry, Tweaks, BenchmarkResult,
} from './types';

export const CUSTOM_GROUPS: ReserveGroup[] = ['CORE', 'PULL', 'ARMS', 'SHOULDERS', 'LEGS', 'MOBILITY', 'FINGERS'];
export const CUSTOM_TIMES = [10, 15, 20, 30, 45, 60];
export const CUSTOM_PREFIX = 'custom-';

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

const ILLUSTRATION: Record<ReserveGroup, string> = {
  CORE: 'core.svg', PULL: 'pullups.svg', ARMS: 'dumbbell.svg', SHOULDERS: 'pushups.svg',
  LEGS: 'squats.svg', MOBILITY: 'morning.svg', FINGERS: 'hangboard.svg',
};

/** The session's mode in the log: home sessions count as DAILY, gym ones as CAVE. */
export const customMode = (place: Place): Mode => (place === 'HOME' ? 'DAILY' : 'CAVE');

export const isCustom = (circuitId: string) => circuitId.startsWith(CUSTOM_PREFIX);

// ---- Which areas are open --------------------------------------------------------

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

/** Areas that cannot be picked here today, with the reason. */
export function closedAreas(ctx: CustomContext): Partial<Record<ReserveGroup, string>> {
  const out: Partial<Record<ReserveGroup, string>> = {};
  if (ctx.place === 'HOME' || ctx.day.noKit) out.PULL = 'No bar at home.';
  if (ctx.healing) out.FINGERS = 'Not while a finger heals.';
  else if (ctx.pain !== null && ctx.pain >= PAIN_REDUCE_FROM) out.FINGERS = `Finger pain ${ctx.pain}/10 lately.`;
  else if (ctx.day.sore.includes('FOREARMS')) out.FINGERS = 'Forearms sore today.';
  if (ctx.day.sore.includes('LEGS') || ctx.legsSore) out.LEGS = 'Legs sore today.';
  if (ctx.day.sore.includes('SHOULDERS')) { out.SHOULDERS = 'Shoulders sore today.'; out.PULL ??= 'Shoulders sore today.'; }
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
export function areaNeeds(progress: Progress, sessionLog: SessionLogEntry[], closed: Partial<Record<ReserveGroup, string>> = {}, now = new Date()): AreaNeed[] {
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
  groups: ReserveGroup[];
  energy: EnergyKey;
  progress: Progress;
  benchmarkResults: BenchmarkResult[];
  tweaks: Tweaks;
  deload?: boolean;
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

function circuitOf(input: CustomInput, exercises: Exercise[], duration: number): Circuit {
  const caps = Array.from(new Set(exercises.filter(e => e.block !== 'WARMUP').flatMap(e => e.capacities)));
  const where = input.place === 'HOME' ? 'home' : 'cave';
  return {
    id: `${CUSTOM_PREFIX}${where}`,
    circuitNum: 'C',
    title: 'CUSTOM',
    subtitle: `${where} - ${input.groups.map(g => g.toLowerCase()).join(' - ')}`,
    focus: `Built for ${input.minutes} minutes: ${input.groups.map(g => g.toLowerCase()).join(', ')}.`,
    capacities: caps,
    illustration: ILLUSTRATION[input.groups[0] ?? 'CORE'],
    duration,
    // Home is a DAILY: repeatable, no deload. The gym one follows the block
    // and, like CAVE 02 and 03, may stack straight on a bouldering session.
    recoveryHours: input.place === 'HOME' ? 0 : 24,
    stacksOnSession: input.place === 'GYM' ? true : undefined,
    exercises,
  };
}

/**
 * The session for these choices. Areas take turns, each giving its least
 * recently done exercise; one that would take the session over the time is
 * passed over for the next. At least one working exercise always goes in.
 */
export function buildCustom(input: CustomInput): CustomSession {
  const lib = exerciseLibrary();
  const closed = closedAreas(input);
  const groups = input.groups.filter(g => !closed[g]);
  const mode = customMode(input.place);
  const reserve = reserveFor({
    mode, circuitId: `${CUSTOM_PREFIX}build`, list: [], pain: input.pain, sessionLog: input.sessionLog,
    noKit: input.day.noKit, place: input.place, healing: input.healing,
  });

  const openerId = input.place === 'GYM' && !input.day.noKit ? WARMUP_PULSE.id : 'morn-catcow';
  const opener = openerId === WARMUP_PULSE.id ? (WARMUP_PULSE as Exercise) : lib.get(openerId);
  const openers = opener ? [opener] : [];

  // At the gym, what only the gym has goes first among the equally stale:
  // the bodyweight squat can wait for a morning at home.
  const gymFirst = (p: Place) => (input.place === 'GYM' && p === 'HOME' ? 1 : 0);
  const queues = groups.map(g => [...reserve[g]]
    .sort((a, b) => (a.lastDone ?? '').localeCompare(b.lastDone ?? '') || gymFirst(a.place) - gymFirst(b.place))
    .map(i => i.exercise)
    .filter(e => !openers.some(o => o.id === e.id)));
  // Fewer exercises done properly beat a long tail of two-set ones: about one
  // working exercise per four minutes. Short mobility and prehab drills do not count.
  const most = Math.max(3, Math.min(10, Math.round(input.minutes / 4)));
  const LIGHT = new Set<BlockType>(['MOBILITY', 'PREHAB']);
  const full = () => picks.filter(e => !LIGHT.has(e.block)).length >= most || picks.length >= 14;
  const picks: Exercise[] = [];
  const build = (list: Exercise[]) => {
    const circuit = circuitOf(input, order(openers, list), 0);
    return buildList(circuit, input.energy, input.progress, input.benchmarkResults, { deload: input.deload, tweaks: input.tweaks });
  };

  let added = true;
  while (added && !full()) {
    added = false;
    for (const q of queues) {
      while (q.length && !full()) {
        const next = q.shift()!;
        const trial = build([...picks, next]);
        if (!trial.some(e => e.id === next.id)) continue;
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
  return { circuit: circuitOf(input, exercises, duration), list, duration };
}
