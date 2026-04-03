import type { Progress, SessionLogEntry } from '@/core/types';

export interface IStorageAdapter {
  getProgress(): Promise<Progress | null>;
  saveProgress(progress: Progress): Promise<void>;
  getSessionLog(): Promise<SessionLogEntry[] | null>;
  saveSessionLog(log: SessionLogEntry[]): Promise<void>;
  clearAll(): Promise<void>;
}
