import { describe, it, expect } from 'vitest';
import { WALL_DRILLS, drillById, fingerLine, focusDrills, wallFocus } from '../wall';
import { getSeason, seasonLabel } from '../season';
import { DEFAULT_GOALS } from '../goals';
import { recommend } from '../recommend';
import { getBlockWeek } from '../block';
import type { ClimbEntry, ClimbSession, SessionLogEntry } from '../types';

const NOW = '2026-10-27';
const c = (sent: boolean, tags: string[], why?: string[]): ClimbEntry => ({ grade: 'RED', attempts: 3, sent, tags, why });
const session = (date: string, climbs: ClimbEntry[], extra: Partial<ClimbSession> = {}): ClimbSession =>
  ({ id: date, date, venue: 'GYM', discipline: 'BOULDER', climbs, ...extra });

describe('the drills', () => {
  it('each have a name, how, dose and something they answer', () => {
    const ids = new Set<string>();
    for (const d of WALL_DRILLS) {
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
      expect(d.how.length).toBeGreaterThan(30);
      expect(d.dose).toBeTruthy();
      expect(d.answers.length).toBeGreaterThan(0);
    }
    expect(drillById('try-hard')?.kind).toBe('HEAD');
  });
});

describe('the wall focus', () => {
  it('starts on the feet, and on 110% goes, with no tags', () => {
    const f = wallFocus({ climbLog: [], now: NOW });
    expect(f.technique.drill.id).toBe('silent-feet');
    expect(f.technique.why).toMatch(/Feet first/);
    expect(f.head.drill.id).toBe('try-hard');
    expect(f.stamina?.drill.kind).toBe('STAMINA');
    expect(f.finger).toBeNull();
  });

  it('rotates the footwork drills session to session', () => {
    const log = [session('2026-10-20', [], { focusDone: ['silent-feet'] })];
    expect(wallFocus({ climbLog: log, now: NOW }).technique.drill.id).toBe('hover-feet');
  });

  it('answers the styles fallen on once there are enough tags', () => {
    const steep = Array.from({ length: 5 }, () => c(false, ['overhang', 'compression'], ['tension']));
    const easy = Array.from({ length: 6 }, () => c(true, ['slab', 'smear']));
    const f = wallFocus({ climbLog: [session('2026-10-22', [...steep, ...easy], { tryHard: true })], now: NOW });
    expect(['toes-on', 'hooks', 'squeeze']).toContain(f.technique.drill.id);
    expect(f.technique.why).toMatch(/You fall most on/);
  });

  it('moves the head on once 110% goes are a habit, to what the falls say', () => {
    const scared = Array.from({ length: 8 }, () => c(false, ['overhang'], ['scared']));
    const log = [
      session('2026-10-20', scared, { tryHard: true, focusDone: ['try-hard'] }),
      session('2026-10-22', [], { tryHard: true }),
    ];
    const f = wallFocus({ climbLog: log, now: NOW });
    expect(['fall-practice', 'commit-move', 'top-out']).toContain(f.head.drill.id);
  });

  it('asks for stamina once a week, every session in BASE, never in PEAK, and keeps rope drills to a sport goal', () => {
    const recent = [session('2026-10-25', [], { focusDone: ['four-by-four'] })];
    expect(wallFocus({ climbLog: recent, now: NOW }).stamina).toBeNull();
    expect(wallFocus({ climbLog: recent, now: NOW, phase: 'BASE' }).stamina?.drill.id).toBe('arc');
    expect(wallFocus({ climbLog: [], now: NOW, phase: 'PEAK' }).stamina).toBeNull();
    for (let i = 0; i < 6; i++) {
      const f = wallFocus({ climbLog: [session('2026-10-01', [], { focusDone: [WALL_DRILLS[i].id] })], now: NOW });
      expect(focusDrills(f).every(p => !p.drill.rope)).toBe(true);
    }
  });

  it('says which grips while the finger heals, from how far along it is', () => {
    expect(fingerLine(null)).toMatch(/Crimps and pockets: not recommended yet/);
    expect(fingerLine(65)).toMatch(/Half crimps: easy ones only.*65%/);
    expect(fingerLine(85)).toMatch(/cleared/);
    expect(wallFocus({ climbLog: [], now: NOW, healing: true, ringPct: 50 }).finger).toMatch(/50%/);
  });
});

describe('the season', () => {
  const log = (date: string): SessionLogEntry[] => [{ date: new Date(`${date}T08:00:00`).toISOString(), mode: 'DAILY', circuitId: 'daily-01', circuitTitle: 'x', energy: 'NORMAL', duration: 10 }];
  const at = (d: string) => new Date(`${d}T10:00:00`);

  it('rolls BASE, STRENGTH, POWER a block at a time from the first session', () => {
    expect(getSeason(DEFAULT_GOALS, log('2026-10-26'), at(NOW)).phase).toBe('BASE');
    expect(getSeason(DEFAULT_GOALS, log('2026-09-28'), at(NOW)).phase).toBe('STRENGTH');
    expect(getSeason(DEFAULT_GOALS, log('2026-08-31'), at(NOW)).phase).toBe('POWER');
    expect(getSeason(DEFAULT_GOALS, log('2026-08-03'), at(NOW)).phase).toBe('BASE');
  });

  it('plans back from a trip: PEAK the last week, POWER four, STRENGTH six, BASE before', () => {
    const goals = (date: string) => ({ ...DEFAULT_GOALS, event: { date, label: 'Font' } });
    expect(getSeason(goals('2026-10-30'), [], at(NOW)).phase).toBe('PEAK');
    expect(getSeason(goals('2026-11-20'), [], at(NOW)).phase).toBe('POWER');
    expect(getSeason(goals('2027-01-01'), [], at(NOW)).phase).toBe('STRENGTH');
    const base = getSeason(goals('2027-04-01'), [], at(NOW));
    expect(base.phase).toBe('BASE');
    expect(seasonLabel(base)).toMatch(/^base phase, 22 weeks to Font$/);
    // A trip in the past is ignored.
    expect(getSeason(goals('2026-10-01'), log('2026-10-26'), at(NOW)).toward).toBeNull();
  });

  it('picks the training day by phase, and a peak week adds none', () => {
    const now = new Date(2026, 9, 29, 9); // Thursday
    const climb: ClimbSession = { id: 'c', date: '2026-10-20', venue: 'GYM', discipline: 'BOULDER', climbs: [] };
    const strong: SessionLogEntry = { date: new Date(2026, 9, 27, 18).toISOString(), mode: 'CAVE', circuitId: 'cave-01', circuitTitle: 'STRONG', energy: 'NORMAL', duration: 80 };
    const base = { sessionLog: [strong], climbLog: [climb], progress: {}, benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 150, date: '2026-10-01' }], block: getBlockWeek(null, [strong], now), now };
    expect(recommend({ ...base, season: 'POWER' })?.circuitId).toBe('cave-07');
    expect(recommend({ ...base, season: 'BASE' })?.circuitId).toBe('cave-08');
    expect(recommend({ ...base, season: 'PEAK' })?.mode).not.toBe('CAVE');
  });
});
