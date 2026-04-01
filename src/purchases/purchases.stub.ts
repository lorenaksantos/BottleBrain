/**
 * purchases.stub.ts
 *
 * Safe no-op stub so the app runs in Expo Go without react-native-purchases.
 * Matches the exact same API as purchases.ts so swapping is a one-line change.
 *
 * To activate real purchases:
 *   1. Complete the setup checklist in purchases.ts
 *   2. Do an EAS Android build
 *   3. In usePurchases.ts, change the import from this stub to purchases.ts
 */

export async function initPurchases(): Promise<void> {
  // no-op in Expo Go
}

export async function checkAdsRemoved(): Promise<boolean> {
  return false;
}

export async function purchaseRemoveAds(): Promise<boolean> {
  // Simulate a successful purchase in dev so you can test the UI flow
  return false;
}

export async function restorePurchases(): Promise<boolean> {
  return false;
}
