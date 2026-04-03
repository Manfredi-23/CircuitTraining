import { CONFIG } from '@/core/config';
import type { Progress, SessionLogEntry } from '@/core/types';
import type { IStorageAdapter } from './storage.interface';

export class LocalStorageAdapter implements IStorageAdapter {
  async getProgress(): Promise<Progress | null> {
    try {
      const raw = localStorage.getItem(CONFIG.storage.progress);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveProgress(progress: Progress): Promise<void> {
    try {
      localStorage.setItem(CONFIG.storage.progress, JSON.stringify(progress));
    } catch { /* silent */ }
  }

  async getSessionLog(): Promise<SessionLogEntry[] | null> {
    try {
      const raw = localStorage.getItem(CONFIG.storage.sessionLog);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async saveSessionLog(log: SessionLogEntry[]): Promise<void> {
    try {
      localStorage.setItem(CONFIG.storage.sessionLog, JSON.stringify(log));
    } catch { /* silent */ }
  }

  async clearAll(): Promise<void> {
    localStorage.removeItem(CONFIG.storage.progress);
    localStorage.removeItem(CONFIG.storage.sessionLog);
  }
}
