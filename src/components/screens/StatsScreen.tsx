'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useShallow } from 'zustand/react/shallow';
import { useStore } from '@/store/store';
import { getOverallLevel } from '@/core/engine';
import { getSortedCapacities, getOverallTrendData, getCapacityTrendData, timeFilterToDays } from '@/core/stats';
import { getWorkSplit } from '@/core/review';
import { getCoreVolume, getFreshness, getOneArmPath, getSkipped, primaryClimbView } from '@/core/insights';
import { climbingLane, loadItems, loadRatio } from '@/core/training-load';
import {
  climbHeadline, coreHeadline, freshnessHeadline, liftHeadline, loadHeadline, oneArmHeadline, skippedHeadline,
  testsHeadline, workSplitHeadline,
} from '@/core/stats-headlines';
import { isNative } from '@/native/native';
import ScreenHeader from '@/components/shell/ScreenHeader';
import ClimbStats from '@/components/shared/ClimbStats';
import ExerciseDetail from '@/components/shared/ExerciseDetail';
import { OverviewCard, WorkSplitSection } from '@/components/shared/StatsOverview';
import {
  WeekStripSection, CoreVolumeSection, BenchmarkSection, LiftSection,
  CapacityRows, ClimbVsPullSection,
  LoadSection, FingerSection, FreshnessSection, OneArmSection, SkippedSection, RecoverySection,
  RingSection, hasRingData,
} from '@/components/shared/StatsSections';
import type { SortMode, TimeFilter, Capacity } from '@/core/types';
import styles from './StatsScreen.module.css';

type StatsTab = 'OVERVIEW' | 'PROGRESS' | 'BODY' | 'CLIMBING';
const TABS: StatsTab[] = ['OVERVIEW', 'PROGRESS', 'BODY', 'CLIMBING'];
const TAB_LINE: Record<StatsTab, string> = {
  OVERVIEW: 'The last four weeks against the four before, and what to do about them.',
  PROGRESS: 'What was lifted, what was tested, how far to the one-arm.',
  BODY: 'Where the work went, how much, and what is fading.',
  CLIMBING: 'From the climb log.',
};

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'strongest', label: 'strongest' },
  { key: 'weakest', label: 'weakest' },
  { key: 'recent', label: 'recent' },
];

const TIME_OPTIONS: { key: TimeFilter; label: string }[] = [
  { key: '7days', label: '7 days' },
  { key: '30days', label: '30 days' },
  { key: '90days', label: '90 days' },
  { key: 'total', label: 'all' },
];

/** A section: its name, the period it covers, the answer in one sentence, then the evidence. */
function Section({ title, period, lead, children }: { title: string; period?: string; lead?: string | null; children: ReactNode }) {
  return (
    <section className={`${styles.section} dot-rule`}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {period && <span className={styles.period}>{period}</span>}
      </div>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
    </section>
  );
}

/**
 * STATS in four tabs, each answering its own question: OVERVIEW (how the last
 * four weeks went), PROGRESS (am I getting stronger), BODY (is the work
 * balanced and recovered), CLIMBING. Every section leads with its answer.
 */
export default function StatsScreen({ onSettings }: { onSettings: () => void }) {
  const {
    progress, sessionLog, climbLog, activityLog, loadLog, benchmarkResults, statsSort, statsTimeFilter, health, settings,
    activeChartMuscles, highlightMuscle,
    setStatsSort, setStatsTimeFilter, toggleChartMuscle,
    setHighlightMuscle,
  } = useStore(useShallow(s => ({
    progress: s.progress, sessionLog: s.sessionLog, climbLog: s.climbLog, activityLog: s.activityLog, loadLog: s.loadLog,
    benchmarkResults: s.benchmarkResults, statsSort: s.statsSort, statsTimeFilter: s.statsTimeFilter, health: s.health,
    settings: s.settings, activeChartMuscles: s.activeChartMuscles, highlightMuscle: s.highlightMuscle,
    setStatsSort: s.setStatsSort, setStatsTimeFilter: s.setStatsTimeFilter, toggleChartMuscle: s.toggleChartMuscle,
    setHighlightMuscle: s.setHighlightMuscle,
  })));
  const [tab, setTab] = useState<StatsTab>('OVERVIEW');
  const [exercise, setExercise] = useState<string | null>(null);

  const overallLevel = getOverallLevel(progress);
  const insightInput = useMemo(
    () => ({ sessionLog, climbLog, activityLog, loadLog, benchmarkResults }),
    [sessionLog, climbLog, activityLog, loadLog, benchmarkResults],
  );
  const capacities = getSortedCapacities(progress, statsSort);
  const days = timeFilterToDays(statsTimeFilter);

  const heads = useMemo(() => ({
    lifts: liftHeadline(loadLog),
    split: workSplitHeadline(getWorkSplit(sessionLog)),
    // The ratio reads climbing and training only, as the LOAD section does.
    load: loadHeadline(loadRatio(climbingLane(loadItems(sessionLog, climbLog, activityLog)))),
    fresh: freshnessHeadline(getFreshness(progress)),
    core: coreHeadline(getCoreVolume(sessionLog)),
    skipped: skippedHeadline(getSkipped(sessionLog)),
    oap: oneArmHeadline(getOneArmPath(benchmarkResults)),
    tests: testsHeadline(benchmarkResults),
    climbs: climbHeadline(climbLog, primaryClimbView(climbLog)),
  }), [loadLog, sessionLog, climbLog, activityLog, progress, benchmarkResults]);

  const chartData = useMemo(() => {
    const overall = getOverallTrendData(progress, days);
    return overall.map((pt, i) => {
      const point: Record<string, string | number> = { date: pt.date, overall: pt.score };
      for (const m of activeChartMuscles) {
        if (m !== 'overall') point[m] = getCapacityTrendData(progress[m as Capacity], days)[i]?.score ?? 0;
      }
      return point;
    });
  }, [progress, days, activeChartMuscles]);

  return (
    <div className={`screen screen-enter tab-screen ${styles.screen}`}>
      <ScreenHeader title="STATS" sub={TAB_LINE[tab]} onSettings={onSettings} />

      <div className={styles.tabs} role="tablist" aria-label="Stats">
        {TABS.map(t => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tab}
            className={`${styles.tab}${t === tab ? ` ${styles.tabOn}` : ''}`}
            onClick={() => setTab(t)}
          >{t}</button>
        ))}
      </div>

      {tab === 'OVERVIEW' && (
        <>
          <OverviewCard level={overallLevel} sessionLog={sessionLog} climbLog={climbLog} activityLog={activityLog} insightInput={insightInput} />
          <Section title="WEEKS" period="12 weeks">
            <WeekStripSection sessionLog={sessionLog} climbLog={climbLog} activityLog={activityLog} />
          </Section>
        </>
      )}

      {tab === 'PROGRESS' && (
        <>
          <Section title="LIFTS" period="all time" lead={heads.lifts}>
            <LiftSection loadLog={loadLog} onPick={setExercise} />
          </Section>
          <Section title="ONE-ARM PATH" lead={heads.oap}>
            <OneArmSection results={benchmarkResults} />
          </Section>
          <Section title="TESTS" lead={heads.tests}>
            <BenchmarkSection results={benchmarkResults} />
          </Section>
        </>
      )}

      {tab === 'BODY' && (
        <>
          <Section title="WHERE THE WORK WENT" period="28 days" lead={heads.split}>
            <WorkSplitSection sessionLog={sessionLog} />
          </Section>
          <Section title="LOAD" period="12 weeks" lead={heads.load}>
            <LoadSection sessionLog={sessionLog} climbLog={climbLog} activityLog={activityLog} />
          </Section>
          {settings.health.connected ? (
            <Section title="RECOVERY" period="14 days">
              <RecoverySection health={health} sessionLog={sessionLog} />
            </Section>
          ) : isNative() && (
            <Section title="RECOVERY" lead="Connect Apple Health in Settings to see sleep and HRV against how sessions felt.">
              {null}
            </Section>
          )}
          <Section title="FRESHNESS" lead={heads.fresh}>
            <FreshnessSection progress={progress} />
          </Section>
          <Section title="CORE THIS WEEK" period="since Monday" lead={heads.core}>
            <CoreVolumeSection sessionLog={sessionLog} />
          </Section>
          <Section title="CUT SHORT" period="90 days" lead={heads.skipped}>
            <SkippedSection sessionLog={sessionLog} />
          </Section>
          {hasRingData(loadLog, benchmarkResults) && (
            <Section title="RING FINGER">
              <RingSection loadLog={loadLog} results={benchmarkResults} />
            </Section>
          )}
          <Section title="FINGER LOAD" period="12 weeks">
            <FingerSection sessionLog={sessionLog} climbLog={climbLog} />
          </Section>

          <Section title="LEVELS" lead="Levels move loads and open variations. They fade when a capacity goes untrained.">
            <div className={styles.sortTabs} role="tablist" aria-label="Sort">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.key}
                  role="tab"
                  aria-selected={s.key === statsSort}
                  className={`${styles.sortTab}${s.key === statsSort ? ` ${styles.sortTabActive}` : ''}`}
                  onClick={() => setStatsSort(s.key)}
                >{s.label}</button>
              ))}
            </div>
            <CapacityRows
              items={capacities}
              highlight={highlightMuscle}
              onPick={c => { toggleChartMuscle(c); setHighlightMuscle(highlightMuscle === c ? null : c); }}
            />
            <div className={styles.timeTabs} role="tablist" aria-label="Period">
              {TIME_OPTIONS.map(t => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={t.key === statsTimeFilter}
                  className={`${styles.timeTab}${t.key === statsTimeFilter ? ` ${styles.timeTabActive}` : ''}`}
                  onClick={() => setStatsTimeFilter(t.key)}
                >{t.label}</button>
              ))}
            </div>
            <div className={styles.chartWrap} aria-label="Level trend, overall in black, a picked capacity in orange">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} hide />
                  {activeChartMuscles.filter(m => m !== 'overall').map(m => (
                    <Line
                      key={m}
                      type="linear"
                      dataKey={m}
                      stroke={m === highlightMuscle ? '#E64D19' : 'rgba(24,22,16,0.25)'}
                      strokeWidth={m === highlightMuscle ? 2 : 1}
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
                  <Line type="linear" dataKey="overall" stroke="#181610" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.hintLine}>Overall in black. Tap a capacity to draw it in orange.</p>
          </Section>
        </>
      )}

      {tab === 'CLIMBING' && (
        <>
          <Section title="CLIMBS" lead={heads.climbs}>
            <ClimbStats sessions={climbLog} />
          </Section>
          <Section title="CLIMBING VS PULLING" period="12 weeks">
            <ClimbVsPullSection climbLog={climbLog} loadLog={loadLog} />
          </Section>
        </>
      )}

      {exercise && <ExerciseDetail exerciseId={exercise} onClose={() => setExercise(null)} />}
    </div>
  );
}
