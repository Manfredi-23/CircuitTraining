# 7BIT — Handover v21

**Date:** 8 October 2026
**Read this first**, then v20 (ring finger rehab) and v19 (the HEAL tab).
Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

Second request of the day, after v20 merged (PR #33). Footwork is the
athlete's weak spot, and the break from hard pulling is the time to work on
it: drills on the gym's easy slabs, feet only. On a gym day: finger rehab,
then the foot drills, then HEAL 01 or 02.

Answers to the questions asked first:
- After the drills, the **full** HEAL 01 or 02 (not a cut-down version).
- Flat palms on the wall for balance are fine; nothing gripped.

## 2. What changed

- **HEAL 05 FOOTWORK** (`heal-05`, 28 min at every level and energy,
  `recoveryHours: 0`): feet, ankles + hips warm-up (barefoot first), then
  - Silent Feet 2 x 90s: up and back down, no foot makes a sound.
  - Sticky Feet 2 x 90s: a placed foot may not move or readjust.
  - Inside, Outside, Tip, Smear 2 x 45s per foot on one low foothold.
  - No-Hands Slab 3 x 60s: two or three moves up and down, hands behind the back.
  - Foothold Balance 2 x 20s per foot, hands off.
  Every drill is `fixed` (energy does not change it), bodyweight, `legs` +
  `tension`, with level variations (smaller holds, steeper slab, eyes closed).
  Nothing loads a finger, so there is no pain check.
- New protocol `footwork` in `protocols.ts` with the reasoning (one rule per
  drill, easy terrain, done fresh) and sources.
- **Recommender, gym day** (every other day while healing): the ring rehab
  first if due (the right-hand test once, before the first), then FOOTWORK,
  then 01 or 02. Footwork only comes up on gym days. Ids live in
  `data-heal.ts`: `HEAL_GYM_IDS`, `RING_REHAB_ID`, `RING_TEST_ID`, `FOOTWORK_ID`.
- `heal.test.ts`: five HEAL sessions, the gym-day order, footwork free of
  finger work and inside 15-30 minutes.

A gym day is now about 13 + 28 + 60-70 minutes: roughly 1h45 to 2h.

## 3. Verified

`npx tsc --noEmit`, `npm test` (105 passing), `npm run check:daily`,
`npm run check:cave`, `npm run build`. In the browser at 390 x 844, with the
rehab done earlier the same gym day, the home screen opens on FOOTWORK
("Gym day: footwork while fresh.").

## 4. Repo state

Branches `claude/heal-ring-finger-rehab` and `claude/heal-footwork` merged
(PRs #33, #34) and deleted. PR #35 (docs only: the Mac folder and the clean
update block) merged; its branch `claude/mac-commands-fix` is deleted from the
Mac (section 7). Then `main` is the only branch, no open PRs.

## 5. Open items

1. FOOTWORK reuses `squats.svg`; a slab-and-feet illustration belongs to the
   graphics rework.
2. Footwork earns `legs` and `tension` XP, which moves those variations a
   little. If that feels wrong, give it `mobility` only.
3. Everything open in v20 section 5 still stands (confirm the right-hand test
   method and pain limit with the physio).

## 6. Mac clean update

Paste the whole block in Terminal. It stashes any local edits, pulls, deletes
merged local branches, rebuilds from scratch and checks that the new session
reached the iOS build.

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
grep -rl "FOOTWORK" out/_next/static | head -1
npx cap sync ios
grep -rl "FOOTWORK" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of PR #35 (docs: Mac commands).
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. If the phone still shows the old app,
  delete it from the phone and run again. HEAL shows 01 to 05.
- If `git pull` still refuses, `git status` names the file; send it over.

## 7. Mac housekeeping

The cloud session cannot delete branches (the git proxy refuses), so delete
the merged one from the Mac:

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/mac-commands-fix
git fetch origin --prune
git branch -a
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
Your Mac edits to `CLAUDE.md` from before are kept in `git stash list`
(look with `git stash show -p`, delete with `git stash drop`).

## 8. Why the phone showed only HEAL 01 and 02 (8 October)

The Mac had a local edit to `CLAUDE.md`, so `git pull` aborted and the build
ran on the old code, 4 commits behind. The folder in the old commands was
also wrong (05 instead of 04), and inline `#` comments broke lines in zsh.
The block above fixes all three, and CLAUDE.md now requires it in every
handover and every message that changes the app.
