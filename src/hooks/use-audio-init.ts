import { useEffect } from 'react';
import { getAudioContext } from './audio-context';

export function useAudioInit(): void {
  useEffect(() => {
    const init = () => {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    };
    document.addEventListener('touchstart', init, { once: true });
    document.addEventListener('click', init, { once: true });
    return () => {
      document.removeEventListener('touchstart', init);
      document.removeEventListener('click', init);
    };
  }, []);
}
