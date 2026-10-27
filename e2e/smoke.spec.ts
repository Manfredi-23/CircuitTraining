import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

// An eight-week history (scripts/make-seed.ts), loaded the way persist stores it.
const seed = JSON.parse(readFileSync('e2e/fixtures/athlete.json', 'utf8'));

async function open(page: Page, data: unknown = seed.data) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/');
  await page.evaluate(d => localStorage.setItem('7bit_store', JSON.stringify({ state: d, version: 2 })), data);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'TODAY', exact: true })).toBeVisible();
  return errors;
}

const tab = (page: Page, name: string) => page.getByRole('tab', { name, exact: true }).first().click();

test('TODAY leads with one session and a START', async ({ page }) => {
  const errors = await open(page);
  await expect(page.getByText(/RECOMMENDED|PLANNED/).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Start / })).toBeVisible();
  await page.getByRole('button', { name: /ADJUST TODAY/ }).click();
  await page.getByRole('button', { name: 'REST DAY', exact: true }).click();
  await expect(page.getByText('Rest day.')).toBeVisible();
  await page.getByRole('button', { name: 'REST DAY', exact: true }).click();
  expect(errors).toEqual([]);
});

test('a session runs from TRAIN, finishes, and lands in LOG', async ({ page }) => {
  await open(page, { ...seed.data, sessionLog: [] });
  await tab(page, 'TRAIN');
  await page.getByRole('button', { name: /LEGS \+ CORE/ }).click();
  await page.getByRole('button', { name: /^START LEGS \+ CORE/ }).click();
  await page.getByRole('button', { name: 'DONE', exact: true }).click();
  const skip = page.getByRole('button', { name: 'SKIP REST' });
  if (await skip.isVisible().catch(() => false)) await skip.click();
  await page.getByRole('button', { name: /^ADJUST/ }).click();
  await page.getByRole('button', { name: 'FINISH NOW' }).click();
  await expect(page.getByText('SESSION COMPLETE')).toBeVisible();
  // No confirm dialog: UNDO goes back to the set in hand.
  await page.getByRole('button', { name: 'UNDO' }).click();
  await expect(page.getByRole('button', { name: 'DONE', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^ADJUST/ }).click();
  await page.getByRole('button', { name: 'FINISH NOW' }).click();
  await expect(page.getByText('SESSION COMPLETE')).toBeVisible();
  await page.getByRole('button', { name: 'DONE', exact: true }).click();
  await tab(page, 'LOG');
  await expect(page.getByText('DAILY · LEGS + CORE')).toBeVisible();
  await page.getByRole('button', { name: 'CLIMBS', exact: true }).click();
  await expect(page.getByText('DAILY · LEGS + CORE')).toHaveCount(0);
});

test('CAVE 04 asks pain and readiness, and 40% takes the hangs out', async ({ page }) => {
  const errors = await open(page, { ...seed.data, sessionLog: [] });
  await tab(page, 'TRAIN');
  await page.getByRole('tab', { name: 'CAVE', exact: true }).click();
  await page.getByRole('button', { name: /POWER/ }).first().click();
  await page.getByRole('button', { name: /^START POWER/ }).click();
  const start = page.getByRole('button', { name: 'START', exact: true });
  await expect(page.getByRole('button', { name: 'PAIN FIRST' })).toBeDisabled();
  await page.getByRole('radio', { name: '1', exact: true }).click();
  await page.getByRole('radio', { name: '40%' }).click();
  await expect(page.getByText(/no-grip version/)).toBeVisible();
  await start.click();
  await expect(page.getByRole('button', { name: 'DONE', exact: true })).toBeVisible();
  // Twelve exercises as written; the finger warm-up and the hangs come out.
  await expect(page.getByText('EXERCISE 1/10')).toBeVisible();
  expect(errors).toEqual([]);
});

test('EDIT changes a session before START: remove, swap, a pack, kept or reset', async ({ page }) => {
  const errors = await open(page, { ...seed.data, sessionLog: [] });
  await tab(page, 'TRAIN');
  await tab(page, 'CAVE');
  await page.getByRole('button', { name: /FULL BODY/ }).first().click();
  await expect(page.getByText(/12 exercises/i)).toBeVisible();
  await page.getByRole('button', { name: 'EDIT', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Box Jump' }).click();
  await page.getByRole('button', { name: 'SWAP', exact: true }).nth(2).click();
  await expect(page.getByText('SIMILAR', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'SEARCH ALL EXERCISES' })).toBeVisible();
  await page.getByRole('button', { name: /Goblet Squat/ }).first().click();
  await page.getByRole('button', { name: '+ PACK' }).click();
  await page.getByRole('button', { name: 'ADD', exact: true }).first().click();
  await page.getByRole('button', { name: /^DONE \(1 ADDED\)/ }).click();
  await page.getByRole('button', { name: 'KEEP FOR NEXT TIME' }).click();
  await page.getByRole('button', { name: /^DONE ·/ }).click();
  await expect(page.getByText('YOUR VERSION, KEPT')).toBeVisible();
  // Box jump out, the goblet squat in, two of the core finisher (the twist is already there).
  await expect(page.getByText(/13 exercises/i)).toBeVisible();
  await page.getByRole('button', { name: 'RESET', exact: true }).click();
  await expect(page.getByText(/12 exercises/i)).toBeVisible();
  expect(errors).toEqual([]);
});

test('MAKE IT MINE copies a session into a routine that runs', async ({ page }) => {
  await open(page);
  await tab(page, 'TRAIN');
  await tab(page, 'CAVE');
  await page.getByRole('button', { name: /PULL \+ PUSH/ }).click();
  await page.getByRole('button', { name: /MAKE IT MINE/ }).click();
  await page.getByRole('button', { name: /^Remove / }).first().click();
  await page.getByRole('button', { name: /^SAVE/ }).click();
  await tab(page, 'MINE');
  await page.getByRole('button', { name: /MY PULL \+ PUSH/ }).click();
  await expect(page.getByRole('button', { name: /^START MY PULL \+ PUSH/ })).toBeVisible();
});

test('a planned day leads on TODAY', async ({ page }) => {
  await open(page);
  await tab(page, 'TRAIN');
  await tab(page, 'MINE');
  const today = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][new Date().getDay()];
  await page.getByRole('button', { name: `Plan ${today}` }).click();
  await page.getByRole('button', { name: '03 BAND STRENGTH' }).click();
  await page.getByRole('button', { name: 'DONE', exact: true }).click();
  await tab(page, 'TODAY');
  await expect(page.getByText(/PLANNED · DAILY 03/)).toBeVisible();
});

test('STATS tabs and an exercise page', async ({ page }) => {
  await open(page);
  await tab(page, 'STATS');
  await expect(page.getByText('WHAT STANDS OUT')).toBeVisible();
  await tab(page, 'PROGRESS');
  await page.getByRole('button', { name: /Weighted Pull-Ups/ }).first().click();
  await expect(page.getByText('RECENT SESSIONS')).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  for (const t of ['BODY', 'CLIMBING']) {
    await tab(page, t);
    await expect(page.getByRole('tab', { name: t, selected: true })).toBeVisible();
  }
});

test('a deleted session comes back with UNDO', async ({ page }) => {
  await open(page);
  await tab(page, 'LOG');
  // The header counts every entry, so it moves by exactly one.
  const count = async () => Number((await page.getByText(/\d+ entries/).textContent())?.match(/(\d+) entries/)?.[1]);
  const before = await count();
  await page.getByRole('button', { name: /^DAILY · / }).first().click();
  await page.getByRole('button', { name: 'DELETE THIS SESSION' }).click();
  await page.getByRole('button', { name: 'DELETE', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('deleted');
  expect(await count()).toBe(before - 1);
  await page.getByRole('button', { name: 'UNDO' }).click();
  expect(await count()).toBe(before);
});

test('TODAY offers a wall focus, and the climb log tags a climb and a 110% go', async ({ page }) => {
  const errors = await open(page);
  await page.getByRole('button', { name: /TIME ON THE WALL|ON THE WALL TODAY/ }).click();
  await expect(page.getByText('FEET + TECHNIQUE')).toBeVisible();
  await tab(page, 'LOG');
  await page.getByRole('button', { name: /CLIMB/ }).first().click();
  await page.getByRole('button', { name: /^Red/ }).click();
  await page.getByRole('button', { name: 'PROJ', exact: true }).click();
  await page.getByRole('button', { name: '+ STYLE AND WHY IT FELL' }).click();
  await page.getByRole('button', { name: 'OVERHANG', exact: true }).click();
  await page.getByRole('button', { name: 'BACKED OFF', exact: true }).click();
  await page.getByRole('button', { name: 'CLOSE' }).click();
  await expect(page.getByText('OVERHANG · fell: BACKED OFF')).toBeVisible();
  await page.getByRole('button', { name: /I GAVE ONE GO 110%/ }).click();
  await page.getByRole('button', { name: /^SAVE SESSION/ }).click();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('7bit_store')!).state.climbLog.at(-1));
  expect(saved.tryHard).toBe(true);
  expect(saved.climbs[0]).toMatchObject({ sent: false, tags: ['overhang'], why: ['backed-off'] });
  expect(errors).toEqual([]);
});

test('STATS: the coach, the goal ladder and goals edited, and where you fall', async ({ page }) => {
  const errors = await open(page);
  await tab(page, 'STATS');
  await expect(page.getByRole('heading', { name: 'THE COACH' })).toBeVisible();
  await tab(page, 'PROGRESS');
  await expect(page.getByText(/^7C boulder around/)).toBeVisible();
  await page.getByRole('button', { name: 'EDIT GOALS' }).click();
  await page.getByRole('radiogroup', { name: 'boulder next goal' }).getByRole('radio', { name: '7B+' }).click();
  await page.getByRole('button', { name: 'SAVE GOALS' }).click();
  await expect(page.getByText(/^7B\+ boulder around/)).toBeVisible();
  await tab(page, 'CLIMBING');
  await expect(page.getByRole('heading', { name: 'WHERE YOU FALL' })).toBeVisible();
  await expect(page.getByText(/is where you fall/)).toBeVisible();
  expect(errors).toEqual([]);
});
