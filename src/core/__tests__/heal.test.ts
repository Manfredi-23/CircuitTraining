import { describe, it, expect } from 'vitest';
import { getModeData } from '../data-index';
import { DATA_CAVE } from '../data-cave';
import { DATA_DAILY } from '../data-daily';
import { CONFIG } from '../config';
import { buildList, estimateDuration, asksPainCheck } from '../engine';
import { getProtocol } from '../protocols';
import { recommend } from '../recommend';
import { CORE_EXERCISES } from '../insights';
import { getBlockWeek } from '../block';
import type { EnergyKey, Progress, SessionLogEntry } from '../types';

const heal = getModeData('HEAL');
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
  it('is a fourth tab with two sessions', () => {
    expect(CONFIG.modes).toContain('HEAL');
    expect(heal.map(c => c.id)).toEqual(['heal-01', 'heal-02']);
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
    for (const ex of heal.flatMap(c => c.exercises)) {
      expect(banned.test(ex.name), ex.id).toBe(false);
      expect(/bench/i.test(text(ex)), ex.id).toBe(false);
      if (ex.id !== 'heal-back-squat') expect(/barbell/i.test(ex.name), ex.id).toBe(false);
    }
  });

  it('links every exercise to a protocol and closes with the tendon glides', () => {
    for (const circuit of heal) {
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

  it('recommends a DAILY with no finger work the day after', () => {
    const r = recommend({ ...base, sessionLog: [session(iso(2026, 10, 7), 'heal-01', 'HEAL')] });
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
