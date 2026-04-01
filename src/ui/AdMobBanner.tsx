import * as React from 'react';
import { View } from 'react-native';

// AdMob is temporarily disabled so the app runs in Expo Go.
// When ready to ship, restore the full react-native-google-mobile-ads
// implementation and do a proper EAS build.
export function AdMobBanner() {
  return <View style={{ height: 50 }} />;
}
