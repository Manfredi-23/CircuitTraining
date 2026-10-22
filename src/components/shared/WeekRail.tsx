'use client';

import { useMemo } from 'react';
import { useStore } from '@/store/store';
import { railLine, weekRail } from '@/core/week-rail';
import styles from './WeekRail.module.css';

const SLOTS = 4;

/**
 * This week as seven LED columns, filled from the bottom: a climb in orange,
 * a session in ink, an outside day in grey. A day still ahead with something
 * planned shows a ring; today takes the 6px underline.
 */
export default function WeekRail() {
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const activityLog = useStore(s => s.activityLog);
  const weekPlan = useStore(s => s.weekPlan);
  const days = useMemo(() => weekRail(sessionLog, climbLog, activityLog, weekPlan), [sessionLog, climbLog, activityLog, weekPlan]);

  return (
    <section className={styles.rail} aria-label={`This week. ${railLine(days)}`}>
      <div className={styles.days}>
        {days.map(d => {
          const fills: string[] = [
            ...Array(d.climbs).fill(styles.climb),
            ...Array(d.sessions).fill(styles.session),
            ...Array(d.outside).fill(styles.outside),
          ].slice(0, SLOTS);
          const ring = d.planned > 0 && !d.restPlanned && fills.length === 0 && (d.future || d.today);
          return (
            <div key={d.date} className={`${styles.day}${d.today ? ` ${styles.today}` : ''}`}>
              <div className={styles.stack} aria-hidden="true">
                {Array.from({ length: SLOTS }, (_, i) => {
                  const slot = SLOTS - 1 - i;
                  const cls = fills[slot] ?? (slot === 0 && ring ? styles.planned : styles.off);
                  return <span key={i} className={`${styles.dot} ${cls}`} />;
                })}
              </div>
              <span className={styles.letter}>{d.restPlanned && d.future ? '-' : d.letter}</span>
            </div>
          );
        })}
      </div>
      <p className={styles.line}>{railLine(days)}</p>
    </section>
  );
}
