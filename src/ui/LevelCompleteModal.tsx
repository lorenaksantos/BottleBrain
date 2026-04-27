import * as React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import useTranslation from '../i18n/i18n';

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
  const { t } = useTranslation();

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
            {t('level_complete')}
          </Text>

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
                {t('solved_in', {
                  moves: movesMade,
                  unit: t(movesMade === 1 ? 'move' : 'moves'),
                })}
              </Text>
            </View>
          )}

          <Text style={{ fontSize: 14, color: '#4a3b7a', marginTop: 2 }}>
            {isLastLevel ? t('all_levels_complete') : t('nice_work')}
          </Text>

          {/* Replay LEFT, Next Level RIGHT */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <SecondaryButton title={t('replay')} onPress={onReplay} />
            <PrimaryButton
              title={isLastLevel ? t('play_again') : t('next_level')}
              onPress={onNextLevel}
            />
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
        flex: 1, paddingVertical: 12, borderRadius: 14,
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
        flex: 1, paddingVertical: 12, borderRadius: 14,
        backgroundColor: pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
        borderWidth: 1, borderColor: 'rgba(122,92,255,0.35)',
        alignItems: 'center',
      })}
    >
      <Text style={{ color: '#2b1a66', fontWeight: '800', fontSize: 13 }}>{title}</Text>
    </Pressable>
  );
}
