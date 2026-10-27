'use client';

import { useMemo, useState } from 'react';
import {
  getInsights, getOverview, getWorkSplit, PERIOD_DAYS, WORK_AREA_LABEL,
  type InsightInput, type PeriodStats,
} from '@/core/review';
import type { ActivitySession } from '@/core/activity';
import type { ClimbSession, SessionLogEntry } from '@/core/types';
import Led from './Led';
import styles from './StatsOverview.module.css';

/** What stands out: how many lead before MORE. */
const INSIGHTS_SHOWN = 3;

const hours = (min: number) => (min >= 600 ? String(Math.round(min / 60)) : (Math.round(min / 6) / 10).toFixed(1));

/**
 * A change against the four weeks before. Colour says good or bad, never up
 * or down: more training days is good, a change in effort is neither. Only a
 * drop of 15% or more is marked: one day fewer of 23 is noise, not news.
 */
function Delta({ now, before, unit = '', neutral = false }: { now: number | null; before: number | null; unit?: string; neutral?: boolean }) {
  if (now === null || before === null || !before) return <span className={styles.deltaNone}>no earlier data</span>;
  const d = Math.round((now - before) * 10) / 10;
  if (d === 0) return <span className={styles.deltaNone}>same as before</span>;
  const material = Math.abs(now - before) / before >= 0.15;
  const cls = neutral ? styles.deltaNeutral : d > 0 ? styles.deltaUp : material ? styles.deltaDown : styles.deltaNone;
  return <span className={cls}>{d > 0 ? '+' : ''}{d}{unit} vs prior</span>;
}

function Tile({ label, value, unit, children }: { label: string; value: string; unit?: string; children?: React.ReactNode }) {
  return (
    <div className={styles.tile}>
      <span className={styles.tileLabel}>{label}</span>
      <span className={styles.tileValue}>
        {value ? <Led text={value} dot={5} animate /> : <span className={styles.tileDash}>-</span>}
        {unit && <small>{unit}</small>}
      </span>
      {children}
    </div>
  );
}

/**
 * The top of STATS: the last four weeks in four numbers, each against the four
 * weeks before, the level, and what stands out in the logs.
 */
export function OverviewCard({ level, sessionLog, climbLog, activityLog, insightInput }: {
  level: number;
  sessionLog: SessionLogEntry[];
  climbLog: ClimbSession[];
  activityLog: ActivitySession[];
  insightInput: InsightInput;
}) {
  const ov = useMemo(() => getOverview(sessionLog, climbLog, activityLog), [sessionLog, climbLog, activityLog]);
  const insights = useMemo(() => getInsights(insightInput), [insightInput]);
  // The first three lead; the rest wait one tap away.
  const [allInsights, setAllInsights] = useState(false);
  const shown = allInsights ? insights : insights.slice(0, INSIGHTS_SHOWN);
  const c: PeriodStats = ov.current;
  const p: PeriodStats = ov.previous;
  return (
    <>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span>LAST {PERIOD_DAYS} DAYS</span>
          <span className={styles.level}>LEVEL {String(level).padStart(2, '0')}</span>
        </div>
        <div className={styles.tiles}>
          <Tile label="TRAINING DAYS" value={String(c.trainingDays)} unit={`${ov.daysPerWeek}/wk`}>
            <Delta now={c.trainingDays} before={p.trainingDays} />
          </Tile>
          <Tile label="HOURS" value={hours(c.minutes)} unit="h">
            <span className={styles.deltaNone}>{c.sessions} sessions{c.climbs ? ` · ${c.climbs} climbs` : ''}</span>
            <Delta now={Math.round(c.minutes / 6) / 10} before={Math.round(p.minutes / 6) / 10} unit="h" />
          </Tile>
          <Tile label="SETS DONE" value={c.completion === null ? '' : `${c.completion}%`} unit={c.completion === null ? 'none planned' : `${c.setsDone} sets`}>
            <span className={styles.deltaNone}>of the sets planned</span>
          </Tile>
          <Tile label="EFFORT" value={c.effort === null ? '' : String(c.effort)} unit={c.effort === null ? 'not rated' : '/10'}>
            <Delta now={c.effort} before={p.effort} neutral />
          </Tile>
        </div>
      </div>

      {insights.length > 0 && (
        <div className={`${styles.insights} dot-rule`}>
          <div className={styles.insightsTitle}>WHAT STANDS OUT</div>
          {shown.map(i => (
            <div key={i.text} className={`${styles.insight} ${styles[i.tone]}`}>
              <span className={styles.mark} aria-hidden="true" />
              <span>{i.text}</span>
            </div>
          ))}
          {insights.length > INSIGHTS_SHOWN && (
            <button className={styles.more} onClick={() => setAllInsights(a => !a)}>
              {allInsights ? 'SHOW FEWER' : `${insights.length - INSIGHTS_SHOWN} MORE`}
            </button>
          )}
        </div>
      )}
    </>
  );
}

/** Working sets by area over the last four weeks, with the four weeks before as a ghost bar. */
export function WorkSplitSection({ sessionLog }: { sessionLog: SessionLogEntry[] }) {
  const split = useMemo(() => getWorkSplit(sessionLog), [sessionLog]);
  const total = split.reduce((a, s) => a + s.sets, 0);
  if (!total) return <div className={styles.empty}>Working sets appear here once sessions are logged with sets.</div>;
  const max = Math.max(...split.map(s => Math.max(s.sets, s.previousSets)), 1);
  const prevTotal = split.reduce((a, s) => a + s.previousSets, 0);
  return (
    <div className={styles.split}>
      {split.filter(s => s.sets || s.previousSets).map(s => (
        <div key={s.area} className={styles.splitRow}>
          <span className={styles.splitLabel}>{WORK_AREA_LABEL[s.area]}</span>
          <span className={styles.splitTrack}>
            {prevTotal > 0 && <span className={styles.splitPrev} style={{ width: `${(s.previousSets / max) * 100}%` }} />}
            <span className={styles.splitFill} style={{ width: `${(s.sets / max) * 100}%` }} />
          </span>
          <span className={styles.splitValue}>{s.sets}<small> {s.share}%</small></span>
        </div>
      ))}
      <div className={styles.hint}>
        {total} working sets in the last {PERIOD_DAYS} days{prevTotal ? `, ${prevTotal} the ${PERIOD_DAYS} before (light bar)` : ''}, by what each exercise trains first. Warm-ups and tests are left out.
      </div>
    </div>
  );
}
