import * as React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import useTranslation from '../i18n/i18n';

export function RateAppModal({
  visible,
  onRateNow,
  onDismiss,
}: {
  visible: boolean;
  onRateNow: () => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1, backgroundColor: 'rgba(10,10,20,0.45)',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <View style={{
          width: '100%', maxWidth: 380, borderRadius: 22,
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)',
          padding: 22, gap: 12,
        }}>
          <Text style={{ fontSize: 32, textAlign: 'center' }}>⭐</Text>
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#2b1a66', textAlign: 'center' }}>
            {t('rate_title')}
          </Text>
          <Text style={{ fontSize: 14, color: '#4a3b7a', textAlign: 'center', lineHeight: 20 }}>
            {t('rate_body')}
          </Text>
          <Pressable
            onPress={onRateNow}
            style={({ pressed }) => ({
              paddingVertical: 14, borderRadius: 16,
              backgroundColor: pressed ? '#6d4bff' : '#7a5cff',
              alignItems: 'center', marginTop: 4,
            })}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>
              {t('rate_now')}
            </Text>
          </Pressable>
          <Pressable onPress={onDismiss} style={{ alignItems: 'center', paddingVertical: 6 }}>
            <Text style={{ color: '#9e97b8', fontWeight: '700', fontSize: 13 }}>
              {t('rate_later')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
