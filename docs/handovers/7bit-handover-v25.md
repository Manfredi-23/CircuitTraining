# 7BIT — Handover v25

**Date:** 19 October 2026
**Read this first**, then v24 (BUILD as first shipped).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

v24 shipped BUILD A SESSION, and the athlete tested it on the phone ("YES! i
like!"). Then: presets, time slots up to 90 minutes, labels such as pull
power, push power, chest or balance that combine into one session, and
"negative keywords" for what to leave out. Decisions taken with the athlete:
goals sit alongside the areas; the gym has dumbbells and rings / TRX; chest
work earns no XP; all four suggested presets ship built in.

## 2. What changed

- **PRESETS** at the top of BUILD: PULL DAY (CAVE, 1H, pull power +
  shoulders), PUSH + CHEST (CAVE, 45), LEGS + BALANCE (CAVE, 45), QUICK HOME
  (HOME, 15, mobility + shoulders, no core). SAVE AS PRESET stores your own
  (name editable, persisted as `buildPresets`, in backups); DELETE removes it.
- **TIME**: 15 / 30 / 45 / 1H / 1H30.
- **GOALS** row: PULL POWER (weighted pull-up first, the one-arm path with
  its gates, lock-offs; gym only), PUSH POWER (explosive push-up, ring dip,
  weighted push-up, pike push-up), CHEST (dumbbell floor press, ring push-up,
  feet-up push-up, ring fly, close-hand push-up), BALANCE (single-leg
  balance and star reach at home; foothold balance, silent feet, sticky feet
  at the gym).
- **In / out / off** on every goal and area: tap once in, twice out (shown
  struck through, "NO CORE"), three times off. Out removes everything that
  touches it, wherever it came from.
- **AVOID**: NO JUMPING, NO GRIP, NO FLOOR.
- **Warnings**: a due area tapped out ("CORE is behind ... Left out today."),
  and an hour or more of power after a logged climb.
- Eight new exercises in `data-extras.ts` (`GOAL_EXERCISES`), all with form
  guide, progression and protocol, no XP; a new `upper-power` protocol.
- Reserve entries gained `floor` / `jump` flags; `reserveEntry()` exported.
- Tests: `custom.test.ts` now 22 (goals, gates, exclusions, avoid, 90
  minutes, presets, warnings, healing, preset store).

## 3. Verified

`npx tsc --noEmit`, `npm test` (170 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844: PULL DAY
fills CAVE / 1H / PULL POWER + SHOULDERS; CORE tapped twice shows NO CORE and
the "behind" warning; CHEST + NO JUMPING + 1H30 builds 88 minutes; SAVE AS
PRESET adds the chip and DELETE; START runs it titled with the preset name;
no console errors. Screenshots: `docs/screenshots/build-preset.png`,
`build-goals.png`.

## 4. Repo state

`claude/custom-builder` deleted from the Mac (v24 housekeeping done). This
session: branch `claude/build-presets`, PR to `main`, merged when both checks
are green. Delete the branch from the Mac (section 7).

## 5. Open items

1. Goal exercises earn no XP and so do not move the "not trained enough"
   suggestion; chest and push power have no capacity to fall behind on.
2. A saved preset cannot be renamed; save a new one and delete the old.
3. Carried: suggestion thresholds a first guess; Apple Health hikes not
   imported; sore-legs thresholds a first guess; the on-device language model
   (presets and goals are more actions it could call).

## 6. Mac clean update

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
grep -rl "NO JUMPING" out/_next/static | head -1
npx cap sync ios
grep -rl "NO JUMPING" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the build presets PR.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. BUILD A SESSION opens with PRESETS at
  the top and GOALS above AREAS.

## 7. Mac housekeeping

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/build-presets
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
