'use client';

import { useMemo, useState } from 'react';
import { libraryFor, type LibraryEntry } from '@/core/routines';
import { WORK_AREAS, WORK_AREA_LABEL, type WorkArea } from '@/core/review';
import type { Place } from '@/core/reserve';
import type { Exercise } from '@/core/types';
import styles from './ExercisePicker.module.css';

type Filter = WorkArea | 'WARM-UP' | null;
const FILTERS: Filter[] = [null, 'WARM-UP', ...WORK_AREAS];
const filterLabel = (f: Filter) => (f === null ? 'ALL' : f === 'WARM-UP' ? 'WARM-UP' : WORK_AREA_LABEL[f].toUpperCase());

/**
 * Every exercise the place's kit allows, searchable and by area. Used to add
 * to a routine or a session and to swap one exercise for another.
 *
 * A swap opens on a short list of SIMILAR exercises, roomy enough to pick from
 * with a thumb; OTHER KIT (v45) has the same job without the kit that is
 * taken, and the whole library and its search are one tab away. Nothing
 * focuses the search by itself: the keyboard would cover half the list.
 */
export default function ExercisePicker({ place, taken, title, onPick, onClose, similar, otherKit, kit, allow, replacing, caution }: {
  place: Place;
  /** Already in the routine: shown, not offered again. */
  taken: string[];
  title: string;
  onPick: (id: string) => void;
  onClose: () => void;
  /** Alternatives to the exercise being swapped, shown first. */
  similar?: LibraryEntry[];
  /** The same job without the kit the exercise needs; the tab shows when the exercise needs kit. */
  otherKit?: LibraryEntry[];
  /** That kit in words: "rings / TRX". */
  kit?: string;
  /** Only what may go in today (healing, finger pain, no kit). */
  allow?: (e: Exercise) => boolean;
  /** The name of the exercise being swapped out. */
  replacing?: string;
  /** Why an exercise is not recommended today, shown on its row; it stays on offer. */
  caution?: (e: Exercise) => string | null;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(null);
  const swapping = similar !== undefined;
  const [view, setView] = useState<'similar' | 'kit' | 'all'>(similar?.length ? 'similar' : kit ? 'kit' : 'all');
  const tabs: Array<['similar' | 'kit' | 'all', string]> = [
    ['similar', 'SIMILAR'], ...(kit ? [['kit', 'OTHER KIT'] as ['kit', string]] : []), ['all', 'SEARCH ALL'],
  ];
  const list = useMemo(
    () => libraryFor(place, query, filter, taken).filter(e => !allow || allow(e.exercise)),
    [place, query, filter, taken, allow],
  );

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="overlay-header">
        <span className={styles.crumb}>{title}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      {replacing && (
        <div className={styles.replacing}>
          <span className={styles.replacingLabel}>INSTEAD OF</span>
          <span className={styles.replacingName}>{replacing}</span>
        </div>
      )}

      {swapping && (
        <div className={styles.views} role="tablist" aria-label="Alternatives">
          {tabs.map(([v, label]) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              className={`${styles.view}${view === v ? ` ${styles.viewOn}` : ''}`}
              onClick={() => { setView(v); setQuery(''); setFilter(null); }}
            >{label}</button>
          ))}
        </div>
      )}

      {view === 'similar' && swapping ? (
        <div className={styles.scroll}>
          {similar.length
            ? similar.map(entry => row(entry, 'similar'))
            : <div className={styles.empty}>Nothing close enough. Try OTHER KIT or SEARCH ALL.</div>}
        </div>
      ) : view === 'kit' && swapping ? (
        <div className={styles.scroll}>
          <div className={styles.group}>THE SAME JOB WITHOUT: {kit?.toUpperCase()}</div>
          {otherKit?.length
            ? otherKit.map(entry => row(entry, 'kit'))
            : <div className={styles.empty}>Nothing else does this job without the {kit}. Try SEARCH ALL.</div>}
        </div>
      ) : (
        <>
          <div className={styles.tools}>
            <input
              className={styles.search}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search exercises"
              aria-label="Search exercises"
              enterKeyHint="search"
            />
            <div className={styles.filters} role="tablist" aria-label="Area">
              {FILTERS.map(f => (
                <button
                  key={String(f)}
                  className={`${styles.filter}${f === filter ? ` ${styles.filterOn}` : ''}`}
                  aria-pressed={f === filter}
                  onClick={() => setFilter(f)}
                >{filterLabel(f)}</button>
              ))}
            </div>
            <div className={styles.count}>{list.length} exercise{list.length === 1 ? '' : 's'}{place === 'HOME' ? ' for mat, band and edge' : ''}</div>
          </div>
          <div className={styles.scroll}>
            {list.length === 0 && <div className={styles.empty}>Nothing matches. Try another word or area.</div>}
            {list.map(entry => row(entry, 'all'))}
          </div>
        </>
      )}
    </div>
  );

  function row({ exercise: e, area }: LibraryEntry, key: string) {
    const has = taken.includes(e.id);
    return (
      <button key={`${key}-${e.id}`} className={styles.row} disabled={has} onClick={() => onPick(e.id)}>
        <span className={styles.body}>
          <span className={styles.name}>{e.name}</span>
          <span className={styles.meta}>
            {area ? WORK_AREA_LABEL[area] : 'Warm-up'} &middot; {e.sets} x {e.work}{e.unit === 'sec' ? 's' : ''}{e.perSide ? ' /side' : ''}
            {e.gate ? ' · stand-in until tested' : ''}
          </span>
          {caution?.(e) && <span className={styles.caution}>{caution(e)}</span>}
        </span>
        <span className={`${styles.add}${replacing ? ` ${styles.addWord}` : ''}`}>{has ? 'IN' : replacing ? 'USE' : '+'}</span>
      </button>
    );
  }
}
