'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { coachSummary, daysSince } from '@/core/coach';
import { isHealing } from '@/core/recommend';
import { askCoach, getCoachKey, getLastReview, type StoredReview } from '@/coach/client';
import styles from './CoachSection.module.css';

/** A line of the review: a numbered heading, a bullet, or prose. */
function ReviewText({ text }: { text: string }) {
  return (
    <div className={styles.review}>
      {text.split('\n').filter(l => l.trim()).map((line, i) => {
        const t = line.trim().replace(/\*\*/g, '');
        if (/^\d+\.\s/.test(t) || /^[A-Z][A-Z ,'-]+:?$/.test(t)) return <div key={i} className={styles.reviewHead}>{t.replace(/^\d+\.\s*/, '')}</div>;
        if (/^[-*]\s/.test(t)) return <div key={i} className={styles.reviewItem}>{t.replace(/^[-*]\s*/, '')}</div>;
        return <p key={i} className={styles.reviewText}>{t}</p>;
      })}
    </div>
  );
}

/**
 * THE COACH, on STATS OVERVIEW: the last four weeks as one text, to copy into
 * Claude, or, with the athlete's own API key, a review asked for in the app.
 * The review suggests; nothing in the plan changes by itself.
 */
export default function CoachSection() {
  const sessionLog = useStore(s => s.sessionLog);
  const climbLog = useStore(s => s.climbLog);
  const activityLog = useStore(s => s.activityLog);
  const loadLog = useStore(s => s.loadLog);
  const benchmarkResults = useStore(s => s.benchmarkResults);
  const goals = useStore(s => s.settings.goals);
  const [hasKey, setHasKey] = useState(false);
  const [review, setReview] = useState<StoredReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => { setHasKey(Boolean(getCoachKey())); setReview(getLastReview()); }, []);

  const summary = useMemo(() => coachSummary({
    sessionLog, climbLog, activityLog, loadLog, benchmarkResults, goals, healing: isHealing(sessionLog, climbLog),
  }), [sessionLog, climbLog, activityLog, loadLog, benchmarkResults, goals]);

  const copy = async () => {
    const text = `Please review my last four weeks of climbing training.\n\n${summary}`;
    try {
      await navigator.clipboard.writeText(text);
      setNote('Copied. Paste it into a chat with Claude.');
    } catch {
      try { await navigator.share({ text }); setNote(null); } catch { setNote('Copying is not available here.'); }
    }
  };

  const ask = async () => {
    setBusy(true);
    setNote(null);
    const r = await askCoach(summary);
    setBusy(false);
    if (r.ok) setReview(r.review); else setNote(r.error);
  };

  const ago = daysSince(review?.at ?? null);
  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        {hasKey && (
          <button className={styles.primary} onClick={() => void ask()} disabled={busy}>
            {busy ? 'READING FOUR WEEKS...' : 'ASK THE COACH'}
          </button>
        )}
        <button className={styles.secondary} onClick={() => void copy()}>COPY FOR COACH</button>
      </div>
      {note && <p className={styles.note} role="status">{note}</p>}
      {!hasKey && <p className={styles.hint}>Copies the last four weeks as text. To ask in the app, add your Anthropic API key in Settings.</p>}
      {review && (
        <div className={styles.last}>
          <div className={styles.lastHead}>
            <span>LAST REVIEW</span>
            <span className={styles.lastAgo}>{ago === 0 ? 'today' : ago === 1 ? 'yesterday' : `${ago} days ago`}</span>
          </div>
          <ReviewText text={review.text} />
          <p className={styles.hint}>A suggestion. Nothing in your plan changes unless you change it.</p>
        </div>
      )}
    </div>
  );
}
