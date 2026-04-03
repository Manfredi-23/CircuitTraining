'use client';

interface TimerFlashProps {
  active: boolean;
}

export default function TimerFlash({ active }: TimerFlashProps) {
  return <div className={`timer-flash${active ? ' flash-active' : ''}`} />;
}
