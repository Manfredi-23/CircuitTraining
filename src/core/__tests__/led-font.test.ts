import { describe, it, expect } from 'vitest';
import { LED_GLYPHS, LED_ICONS, layoutIcon, layoutLed } from '../led-font';

describe('LED font', () => {
  it('every glyph and icon is seven rows of one width', () => {
    for (const [k, g] of Object.entries({ ...LED_GLYPHS, ...LED_ICONS })) {
      expect(g, k).toHaveLength(7);
      expect(new Set(g.map(r => r.length)).size, k).toBe(1);
      expect(g.every(r => /^[.#]+$/.test(r)), k).toBe(true);
    }
  });

  it('lays out glyphs with one empty column between them', () => {
    expect(layoutLed('1').cols).toBe(5);
    expect(layoutLed('1:30').cols).toBe(5 + 1 + 1 + 1 + 5 + 1 + 5);
    expect(layoutLed('01').dots.filter(d => d.lit).length).toBeGreaterThan(10);
  });

  it('never throws on an unknown character', () => {
    expect(layoutLed('?').cols).toBe(2);
  });

  it('has the four tab icons', () => {
    for (const n of ['today', 'train', 'stats', 'log']) expect(layoutIcon(n).cols).toBe(7);
  });
});
