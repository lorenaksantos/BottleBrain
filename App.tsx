import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { MainMenuScreen }  from './src/screens/MainMenuScreen';
import { LevelMapScreen }  from './src/screens/LevelMapScreen';
import { GameBoardScreen } from './src/screens/GameBoardScreen';
import { SettingsScreen }  from './src/screens/SettingsScreen';
import type { RootStackParamList } from './src/navigation/types';
import {
  initAnalytics,
  trackAppOpened,
  trackSessionEnded,
} from './src/analytics/analytics';

export default function App() {
  const Stack = React.useMemo(
    () => createNativeStackNavigator<RootStackParamList>(),
    [],
  );

  const sessionStartRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    // Init analytics
    initAnalytics().then(() => {
      trackAppOpened();
    });

    // Track session length
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        const seconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
        trackSessionEnded(seconds);
        sessionStartRef.current = Date.now();
      }
      if (state === 'active') {
        sessionStartRef.current = Date.now();
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#F6F0FF' },
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F6F0FF' },
        }}
      >
        <Stack.Screen name="MainMenu"  component={MainMenuScreen}  options={{ title: 'Bottle Brain' }} />
        <Stack.Screen name="LevelMap"  component={LevelMapScreen}  options={{ title: 'Levels' }} />
        <Stack.Screen name="GameBoard" component={GameBoardScreen} options={{ title: 'Level' }} />
        <Stack.Screen name="Settings"  component={SettingsScreen}  options={{ title: 'Settings' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

