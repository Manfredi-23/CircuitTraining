'use client';

import { useState } from 'react';
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
  /** Rest: open on three lines of how it is done, the rest one tap away. */
  brief?: boolean;
}

/** The collapsible FORM GUIDE: the exercise's form notes, then the protocol's WHY; `brief` opens on a summary. */
export default function FormGuide({ exercise, open, onToggle, brief = false }: Props) {
  const [fullFor, setFullFor] = useState<string | null>(null);
  if (!exercise.form) return null;
  const protocol = getProtocol(exercise.protocolId);
  const lead = exercise.form.execution ?? exercise.form.setup;
  const short = brief && fullFor !== exercise.id && lead;

  return (
    <>
      <div className={styles.toggle} onClick={onToggle}>
        <span className={styles.toggleText}>FORM GUIDE</span>
        <span className={styles.toggleText}>{open ? '-' : '+'}</span>
      </div>
      {open && short && (
        <div className={styles.content}>
          <p className={`${styles.text} ${styles.clamp}`}>{lead}</p>
          <button className={styles.more} onClick={() => setFullFor(exercise.id)}>THE WHOLE GUIDE +</button>
        </div>
      )}
      {open && !short && (
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
