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
 * to a routine or a session and to swap one exercise for another. A swap
 * lists the most similar exercises first.
 */
export default function ExercisePicker({ place, taken, title, onPick, onClose, similar, allow }: {
  place: Place;
  /** Already in the routine: shown, not offered again. */
  taken: string[];
  title: string;
  onPick: (id: string) => void;
  onClose: () => void;
  /** Alternatives to the exercise being swapped, shown first while nothing is searched or filtered. */
  similar?: LibraryEntry[];
  /** Only what may go in today (healing, finger pain, no kit). */
  allow?: (e: Exercise) => boolean;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>(null);
  const list = useMemo(
    () => libraryFor(place, query, filter, taken).filter(e => !allow || allow(e.exercise)),
    [place, query, filter, taken, allow],
  );
  const top = !query.trim() && filter === null && similar?.length ? similar : [];

  return (
    <div className={`overlay-panel overlay-enter ${styles.panel}`} role="dialog" aria-modal="true" aria-label={title}>
      <div className="overlay-header">
        <span className={styles.crumb}>{title}</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>
      <input
        className={styles.search}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search exercises"
        aria-label="Search exercises"
        autoFocus
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
      <div className={styles.scroll}>
        {list.length === 0 && <div className={styles.empty}>Nothing matches. Try another word or area.</div>}
        {top.length > 0 && <div className={styles.group}>SIMILAR</div>}
        {top.map(entry => row(entry, 'similar'))}
        {top.length > 0 && <div className={styles.group}>EVERYTHING</div>}
        {list.map(entry => row(entry, 'all'))}
      </div>
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
        </span>
        <span className={styles.add}>{has ? 'IN' : '+'}</span>
      </button>
    );
  }
}
