'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { SORE_AREAS, TIME_CAPS, activeDay, describeDay, isEmptyDay, type OffKind, type SoreArea } from '@/core/today';
import styles from './DayControls.module.css';

/**
 * What the logs cannot know about today, folded into one line on TODAY:
 * time, kit, soreness, a rest or sick day. Every tap applies at once and the
 * recommendation above follows. Time, kit and off hold for today; soreness
 * for today and tomorrow.
 */
export default function DayControls() {
  const dayPlan = useStore(s => s.dayPlan);
  const updateDay = useStore(s => s.updateDay);
  const clearDay = useStore(s => s.clearDay);
  const [open, setOpen] = useState(false);
  const day = activeDay(dayPlan);
  const empty = isEmptyDay(day);

  const toggleSore = (a: SoreArea) => {
    const sore = day.sore.includes(a) ? day.sore.filter(x => x !== a) : [...day.sore, a];
    updateDay({ sore: sore.length ? sore : undefined });
  };
  const toggleOff = (k: OffKind) => updateDay({ off: day.off === k ? undefined : k });

  const Chip = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button className={`${styles.chip}${on ? ` ${styles.chipOn}` : ''}`} aria-pressed={on} onClick={onClick}>{label}</button>
  );

  return (
    <section className={styles.box}>
      <button className={styles.head} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className={styles.headText}>
          <span className={styles.label}>ADJUST TODAY</span>
          <span className={empty ? styles.summary : styles.summaryOn}>{empty ? 'Time, kit, soreness, a day off' : describeDay(day)}</span>
        </span>
        <span className={styles.chev} aria-hidden="true">{open ? '-' : '+'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.group}>
            <div className={styles.groupLabel}>TIME</div>
            <div className={styles.chips}>
              <Chip on={day.minutes === null} label="ANY" onClick={() => updateDay({ minutes: undefined })} />
              {TIME_CAPS.map(m => <Chip key={m} on={day.minutes === m} label={`${m}`} onClick={() => updateDay({ minutes: m })} />)}
            </div>
            <div className={styles.hint}>Minutes. Whole exercises go, lightest first. Rest is never shortened.</div>
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>KIT</div>
            <div className={styles.chips}>
              <Chip on={!day.noKit} label="AS USUAL" onClick={() => updateDay({ noKit: undefined })} />
              <Chip on={day.noKit} label="MAT ONLY" onClick={() => updateDay({ noKit: true })} />
            </div>
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>SORE</div>
            <div className={styles.chips}>
              {SORE_AREAS.map(a => <Chip key={a} on={day.sore.includes(a)} label={a} onClick={() => toggleSore(a)} />)}
            </div>
            <div className={styles.hint}>Today and tomorrow: sessions that load it step aside.</div>
          </div>
          <div className={styles.group}>
            <div className={styles.groupLabel}>DAY OFF</div>
            <div className={styles.chips}>
              <Chip on={day.off === 'REST'} label="REST DAY" onClick={() => toggleOff('REST')} />
              <Chip on={day.off === 'SICK'} label="SICK" onClick={() => toggleOff('SICK')} />
            </div>
            <div className={styles.hint}>Nothing is due, and levels do not fade today.</div>
          </div>
          {!empty && <button className={styles.clear} onClick={clearDay}>CLEAR TODAY</button>}
        </div>
      )}
    </section>
  );
}
