import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { resetProgress } from '../storage/progress';
import { usePurchases } from '../purchases/usePurchases';

// ✏️ Update this URL once you've published to GitHub Pages
const PRIVACY_POLICY_URL = 'https://lorenaksantos.github.io/bottlebrain/privacy-policy';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_: Props) {
  const { adsRemoved, status, buy, restore } = usePurchases();
  const isLoading = status === 'loading';

  const onBuyRemoveAds = React.useCallback(() => {
    buy('settings').catch(() => {});
  }, [buy]);

  const onRestore = React.useCallback(() => {
    restore().catch(() => {});
  }, [restore]);

  const onReset = React.useCallback(() => {
    Alert.alert('Reset Progress', 'This will reset your current level and unlocks.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => { resetProgress().catch(() => {}); },
      },
    ]);
  }, []);

  const onPrivacyPolicy = React.useCallback(() => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert('Could not open link', 'Please visit: ' + PRIVACY_POLICY_URL);
    });
  }, []);

  const statusMessage = React.useMemo(() => {
    switch (status) {
      case 'success':   return '✓ Purchase successful!';
      case 'error':     return 'Something went wrong. Please try again.';
      case 'cancelled': return 'Purchase cancelled.';
      default:          return null;
    }
  }, [status]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F0FF', padding: 18, gap: 12 }}>
      {/* Background glows */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', top: -90, left: -60,
          width: 260, height: 260, borderRadius: 130,
          backgroundColor: 'rgba(109, 75, 255, 0.14)',
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', bottom: -120, right: -80,
          width: 320, height: 320, borderRadius: 160,
          backgroundColor: 'rgba(111, 204, 255, 0.14)',
        }}
      />

      <View style={{ flex: 1, gap: 12 }}>

        {/* Remove Ads card */}
        <Card>
          <CardTitle>Remove Ads</CardTitle>
          {adsRemoved ? (
            <View
              style={{
                backgroundColor: 'rgba(76,175,125,0.12)',
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ color: '#2e7d52', fontWeight: '700', fontSize: 13 }}>
                ✓ Ads removed — thank you for supporting Bottle Brain!
              </Text>
            </View>
          ) : (
            <>
              <CardSubtitle>
                Enjoy Bottle Brain without any ads for $1.99/month.
              </CardSubtitle>
              <Button
                title={isLoading ? 'Processing...' : 'Remove Ads — $1.99/month'}
                onPress={onBuyRemoveAds}
                disabled={isLoading}
              />
              {statusMessage && (
                <Text
                  style={{
                    fontSize: 12, fontWeight: '600', marginTop: 2,
                    color: status === 'success' ? '#2e7d52' : '#b42318',
                  }}
                >
                  {statusMessage}
                </Text>
              )}
            </>
          )}
        </Card>

        {/* Progress card */}
        <Card>
          <CardTitle>Progress</CardTitle>
          <CardSubtitle>Reset your saved levels and start fresh.</CardSubtitle>
          <Button title="Reset Progress" onPress={onReset} variant="danger" />
        </Card>

        {/* Restore card */}
        <Card>
          <CardTitle>Purchases</CardTitle>
          <CardSubtitle>
            Already subscribed on another device? Restore it here.
          </CardSubtitle>
          <Button
            title={isLoading ? 'Restoring...' : 'Restore Purchase'}
            onPress={onRestore}
            disabled={isLoading}
          />
          {status === 'error' && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#b42318', marginTop: 2 }}>
              No active subscription found.
            </Text>
          )}
        </Card>

        {/* Legal card */}
        <Card>
          <CardTitle>Legal</CardTitle>
          <Button title="Privacy Policy" onPress={onPrivacyPolicy} />
        </Card>

      </View>

      {/* App version at the bottom */}
      <Text style={{ textAlign: 'center', fontSize: 12, color: '#9e97b8', fontWeight: '600' }}>
        Bottle Brain v1.0.0
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(255,255,255,0.45)',
        borderColor: 'rgba(255,255,255,0.65)',
        borderWidth: 1, borderRadius: 18, padding: 14, gap: 8,
      }}
    >
      {children}
    </View>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 18, fontWeight: '900', color: '#2b1a66' }}>
      {children}
    </Text>
  );
}

function CardSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#4a3b7a' }}>
      {children}
    </Text>
  );
}

function Button({
  title, onPress, variant, disabled,
}: {
  title: string;
  onPress: () => void;
  variant?: 'danger';
  disabled?: boolean;
}) {
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        marginTop: 4, paddingVertical: 12, borderRadius: 14,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: isDanger
          ? pressed ? 'rgba(255,59,48,0.18)' : 'rgba(255,59,48,0.12)'
          : pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
        borderWidth: 1,
        borderColor: isDanger ? 'rgba(255,59,48,0.35)' : 'rgba(122,92,255,0.35)',
        alignItems: 'center',
      })}
    >
      <Text style={{ fontWeight: '900', color: isDanger ? '#b42318' : '#2b1a66' }}>
        {title}
      </Text>
    </Pressable>
  );
}
