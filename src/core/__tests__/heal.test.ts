import { describe, it, expect } from 'vitest';
import { getModeData } from '../data-index';
import { DATA_CAVE } from '../data-cave';
import { DATA_DAILY } from '../data-daily';
import { CONFIG } from '../config';
import { buildList, estimateDuration, asksPainCheck } from '../engine';
import { getProtocol } from '../protocols';
import { recommend, lastAssess } from '../recommend';
import { getLoadAxis } from '../load';
import { getBenchmark, benchmarkValueFromEntry } from '../benchmarks';
import { CORE_EXERCISES } from '../insights';
import { getBlockWeek } from '../block';
import type { EnergyKey, Progress, SessionLogEntry } from '../types';

const all = getModeData('HEAL');
/** The gym sessions: everything but the ring finger rehab and its test. */
const heal = all.filter(c => !['heal-03', 'heal-04'].includes(c.id));
const ring = all.filter(c => ['heal-03', 'heal-04'].includes(c.id));
const NOW = new Date(2026, 9, 8, 9, 0); // Thursday 8 Oct 2026, local
const iso = (y: number, m: number, d: number, h = 18) => new Date(y, m - 1, d, h).toISOString();
const session = (date: string, circuitId: string, mode: SessionLogEntry['mode']): SessionLogEntry =>
  ({ date, mode, circuitId, circuitTitle: circuitId, energy: 'NORMAL', duration: 60 });

function progressAt(level: number): Progress {
  const xp = CONFIG.levels.find(l => l.level === level)?.cumul ?? 0;
  const p: Progress = {};
  for (const c of CONFIG.capacities) p[c] = { xp, lastTrained: null, history: [] };
  return p;
}

describe('HEAL', () => {
  it('is a fourth tab with two gym sessions, the ring rehab and its test', () => {
    expect(CONFIG.modes).toContain('HEAL');
    expect(all.map(c => c.id)).toEqual(['heal-01', 'heal-02', 'heal-03', 'heal-04']);
  });

  it('never loads the fingers or pulls, so it never asks the pain check', () => {
    for (const circuit of heal) {
      expect(asksPainCheck(circuit), circuit.id).toBe(false);
      for (const ex of circuit.exercises) {
        for (const c of ['crimp', 'openhand', 'forearm', 'pull', 'contact'] as const) {
          expect(ex.capacities, ex.id).not.toContain(c);
        }
        expect(['percent-max', 'edge-mm', 'assisted'], ex.id).not.toContain(ex.load.kind);
      }
    }
  });

  it('runs 45 to 90 minutes at every level and energy', () => {
    for (const circuit of heal) {
      for (const level of CONFIG.levels.map(l => l.level)) {
        for (const energy of ['TIRED', 'NORMAL', 'FRESH'] as EnergyKey[]) {
          const min = estimateDuration(buildList(circuit, energy, progressAt(level)));
          expect(min, `${circuit.id} L${level} ${energy}`).toBeGreaterThanOrEqual(45);
          expect(min, `${circuit.id} L${level} ${energy}`).toBeLessThanOrEqual(90);
        }
      }
    }
  });

  it('uses the barbell for the squat only, and no TRX or bench of any kind', () => {
    const banned = /hip thrust|good morning|landmine|trx|incline/i;
    const text = (e: { form?: { setup: string } }) => e.form?.setup ?? '';
    for (const ex of all.flatMap(c => c.exercises)) {
      expect(banned.test(ex.name), ex.id).toBe(false);
      expect(/bench/i.test(text(ex)), ex.id).toBe(false);
      if (ex.id !== 'heal-back-squat') expect(/barbell/i.test(ex.name), ex.id).toBe(false);
    }
  });

  it('links every exercise to a protocol and closes with the tendon glides', () => {
    for (const circuit of all) {
      for (const ex of circuit.exercises) expect(getProtocol(ex.protocolId), ex.id).not.toBeNull();
      expect(circuit.exercises[circuit.exercises.length - 1].id).toBe('heal-tendon-glides');
    }
  });

  it('shares exercises with CAVE and DAILY as the same objects, so history carries over', () => {
    const others = [...DATA_CAVE, ...DATA_DAILY].flatMap(c => c.exercises);
    for (const id of ['daily-back-unwind', 'daily-side-plank-dip', 'feet-frogger']) {
      const here = heal.flatMap(c => c.exercises).find(e => e.id === id);
      expect(here, id).toBeDefined();
      expect(others.find(e => e.id === id)).toBe(here);
    }
  });
});

describe('HEAL in STATS', () => {
  it('counts its trunk and hinge sets in core volume', () => {
    const ids = heal.flatMap(c => c.exercises).map(e => e.id);
    for (const id of ['morn-hollow', 'morn-leg-lowers', 'legs-plate-crunch']) {
      expect(CORE_EXERCISES.abs).toContain(id);
      expect(ids).toContain(id);
    }
    expect(CORE_EXERCISES.obliques).toContain('addon-russian-twist');
    expect(ids).toContain('addon-russian-twist');
  });
});

describe('recommend while a finger heals', () => {
  const block = getBlockWeek(null, [], NOW);
  const base = { progress: {}, benchmarkResults: [], block, now: NOW, climbLog: [] };

  it('recommends the other HEAL session two days after the last one', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 6), 'heal-01', 'HEAL')] });
    expect(r).toMatchObject({ mode: 'HEAL', circuitId: 'heal-02' });
  });

  it('recommends a DAILY with no finger work the day after, once the rehab is not due', () => {
    const r = recommend({ ...base, sessionLog: [
      session(iso(2026, 10, 7), 'heal-01', 'HEAL'),
      session(iso(2026, 10, 7, 19), 'heal-03', 'HEAL'),
    ] });
    expect(r?.mode).toBe('DAILY');
    const circuit = getModeData('DAILY').find(c => c.id === r?.circuitId)!;
    expect(asksPainCheck(circuit)).toBe(false);
  });

  it('stops once a climb is logged after the last HEAL session', () => {
    const r = recommend({
      ...base,
      sessionLog: [session(iso(2026, 10, 5), 'heal-01', 'HEAL')],
      climbLog: [{ id: 'c', date: '2026-10-07', venue: 'GYM', discipline: 'BOULDER', climbs: [] }],
    });
    expect(r?.mode).not.toBe('HEAL');
  });
});

describe('HEAL ring finger rehab', () => {
  const rehab = all.find(c => c.id === 'heal-03')!;
  const test = all.find(c => c.id === 'heal-04')!;
  const left = rehab.exercises.find(e => e.id === 'heal-ring-left')!;

  it('asks the pain check, because it loads a finger', () => {
    for (const circuit of ring) expect(asksPainCheck(circuit), circuit.id).toBe(true);
  });

  it('takes the left finger exactly as prescribed: 3 x 12, 90s rest, at every level and energy', () => {
    for (const level of CONFIG.levels.map(l => l.level)) {
      for (const energy of ['TIRED', 'NORMAL', 'FRESH'] as EnergyKey[]) {
        const ex = buildList(rehab, energy, progressAt(level)).find(e => e.id === 'heal-ring-left')!;
        expect([ex.scaledSets, ex.scaledWork, ex.scaledRest], `L${level} ${energy}`).toEqual([3, 12, 90]);
      }
    }
  });

  it('logs the left on a half-kilo stepper from 2kg, and reads it against the right', () => {
    expect(getLoadAxis(left)).toMatchObject({ unit: 'kg', step: 0.5 });
    expect(left.load.value).toBe(2);
    expect(left.comparesTo).toMatchObject({ benchmarkId: 'ring-finger-right', goalPct: 80 });
  });

  it('records the right as a ramp test, kept to the half kilo', () => {
    const ex = test.exercises.find(e => e.records)!;
    expect(ex.ramp).toBeDefined();
    expect(ex.records?.benchmarkId).toBe('ring-finger-right');
    expect(getBenchmark('ring-finger-right')).not.toBeNull();
    expect(benchmarkValueFromEntry(ex.records!, 6.5)).toBe(6.5);
  });

  it('keeps under 25 minutes', () => {
    for (const circuit of ring) {
      for (const energy of ['TIRED', 'NORMAL', 'FRESH'] as EnergyKey[]) {
        expect(estimateDuration(buildList(circuit, energy, progressAt(1))), circuit.id).toBeLessThanOrEqual(25);
      }
    }
  });
});

describe('recommend the ring finger rehab', () => {
  const block = getBlockWeek(null, [], NOW);
  const base = { progress: {}, benchmarkResults: [], block, now: NOW, climbLog: [] };
  const right = { benchmarkId: 'ring-finger-right', value: 6, date: iso(2026, 10, 4) };

  it('asks for the right-hand test first, after the gym session is done', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 8, 7), 'heal-01', 'HEAL')] });
    expect(r).toMatchObject({ mode: 'HEAL', circuitId: 'heal-04' });
  });

  it('then the rehab, every second day', () => {
    const log = [session(iso(2026, 10, 7), 'heal-01', 'HEAL'), session(iso(2026, 10, 6), 'heal-03', 'HEAL')];
    expect(recommend({ ...base, benchmarkResults: [right], sessionLog: log }))
      .toMatchObject({ mode: 'HEAL', circuitId: 'heal-03' });
    const yesterday = [session(iso(2026, 10, 7), 'heal-01', 'HEAL'), session(iso(2026, 10, 7, 19), 'heal-03', 'HEAL')];
    expect(recommend({ ...base, benchmarkResults: [right], sessionLog: yesterday })?.mode).toBe('DAILY');
  });

  it('still puts the gym session first on a gym day', () => {
    const log = [session(iso(2026, 10, 6), 'heal-01', 'HEAL'), session(iso(2026, 10, 6, 19), 'heal-03', 'HEAL')];
    expect(recommend({ ...base, benchmarkResults: [right], sessionLog: log }))
      .toMatchObject({ mode: 'HEAL', circuitId: 'heal-02' });
  });

  it('never counts the ring test as an ASSESS', () => {
    expect(lastAssess([right])).toBeNull();
  });
});
