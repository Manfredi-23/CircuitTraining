'use client';

import { useState } from 'react';
import { focusDrills, type WallFocus } from '@/core/wall';
import styles from './WallCard.module.css';

const KIND_LABEL = { TECHNIQUE: 'FEET + TECHNIQUE', HEAD: 'HEAD', STAMINA: 'STAMINA' } as const;

/**
 * ON THE WALL, on TODAY: a focus for the next climbing session, never a
 * session of its own. Folded to one line; open by default on a day bouldering
 * is planned or has just been done.
 */
export default function WallCard({ focus, today }: { focus: WallFocus; today: boolean }) {
  const [open, setOpen] = useState(today);
  const drills = focusDrills(focus);
  return (
    <section className={styles.box}>
      <button className={styles.head} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className={styles.headText}>
          <span className={styles.label}>{today ? 'ON THE WALL TODAY' : 'NEXT TIME ON THE WALL'}</span>
          <span className={styles.summary}>{drills.map(d => d.drill.name).join(' · ')}</span>
        </span>
        <span className={styles.chev} aria-hidden="true">{open ? '-' : '+'}</span>
      </button>
      {open && (
        <div className={styles.body}>
          {drills.map(({ drill, why }) => (
            <div key={drill.id} className={styles.drill}>
              <div className={styles.kind}>{KIND_LABEL[drill.kind]}</div>
              <div className={styles.nameRow}>
                <span className={styles.name}>{drill.name}</span>
                <span className={styles.dose}>{drill.dose}</span>
              </div>
              <p className={styles.how}>{drill.how}</p>
              <p className={styles.why}>{why}</p>
            </div>
          ))}
          {focus.finger && (
            <div className={styles.finger}>
              <div className={styles.kind}>RING FINGER</div>
              <p className={styles.how}>{focus.finger}</p>
            </div>
          )}
          <p className={styles.foot}>Tick what you did when you log the climbs: the next focus follows from it.</p>
        </div>
      )}
    </section>
  );
}
