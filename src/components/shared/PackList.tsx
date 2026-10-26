'use client';

import { exerciseLibrary } from '@/core/reserve';
import { estimateDuration, scaleExercise } from '@/core/engine';
import type { PackOffer } from '@/core/session-edit';
import type { EnergyKey, Progress } from '@/core/types';
import styles from './ReservePicker.module.css';

/**
 * The add-on packs: short blocks added in one tap, before a session or in the
 * middle of one. Each row says what would go in today and how long it adds;
 * a pack with nothing left to add says why.
 */
export default function PackList({ offers, added, energy, progress, onAdd }: {
  offers: PackOffer[];
  /** Pack ids added in this visit, marked ADDED. */
  added: string[];
  energy: EnergyKey;
  progress: Progress;
  onAdd: (offer: PackOffer) => void;
}) {
  const lib = exerciseLibrary();
  return (
    <>
      {offers.map(offer => {
        const { pack, ids, closed } = offer;
        const done = added.includes(pack.id);
        const exs = ids.map(id => lib.get(id)!).filter(Boolean);
        const minutes = exs.length ? estimateDuration(exs.map(e => scaleExercise(e, energy, progress))) : 0;
        return (
          <div key={pack.id} className={styles.row}>
            <div className={styles.body}>
              <div className={styles.name}>{pack.name}{exs.length ? ` · +${minutes} MIN` : ''}</div>
              <div className={styles.meta}>{pack.note}</div>
              <div className={styles.meta}>{closed ?? exs.map(e => e.name).join(', ')}</div>
            </div>
            <button
              className={`${styles.add}${done ? ` ${styles.addDone}` : ''}`}
              disabled={done || !ids.length}
              onClick={() => onAdd(offer)}
            >{done ? 'ADDED' : 'ADD'}</button>
          </div>
        );
      })}
    </>
  );
}
