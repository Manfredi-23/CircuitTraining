'use client';

import { useMemo, useState, useCallback } from 'react';
import { useStore } from '@/store/store';
import { useSwipe } from '@/hooks/use-swipe';
import {
  BOARD_ANGLES, GYM_COLOURS, gradeLabel, gradesOf, localDate, scaleFor,
} from '@/core/climbing';
import type { BoardName, ClimbDiscipline, ClimbEntry, ClimbSession, ClimbVenue } from '@/core/types';
import ScalePicker from '@/components/shared/ScalePicker';
import {
  CLIMB_TAGS, FALL_REASONS, TAG_GROUPS, asksWhy, describeTags, toggleTag,
} from '@/core/climb-tags';
import styles from './ClimbScreen.module.css';

const VENUES: ClimbVenue[] = ['BOARD', 'GYM', 'OUTDOOR'];
const BOARDS: BoardName[] = ['KILTER', 'TENSION'];
const DISCIPLINES: ClimbDiscipline[] = ['BOULDER', 'ROPE'];

/** Minutes on the wall. A Minimum session runs about two hours. */
const DURATION = { min: 15, max: 360, step: 15, default: 120 };

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function blankSession(): ClimbSession {
  return {
    id: newId(), date: localDate(), venue: 'GYM', discipline: 'BOULDER', climbs: [],
    durationMin: DURATION.default,
  };
}

function describeVenue(s: ClimbSession): string {
  if (s.venue === 'BOARD') return `${s.board ?? 'BOARD'} ${s.angle ?? ''}°`;
  const where = s.venue === 'OUTDOOR' ? (s.place?.trim() || 'OUTDOOR') : 'GYM';
  return `${where} ${s.discipline === 'ROPE' ? 'ROPE' : 'BOULDER'}`.toUpperCase();
}

function describeClimbs(climbs: ClimbEntry[]): string {
  return climbs
    .map(c => `${gradeLabel(c.grade)} ${c.sent ? (c.attempts <= 1 ? 'F' : `x${c.attempts}`) : 'proj'}`)
    .join(' / ');
}

function Tabs<T extends string>({ options, value, onChange, label }: {
  options: readonly T[]; value: T | undefined; onChange: (v: T) => void; label: string;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {options.map(o => (
        <button
          key={o}
          role="tab"
          aria-selected={o === value}
          className={`${styles.tab}${o === value ? ` ${styles.tabActive}` : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function ClimbScreen() {
  const { climbLog, editingClimbId, saveClimbSession, deleteClimbSession, openClimbLog, setScreen } = useStore();

  const [draft, setDraft] = useState<ClimbSession>(
    () => climbLog.find(s => s.id === editingClimbId) ?? blankSession(),
  );
  const editing = climbLog.some(s => s.id === draft.id);
  /** The climb whose style and fall reasons are open, one at a time. */
  const [tagging, setTagging] = useState<number | null>(null);
  const scale = scaleFor(draft.venue, draft.discipline);
  const grades = gradesOf(scale);

  const goBack = useCallback(() => setScreen('home'), [setScreen]);
  const { bind } = useSwipe({ onSwipeRight: goBack, onSwipeLeft: () => {} });

  const patch = (p: Partial<ClimbSession>) => setDraft(d => ({ ...d, ...p }));

  /** Venue and discipline pick the grade scale; logged grades only survive within one. */
  const changeSetup = (p: Partial<ClimbSession>) => {
    const next = { ...draft, ...p };
    if (next.venue === 'BOARD') {
      next.discipline = 'BOULDER';
      next.board = next.board ?? 'KILTER';
      next.angle = next.angle ?? BOARD_ANGLES.default;
    }
    const nextScale = scaleFor(next.venue, next.discipline);
    if (nextScale !== scale && draft.climbs.length > 0) {
      if (!window.confirm('Different grade scale. Clear the climbs logged so far?')) return;
      next.climbs = [];
    }
    setDraft(next);
  };

  const addClimb = (grade: string) =>
    patch({ climbs: [...draft.climbs, { grade, attempts: 1, sent: true }] });

  const updateClimb = (i: number, p: Partial<ClimbEntry>) =>
    patch({ climbs: draft.climbs.map((c, j) => (j === i ? { ...c, ...p } : c)) });

  const removeClimb = (i: number) => {
    setTagging(null);
    patch({ climbs: draft.climbs.filter((_, j) => j !== i) });
  };

  const toggleWhy = (i: number, id: string) => {
    const cur = draft.climbs[i].why ?? [];
    updateClimb(i, { why: cur.includes(id) ? cur.filter(r => r !== id) : [...cur, id] });
  };

  const save = () => {
    if (draft.climbs.length === 0) return;
    // A Health import becomes a full entry once its climbs are added.
    const { draft: _imported, ...complete } = draft;
    // Reasons only stay on climbs that ask for them.
    complete.climbs = complete.climbs.map(c => (asksWhy(c) ? c : { ...c, why: undefined }));
    saveClimbSession(complete);
    setTagging(null);
    setDraft(blankSession());
  };

  const startEdit = (id: string) => {
    const s = climbLog.find(c => c.id === id);
    if (!s) return;
    openClimbLog(id);
    setDraft(structuredClone(s));
  };

  const remove = () => {
    if (!window.confirm('Delete this session from the log?')) return;
    deleteClimbSession(draft.id);
    setDraft(blankSession());
  };

  const recent = useMemo(() => [...climbLog].reverse().slice(0, 30), [climbLog]);

  return (
    <div {...bind()} className={`screen screen-enter ${styles.screen}`}>
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={goBack}>&larr;</button>
        <span className={styles.title}>CLIMB LOG</span>
        <span className={styles.subtitle}>{editing ? 'Editing a session' : 'What went down today'}</span>
      </div>

      <div className={styles.scroll}>
        <div className={styles.card}>
          <label className={styles.row}>
            <span className={styles.label}>DATE</span>
            <input
              type="date"
              className={styles.input}
              value={draft.date}
              max={localDate()}
              onChange={e => e.target.value && patch({ date: e.target.value })}
            />
          </label>

          <Tabs label="Where" options={VENUES} value={draft.venue} onChange={v => changeSetup({ venue: v })} />

          {draft.venue === 'BOARD' ? (
            <>
              <Tabs label="Board" options={BOARDS} value={draft.board} onChange={b => patch({ board: b })} />
              <div className={styles.row}>
                <span className={styles.label}>ANGLE</span>
                <div className={styles.stepper}>
                  <button
                    className={styles.stepBtn}
                    disabled={(draft.angle ?? 0) <= BOARD_ANGLES.min}
                    onClick={() => patch({ angle: Math.max(BOARD_ANGLES.min, (draft.angle ?? 0) - BOARD_ANGLES.step) })}
                    aria-label="Less steep"
                  >-</button>
                  <span className={styles.stepValue}>{draft.angle}&deg;</span>
                  <button
                    className={styles.stepBtn}
                    disabled={(draft.angle ?? 0) >= BOARD_ANGLES.max}
                    onClick={() => patch({ angle: Math.min(BOARD_ANGLES.max, (draft.angle ?? 0) + BOARD_ANGLES.step) })}
                    aria-label="Steeper"
                  >+</button>
                </div>
              </div>
            </>
          ) : (
            <Tabs label="Discipline" options={DISCIPLINES} value={draft.discipline} onChange={d => changeSetup({ discipline: d })} />
          )}

          {draft.venue === 'OUTDOOR' && (
            <input
              className={styles.input}
              placeholder="Crag or area (optional)"
              value={draft.place ?? ''}
              onChange={e => patch({ place: e.target.value })}
            />
          )}

          <div className={styles.label}>TAP A GRADE TO ADD A CLIMB</div>
          {scale === 'COLOUR' ? (
            <div className={styles.colourGrid}>
              {GYM_COLOURS.map(c => (
                <button key={c.id} className={styles.colourBtn} onClick={() => addClimb(c.id)}>
                  <span className={styles.swatch} style={{ background: c.hex }} />
                  <span className={styles.colourName}>{c.label}</span>
                  <span className={styles.colourFont}>{c.font}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.gradeGrid}>
              {grades.map(g => (
                <button key={g} className={styles.gradeBtn} onClick={() => addClimb(g)}>{g}</button>
              ))}
            </div>
          )}

          {draft.climbs.length > 0 && (
            <div className={styles.climbList}>
              {draft.climbs.map((c, i) => {
                const colour = GYM_COLOURS.find(x => x.id === c.grade);
                const described = describeTags(c.tags, asksWhy(c) ? c.why : undefined);
                return (
                  <div key={i} className={styles.climbItem}>
                  <div className={styles.climbRow}>
                    <span className={styles.climbGrade}>
                      {colour && <span className={styles.swatchSm} style={{ background: colour.hex }} />}
                      {gradeLabel(c.grade)}
                    </span>
                    <button
                      className={styles.miniBtn}
                      disabled={c.attempts <= 1}
                      onClick={() => updateClimb(i, { attempts: c.attempts - 1 })}
                      aria-label="One fewer attempt"
                    >-</button>
                    <span className={styles.attempts}>
                      {c.sent && c.attempts <= 1 ? 'FLASH' : `${c.attempts} ${c.attempts === 1 ? 'GO' : 'GOES'}`}
                    </span>
                    <button
                      className={styles.miniBtn}
                      onClick={() => updateClimb(i, { attempts: c.attempts + 1 })}
                      aria-label="One more attempt"
                    >+</button>
                    <button
                      className={`${styles.projBtn}${c.sent ? '' : ` ${styles.projBtnOn}`}`}
                      onClick={() => updateClimb(i, { sent: !c.sent })}
                      aria-pressed={!c.sent}
                    >PROJ</button>
                    <button className={styles.removeBtn} onClick={() => removeClimb(i)} aria-label="Remove climb">X</button>
                  </div>
                  <button
                    className={`${styles.styleLine}${described ? ` ${styles.styleLineOn}` : ''}`}
                    aria-expanded={tagging === i}
                    onClick={() => setTagging(t => (t === i ? null : i))}
                  >
                    {tagging === i ? 'CLOSE' : described || (asksWhy(c) ? '+ STYLE AND WHY IT FELL' : '+ STYLE')}
                  </button>
                  {tagging === i && (
                    <div className={styles.tagPanel}>
                      {TAG_GROUPS.map(g => (
                        <div key={g} className={styles.tagGroup}>
                          <div className={styles.tagLabel}>{g === 'ANGLE' ? 'WALL' : g}</div>
                          <div className={styles.tagChips}>
                            {CLIMB_TAGS.filter(t => t.group === g).map(t => {
                              const on = c.tags?.includes(t.id) ?? false;
                              return (
                                <button key={t.id} aria-pressed={on} className={`${styles.tagChip}${on ? ` ${styles.tagChipOn}` : ''}`}
                                  onClick={() => updateClimb(i, { tags: toggleTag(c.tags, t.id) })}>{t.label}</button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {asksWhy(c) && (
                        <div className={styles.tagGroup}>
                          <div className={styles.tagLabel}>{c.sent ? 'WHY IT TOOK SO MANY GOES' : 'WHY IT DID NOT GO'}</div>
                          <div className={styles.tagChips}>
                            {FALL_REASONS.map(r => {
                              const on = c.why?.includes(r.id) ?? false;
                              return (
                                <button key={r.id} aria-pressed={on} className={`${styles.tagChip}${on ? ` ${styles.tagChipOn}` : ''}`}
                                  onClick={() => toggleWhy(i, r.id)}>{r.label}</button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          )}

          <button
            className={`${styles.tryHard}${draft.tryHard ? ` ${styles.tryHardOn}` : ''}`}
            aria-pressed={!!draft.tryHard}
            onClick={() => patch({ tryHard: !draft.tryHard })}
          >
            <span className={styles.tryHardBox} aria-hidden="true">{draft.tryHard ? 'X' : ''}</span>
            <span className={styles.tryHardText}>
              <span className={styles.tryHardTitle}>I GAVE ONE GO 110%</span>
              <span className={styles.tryHardWhy}>Fully committed at least once: no backing off, to the fall.</span>
            </span>
          </button>

          <div className={styles.row}>
            <span className={styles.label}>MINUTES</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                disabled={(draft.durationMin ?? DURATION.default) <= DURATION.min}
                onClick={() => patch({ durationMin: Math.max(DURATION.min, (draft.durationMin ?? DURATION.default) - DURATION.step) })}
                aria-label="Shorter"
              >-</button>
              <span className={styles.stepValue}>{draft.durationMin ?? '--'}</span>
              <button
                className={styles.stepBtn}
                disabled={(draft.durationMin ?? DURATION.default) >= DURATION.max}
                onClick={() => patch({ durationMin: Math.min(DURATION.max, (draft.durationMin ?? DURATION.default) + DURATION.step) })}
                aria-label="Longer"
              >+</button>
            </div>
          </div>

          <div className={styles.label}>HOW HARD WAS IT?</div>
          <ScalePicker
            min={1}
            max={10}
            value={draft.effort}
            onChange={v => patch({ effort: v })}
            label="Session effort, 1 to 10"
            lowText="VERY EASY"
            highText="MAXIMAL"
          />

          <button className={styles.saveBtn} disabled={draft.climbs.length === 0} onClick={save}>
            {editing ? 'SAVE CHANGES' : `SAVE SESSION${draft.climbs.length ? ` (${draft.climbs.length})` : ''}`}
          </button>
          {editing && (
            <div className={styles.editActions}>
              <button className={styles.linkBtn} onClick={() => { openClimbLog(null); setDraft(blankSession()); }}>CANCEL</button>
              <button className={`${styles.linkBtn} ${styles.linkDanger}`} onClick={remove}>DELETE SESSION</button>
            </div>
          )}
        </div>

        {recent.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>RECENT</div>
            {recent.map(s => (
              <button key={s.id} className={styles.sessionRow} onClick={() => startEdit(s.id)}>
                <span className={styles.sessionHead}>
                  <span>{s.date}</span>
                  <span className={styles.sessionVenue}>{describeVenue(s)}</span>
                </span>
                <span className={styles.sessionClimbs}>
                  {s.draft ? `From Apple Health, ${s.durationMin ?? '?'} min. Tap to add the climbs.` : describeClimbs(s.climbs)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
