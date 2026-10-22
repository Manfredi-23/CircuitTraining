'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useStore } from '@/store/store';
import { getModeData } from '@/core/data-index';
import { estimateDuration, getReadiness } from '@/core/engine';
import { dayOf, localDate } from '@/core/dates';
import { CONFIG } from '@/core/config';
import { useToday } from '@/hooks/use-today';
import { useLauncher } from '@/hooks/use-launcher';
import ScreenHeader from '@/components/shell/ScreenHeader';
import SessionCard from '@/components/shared/SessionCard';
import DayControls from '@/components/shared/DayControls';
import type { Circuit, Mode } from '@/core/types';
import styles from './TodayScreen.module.css';

const circuitOf = (mode: Mode, id: string): Circuit | undefined => getModeData(mode).find(c => c.id === id);

const DATE_FMT = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

/**
 * TODAY answers one question: what do I train now? The recommended session
 * leads, large, with the reason in words and one START. Under it what the
 * athlete can tell the app about today, and up to two sessions that would
 * also fit, each with why it is second.
 */
export default function TodayScreen({ onSettings }: { onSettings: () => void }) {
  const progress = useStore(s => s.progress);
  const energy = useStore(s => s.energy);
  const setEnergy = useStore(s => s.setEnergy);
  const sessionLog = useStore(s => s.sessionLog);
  const humorLine = useStore(s => s.humorLine);
  const pendingDecayEvents = useStore(s => s.pendingDecayEvents);
  const dismissDecay = useStore(s => s.dismissDecay);
  const setTab = useStore(s => s.setTab);
  const { block, day, healthDay, recommendation, alternatives } = useToday();
  const launcher = useLauncher();

  const today = localDate();
  const doneToday = sessionLog.filter(s => dayOf(s.date) === today);
  const rec = recommendation ? circuitOf(recommendation.mode, recommendation.circuitId) : undefined;
  const recList = rec && recommendation ? launcher.listOf({ mode: recommendation.mode, circuit: rec }) : [];
  const readiness = rec ? getReadiness(rec, progress) : null;

  const derank = useMemo(() => {
    const e = pendingDecayEvents[0];
    if (!e) return null;
    return CONFIG.derankMessages[Math.floor(Math.random() * CONFIG.derankMessages.length)]
      .replace('{capacity}', CONFIG.capacityLabels[e.capacity])
      .replace('{level}', String(e.level));
  }, [pendingDecayEvents]);

  return (
    <div className={`screen screen-enter tab-screen ${styles.screen}`}>
      <ScreenHeader
        title="TODAY"
        sub={`${DATE_FMT.format(new Date())} · ${block.deload ? 'deload week' : `build week ${block.week} of ${block.buildWeeks}`}`}
        onSettings={onSettings}
      >
        <Image src="/images/logo.svg" alt="7Bit" width={80} height={32} className={styles.logo} priority />
      </ScreenHeader>

      {derank && (
        <div className={styles.banner}>
          <span>{derank}</span>
          <button className={styles.bannerX} onClick={dismissDecay} aria-label="Dismiss">X</button>
        </div>
      )}
      {healthDay?.energy === 'TIRED' && <div className={styles.banner}>TIRED suggested by Apple Health: {healthDay.reasons.join(', ')}.</div>}

      {rec && recommendation ? (
        <section className={styles.lead} aria-label="Recommended session">
          <div className={styles.crumb}>RECOMMENDED &middot; {recommendation.mode} {rec.circuitNum}</div>
          <p className={styles.reason}>{recommendation.reason}</p>
          {readiness && readiness.level !== 'ready' && (
            <div className={`${styles.banner}${readiness.level === 'rest' ? ` ${styles.bannerWarn}` : ''}`}>{readiness.message}</div>
          )}
          <SessionCard
            circuit={rec}
            progress={progress}
            energy={energy}
            suggested={healthDay?.energy}
            suggestedWhy={healthDay?.reasons.join(', ')}
            duration={estimateDuration(recList)}
            block={block}
            onEnergy={setEnergy}
            onOpen={() => launcher.show({ mode: recommendation.mode, circuit: rec })}
          />
          <button className={styles.start} onClick={() => launcher.start({ mode: recommendation.mode, circuit: rec })}>
            START {rec.title} &middot; {estimateDuration(recList)} MIN
          </button>
        </section>
      ) : (
        <section className={styles.empty}>
          <div className={styles.emptyTitle}>
            {day.off ? (day.off === 'SICK' ? 'Sick day.' : 'Rest day.') : doneToday.length ? 'Done for today.' : 'Nothing is due.'}
          </div>
          <p className={styles.emptyText}>
            {day.off
              ? 'Nothing is due, and levels do not fade today.'
              : doneToday.length
                ? doneToday.map(s => s.circuitTitle).join(', ') + '. Recovery is where it turns into strength.'
                : 'Pick anything from TRAIN, or build your own.'}
          </p>
          <button className={styles.secondary} onClick={() => setTab('train')}>OPEN TRAIN</button>
        </section>
      )}

      <DayControls />

      {alternatives.length > 0 && (
        <section className={styles.alts}>
          <h2 className={styles.h2}>ALSO FITS TODAY</h2>
          <div className={styles.altList}>
            {alternatives.map(a => {
              const c = circuitOf(a.mode, a.circuitId);
              if (!c) return null;
              const minutes = estimateDuration(launcher.listOf({ mode: a.mode, circuit: c }));
              return (
                <button key={a.circuitId} className={styles.altRow} onClick={() => launcher.show({ mode: a.mode, circuit: c })}>
                  <span className={styles.altNum}>{c.circuitNum}</span>
                  <span className={styles.altBody}>
                    <span className={styles.altTitle}>{a.mode} &middot; {c.title}</span>
                    <span className={styles.altWhy}>{a.reason}</span>
                  </span>
                  <span className={styles.altMin}>{minutes}<small> min</small></span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <p className={styles.humor}>{humorLine}</p>
      {launcher.element}
    </div>
  );
}
