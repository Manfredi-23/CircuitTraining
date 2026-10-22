'use client';

import Image from 'next/image';
import { CONFIG } from '@/core/config';
import { displaySubtitle } from '@/core/data-index';
import { getCapacityLevel } from '@/core/engine';
import Led from './Led';
import type { BlockWeek } from '@/core/block';
import type { Circuit, EnergyKey, Progress } from '@/core/types';
import styles from './SessionCard.module.css';

/**
 * The big session card: number, title, the animated figure, the energy tabs
 * and the info bar. Tapping the card opens what is in the session; the energy
 * tabs and the info button do their own thing.
 */
export default function SessionCard({
  circuit, progress, energy, suggested, suggestedWhy, duration, block, onEnergy, onOpen, highlight = false,
}: {
  /** Today's pick: its number lights in the one orange. */
  highlight?: boolean;
  circuit: Circuit;
  progress: Progress;
  energy: EnergyKey;
  /** The energy Apple Health suggests today, marked on its tab. */
  suggested?: EnergyKey;
  suggestedWhy?: string;
  duration: number;
  block: BlockWeek;
  onEnergy: (e: EnergyKey) => void;
  onOpen: () => void;
}) {
  // Dots map the weakest capacity this session trains to a filled count.
  const minLevel = circuit.capacities.reduce(
    (min, c) => Math.min(min, getCapacityLevel(progress, c)),
    CONFIG.levels.length,
  );
  const filledDots = minLevel <= 2 ? 1 : minLevel <= 4 ? 2 : 3;

  return (
    <div
      className={styles.card}
      onClick={onOpen}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      role="button"
      tabIndex={0}
      aria-label={`What is in ${circuit.title}`}
    >
      <Led
        text={circuit.circuitNum}
        dot={6}
        lit={highlight ? 'var(--accent)' : 'var(--ink)'}
        unlit="var(--led-off)"
        animate
        className={styles.cardNum}
        label={`Session ${circuit.circuitNum}`}
      />

      <div className={styles.titleBlock}>
        <div className={styles.cardTitle}>{circuit.title}</div>
        <div className={styles.titleDivider}>
          <span className={styles.cardSubtitle}>{displaySubtitle(circuit)}</span>
        </div>
      </div>

      <div className={styles.illustrationWrap}>
        {/* The dot-matrix figures animate themselves. Under reduced motion the
            page swaps in the still key pose: an SVG loaded as an image does
            not reliably see that preference itself. */}
        <picture className={styles.illustrationPicture}>
          <source media="(prefers-reduced-motion: reduce)" srcSet={`/images/still/${circuit.illustration}`} />
          <Image
            src={`/images/${circuit.illustration}`}
            alt=""
            width={200}
            height={200}
            className={`${styles.illustration} ${styles.illusPop}`}
          />
        </picture>
      </div>

      <div className={styles.energyTabs} role="tablist" aria-label="Energy">
        {(Object.keys(CONFIG.energy) as EnergyKey[]).map(e => (
          <button
            key={e}
            role="tab"
            aria-selected={e === energy}
            className={`${styles.energyTab}${e === energy ? ` ${styles.energyTabActive}` : ''}${e === suggested ? ` ${styles.energyTabSuggested}` : ''}`}
            title={e === suggested && suggestedWhy ? `Suggested by Apple Health: ${suggestedWhy}` : undefined}
            onClick={ev => { ev.stopPropagation(); onEnergy(e); }}
          >
            {e}
          </button>
        ))}
      </div>

      <div className={styles.infoBar}>
        <span className={styles.duration}>
          {duration} min
          <span className={block.deload ? styles.blockDeload : styles.blockWeek}>
            {block.deload ? 'DELOAD' : `WEEK ${block.week}/${block.buildWeeks}`}
          </span>
        </span>
        <div className={styles.infoRight}>
          <div className={styles.dots} aria-label={`Level ${minLevel}`}>
            {[0, 1, 2].map(i => (
              <div key={i} className={`${styles.dot}${i < filledDots ? ` ${styles.dotFilled}` : ''}`} />
            ))}
          </div>
          <span className={styles.infoBtn} aria-hidden="true">i</span>
        </div>
      </div>
    </div>
  );
}
