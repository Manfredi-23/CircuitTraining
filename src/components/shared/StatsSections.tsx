'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ComposedChart, Bar, Cell } from 'recharts';
import { CONFIG } from '@/core/config';
import { gradeLabel, gradesOf, viewScale, type ClimbView } from '@/core/climbing';
import {
  CORE_TARGETS, getBenchmarkRows, getBodyweight, getClimbVsPull, getCoreVolume,
  getLiftSeries, getTrunkRatios, getWeekStrip, primaryClimbView, type CoreGroup, type DayKind,
  getFreshness, getOneArmPath, getFingerWeeks, getSkipped, getRecovery,
} from '@/core/insights';
import { loadItems, weeklyLoad, loadRatio, ZONE_TEXT, type LoadSource } from '@/core/training-load';
import { healthReadiness, type HealthData } from '@/core/health';
import type {
  BenchmarkResult, CapacityListItem, ClimbSession, LoadLogEntry, Progress, SessionLogEntry,
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

// ---- Training load -------------------------------------------------------------------

const SOURCE_ORDER: LoadSource[] = ['CLIMB', 'CAVE', 'TEST', 'DAILY'];
const SOURCE_CLASS: Record<LoadSource, string> = {
  CLIMB: styles.segClimb, CAVE: styles.segCave, TEST: styles.segTest, DAILY: styles.segDaily,
};
/** Bar labels: weeks ago every third column, NOW on the current week. */
const weekTick = (i: number, n: number) => (i === n - 1 ? 'NOW' : (n - 1 - i) % 3 === 0 ? `-${n - 1 - i}W` : '');
const fmtLoad = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));

export function LoadSection({ sessionLog, climbLog }: { sessionLog: SessionLogEntry[]; climbLog: ClimbSession[] }) {
  const items = useMemo(() => loadItems(sessionLog, climbLog), [sessionLog, climbLog]);
  const weeks = useMemo(() => weeklyLoad(items), [items]);
  const ratio = useMemo(() => loadRatio(items), [items]);
  const max = Math.max(...weeks.map(w => w.total));
  if (!max) return <div className={styles.empty}>Rate sessions and log climbs to see the weekly load.</div>;
  const estimated = weeks.some(w => w.estimatedShare > 0.3);
  return (
    <div className={styles.block}>
      <div className={styles.bars} role="img" aria-label="Weekly training load, last 12 weeks">
        {weeks.map((w, i) => (
          <div key={w.monday} className={styles.barCol} title={`${w.monday}: ${Math.round(w.total)}`}>
            <div className={styles.barStack} style={{ height: `${(w.total / max) * 100}%` }}>
              {SOURCE_ORDER.map(src => w.bySource[src] > 0 && (
                <span key={src} className={SOURCE_CLASS[src]} style={{ flexGrow: w.bySource[src] }} />
              ))}
            </div>
            <span className={`${styles.barLabel}${i === weeks.length - 1 ? ` ${styles.barLabelNow}` : ''}`}>
              {weekTick(i, weeks.length)}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.legend}>
        <span><i className={styles.dayClimb} />climb</span>
        <span><i className={styles.dayCave} />cave</span>
        <span><i className={styles.dayDaily} />daily</span>
        <span><i className={styles.dayTest} />test</span>
      </div>
      {ratio ? (
        <div className={styles.ratioBox}>
          <div className={styles.ratioHead}>
            <span>Last 7 days <b>{fmtLoad(ratio.acute)}</b> vs usual week <b>{fmtLoad(ratio.chronic)}</b></span>
            <b className={ratio.zone === 'high' || ratio.zone === 'spike' ? styles.down : undefined}>{ratio.ratio.toFixed(2)}</b>
          </div>
          <div className={styles.hint}>{ZONE_TEXT[ratio.zone]}</div>
        </div>
      ) : (
        <div className={styles.hint}>The acute:chronic ratio appears after three weeks of history.</div>
      )}
      <div className={styles.hint}>
        Load = effort (1-10) x minutes, climbing included.
        {estimated && ' Unrated sessions use a typical effort; rate them for a truer picture.'}
      </div>
    </div>
  );
}

// ---- Fingers -------------------------------------------------------------------------

export function FingerSection({ sessionLog, climbLog }: { sessionLog: SessionLogEntry[]; climbLog: ClimbSession[] }) {
  const weeks = useMemo(() => getFingerWeeks(sessionLog, climbLog), [sessionLog, climbLog]);
  const max = Math.max(...weeks.map(w => w.load));
  const anyPain = weeks.some(w => w.maxPain !== null);
  if (!max && !anyPain) return <div className={styles.empty}>Finger sessions and boulder days appear here, with the pain score from each check.</div>;
  return (
    <div className={styles.block}>
      <div className={styles.bars} role="img" aria-label="Weekly finger load and highest pain score">
        {weeks.map((w, i) => (
          <div key={w.monday} className={styles.barCol}>
            <span className={`${styles.painMark}${w.maxPain !== null && w.maxPain >= 3 ? ` ${styles.painHigh}` : ''}`}>
              {w.maxPain ?? ''}
            </span>
            <div className={styles.barStack} style={{ height: max ? `${(w.load / max) * 100}%` : 0 }}>
              <span className={styles.segCave} style={{ flexGrow: 1 }} />
            </div>
            <span className={`${styles.barLabel}${i === weeks.length - 1 ? ` ${styles.barLabelNow}` : ''}`}>
              {weekTick(i, weeks.length)}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.hint}>
        Bars: boulder days and finger sessions, effort x minutes. Numbers: highest finger and wrist pain that week, 3 and up in orange.
        Pain that rises with the bars is the pattern to act on.
      </div>
    </div>
  );
}

// ---- Freshness -------------------------------------------------------------------------

export function FreshnessSection({ progress }: { progress: Progress }) {
  const rows = useMemo(() => getFreshness(progress), [progress]);
  if (rows.every(r => r.days === null)) return <div className={styles.empty}>Train anything and it shows up here.</div>;
  return (
    <div className={styles.block}>
      {rows.map(r => {
        const over = r.days !== null && r.days >= r.graceDays;
        const fill = r.days === null ? 0 : Math.min(1, r.days / r.graceDays);
        return (
          <div key={r.capacity} className={styles.meterRow}>
            <span className={styles.freshLabel}>{CONFIG.capacityLabels[r.capacity]}</span>
            <span className={styles.freshTrack}>
              <span className={over ? styles.freshFillOver : styles.freshFill} style={{ width: `${fill * 100}%` }} />
            </span>
            <span className={`${styles.freshValue}${over ? ` ${styles.down}` : ''}`}>
              {r.days === null ? 'never' : `${r.days}/${r.graceDays}d`}
            </span>
          </div>
        );
      })}
      <div className={styles.hint}>Days since trained against the days before it starts to fade. Full and orange: fading now.</div>
    </div>
  );
}

// ---- One-arm path ------------------------------------------------------------------------

export function OneArmSection({ results }: { results: BenchmarkResult[] }) {
  const path = useMemo(() => getOneArmPath(results), [results]);
  const latest = path.points.length ? path.points[path.points.length - 1] : null;
  const top = Math.max(150, ...path.points.map(p => p.value)) + 5;
  const bottom = Math.min(100, ...path.points.map(p => p.value)) - 5;
  return (
    <div className={styles.block}>
      {path.points.length > 0 ? (
        <div className={styles.chart}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={path.points} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
              <XAxis dataKey="date" hide />
              <YAxis width={36} domain={[bottom, top]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#181610' }} />
              {path.gates.map(g => (
                <ReferenceLine key={g.value} y={g.value} stroke="#E64D19" strokeDasharray="3 4" />
              ))}
              <Line type="linear" dataKey="value" stroke="#181610" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles.empty}>Record a weighted pull-up 2RM in TEST 01 ASSESS to start the path.</div>
      )}
      {path.gates.map(g => (
        <div key={g.value} className={styles.ratioRow}>
          <span>{g.label}</span>
          <span className={styles.ratioTarget}>{g.value}% · +{g.addedKg} kg</span>
          <b className={g.reached ? undefined : styles.down}>{g.reached ? 'OPEN' : g.projected ? fmtDate(g.projected) : '--'}</b>
        </div>
      ))}
      <div className={styles.hint}>
        Weighted pull-up 2RM as % bodyweight{latest ? `, latest ${latest.value}%` : ''}. Dashed: the gates. Kilos are on the belt for two clean reps at your current bodyweight.
        Dates are a straight-line projection from your tests, once they span three weeks.
      </div>
    </div>
  );
}

// ---- Cut short ---------------------------------------------------------------------------

export function SkippedSection({ sessionLog }: { sessionLog: SessionLogEntry[] }) {
  const rows = useMemo(() => getSkipped(sessionLog).slice(0, 6), [sessionLog]);
  if (!rows.length) return <div className={styles.empty}>Nothing cut short in the last 90 days.</div>;
  return (
    <div className={styles.block}>
      {rows.map(r => (
        <div key={r.exerciseId} className={styles.ratioRow}>
          <span>{r.name}</span>
          <span className={styles.ratioTarget}>{r.skipped ? `${r.skipped} skipped` : ''}</span>
          <b>{r.short}/{r.planned}</b>
        </div>
      ))}
      <div className={styles.hint}>Sessions cut short out of sessions planned, last 90 days. One that keeps coming up is too long, too hard, or in the wrong place.</div>
    </div>
  );
}

// ---- Recovery (Apple Health) ------------------------------------------------------------

export function RecoverySection({ health, sessionLog }: { health: HealthData; sessionLog: SessionLogEntry[] }) {
  const rec = useMemo(() => getRecovery(health, sessionLog), [health, sessionLog]);
  const today = useMemo(() => healthReadiness(health), [health]);
  const hasSleep = rec.nights.some(n => n.sleepH !== null);
  const hasHrv = rec.nights.some(n => n.hrv !== null);
  if (!hasSleep && !hasHrv) {
    return <div className={styles.empty}>No sleep or HRV from Apple Health yet. Wear the watch to bed for a few nights.</div>;
  }
  return (
    <div className={styles.block}>
      {today && (
        <div className={styles.summary}>
          Today suggests <b>{today.energy}</b>: {today.reasons.join(', ')}.
        </div>
      )}
      <div className={styles.chartLabel}>Sleep, hours{hasHrv ? ' · HRV, ms (line)' : ''} · last 14 nights</div>
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rec.nights} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis yAxisId="h" width={24} domain={[0, 10]} ticks={[0, 6, 8]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#181610' }} />
            <YAxis yAxisId="v" orientation="right" hide domain={['dataMin - 10', 'dataMax + 10']} />
            <ReferenceLine yAxisId="h" y={7} stroke="rgba(24,22,16,0.25)" strokeDasharray="3 4" />
            <Bar yAxisId="h" dataKey="sleepH" isAnimationActive={false}>
              {rec.nights.map(n => (
                <Cell key={n.date} fill={n.sleepH !== null && n.sleepH < 6 ? '#E64D19' : '#181610'} />
              ))}
            </Bar>
            {hasHrv && (
              <Line yAxisId="v" type="monotone" dataKey="hrv" stroke="#E64D19" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {rec.compare.map(c => (
        <div key={c.label} className={styles.ratioRow}>
          <span>{c.label}</span>
          <span className={styles.ratioTarget}>{c.sessions} rated session{c.sessions === 1 ? '' : 's'}</span>
          <b>{c.effort === null ? '--' : `${c.effort}/10`}</b>
        </div>
      ))}
      <div className={styles.hint}>
        Bars under 6 hours in orange; the dashed line is 7. Effort is how hard sessions felt. The same sessions feeling harder after short nights is the reason TIRED exists.
      </div>
    </div>
  );
}
