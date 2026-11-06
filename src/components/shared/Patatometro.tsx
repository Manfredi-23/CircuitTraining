'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import { localDate } from '@/core/dates';
import { hapticTap } from '@/native/native';
import {
  PATATA_GYMS, PATATA_SLOTS, WEEKDAYS, clockOf, forecastLine, gridFor, laterLine, lastGym, observations,
  patataHeadline, patataSummary, peak, readingsOn, visitsLine, type PatataGym, type Tally,
} from '@/core/patata';
import styles from './Patatometro.module.css';

const ofText = (t: Tally) => (t.n ? `${t.yes}/${t.n}` : '·');
/** Darker the more often patata was there; an empty cell stays paper. */
const tint = (t: Tally) => (t.n ? { background: `rgba(24, 22, 16, ${(0.03 + 0.2 * (t.yes / t.n)).toFixed(3)})` } : undefined);

/**
 * THE PATATOMETRO, at the bottom of TODAY: at the gym, one tap says whether
 * there was patata, at FLUELA or OERLIKON. Every tap keeps its time; under the
 * buttons, when and where patata is at its highest.
 */
export default function Patatometro() {
  const log = useStore(s => s.patataLog);
  const logPatata = useStore(s => s.logPatata);
  const deletePatata = useStore(s => s.deletePatata);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PatataGym | null>(null);

  const gym = picked ?? lastGym(log);
  const summary = patataSummary(log);
  const today = readingsOn(log, localDate());
  const seen = observations(log).length > 0;
  const grid = gridFor(log, gym);
  const best = peak(log, gym);
  const later = laterLine(log);

  const tap = (patata: boolean) => {
    logPatata(gym, patata);
    void hapticTap();
  };

  return (
    <section className={styles.box} aria-label="Patatometro">
      <button className={styles.head} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className={styles.headText}>
          <span className={styles.label}>PATATOMETRO</span>
          <span className={summary.on ? styles.summaryOn : styles.summary}>{summary.text}</span>
        </span>
        <span className={styles.chev} aria-hidden="true">{open ? '-' : '+'}</span>
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.gyms} role="group" aria-label="Gym">
            {PATATA_GYMS.map(g => (
              <button
                key={g}
                className={`${styles.gym}${g === gym ? ` ${styles.gymOn}` : ''}`}
                aria-pressed={g === gym}
                onClick={() => setPicked(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className={styles.taps}>
            <button className={styles.tap} onClick={() => tap(true)}>PATATA</button>
            <button className={styles.tap} onClick={() => tap(false)}>NO PATATA</button>
          </div>
          <p className={styles.hint}>The time is saved with each tap. Tap again later in the visit if it changes.</p>

          {today.length > 0 && (
            <div className={styles.group}>
              <div className={styles.groupLabel}>TODAY</div>
              <ul className={styles.list}>
                {[...today].reverse().map(r => (
                  <li key={r.id} className={styles.row}>
                    <span className={styles.time}>{clockOf(r.at)}</span>
                    <span className={styles.rowGym}>{r.gym}</span>
                    <span className={r.patata ? styles.yes : styles.no}>{r.patata ? 'PATATA' : 'NO PATATA'}</span>
                    <button
                      className={styles.x}
                      onClick={() => deletePatata(r.id)}
                      aria-label={`Delete ${clockOf(r.at)} ${r.patata ? 'PATATA' : 'NO PATATA'} at ${r.gym}`}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.stats}>
            <div className={styles.groupLabel}>WHEN THERE IS PATATA</div>
            <p className={styles.headline}>{patataHeadline(log)}</p>
            {seen && (
              <>
                <p className={styles.line}>{forecastLine(log)}</p>
                {later && <p className={styles.line}>{later}</p>}
                <p className={styles.line}>
                  {PATATA_GYMS.map(g => `${g}: ${visitsLine(log, g)}`).join('. ')}.
                </p>
                <table className={styles.grid} aria-label={`${gym} by day and time`}>
                  <caption className={styles.caption}>{gym} BY DAY AND TIME</caption>
                  <thead>
                    <tr>
                      <th scope="col" aria-label="Day" />
                      {PATATA_SLOTS.map(s => <th key={s.short} scope="col" aria-label={s.label}>{s.short}</th>)}
                      <th scope="col" className={styles.all}>DAY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {WEEKDAYS.map((w, wi) => (
                      <tr key={w}>
                        <th scope="row">{w}</th>
                        {grid.cells[wi].map((t, si) => {
                          const top = best && best.weekday === wi && best.slot === si;
                          return (
                            <td
                              key={si}
                              className={`${t.n ? '' : styles.empty}${top ? ` ${styles.top}` : ''}`}
                              style={tint(t)}
                              aria-label={t.n ? `${w} ${PATATA_SLOTS[si].label}: patata ${t.yes} of ${t.n}${top ? ', the most' : ''}` : `${w} ${PATATA_SLOTS[si].label}: no readings`}
                            >
                              {ofText(t)}
                            </td>
                          );
                        })}
                        <td className={`${styles.all}${grid.byWeekday[wi].n ? '' : ` ${styles.empty}`}`}>{ofText(grid.byWeekday[wi])}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">ALL</th>
                      {grid.bySlot.map((t, si) => <td key={si} className={`${styles.all}${t.n ? '' : ` ${styles.empty}`}`}>{ofText(t)}</td>)}
                      <td className={styles.all}>{ofText(grid.total)}</td>
                    </tr>
                  </tfoot>
                </table>
                <p className={styles.hint}>
                  Patata / times seen. A visit counts once per time slot; DAY counts visits. Darker is more patata,
                  orange the most (seen twice or more).
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
