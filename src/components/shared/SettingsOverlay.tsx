'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/store';

interface SettingsOverlayProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsOverlay({ open, onClose }: SettingsOverlayProps) {
  const resetAllData = useStore(s => s.resetAllData);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setEntered(true));
    } else {
      setEntered(false);
    }
  }, [open]);

  if (!open) return null;

  const handleReset = () => {
    if (confirm('Reset all training data? This cannot be undone.')) {
      resetAllData();
      onClose();
    }
  };

  return (
    <div className={`overlay-panel${entered ? ' overlay-enter' : ''}`}>
      <div className="overlay-header">
        <span style={{ fontWeight: 700, fontSize: 16 }}>Settings</span>
        <button className="overlay-close" onClick={onClose}>X</button>
      </div>
      <div className="overlay-body">
        Reset all progression data, session history, and settings. This is permanent.
      </div>
      <button className="overlay-btn" onClick={handleReset}>RESET ALL DATA</button>
      <div className="overlay-footer">7Bit Circuit Training</div>
    </div>
  );
}
