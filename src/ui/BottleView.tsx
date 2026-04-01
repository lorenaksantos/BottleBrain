import * as React from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import type { BallColor } from '../game/types';
import { Ball } from './Ball';

export function BottleView({
  balls,
  isSelected,
  onPress,
  shakeKey,
  shouldShake,
  bottleWidth,
  bottleHeight,
  ballSize,
  ballGap,
  borderRadius,
}: {
  balls: Array<{ id: string; color: BallColor }>;
  isSelected: boolean;
  onPress: () => void;
  shakeKey: number;
  shouldShake: boolean;
  // Layout props — passed in from useBottleLayout so everything scales together
  bottleWidth: number;
  bottleHeight: number;
  ballSize: number;
  ballGap: number;
  borderRadius: number;
}) {
  const tx = useSharedValue(0);

  React.useEffect(() => {
    if (!shouldShake) return;
    tx.value = withSequence(
      withTiming(-6, { duration: 45 }),
      withTiming(6,  { duration: 45 }),
      withTiming(-4, { duration: 45 }),
      withTiming(4,  { duration: 45 }),
      withTiming(0,  { duration: 60 }),
    );
  }, [shakeKey, shouldShake, tx]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Pressable onPress={onPress} style={{ alignItems: 'center' }}>
      <Animated.View style={animStyle}>
        <View
          style={{
            width: bottleWidth,
            height: bottleHeight,
            borderRadius,
            backgroundColor: 'rgba(255,255,255,0.22)',
            borderWidth: 2.5,
            borderColor: isSelected ? '#7a5cff' : '#1a0f44',
            shadowColor: '#2b1a66',
            shadowOpacity: 0.12,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
            overflow: 'hidden',
          }}
        >
          {/* Inner glass shine */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: Math.floor(bottleWidth * 0.1),
              top: 16,
              bottom: 16,
              width: Math.floor(bottleWidth * 0.18),
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.28)',
            }}
          />
          {/* Top rim highlight */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: Math.floor(bottleWidth * 0.1),
              right: Math.floor(bottleWidth * 0.1),
              top: 10,
              height: Math.floor(bottleHeight * 0.09),
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.18)',
            }}
          />

          {/* Balls stacked from bottom up */}
          <View
            style={{
              flex: 1,
              paddingBottom: 16,
              paddingTop: 16,
              alignItems: 'center',
              flexDirection: 'column-reverse',
              justifyContent: 'flex-start',
              gap: ballGap,
            }}
          >
            {balls.map((ball) => (
              <Ball key={ball.id} color={ball.color} size={ballSize} />
            ))}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

