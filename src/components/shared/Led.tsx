'use client';

import { layoutIcon, layoutLed } from '@/core/led-font';
import styles from './Led.module.css';

/**
 * A figure on the LED grid, the same dot language as the session
 * illustrations. Lit dots take `lit` (ink by default; the one orange marks the
 * screen's main figure). Unlit dots are left out unless `unlit` gives them a
 * colour: worth it on a large display (the session number), noise on a small
 * one. With `animate`, the dots light up column by column, left to right;
 * reduced motion shows them lit at once.
 */
export default function Led({
  text, icon, dot = 4, lit = 'var(--ink)', unlit = 'none', animate = false, label, className,
}: {
  text?: string;
  icon?: string;
  /** Dot diameter in px; the pitch is 1.5 dots. */
  dot?: number;
  lit?: string;
  unlit?: string | 'none';
  animate?: boolean;
  /** Accessible name; defaults to the text. Icons are decorative without one. */
  label?: string;
  className?: string;
}) {
  const { dots, cols } = icon ? layoutIcon(icon) : layoutLed(text ?? '');
  const pitch = dot * 1.5;
  const r = dot / 2;
  const w = cols * pitch - (pitch - dot);
  const h = 7 * pitch - (pitch - dot);
  const name = label ?? (icon ? undefined : text);
  return (
    <svg
      className={`${styles.led}${className ? ` ${className}` : ''}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role={name ? 'img' : undefined}
      aria-label={name}
      aria-hidden={name ? undefined : true}
    >
      {dots.map((d, i) => (d.lit || unlit !== 'none') && (
        <circle
          key={i}
          cx={d.x * pitch + r}
          cy={d.y * pitch + r}
          r={r}
          fill={d.lit ? lit : unlit}
          className={d.lit && animate ? styles.on : undefined}
          style={d.lit && animate ? { animationDelay: `${d.col * 22}ms` } : undefined}
        />
      ))}
    </svg>
  );
}
