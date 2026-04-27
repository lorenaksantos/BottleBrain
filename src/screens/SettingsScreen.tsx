import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';

import type { RootStackParamList } from '../navigation/types';
import { resetProgress } from '../storage/progress';
import { usePurchases } from '../purchases/usePurchases';
import useRateApp from '../hooks/useRateApp';
import useTranslation, {
  SUPPORTED_LANGUAGES,
  type Language,
  setLanguage,
  getLanguage,
} from '../i18n/i18n';

const PRIVACY_POLICY_URL = 'https://lorenaksantos.github.io/bottlebrain/privacy-policy';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_: Props) {
  const { adsRemoved, status, buy, restore } = usePurchases();
  const { rateFromSettings } = useRateApp();
  const { t } = useTranslation();
  const isLoading = status === 'loading';
  const [selectedLang, setSelectedLang] = React.useState<Language>(getLanguage());

  const onBuyRemoveAds = React.useCallback(() => {
    buy('settings').catch(() => {});
  }, [buy]);

  const onRestore = React.useCallback(() => {
    restore().catch(() => {});
  }, [restore]);

  const onReset = React.useCallback(() => {
    Alert.alert(t('reset_title'), t('reset_message'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('reset'),
        style: 'destructive',
        onPress: () => { resetProgress().catch(() => {}); },
      },
    ]);
  }, [t]);

  const onPrivacyPolicy = React.useCallback(() => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() => {
      Alert.alert('Could not open link', PRIVACY_POLICY_URL);
    });
  }, []);

  const onSelectLanguage = React.useCallback(async (lang: Language) => {
    setSelectedLang(lang);
    await setLanguage(lang);
  }, []);

  const statusMessage = React.useMemo(() => {
    switch (status) {
      case 'success':   return t('purchase_success');
      case 'error':     return t('purchase_error');
      case 'cancelled': return t('purchase_cancelled');
      default:          return null;
    }
  }, [status, t]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F0FF', padding: 18, gap: 12 }}>
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

        {/* Language picker */}
        <Card>
          <CardTitle>{t('language')}</CardTitle>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => onSelectLanguage(lang.code)}
                style={({ pressed }) => ({
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor:
                    selectedLang === lang.code
                      ? '#7a5cff'
                      : pressed ? 'rgba(122,92,255,0.10)' : 'rgba(122,92,255,0.06)',
                  borderWidth: 1,
                  borderColor:
                    selectedLang === lang.code ? '#5a3de0' : 'rgba(122,92,255,0.35)',
                })}
              >
                <Text
                  style={{
                    fontWeight: '800', fontSize: 13,
                    color: selectedLang === lang.code ? '#fff' : '#2b1a66',
                  }}
                >
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* Remove Ads */}
        <Card>
          <CardTitle>{t('remove_ads')}</CardTitle>
          {adsRemoved ? (
            <View style={{ backgroundColor: 'rgba(76,175,125,0.12)', borderRadius: 10, padding: 10 }}>
              <Text style={{ color: '#2e7d52', fontWeight: '700', fontSize: 13 }}>
                {t('remove_ads_active')}
              </Text>
            </View>
          ) : (
            <>
              <CardSubtitle>{t('remove_ads_subtitle')}</CardSubtitle>
              <Button
                title={isLoading ? t('processing') : t('remove_ads_price')}
                onPress={onBuyRemoveAds}
                disabled={isLoading}
              />
              {statusMessage && (
                <Text style={{
                  fontSize: 12, fontWeight: '600', marginTop: 2,
                  color: status === 'success' ? '#2e7d52' : '#b42318',
                }}>
                  {statusMessage}
                </Text>
              )}
            </>
          )}
        </Card>

        {/* Rate */}
        <Card>
          <CardTitle>{t('enjoying')}</CardTitle>
          <CardSubtitle>{t('rate_subtitle')}</CardSubtitle>
          <Button title={t('rate_button')} onPress={rateFromSettings} />
        </Card>

        {/* Progress */}
        <Card>
          <CardTitle>{t('progress')}</CardTitle>
          <CardSubtitle>{t('progress_subtitle')}</CardSubtitle>
          <Button title={t('reset_progress')} onPress={onReset} variant="danger" />
        </Card>

        {/* Restore */}
        <Card>
          <CardTitle>{t('purchases')}</CardTitle>
          <CardSubtitle>{t('restore_subtitle')}</CardSubtitle>
          <Button
            title={isLoading ? t('restoring') : t('restore_purchase')}
            onPress={onRestore}
            disabled={isLoading}
          />
          {status === 'error' && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#b42318', marginTop: 2 }}>
              {t('no_subscription')}
            </Text>
          )}
        </Card>

        {/* Legal */}
        <Card>
          <CardTitle>{t('legal')}</CardTitle>
          <Button title={t('privacy_policy')} onPress={onPrivacyPolicy} />
        </Card>

      </View>

      <Text style={{ textAlign: 'center', fontSize: 12, color: '#9e97b8', fontWeight: '600' }}>
        {t('version')}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.45)',
      borderColor: 'rgba(255,255,255,0.65)',
      borderWidth: 1, borderRadius: 18, padding: 14, gap: 8,
    }}>
      {children}
    </View>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 18, fontWeight: '900', color: '#2b1a66' }}>{children}</Text>;
}

function CardSubtitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontSize: 13, fontWeight: '600', color: '#4a3b7a' }}>{children}</Text>;
}

function Button({ title, onPress, variant, disabled }: {
  title: string; onPress: () => void; variant?: 'danger'; disabled?: boolean;
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
      <Text style={{ fontWeight: '900', color: isDanger ? '#b42318' : '#2b1a66' }}>{title}</Text>
    </Pressable>
  );
}
