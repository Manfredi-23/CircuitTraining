import { describe, it, expect } from 'vitest';
import { DATA_ASSESS } from '../data-assess';
import { BENCHMARKS } from '../benchmarks';

describe('ASSESS', () => {
  const tests = DATA_ASSESS[0].exercises.filter(ex => ex.records);

  it('saves every result to a known benchmark', () => {
    const ids = new Set(BENCHMARKS.map(b => b.id));
    for (const ex of tests) expect(ids.has(ex.records!.benchmarkId), ex.id).toBe(true);
  });

  it('records nothing that needs a partner, a bench or a judge', () => {
    const retired = ['front-lever', 'trunk-flexor-hold', 'back-extension-hold'];
    expect(tests.filter(ex => retired.includes(ex.records!.benchmarkId))).toEqual([]);
  });

  it('keeps the retired benchmarks so old results still show', () => {
    const ids = BENCHMARKS.map(b => b.id);
    expect(ids).toEqual(expect.arrayContaining(['front-lever', 'trunk-flexor-hold', 'back-extension-hold']));
  });
});
