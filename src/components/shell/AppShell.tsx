'use client';

import { useState } from 'react';
import { useStore } from '@/store/store';
import TabBar from './TabBar';
import TodayScreen from '@/components/screens/TodayScreen';
import TrainScreen from '@/components/screens/TrainScreen';
import StatsScreen from '@/components/screens/StatsScreen';
import LogScreen from '@/components/screens/LogScreen';
import SettingsOverlay from '@/components/shared/SettingsOverlay';
import SessionDetail from '@/components/shared/SessionDetail';
import ExerciseDetail from '@/components/shared/ExerciseDetail';

/**
 * The home screen: four tabs and the bar to move between them. Settings and a
 * past session open over whichever tab is showing.
 */
export default function AppShell() {
  const tab = useStore(s => s.tab);
  const setTab = useStore(s => s.setTab);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [session, setSession] = useState<number | null>(null);
  const [exercise, setExercise] = useState<string | null>(null);
  const openSettings = () => setSettingsOpen(true);

  return (
    <>
      {tab === 'today' && <TodayScreen onSettings={openSettings} />}
      {tab === 'train' && <TrainScreen onSettings={openSettings} />}
      {tab === 'stats' && <StatsScreen onSettings={openSettings} />}
      {tab === 'log' && <LogScreen onSettings={openSettings} onSession={setSession} />}
      <TabBar tab={tab} onTab={t => { setTab(t); window.scrollTo(0, 0); }} />
      <SettingsOverlay open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {session !== null && <SessionDetail index={session} onClose={() => setSession(null)} onExercise={setExercise} />}
      {exercise && <ExerciseDetail exerciseId={exercise} onClose={() => setExercise(null)} />}
    </>
  );
}
