
  useSounds.ts
 
 /* Currently a safe stub so the game runs in Expo Go without expo-av.
 
  When ready to do a real build (EAS/Android):
    1. Run: npx expo install expo-av
    2. Replace this file with the full implementation below
 
  ─── Full implementation (save for when you have a real build) ───────────────
  */
 
  import { Audio } from 'expo-av';
  import * as React from 'react';
 
  type SoundName = 'move' | 'select' | 'invalid' | 'complete';
 
  const VOLUMES: Record<SoundName, number> = {
    move: 0.6, select: 0.4, invalid: 0.5, complete: 0.8,
  };
 
  function getSoundFile(name: SoundName): number | null {
    try {
      switch (name) {
        case 'move':     return require('../../assets/sounds/move.mp3');
        case 'select':   return require('../../assets/sounds/select.mp3');
        case 'invalid':  return require('../../assets/sounds/invalid.mp3');
        case 'complete': return require('../../assets/sounds/complete.mp3');
      }
    } catch { return null; }
  }
 
  export function useSounds() {
    const soundsRef = React.useRef<Partial<Record<SoundName, Audio.Sound>>>({});
    const loadedRef = React.useRef(false);
 
    React.useEffect(() => {
      let cancelled = false;
      async function loadAll() {
        try {
          await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
          const names: SoundName[] = ['move', 'select', 'invalid', 'complete'];
          const loaded: Partial<Record<SoundName, Audio.Sound>> = {};
          for (const name of names) {
            const file = getSoundFile(name);
            if (file == null) continue;
            try {
              const { sound } = await Audio.Sound.createAsync(file, {
                volume: VOLUMES[name], shouldPlay: false,
              });
              loaded[name] = sound;
            } catch {}
          }
          if (!cancelled) { soundsRef.current = loaded; loadedRef.current = true; }
        } catch (e) { console.warn('[useSounds] Audio setup failed:', e); }
      }
      loadAll();
      return () => {
        cancelled = true;
        Object.values(soundsRef.current).forEach(s => s?.unloadAsync().catch(() => {}));
        soundsRef.current = {}; loadedRef.current = false;
      };
    }, []);
 
    const play = React.useCallback(async (name: SoundName) => {
      if (!loadedRef.current) return;
      try {
        const sound = soundsRef.current[name];
        if (!sound) return;
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch {}
    }, []);
 
    return {
      playMove:     () => play('move'),
      playSelect:   () => play('select'),
      playInvalid:  () => play('invalid'),
      playComplete: () => play('complete'),
    };
  }
