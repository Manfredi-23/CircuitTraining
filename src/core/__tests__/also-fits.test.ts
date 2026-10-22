import { describe, it, expect } from 'vitest';
import { alsoFits } from '../also-fits';
import { recommend } from '../recommend';
import { getBlockWeek } from '../block';
import { getModeData } from '../data-index';
import { asksPainCheck } from '../engine';
import { NO_DAY } from '../today';
import type { ClimbSession, SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026
const iso = (m: number, d: number, h = 8) => new Date(2026, m - 1, d, h).toISOString();
const session = (date: string, circuitId: string, mode: SessionLogEntry['mode'], extra: Partial<SessionLogEntry> = {}): SessionLogEntry =>
  ({ date, mode, circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 30, ...extra });
const climb = (date: string): ClimbSession => ({ id: date, date, venue: 'GYM', discipline: 'BOULDER', climbs: [] });
const base = { progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 120, date: iso(9, 20) }], block: getBlockWeek(null, [], NOW), now: NOW };

describe('alsoFits', () => {
  it('never repeats the recommendation and gives at most two', () => {
    const input = { ...base, sessionLog: [], climbLog: [] };
    const primary = recommend(input);
    const alts = alsoFits(input, primary);
    expect(alts.length).toBeLessThanOrEqual(2);
    expect(alts.map(a => a.circuitId)).not.toContain(primary?.circuitId);
  });

  it('offers nothing on a rest day', () => {
    const input = { ...base, sessionLog: [], climbLog: [], day: { ...NO_DAY, off: 'REST' as const } };
    expect(alsoFits(input, null)).toEqual([]);
  });

  it('offers the other after-bouldering session on a climbing day', () => {
    const input = { ...base, sessionLog: [], climbLog: [climb('2026-10-08')] };
    const primary = recommend(input);
    const ids = alsoFits(input, primary).map(a => a.circuitId);
    expect(primary?.circuitId).toBe('cave-05');
    expect(ids).toContain('cave-06');
  });

  it('keeps finger sessions off after pain 6+', () => {
    const input = { ...base, sessionLog: [session(iso(10, 7), 'daily-01', 'DAILY', { pain: 7 })], climbLog: [] };
    const all = [...getModeData('DAILY'), ...getModeData('CAVE')];
    for (const a of alsoFits(input, recommend(input), 10)) {
      expect(asksPainCheck(all.find(c => c.id === a.circuitId)!)).toBe(false);
    }
  });

  it('leaves out what was done today', () => {
    const input = { ...base, sessionLog: [session(iso(10, 8, 7), 'daily-02', 'DAILY')], climbLog: [] };
    expect(alsoFits(input, null, 10).map(a => a.circuitId)).not.toContain('daily-02');
  });

  it('keeps reasons to one short line', () => {
    const input = { ...base, sessionLog: [], climbLog: [climb('2026-10-06')] };
    for (const a of alsoFits(input, null, 10)) expect(a.reason.length).toBeLessThanOrEqual(45);
  });
});
