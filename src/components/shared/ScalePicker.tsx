'use client';

import styles from './ScalePicker.module.css';

interface ScalePickerProps {
  min: number;
  max: number;
  value: number | undefined;
  onChange: (v: number) => void;
  label: string;
  /** Words under the two ends of the scale. */
  lowText: string;
  highText: string;
}

/** A row of numbered buttons, for effort (1-10) and pain (0-10). */
export default function ScalePicker({ min, max, value, onChange, label, lowText, highText }: ScalePickerProps) {
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className={styles.wrap}>
      <div className={styles.row} role="radiogroup" aria-label={label} style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}>
        {values.map(v => (
          <button
            key={v}
            role="radio"
            aria-checked={v === value}
            className={`${styles.btn}${v === value ? ` ${styles.btnOn}` : ''}`}
            onClick={() => onChange(v)}
          >
            {v}
          </button>
        ))}
      </div>
      <div className={styles.ends}>
        <span>{lowText}</span>
        <span>{highText}</span>
      </div>
    </div>
  );
}
