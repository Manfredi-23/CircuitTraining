# 7BIT — Handover v38

**Date:** 27 October 2026
**Read this first**, then `docs/7bit-roadmap.md` part two (the plan this
session built) and v37 (the swap screen). Working agreements unchanged
(`CLAUDE.md`).

---

## 1. What this session was

A brainstorm with the athlete, then the plan it led to, built in one go.

The athlete's answers:

- **Goals:** 7c / 8a, boulder and sport. Milestones are fine, "you say what
  is realistic, dynamic with my progress".
- **What holds them back:** technique and feet most, then the head ("I'm
  scared and I rarely give 110%"). Stamina too, with little rope time.
- **The finger:** still healing, usable, bad only when isolated. "I want to be
  free to train the way I feel. I don't want exercises removed by default:
  label them as not recommended." Pain 6+ stays a hard rule (agreed).
- **Profile:** keep 7a boulder for ease of progress.
- **Coach:** yes, a weekly review by Claude.
- **UI:** a bit too crowded, everywhere.
- **No:** a project tracker, a force gauge, an Apple Watch app, a faster
  climb-logging widget.

The taste skill (github.com/leonxlnx/taste-skill, `references/app-screens.md`)
and Anthropic's `frontend-design` skill were read and applied to every new
screen: one question per screen, the finding first, colour on data only,
nothing under 11px, 16px inputs. Neither needed installing for the cloud
session.

## 2. What changed

Seven commits, one per roadmap phase (10-15) plus a stray file removed.

1. **Calmer screens (phase 10).** The session page shows one line per
   exercise: name, sets x reps, a load cue (no block, no rest, no "No load").
   ALSO FITS TODAY folds to one line like ADJUST TODAY. WHAT STANDS OUT shows
   three, the rest behind MORE.
2. **Goals and the gap (phase 11).** `goals.ts`, `gap.ts`, `GoalSection`.
   THE GOAL leads STATS PROGRESS: a ladder of grades per discipline from the
   working grade (from sends, never below the profile's 7A / 7a) to the final
   goal, with estimates (4 months a grade on boulders, 5 on routes, slower
   above 7B+; the athlete's own rate once the log shows a grade gained). With
   the seed data 7C boulder lands around March 2028 and 8A around May 2029.
   Under it, what 7C asks of the body: the tested finger hang and pull-up
   against the standard at now, 7C and 8A, and whether strength is what
   stands in the way. EDIT GOALS sets next, final and an optional trip.
3. **Why climbs fail (phase 12).** `climb-tags.ts`, `limiters.ts`,
   `LimitersSection`. + STYLE under each logged climb: wall angle, holds,
   moves, and on a project or a send of 3+ goes, why it fell (BACKED OFF and
   SCARED included). I GAVE ONE GO 110% on the session. WHERE YOU FALL leads
   STATS CLIMBING. The seed history is tagged and has CAVE 04 and 05 once
   each (an old open item).
4. **Suggest, never remove (phase 13.2).** While a finger heals, grips,
   pulling and finger work stay on offer everywhere (SWAP, + EXERCISE, the
   reserve, packs, BUILD), labelled NOT RECOMMENDED YET, listed after the
   recommended ones. Pain 3-5 labels finger work; 6+ still removes it. A
   finger session planned while healing leads TODAY, labelled, with the HEAL
   pick as the alternative. BUILD never preselects a labelled target and
   warns when one is tapped in.
5. **On the wall and the season (phases 13.1, 14).** `wall.ts`, `season.ts`,
   `WallCard`. TODAY shows ON THE WALL: a feet / technique drill (rotating
   footwork drills until the tags name a style), a head drill (three goes at
   110% until it is a habit, then falling on purpose, committing the crux),
   and stamina on boulders when due. The climb log ticks the drills done.
   The season rolls BASE, STRENGTH, POWER a block at a time, or plans back
   from a trip (PEAK, POWER 4 weeks, STRENGTH 6); it picks the training day
   and names itself on TODAY.
6. **The coach (phase 15).** `coach.ts`, `src/coach/client.ts`,
   `CoachSection`. THE COACH on STATS OVERVIEW: COPY FOR COACH copies the last
   four weeks as one text to paste into Claude. With an Anthropic API key in
   Settings (on the phone only, never in a backup), ASK THE COACH sends it
   with `@anthropic-ai/sdk` (new dependency) and shows the review.
7. The Settings, climb-log and goal inputs are 16px, so iOS does not zoom on
   focus (part of the v37 open item).

## 3. Verified

All of these passed:
- `npx tsc --noEmit`
- `npm test`: 312 passing (280 before). New: `goals.test.ts`,
  `limiters.test.ts`, `wall.test.ts` (wall focus and season), `coach.test.ts`;
  the session-edit, reserve, custom and routines tests rewritten or extended
  for the soft finger rules.
- `npm run check:daily`, `npm run check:cave`
- `npm run build`
- `npm run test:e2e`: 10 passing (two new: ON THE WALL and a tagged climb;
  THE COACH, THE GOAL with EDIT GOALS, WHERE YOU FALL).

Checked by screenshot at 390 px: TODAY, the session page, STATS (all tabs),
the climb log with tags.

**Not verified:** a real review from the API. There was no API key in the
cloud session. A call with a bad key reached the API and came back as "The
API key was refused", so the request goes out and errors are worded; the
first real ASK THE COACH is the test of the request itself.

## 4. Repo state

Branch `claude/app-improvement-brainstorm-7n2j0c`, from `main` at the v37
merge (`3d99cf0`), with one PR to `main`.

## 5. Open items

- **ASK THE COACH** needs one real run with a key (see 3).
- The grade tables for the pull-up and the front lever are approximate and
  say so; the finger table is Lattice's.
- The milestone estimates are broad on purpose until the log shows a grade
  gained. Gym colours count as the bottom of their band, so a red send moves
  the working grade to 7A+, never to 7B+.
- WHERE YOU FALL needs 8 tagged climbs before it names a style; until then the
  wall focus rotates the footwork drills.
- Inputs not yet checked for the iOS zoom: BUILD's preset name, the routine
  name, the activity log.
- Carried from v35-v37: CAVE 01 STRONG runs 84 min at NORMAL at levels 6-7;
  HEAL 01 is at 89 of 90 at FRESH; the press scale and the sticky START on
  the phone; FINGER LOAD and RING FINGER have no headlines; undoing FINISH NOW
  leaves a Health workout behind; reminders do not read the weekly plan.

## 6. Next steps

- Log the next few bouldering sessions with + STYLE on the hard climbs and
  the 110% mark: WHERE YOU FALL and the wall focus get better with each one.
- Set a trip in EDIT GOALS if there is one: the season plans back from it.
- Save an API key in Settings and run ASK THE COACH once a week.

## 7. Mac clean update

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
grep -rl "I GAVE ONE GO 110%" out/_next/static | head -1
npx cap sync ios
grep -rl "I GAVE ONE GO 110%" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v38 PR.
- Both `grep` lines print a file name.
- In Xcode, press Shift+Cmd+K, then Cmd+R.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/app-improvement-brainstorm-7n2j0c
git fetch origin --prune
git branch -a
```
