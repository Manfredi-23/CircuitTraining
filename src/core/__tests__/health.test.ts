import { describe, it, expect } from 'vitest';
import { healthReadiness, mergeHealth, newBodyMass, climbsToImport, EMPTY_HEALTH, type HealthData } from '../health';
import { getRecovery } from '../insights';

const NOW = new Date(2026, 9, 8, 7, 0);
const days = (n: number, v: number) => Array.from({ length: n }, (_, i) => ({ date: `2026-10-0${7 - i}`, value: v }));

function data(p: Partial<HealthData>): HealthData {
  return { ...EMPTY_HEALTH, ...p };
}

describe('health readiness', () => {
  it('returns nothing with no data for today', () => {
    expect(healthReadiness(EMPTY_HEALTH, NOW)).toBeNull();
  });

  it('a good night with HRV at baseline suggests FRESH', () => {
    const r = healthReadiness(data({ sleep: [{ date: '2026-10-08', asleepMin: 480 }], hrv: [...days(6, 60), { date: '2026-10-08', value: 62 }] }), NOW);
    expect(r?.energy).toBe('FRESH');
  });

  it('a very short night alone suggests TIRED', () => {
    expect(healthReadiness(data({ sleep: [{ date: '2026-10-08', asleepMin: 280 }] }), NOW)?.energy).toBe('TIRED');
  });

  it('short sleep plus an HRV drop suggests TIRED, with both reasons', () => {
    const r = healthReadiness(data({ sleep: [{ date: '2026-10-08', asleepMin: 330 }], hrv: [...days(6, 60), { date: '2026-10-08', value: 48 }] }), NOW);
    expect(r?.energy).toBe('TIRED');
    expect(r?.reasons.join(' ')).toMatch(/5h30.*HRV 20% below/);
  });

  it('one flag alone stays NORMAL', () => {
    const r = healthReadiness(data({ sleep: [{ date: '2026-10-08', asleepMin: 450 }], hrv: [...days(6, 60), { date: '2026-10-08', value: 48 }] }), NOW);
    expect(r?.energy).toBe('NORMAL');
  });

  it('ignores HRV without enough baseline days', () => {
    const r = healthReadiness(data({ hrv: [...days(2, 60), { date: '2026-10-08', value: 30 }] }), NOW);
    expect(r).toBeNull();
  });
});

describe('merge and imports', () => {
  it('merges by date, newer wins, and drops old days', () => {
    const stored = data({ sleep: [{ date: '2026-01-01', asleepMin: 400 }, { date: '2026-10-07', asleepMin: 300 }] });
    const m = mergeHealth(stored, { sleep: [{ date: '2026-10-07', asleepMin: 420 }] }, NOW);
    expect(m.sleep).toEqual([{ date: '2026-10-07', asleepMin: 420 }]);
  });

  it('a newer weight is reported once', () => {
    const d = data({ bodyMass: [{ date: '2026-10-07', kg: 62.4 }] });
    expect(newBodyMass(d, '2026-10-01T10:00:00Z')?.kg).toBe(62.4);
    expect(newBodyMass(d, '2026-10-07T12:00:00Z')).toBeNull();
  });

  it('imports watch climbs once, never onto a logged day, never tiny ones', () => {
    const climbs = [
      { id: 'a', date: '2026-10-05', minutes: 110 },
      { id: 'b', date: '2026-10-06', minutes: 90 },
      { id: 'c', date: '2026-10-07', minutes: 5 },
      { id: 'd', date: '2026-10-08', minutes: 60 },
    ];
    expect(climbsToImport(climbs, ['a'], new Set(['2026-10-06'])).map(c => c.id)).toEqual(['d']);
  });
});

describe('recovery stats', () => {
  it('compares effort after good and short nights', () => {
    const health = data({ sleep: [{ date: '2026-10-06', asleepMin: 480 }, { date: '2026-10-07', asleepMin: 300 }] });
    const log = [
      { date: new Date(2026, 9, 6, 18).toISOString(), mode: 'CAVE' as const, circuitId: 'x', circuitTitle: 'x', energy: 'NORMAL' as const, duration: 40, effort: 6 },
      { date: new Date(2026, 9, 7, 18).toISOString(), mode: 'CAVE' as const, circuitId: 'x', circuitTitle: 'x', energy: 'NORMAL' as const, duration: 40, effort: 9 },
    ];
    const r = getRecovery(health, log, 14, NOW);
    expect(r.nights).toHaveLength(14);
    expect(r.compare.map(c => c.effort)).toEqual([6, 9]);
  });
});

describe('connecting Apple Health', () => {
  it('says what went wrong and how to fix it', async () => {
    const { connectMessage, describeRead } = await import('../health');
    expect(connectMessage({ ok: true })).toBe('Apple Health connected.');
    expect(connectMessage({ ok: false, reason: 'missing-plugin' })).toContain('Clean Build Folder');
    expect(connectMessage({ ok: false, reason: 'error', detail: 'Missing com.apple.developer.healthkit entitlement.' }))
      .toContain('+ Capability > HealthKit');
    expect(connectMessage({ ok: false, reason: 'error', detail: 'Something odd' })).toBe('Health did not connect: Something odd');
    expect(describeRead({ sleep: [1, 2], hrv: [1], restingHR: [], bodyMass: [1], climbs: [] }))
      .toBe('2 nights of sleep, 1 day of HRV, 0 days of resting HR, 1 weight, 0 climbing workouts');
  });
});

describe('outdoor workouts from Health', () => {
  it('become activity entries once, a climbing run as a trail run, hand-logged days left alone', async () => {
    const { activitiesToImport } = await import('../health');
    const outdoor = [
      { id: 'a', date: '2026-10-17', type: 'HIKE', minutes: 300, km: 14.26, upM: 1105.4 },
      { id: 'b', date: '2026-10-18', type: 'RUN', minutes: 70, km: 12, upM: 450 },
      { id: 'c', date: '2026-10-19', type: 'BIKE', minutes: 10 },
      { id: 'd', date: '2026-10-20', type: 'HIKE', minutes: 120 },
      { id: 'e', date: '2026-10-21', type: 'TENNIS', minutes: 60 },
    ];
    const logged = [{ id: 'x', date: '2026-10-20', type: 'HIKE' as const }];
    const out = activitiesToImport(outdoor, ['zzz'], logged);
    expect(out).toEqual([
      { id: 'hk-a', date: '2026-10-17', type: 'HIKE', durationMin: 300, distanceKm: 14.3, upM: 1105 },
      { id: 'hk-b', date: '2026-10-18', type: 'TRAILRUN', durationMin: 70, distanceKm: 12, upM: 450 },
    ]);
    expect(activitiesToImport(outdoor, ['a', 'b'], logged)).toEqual([]);
  });
});
