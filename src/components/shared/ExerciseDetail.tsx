'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useStore } from '@/store/store';
import { exerciseLibrary } from '@/core/reserve';
import { areaOf, fmtDay, WORK_AREA_LABEL } from '@/core/review';
import { suggestLoad, progressSign } from '@/core/progression';
import { getLoadAxis } from '@/core/load';
import { retiredName } from '@/core/insights';
import { dayOf } from '@/core/dates';
import styles from './ExerciseDetail.module.css';

const n1 = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** Round, even ticks that run above the top value, zero at the bottom for loads. */
function ticksFor(values: number[]): number[] {
  const max = Math.max(...values, 1);
  const raw = max / 4;
  const step = [1, 2, 2.5, 5, 10, 20, 25, 50].find(s => s >= raw) ?? Math.ceil(raw / 50) * 50;
  const top = Math.ceil((max + step * 0.01) / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
}

/**
 * One exercise over time: every load logged, the best, what the stepper
 * suggests next and why, how often it was done, and how it progresses.
 */
export default function ExerciseDetail({ exerciseId, onClose }: { exerciseId: string; onClose: () => void }) {
  const loadLog = useStore(s => s.loadLog);
  const sessionLog = useStore(s => s.sessionLog);
  const ex = exerciseLibrary().get(exerciseId);
  const entries = useMemo(
    () => loadLog.filter(l => l.exerciseId === exerciseId && l.value > 0).sort((a, b) => a.date.localeCompare(b.date)),
    [loadLog, exerciseId],
  );
  const done = useMemo(
    () => sessionLog.filter(s => (s.sets?.[exerciseId] ?? 0) > 0).map(s => ({ day: dayOf(s.date), sets: s.sets![exerciseId], planned: s.planned?.[exerciseId] })),
    [sessionLog, exerciseId],
  );
  const axis = ex ? getLoadAxis(ex) : null;
  const sign = ex && axis ? progressSign(ex, axis) : 1;
  const unit = entries[entries.length - 1]?.unit ?? axis?.unit ?? '';
  const values = entries.map(e => e.value);
  const best = values.length ? (sign < 0 ? Math.min(...values) : Math.max(...values)) : null;
  const latest = entries[entries.length - 1];
  const first = entries[0];
  const suggestion = ex ? suggestLoad(ex, loadLog, sessionLog) : null;
  const name = ex?.name ?? entries[0]?.exerciseName ?? retiredName(exerciseId);
  const area = ex ? areaOf(ex) : null;
  const ticks = values.length ? ticksFor(values) : [];

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={name}>
      <div className="overlay-header">
        <span className={styles.crumb}>{area ? WORK_AREA_LABEL[area].toUpperCase() : 'EXERCISE'}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <h2 className={styles.title}>{name}</h2>

        <div className={styles.facts}>
          <div className={styles.fact}>
            <span className={styles.label}>Latest</span>
            <span className={styles.value}>{latest ? n1(latest.value) : '-'}{latest && <small> {unit}</small>}</span>
            <span className={styles.sub}>{latest ? fmtDay(latest.date) : 'nothing logged'}</span>
          </div>
          <div className={styles.fact}>
            <span className={styles.label}>Best</span>
            <span className={styles.value}>{best !== null ? n1(best) : '-'}{best !== null && <small> {unit}</small>}</span>
            <span className={styles.sub}>{first && latest && latest !== first ? `${latest.value - first.value >= 0 ? '+' : ''}${n1(latest.value - first.value)} since ${fmtDay(first.date)}` : '-'}</span>
          </div>
          <div className={styles.fact}>
            <span className={styles.label}>Done</span>
            <span className={styles.value}>{done.length}<small> sessions</small></span>
            <span className={styles.sub}>{done.length ? `last ${fmtDay(done[done.length - 1].day)}` : 'not yet'}</span>
          </div>
        </div>

        {suggestion && (
          <div className={styles.next}>
            <span className={styles.nextValue}>NEXT TIME {n1(suggestion.value)} {unit}</span>
            <span className={styles.nextWhy}>{suggestion.reason}</span>
          </div>
        )}

        {values.length >= 2 ? (
          <div className={styles.chart} role="img" aria-label={`${name}: ${values.length} loads from ${n1(values[0])} to ${n1(values[values.length - 1])} ${unit}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entries.map(e => ({ d: fmtDay(e.date), v: e.value }))} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="rgba(24,22,16,0.12)" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#181610' }} tickLine={false} axisLine={{ stroke: '#181610', strokeWidth: 2 }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis width={32} ticks={ticks} domain={[0, ticks[ticks.length - 1]]} tick={{ fontSize: 11, fill: '#181610' }} tickLine={false} axisLine={false} />
                <Line type="linear" dataKey="v" stroke="#E64D19" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles.empty}>
            {values.length === 1 ? `One load so far: ${n1(values[0])} ${unit}. The line starts with the second.` : axis ? 'No load logged yet. It is saved when the last set is done.' : 'Bodyweight work: it moves up the variation ladder, not the load.'}
          </div>
        )}

        {ex?.progression && (
          <div className={styles.block}>
            <div className={styles.blockLabel}>HOW IT PROGRESSES</div>
            <p className={styles.text}>{ex.progression}</p>
          </div>
        )}

        {done.length > 0 && (
          <div className={styles.block}>
            <div className={styles.blockLabel}>RECENT SESSIONS</div>
            <div className={styles.rows}>
              {done.slice(-8).reverse().map((d, i) => {
                const load = entries.find(e => e.date === d.day);
                return (
                  <div key={`${d.day}-${i}`} className={styles.row}>
                    <span>{fmtDay(d.day)}</span>
                    <span className={styles.rowLoad}>{load ? `${n1(load.value)} ${unit}` : ''}</span>
                    <span className={d.planned !== undefined && d.sets < d.planned ? styles.short : styles.sets}>
                      {d.sets}{d.planned !== undefined ? `/${d.planned}` : ''} sets
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
