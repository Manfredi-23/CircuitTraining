'use client';

import { useEffect, useState } from 'react';
import { PAIN_MESSAGES, painBand } from '@/core/engine';
import ScalePicker from './ScalePicker';

interface PainCheckProps {
  open: boolean;
  title: string;
  lastPain: number | null;
  /** How many exercises the session keeps at this score. */
  remainingFor: (pain: number) => number;
  onStart: (pain: number) => void;
  onClose: () => void;
}

/** The 0-10 finger and wrist question asked before any session that loads the fingers. */
export default function PainCheck({ open, title, lastPain, remainingFor, onStart, onClose }: PainCheckProps) {
  const [entered, setEntered] = useState(false);
  const [pain, setPain] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (open) {
      setPain(undefined);
      requestAnimationFrame(() => setEntered(true));
    } else {
      setEntered(false);
    }
  }, [open]);

  if (!open) return null;

  const band = pain === undefined ? null : painBand(pain);
  const empty = pain !== undefined && remainingFor(pain) === 0;
  const canStart = pain !== undefined && !empty;

  return (
    <div className={`overlay-panel${entered ? ' overlay-enter' : ''}`}>
      <div className="overlay-header">
        <span style={{ fontWeight: 700, fontSize: 16 }}>FINGERS + WRISTS</span>
        <button className="overlay-close" onClick={onClose}>X</button>
      </div>
      <div className="overlay-body">
        {title} loads the fingers. How do fingers and wrists feel right now? 0 is nothing at all, 10 is the worst pain imaginable.
        {lastPain !== null && ` Last time: ${lastPain}.`}
      </div>
      <ScalePicker
        min={0}
        max={10}
        value={pain}
        onChange={setPain}
        label="Pain, 0 to 10"
        lowText="NOTHING"
        highText="WORST"
      />
      {band && (
        <div className={`overlay-status${band !== 'clear' ? ' overlay-status-warn' : ''}`}>
          {PAIN_MESSAGES[band]}
          {empty && ' Nothing is left of this session today: rest, or pick a DAILY session without finger work.'}
        </div>
      )}
      <button
        className="overlay-btn"
        disabled={!canStart}
        style={{ opacity: canStart ? 1 : 0.25 }}
        onClick={() => canStart && onStart(pain)}
      >
        START
      </button>
    </div>
  );
}
