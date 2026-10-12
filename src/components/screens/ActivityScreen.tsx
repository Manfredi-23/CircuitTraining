'use client';

import { useCallback, useMemo, useState } from 'react';
import { useStore } from '@/store/store';
import { useSwipe } from '@/hooks/use-swipe';
import { localDate } from '@/core/climbing';
import {
  ACTIVITY_SPEC, ACTIVITY_TYPES, ACTIVITY_XP_MAX_DAYS, ACTIVITY_XP_PER_DAY,
  describeEstimate, estimateActivity, hasElevation,
  type ActivitySession, type ActivityType,
} from '@/core/activity';
import { CONFIG } from '@/core/config';
import ScalePicker from '@/components/shared/ScalePicker';
import styles from './ClimbScreen.module.css';
import own from './ActivityScreen.module.css';

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const MAX_DAYS = 14;

function blank(): ActivitySession {
  return { id: newId(), date: localDate(), type: 'HIKE' };
}

const ASSUMED_TEXT: Record<string, string> = {
  down: 'descent equal to the climb',
  distance: 'distance from the climb',
  duration: 'time from the walking-time rule',
  effort: 'effort from the type and the climb',
};

/** A number field that is empty when the value is unknown. */
function NumberField({ label, unit, value, placeholder, onChange, step = 1 }: {
  label: string; unit: string; value: number | undefined; placeholder: string;
  onChange: (v: number | undefined) => void; step?: number;
}) {
  return (
    <label className={styles.row}>
      <span className={styles.label}>{label}</span>
      <span className={own.field}>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          className={`${styles.input} ${own.num}`}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={e => {
            const v = e.target.value === '' ? undefined : Number(e.target.value);
            onChange(v === undefined || Number.isNaN(v) || v < 0 ? undefined : v);
          }}
        />
        <span className={own.unit}>{unit}</span>
      </span>
    </label>
  );
}

export default function ActivityScreen() {
  const { activityLog, editingActivityId, saveActivity, deleteActivity, openActivityLog, setScreen } = useStore();

  const [draft, setDraft] = useState<ActivitySession>(
    () => activityLog.find(a => a.id === editingActivityId) ?? blank(),
  );
  const editing = activityLog.some(a => a.id === draft.id);
  const spec = ACTIVITY_SPEC[draft.type];
  const elevation = hasElevation(draft.type);
  const showDistance = draft.type !== 'YOGA' && draft.type !== 'OTHER';
  const est = useMemo(() => estimateActivity(draft), [draft]);

  const goBack = useCallback(() => setScreen('home'), [setScreen]);
  const { bind } = useSwipe({ onSwipeRight: goBack, onSwipeLeft: () => {} });

  const patch = (p: Partial<ActivitySession>) => setDraft(d => ({ ...d, ...p }));

  const changeType = (type: ActivityType) => {
    const next: ActivitySession = { ...draft, type };
    if (!hasElevation(type)) { delete next.upM; delete next.downM; }
    if (!ACTIVITY_SPEC[type].mountain) { delete next.heavyPack; delete next.altitude; }
    if (type === 'YOGA' || type === 'OTHER') delete next.distanceKm;
    setDraft(next);
  };

  const save = () => {
    saveActivity(draft);
    setDraft(blank());
  };

  const startEdit = (id: string) => {
    const a = activityLog.find(x => x.id === id);
    if (!a) return;
    openActivityLog(id);
    setDraft(structuredClone(a));
  };

  const remove = () => {
    if (!window.confirm('Delete this activity from the log?')) return;
    deleteActivity(draft.id);
    setDraft(blank());
  };

  const days = draft.days ?? 1;
  const xp = ACTIVITY_XP_PER_DAY * Math.min(days, ACTIVITY_XP_MAX_DAYS);
  const xpTo = spec.xp.map(c => CONFIG.capacityLabels[c].toUpperCase()).join(' + ');
  const recent = useMemo(() => [...activityLog].reverse().slice(0, 30), [activityLog]);

  return (
    <div {...bind()} className={`screen screen-enter ${styles.screen}`}>
      <div className={styles.header}>
        <button className={styles.btnBack} onClick={goBack}>&larr;</button>
        <span className={styles.title}>ACTIVITY LOG</span>
        <span className={styles.subtitle}>{editing ? 'Editing an activity' : 'Hikes, tours, runs'}</span>
      </div>

      <div className={styles.scroll}>
        <div className={styles.card}>
          <label className={styles.row}>
            <span className={styles.label}>FIRST DAY</span>
            <input
              type="date"
              className={styles.input}
              value={draft.date}
              max={localDate()}
              onChange={e => e.target.value && patch({ date: e.target.value })}
            />
          </label>

          <div className={own.typeGrid} role="radiogroup" aria-label="Activity">
            {ACTIVITY_TYPES.map(t => (
              <button
                key={t}
                role="radio"
                aria-checked={t === draft.type}
                className={`${own.typeBtn}${t === draft.type ? ` ${own.typeBtnOn}` : ''}`}
                onClick={() => changeType(t)}
              >
                {ACTIVITY_SPEC[t].label}
              </button>
            ))}
          </div>

          <div className={styles.row}>
            <span className={styles.label}>DAYS</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                disabled={days <= 1}
                onClick={() => patch({ days: days - 1 })}
                aria-label="One day fewer"
              >-</button>
              <span className={styles.stepValue}>{days}</span>
              <button
                className={styles.stepBtn}
                disabled={days >= MAX_DAYS}
                onClick={() => patch({ days: days + 1 })}
                aria-label="One day more"
              >+</button>
            </div>
          </div>

          <div className={own.hint}>Fill in what you know. Anything left empty is estimated.</div>

          {elevation && (
            <>
              <NumberField label="UP" unit="m" step={50} value={draft.upM} placeholder="0" onChange={v => patch({ upM: v })} />
              <NumberField
                label="DOWN" unit="m" step={50} value={draft.downM}
                placeholder={est.assumed.includes('down') ? String(est.downM) : '0'}
                onChange={v => patch({ downM: v })}
              />
            </>
          )}
          {showDistance && (
            <NumberField
              label="DISTANCE" unit="km" step={0.5} value={draft.distanceKm}
              placeholder={est.assumed.includes('distance') ? String(est.distanceKm) : '-'}
              onChange={v => patch({ distanceKm: v })}
            />
          )}
          <NumberField
            label="MOVING TIME" unit="h" step={0.25}
            value={draft.durationMin === undefined ? undefined : Math.round((draft.durationMin / 60) * 100) / 100}
            placeholder={String(Math.round((est.durationMin / 60) * 100) / 100)}
            onChange={v => patch({ durationMin: v === undefined ? undefined : Math.round(v * 60) })}
          />

          {spec.mountain && (
            <div className={own.toggles}>
              <button
                className={`${own.toggle}${draft.heavyPack ? ` ${own.toggleOn}` : ''}`}
                aria-pressed={!!draft.heavyPack}
                onClick={() => patch({ heavyPack: !draft.heavyPack || undefined })}
              >HEAVY PACK</button>
              <button
                className={`${own.toggle}${draft.altitude ? ` ${own.toggleOn}` : ''}`}
                aria-pressed={!!draft.altitude}
                onClick={() => patch({ altitude: !draft.altitude || undefined })}
              >ABOVE 2500 M</button>
            </div>
          )}

          <div className={styles.row}>
            <span className={styles.label}>HOW HARD WAS IT?</span>
            {draft.effort !== undefined && (
              <button className={styles.linkBtn} onClick={() => patch({ effort: undefined })}>ESTIMATE IT</button>
            )}
          </div>
          <ScalePicker
            min={1}
            max={10}
            value={draft.effort}
            onChange={v => patch({ effort: v })}
            label="Effort, 1 to 10"
            lowText="VERY EASY"
            highText="MAXIMAL"
          />

          <input
            className={styles.input}
            placeholder="Where (optional)"
            value={draft.place ?? ''}
            onChange={e => patch({ place: e.target.value || undefined })}
          />

          <div className={own.estimate}>
            <div className={own.estHead}>{spec.label}: {describeEstimate(est, draft.type)}</div>
            <div className={own.estLine}>
              Effort <b>{est.effort}</b>{est.assumed.includes('effort') ? ' (estimated)' : ''}
              {' '}&middot; load <b>{Math.round(est.load)}</b>
              {xp > 0 && xpTo && <> &middot; +{xp} XP {xpTo}</>}
            </div>
            {est.assumed.length > 0 && (
              <div className={own.estNote}>
                Assumed: {est.assumed.map(a => ASSUMED_TEXT[a]).join(', ')}.
              </div>
            )}
            {est.soreHours > 0 && (
              <div className={own.estNote}>
                Legs sore for about {est.soreHours}h after the last day: leg sessions step aside.
              </div>
            )}
          </div>

          <button className={styles.saveBtn} onClick={save}>
            {editing ? 'SAVE CHANGES' : 'SAVE ACTIVITY'}
          </button>
          {editing && (
            <div className={styles.editActions}>
              <button className={styles.linkBtn} onClick={() => { openActivityLog(null); setDraft(blank()); }}>CANCEL</button>
              <button className={`${styles.linkBtn} ${styles.linkDanger}`} onClick={remove}>DELETE ACTIVITY</button>
            </div>
          )}
        </div>

        {recent.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>RECENT</div>
            {recent.map(a => {
              const e = estimateActivity(a);
              return (
                <button key={a.id} className={styles.sessionRow} onClick={() => startEdit(a.id)}>
                  <span className={styles.sessionHead}>
                    <span>{a.date}</span>
                    <span className={styles.sessionVenue}>{ACTIVITY_SPEC[a.type].label}{a.place ? ` ${a.place.toUpperCase()}` : ''}</span>
                  </span>
                  <span className={styles.sessionClimbs}>
                    {describeEstimate(e, a.type)}, effort {e.effort}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
