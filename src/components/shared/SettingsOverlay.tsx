'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/store';
import { createBackup, parseBackup, backupFileName, PERSISTED_KEYS } from '@/core/backup';
import { exportText } from './backup-io';

interface SettingsOverlayProps {
  open: boolean;
  onClose: () => void;
}

const EXPORT_MESSAGES = {
  shared: 'Backup handed to the share sheet.',
  downloaded: 'Backup downloaded.',
  copied: 'Sharing is not available here. The backup was copied to the clipboard: paste it into a note.',
  cancelled: 'Export cancelled.',
  failed: 'Export failed. Nothing was changed.',
} as const;

export default function SettingsOverlay({ open, onClose }: SettingsOverlayProps) {
  const resetAllData = useStore(s => s.resetAllData);
  const importBackup = useStore(s => s.importBackup);
  const [entered, setEntered] = useState(false);
  const [status, setStatus] = useState<{ text: string; warn: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setEntered(true));
    } else {
      setEntered(false);
      setStatus(null);
    }
  }, [open]);

  if (!open) return null;

  const handleExport = async () => {
    const state = useStore.getState() as unknown as Record<string, unknown>;
    const snapshot = Object.fromEntries(PERSISTED_KEYS.map(k => [k, state[k]]));
    const backup = createBackup(snapshot);
    const outcome = await exportText(backupFileName(), JSON.stringify(backup));
    setStatus({ text: EXPORT_MESSAGES[outcome], warn: outcome === 'failed' });
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseBackup(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!result.ok) {
      setStatus({ text: `${result.error} Nothing was changed.`, warn: true });
      return;
    }
    const s = result.summary;
    const ok = confirm(
      `Replace all data with the backup from ${s.exportedAt || 'an unknown date'}?\n`
      + `${s.sessions} sessions, ${s.tests} test results, ${s.loads} loads, ${s.climbs} climbing sessions.\n`
      + 'What is on this device now will be lost.',
    );
    if (!ok) return;
    importBackup(result.backup.data);
    setStatus({ text: 'Backup restored.', warn: false });
  };

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

      <div className="overlay-section">
        <div className="overlay-section-title">BACKUP</div>
        <div className="overlay-body">
          Everything lives on this device only. Export a backup now and then and keep it in Files or iCloud Drive.
        </div>
        <div className="overlay-row">
          <button className="overlay-btn" onClick={handleExport}>EXPORT</button>
          <button className="overlay-btn" onClick={() => fileRef.current?.click()}>IMPORT</button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={e => handleImportFile(e.target.files?.[0])}
        />
        {status && (
          <div className={`overlay-status${status.warn ? ' overlay-status-warn' : ''}`}>{status.text}</div>
        )}
      </div>

      <div className="overlay-section">
        <div className="overlay-section-title">RESET</div>
        <div className="overlay-body">
          Reset all progression data, session history, and settings. This is permanent.
        </div>
        <button className="overlay-btn" onClick={handleReset}>RESET ALL DATA</button>
      </div>

      <div className="overlay-footer">7Bit Circuit Training</div>
    </div>
  );
}
