import * as React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

type Phase = 'upsell' | 'countdown' | 'done';

const COUNTDOWN_SECONDS = 60;

export function SkipLevelModal({
  visible,
  onSkip,
  onDismiss,
  onRemoveAdsTapped,
}: {
  visible: boolean;
  onSkip: () => void;
  onDismiss: (watchedAd: boolean) => void; // true = cancelled during countdown
  onRemoveAdsTapped: () => void;
}) {
  const [phase, setPhase]           = React.useState<Phase>('upsell');
  const [secondsLeft, setSecondsLeft] = React.useState(COUNTDOWN_SECONDS);

  React.useEffect(() => {
    if (visible) {
      setPhase('upsell');
      setSecondsLeft(COUNTDOWN_SECONDS);
    }
  }, [visible]);

  React.useEffect(() => {
    if (phase !== 'countdown') return;
    if (secondsLeft <= 0) { setPhase('done'); return; }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, secondsLeft]);

  const progress = 1 - secondsLeft / COUNTDOWN_SECONDS;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(10,10,20,0.55)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.9)',
            padding: 22,
            gap: 14,
          }}
        >
          {/* ── Upsell ── */}
          {phase === 'upsell' && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#2b1a66' }}>
                Skip this level?
              </Text>
              <Text style={{ fontSize: 14, color: '#4a3b7a', lineHeight: 20 }}>
                Watch a short 60-second ad to skip — or go ad-free forever for just{' '}
                <Text style={{ fontWeight: '900', color: '#7a5cff' }}>$1.99/month</Text>.
              </Text>

              <Pressable
                onPress={onRemoveAdsTapped}
                style={({ pressed }) => ({
                  paddingVertical: 14, borderRadius: 16,
                  backgroundColor: pressed ? '#6d4bff' : '#7a5cff',
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                  Remove Ads — $1.99/month
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setPhase('countdown')}
                style={({ pressed }) => ({
                  paddingVertical: 13, borderRadius: 16,
                  backgroundColor: pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
                  borderWidth: 1, borderColor: 'rgba(122,92,255,0.35)',
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#2b1a66', fontWeight: '800', fontSize: 14 }}>
                  Watch a 60s ad instead
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onDismiss(false)}
                style={{ alignItems: 'center', paddingVertical: 6 }}
              >
                <Text style={{ color: '#9e97b8', fontWeight: '700', fontSize: 13 }}>
                  Never mind, keep playing
                </Text>
              </Pressable>
            </>
          )}

          {/* ── Countdown ── */}
          {phase === 'countdown' && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#2b1a66' }}>
                Ad playing...
              </Text>

              <View
                style={{
                  height: 160, borderRadius: 14,
                  backgroundColor: '#e8e4f8',
                  borderWidth: 1.5, borderColor: '#c4bfd4',
                  alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                <Text style={{ fontSize: 36 }}>📺</Text>
                <Text style={{ fontSize: 13, color: '#4a3b7a', fontWeight: '600' }}>
                  Your ad will appear here
                </Text>
              </View>

              <View
                style={{
                  height: 8, borderRadius: 4,
                  backgroundColor: '#e0dcea', overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: 8, borderRadius: 4,
                    backgroundColor: '#7a5cff',
                    width: `${Math.round(progress * 100)}%`,
                  }}
                />
              </View>

              <Text style={{ textAlign: 'center', color: '#4a3b7a', fontWeight: '700', fontSize: 14 }}>
                {secondsLeft}s remaining
              </Text>

              <Pressable
                onPress={() => onDismiss(true)}
                style={{ alignItems: 'center', paddingVertical: 4 }}
              >
                <Text style={{ color: '#9e97b8', fontWeight: '600', fontSize: 12 }}>
                  Cancel and keep playing
                </Text>
              </Pressable>
            </>
          )}

          {/* ── Done ── */}
          {phase === 'done' && (
            <>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#2b1a66' }}>
                All done! 🎉
              </Text>
              <Text style={{ fontSize: 14, color: '#4a3b7a', lineHeight: 20 }}>
                Thanks for watching. Ready to skip to the next level?
              </Text>

              <Pressable
                onPress={onSkip}
                style={({ pressed }) => ({
                  paddingVertical: 14, borderRadius: 16,
                  backgroundColor: pressed ? '#6d4bff' : '#7a5cff',
                  alignItems: 'center',
                })}
              >
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
                  Skip to next level →
                </Text>
              </Pressable>

              <Pressable
                onPress={() => onDismiss(false)}
                style={{ alignItems: 'center', paddingVertical: 4 }}
              >
                <Text style={{ color: '#9e97b8', fontWeight: '700', fontSize: 13 }}>
                  Actually, I'll keep playing
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

