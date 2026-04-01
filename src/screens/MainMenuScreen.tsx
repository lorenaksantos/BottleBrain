import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { usePlayerProgress } from '../storage/usePlayerProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  const { progress, isLoaded } = usePlayerProgress();
  const level = isLoaded ? progress.currentLevel : 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F0FF', padding: 18 }}>
      {/* Background glows */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: -90, left: -60,
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: 'rgba(109, 75, 255, 0.16)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', bottom: -120, right: -80,
          width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(111, 204, 255, 0.16)',
        }}
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.45)',
            borderColor: 'rgba(255,255,255,0.65)',
            borderWidth: 1,
            borderRadius: 24,
            padding: 18,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#2b1a66' }}>
            Bottle Brain
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#4a3b7a', fontWeight: '600' }}>
            A cozy color-sorting puzzle.
          </Text>

          <View style={{ marginTop: 18, gap: 10 }}>
            {/* Continue / start playing at current level */}
            <PrimaryButton
              title={`Play — Level ${level}`}
              onPress={() => navigation.navigate('GameBoard', { level })}
            />

            {/* Browse all 50 levels */}
            <SecondaryButton
              title="All Levels"
              onPress={() => navigation.navigate('LevelMap')}
            />

            <SecondaryButton
              title="Settings"
              onPress={() => navigation.navigate('Settings')}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: pressed ? '#6d4bff' : '#7a5cff',
        alignItems: 'center',
      })}
    >
      <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(122,92,255,0.35)',
        alignItems: 'center',
      })}
    >
      <Text style={{ color: '#2b1a66', fontWeight: '900', fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}