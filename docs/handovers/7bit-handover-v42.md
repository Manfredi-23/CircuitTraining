# 7BIT — Handover v42

**Date:** 1 November 2026
**Read this first**, then `docs/7bit-proposal-v42.md` (this session's
deliverable), then v41. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

A review and a research session, **no app code changed**. The athlete asked
for:

1. Ways to structure the app so it is easier to use and explains more: where
   they are in a session, how much is left, changing it on the go; and,
   before choosing, what they trained, what is due, what is too much.
2. Thorough research on off-wall exercises that make a better climber,
   especially technique, footwork and climbing with the legs.

Both are answered in **`docs/7bit-proposal-v42.md`**:

- **Part one** (eight proposals, P1-P8): BODY THIS WEEK on TODAY (sets per
  area against a band, DUE / ON TRACK / ENOUGH / TOO MUCH, a tap to TRAIN
  THIS); what a session adds to the week; phases (PREP, SKILL, STRENGTH,
  POWER, CORE, CARE) derived from block and protocol instead of engine block
  names; minutes left, a finish time and the cost of an addition; a session
  map with DO LATER and reorder; choice slots; a `transfer` tag (the move on
  the wall each exercise serves); a `score` load kind for footwork drills,
  the technique note and TEST 02 FEET.
- **Part two**: the research (Draper 2009: the foot-loading test, a high
  foot plus a weight shift, correlates best with grade, r = 0.65; Augsburg
  2023; Quaine and Martin; motor learning from Seifert's group, Hörst, Wulf,
  Gresham), and a catalogue of about twenty exercises by move (precise feet,
  foot strength, toe hooks, heel hooks, high steps, drop knees, flagging,
  leg power). Each is marked HAVE, VARIANT or NEW. All the new ones keep the
  hands free or flat, so they work while the finger heals.
- **Part three**: a FEET area, FEET and HOOKS packs, DAILY 07 HOOKS + HIGH
  FEET, a SKILL phase in CAVE 03, TEST 02 FEET, links from WHERE YOU FALL,
  an order of work, and six questions for the athlete.

The session's network blocked opening most coaching sites directly (Hooper's
Beta, Lattice, The Climbing Doctor, UKC, Climbing.com); their content came
from search excerpts and is cited as such.

## 2. What changed

- New: `docs/7bit-proposal-v42.md`, `docs/handovers/7bit-handover-v42.md`.
- `CLAUDE.md`: the Handoff Documents list points here and names the proposal.

## 3. Verified

Documentation only; the build is unchanged since v41. CI on the PR.

## 4. Repo state

Branch `claude/upbeat-darwin-v0cnex` from `main` at the v41 merge
(`c5f59bb`), one PR into `main`. `claude/busy-gauss-xg88dk` (v41, merged) is
still on the remote: deleted in the housekeeping below.

## 5. Open items

- **The athlete's answers to the six questions** in section 10 of the
  proposal, and which step of its section 8 comes first.
- Carried from v41: the "(right)" label on the left ring finger loads in
  `coachSummary`; the e2e seed's old back extension name; the 24-25 October
  climbing entries to check; the rehab frequency; a BACK section in STATS;
  BUILD's extra sets on deload and TIRED days; grade tables approximate;
  input zoom checks; CAVE 01 at 84 min at levels 6-7; HEAL 01 at 89 of 90
  FRESH; undoing FINISH NOW leaves a Health workout; reminders do not read
  the weekly plan.

## 6. Next steps

- Read the proposal; answer section 10.
- The proposal's recommended first step: minutes left, finish time and the
  cost of an addition on the workout card, and phases on the session page.
  The second: the new exercises with the FEET and HOOKS packs, which also
  work during HEAL.

## 7. Mac clean update

The app did not change, so the marker is v41's.

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
grep -rl "Floor Back Extension, Heels Anchored" out/_next/static | head -1
npx cap sync ios
grep -rl "Floor Back Extension, Heels Anchored" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v42 PR (the proposal).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. Nothing in the app looks different.

## 8. Mac housekeeping (only after the merge, never before)

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/busy-gauss-xg88dk
git push origin --delete claude/upbeat-darwin-v0cnex
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`
(skip a delete line that says the branch does not exist).
