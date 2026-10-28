# 7BIT — Handover v39

**Date:** 28 October 2026
**Read this first**, then v38 (the climbing weapon). Working agreements
unchanged (`CLAUDE.md`).

---

## 1. What this session was

Two parts.

1. **Research, no build:** THE COACH's API key (billing, risks, cost per
   review, Console setup, a safe first test), a search for Claude skills on
   climbing, strength, rehab and the head, and whether the in-app coach should
   use Agent Skills through the API. The athlete was not convinced by the API
   route and chose a **trial instead**: COPY FOR COACH, pasted into a Claude
   Code chat, reviewed there. No key is stored, nothing is spent.
2. **A BUILD bug, fixed:** a gym session with CORE in, PULL, LEGS and FINGERS
   out and 1H picked came out at 31 minutes.

## 2. What changed

- **BUILD keeps the time picked** (`buildCustom`, `custom.ts`). The cause: at
  the gym, with a finger healing and PULL and LEGS out, CORE has a dozen
  exercises; all went in and the session still ended early, and on a deload
  week each lost a set (31 min). Now, when the exercises run out before the
  time (the areas run dry, or the one-per-four-minutes cap is reached), the
  time is filled with more sets, one at a time round the non-fixed working
  exercises, at most `EXTRA_SETS` (2) more each. Rest is never touched; fixed
  protocols, warm-ups and tests stay as written. The sheet says how many sets
  were added (`extraSets`). The same choice now runs 60 minutes at every
  energy.
- **Today's time cap no longer cuts a BUILD session** (`applyDay`,
  `today.ts`). A cap set under ADJUST TODAY only sets where the BUILD time
  picker opens; before, picking 1H on a day capped at 30 still ran 30 at
  START.
- **Three more core exercises in the reserve** (`reserve.ts`): slow mountain
  climber (home), TRX knee tuck / pike and plate hug carry (gym). They show in
  BUILD's CORE and in + ADD EXERCISE.
- Tests: `custom.test.ts` (the hour kept at every energy on a deload week,
  extra sets within `EXTRA_SETS`, no finger work), `today.test.ts` (a BUILD
  session is never cut by today's cap).

### Second PR: the fuller COPY FOR COACH

The first pasted summary was too thin to coach from (the review is in the
chat; its main points: the ring finger turning, pulling 149% BW, the hang
the real gap, too little climbing and none at the limit, no testing at pain
3+, one PULL + PUSH a week while healing, hold the POWER phase until the left
reaches about 60%). `coachSummary` now prints:

- the block week, and a line when a healing finger holds back what the
  STRENGTH or POWER phase asks;
- every session with start and end, energy, deload, then each exercise: sets
  done of planned @ the load that day, how it felt, skipped, cut short,
  added. Ramp tests show as attempts with the best, never as sets over the
  plan (the old "21/18" and "4/2"); a 0-minute session reads "under a
  minute";
- LOADS without the TEST entries, with sessions and best;
- every test with the result before it, and every row of the gap, not only
  the first;
- the ring finger as a series: each left session with its % and the pain
  before it, each right test, and what the % compares (a 3 x 12 working load
  against a 12-rep max);
- climbs with gym colours as their Font band and how many were logged;
- rest and sick days, today's ADJUST, the weekly plan;
- A NOTE FOR THE COACH, a text field above COPY FOR COACH (16px, kept on the
  device under `7bit_coach_note`, never in a backup).

About 15,000 characters (some 5,000 tokens) on the seed history.
`coach.test.ts` covers each part; the STATS e2e types a note.

## 3. Research findings (kept for later)

- **Cost of one ASK THE COACH** on Opus 5.5 at effort medium, from the seed
  summary (6,065 characters): about 2,300-2,800 input tokens and 1,500-4,500
  output (thinking included): about $0.06 a review, $0.25 a month at one a
  week; $0.33 worst case. Sonnet 5.5 about half; Haiku 5.5 about $0.002.
  Estimates: `count_tokens` was not run (no key).
- **The API bills separately** from the Claude plan (prepaid Console
  credit). If the key is ever used: a separate workspace with its own spend
  limit, prepaid credit with auto-reload off, revoke on any doubt.
- **No climbing skill exists** (GitHub, Anthropic's repo, directories;
  skillsmp.com was blocked in the cloud session). The best evidence work is
  `davidesilver/sc-coach-skills` (MIT, sourced and graded, no climbing). The
  recommendation was to write our own climbing-coach skill with
  `skill-creator`, and to put its distilled guidance in `COACH_SYSTEM` rather
  than call Agent Skills through the API (slower, 3-6x the cost, no gain for
  one fixed task).

## 4. Verified

- `npx tsc --noEmit`
- `npm test`: 314 passing (312 before); 318 after the second PR
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 10 passing

## 5. Repo state

Branch `claude/adoring-pascal-qrqz8o` from `main` at the v38 merge
(`7499e94`): the BUILD fix merged as PR #56. The branch was then restarted
from `main` at that merge (`34cadbe`) for the second PR, the fuller COPY FOR
COACH. The v38 branch is already gone from the remote.

## 6. Open items

- The summary only shows what is logged: 120-minute climbing sessions with
  one climb logged say little. Log every climb tried, with + STYLE on the
  hard ones.
- Rest days hold only their date (`offDays`), and only today's ADJUST TODAY
  is kept, so sore days and time caps of earlier days are not in the summary.
- **The coach trial:** the athlete pastes COPY FOR COACH into a chat; the
  review is done there. After a few weeks, decide: keep pasting, write the
  climbing-coach skill (for Claude Code and claude.ai), or set up the key.
- ASK THE COACH has still never run with a real key.
- BUILD's extra sets also apply on a deload week and when TIRED: the time
  picked wins. If that feels wrong, cap the fill on those days.
- Carried from v38: grade tables approximate, inputs not yet checked for the
  iOS zoom (BUILD preset name, routine name, activity log), CAVE 01 at 84 min
  at levels 6-7, HEAL 01 at 89 of 90 FRESH, undoing FINISH NOW leaves a Health
  workout, reminders do not read the weekly plan.

## 7. Next steps

- Build the same session again (CAVE, 1H, CORE in, PULL / LEGS / FINGERS
  out): START should read about 60 MIN and the sheet name the extra sets.
- Each week: STATS, OVERVIEW, THE COACH, COPY FOR COACH, paste it into a
  Claude Code chat.

## 8. Mac clean update

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git stash push -u -m "mac-local-$(date +%Y%m%d-%H%M)"
git checkout main
git fetch origin --prune
git pull --ff-only origin main
git log -1 --oneline
git branch --merged main | grep -v -E '^\*|^ +main$' | while read b; do git branch -d "$b"; done
rm -rf out .next ios/App/App/public
npm ci
npx tsc --noEmit
npm test
npm run check:daily
npm run check:cave
npm run build
grep -rl "A NOTE FOR THE COACH" out/_next/static | head -1
npx cap sync ios
grep -rl "A NOTE FOR THE COACH" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the second v39 PR (the fuller COPY FOR COACH).
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 9. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/adoring-pascal-qrqz8o
git fetch origin --prune
git branch -a
```
