'use client';

import Led from '@/components/shared/Led';
import type { TabName } from '@/core/types';
import styles from './TabBar.module.css';

const TABS: { key: TabName; label: string }[] = [
  { key: 'today', label: 'TODAY' },
  { key: 'train', label: 'TRAIN' },
  { key: 'stats', label: 'STATS' },
  { key: 'log', label: 'LOG' },
];

/**
 * The four destinations, at the bottom where the thumb is. Each carries a
 * pixel icon on the LED grid; the active one lights up and takes the 6px
 * underline every tab in the app uses.
 */
export default function TabBar({ tab, onTab }: { tab: TabName; onTab: (t: TabName) => void }) {
  return (
    <nav className={styles.bar} aria-label="Main">
      <div className={styles.inner} role="tablist">
        {TABS.map(t => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={on}
              className={`${styles.tab}${on ? ` ${styles.active}` : ''}`}
              onClick={() => onTab(t.key)}
            >
              <Led icon={t.key} dot={3.6} lit={on ? 'var(--ink)' : 'var(--ink-dim)'} unlit={on ? 'var(--led-off)' : 'none'} animate={on} />
              <span className={styles.label}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
