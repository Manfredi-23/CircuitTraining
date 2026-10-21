'use client';

import { useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store/store';
import { getOverallLevel } from '@/core/engine';
import { getSortedCapacities, getOverallTrendData, getCapacityTrendData, timeFilterToDays } from '@/core/stats';
import { useSwipe } from '@/hooks/use-swipe';
import { isNative } from '@/native/native';
import ClimbStats from '@/components/shared/ClimbStats';
import { OverviewCard, WorkSplitSection } from '@/components/shared/StatsOverview';
import {
  WeekStripSection, CoreVolumeSection, BenchmarkSection, LiftSection,
  CapacityRows, ClimbVsPullSection,
  LoadSection, FingerSection, FreshnessSection, OneArmSection, SkippedSection, RecoverySection,
  RingSection, hasRingData,
} from '@/components/shared/StatsSections';
import type { SortMode, TimeFilter, Capacity } from '@/core/types';
import styles from './StatsScreen.module.css';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'strongest', label: 'strongest' },
  { key: 'weakest', label: 'weakest' },
  { key: 'recent', label: 'recent' },
];

const TIME_OPTIONS: { key: TimeFilter; label: string }[] = [
  { key: '7days', label: '7days' },
  { key: '30days', label: '30days' },
  { key: '90days', label: '90days' },
  { key: 'total', label: 'total' },
];

export default function StatsScreen() {
  const {
    progress, sessionLog, climbLog, activityLog, loadLog, benchmarkResults, statsSort, statsTimeFilter, health, settings,
    activeChartMuscles, highlightMuscle,
    setStatsSort, setStatsTimeFilter, toggleChartMuscle,
    setHighlightMuscle, setScreen,
  } = useStore();

  const overallLevel = getOverallLevel(progress);
  const insightInput = useMemo(
    () => ({ sessionLog, climbLog, activityLog, loadLog, benchmarkResults }),
    [sessionLog, climbLog, activityLog, loadLog, benchmarkResults],
  );
  const capacities = getSortedCapacities(progress, statsSort);
  const days = timeFilterToDays(statsTimeFilter);

  // Build chart data
  const chartData = useMemo(() => {
    const overall = getOverallTrendData(progress, days);
    const result = overall.map((pt, i) => {
      const point: Record<string, string | number> = { date: pt.date, overall: pt.score };
      for (const m of activeChartMuscles) {
        if (m !== 'overall') {
          const mData = getCapacityTrendData(progress[m as Capacity], days);
          point[m] = mData[i]?.score ?? 0;
        }
      }
      return point;
    });
    return result;
  }, [progress, days, activeChartMuscles]);

  const goBack = useCallback(() => setScreen('home'), [setScreen]);
  const { bind } = useSwipe({ onSwipeRight: goBack, onSwipeLeft: () => {} });

  return (
    <div {...bind()} className={`screen screen-enter ${styles.screen}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={goBack}>&larr;</button>
        <span className={styles.title}>STATS</span>
        <span className={styles.subtitle}>The last four weeks, and what to do about them</span>
      </div>

      <div className={styles.scroll}>
        {/* The last four weeks against the four before, and what stands out */}
        <OverviewCard
          level={overallLevel}
          sessionLog={sessionLog}
          climbLog={climbLog}
          activityLog={activityLog}
          insightInput={insightInput}
        />

        {/* Consistency: the last twelve weeks at a glance */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>WEEKS</div>
          <WeekStripSection sessionLog={sessionLog} climbLog={climbLog} activityLog={activityLog} />
        </div>

        {/* Balance: what the working sets went into */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>WHERE THE WORK WENT</div>
          <WorkSplitSection sessionLog={sessionLog} />
        </div>

        {/* How much, climbing included, against what the body is used to */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>LOAD</div>
          <LoadSection sessionLog={sessionLog} climbLog={climbLog} activityLog={activityLog} />
        </div>

        {/* Sleep and HRV, once Apple Health is connected */}
        {settings.health.connected ? (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>RECOVERY</div>
            <RecoverySection health={health} sessionLog={sessionLog} />
          </div>
        ) : isNative() && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>RECOVERY</div>
            <div className={styles.hintLine}>Connect Apple Health in Settings to see sleep and HRV against how sessions felt.</div>
          </div>
        )}

        <div className={styles.group}>PROGRESS</div>

        {/* Am I improving: what was actually lifted */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>LIFTS</div>
          <LiftSection loadLog={loadLog} />
        </div>

        {/* The goal: how far to the one-arm gates */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>ONE-ARM PATH</div>
          <OneArmSection results={benchmarkResults} />
        </div>

        {/* Where am I: tests against published standards */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>TESTS</div>
          <BenchmarkSection results={benchmarkResults} />
        </div>

        <div className={styles.group}>GAPS</div>

        {/* What has been neglected */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>FRESHNESS</div>
          <FreshnessSection progress={progress} />
        </div>

        {/* Am I doing enough for the core goal */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>CORE THIS WEEK</div>
          <CoreVolumeSection sessionLog={sessionLog} />
        </div>

        {/* What keeps getting dropped */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>CUT SHORT</div>
          <SkippedSection sessionLog={sessionLog} />
        </div>

        <div className={styles.group}>FINGERS</div>

        {/* The injured ring finger against the healthy one, while it heals */}
        {hasRingData(loadLog, benchmarkResults) && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>RING FINGER</div>
            <RingSection loadLog={loadLog} results={benchmarkResults} />
          </div>
        )}

        {/* Are the fingers keeping up with the load */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>FINGER LOAD</div>
          <FingerSection sessionLog={sessionLog} climbLog={climbLog} />
        </div>

        <div className={styles.group}>CLIMBING</div>

        {/* Climbing, from the climb log */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>CLIMBS</div>
          <ClimbStats sessions={climbLog} />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>CLIMBING VS PULLING</div>
          <ClimbVsPullSection climbLog={climbLog} loadLog={loadLog} />
        </div>

        <div className={styles.group}>LEVELS</div>

        {/* Capacities */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>CAPACITIES</div>

          <div className={styles.sortTabs} role="tablist">
            {SORT_OPTIONS.map(s => (
              <button
                key={s.key}
                role="tab"
                aria-selected={s.key === statsSort}
                className={`${styles.sortTab}${s.key === statsSort ? ` ${styles.sortTabActive}` : ''}`}
                onClick={() => setStatsSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <CapacityRows
            items={capacities}
            highlight={highlightMuscle}
            onPick={c => {
              toggleChartMuscle(c);
              setHighlightMuscle(highlightMuscle === c ? null : c);
            }}
          />
        </div>

        {/* Trend graph */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>LEVEL TREND</div>

          <div className={styles.timeTabs} role="tablist">
            {TIME_OPTIONS.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={t.key === statsTimeFilter}
                className={`${styles.timeTab}${t.key === statsTimeFilter ? ` ${styles.timeTabActive}` : ''}`}
                onClick={() => setStatsTimeFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis domain={[0, 100]} hide />
                {/* Individual muscle lines */}
                {activeChartMuscles.filter(m => m !== 'overall').map(m => (
                  <Line
                    key={m}
                    type="monotone"
                    dataKey={m}
                    stroke={m === highlightMuscle ? '#E64D19' : 'rgba(24,22,16,0.25)'}
                    strokeWidth={m === highlightMuscle ? 2 : 1}
                    strokeDasharray="3 5"
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
                {/* Overall line */}
                <Line
                  type="monotone"
                  dataKey="overall"
                  stroke="#181610"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
