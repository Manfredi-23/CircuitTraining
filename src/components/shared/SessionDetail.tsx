'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/store';
import { exerciseLibrary } from '@/core/reserve';
import { retiredName } from '@/core/insights';
import { setsLine } from '@/core/history';
import { dayOf } from '@/core/dates';
import ScalePicker from './ScalePicker';
import styles from './SessionDetail.module.css';

const WHEN = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

/**
 * One past session, read back: what was done of each exercise, what was
 * lifted, how it felt. Effort can be corrected; a session logged by mistake
 * can be deleted (its loads that day go with it, XP stays).
 */
export default function SessionDetail({ index, onClose, onExercise }: {
  index: number;
  onClose: () => void;
  onExercise?: (id: string) => void;
}) {
  const s = useStore(st => st.sessionLog[index]);
  const loadLog = useStore(st => st.loadLog);
  const updateSession = useStore(st => st.updateSession);
  const deleteSession = useStore(st => st.deleteSession);
  const [entered, setEntered] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);
  if (!s) return null;

  const lib = exerciseLibrary();
  const day = dayOf(s.date);
  const ids = Array.from(new Set([...Object.keys(s.planned ?? {}), ...Object.keys(s.sets ?? {})]));
  const sets = setsLine(s);

  return (
    <div className={`overlay-panel ${styles.panel}${entered ? ' overlay-enter' : ''}`} role="dialog" aria-modal="true" aria-label={s.circuitTitle}>
      <div className="overlay-header">
        <span className={styles.crumb}>{s.mode} SESSION</span>
        <button className="overlay-close" onClick={onClose} aria-label="Close">X</button>
      </div>

      <div className={styles.scroll}>
        <div className={styles.head}>
          <h2 className={styles.title}>{s.circuitTitle}</h2>
          <div className={styles.when}>{WHEN.format(new Date(s.date))}</div>
        </div>

        <div className={styles.facts}>
          <div className={styles.fact}><span className={styles.factLabel}>Time</span><span className={styles.factValue}>{s.duration}<small> min</small></span></div>
          <div className={styles.fact}><span className={styles.factLabel}>Energy</span><span className={styles.factValue}>{s.energy}</span></div>
          <div className={styles.fact}><span className={styles.factLabel}>Sets</span><span className={styles.factValue}>{sets ?? '-'}</span></div>
          <div className={styles.fact}>
            <span className={styles.factLabel}>{s.readiness !== undefined ? 'Pain · Ready' : 'Pain'}</span>
            <span className={styles.factValue}>
              {s.pain ?? '-'}{s.pain !== undefined && <small> /10</small>}
              {s.readiness !== undefined && <> · {s.readiness}<small>%</small></>}
            </span>
          </div>
        </div>

        {ids.length > 0 && (
          <div className={styles.list}>
            {ids.map(id => {
              const name = lib.get(id)?.name ?? retiredName(id);
              const done = s.sets?.[id] ?? 0;
              const planned = s.planned?.[id];
              const load = loadLog.find(l => l.exerciseId === id && dayOf(l.date) === day);
              const clickable = Boolean(onExercise && lib.has(id));
              return (
                <button key={id} className={styles.row} disabled={!clickable} onClick={() => onExercise?.(id)}>
                  <span className={styles.rowName}>{name}{s.added?.includes(id) && <span className={styles.added}> added</span>}</span>
                  <span className={styles.rowLoad}>{load ? `${load.value} ${load.unit}` : ''}</span>
                  <span className={planned !== undefined && done < planned ? styles.rowShort : styles.rowSets}>
                    {done}{planned !== undefined ? `/${planned}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.section}>
          <div className={styles.label}>EFFORT</div>
          <ScalePicker
            min={1}
            max={10}
            value={s.effort}
            onChange={v => updateSession(index, { effort: v })}
            label="Session effort, 1 to 10"
            lowText="VERY EASY"
            highText="MAXIMAL"
          />
        </div>

        <div className={styles.section}>
          {!confirm ? (
            <button className={styles.delete} onClick={() => setConfirm(true)}>DELETE THIS SESSION</button>
          ) : (
            <div className={styles.confirm}>
              <p>Delete {s.circuitTitle} on this day? Its loads logged that day go too. XP stays.</p>
              <div className={styles.confirmRow}>
                <button className={styles.deleteNow} onClick={() => { deleteSession(index); onClose(); }}>DELETE</button>
                <button className={styles.keep} onClick={() => setConfirm(false)}>KEEP IT</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
