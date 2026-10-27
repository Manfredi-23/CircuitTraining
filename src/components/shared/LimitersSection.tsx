'use client';

import { useMemo } from 'react';
import { getLimiters, LIMITER_WINDOW_DAYS, MIN_TAGGED, type StyleStat } from '@/core/limiters';
import type { ClimbSession } from '@/core/types';
import styles from './LimitersSection.module.css';

const pct = (r: number) => `${Math.round(r * 100)}%`;

/** One style: its send rate as a bar, the athlete's average as a tick. */
function StyleRow({ s, average, weak }: { s: StyleStat; average: number; weak: boolean }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.name}>{s.label}</span>
        <span className={styles.value}>{pct(s.rate)}<small> of {s.climbs}</small></span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <span className={weak ? styles.fillWeak : styles.fill} style={{ width: pct(s.rate) }} />
        <span className={styles.avg} style={{ left: pct(average) }} />
      </div>
    </div>
  );
}

/**
 * WHERE YOU FALL, on STATS CLIMBING: the styles sent less often than the
 * athlete's own average, the ones sent more often, why climbs fell, and how
 * often a go was given at 110%. Read from the tags on logged climbs.
 */
export default function LimitersSection({ climbLog }: { climbLog: ClimbSession[] }) {
  const l = useMemo(() => getLimiters(climbLog), [climbLog]);
  if (!l.climbs) return <div className={styles.empty}>Log climbs from LOG, + CLIMB, and tag their style.</div>;

  const maxReason = Math.max(1, ...l.reasons.map(r => r.count));
  return (
    <div className={styles.wrap}>
      {l.enough ? (
        <>
          {l.weakest.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>Sent least</div>
              {l.weakest.map(s => <StyleRow key={s.tag} s={s} average={l.average} weak />)}
            </div>
          )}
          {l.strongest.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupTitle}>Sent most</div>
              {l.strongest.map(s => <StyleRow key={s.tag} s={s} average={l.average} weak={false} />)}
            </div>
          )}
          <div className={styles.legend}><i className={styles.legendAvg} /> your average, {pct(l.average)} sent</div>
        </>
      ) : (
        <p className={styles.note}>{l.tagged} of {MIN_TAGGED} tagged climbs. Tap + STYLE under a climb in the log.</p>
      )}

      {l.reasons.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupTitle}>Why climbs fell ({l.falls})</div>
          {l.reasons.map(r => (
            <div key={r.reason} className={styles.reason}>
              <span className={styles.reasonName}>{r.label}</span>
              <span className={styles.reasonTrack}>
                <span className={r.kind === 'head' ? styles.reasonFillHead : styles.reasonFill} style={{ width: `${(r.count / maxReason) * 100}%` }} />
              </span>
              <span className={styles.reasonCount}>{r.count}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.head}>
        <div className={styles.groupTitle}>The head</div>
        <p className={styles.note}>
          A go at 110% in <b>{l.tryHardSessions} of {l.sessions}</b> climbing sessions
          {l.falls ? `; ${l.headFalls} of ${l.falls} falls were backing off or fear` : ''}.
          {l.sessions > 0 && l.tryHardSessions / l.sessions < 0.5 ? ' One fully committed go every session is the habit to build.' : ''}
        </p>
      </div>
      <p className={styles.hint}>The last {LIMITER_WINDOW_DAYS / 7} weeks. A style needs four tagged climbs before it is named.</p>
    </div>
  );
}
