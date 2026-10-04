/**
 * Getting a backup file off the device, by web standards only.
 *
 * The share sheet is the right place on iOS (Save to Files, AirDrop, Mail) and
 * works in Safari and in the Capacitor webview. Where files cannot be shared,
 * a download link; where even that is unavailable, the clipboard, which always
 * leaves the athlete holding something they can paste into a note.
 */
export type ExportOutcome = 'shared' | 'downloaded' | 'copied' | 'cancelled' | 'failed';

export async function exportText(fileName: string, text: string): Promise<ExportOutcome> {
  const file = new File([text], fileName, { type: 'application/json' });
  if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: fileName });
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
      // Fall through to the next route.
    }
  }

  // A download link does nothing inside the iOS webview, so it is only tried
  // in a real browser.
  const isNativeShell = typeof window !== 'undefined'
    && Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } })
      .Capacitor?.isNativePlatform?.());
  if (!isNativeShell) {
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return 'downloaded';
    } catch {
      // Fall through.
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

