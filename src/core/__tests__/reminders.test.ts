import { describe, it, expect } from 'vitest';
import { planReminders, outOfQuietHours, DEFAULT_REMINDER_SETTINGS, ALL_REMINDER_IDS, type ReminderSettings } from '../reminders';
import type { SessionLogEntry } from '../types';

const NOW = new Date(2026, 9, 6, 10, 0); // Tuesday 6 Oct, 10:00 local
const base = { progress: {}, sessionLog: [], climbLog: [], benchmarkResults: [], settings: DEFAULT_REMINDER_SETTINGS, now: NOW };
const only = (k: keyof ReminderSettings['enabled']): ReminderSettings => ({
  ...DEFAULT_REMINDER_SETTINGS,
  enabled: Object.fromEntries(Object.keys(DEFAULT_REMINDER_SETTINGS.enabled).map(x => [x, x === k])) as ReminderSettings['enabled'],
});
const s = (date: Date, circuitId: string, mode: SessionLogEntry['mode'], extra: Partial<SessionLogEntry> = {}): SessionLogEntry =>
  ({ date: date.toISOString(), mode, circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 30, ...extra });

describe('reminders', () => {
  it('never plans anything in the past and only uses reserved ids', () => {
    const r = planReminders({ ...base, progress: { crimp: { xp: 0, lastTrained: new Date(2026, 9, 1).toISOString(), lastHard: new Date(2026, 9, 1).toISOString(), history: [] } } });
    for (const x of r) {
      expect(x.at.getTime()).toBeGreaterThan(NOW.getTime());
      expect(ALL_REMINDER_IDS).toContain(x.id);
    }
    expect(new Set(r.map(x => x.id)).size).toBe(r.length);
  });

  it('DAILY skips today once a DAILY is done, and plans at the chosen time', () => {
    const settings = { ...only('daily'), dailyTime: '11:15' };
    const open = planReminders({ ...base, settings });
    expect(open[0].at).toEqual(new Date(2026, 9, 6, 11, 15));
    const done = planReminders({ ...base, settings, sessionLog: [s(new Date(2026, 9, 6, 7), 'daily-01', 'DAILY')] });
    expect(done[0].at).toEqual(new Date(2026, 9, 7, 11, 15));
  });

  it('fingers: 48h after the last hard loading, out of quiet hours', () => {
    const hard = new Date(2026, 9, 5, 23, 0).toISOString();
    const r = planReminders({ ...base, settings: only('fingers'), progress: { crimp: { xp: 0, lastTrained: hard, lastHard: hard, history: [] } } });
    expect(r[0].at).toEqual(new Date(2026, 9, 8, 8, 0));
  });

  it('quiet hours move to 08:00', () => {
    expect(outOfQuietHours(new Date(2026, 9, 6, 22, 0))).toEqual(new Date(2026, 9, 7, 8, 0));
    expect(outOfQuietHours(new Date(2026, 9, 6, 5, 0))).toEqual(new Date(2026, 9, 6, 8, 0));
    expect(outOfQuietHours(new Date(2026, 9, 6, 12, 0))).toEqual(new Date(2026, 9, 6, 12, 0));
  });

  it('core: Thursday evening when behind', () => {
    const r = planReminders({ ...base, settings: only('core') });
    expect(r[0].at).toEqual(new Date(2026, 9, 8, 19, 0));
    expect(r[0].body).toContain('0 of 12 abs');
  });

  it('climb: evening after a stacking session with nothing logged', () => {
    const log = [s(new Date(2026, 9, 6, 9), 'cave-05', 'CAVE')];
    expect(planReminders({ ...base, settings: only('climb'), sessionLog: log })).toHaveLength(1);
    expect(planReminders({ ...base, settings: only('climb'), sessionLog: log, climbLog: [{ id: 'c', date: '2026-10-06', venue: 'GYM', discipline: 'BOULDER', climbs: [] }] })).toHaveLength(0);
  });

  it('assess: the Saturday after the due date', () => {
    const r = planReminders({ ...base, settings: only('assess'), benchmarkResults: [{ benchmarkId: 'fs-2arm-20mm', value: 1, date: new Date(2026, 7, 20, 10).toISOString() }] });
    // Due Thursday 8 Oct (7 weeks after 20 Aug) -> Saturday 10 Oct.
    expect(r[0].at).toEqual(new Date(2026, 9, 10, 9, 0));
  });

  it('switched off means nothing', () => {
    const off = { ...DEFAULT_REMINDER_SETTINGS, enabled: { daily: false, fingers: false, fading: false, core: false, assess: false, climb: false } };
    expect(planReminders({ ...base, settings: off })).toHaveLength(0);
  });
});
