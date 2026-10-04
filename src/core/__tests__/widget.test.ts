import { describe, it, expect } from 'vitest';
import { widgetSnapshot } from '../widget';
import { getBlockWeek } from '../block';

const NOW = new Date(2026, 9, 8, 9, 0);
const block = getBlockWeek(null, [], NOW);

describe('widget snapshot', () => {
  it('names the recommended session', () => {
    const s = widgetSnapshot({ mode: 'CAVE', circuitId: 'cave-05', reason: 'You climbed today.' }, block, {}, NOW);
    expect(s.session).toBe('CAVE 02 PULL + PUSH');
    expect(s.block).toBe('BUILD WEEK 1 OF 3');
  });

  it('counts down to finger readiness only while it is ahead', () => {
    const hard = new Date(2026, 9, 7, 18).toISOString();
    const s = widgetSnapshot(null, block, { crimp: { xp: 0, lastTrained: hard, lastHard: hard, history: [] } }, NOW);
    expect(s.session).toBe('DONE FOR TODAY');
    expect(s.fingersReadyAt).toBe(new Date(2026, 9, 9, 18).getTime());
    const old = new Date(2026, 9, 1).toISOString();
    expect(widgetSnapshot(null, block, { crimp: { xp: 0, lastTrained: old, lastHard: old, history: [] } }, NOW).fingersReadyAt).toBeNull();
  });
});
