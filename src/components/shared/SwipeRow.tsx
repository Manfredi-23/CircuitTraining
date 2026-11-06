'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDrag } from '@use-gesture/react';
import styles from './SwipeRow.module.css';

export interface SwipeAction {
  /** The word on the button: SWAP, OUT. */
  label: string;
  /** What a screen reader says: "Swap Box Jump". */
  aria: string;
  onClick: () => void;
  /** The first action is filled, the others outlined. */
  primary?: boolean;
}

const ACTION_W = 80;

/** One row open at a time: opening one closes the last. */
let closeOpen: (() => void) | null = null;

/**
 * A list row that swipes left to show its actions (SWAP and OUT), the way a
 * mail app does. Vertical scrolling stays the browser's (`touch-action:
 * pan-y`); a tap on an open row closes it instead of opening what it holds.
 * The actions are real buttons, reachable by keyboard and screen reader: a
 * focus opens the row. With no actions it is a plain row.
 */
export default function SwipeRow({ actions, children, className }: {
  actions: SwipeAction[] | null;
  children: ReactNode;
  className?: string;
}) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const width = (actions?.length ?? 0) * ACTION_W;
  const xRef = useRef(0);
  xRef.current = x;
  // The click a browser fires after a drag ends is not a tap on the row.
  const dragEnd = useRef(0);

  const close = useRef(() => setX(0)).current;
  const open = () => {
    if (closeOpen && closeOpen !== close) closeOpen();
    closeOpen = close;
    setX(-width);
  };
  useEffect(() => () => { if (closeOpen === close) closeOpen = null; }, [close]);

  const bind = useDrag(({ movement: [mx], last, tap, memo }) => {
    const start = (memo as number | undefined) ?? xRef.current;
    if (tap) return start;
    const nx = Math.max(-width - 24, Math.min(0, start + mx));
    if (!last) {
      setDragging(true);
      setX(nx);
      return start;
    }
    setDragging(false);
    dragEnd.current = Date.now();
    if (nx < -width / 2) open();
    else setX(0);
    return start;
  }, { axis: 'x', filterTaps: true, enabled: width > 0 });

  if (!actions?.length) return <div className={className}>{children}</div>;

  const revealed = Math.min(width, -x);
  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ''}`}>
      <div
        className={styles.actions}
        style={{ width: revealed }}
        onFocus={() => { if (xRef.current === 0) open(); }}
      >
        {actions.map((a, i) => (
          <button
            key={a.label}
            className={`${styles.action}${a.primary ?? i === 0 ? ` ${styles.primary}` : ''}`}
            style={{ width: ACTION_W - 4 }}
            aria-label={a.aria}
            onClick={() => { setX(0); a.onClick(); }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div
        {...bind()}
        className={`${styles.content}${dragging ? '' : ` ${styles.settle}`}`}
        style={{ transform: x ? `translateX(${x}px)` : undefined }}
        onClickCapture={e => {
          if (Date.now() - dragEnd.current < 350) { e.preventDefault(); e.stopPropagation(); return; }
          // An open row closes on a tap; what it holds is not opened by it.
          if (xRef.current !== 0) { e.preventDefault(); e.stopPropagation(); setX(0); }
        }}
      >
        {children}
      </div>
    </div>
  );
}
