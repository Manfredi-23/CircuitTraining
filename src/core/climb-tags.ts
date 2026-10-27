// =============================================================================
// climb-tags.ts — What a climb was like, and why it did not go
//
// Two taps on a logged climb: its style (wall angle, holds, moves) and, on a
// project or a hard send, why it fell. Read over weeks by `limiters.ts`, they
// name the styles the athlete fails on, which is what the wall focus trains.
// The athlete's own read was technique and feet first, then the head: so the
// reasons include FEET, BETA and BACKED OFF beside the physical ones.
// =============================================================================

export type TagGroup = 'ANGLE' | 'HOLDS' | 'MOVES';

export interface ClimbTag {
  id: string;
  label: string;
  group: TagGroup;
}

export const CLIMB_TAGS: ClimbTag[] = [
  { id: 'slab', label: 'SLAB', group: 'ANGLE' },
  { id: 'vertical', label: 'VERTICAL', group: 'ANGLE' },
  { id: 'overhang', label: 'OVERHANG', group: 'ANGLE' },
  { id: 'roof', label: 'ROOF', group: 'ANGLE' },
  { id: 'crimp', label: 'CRIMPS', group: 'HOLDS' },
  { id: 'pinch', label: 'PINCHES', group: 'HOLDS' },
  { id: 'sloper', label: 'SLOPERS', group: 'HOLDS' },
  { id: 'pocket', label: 'POCKETS', group: 'HOLDS' },
  { id: 'volume', label: 'VOLUMES', group: 'HOLDS' },
  { id: 'dyno', label: 'DYNO', group: 'MOVES' },
  { id: 'deadpoint', label: 'DEADPOINT', group: 'MOVES' },
  { id: 'heel', label: 'HEEL HOOK', group: 'MOVES' },
  { id: 'toe', label: 'TOE HOOK', group: 'MOVES' },
  { id: 'compression', label: 'COMPRESSION', group: 'MOVES' },
  { id: 'mantle', label: 'MANTLE', group: 'MOVES' },
  { id: 'rockover', label: 'ROCK-OVER', group: 'MOVES' },
  { id: 'smear', label: 'SMEARS', group: 'MOVES' },
  { id: 'coordination', label: 'COORDINATION', group: 'MOVES' },
];

export const TAG_GROUPS: TagGroup[] = ['ANGLE', 'HOLDS', 'MOVES'];

/** The angle is one of four; holds and moves can be several. */
export const SINGLE_GROUPS: TagGroup[] = ['ANGLE'];

export interface FallReason {
  id: string;
  label: string;
  /** What kind of limiter it is: the wall focus picks its drill from this. */
  kind: 'physical' | 'technique' | 'head' | 'stamina';
}

export const FALL_REASONS: FallReason[] = [
  { id: 'power', label: 'POWER', kind: 'physical' },
  { id: 'fingers', label: 'FINGERS', kind: 'physical' },
  { id: 'tension', label: 'FEET CUT', kind: 'physical' },
  { id: 'reach', label: 'REACH', kind: 'physical' },
  { id: 'feet', label: 'FOOT SLIPPED', kind: 'technique' },
  { id: 'beta', label: 'NO BETA', kind: 'technique' },
  { id: 'backed-off', label: 'BACKED OFF', kind: 'head' },
  { id: 'scared', label: 'SCARED', kind: 'head' },
  { id: 'pump', label: 'PUMPED', kind: 'stamina' },
];

export function tagById(id: string): ClimbTag | undefined {
  return CLIMB_TAGS.find(t => t.id === id);
}

export function reasonById(id: string): FallReason | undefined {
  return FALL_REASONS.find(r => r.id === id);
}

/** A send that took this many goes or more asks why, like a project. */
export const HARD_SEND_GOES = 3;

export function asksWhy(c: { sent: boolean; attempts: number }): boolean {
  return !c.sent || c.attempts >= HARD_SEND_GOES;
}

/** Toggle a tag, keeping one angle at most. */
export function toggleTag(tags: string[] | undefined, id: string): string[] {
  const cur = tags ?? [];
  if (cur.includes(id)) return cur.filter(t => t !== id);
  const group = tagById(id)?.group;
  const kept = group && SINGLE_GROUPS.includes(group) ? cur.filter(t => tagById(t)?.group !== group) : cur;
  return [...kept, id];
}

/** "OVERHANG, PINCHES" for a row. */
export function describeTags(tags: string[] | undefined, why?: string[]): string {
  const parts = (tags ?? []).map(t => tagById(t)?.label).filter(Boolean) as string[];
  const w = (why ?? []).map(r => reasonById(r)?.label).filter(Boolean) as string[];
  return [parts.join(', '), w.length ? `fell: ${w.join(', ')}` : ''].filter(Boolean).join(' · ');
}
