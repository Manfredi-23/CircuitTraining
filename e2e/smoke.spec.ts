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

/** A finger's swipe to the left across a row, as a mouse drag. */
async function swipeLeft(page: Page, text: RegExp) {
  const row = page.getByText(text).first();
  await row.scrollIntoViewIfNeeded();
  const box = (await row.boundingBox())!;
  const y = box.y + box.height / 2;
  const x = box.x + Math.min(box.width / 2, 120);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - 100, y, { steps: 6 });
  await page.mouse.move(x - 200, y, { steps: 6 });
  await page.mouse.up();
}

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

test('TODAY asks CAVE, CLIMB or REST, and the pick follows', async ({ page }) => {
  // The evening, so the weekday WAKE UP does not lead.
  const evening = new Date();
  evening.setHours(19, 0, 0, 0);
  await page.clock.setFixedTime(evening);
  const errors = await open(page);
  const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: /^CLIMB/ }) });
  await group.getByRole('button', { name: /^CAVE/ }).click();
  await expect(group.getByRole('button', { name: /^CAVE/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/CORE \+ (PULL|LEGS|PUSH)/).first()).toBeVisible();
  await group.getByRole('button', { name: /^CLIMB/ }).click();
  await expect(page.getByText('STRAIGHT BACK').first()).toBeVisible();
  await group.getByRole('button', { name: /^REST/ }).click();
  await expect(page.getByText('Rest day.')).toBeVisible();
  await group.getByRole('button', { name: /^REST/ }).click();
  await expect(group.getByRole('button', { name: /^REST/ })).toHaveAttribute('aria-pressed', 'false');
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
  await expect(page.getByRole('tab', { name: 'SEARCH ALL' })).toBeVisible();
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
  const note = page.getByRole('textbox', { name: 'A NOTE FOR THE COACH' });
  await note.fill('Slept badly this week.');
  await expect(note).toHaveValue('Slept badly this week.');
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

test('BODY THIS WEEK opens TRAIN THIS; the session map moves an exercise to the end', async ({ page }) => {
  const errors = await open(page, { ...seed.data, sessionLog: [] });
  await expect(page.getByRole('heading', { name: 'BODY THIS WEEK' })).toBeVisible();
  await page.getByRole('button', { name: /^FEET: / }).click();
  await expect(page.getByText('TRAIN THIS')).toBeVisible();
  await page.getByRole('button', { name: /HOOKS \+ HIGH FEET/ }).click();
  await expect(page.getByText(/^SKILL · \d+ MIN/).first()).toBeVisible();
  await expect(page.getByText(/^THIS SESSION/)).toBeVisible();
  await page.getByRole('button', { name: /^START HOOKS \+ HIGH FEET/ }).click();
  await expect(page.getByText(/MIN LEFT/).first()).toBeVisible();
  await page.getByRole('button', { name: /Open the whole session/ }).click();
  await expect(page.getByText('BACK TO THE SET')).toBeVisible();
  const later = page.getByRole('button', { name: 'LATER', exact: true }).first();
  await later.click();
  await page.getByRole('button', { name: 'BACK TO THE SET' }).click();
  await expect(page.getByRole('button', { name: 'DONE', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('PATATOMETRO takes a tap at a gym, keeps its time, and finds when patata is highest', async ({ page }) => {
  const tuesday = (m: number, d: number) => new Date(2026, m, d, 18, 30).toISOString();
  const patataLog = [
    { id: 'p1', at: tuesday(9, 27), gym: 'FLUELA', patata: true },
    { id: 'p2', at: tuesday(10, 3), gym: 'FLUELA', patata: true },
  ];
  const errors = await open(page, { ...seed.data, patataLog });
  const head = page.getByRole('button', { name: /^PATATOMETRO/ });
  await expect(head).toContainText('Most patata: FLUELA, TUE 18-20');
  await head.click();
  await expect(page.getByText('Most patata: FLUELA, TUE 18-20, 2 of 2.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'TUE 18-20: patata 2 of 2, the most' })).toBeVisible();
  await page.getByRole('button', { name: 'OERLIKON', exact: true }).click();
  await page.getByRole('button', { name: 'PATATA', exact: true }).click();
  await expect(head).toContainText(/Today: PATATA at OERLIKON, \d\d:\d\d/);
  await expect(page.getByRole('button', { name: /^Delete \d\d:\d\d PATATA at OERLIKON/ })).toBeVisible();
  await page.getByRole('button', { name: 'UNDO' }).click();
  await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
  await page.getByRole('button', { name: 'NO PATATA', exact: true }).click();
  await expect(head).toContainText(/Today: NO PATATA at OERLIKON/);
  // Kept across a reload: the gym too, from the last tap.
  await page.reload();
  await page.getByRole('button', { name: /^PATATOMETRO/ }).click();
  await expect(page.getByRole('button', { name: 'OERLIKON', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /^Delete \d\d:\d\d NO PATATA at OERLIKON/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('a swipe swaps for other kit, + ADD adds a group, and the swap runs and holds mid-session', async ({ page }) => {
  const errors = await open(page, { ...seed.data, sessionLog: [] });
  await tab(page, 'TRAIN');
  await tab(page, 'CAVE');
  await page.getByRole('button', { name: /FULL BODY/ }).first().click();
  await expect(page.getByText(/12 exercises/i)).toBeVisible();

  // The rings are taken: swipe the ring row, SWAP, OTHER KIT.
  await swipeLeft(page, /^Ring Row/);
  await page.getByRole('button', { name: /^Swap Ring Row/ }).click();
  await page.getByRole('tab', { name: 'OTHER KIT' }).click();
  await expect(page.getByText(/THE SAME JOB WITHOUT: RINGS/)).toBeVisible();
  await page.getByRole('button', { name: /Single-Arm Dumbbell Row/ }).first().click();
  await expect(page.getByText('EDITED FOR TODAY')).toBeVisible();
  await expect(page.getByText(/^Single-Arm Dumbbell Row/).first()).toBeVisible();
  await expect(page.getByText(/^Ring Row/)).toHaveCount(0);

  // + ADD: three for the abs in one tap.
  await page.getByRole('button', { name: '+ ADD EXERCISES' }).click();
  await page.getByRole('button', { name: 'ABS', exact: true }).click();
  await page.getByRole('button', { name: /^ADD 3 FOR ABS/ }).click();
  await expect(page.getByText(/^Added: /)).toBeVisible();
  await page.getByRole('button', { name: 'DONE (3 ADDED)' }).click();
  await expect(page.getByText(/15 exercises/i)).toBeVisible();

  // OUT, then UNDO.
  await swipeLeft(page, /^Box Jump/);
  await page.getByRole('button', { name: /^Take Box Jump/ }).click();
  await expect(page.getByText(/14 exercises/i)).toBeVisible();
  await page.getByRole('button', { name: 'UNDO', exact: true }).click();
  await expect(page.getByText(/15 exercises/i)).toBeVisible();

  // It runs as shown; in the session map, a swipe swaps one still to come.
  await page.getByRole('button', { name: /^START FULL BODY/ }).click();
  // The suitcase carry is a grip: the finger check asks first.
  await page.getByRole('radio', { name: '1', exact: true }).click();
  await page.getByRole('button', { name: 'START', exact: true }).click();
  await expect(page.getByRole('button', { name: 'DONE', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Open the whole session/ }).click();
  await expect(page.getByText(/^Single-Arm Dumbbell Row/).first()).toBeVisible();
  await swipeLeft(page, /^Suitcase Carry/);
  await page.getByRole('button', { name: /^Swap Suitcase Carry/ }).click();
  await page.getByRole('tab', { name: 'SIMILAR' }).click();
  await page.getByRole('button', { name: /Band Pallof Press/ }).first().click();
  await expect(page.getByText(/^Band Pallof Press/).first()).toBeVisible();
  await page.getByRole('button', { name: 'BACK TO THE SET' }).click();

  // Feeling worse: the rest is rebuilt at TIRED, and the swaps hold.
  await page.getByRole('button', { name: /^ADJUST/ }).click();
  await page.getByRole('button', { name: 'TIRED', exact: true }).click();
  await page.getByRole('button', { name: /Open the whole session/ }).click();
  await expect(page.getByText(/^Band Pallof Press/).first()).toBeVisible();
  await expect(page.getByText(/^Suitcase Carry/)).toHaveCount(0);
  await expect(page.getByText(/^Ring Row/)).toHaveCount(0);
  expect(errors).toEqual([]);
});
