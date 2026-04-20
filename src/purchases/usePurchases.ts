/**
 * usePurchases.ts
 *
 * Manages purchase state and exposes buy/restore actions.
 *
 * When ready for a real build, change the import below from
 * the stub to the real implementation:
 *
 *   STUB (Expo Go):  '../purchases/purchases.stub'
 *   REAL (EAS build): '../purchases/purchases'
 */

import * as React from 'react';

// ✏️  Switch this import when you do your EAS build:
import {
  initPurchases,
  checkAdsRemoved,
  purchaseRemoveAds,
  restorePurchases,
} from './purchases';

import { usePlayerProgress } from '../storage/usePlayerProgress';
import { trackRemoveAdsTapped } from '../analytics/analytics';

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'error' | 'cancelled';

export function usePurchases() {
  const { progress, updateProgress } = usePlayerProgress();
  const [status, setStatus] = React.useState<PurchaseStatus>('idle');

  // Init RevenueCat once on mount
  React.useEffect(() => {
    initPurchases().catch(() => {});
  }, []);

  // Sync subscription status from RevenueCat on mount
  // (catches renewals and cancellations that happened while app was closed)
  React.useEffect(() => {
    checkAdsRemoved().then((active) => {
      if (active !== progress.adsRemoved) {
        updateProgress({ ...progress, adsRemoved: active }).catch(() => {});
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = React.useCallback(async (source: 'skip_modal' | 'settings') => {
    trackRemoveAdsTapped(source);
    setStatus('loading');
    try {
      const success = await purchaseRemoveAds();
      if (success) {
        await updateProgress({ ...progress, adsRemoved: true });
        setStatus('success');
      } else {
        setStatus('cancelled');
      }
    } catch {
      setStatus('error');
    } finally {
      // Reset status after a short delay so UI can show feedback
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [progress, updateProgress]);

  const restore = React.useCallback(async () => {
    setStatus('loading');
    try {
      const found = await restorePurchases();
      if (found) {
        await updateProgress({ ...progress, adsRemoved: true });
        setStatus('success');
      } else {
        setStatus('error'); // nothing to restore
      }
    } catch {
      setStatus('error');
    } finally {
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [progress, updateProgress]);

  return {
    adsRemoved: progress.adsRemoved,
    status,
    buy,
    restore,
  };
}

