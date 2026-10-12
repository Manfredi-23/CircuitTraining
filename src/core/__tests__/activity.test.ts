import { describe, it, expect } from 'vitest';
import {
  estimateActivity, activityLoadItems, legSoreness, isLegHeavy, describeEstimate, walkingHours,
  ACTIVITY_SPEC, type ActivitySession,
} from '../activity';
import { loadItems, climbingLane, weeklyLoad } from '../training-load';
import { recommend } from '../recommend';
import { getWeekStrip } from '../insights';
import { getModeData } from '../data-index';
import { creditActivity } from '../../store/slices/activity-slice';
import type { BlockWeek } from '../block';

const NOW = new Date(2026, 9, 12, 7, 0); // Monday 12 Oct 2026, 07:00 local
const weekend: ActivitySession = { id: 'w', date: '2026-10-10', type: 'HIKE', days: 2, upM: 1300 };
const block = { week: 1, deload: false } as unknown as BlockWeek;
const circuit = (id: string) => ['DAILY', 'CAVE', 'HEAL'].flatMap(m => getModeData(m as 'DAILY')).find(c => c.id === id)!;

describe('estimating an activity', () => {
  it('fills a weekend hike from the climb alone', () => {
    const e = estimateActivity(weekend);
    expect(e.downM).toBe(1300);
    expect(e.distanceKm).toBe(13);
    // DIN 33466: 4h20 up + 2h36 down = 6.93h vertical, 3.25h flat, 6.93 + 1.63 = 8h30.
    expect(e.durationMin).toBe(510);
    expect(e.effort).toBe(5); // base 4, +1 for 650 m a day
    expect(e.load).toBe(5 * 510);
    expect(e.assumed).toEqual(['down', 'distance', 'duration', 'effort']);
    expect(describeEstimate(e, 'HIKE')).toBe('+1300 / -1300 m, 13 km, 8h30, 2 days');
  });

  it('uses what was entered instead of a guess', () => {
    const e = estimateActivity({ ...weekend, downM: 900, durationMin: 600, effort: 7 });
    expect(e.downM).toBe(900);
    expect(e.durationMin).toBe(600);
    expect(e.effort).toBe(7);
    expect(e.assumed).toEqual(['distance']);
  });

  it('adds effort for a big day, a heavy pack and altitude, and caps at 10', () => {
    const e = estimateActivity({ id: 'a', date: '2026-10-10', type: 'SKITOUR', upM: 1600, heavyPack: true, altitude: true });
    expect(e.effort).toBe(10);
  });

  it('falls back to a typical duration with nothing entered', () => {
    expect(estimateActivity({ id: 'y', date: '2026-10-10', type: 'YOGA' }).durationMin).toBe(60);
    expect(estimateActivity({ id: 'h', date: '2026-10-10', type: 'HIKE', days: 2 }).durationMin).toBe(480);
  });

  it('reads the walking-time rule as the larger plus half the smaller', () => {
    expect(walkingHours(ACTIVITY_SPEC.HIKE, 300, 0, 4)).toBeCloseTo(1.5);
  });
});

describe('activity load', () => {
  it('spreads the load over the days, in its own lane', () => {
    const items = activityLoadItems([weekend]);
    expect(items.map(i => i.date)).toEqual(['2026-10-10', '2026-10-11']);
    expect(items[0].load).toBe(1275);
    const all = loadItems([], [], [weekend]);
    expect(all.every(i => i.source === 'ACTIVITY')).toBe(true);
    expect(climbingLane(all)).toEqual([]);
    expect(weeklyLoad(all, 1, new Date(2026, 9, 11)).at(-1)!.bySource.ACTIVITY).toBe(2550);
  });
});

describe('sore legs', () => {
  it('opens 24h after 650 m down a day, counted from the last evening', () => {
    const s = legSoreness([weekend], NOW);
    expect(s?.until).toEqual(new Date(2026, 9, 12, 18, 0));
    expect(legSoreness([weekend], new Date(2026, 9, 12, 19, 0))).toBeNull();
  });

  it('opens 48h after a long single-day descent and none after a flat walk', () => {
    const big: ActivitySession = { id: 'b', date: '2026-10-11', type: 'HIKE', upM: 1000 };
    expect(legSoreness([big], NOW)?.until).toEqual(new Date(2026, 9, 13, 18, 0));
    expect(legSoreness([{ id: 'f', date: '2026-10-11', type: 'HIKE', distanceKm: 12 }], NOW)).toBeNull();
  });

  it('marks the leg sessions and leaves footwork alone', () => {
    const heavy = ['daily-03', 'daily-05', 'cave-06', 'heal-01', 'heal-02'];
    for (const id of heavy) expect(isLegHeavy(circuit(id))).toBe(true);
    for (const id of ['daily-01', 'daily-02', 'daily-04', 'cave-01', 'cave-05', 'heal-05']) {
      expect(isLegHeavy(circuit(id))).toBe(false);
    }
  });

  it('keeps the recommender off leg sessions while the window is open', () => {
    // DAILY 05 would be next: never done, last in rotation after the others were done.
    const done = ['daily-01', 'daily-02', 'daily-03', 'daily-04'].map((id, i) => ({
      date: new Date(2026, 9, 5 + i, 8).toISOString(), mode: 'DAILY' as const, circuitId: id,
      circuitTitle: id, energy: 'NORMAL' as const, duration: 15,
    }));
    const base = { sessionLog: done, climbLog: [], progress: {}, benchmarkResults: [], block, now: NOW };
    expect(recommend(base)?.circuitId).toBe('daily-05');
    const sore = recommend({ ...base, activityLog: [weekend] });
    expect(sore?.circuitId).toBe('daily-01');
    expect(sore?.reason).toBe('Legs sore from the hike. Upper body.');
    expect(sore!.reason.length).toBeLessThanOrEqual(45);
  });

  it('picks PULL + PUSH over LEGS + BACK after bouldering', () => {
    const climb = { id: 'c', date: '2026-10-12', venue: 'GYM' as const, discipline: 'BOULDER' as const, climbs: [] };
    const base = { sessionLog: [], climbLog: [climb], progress: {}, benchmarkResults: [], block, now: NOW };
    const sore = recommend({ ...base, activityLog: [weekend] });
    expect(sore?.circuitId).toBe('cave-05');
  });
});

describe('activity XP', () => {
  it('earns leg XP per day, capped, and marks the legs trained', () => {
    const p = creditActivity({}, { ...weekend, days: 5 }, NOW);
    expect(p.legs?.xp).toBe(6);
    expect(p.legs?.lastTrained).toBe(new Date(2026, 9, 14, 18, 0).toISOString());
    expect(creditActivity({}, { id: 'o', date: '2026-10-10', type: 'OTHER' }, NOW)).toEqual({});
  });
});

describe('week strip', () => {
  it('marks every day of an activity, behind a climb on the same day', () => {
    const climb = { id: 'c', date: '2026-10-11', venue: 'GYM' as const, discipline: 'BOULDER' as const, climbs: [] };
    const strip = getWeekStrip([], [climb], 2, NOW, [weekend]);
    const days = strip.weeks[0].days;
    expect(days.find(d => d.date === '2026-10-10')?.kind).toBe('ACTIVITY');
    expect(days.find(d => d.date === '2026-10-11')?.kind).toBe('CLIMB');
  });
});
