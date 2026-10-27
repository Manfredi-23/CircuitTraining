// =============================================================================
// make-seed.ts — A believable eight-week backup for screenshots and e2e tests
//
// Writes e2e/fixtures/athlete.json: DAILY most mornings, CAVE 02 or 03 after
// two bouldering days a week (climbs tagged), CAVE 04 and 05 once each, an
// ASSESS, a weekend hike, loads that climb slowly. Dates run back from the day it is generated, so the recommender
// and STATS always see recent data. Run: npx tsx scripts/make-seed.ts
// =============================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { getModeData } from '../src/core/data-index';
import { getLoadAxis } from '../src/core/load';
import { CONFIG } from '../src/core/config';
import { createBackup } from '../src/core/backup';
import type { Circuit, ClimbSession, LoadLogEntry, Mode, SessionLogEntry, BenchmarkResult, Capacity, CapacityProgress } from '../src/core/types';
import type { ActivitySession } from '../src/core/activity';

const DAYS = 56;
const now = new Date();
now.setHours(7, 30, 0, 0);
const at = (daysAgo: number, hour = 7) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 15, 0, 0);
  return d;
};
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const circuit = (mode: Mode, id: string): Circuit => {
  const c = getModeData(mode).find(x => x.id === id);
  if (!c) throw new Error(`no circuit ${id}`);
  return c;
};

const sessionLog: SessionLogEntry[] = [];
const loadLog: LoadLogEntry[] = [];
const climbLog: ClimbSession[] = [];
const activityLog: ActivitySession[] = [];
const benchmarkResults: BenchmarkResult[] = [];
const xp: Partial<Record<Capacity, number>> = {};
const last: Partial<Record<Capacity, string>> = {};

function log(mode: Mode, id: string, daysAgo: number, hour: number, effort: number, cutLast = false) {
  const c = circuit(mode, id);
  const date = at(daysAgo, hour);
  const planned: Record<string, number> = {};
  const sets: Record<string, number> = {};
  const work = c.exercises.filter(e => !e.minLevel || e.minLevel <= 1);
  work.forEach((e, i) => {
    planned[e.id] = e.sets;
    sets[e.id] = cutLast && i === work.length - 1 ? Math.max(0, e.sets - 1) : e.sets;
    const axis = getLoadAxis(e);
    if (axis && axis.unit === 'kg' && e.block !== 'TEST') {
      // A slow climb in load: one step every two weeks from a base per exercise.
      const base = e.id.includes('pullup') ? 10 : e.id.includes('goblet') ? 16 : 8;
      const value = base + Math.floor((DAYS - daysAgo) / 14) * (axis.step ?? 2.5);
      loadLog.push({ exerciseId: e.id, exerciseName: e.name, date: ymd(date), value, unit: axis.unit });
    }
    for (const cap of e.capacities) {
      xp[cap] = (xp[cap] ?? 0) + sets[e.id];
      if (!last[cap] || last[cap]! < date.toISOString()) last[cap] = date.toISOString();
    }
  });
  sessionLog.push({
    date: date.toISOString(), mode, circuitId: c.id, circuitTitle: c.title, energy: 'NORMAL',
    duration: c.duration, sets, planned, effort,
    ...(c.capacities.some(x => x === 'crimp' || x === 'openhand' || x === 'forearm') ? { pain: daysAgo < 12 ? 2 : 1 } : {}),
  });
}

const dailyIds = ['daily-01', 'daily-02', 'daily-03', 'daily-04', 'daily-05', 'daily-06'];
for (let d = DAYS; d >= 1; d--) {
  const dow = at(d).getDay(); // 0 Sun
  // Bouldering Tuesday and Thursday, a session straight after.
  if (dow === 2 || dow === 4) {
    climbLog.push({
      id: `seed-climb-${d}`, date: ymd(at(d)), venue: 'GYM', discipline: 'BOULDER', durationMin: 90, effort: 7,
      // Tagged: slabs and vertical walls go, the steep pinchy ones do not, and
      // the falls are mostly the head.
      climbs: [
        { grade: 'GREEN', attempts: 1, sent: true, tags: ['slab', 'smear'] }, { grade: 'GREEN', attempts: 1, sent: true, tags: ['vertical', 'crimp'] },
        { grade: 'ORANGE', attempts: 2, sent: true, tags: ['vertical', 'crimp'] }, { grade: 'ORANGE', attempts: 1, sent: true, tags: ['slab', 'smear'] },
        { grade: 'BLUE', attempts: d < 20 ? 3 : 5, sent: d < 30, tags: ['overhang', 'pinch'], why: d < 30 ? undefined : ['power'] },
        { grade: 'BLUE', attempts: 4, sent: false, tags: ['overhang', 'compression'], why: [d % 2 ? 'backed-off' : 'feet'] },
      ],
      tryHard: d % 3 === 0,
    } as ClimbSession);
    log('CAVE', dow === 2 ? 'cave-05' : 'cave-06', d, 20, 7, d % 3 === 0);
  }
  // DAILY on most mornings, not Saturdays.
  if (dow !== 6 && d % 5 !== 0) log('DAILY', dailyIds[d % dailyIds.length], d, 7, 5);
  // A hike most Saturdays.
  if (dow === 6 && d % 2 === 0) {
    activityLog.push({ id: `seed-hike-${d}`, date: ymd(at(d)), type: 'HIKE', upM: 1100 } as ActivitySession);
  }
}

// The two no-climbing CAVE days, once each.
log('CAVE', 'cave-07', 24, 10, 8);
log('CAVE', 'cave-08', 17, 10, 7);

// One ASSESS five weeks ago, results to match.
log('TEST', 'assess-01', 35, 10, 8);
const assessDate = at(35, 10).toISOString();
benchmarkResults.push(
  { benchmarkId: 'bodyweight', value: 68, date: assessDate },
  { benchmarkId: 'weighted-pullup-2rm', value: 141, date: assessDate },
  { benchmarkId: 'max-pullups', value: 14, date: assessDate },
  { benchmarkId: 'toes-to-bar', value: 9, date: assessDate },
  { benchmarkId: 'hollow-hold', value: 55, date: assessDate },
);

sessionLog.sort((a, b) => a.date.localeCompare(b.date));

const progress: Record<string, CapacityProgress> = {};
for (const cap of CONFIG.capacities) {
  progress[cap] = { xp: xp[cap] ?? 0, lastTrained: last[cap] ?? null, history: [{ date: at(DAYS).toISOString(), xp: 0 }, { date: now.toISOString(), xp: xp[cap] ?? 0 }] };
}

const backup = createBackup({
  progress, sessionLog, loadLog, climbLog, activityLog, benchmarkResults,
  blockStart: ymd(at(DAYS)), tweaks: {}, offDays: [], buildPresets: [],
});
mkdirSync('e2e/fixtures', { recursive: true });
writeFileSync('e2e/fixtures/athlete.json', JSON.stringify(backup, null, 1));
console.log(`${sessionLog.length} sessions, ${climbLog.length} climbs, ${loadLog.length} loads`);
