import { describe, it, expect } from 'vitest';
import { asksWhy, describeTags, toggleTag } from '../climb-tags';
import { getLimiters, limiterHeadline } from '../limiters';
import type { ClimbEntry, ClimbSession } from '../types';

const NOW = '2026-10-27';
const c = (sent: boolean, tags: string[], why?: string[], attempts = 2): ClimbEntry => ({ grade: 'RED', attempts, sent, tags, why });
const session = (date: string, climbs: ClimbEntry[], extra: Partial<ClimbSession> = {}): ClimbSession =>
  ({ id: date, date, venue: 'GYM', discipline: 'BOULDER', climbs, ...extra });

describe('climb tags', () => {
  it('keeps one angle, many holds and moves', () => {
    let t = toggleTag(undefined, 'slab');
    t = toggleTag(t, 'overhang');
    expect(t).toEqual(['overhang']);
    t = toggleTag(toggleTag(t, 'pinch'), 'heel');
    expect(t).toEqual(['overhang', 'pinch', 'heel']);
    expect(toggleTag(t, 'pinch')).toEqual(['overhang', 'heel']);
  });

  it('asks why on a project and on a send of three goes or more', () => {
    expect(asksWhy({ sent: false, attempts: 1 })).toBe(true);
    expect(asksWhy({ sent: true, attempts: 2 })).toBe(false);
    expect(asksWhy({ sent: true, attempts: 3 })).toBe(true);
  });

  it('describes a climb in words', () => {
    expect(describeTags(['overhang', 'pinch'], ['backed-off'])).toBe('OVERHANG, PINCHES · fell: BACKED OFF');
    expect(describeTags(undefined)).toBe('');
  });
});

describe('the limiters', () => {
  const log = [
    session('2026-10-20', [
      c(false, ['overhang', 'pinch'], ['power']), c(false, ['overhang', 'pinch'], ['backed-off']),
      c(false, ['overhang', 'compression'], ['backed-off']), c(true, ['overhang', 'pinch']),
      c(true, ['slab', 'smear']), c(true, ['slab', 'smear']),
    ], { tryHard: true }),
    session('2026-10-22', [
      c(true, ['vertical', 'crimp']), c(true, ['vertical', 'crimp']), c(true, ['slab', 'smear']),
      c(false, ['overhang', 'pinch'], ['feet']), c(true, ['slab', 'smear']), c(true, ['vertical', 'crimp']),
    ]),
    // Outside the window: ignored.
    session('2026-06-01', [c(false, ['slab'], ['scared'])]),
  ];

  it('names the styles sent less often than the athlete\'s own average', () => {
    const l = getLimiters(log, NOW);
    expect(l.tagged).toBe(12);
    expect(l.enough).toBe(true);
    expect(l.weakest[0].tag).toBe('overhang');
    expect(l.weakest.map(s => s.tag)).toContain('pinch');
    expect(l.strongest.map(s => s.tag)).toEqual(expect.arrayContaining(['slab', 'smear']));
    expect(l.reasons[0]).toMatchObject({ reason: 'backed-off', count: 2, kind: 'head' });
    expect(l.headFalls).toBe(2);
    expect(l.falls).toBe(4);
    expect(l.tryHardSessions).toBe(1);
    expect(l.sessions).toBe(2);
    expect(limiterHeadline(l)).toMatch(/^Overhang is where you fall: \d+% sent against \d+% overall\. Most falls: backed off\.$/);
  });

  it('waits for enough tagged climbs before naming a style', () => {
    const l = getLimiters([session('2026-10-20', [c(false, ['roof']), c(false, ['roof']), c(false, ['roof']), c(false, ['roof'])])], NOW);
    expect(l.enough).toBe(false);
    expect(l.weakest).toEqual([]);
    expect(limiterHeadline(l)).toBe('Tag 4 more climbs with their style to see where you fall.');
    expect(limiterHeadline(getLimiters([], NOW))).toBe('Log climbs to see where you fall.');
  });
});
