'use client';

import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import {
  GYM_COLOURS, gradeLabel, gradesOf, getBestPerWeek, getClimbSummary, getPyramid, viewFor, viewScale,
  type ClimbView,
} from '@/core/climbing';
import type { ClimbSession } from '@/core/types';
import styles from './ClimbStats.module.css';

const VIEWS: ClimbView[] = ['BOARD', 'GYM', 'ROCK', 'ROPE'];

/**
 * Climbing numbers, one grade scale at a time. Board and outdoor boulders are
 * both Font but stay apart: a board grade at 40 degrees and a rock grade are
 * not the same currency.
 */
export default function ClimbStats({ sessions }: { sessions: ClimbSession[] }) {
  const latest = sessions.length ? viewFor(sessions[sessions.length - 1]) : 'GYM';
  const [view, setView] = useState<ClimbView>(latest);

  const scale = viewScale(view);
  const grades = gradesOf(scale);
  const pyramid = useMemo(() => getPyramid(sessions, view), [sessions, view]);
  const weeks = useMemo(() => getBestPerWeek(sessions, view), [sessions, view]);
  const summary = useMemo(() => getClimbSummary(sessions, view), [sessions, view]);
  const widest = Math.max(1, ...pyramid.map(r => r.flash + r.send + r.project));

  const sendIdx = weeks.flatMap(w => [w.bestSend, w.bestFlash]).filter((v): v is number => v !== null);
  const yMin = sendIdx.length ? Math.max(0, Math.min(...sendIdx) - 1) : 0;
  const yMax = sendIdx.length ? Math.min(grades.length - 1, Math.max(...sendIdx) + 1) : grades.length - 1;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist">
        {VIEWS.map(v => (
          <button
            key={v}
            role="tab"
            aria-selected={v === view}
            className={`${styles.tab}${v === view ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
      </div>

      {summary.sessions === 0 ? (
        <div className={styles.empty}>Nothing logged here yet.</div>
      ) : (
        <>
          <div className={styles.summary}>
            <div><b>{summary.sessions}</b> sessions</div>
            <div><b>{summary.sends}</b> sends of {summary.climbs}</div>
            <div><b>{summary.sends ? Math.round((summary.flashes / summary.sends) * 100) : 0}%</b> flashed</div>
            <div>Hardest <b>{summary.hardestSend ? gradeLabel(summary.hardestSend) : '-'}</b></div>
            <div>Hardest flash <b>{summary.hardestFlash ? gradeLabel(summary.hardestFlash) : '-'}</b></div>
          </div>

          <div className={styles.subTitle}>
            PYRAMID
            <span className={styles.legend}>
              <i className={styles.kFlash} /> flash <i className={styles.kSend} /> send <i className={styles.kProj} /> project
            </span>
          </div>
          <div className={styles.pyramid}>
            {pyramid.map(r => {
              const colour = GYM_COLOURS.find(c => c.id === r.grade);
              return (
                <div key={r.grade} className={styles.pRow}>
                  <span className={styles.pGrade}>
                    {colour && <span className={styles.swatch} style={{ background: colour.hex }} />}
                    {gradeLabel(r.grade)}
                  </span>
                  <span className={styles.pBar}>
                    {r.flash > 0 && <span className={styles.segFlash} style={{ flexGrow: r.flash }} />}
                    {r.send > 0 && <span className={styles.segSend} style={{ flexGrow: r.send }} />}
                    {r.project > 0 && <span className={styles.segProj} style={{ flexGrow: r.project }} />}
                    <span style={{ flexGrow: widest - r.flash - r.send - r.project }} />
                  </span>
                  <span className={styles.pAtt}>
                    {r.attemptsPerSend !== null ? `${r.attemptsPerSend.toFixed(1)} goes` : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {weeks.length > 1 && (
            <>
              <div className={styles.subTitle}>
                BEST PER WEEK
                <span className={styles.legend}>
                  <i className={styles.kLine} /> send <i className={styles.kDash} /> flash
                </span>
              </div>
              <div className={styles.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeks} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
                    <XAxis dataKey="week" hide />
                    <YAxis
                      domain={[yMin, yMax]}
                      allowDecimals={false}
                      tickCount={yMax - yMin + 1}
                      width={48}
                      tick={{ fontSize: 10, fill: '#181610' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(i: number) => gradeLabel(grades[i] ?? '')}
                    />
                    <Line type="stepAfter" dataKey="bestSend" stroke="#181610" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
                    <Line type="stepAfter" dataKey="bestFlash" stroke="#E64D19" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
