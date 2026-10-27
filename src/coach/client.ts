// =============================================================================
// coach/client.ts — Ask Claude for the weekly review, with the athlete's own key
//
// The key lives in this device's local storage under its own name, outside the
// persisted store, so it never goes into a backup or an export. The request
// goes from the phone straight to the Anthropic API: there is no server of
// ours in between, which is why the SDK's browser guard is switched off. The
// review is text; it changes nothing in the app.
//
// The SDK is imported on demand, so the bundle only carries it when the
// athlete asks for a review.
// =============================================================================

import { COACH_SYSTEM } from '@/core/coach';

const KEY_STORAGE = '7bit_coach_key';
const REVIEW_STORAGE = '7bit_coach_review';

export const COACH_MODEL = 'claude-opus-5-5';

export function getCoachKey(): string | null {
  try { return localStorage.getItem(KEY_STORAGE); } catch { return null; }
}

export function setCoachKey(key: string | null): void {
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key.trim());
    else localStorage.removeItem(KEY_STORAGE);
  } catch { /* private mode: nothing to keep */ }
}

export interface StoredReview { text: string; at: string }

export function getLastReview(): StoredReview | null {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE);
    return raw ? (JSON.parse(raw) as StoredReview) : null;
  } catch { return null; }
}

function keepReview(r: StoredReview): void {
  try { localStorage.setItem(REVIEW_STORAGE, JSON.stringify(r)); } catch { /* nothing to keep */ }
}

export type CoachResult = { ok: true; review: StoredReview } | { ok: false; error: string };

/** Send the summary and return the review, or what went wrong in words. */
export async function askCoach(summary: string): Promise<CoachResult> {
  const key = getCoachKey();
  if (!key) return { ok: false, error: 'Add your API key in Settings first.' };
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 1 });
  try {
    const response = await client.beta.messages.create({
      model: COACH_MODEL,
      max_tokens: 16000,
      system: COACH_SYSTEM,
      output_config: { effort: 'medium' },
      // On a safety decline the API retries on its recommended model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: `Here are my last four weeks.\n\n${summary}` }],
    });
    if (response.stop_reason === 'refusal') return { ok: false, error: 'The coach declined this one. Try again later.' };
    const text = response.content.map(b => (b.type === 'text' ? b.text : '')).join('').trim();
    if (!text) return { ok: false, error: 'The review came back empty. Try again.' };
    const review = { text, at: new Date().toISOString() };
    keepReview(review);
    return { ok: true, review };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { ok: false, error: 'The API key was refused. Check it in Settings.' };
    if (e instanceof Anthropic.RateLimitError) return { ok: false, error: 'Too many requests. Try again in a minute.' };
    if (e instanceof Anthropic.APIConnectionError) return { ok: false, error: 'No connection to the API.' };
    if (e instanceof Anthropic.APIError) return { ok: false, error: `The API answered ${e.status ?? 'with an error'}.` };
    return { ok: false, error: 'Something went wrong asking the coach.' };
  }
}
