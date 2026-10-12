'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { SORE_AREAS, TIME_CAPS, activeDay, type OffKind, type SoreArea } from '@/core/today';
import styles from './DaySheet.module.css';

/**
 * TODAY: what the logs cannot know. Time, kit and rest or sick hold for today;
 * soreness for today and tomorrow. Every tap applies at once.
 */
export default function DaySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dayPlan = useStore(s => s.dayPlan);
  const updateDay = useStore(s => s.updateDay);
  const clearDay = useStore(s => s.clearDay);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) requestAnimationFrame(() => setEntered(true));
    else setEntered(false);
  }, [open]);

  if (!open) return null;
  const day = activeDay(dayPlan);

  const toggleSore = (a: SoreArea) => {
    const sore = day.sore.includes(a) ? day.sore.filter(x => x !== a) : [...day.sore, a];
    updateDay({ sore: sore.length ? sore : undefined });
  };
  const toggleOff = (k: OffKind) => updateDay({ off: day.off === k ? undefined : k });

  const Chip = ({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) => (
    <button className={`${styles.chip}${on ? ` ${styles.chipOn}` : ''}`} aria-pressed={on} onClick={onClick}>{label}</button>
  );

  return (
    <div className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`} role="dialog" aria-modal="true" aria-label="Today">
      <div className="overlay-header">
        <span className={styles.crumb}>TODAY</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <section className={styles.section}>
          <div className={styles.label}>TIME</div>
          <div className={styles.chips}>
            <Chip on={day.minutes === null} label="ANY" onClick={() => updateDay({ minutes: undefined })} />
            {TIME_CAPS.map(m => (
              <Chip key={m} on={day.minutes === m} label={`${m} MIN`} onClick={() => updateDay({ minutes: m })} />
            ))}
          </div>
          <div className={styles.hint}>The session is cut to fit: whole exercises go, lightest first. Rest is never shortened.</div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>KIT</div>
          <div className={styles.chips}>
            <Chip on={!day.noKit} label="AS USUAL" onClick={() => updateDay({ noKit: undefined })} />
            <Chip on={day.noKit} label="NO KIT: MAT ONLY" onClick={() => updateDay({ noKit: true })} />
          </div>
          <div className={styles.hint}>Away or without the band and edge: a mat-only DAILY.</div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>SORE</div>
          <div className={styles.chips}>
            {SORE_AREAS.map(a => <Chip key={a} on={day.sore.includes(a)} label={a} onClick={() => toggleSore(a)} />)}
          </div>
          <div className={styles.hint}>
            Today and tomorrow: sessions that load it step aside. Sore forearms keep finger work off.
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.label}>DAY OFF</div>
          <div className={styles.chips}>
            <Chip on={day.off === 'REST'} label="REST DAY" onClick={() => toggleOff('REST')} />
            <Chip on={day.off === 'SICK'} label="SICK" onClick={() => toggleOff('SICK')} />
          </div>
          <div className={styles.hint}>Nothing is recommended, and the day does not count towards losing levels.</div>
        </section>
      </div>

      <div className={styles.actions}>
        <button className={styles.clear} onClick={() => { clearDay(); }}>CLEAR TODAY</button>
        <button className={styles.done} onClick={onClose}>DONE</button>
      </div>
    </div>
  );
}
