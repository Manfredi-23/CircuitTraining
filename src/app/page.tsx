'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/store';
import { useHydration } from '@/hooks/use-hydration';
import { useAudioInit } from '@/hooks/use-audio-init';
import HomeScreen from '@/components/screens/HomeScreen';
import WorkoutScreen from '@/components/screens/WorkoutScreen';
import RestScreen from '@/components/screens/RestScreen';
import CompleteScreen from '@/components/screens/CompleteScreen';
import StatsScreen from '@/components/screens/StatsScreen';

export default function Page() {
  const screen = useStore(s => s.screen);
  const runDecayCheck = useStore(s => s.runDecayCheck);
  const pickHumorLine = useStore(s => s.pickHumorLine);
  const hydrated = useHydration();

  useAudioInit();

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
      default: return <HomeScreen />;
    }
  };

  return (
    <>
      {renderScreen()}
    </>
  );
}
