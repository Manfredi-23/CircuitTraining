# 7BIT — Handover v49

**Date:** 26 November 2026
**Read this first**, then `docs/v2/7bit-v2-plan.md` (the v2 plan, a living
document), then v48. Working agreements unchanged (`CLAUDE.md`).

---

## 1. What this session was

Planning only. **No app code changed.**

1. **23 November.** The athlete said the app is overstacked and asked for a
   full read and a proposal to streamline it. I read all of v1, built it with
   the seed history and screenshotted every screen. The answer was a printed
   review, **R1**, delivered as an A4 PDF for comments:
   `docs/v2/7bit-v2-review-R1.pdf` (19 pages). It covers what v1 is (A1-A3),
   why it feels heavy (B1-B8), a proposal (C1-C8, P1-P6), every feature with
   keep / simplify / cut (F01-F76), questions (Q01-Q40) and sketches (S1-S4).
2. **26 November.** The athlete described how they want to use the app:
   build their own session with **sliders for the mix** (e.g. legs 60, core
   30, shoulders 10), a **time**, an exercise list they can **swap, remove
   and replace**, **suggestions from what they usually do**, and **how they
   feel today** (a sore elbow takes out what loads it). They asked to log
   it and plan the redesign before building anything.
3. **26 November, later.** The athlete wants the look redesigned too: they
   like the concept but not the execution. Before anything else they asked
   for an in-depth search for Claude design skills. Done. The findings are
   in plan section 8.
4. **28 November.** The athlete wants sessions of up to 2 hours, and a
   control for the balance between volume and power, backed by evidence
   rather than guesswork. Done. The literature review is in plan section 9.

## 2. What changed

- **New: `docs/v2/7bit-v2-plan.md`**, the v2 plan:
  - the input log (I1, I2), entries added and never rewritten
  - decisions D01-D10 with a status each
  - the builder design draft: the flow, one tag set per exercise including
    **joint loads**, the rules that turn a mix into a list, a worked example
    timed by v1's engine (GYM, 60 min, LEGS 60 · CORE 30 · SHOULDERS 10:
    57.7 min), the same session with a sore elbow, suggestions, editing
  - what v1 already has, questions V01-V22, planning steps P0-P5, and where
    I2 overrules R1
- **New: `docs/v2/7bit-v2-review-R1.pdf`**, the printed review.
- **Plan, second update (I3)**:
  - input I3 (redesign the look, keep the concept)
  - decisions D11 and D12
  - questions V23-V26 on the look and the skills
  - step P2b: install the skills, capture the brand in DESIGN.md, critique
    every screen
  - **section 8, the design-skills research**: nine candidates with stars,
    licence and last push from GitHub search on 26 November, and a verdict
    each. Recommended: Impeccable, Emil Kowalski's skills, the
    `dickwu/apple-design-skill` HIG reviewer. Skipped: UI UX Pro Max, Taste
    v2 and Anthropic frontend-design. The last one names monospace labels and
    cream backgrounds as signs of generated UI, which is 7Bit's identity.
- **Plan, third update (I4)**:
  - input I4 (long sessions, the power-volume balance)
  - decisions D13 (up to 120 min, built in blocks: WARM-UP, QUALITY,
    VOLUME, EASY, COOL-DOWN) and D14 (a VOLUME / POWER dial inside caps
    set by the evidence)
  - questions V27-V32
  - **section 9**: twelve rules (R1-R12), each graded STRONG, MODERATE,
    WEAK, PRACTICE or DERIVED, with sources; the block design; minute
    splits at 120 min; the honest limits. Most of the evidence comes from
    meta-analyses on general resistance training, not climbers. The
    per-session volume ceilings come from a preprint, and finger-training
    order is coaching consensus only.
- `CLAUDE.md`: the Handoff Documents list points here.

One correction from the review: CLAUDE.md is **1,483 lines**, not the
"about 900" said in chat on 23 November. R1 has the right figure.

## 3. Verified

- Nothing to verify in the app: no source, data or test changed.
- The plan's minutes come from `exerciseSeconds` / `estimateDuration` at
  level 1, NORMAL, run on 26 November against `main` at `89a3e39`.

## 4. Repo state

Branch `claude/fervent-pascal-41gtrv`. Docs only.

- First change: PR #67, merged into `main` as `a097631`, both Vercel checks
  green.
- Second change (I3, design skills): PR #68, merged as `bdac06f`, both
  checks green.
- Third change (I4, long sessions): the same branch, restarted from
  `bdac06f`. Its PR state is in the session's last message.

## 5. Open items

- **R1 comments**: the athlete is reading the printed review. Their notes
  come back by photo or as "ID: answer" lines.
- **V01-V22** in the plan: the builder questions. P1 (the exercise sheet)
  can start once V01, V11, V12 and V14 are answered.
- **D08** (the builder becomes the core; R1's cut of BUILD reversed) and
  **D10** (one tag set per exercise) are PROPOSED, waiting for an OK.
- **The look**: V23-V26. Which parts of the execution bother the athlete,
  which skills to install, and how (repo, Mac or claude.ai plugins). Nothing
  is installed yet.
- **Long sessions**: V27-V32. One dial or one per area, the longest
  session, a dial suggested from the week, what fills the EASY block, a
  fuel reminder, how many long sessions a week. R12 and the minute splits
  are derived rules, to be tested on the logs.
- **No real data yet**: R1 Q01 asks for a backup export. The suggestion
  design (plan 3.5) depends on what the real logs look like.
- Carried from v48: the lift-over is a read of two frames; the WAKE UP note
  says "nothing on the floor" while the 90/90 and the lift-over sit on it.

## 6. Next steps

1. The athlete answers R1 (at least Q01-Q08) and V01-V22.
2. Fill section 2 of the plan from the answers.
3. P1: the exercise sheet, every exercise with areas, pattern, role, joint
   loads, kit and flags, for the athlete to correct.
4. P2b, beside P1-P2: install the agreed design skills, capture the current
   brand in DESIGN.md, critique every v1 screen at phone size.
5. P2-P4: builder rules with worked examples, screen flows and R2 sketches,
   data migration. Building only after that. The builder rules (P2) now
   include section 9's blocks and the dial. Worked examples should include
   a 120-minute POWER session and a 120-minute VOLUME session.

## 7. Mac clean update

The app did not change, so the marker is v48's.

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
grep -rl "SEATED OR STANDING" out/_next/static | head -1
npx cap sync ios
grep -rl "SEATED OR STANDING" ios/App/App/public/_next/static | head -1
npx cap open ios
```

- `git log -1` shows the merge of the v49 PR (the v2 plan), once merged.
- Both `grep` lines print a file name.
- In Xcode: Shift+Cmd+K, then Cmd+R. The app is the same as v48.

## 8. Mac housekeeping

Two merged branches from v47 and v48 are still on the remote (the cloud git
proxy refuses deletes):

```bash
cd ~/Desktop/Manfredi/04_Bit-apps/CircuitTraining
git push origin --delete claude/v47-week-structure
git push origin --delete claude/dreamy-fermat-0eqaxf
git fetch origin --prune
git branch -a
```

After the v49 PR is merged, also:

```bash
git push origin --delete claude/fervent-pascal-41gtrv
```

`git branch -a` should then list only `main` and `remotes/origin/main`.
