'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { historyDays, type HistoryItem } from '@/core/history';
import { addDays, localDate } from '@/core/dates';
import ScreenHeader from '@/components/shell/ScreenHeader';
import styles from './LogScreen.module.css';

const DAY_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const PAGE = 14;

function dayLabel(day: string, today: string): string {
  if (day === today) return 'Today';
  if (day === addDays(today, -1)) return 'Yesterday';
  const [y, m, d] = day.split('-').map(Number);
  return DAY_FMT.format(new Date(y, m - 1, d));
}

/**
 * LOG: add what the app did not see (a climb, a hike), and read back
 * everything that was done, newest first. A tap opens the entry.
 */
export default function LogScreen({ onSettings, onSession }: { onSettings: () => void; onSession: (index: number) => void }) {
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const activityLog = useStore(s => s.activityLog);
  const openClimbLog = useStore(s => s.openClimbLog);
  const openActivityLog = useStore(s => s.openActivityLog);
  const [shown, setShown] = useState(PAGE);
  const days = useMemo(() => historyDays(sessionLog, climbLog, activityLog), [sessionLog, climbLog, activityLog]);
  const today = localDate();
  const total = sessionLog.length + climbLog.length + activityLog.length;

  const open = (it: HistoryItem) => {
    if (it.kind === 'CLIMB') openClimbLog(it.ref);
    else if (it.kind === 'ACTIVITY') openActivityLog(it.ref);
    else onSession(Number(it.ref));
  };

  return (
    <div className={`screen screen-enter tab-screen ${styles.screen}`}>
      <ScreenHeader
        title="LOG"
        sub={total ? `${total} entries. Everything you did, newest first.` : 'Everything you did, newest first.'}
        onSettings={onSettings}
      />

      <div className={styles.add}>
        <button className={styles.addBtn} onClick={() => openClimbLog(null)}>
          <span className={styles.addTitle}>+ CLIMB</span>
          <span className={styles.addSub}>Gym, board or rock</span>
        </button>
        <button className={styles.addBtn} onClick={() => openActivityLog(null)}>
          <span className={styles.addTitle}>+ ACTIVITY</span>
          <span className={styles.addSub}>Hike, tour, run, ride</span>
        </button>
      </div>

      {days.length === 0 && (
        <div className={styles.empty}>Nothing logged yet. Sessions from TODAY and TRAIN land here on their own; climbs and outside days are added above.</div>
      )}

      {days.slice(0, shown).map(d => (
        <section key={d.day} className={`${styles.day} dot-rule`}>
          <h2 className={styles.dayLabel}>{dayLabel(d.day, today)}</h2>
          <div className={styles.items}>
            {d.items.map(it => (
              <button key={`${it.kind}-${it.ref}`} className={styles.item} onClick={() => open(it)}>
                <span className={styles.kind} data-kind={it.kind} aria-hidden="true" />
                <span className={styles.itemBody}>
                  <span className={styles.itemTitle}>{it.title}</span>
                  <span className={styles.itemDetail}>{it.detail}</span>
                </span>
                <span className={styles.chev} aria-hidden="true">&rarr;</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {days.length > shown && (
        <button className={styles.more} onClick={() => setShown(n => n + PAGE)}>
          SHOW {Math.min(PAGE, days.length - shown)} MORE DAYS
        </button>
      )}
    </div>
  );
}
