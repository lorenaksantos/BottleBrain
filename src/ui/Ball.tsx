import * as React from 'react';
import { View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

// Inline color map — no import needed, cannot fail at module load time.
// Keeps Ball.tsx fully self-contained so a theme import error never
// prevents the game from rendering.
const COLOR_MAP: Record<string, string> = {
  red:    '#e05c5c',
  blue:   '#5b8dee',
  green:  '#4caf7d',
  yellow: '#f0c040',
  purple: '#9b6dff',
  orange: '#f0874a',
  pink:   '#f06fa0',
  teal:   '#3dbdbd',
};

function resolveHex(color: string): string {
  // Already a hex value — pass through directly
  if (color.startsWith('#')) return color;
  // Look up in inline map
  return COLOR_MAP[color] ?? '#cccccc';
}

export function Ball({ color, size }: { color: string; size: number }) {
  const hex = resolveHex(color);

  return (
    <Animated.View
      layout={Layout.springify()}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hex,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        shadowColor: '#000',
        shadowOpacity: 0.14,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 2,
      }}
    >
      {/* Top highlight */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: size * 0.55,
          backgroundColor: 'rgba(255,255,255,0.20)',
        }}
      />
      {/* Glossy streak */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -size * 0.35,
          left: size * 0.14,
          width: size * 0.72,
          height: size * 0.8,
          backgroundColor: 'rgba(255,255,255,0.18)',
          transform: [{ rotate: '-20deg' }],
        }}
      />
      {/* Underside shadow */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -2, left: 0, right: 0,
          height: size * 0.35,
          backgroundColor: 'rgba(0,0,0,0.10)',
        }}
      />
    </Animated.View>
  );
}
