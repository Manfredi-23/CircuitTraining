// =============================================================================
// backup.ts — Export and import of everything the app persists
//
// All training data lives in the webview's local storage, which iOS may clear
// and a reinstall always does. A backup is the persisted state as one JSON
// file the athlete keeps somewhere else. Pure functions, no React.
// =============================================================================

/** The persisted keys, in one place so a new one cannot be left out of a backup. */
export const PERSISTED_KEYS = [
  'progress', 'sessionLog', 'benchmarkResults', 'loadLog', 'climbLog',
  'blockStart', 'settings',
] as const;

export type PersistedKey = typeof PERSISTED_KEYS[number];

/** Keys that hold arrays; every other persisted key holds a plain object or a string. */
const ARRAY_KEYS: PersistedKey[] = ['sessionLog', 'benchmarkResults', 'loadLog', 'climbLog'];

export const BACKUP_FORMAT = 1;

export interface Backup {
  app: '7bit';
  format: number;
  exportedAt: string;
  data: Partial<Record<PersistedKey, unknown>>;
}

export function createBackup(state: Partial<Record<PersistedKey, unknown>>, now = new Date()): Backup {
  const data: Partial<Record<PersistedKey, unknown>> = {};
  for (const key of PERSISTED_KEYS) {
    if (state[key] !== undefined) data[key] = state[key];
  }
  return { app: '7bit', format: BACKUP_FORMAT, exportedAt: now.toISOString(), data };
}

export function backupFileName(now = new Date()): string {
  return `7bit-backup-${now.toISOString().slice(0, 10)}.json`;
}

export type ParseResult =
  | { ok: true; backup: Backup; summary: BackupSummary }
  | { ok: false; error: string };

export interface BackupSummary {
  exportedAt: string;
  sessions: number;
  tests: number;
  loads: number;
  climbs: number;
}

/**
 * Read a backup file. Anything that is not a 7bit backup, or whose fields have
 * the wrong shape, is refused whole: a half-imported history is worse than
 * none, because it looks complete.
 */
export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Not a JSON file.' };
  }
  if (!raw || typeof raw !== 'object') return { ok: false, error: 'Not a 7bit backup.' };
  const b = raw as Partial<Backup>;
  if (b.app !== '7bit' || typeof b.format !== 'number' || !b.data || typeof b.data !== 'object') {
    return { ok: false, error: 'Not a 7bit backup.' };
  }
  if (b.format > BACKUP_FORMAT) {
    return { ok: false, error: 'This backup comes from a newer version of the app.' };
  }

  const data: Partial<Record<PersistedKey, unknown>> = {};
  for (const key of PERSISTED_KEYS) {
    const value = (b.data as Record<string, unknown>)[key];
    if (value === undefined || value === null) continue;
    const isArray = Array.isArray(value);
    if (ARRAY_KEYS.includes(key) ? !isArray : (key === 'blockStart' ? typeof value !== 'string' : (isArray || typeof value !== 'object'))) {
      return { ok: false, error: `The ${key} field is damaged.` };
    }
    data[key] = value;
  }

  const len = (k: PersistedKey) => (Array.isArray(data[k]) ? (data[k] as unknown[]).length : 0);
  return {
    ok: true,
    backup: { app: '7bit', format: b.format, exportedAt: String(b.exportedAt ?? ''), data },
    summary: {
      exportedAt: String(b.exportedAt ?? '').slice(0, 10),
      sessions: len('sessionLog'),
      tests: len('benchmarkResults'),
      loads: len('loadLog'),
      climbs: len('climbLog'),
    },
  };
}
