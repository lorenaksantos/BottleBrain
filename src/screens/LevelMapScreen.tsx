import * as React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { usePlayerProgress } from '../storage/usePlayerProgress';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelMap'>;

const TOTAL_LEVELS = 50;
const COLUMNS = 4;

// ---------------------------------------------------------------------------
// What state is a level in?
// ---------------------------------------------------------------------------
type LevelState = 'solved' | 'skipped' | 'unlocked' | 'locked';

function getLevelState(
  level: number,
  solvedLevels: number[],
  skippedLevels: number[],
  unlockedLevels: number[],
): LevelState {
  if (solvedLevels.includes(level))   return 'solved';
  if (skippedLevels.includes(level))  return 'skipped';
  if (unlockedLevels.includes(level)) return 'unlocked';
  return 'locked';
}

// ---------------------------------------------------------------------------
// Colours per state
// ---------------------------------------------------------------------------
const STATE_STYLE: Record<
  LevelState,
  { bg: string; border: string; text: string; label: string }
> = {
  solved:   { bg: '#4caf7d', border: '#39895e', text: '#fff',     label: '✓' },
  skipped:  { bg: '#2b1a66', border: '#1a0f44', text: '#fff',     label: '→' },
  unlocked: { bg: '#7a5cff', border: '#5a3de0', text: '#fff',     label: ''  },
  locked:   { bg: '#e0dcea', border: '#c4bfd4', text: '#9e97b8',  label: '🔒' },
};

// ---------------------------------------------------------------------------
// Single level circle with shake animation
// ---------------------------------------------------------------------------
function LevelCircle({
  level,
  state,
  onPress,
}: {
  level: number;
  state: LevelState;
  onPress: (level: number, state: LevelState) => void;
}) {
  const tx     = useSharedValue(0);
  const style  = STATE_STYLE[state];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  const handlePress = () => {
    if (state === 'locked') {
      tx.value = withSequence(
        withTiming(-7, { duration: 40 }),
        withTiming(7,  { duration: 40 }),
        withTiming(-5, { duration: 40 }),
        withTiming(5,  { duration: 40 }),
        withTiming(0,  { duration: 50 }),
      );
    }
    onPress(level, state);
  };

  return (
    <Pressable onPress={handlePress} style={{ alignItems: 'center' }}>
      <Animated.View
        style={[
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: style.bg,
            borderWidth: 2.5,
            borderColor: style.border,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#2b1a66',
            shadowOpacity: state === 'locked' ? 0 : 0.18,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: state === 'locked' ? 0 : 3,
          },
          animStyle,
        ]}
      >
        {style.label ? (
          <Text style={{ fontSize: 18, color: style.text, fontWeight: '900' }}>
            {style.label}
          </Text>
        ) : (
          <Text style={{ fontSize: 15, color: style.text, fontWeight: '900' }}>
            {level}
          </Text>
        )}
        {/* Level number below the icon for solved/skipped */}
        {style.label !== '' && (
          <Text style={{ fontSize: 10, color: style.text, fontWeight: '700', marginTop: 1, opacity: 0.85 }}>
            {level}
          </Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------
export function LevelMapScreen({ navigation }: Props) {
  const { progress, isLoaded } = usePlayerProgress();
  const [lockedMessage, setLockedMessage] = React.useState<string | null>(null);
  const messageTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { solvedLevels, skippedLevels, unlockedLevels } = progress;

  const handleLevelPress = React.useCallback(
    (level: number, state: LevelState) => {
      if (state === 'locked') {
        // Clear any existing timeout and show message
        if (messageTimeout.current) clearTimeout(messageTimeout.current);
        setLockedMessage(`Complete level ${level - 1} first to unlock this one.`);
        messageTimeout.current = setTimeout(() => setLockedMessage(null), 2500);
        return;
      }
      // Navigate to game for any accessible level
      navigation.navigate('GameBoard', { level });
    },
    [navigation],
  );

  // Build rows of COLUMNS items each
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < levels.length; i += COLUMNS) {
    rows.push(levels.slice(i, i + COLUMNS));
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F0FF' }}>
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

      {/* Locked level toast message */}
      {lockedMessage ? (
        <View
          style={{
            position: 'absolute', top: 12, left: 20, right: 20, zIndex: 99,
            backgroundColor: '#2b1a66', borderRadius: 14, paddingVertical: 10,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center' }}>
            {lockedMessage}
          </Text>
        </View>
      ) : null}

      {/* Legend */}
      <View
        style={{
          flexDirection: 'row', gap: 14, paddingHorizontal: 20,
          paddingTop: 14, paddingBottom: 8, flexWrap: 'wrap',
        }}
      >
        {(['solved', 'skipped', 'unlocked', 'locked'] as LevelState[]).map((s) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View
              style={{
                width: 12, height: 12, borderRadius: 6,
                backgroundColor: STATE_STYLE[s].bg,
                borderWidth: 1.5, borderColor: STATE_STYLE[s].border,
              }}
            />
            <Text style={{ fontSize: 11, color: '#4a3b7a', fontWeight: '600', textTransform: 'capitalize' }}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      {/* Level grid */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {rows.map((row, rowIdx) => (
          <View
            key={rowIdx}
            style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 14 }}
          >
            {row.map((level) => (
              <LevelCircle
                key={level}
                level={level}
                state={
                  isLoaded
                    ? getLevelState(level, solvedLevels, skippedLevels, unlockedLevels)
                    : 'locked'
                }
                onPress={handleLevelPress}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}