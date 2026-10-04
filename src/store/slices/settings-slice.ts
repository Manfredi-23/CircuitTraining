import type { StateCreator } from 'zustand';
import type { Store } from '../store';
import { DEFAULT_REMINDER_SETTINGS, type ReminderKind, type ReminderSettings } from '@/core/reminders';

/** Athlete preferences that persist and travel in a backup. */
export interface AppSettings {
  reminders: ReminderSettings;
}

export const DEFAULT_SETTINGS: AppSettings = { reminders: DEFAULT_REMINDER_SETTINGS };

export interface SettingsSlice {
  settings: AppSettings;
  setReminder: (kind: ReminderKind, on: boolean) => void;
  setDailyTime: (hhmm: string) => void;
}

/** Fill in anything a stored or imported settings blob is missing. */
export function withDefaults(s: Partial<AppSettings> | undefined): AppSettings {
  return {
    reminders: {
      enabled: { ...DEFAULT_REMINDER_SETTINGS.enabled, ...(s?.reminders?.enabled ?? {}) },
      dailyTime: s?.reminders?.dailyTime ?? DEFAULT_REMINDER_SETTINGS.dailyTime,
    },
  };
}

export const createSettingsSlice: StateCreator<Store, [], [], SettingsSlice> = (set) => ({
  settings: DEFAULT_SETTINGS,

  setReminder: (kind, on) => set(state => ({
    settings: {
      ...state.settings,
      reminders: { ...state.settings.reminders, enabled: { ...state.settings.reminders.enabled, [kind]: on } },
    },
  })),

  setDailyTime: (hhmm) => set(state => ({
    settings: { ...state.settings, reminders: { ...state.settings.reminders, dailyTime: hhmm } },
  })),
});
