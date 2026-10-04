'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { useHydration } from '@/hooks/use-hydration';
import { useAudioInit } from '@/hooks/use-audio-init';
import { useReminders } from '@/hooks/use-reminders';
import { useHealthSync } from '@/hooks/use-health';
import { initNativeShell } from '@/native/native';
import HomeScreen from '@/components/screens/HomeScreen';
import WorkoutScreen from '@/components/screens/WorkoutScreen';
import RestScreen from '@/components/screens/RestScreen';
import CompleteScreen from '@/components/screens/CompleteScreen';
import StatsScreen from '@/components/screens/StatsScreen';
import ClimbScreen from '@/components/screens/ClimbScreen';

export default function Page() {
  const screen = useStore(s => s.screen);
  const runDecayCheck = useStore(s => s.runDecayCheck);
  const pickHumorLine = useStore(s => s.pickHumorLine);
  const hydrated = useHydration();

  useAudioInit();
  useReminders(hydrated);
  useHealthSync(hydrated);

  // Style the status bar and dismiss the native launch screen. Runs once, and
  // is a no-op in the browser.
  useEffect(() => { void initNativeShell(); }, []);

  // Run decay check and pick humor line on first load
  useEffect(() => {
    if (hydrated) {
      runDecayCheck();
      pickHumorLine();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated) return null;

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'workout': return <WorkoutScreen />;
      case 'rest': return <RestScreen />;
      case 'complete': return <CompleteScreen />;
      case 'stats': return <StatsScreen />;
      case 'climb': return <ClimbScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}
