'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import {
  BASE_MONTHS, etaLabel, goalLadder, rank, scaleOf, workingGrade,
  type Discipline, type GoalLadder, type Goals,
} from '@/core/goals';
import { boulderGap, type GapRow } from '@/core/gap';
import styles from './GoalSection.module.css';

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * One discipline's ladder: the working grade lit, one dot per grade to the
 * final goal, the next goal in orange with its estimate under it.
 */
function Ladder({ l }: { l: GoalLadder }) {
  const rungs = [{ grade: l.working, months: 0, eta: '', isNext: false, isFinal: false, here: true }, ...l.milestones.map(m => ({ ...m, here: false }))];
  const next = l.milestones.find(m => m.isNext) ?? l.milestones[0];
  return (
    <div className={styles.ladder}>
      <div className={styles.ladderHead}>
        <span className={styles.discipline}>{l.discipline === 'BOULDER' ? 'Boulder' : 'Sport'}</span>
        <span className={styles.now}>
          now <b>{l.working}</b>{l.from === 'profile' ? ' (profile)' : ' (from your sends)'}
        </span>
      </div>
      <ol className={styles.rail} aria-label={`${l.discipline} grades from ${l.working} to ${l.final}`}>
        {rungs.map(r => (
          <li key={r.grade} className={styles.rung}>
            <span className={`${styles.dot}${r.here ? ` ${styles.dotHere}` : ''}${r.isNext ? ` ${styles.dotNext}` : ''}${r.isFinal ? ` ${styles.dotFinal}` : ''}`} />
            <span className={`${styles.grade}${r.isNext ? ` ${styles.gradeNext}` : ''}`}>{r.grade}</span>
          </li>
        ))}
      </ol>
      {next ? (
        <p className={styles.eta}>
          {l.nextReached ? `${l.next} reached. ` : ''}
          Next goal <b>{next.grade}</b> around {etaLabel(next.eta)}
          {l.milestones.at(-1)?.isFinal && l.milestones.at(-1) !== next ? `, ${l.final} around ${etaLabel(l.milestones.at(-1)!.eta)}` : ''}.
        </p>
      ) : <p className={styles.eta}>{l.final} reached. Set the next goal.</p>}
    </div>
  );
}

function GapLine({ r, next }: { r: GapRow; next: string }) {
  if (r.status === 'untested') {
    return (
      <div className={styles.gapRow}>
        <div className={styles.gapHead}><span className={styles.gapName}>{r.name}</span><span className={styles.gapDash} aria-label="not tested" /></div>
        <div className={styles.gapFoot}>Not tested yet. TEST 01 ASSESS has it.</div>
      </div>
    );
  }
  const values = [r.value ?? 0, r.now ?? 0, r.next ?? 0, r.final ?? 0];
  const lo = Math.min(...values) * 0.9;
  const hi = Math.max(...values) * 1.04;
  const pct = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
  const verdict = r.status === 'goal' ? 'At the final goal\'s standard'
    : r.status === 'next' ? `Ready for ${next}`
    : r.addKg ? `${fmt(r.addKg)} kg on the belt short of ${next}`
    : `Short of ${next} (${fmt(r.next ?? 0)})`;
  return (
    <div className={styles.gapRow}>
      <div className={styles.gapHead}>
        <span className={styles.gapName}>{r.name}</span>
        <span className={styles.gapValue}>{fmt(r.value ?? 0)}<small> {r.short}</small></span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span className={r.status === 'short' ? styles.fillShort : styles.fill} style={{ width: pct(r.value ?? 0) }} />
        {r.now !== null && <span className={styles.tick} style={{ left: pct(r.now) }} />}
        {r.next !== null && <span className={styles.tickNext} style={{ left: pct(r.next) }} />}
        {r.final !== null && <span className={styles.tick} style={{ left: pct(r.final) }} />}
      </div>
      <div className={styles.gapFoot}>
        <span className={r.status === 'short' ? styles.short : undefined}>{verdict}</span>
        <span>{r.now !== null ? `now ${fmt(r.now)}` : ''}{r.next !== null ? ` · ${next} ${fmt(r.next)}` : ''}{r.final !== null ? ` · ${fmt(r.final)}` : ''}</span>
      </div>
      {r.approximate && <div className={styles.source}>{r.source}</div>}
    </div>
  );
}

/** Chips for the grades above the working grade, to pick a goal. */
function GradeChips({ d, from, value, onPick, label }: { d: Discipline; from: string; value: string; onPick: (g: string) => void; label: string }) {
  const scale = scaleOf(d);
  const options = scale.slice(rank(d, from) + 1, rank(d, from) + 9);
  return (
    <div className={styles.chips} role="radiogroup" aria-label={label}>
      {options.map(g => (
        <button key={g} role="radio" aria-checked={g === value} className={`${styles.chip}${g === value ? ` ${styles.chipOn}` : ''}`} onClick={() => onPick(g)}>{g}</button>
      ))}
    </div>
  );
}

function GoalEditor({ goals, working, onSave, onClose }: {
  goals: Goals; working: Record<Discipline, string>; onSave: (g: Goals) => void; onClose: () => void;
}) {
  const [g, setG] = useState<Goals>(goals);
  const set = (d: 'boulder' | 'sport', key: 'next' | 'final', v: string) => {
    const disc: Discipline = d === 'boulder' ? 'BOULDER' : 'SPORT';
    const cur = { ...g[d], [key]: v };
    // The final goal is never below the next one.
    if (rank(disc, cur.final) < rank(disc, cur.next)) cur.final = cur.next;
    setG({ ...g, [d]: cur });
  };
  return (
    <div className={styles.editor}>
      {(['boulder', 'sport'] as const).map(d => {
        const disc: Discipline = d === 'boulder' ? 'BOULDER' : 'SPORT';
        return (
          <div key={d} className={styles.editGroup}>
            <div className={styles.editLabel}>{d === 'boulder' ? 'Boulder' : 'Sport'}: next goal</div>
            <GradeChips d={disc} from={working[disc]} value={g[d].next} onPick={v => set(d, 'next', v)} label={`${d} next goal`} />
            <div className={styles.editLabel}>then</div>
            <GradeChips d={disc} from={working[disc]} value={g[d].final} onPick={v => set(d, 'final', v)} label={`${d} final goal`} />
          </div>
        );
      })}
      <div className={styles.editGroup}>
        <div className={styles.editLabel}>A trip or season to peak for (optional)</div>
        <div className={styles.eventRow}>
          <input
            type="date"
            className={styles.input}
            value={g.event?.date ?? ''}
            aria-label="Trip date"
            onChange={e => setG({ ...g, event: e.target.value ? { date: e.target.value, label: g.event?.label ?? '' } : undefined })}
          />
          <input
            type="text"
            className={styles.input}
            placeholder="Fontainebleau"
            value={g.event?.label ?? ''}
            aria-label="Trip name"
            disabled={!g.event}
            onChange={e => g.event && setG({ ...g, event: { ...g.event, label: e.target.value } })}
          />
        </div>
        <div className={styles.hint}>The season plans back from it: strength, then power, then a taper the week before.</div>
      </div>
      <div className={styles.editActions}>
        <button className={styles.save} onClick={() => { onSave(g); onClose(); }}>SAVE GOALS</button>
        <button className={styles.cancel} onClick={onClose}>CANCEL</button>
      </div>
    </div>
  );
}

/**
 * THE GOAL, on top of STATS PROGRESS: where each discipline stands, the grades
 * to the goal with an estimate, and whether the body is ready for the next
 * one. The headline answers the one question: what stands in the way?
 */
export default function GoalSection() {
  const climbLog = useStore(s => s.climbLog);
  const results = useStore(s => s.benchmarkResults);
  const goals = useStore(s => s.settings.goals);
  const setGoals = useStore(s => s.setGoals);
  const [editing, setEditing] = useState(false);

  const b = useMemo(() => goalLadder(goals, climbLog, 'BOULDER'), [goals, climbLog]);
  const s = useMemo(() => goalLadder(goals, climbLog, 'SPORT'), [goals, climbLog]);
  const gap = useMemo(() => boulderGap(goals, b.working, results), [goals, b.working, results]);
  const working = { BOULDER: workingGrade(climbLog, 'BOULDER'), SPORT: workingGrade(climbLog, 'SPORT') };

  if (editing) return <GoalEditor goals={goals} working={working} onSave={setGoals} onClose={() => setEditing(false)} />;

  return (
    <div className={styles.wrap}>
      <Ladder l={b} />
      <Ladder l={s} />
      {goals.event && <p className={styles.event}>Peaking for <b>{goals.event.label}</b> on {goals.event.date}.</p>}

      <div className={styles.gap}>
        <div className={styles.gapTitle}>What {gap.next} asks of the body</div>
        <p className={styles.gapLead}>{gap.headline}</p>
        {gap.rows.map(r => <GapLine key={r.benchmarkId} r={r} next={gap.next} />)}
        <div className={styles.legend}>
          <span><i className={styles.legendTick} /> now and final goal</span>
          <span><i className={styles.legendNext} /> next goal</span>
        </div>
      </div>

      <p className={styles.hint}>
        {b.rate === 'yours'
          ? `Estimates use your own rate: about ${fmt(b.monthsPerStep)} months a grade on boulders.`
          : `Estimates use a typical ${BASE_MONTHS.BOULDER} months a grade on boulders and ${BASE_MONTHS.SPORT} on routes, slower above 7B+. Your own rate takes over once your sends show a grade gained.`}
      </p>
      <button className={styles.editBtn} onClick={() => setEditing(true)}>EDIT GOALS</button>
    </div>
  );
}
