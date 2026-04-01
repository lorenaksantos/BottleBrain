/**
 * purchases.ts
 *
 * RevenueCat wrapper for the "Remove Ads" subscription.
 *
 * Setup checklist before this works:
 *   1. ✅ RevenueCat account created, API key below
 *   2. ⏳ Google Play app created with an APK uploaded
 *   3. ⏳ Subscription created in Google Play with ID: "remove_ads_monthly"
 *   4. ⏳ Google Play linked to RevenueCat (docs.revenuecat.com/docs/google-play-setup)
 *   5. ⏳ EAS Android build done (react-native-purchases needs native code)
 *
 * Install: npx expo install react-native-purchases
 */

import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const REVENUECAT_API_KEY = 'test_CVskMncudrykoUfSrhcJvNkKpxn';

// Must match exactly what you create in Google Play Console
const ENTITLEMENT_ID    = 'remove_ads';
const PRODUCT_ID        = 'remove_ads_monthly';

// ---------------------------------------------------------------------------
// Init — call once at app startup
// ---------------------------------------------------------------------------
export async function initPurchases(): Promise<void> {
  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  } catch (e) {
    console.warn('[purchases] Failed to init RevenueCat:', e);
  }
}

// ---------------------------------------------------------------------------
// Check if the user currently has an active subscription
// ---------------------------------------------------------------------------
export async function checkAdsRemoved(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.warn('[purchases] Failed to check entitlements:', e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Purchase the Remove Ads subscription
// Returns true if purchase succeeded, false if cancelled or failed
// ---------------------------------------------------------------------------
export async function purchaseRemoveAds(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages?.find(
      (p) => p.product.identifier === PRODUCT_ID,
    );

    if (!pkg) {
      console.warn('[purchases] Product not found:', PRODUCT_ID);
      return false;
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e: any) {
    // userCancelled is not an error — just return false quietly
    if (e?.userCancelled) return false;
    console.warn('[purchases] Purchase failed:', e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Restore purchases — call from Settings "Restore Purchase" button
// Returns true if an active subscription was found
// ---------------------------------------------------------------------------
export async function restorePurchases(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.warn('[purchases] Restore failed:', e);
    return false;
  }
}
