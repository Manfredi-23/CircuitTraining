// =============================================================================
// stats.ts — Stats calculations, trend scoring (pure functions, no React)
// Chart rendering replaced by Recharts in the component layer
// =============================================================================

import { CONFIG } from './config';
import { getLevelNum, getProgressInLevel, getTrend } from './engine';
import type {
  MuscleGroup, MuscleProgress, Progress, SortMode,
  TrendDataPoint, MuscleListItem, SessionLogEntry,
} from './types';

// ---------------------------------------------------------------------------
// Trend score: 0-100 score for a muscle group
// ---------------------------------------------------------------------------

export function calcTrendScore(muscleData: MuscleProgress | undefined): number {
  if (!muscleData) return 0;

  const xp = muscleData.xp || 0;
  const level = getLevelNum(xp);
  const progress = getProgressInLevel(xp);

  const levelScore = ((level - 1) / 6) * 70;
  const progressScore = progress * 20;
  const behaviourScore = calcBehaviourScore(muscleData);

  return Math.min(100, Math.max(0, levelScore + progressScore + behaviourScore));
}

function calcBehaviourScore(muscleData: MuscleProgress): number {
  if (!muscleData.history || muscleData.history.length === 0) return 0;
  const recent = muscleData.history.slice(-10);
  if (recent.length < 2) return 0;

  const first = recent[0].xp;
  const last = recent[recent.length - 1].xp;
  const growth = last - first;

  return Math.max(-5, Math.min(5, growth));
}

// ---------------------------------------------------------------------------
// Trend data for charts
// ---------------------------------------------------------------------------

export function getMuscleTrendData(muscleData: MuscleProgress | undefined, days: number): TrendDataPoint[] {
  if (!muscleData?.history || muscleData.history.length === 0) {
    return emptyTrendData(days);
  }

  const now = new Date();
  const result: TrendDataPoint[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const target = new Date(now);
    target.setDate(target.getDate() - d);
    const dateStr = target.toISOString().split('T')[0];

    const relevantHistory = muscleData.history.filter(h => new Date(h.date) <= target);

    let score = 0;
    if (relevantHistory.length > 0) {
      const latestEntry = relevantHistory[relevantHistory.length - 1];
      const syntheticData: MuscleProgress = { ...muscleData, xp: latestEntry.xp, history: relevantHistory };
      score = calcTrendScore(syntheticData);
    }

    result.push({ date: dateStr, score });
  }

  return smooth(result);
}

function emptyTrendData(days: number): TrendDataPoint[] {
  const now = new Date();
  const result: TrendDataPoint[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const target = new Date(now);
    target.setDate(target.getDate() - d);
    result.push({ date: target.toISOString().split('T')[0], score: 0 });
  }
  return result;
}

function smooth(data: TrendDataPoint[]): TrendDataPoint[] {
  if (data.length < 3) return data;
  return data.map((point, i) => {
    if (i === 0 || i === data.length - 1) return point;
    const avg = (data[i - 1].score + point.score + data[i + 1].score) / 3;
    return { ...point, score: Math.round(avg * 10) / 10 };
  });
}

// ---------------------------------------------------------------------------
// Overall trend data (average of all muscles)
// ---------------------------------------------------------------------------

export function getOverallTrendData(progress: Progress, days: number): TrendDataPoint[] {
  const allMuscleData = CONFIG.muscleGroups.map(m => getMuscleTrendData(progress[m], days));

  if (allMuscleData.length === 0) return emptyTrendData(days);

  return allMuscleData[0].map((_, i) => {
    const avg = allMuscleData.reduce((sum, muscle) => sum + (muscle[i]?.score ?? 0), 0) / allMuscleData.length;
    return {
      date: allMuscleData[0][i].date,
      score: Math.round(avg * 10) / 10,
    };
  });
}

// ---------------------------------------------------------------------------
// Sorted muscle list
// ---------------------------------------------------------------------------

export function getSortedMuscles(progress: Progress, sort: SortMode): MuscleListItem[] {
  const muscles: MuscleListItem[] = CONFIG.muscleGroups.map(m => {
    const pg = progress[m] || { xp: 0, lastTrained: null, history: [] };
    const level = getLevelNum(pg.xp);
    const trend = getTrend(progress, m);
    const lastTrained = pg.lastTrained ? new Date(pg.lastTrained) : new Date(0);
    return { muscle: m, level, trend, lastTrained };
  });

  switch (sort) {
    case 'strongest':
      return muscles.sort((a, b) => b.level - a.level);
    case 'weakest':
      return muscles.sort((a, b) => a.level - b.level);
    case 'recent':
      return muscles.sort((a, b) => b.lastTrained.getTime() - a.lastTrained.getTime());
    default:
      return muscles;
  }
}

// ---------------------------------------------------------------------------
// Last session
// ---------------------------------------------------------------------------

export function getLastSession(sessionLog: SessionLogEntry[]): SessionLogEntry | null {
  if (!sessionLog || sessionLog.length === 0) return null;
  return sessionLog[sessionLog.length - 1];
}

// ---------------------------------------------------------------------------
// Time filter to days conversion
// ---------------------------------------------------------------------------

export function timeFilterToDays(filter: string): number {
  switch (filter) {
    case '7days': return 7;
    case '30days': return 30;
    case '90days': return 90;
    case 'total': return 365;
    default: return 30;
  }
}
