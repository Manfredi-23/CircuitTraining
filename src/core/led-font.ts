// =============================================================================
// led-font.ts — The 5 x 7 LED alphabet behind the app's numerals and icons
//
// The session illustrations are dot-matrix figures on a 30 x 30 LED grid. The
// big figures in the interface (session numbers, the rest countdown, reps,
// STATS totals) and the tab icons speak the same language: each glyph is a
// grid of dots, lit or unlit. Pure data and a layout function, no React.
// =============================================================================

export type Glyph = string[];

const G = (...rows: string[]): Glyph => rows;

/** 7 rows each; '#' is a lit dot. Width varies by glyph. */
export const LED_GLYPHS: Record<string, Glyph> = {
  '0': G('.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'),
  '1': G('..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'),
  '2': G('.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'),
  '3': G('#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'),
  '4': G('...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'),
  '5': G('#####', '#....', '####.', '....#', '....#', '#...#', '.###.'),
  '6': G('..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'),
  '7': G('#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'),
  '8': G('.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'),
  '9': G('.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'),
  ':': G('.', '.', '#', '.', '#', '.', '.'),
  '.': G('.', '.', '.', '.', '.', '.', '#'),
  '%': G('##...', '##..#', '...#.', '..#..', '.#...', '#..##', '...##'),
  '+': G('.....', '..#..', '..#..', '#####', '..#..', '..#..', '.....'),
  '-': G('...', '...', '...', '###', '...', '...', '...'),
  '/': G('....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....'),
  'x': G('.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'),
  's': G('....', '....', '.###', '#...', '.##.', '...#', '###.'),
  'h': G('#...', '#...', '#.#.', '##.#', '#..#', '#..#', '#..#'),
  'm': G('.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'),
  'k': G('#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#'),
  'g': G('....', '....', '.###', '#..#', '.###', '...#', '###.'),
  'C': G('.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'),
  'H': G('#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'),
  'R': G('####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'),
  ' ': G('..', '..', '..', '..', '..', '..', '..'),
};

/** Pixel icons for the tab bar, on the same 7-row grid. */
export const LED_ICONS: Record<string, Glyph> = {
  // A calendar page with today filled in.
  today: G('.#...#.', '#######', '#.....#', '#.##..#', '#.##..#', '#.....#', '#######'),
  // A dumbbell: the training library.
  train: G('.......', '##...##', '##...##', '#######', '##...##', '##...##', '.......'),
  // Columns of a chart.
  stats: G('.....#.', '.....#.', '...#.#.', '...#.#.', '.#.#.#.', '.#.#.#.', '#######'),
  // Lines of a log.
  log: G('#.#####', '.......', '#.#####', '.......', '#.#####', '.......', '#.###..'),
};

export interface LedDot { x: number; y: number; lit: boolean; col: number }

/**
 * Dots for a string, left to right, one empty column between glyphs. Unknown
 * characters fall back to a space so a figure never throws.
 */
export function layoutLed(text: string): { dots: LedDot[]; cols: number } {
  const dots: LedDot[] = [];
  let x = 0;
  const chars = [...text];
  chars.forEach((ch, i) => {
    const g = LED_GLYPHS[ch] ?? LED_GLYPHS[ch.toLowerCase()] ?? LED_GLYPHS[ch.toUpperCase()] ?? LED_GLYPHS[' '];
    const w = g[0].length;
    for (let y = 0; y < 7; y++) for (let c = 0; c < w; c++) dots.push({ x: x + c, y, lit: g[y][c] === '#', col: x + c });
    x += w + (i < chars.length - 1 ? 1 : 0);
  });
  return { dots, cols: x };
}

export function layoutIcon(name: string): { dots: LedDot[]; cols: number } {
  const g = LED_ICONS[name];
  if (!g) return { dots: [], cols: 0 };
  const dots: LedDot[] = [];
  for (let y = 0; y < g.length; y++) for (let c = 0; c < g[y].length; c++) dots.push({ x: c, y, lit: g[y][c] === '#', col: c });
  return { dots, cols: g[0].length };
}
