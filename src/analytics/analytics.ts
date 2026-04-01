/**
 * analytics.ts
 *
 * Clean wrapper around Mixpanel. All game events live here.
 * Every function fails silently — analytics never crashes the game.
 *
 * Install: npx expo install mixpanel-react-native
 */

import { Mixpanel } from 'mixpanel-react-native';

const TOKEN = 'a271e2d712f475253baf9265d2f41b8e';

// ---------------------------------------------------------------------------
// Setup — one instance, initialised once at app startup
// ---------------------------------------------------------------------------
let client: Mixpanel | null = null;

export async function initAnalytics(): Promise<void> {
  try {
    const mp = new Mixpanel(TOKEN, /* trackAutomaticEvents */ true);
    await mp.init();
    client = mp;
  } catch (e) {
    console.warn('[analytics] Failed to init Mixpanel:', e);
  }
}

function track(event: string, props?: Record<string, unknown>): void {
  try {
    client?.track(event, props ?? {});
  } catch (e) {
    // Never crash the game over analytics
  }
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** Call once when the app mounts */
export function trackAppOpened(): void {
  track('App Opened');
}

/** Call when the app unmounts / goes to background */
export function trackSessionEnded(durationSeconds: number): void {
  track('Session Ended', { duration_seconds: durationSeconds });
}

// ---------------------------------------------------------------------------
// Level lifecycle
// ---------------------------------------------------------------------------

/** Call when a level screen mounts */
export function trackLevelStarted(level: number): void {
  track('Level Started', { level });
}

/**
 * Call when the player quits a level mid-game (navigates away without
 * solving or skipping). Pass how many moves they made so you can see
 * where people get stuck.
 */
export function trackLevelAbandoned(level: number, movesMAde: number): void {
  track('Level Abandoned', { level, moves_made: movesMAde });
}

/** Call when the player solves a level */
export function trackLevelCompleted(level: number, movesMade: number): void {
  track('Level Completed', { level, moves_made: movesMade });
}

// ---------------------------------------------------------------------------
// Skip flow
// ---------------------------------------------------------------------------

/** Call when the player taps the Skip button */
export function trackSkipTapped(level: number, movesMade: number): void {
  track('Skip Tapped', { level, moves_made: movesMade });
}

/** Call when the player dismisses the skip modal without skipping */
export function trackSkipDismissed(level: number): void {
  track('Skip Dismissed', { level });
}

/**
 * Call when the player chooses to watch the ad in the skip flow.
 * watched: true  = completed the countdown and confirmed skip
 * watched: false = cancelled during the countdown
 */
export function trackSkipAdResult(level: number, watched: boolean): void {
  track('Skip Ad Result', { level, watched_full_ad: watched });
}

/** Call when the player taps "Remove Ads" in the skip upsell */
export function trackRemoveAdsTapped(source: 'skip_modal' | 'settings'): void {
  track('Remove Ads Tapped', { source });
}
