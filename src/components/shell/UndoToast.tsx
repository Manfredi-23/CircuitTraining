'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';
import styles from './UndoToast.module.css';

/** Six seconds to take a delete back. Sits above the tab bar. */
export default function UndoToast() {
  const undo = useStore(s => s.undo);
  const applyUndo = useStore(s => s.applyUndo);
  const clearUndo = useStore(s => s.clearUndo);

  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(clearUndo, 6000);
    return () => window.clearTimeout(t);
  }, [undo, clearUndo]);

  if (!undo) return null;
  return (
    <div className={styles.toast} role="status" key={undo.at}>
      <span>{undo.text}</span>
      <button className={styles.btn} onClick={applyUndo}>UNDO</button>
    </div>
  );
}
