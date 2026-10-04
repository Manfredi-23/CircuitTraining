/**
 * widget.ts — bridge to TodayWidgetPlugin (ios/App/App/TodayWidgetPlugin.swift).
 * Behind the platform check like the rest of src/native/; never throws.
 */

import { isNative } from './native';
import type { WidgetSnapshot } from '@/core/widget';

interface TodayWidgetApi {
  update(options: { json: string }): Promise<{ updated: boolean }>;
}

let plugin: TodayWidgetApi | null = null;

export async function updateTodayWidget(snapshot: WidgetSnapshot): Promise<void> {
  if (!isNative()) return;
  try {
    if (!plugin) {
      const { registerPlugin } = await import('@capacitor/core');
      plugin = registerPlugin<TodayWidgetApi>('TodayWidget');
    }
    // The widget only uses updatedAt to tell which day the snapshot is about.
    // Rounded to midnight, an unchanged snapshot is byte-identical, and the
    // plugin skips the reload WidgetKit would otherwise charge for.
    const day = new Date(snapshot.updatedAt);
    day.setHours(0, 0, 0, 0);
    await plugin.update({ json: JSON.stringify({ ...snapshot, updatedAt: day.getTime() }) });
  } catch { /* no widget extension: nothing to update */ }
}
