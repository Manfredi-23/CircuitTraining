'use client';

import type { TabName } from '@/core/types';
import styles from './TabBar.module.css';

const TABS: { key: TabName; label: string }[] = [
  { key: 'today', label: 'TODAY' },
  { key: 'train', label: 'TRAIN' },
  { key: 'stats', label: 'STATS' },
  { key: 'log', label: 'LOG' },
];

/** The four destinations, at the bottom where the thumb is. Same tab language as the rest: 6px under the active one. */
export default function TabBar({ tab, onTab }: { tab: TabName; onTab: (t: TabName) => void }) {
  return (
    <nav className={styles.bar} aria-label="Main">
      <div className={styles.inner} role="tablist">
        {TABS.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === tab}
            className={`${styles.tab}${t.key === tab ? ` ${styles.active}` : ''}`}
            onClick={() => onTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
