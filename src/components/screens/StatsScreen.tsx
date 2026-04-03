'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useStore } from '@/store/store';
import { getOverallLevel, getStatInterpretation } from '@/core/engine';
import { getSortedMuscles, getLastSession, getOverallTrendData, getMuscleTrendData, timeFilterToDays } from '@/core/stats';
import type { SortMode, TimeFilter, MuscleGroup } from '@/core/types';
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

const TREND_SYMBOLS: Record<string, string> = { up: '^', down: 'v', stable: '-' };

export default function StatsScreen() {
  const {
    progress, sessionLog, statsSort, statsTimeFilter,
    activeChartMuscles, highlightMuscle,
    setStatsSort, setStatsTimeFilter, toggleChartMuscle,
    setHighlightMuscle, setScreen,
  } = useStore();

  const overallLevel = getOverallLevel(progress);
  const interpretation = useMemo(() => getStatInterpretation(progress, sessionLog), [progress, sessionLog]);
  const lastSession = getLastSession(sessionLog);
  const muscles = getSortedMuscles(progress, statsSort);
  const days = timeFilterToDays(statsTimeFilter);

  // Build chart data
  const chartData = useMemo(() => {
    const overall = getOverallTrendData(progress, days);
    const result = overall.map((pt, i) => {
      const point: Record<string, string | number> = { date: pt.date, overall: pt.score };
      for (const m of activeChartMuscles) {
        if (m !== 'overall') {
          const mData = getMuscleTrendData(progress[m as MuscleGroup], days);
          point[m] = mData[i]?.score ?? 0;
        }
      }
      return point;
    });
    return result;
  }, [progress, days, activeChartMuscles]);

  return (
    <div className={`screen screen-enter ${styles.screen}`}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={() => setScreen('home')}>&larr;</button>
        <span className={styles.title}>STATS</span>
        <span className={styles.subtitle}>Numbers and consequences</span>
      </div>

      <div className={styles.scroll}>
        {/* Overall level */}
        <div className={styles.overall}>
          <span className={styles.overallNum}>{String(overallLevel).padStart(2, '0')}</span>
          <div className={styles.interpretation}>{interpretation}</div>
          {lastSession && (
            <div className={styles.lastRow}>
              Last: <span className={styles.lastMode}>{lastSession.mode} [{lastSession.circuitTitle}]</span>
            </div>
          )}
        </div>

        {/* Muscle groups */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>MUSCLE GROUPS</div>

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

          <div className={styles.muscleList}>
            {muscles.map((m, i) => (
              <div
                key={m.muscle}
                className={styles.muscleRow}
                style={{ animationDelay: `${i * 30}ms` }}
                onClick={() => {
                  toggleChartMuscle(m.muscle);
                  setHighlightMuscle(highlightMuscle === m.muscle ? null : m.muscle);
                }}
              >
                {m.trend === 'down' && <div className={styles.declineBar} />}
                <span className={styles.muscleName}>{m.muscle}</span>
                <span className={styles.muscleLevel}>Lvl{String(m.level).padStart(2, '0')}</span>
                <span className={styles.muscleTrend}>{TREND_SYMBOLS[m.trend]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend graph */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>OVERVIEW</div>

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
