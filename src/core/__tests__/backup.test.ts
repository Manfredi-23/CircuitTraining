import { describe, it, expect } from 'vitest';
import { createBackup, parseBackup, PERSISTED_KEYS } from '../backup';

describe('backup', () => {
  const state = {
    progress: { crimp: { xp: 12, lastTrained: null, history: [] } },
    sessionLog: [{ date: '2026-10-01T07:00:00Z', mode: 'DAILY' }],
    benchmarkResults: [],
    loadLog: [{ exerciseId: 'x', value: 10 }],
    climbLog: [],
  };

  it('round-trips through JSON', () => {
    const parsed = parseBackup(JSON.stringify(createBackup(state)));
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.backup.data).toEqual(state);
    expect(parsed.summary).toMatchObject({ sessions: 1, loads: 1, tests: 0, climbs: 0 });
  });

  it('only carries persisted keys', () => {
    const b = createBackup({ ...state, screen: 'home' } as never);
    expect(Object.keys(b.data).every(k => (PERSISTED_KEYS as readonly string[]).includes(k))).toBe(true);
  });

  it('refuses anything that is not a 7bit backup', () => {
    expect(parseBackup('nope').ok).toBe(false);
    expect(parseBackup('{"app":"other","format":1,"data":{}}').ok).toBe(false);
    expect(parseBackup('{"app":"7bit","format":99,"data":{}}').ok).toBe(false);
  });

  it('refuses a damaged field whole', () => {
    const bad = { app: '7bit', format: 1, data: { ...state, sessionLog: 'oops' } };
    expect(parseBackup(JSON.stringify(bad)).ok).toBe(false);
  });
});
