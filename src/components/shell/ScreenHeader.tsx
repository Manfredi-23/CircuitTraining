'use client';

import type { ReactNode } from 'react';
import styles from './ScreenHeader.module.css';

/**
 * The top of every tab: its name as the page title, one line about what is
 * on it, and SETTINGS at the right. TODAY puts the logo above.
 */
export default function ScreenHeader({ title, sub, onSettings, children }: {
  title: string;
  sub?: ReactNode;
  onSettings: () => void;
  children?: ReactNode;
}) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        {children ?? <span />}
        <button className={styles.settings} onClick={onSettings}>SETTINGS</button>
      </div>
      <h1 className={styles.title}>{title}</h1>
      {sub && <p className={styles.sub}>{sub}</p>}
    </header>
  );
}
