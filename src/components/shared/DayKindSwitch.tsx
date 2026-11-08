'use client';

// =============================================================================
// DayKindSwitch — CAVE / CLIMB / REST on top of TODAY (v47)
//
// The athlete says what today is; the pick follows (`recommend.ts`). A second
// tap clears it. REST is the REST DAY of ADJUST TODAY (nothing is due and
// levels do not fade).
// =============================================================================

import { useStore } from '@/store/store';
import type { ActiveDay } from '@/core/today';
import styles from './DayKindSwitch.module.css';

const KINDS = [
  { key: 'CAVE', label: 'CAVE', hint: 'Gym, 60+ min' },
  { key: 'CLIMB', label: 'CLIMB', hint: 'Wall, then back' },
  { key: 'REST', label: 'REST', hint: 'Nothing due' },
] as const;

export default function DayKindSwitch({ day }: { day: ActiveDay }) {
  const updateDay = useStore(s => s.updateDay);
  const current = day.off === 'REST' ? 'REST' : day.kind;

  const choose = (key: (typeof KINDS)[number]['key']) => {
    if (key === current) {
      updateDay(key === 'REST' ? { off: undefined } : { kind: undefined });
    } else if (key === 'REST') {
      updateDay({ off: 'REST', kind: undefined });
    } else {
      updateDay({ kind: key, ...(day.off === 'REST' ? { off: undefined } : {}) });
    }
  };

  return (
    <section className={styles.wrap} aria-label="What is today">
      <div className={styles.label}>TODAY IS</div>
      <div className={styles.row} role="group">
        {KINDS.map(k => {
          const on = current === k.key;
          return (
            <button
              key={k.key}
              className={`${styles.btn}${on ? ` ${styles.on}` : ''}`}
              aria-pressed={on}
              onClick={() => choose(k.key)}
            >
              <span className={styles.name}>{k.label}</span>
              <span className={styles.hint}>{k.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
