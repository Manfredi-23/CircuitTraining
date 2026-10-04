'use client';

import { getProtocol } from '@/core/protocols';
import type { Exercise, FormGuide as FormGuideData } from '@/core/types';
import styles from './FormGuide.module.css';

const FORM_SECTIONS: { key: keyof FormGuideData; label: string }[] = [
  { key: 'setup', label: 'SETUP' },
  { key: 'execution', label: 'EXECUTION' },
  { key: 'cue', label: 'CUE' },
  { key: 'breathing', label: 'BREATHING' },
  { key: 'mistakes', label: 'MISTAKES' },
];

interface Props {
  exercise: Exercise;
  open: boolean;
  onToggle: () => void;
}

/** The collapsible FORM GUIDE: the exercise's form notes, then the protocol's WHY. */
export default function FormGuide({ exercise, open, onToggle }: Props) {
  if (!exercise.form) return null;
  const protocol = getProtocol(exercise.protocolId);

  return (
    <>
      <div className={styles.toggle} onClick={onToggle}>
        <span className={styles.toggleText}>FORM GUIDE</span>
        <span className={styles.toggleText}>{open ? '-' : '+'}</span>
      </div>
      {open && (
        <div className={styles.content}>
          {FORM_SECTIONS.map(({ key, label }) => (
            exercise.form?.[key] ? (
              <div key={key} className={styles.section}>
                <span className={styles.label}>{label}</span>
                <p className={styles.text}>{exercise.form[key]}</p>
              </div>
            ) : null
          ))}
          {protocol && (
            <div className={styles.section}>
              <span className={styles.label}>WHY</span>
              <p className={styles.text}>{protocol.rationale}</p>
              <p className={styles.source}>{protocol.source}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
