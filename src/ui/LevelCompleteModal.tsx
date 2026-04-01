import * as React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export function LevelCompleteModal({
  visible,
  onNextLevel,
  onReplay,
  movesMade,
  isLastLevel,
}: {
  visible: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  movesMade: number;
  isLastLevel: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(10, 10, 20, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            borderRadius: 20,
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.9)',
            padding: 18,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#2b1a66' }}>
            Level Complete! 🎉
          </Text>

          {/* Moves counter — compact, not intrusive */}
          {movesMade > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: 'rgba(122,92,255,0.08)',
                borderRadius: 10,
                paddingVertical: 6,
                paddingHorizontal: 10,
                alignSelf: 'flex-start',
              }}
            >
              <Text style={{ fontSize: 16 }}>🧠</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#4a3b7a' }}>
                Solved in {movesMade} {movesMade === 1 ? 'move' : 'moves'}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 14, color: '#4a3b7a', marginTop: 2 }}>
            {isLastLevel
              ? 'You completed all 50 levels. Impressive!'
              : 'Nice work. Ready for the next challenge?'}
          </Text>

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            {isLastLevel ? (
              <PrimaryButton title="Play Again from Level 1" onPress={onNextLevel} />
            ) : (
              <PrimaryButton title="Next Level →" onPress={onNextLevel} />
            )}
            <SecondaryButton title="Replay" onPress={onReplay} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PrimaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: pressed ? '#6d4bff' : '#7a5cff',
        alignItems: 'center',
      })}
    >
      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(122,92,255,0.35)',
        alignItems: 'center',
      })}
    >
      <Text style={{ color: '#2b1a66', fontWeight: '800', fontSize: 13 }}>{title}</Text>
    </Pressable>
  );
}