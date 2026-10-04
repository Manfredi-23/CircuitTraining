'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { CONFIG } from '@/core/config';
import { gradeLabel, gradesOf, viewScale, type ClimbView } from '@/core/climbing';
import {
  CORE_TARGETS, getBenchmarkRows, getBodyweight, getClimbVsPull, getCoreVolume,
  getLiftSeries, getTrunkRatios, getWeekStrip, primaryClimbView, type CoreGroup, type DayKind,
} from '@/core/insights';
import type {
  BenchmarkResult, CapacityListItem, ClimbSession, LoadLogEntry, SessionLogEntry,
} from '@/core/types';
import styles from './StatsSections.module.css';

const fmtDate = (iso: string) => {
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en', { month: 'short' }).toUpperCase()}`;
};
const fmtNum = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

// ---- Week strip ------------------------------------------------------------------

const KIND_CLASS: Record<DayKind, string> = {
  CLIMB: styles.dayClimb, CAVE: styles.dayCave, TEST: styles.dayTest, DAILY: styles.dayDaily,
};

export function WeekStripSection({ sessionLog, climbLog }: { sessionLog: SessionLogEntry[]; climbLog: ClimbSession[] }) {
  const strip = useMemo(() => getWeekStrip(sessionLog, climbLog), [sessionLog, climbLog]);
  const t = strip.thisWeek;
  return (
    <div className={styles.block}>
      <div className={styles.strip} role="img" aria-label="Training days, last 12 weeks">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={`l${i}`} className={styles.stripLabel} style={{ gridRow: i + 1, gridColumn: 1 }}>{d}</span>
        ))}
        {strip.weeks.map((w, wi) => w.days.map((day, di) => (
          <span
            key={day.date}
            title={`${day.date}${day.kind ? ` ${day.kind}` : ''}`}
            className={`${styles.day} ${day.kind ? KIND_CLASS[day.kind] : ''} ${day.future ? styles.dayFuture : ''}`}
            style={{ gridRow: di + 1, gridColumn: wi + 2 }}
          />
        )))}
      </div>
      <div className={styles.legend}>
        <span><i className={styles.dayClimb} />climb</span>
        <span><i className={styles.dayCave} />cave</span>
        <span><i className={styles.dayDaily} />daily</span>
        <span><i className={styles.dayTest} />test</span>
      </div>
      <div className={styles.summary}>
        This week: <b>{t.DAILY}</b> daily, <b>{t.CAVE}</b> cave, <b>{t.CLIMB}</b> climbing
        {t.TEST > 0 && <>, <b>{t.TEST}</b> test</>}
      </div>
    </div>
  );
}

// ---- Core volume -------------------------------------------------------------------

const CORE_LABEL: Record<CoreGroup, string> = { abs: 'Abs', obliques: 'Obliques', back: 'Lower back' };

export function CoreVolumeSection({ sessionLog }: { sessionLog: SessionLogEntry[] }) {
  const vol = useMemo(() => getCoreVolume(sessionLog), [sessionLog]);
  return (
    <div className={styles.block}>
      {(Object.keys(CORE_TARGETS) as CoreGroup[]).map(g => {
        const done = vol[g];
        const target = CORE_TARGETS[g];
        return (
          <div key={g} className={styles.meterRow}>
            <span className={styles.meterLabel}>{CORE_LABEL[g]}</span>
            <span className={styles.cells} aria-label={`${done} of ${target} hard sets`}>
              {Array.from({ length: Math.max(target, done) }, (_, i) => (
                <span key={i} className={`${styles.cell}${i < done ? ` ${styles.cellOn}` : ''}${i >= target ? ` ${styles.cellOver}` : ''}`} />
              ))}
            </span>
            <span className={styles.meterValue}>{done}/{target}</span>
          </div>
        );
      })}
      <div className={styles.hint}>Hard sets since Monday. Counted from sessions finished in this version onward.</div>
    </div>
  );
}

// ---- Test results ------------------------------------------------------------------

export function BenchmarkSection({ results }: { results: BenchmarkResult[] }) {
  const rows = useMemo(() => getBenchmarkRows(results), [results]);
  const ratios = useMemo(() => getTrunkRatios(results), [results]);
  const bw = getBodyweight(results);
  if (!rows.length) {
    return <div className={styles.empty}>No tests recorded yet. Run TEST 01 ASSESS to fill this in.</div>;
  }
  return (
    <div className={styles.block}>
      {bw && <div className={styles.hint}>Bodyweight {fmtNum(bw.value)} kg on {fmtDate(bw.date)}</div>}
      {rows.map(r => {
        const { bench, latest, previous } = r;
        const lower = bench.better === 'lower';
        const values = [latest.value, ...bench.standards.map(s => s.value), ...r.history.map(h => h.value)];
        const lo = Math.min(0, ...values);
        const hi = Math.max(...values) * 1.08 || 1;
        const pct = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;
        const delta = previous ? latest.value - previous.value : null;
        const better = delta === null || delta === 0 ? null : (lower ? delta < 0 : delta > 0);
        const unit = bench.short ?? '';
        return (
          <div key={bench.id} className={styles.bench}>
            <div className={styles.benchHead}>
              <span className={styles.benchName}>{bench.name}</span>
              <span className={styles.benchValue}>
                {fmtNum(latest.value)}<small> {unit}</small>
                {delta !== null && delta !== 0 && (
                  <span className={better ? styles.up : styles.down}> {delta > 0 ? '+' : ''}{fmtNum(delta)}</span>
                )}
              </span>
            </div>
            {bench.standards.length > 0 ? (
              <div className={styles.track}>
                <span className={styles.fill} style={{ width: pct(latest.value) }} />
                {bench.standards.map(s => (
                  <span key={s.label} className={styles.tick} style={{ left: pct(s.value) }} title={s.label} />
                ))}
                {r.gradeTargets.next !== null && (
                  <span className={styles.target} style={{ left: pct(r.gradeTargets.next) }} title="Next boulder grade" />
                )}
              </div>
            ) : null}
            <div className={styles.benchFoot}>
              {bench.standards.length === 0
                ? 'Tracked against yourself'
                : r.reached
                  ? `${r.reached}${r.next ? ` · next ${r.next.label} at ${fmtNum(r.next.value)}` : ' · top standard'}`
                  : `Below ${r.next?.label ?? 'the first standard'} (${fmtNum(r.next?.value ?? 0)})`}
              <span className={styles.benchDate}>{fmtDate(latest.date)}{r.history.length > 1 ? ` · ${r.history.length} tests` : ''}</span>
            </div>
          </div>
        );
      })}
      {ratios.length > 0 && (
        <div className={styles.ratios}>
          <div className={styles.chartLabel}>Trunk balance (McGill ratios)</div>
          {ratios.map(r => (
            <div key={r.label} className={styles.ratioRow}>
              <span>{r.label}</span>
              <span className={styles.ratioTarget}>{r.target}</span>
              <b className={r.ok ? undefined : styles.down}>{r.value.toFixed(2)}</b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Lift trends -------------------------------------------------------------------

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return <span className={styles.sparkEmpty}>one entry</span>;
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(' ');
  return (
    <svg className={styles.spark} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function LiftSection({ loadLog }: { loadLog: LoadLogEntry[] }) {
  const series = useMemo(() => getLiftSeries(loadLog), [loadLog]);
  if (!series.length) {
    return <div className={styles.empty}>Loads appear here once you log them on the workout stepper.</div>;
  }
  return (
    <div className={styles.block}>
      {series.slice(0, 8).map(s => {
        const first = s.points[0].value;
        const last = s.points[s.points.length - 1].value;
        const change = last - first;
        return (
          <div key={s.exerciseId} className={styles.lift}>
            <span className={styles.liftName}>{s.name}</span>
            <Sparkline values={s.points.map(p => p.value)} />
            <span className={styles.liftValue}>
              {fmtNum(last)}<small> {s.unit}</small>
              {change !== 0 && <span className={change > 0 ? styles.up : styles.down}> {change > 0 ? '+' : ''}{fmtNum(change)}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---- Capacities --------------------------------------------------------------------

const TREND_SYMBOLS: Record<string, string> = { up: '^', down: 'v', stable: '-' };

export function CapacityRows({ items, onPick, highlight }: {
  items: CapacityListItem[];
  onPick: (c: CapacityListItem['capacity']) => void;
  highlight: string | null;
}) {
  return (
    <div className={styles.capList}>
      {items.map(m => {
        const fade = m.fadeInDays;
        const fadeText = fade === null ? null
          : fade < 0 ? 'fading now'
          : fade <= 5 ? `fades in ${fade}d`
          : null;
        return (
          <button
            key={m.capacity}
            className={`${styles.capRow}${highlight === m.capacity ? ` ${styles.capRowOn}` : ''}`}
            onClick={() => onPick(m.capacity)}
          >
            <span className={styles.capTop}>
              <span className={styles.capName}>{CONFIG.capacityLabels[m.capacity]}</span>
              <span className={styles.capLevel}>Lvl{String(m.level).padStart(2, '0')}</span>
              <span className={styles.capTrend}>{TREND_SYMBOLS[m.trend]}</span>
            </span>
            <span className={styles.capBar}><span style={{ width: `${Math.round(m.levelProgress * 100)}%` }} /></span>
            {fadeText && <span className={fade !== null && fade < 0 ? styles.capFadeNow : styles.capFade}>{fadeText}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ---- Climbing against pulling ------------------------------------------------------

export function ClimbVsPullSection({ climbLog, loadLog }: { climbLog: ClimbSession[]; loadLog: LoadLogEntry[] }) {
  const view: ClimbView | null = useMemo(() => primaryClimbView(climbLog), [climbLog]);
  const data = useMemo(() => getClimbVsPull(climbLog, loadLog, view), [climbLog, loadLog, view]);
  const hasClimb = data.some(d => d.bestSend !== null);
  const hasPull = data.some(d => d.pullKg !== null);
  if (!hasClimb && !hasPull) {
    return <div className={styles.empty}>Log climbs and weighted pull-ups to see them side by side.</div>;
  }
  const grades = view ? gradesOf(viewScale(view)) : [];
  const sendIdx = data.map(d => d.bestSend).filter((v): v is number => v !== null);
  const pulls = data.map(d => d.pullKg).filter((v): v is number => v !== null);
  return (
    <div className={styles.block}>
      <div className={styles.chartLabel}>Best send per week{view ? ` · ${view}` : ''}</div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 0 }} syncId="climbpull">
            <XAxis dataKey="week" hide />
            <YAxis
              width={48} allowDecimals={false} axisLine={false} tickLine={false}
              domain={sendIdx.length ? [Math.max(0, Math.min(...sendIdx) - 1), Math.max(...sendIdx) + 1] : [0, 1]}
              tick={{ fontSize: 10, fill: '#181610' }}
              tickFormatter={(i: number) => gradeLabel(grades[i] ?? '')}
            />
            <Line type="stepAfter" dataKey="bestSend" stroke="#181610" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.chartLabel}>Heaviest weighted pull-up per week, kg added</div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 6, bottom: 0, left: 0 }} syncId="climbpull">
            <XAxis dataKey="week" hide />
            <YAxis
              width={48} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#181610' }}
              domain={pulls.length ? [Math.floor(Math.min(...pulls) - 2), Math.ceil(Math.max(...pulls) + 2)] : [0, 1]}
            />
            <Line type="stepAfter" dataKey="pullKg" stroke="#E64D19" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.hint}>Last 12 weeks, same weeks on both. Separate scales: a grade and a kilo are not the same number.</div>
    </div>
  );
}
