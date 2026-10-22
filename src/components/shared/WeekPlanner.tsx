'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { getModeData } from '@/core/data-index';
import { CONFIG } from '@/core/config';
import { itemLabel, weekdayOf, MAX_PER_DAY, WEEKDAYS, type PlanItem } from '@/core/plan';
import type { Mode } from '@/core/types';
import styles from './WeekPlanner.module.css';

const same = (a: PlanItem, b: PlanItem) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The week, Monday to Sunday: what each day is for. TODAY leads with the
 * day's plan and steps around it only for a safety reason, saying which.
 */
export default function WeekPlanner() {
  const weekPlan = useStore(s => s.weekPlan);
  const routines = useStore(s => s.routines);
  const setPlanDay = useStore(s => s.setPlanDay);
  const [editing, setEditing] = useState<number | null>(null);
  const today = weekdayOf(new Date());

  const items = (d: number) => weekPlan[d] ?? [];
  const toggle = (d: number, item: PlanItem) => {
    const cur = items(d);
    const has = cur.some(i => same(i, item));
    if (has) setPlanDay(d, cur.filter(i => !same(i, item)));
    else if (item.kind === 'REST') setPlanDay(d, [item]);
    else if (cur.length < MAX_PER_DAY) setPlanDay(d, [...cur.filter(i => i.kind !== 'REST'), item]);
  };

  const options: { group: string; items: PlanItem[] }[] = [
    { group: 'DAY', items: [{ kind: 'CLIMB' }, { kind: 'REST' }] },
    ...(routines.length ? [{ group: 'YOUR ROUTINES', items: routines.map(r => ({ kind: 'ROUTINE' as const, routineId: r.id })) }] : []),
    ...(CONFIG.modes as Mode[]).map(m => ({
      group: m,
      items: getModeData(m).map(c => ({ kind: 'SESSION' as const, mode: m, circuitId: c.id })),
    })),
  ];

  return (
    <section className={`${styles.box} dot-rule`}>
      <div className={styles.head}>
        <h2 className="section-label">THIS WEEK</h2>
        <span className={styles.sub}>The plan leads on TODAY</span>
      </div>
      <div className={styles.days}>
        {WEEKDAYS.map((label, d) => (
          <button key={label} className={styles.day} onClick={() => setEditing(d)} aria-label={`Plan ${label}`}>
            <span className={d === today ? styles.dayNameToday : styles.dayName}>{label}</span>
            <span className={items(d).length ? styles.dayItems : styles.dayEmpty}>
              {items(d).length ? items(d).map(i => itemLabel(i, routines)).join(' + ') : 'Open: the app picks'}
            </span>
            <span className={styles.chev} aria-hidden="true">&rarr;</span>
          </button>
        ))}
      </div>

      {editing !== null && (
        <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={`Plan ${WEEKDAYS[editing]}`}>
          <div className="overlay-header">
            <span className={styles.crumb}>PLAN {WEEKDAYS[editing]}</span>
            <button className="overlay-close" onClick={() => setEditing(null)} aria-label="Close">X</button>
          </div>
          <p className={styles.note}>Up to {MAX_PER_DAY}, in the order tapped: e.g. bouldering, then CAVE 02. Nothing picked leaves the day to the app.</p>
          <div className={styles.scroll}>
            {options.map(o => (
              <div key={o.group} className={styles.group}>
                <div className={styles.groupLabel}>{o.group}</div>
                <div className={styles.chips}>
                  {o.items.map(it => {
                    const on = items(editing).some(i => same(i, it));
                    const label = it.kind === 'SESSION' ? itemLabel(it, routines).replace(`${it.mode} `, '') : itemLabel(it, routines);
                    return (
                      <button key={JSON.stringify(it)} className={`${styles.chip}${on ? ` ${styles.chipOn}` : ''}`} aria-pressed={on} onClick={() => toggle(editing, it)}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button className={styles.clear} onClick={() => setPlanDay(editing, [])}>CLEAR DAY</button>
            <button className={styles.done} onClick={() => setEditing(null)}>DONE</button>
          </div>
        </div>
      )}
    </section>
  );
}
