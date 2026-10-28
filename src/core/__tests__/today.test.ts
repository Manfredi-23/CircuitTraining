import { describe, it, expect } from 'vitest';
import { activeDay, applyDay, describeDay, fitToMinutes, loadsArea, needsKit, offDaysSince, setOffDay, NO_DAY } from '../today';
import { buildList, checkDecay, estimateDuration } from '../engine';
import { recommend } from '../recommend';
import { planReminders, DEFAULT_REMINDER_SETTINGS } from '../reminders';
import { getModeData } from '../data-index';
import type { BlockWeek } from '../block';
import type { SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 13, 7, 0); // Tuesday 13 Oct 2026, 07:00
const block = { week: 1, deload: false } as unknown as BlockWeek;
const find = (id: string) => ['DAILY', 'CAVE', 'TEST', 'HEAL'].flatMap(m => getModeData(m as 'DAILY')).find(c => c.id === id)!;

describe('the day plan', () => {
  const plan = { date: '2026-10-13', minutes: 15, noKit: true, sore: ['LEGS' as const], off: 'REST' as const };

  it('holds time, kit and off for the day, soreness for two', () => {
    expect(activeDay(plan, NOW)).toEqual({ minutes: 15, noKit: true, sore: ['LEGS'], off: 'REST' });
    expect(activeDay(plan, new Date(2026, 9, 14, 9))).toEqual({ minutes: null, noKit: false, sore: ['LEGS'], off: null });
    expect(activeDay(plan, new Date(2026, 9, 15, 9))).toEqual(NO_DAY);
    expect(describeDay(activeDay(plan, NOW))).toBe('REST DAY · 15 MIN · NO KIT · SORE LEGS');
  });

  it('keeps off days in order, once each', () => {
    let off = setOffDay([], '2026-10-13', true);
    off = setOffDay(off, '2026-10-11', true);
    off = setOffDay(off, '2026-10-13', true);
    expect(off).toEqual(['2026-10-11', '2026-10-13']);
    expect(setOffDay(off, '2026-10-13', false)).toEqual(['2026-10-11']);
    expect(offDaysSince(off, '2026-10-11', '2026-10-13')).toBe(1);
  });
});

describe('only N minutes', () => {
  it('cuts whole exercises to fit, keeps the warm-up and never touches rest', () => {
    const full = buildList(find('cave-01'), 'NORMAL', {});
    const cut = fitToMinutes(full, 30);
    expect(estimateDuration(cut)).toBeLessThanOrEqual(30);
    expect(cut.filter(e => e.block === 'WARMUP').length).toBe(full.filter(e => e.block === 'WARMUP').length);
    for (const e of cut) {
      const orig = full.find(f => f.id === e.id)!;
      expect(e.scaledRest).toBe(orig.scaledRest);
      expect(e.scaledSets).toBe(orig.scaledSets);
    }
    // Light blocks go before heavy ones: the max hang stays.
    expect(cut.some(e => e.id === 'cave-max-hang')).toBe(true);
  });

  it('keeps one working exercise however short, and never cuts a test', () => {
    const cut = fitToMinutes(buildList(find('cave-01'), 'NORMAL', {}), 1);
    expect(cut.filter(e => e.block !== 'WARMUP').length).toBe(1);
    const assess = buildList(find('assess-01'), 'NORMAL', {});
    expect(fitToMinutes(assess, 10)).toEqual(assess);
  });
});

describe('no kit', () => {
  it('leaves a DAILY with mat work only, and leaves gym sessions alone', () => {
    const day = { ...NO_DAY, noKit: true };
    const band = applyDay(buildList(find('daily-03'), 'NORMAL', {}), find('daily-03'), day, 'DAILY');
    expect(band.some(needsKit)).toBe(false);
    const cave = buildList(find('cave-06'), 'NORMAL', {});
    expect(applyDay(cave, find('cave-06'), day, 'CAVE')).toEqual(cave);
  });

  it('never cuts a BUILD session: it was made for its own time', () => {
    const day = { ...NO_DAY, minutes: 20 };
    const long = buildList(find('cave-01'), 'NORMAL', {});
    expect(applyDay(long, { ...find('cave-01'), id: 'custom-cave' }, day, 'CAVE')).toEqual(long);
    expect(applyDay(long, find('cave-01'), day, 'CAVE').length).toBeLessThan(long.length);
  });
});

describe('sore areas', () => {
  it('knows which sessions load which area', () => {
    expect(loadsArea(find('cave-06'), 'LEGS')).toBe(true);
    expect(loadsArea(find('cave-06'), 'BACK')).toBe(true);
    expect(loadsArea(find('cave-05'), 'SHOULDERS')).toBe(true);
    expect(loadsArea(find('cave-06'), 'SHOULDERS')).toBe(false);
    expect(loadsArea(find('daily-04'), 'FOREARMS')).toBe(true);
    expect(loadsArea(find('daily-01'), 'FOREARMS')).toBe(false);
  });
});

describe('the recommendation', () => {
  const climb = { id: 'c', date: '2026-10-13', venue: 'GYM' as const, discipline: 'BOULDER' as const, climbs: [] };
  const base = { sessionLog: [] as SessionLogEntry[], climbLog: [], progress: {}, benchmarkResults: [], block, now: NOW };

  it('recommends nothing on a rest or sick day', () => {
    expect(recommend({ ...base, day: { ...NO_DAY, off: 'SICK' } })).toBeNull();
  });

  it('picks a mat-only DAILY with no kit, even after climbing', () => {
    const r = recommend({ ...base, climbLog: [climb], day: { ...NO_DAY, noKit: true } });
    expect(r?.mode).toBe('DAILY');
    expect(r?.reason).toBe('No kit today: a mat-only DAILY.');
  });

  it('steers the after-bouldering session around sore shoulders', () => {
    expect(recommend({ ...base, climbLog: [climb] })?.circuitId).toBe('cave-05');
    const r = recommend({ ...base, climbLog: [climb], day: { ...NO_DAY, sore: ['SHOULDERS'] } });
    expect(r?.circuitId).toBe('cave-06');
    expect(r?.reason).toBe('Shoulders sore. Something else today.');
  });

  it('keeps finger DAILYs off with sore forearms', () => {
    const done = ['daily-01', 'daily-02', 'daily-03'].map((id, i) => ({
      date: new Date(2026, 9, 6 + i, 8).toISOString(), mode: 'DAILY' as const, circuitId: id,
      circuitTitle: id, energy: 'NORMAL' as const, duration: 15,
    }));
    expect(recommend({ ...base, sessionLog: done })?.circuitId).toBe('daily-04');
    expect(recommend({ ...base, sessionLog: done, day: { ...NO_DAY, sore: ['FOREARMS'] } })?.circuitId).toBe('daily-05');
  });
});

describe('off days', () => {
  it('do not count towards decay', () => {
    const lastTrained = new Date(2026, 8, 20, 18).toISOString(); // 23 days before NOW
    const progress = { mobility: { xp: 40, lastTrained, history: [] } };
    const plain = checkDecay(progress, [], NOW.getTime()).progress.mobility!.xp;
    const off = Array.from({ length: 20 }, (_, i) => `2026-09-${String(21 + i).padStart(2, '0')}`).filter(d => d <= '2026-09-30')
      .concat(Array.from({ length: 12 }, (_, i) => `2026-10-${String(1 + i).padStart(2, '0')}`));
    const rested = checkDecay(progress, off, NOW.getTime()).progress.mobility!.xp;
    expect(plain).toBeLessThan(40);
    expect(rested).toBe(40);
  });

  it('get no reminders', () => {
    const input = {
      progress: {}, sessionLog: [], climbLog: [], benchmarkResults: [],
      settings: DEFAULT_REMINDER_SETTINGS, now: new Date(2026, 9, 13, 6, 0),
    };
    const daily = planReminders(input).filter(r => r.kind === 'daily');
    expect(daily.length).toBeGreaterThan(0);
    expect(planReminders({ ...input, offDays: ['2026-10-13'] }).some(r => r.kind === 'daily' && r.at.getDate() === 13)).toBe(false);
  });
});
