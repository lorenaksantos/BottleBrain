/**
 * useRateApp.ts
 *
 * Handles "Rate the App" logic.
 * - Auto-prompt shown once after completing level 5
 * - Manual trigger from Settings always works
 */

import * as React from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_URL = Platform.select({
  android: 'https://play.google.com/store/apps/details?id=com.lorena.bottlebrain',
  ios:     'https://apps.apple.com/app/bottle-brain/id000000000',
  default: 'https://play.google.com/store/apps/details?id=com.lorena.bottlebrain',
});

const PROMPTED_KEY = 'bb:ratePromptShown';

function useRateAppHook() {
  const [showPrompt, setShowPrompt] = React.useState(false);

  // Check on mount if we've already shown the prompt
  // This lets us catch the case where the user previously dismissed
  const hasShownRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    AsyncStorage.getItem(PROMPTED_KEY)
      .then((val) => {
        hasShownRef.current = val === 'true';
      })
      .catch(() => {
        hasShownRef.current = false;
      });
  }, []);

  const checkAutoPrompt = React.useCallback((completedLevel: number) => {
    // Only trigger at level 5
    if (completedLevel !== 5) return;

    // Use the ref so we don't need to await AsyncStorage here
    // (avoids timing issues with the hasWon useEffect)
    if (hasShownRef.current === true) return;

    // Small delay so the level complete modal shows first
    setTimeout(() => {
      setShowPrompt(true);
    }, 1500);
  }, []);

  const markShown = React.useCallback(async () => {
    hasShownRef.current = true;
    setShowPrompt(false);
    try {
      await AsyncStorage.setItem(PROMPTED_KEY, 'true');
    } catch {}
  }, []);

  const openStore = React.useCallback(async () => {
    try {
      await Linking.openURL(STORE_URL!);
    } catch {
      await Linking.openURL(
        'https://play.google.com/store/apps/details?id=com.lorena.bottlebrain',
      ).catch(() => {});
    }
  }, []);

  const rateNow = React.useCallback(async () => {
    await markShown();
    await openStore();
  }, [markShown, openStore]);

  const dismiss = React.useCallback(async () => {
    await markShown();
  }, [markShown]);

  const rateFromSettings = React.useCallback(async () => {
    await openStore();
  }, [openStore]);

  return {
    showPrompt,
    checkAutoPrompt,
    rateNow,
    dismiss,
    rateFromSettings,
  };
}

export { useRateAppHook as useRateApp };
export default useRateAppHook;
