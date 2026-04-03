import type { IStorageAdapter } from './storage.interface';
import { LocalStorageAdapter } from './local-storage.adapter';

let adapter: IStorageAdapter | null = null;

export function getStorageAdapter(): IStorageAdapter {
  if (!adapter) {
    adapter = new LocalStorageAdapter();
  }
  return adapter;
}

export function setStorageAdapter(newAdapter: IStorageAdapter): void {
  adapter = newAdapter;
}

export type { IStorageAdapter } from './storage.interface';
