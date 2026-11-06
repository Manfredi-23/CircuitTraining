import { describe, it, expect } from 'vitest';
import {
  addReading, removeReading, readingsOn, lastGym, observations, gridFor, peak, chance,
  patataHeadline, forecast, forecastLine, laterLine, visitsLine, patataSummary, slotOf, weekdayOf, clockOf,
  type PatataGym, type PatataReading,
} from '../patata';

// Thursday 5 November 2026; earlier Thursdays 29 Oct and 22 Oct, Tuesday 3 Nov.
const at = (m: number, d: number, h: number, min = 0) => new Date(2026, m, d, h, min);
let n = 0;
const tap = (gym: PatataGym, patata: boolean, when: Date): PatataReading => ({ id: `t${n++}`, at: when.toISOString(), gym, patata });

describe('PATATOMETRO taps', () => {
  it('keeps every tap with its time, oldest first, and removes one by id', () => {
    let log = addReading([], 'OERLIKON', false, at(10, 5, 17, 2));
    log = addReading(log, 'OERLIKON', true, at(10, 5, 19, 10));
    log = addReading(log, 'FLUELA', true, at(10, 4, 18, 0));
    expect(log.map(r => r.gym)).toEqual(['FLUELA', 'OERLIKON', 'OERLIKON']);
    expect(new Set(log.map(r => r.id)).size).toBe(3);
    expect(readingsOn(log, '2026-11-05').map(r => clockOf(r.at))).toEqual(['17:02', '19:10']);
    expect(removeReading(log, log[1].id)).toHaveLength(2);
  });

  it('opens the toggle on the gym tapped last, FLUELA before any tap', () => {
    expect(lastGym([])).toBe('FLUELA');
    expect(lastGym([tap('FLUELA', true, at(10, 3, 18)), tap('OERLIKON', false, at(10, 5, 18))])).toBe('OERLIKON');
  });

  it('reads slots by the clock and weeks from Monday', () => {
    expect(slotOf(9)).toBe(0);
    expect(slotOf(12)).toBe(1);
    expect(slotOf(17)).toBe(2);
    expect(slotOf(19)).toBe(3);
    expect(slotOf(22)).toBe(4);
    expect(weekdayOf(at(10, 2, 12))).toBe(0); // Monday 2 Nov
    expect(weekdayOf(at(10, 8, 12))).toBe(6); // Sunday 8 Nov
  });
});

describe('PATATOMETRO statistics', () => {
  it('counts a gym, a day and a slot once; patata if any tap in it said so', () => {
    const log = [
      tap('OERLIKON', false, at(10, 5, 18, 5)),
      tap('OERLIKON', true, at(10, 5, 18, 40)),
      tap('OERLIKON', false, at(10, 5, 19, 50)),
      tap('OERLIKON', false, at(10, 5, 20, 30)),
      tap('FLUELA', true, at(10, 5, 18, 10)),
    ];
    const obs = observations(log);
    expect(obs).toHaveLength(3);
    const g = gridFor(log, 'OERLIKON');
    expect(g.cells[3][3]).toEqual({ yes: 1, n: 1 }); // Thursday 18-20
    expect(g.cells[3][4]).toEqual({ yes: 0, n: 1 }); // Thursday after 20
    expect(g.total).toEqual({ yes: 1, n: 1 }); // one visit, with patata
    expect(g.byWeekday[3]).toEqual({ yes: 1, n: 1 });
    expect(g.bySlot[3]).toEqual({ yes: 1, n: 1 });
  });

  it('ranks 4 of 5 above one lucky visit, and names nothing on one visit alone', () => {
    expect(chance({ yes: 4, n: 5 })).toBeGreaterThan(chance({ yes: 1, n: 1 }));
    const lucky = [tap('FLUELA', true, at(10, 3, 18))];
    expect(peak(lucky)).toBeNull();
    expect(patataHeadline(lucky)).toMatch(/^1 reading so far/);
  });

  it('finds the peak across both gyms, or at one', () => {
    const log = [
      // OERLIKON Thursday 18-20: patata 2 of 3.
      tap('OERLIKON', true, at(9, 22, 18, 30)),
      tap('OERLIKON', true, at(9, 29, 19)),
      tap('OERLIKON', false, at(10, 5, 18, 15)),
      // FLUELA Tuesday 16-18: patata 2 of 2.
      tap('FLUELA', true, at(9, 27, 16, 30)),
      tap('FLUELA', true, at(10, 3, 17)),
      // FLUELA Thursday 12-16: no patata, twice.
      tap('FLUELA', false, at(9, 29, 13)),
      tap('FLUELA', false, at(10, 5, 14)),
    ];
    expect(peak(log)).toMatchObject({ gym: 'FLUELA', weekday: 1, slot: 2, yes: 2, n: 2 });
    expect(peak(log, 'OERLIKON')).toMatchObject({ weekday: 3, slot: 3, yes: 2, n: 3 });
    expect(patataHeadline(log)).toBe('Most patata: FLUELA, TUE 16-18, 2 of 2.');
    // Thursday 17:30: OERLIKON's best later today is 18-20; FLUELA has none.
    const f = forecast(log, at(10, 12, 17, 30));
    expect(f.weekday).toBe(3);
    expect(f.gyms.find(g => g.gym === 'OERLIKON')?.later).toMatchObject({ slot: 3 });
    expect(f.gyms.find(g => g.gym === 'FLUELA')?.later).toBeNull();
    expect(forecastLine(log, at(10, 12, 18, 30))).toBe('Thursday, now 18-20: FLUELA no readings, OERLIKON 2 of 3.');
    expect(laterLine(log, at(10, 12, 17, 30))).toBe('Best of the rest of today: OERLIKON 18-20, 2 of 3.');
    expect(laterLine(log, at(10, 12, 21))).toBeNull();
    expect(visitsLine(log, 'FLUELA')).toBe('patata on 2 of 4 visits');
    expect(visitsLine([], 'OERLIKON')).toBe('no visits logged');
  });

  it('says on the folded line what today holds, else the peak, else asks', () => {
    expect(patataSummary([], at(10, 5, 9))).toEqual({ text: 'Was there patata today? One tap.', on: false });
    const log = [tap('FLUELA', true, at(10, 3, 18)), tap('FLUELA', true, at(10, 10, 18))];
    expect(patataSummary(log, at(10, 5, 9)).text).toBe('Most patata: FLUELA, TUE 18-20');
    const today = [...log, tap('OERLIKON', true, at(10, 5, 19, 4))];
    expect(patataSummary(today, at(10, 5, 21))).toEqual({ text: 'Today: PATATA at OERLIKON, 19:04', on: true });
  });

  it('skips a damaged entry rather than break the screen', () => {
    const bad = [{ id: 'x', at: 'not a date', gym: 'OERLIKON', patata: true }, { id: 'y', at: at(10, 5, 18).toISOString(), gym: 'ZURICH', patata: true }] as unknown as PatataReading[];
    expect(observations(bad)).toEqual([]);
    expect(patataHeadline(bad)).toMatch(/^One tap/);
  });
});
