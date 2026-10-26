'use client';

import { useEffect, useState } from 'react';
import {
  PAIN_MESSAGES, READINESS_MESSAGES, READINESS_STEPS, painBand, readinessBand, type FingerCheck,
} from '@/core/engine';
import ScalePicker from './ScalePicker';

interface PainCheckProps {
  open: boolean;
  title: string;
  /** The session loads the fingers, so pain is asked. Readiness is always asked. */
  askPain: boolean;
  lastPain: number | null;
  lastReadiness: number | null;
  /** How many exercises the session keeps with these answers. */
  remainingFor: (check: FingerCheck) => number;
  onStart: (check: FingerCheck) => void;
  onClose: () => void;
}

/**
 * Asked before any session that loads the fingers or hangs from the hands:
 * the 0-10 finger and wrist pain (the safety rule) and finger readiness in
 * five steps (the athlete's call on how much to load). The stricter one wins.
 */
export default function PainCheck({
  open, title, askPain, lastPain, lastReadiness, remainingFor, onStart, onClose,
}: PainCheckProps) {
  const [entered, setEntered] = useState(false);
  const [pain, setPain] = useState<number | undefined>(undefined);
  const [readiness, setReadiness] = useState<number>(100);

  useEffect(() => {
    if (open) {
      setPain(undefined);
      setReadiness(100);
      requestAnimationFrame(() => setEntered(true));
    } else {
      setEntered(false);
    }
  }, [open]);

  if (!open) return null;

  const check: FingerCheck = { ...(askPain ? { pain } : {}), readiness };
  const answered = !askPain || pain !== undefined;
  const band = askPain && pain !== undefined ? painBand(pain) : null;
  const ready = readinessBand(readiness);
  const empty = answered && remainingFor(check) === 0;
  const canStart = answered && !empty;

  return (
    <div className={`overlay-panel${entered ? ' overlay-enter' : ''}`}>
      <div className="overlay-header">
        <span style={{ fontWeight: 700, fontSize: 16 }}>FINGERS + WRISTS</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      {askPain && (
        <section className="overlay-section">
          <div className="overlay-section-title">PAIN</div>
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
          {band && band !== 'clear' && (
            <div className="overlay-status overlay-status-warn">{PAIN_MESSAGES[band]}</div>
          )}
        </section>
      )}

      <section className="overlay-section">
        <div className="overlay-section-title">READINESS</div>
        <div className="overlay-body">
          How much do the fingers have in them today? Your call: the session adjusts its finger and hanging work.
          {lastReadiness !== null && ` Last time: ${lastReadiness}%.`}
        </div>
        <ScalePicker
          min={20}
          max={100}
          values={READINESS_STEPS}
          suffix="%"
          value={readiness}
          onChange={setReadiness}
          label="Finger readiness"
          lowText="HANDS REST"
          highText="FULL"
        />
        <div className={`overlay-status${ready !== 'full' ? ' overlay-status-warn' : ''}`}>
          {READINESS_MESSAGES[ready]}
          {empty && ' Nothing is left of this session today: rest, or pick a DAILY session without finger work.'}
        </div>
      </section>

      <button
        className="overlay-btn"
        disabled={!canStart}
        style={{ opacity: canStart ? 1 : 0.25 }}
        onClick={() => canStart && onStart(check)}
      >
        START
      </button>
    </div>
  );
}
