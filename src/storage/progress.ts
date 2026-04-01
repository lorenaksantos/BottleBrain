import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  currentLevel:   'bb:currentLevel',
  unlockedLevels: 'bb:unlockedLevels',
  solvedLevels:   'bb:solvedLevels',   // levels the player actually completed ✅
  skippedLevels:  'bb:skippedLevels',  // levels the player skipped ⏭
  adsRemoved:     'bb:adsRemoved',
  hasPurchasedAds:'bb:hasPurchasedAds',
} as const;

export type PlayerProgress = {
  currentLevel:    number;
  unlockedLevels:  number[];  // levels the player can enter (solved + skipped + next)
  solvedLevels:    number[];  // levels completed — shown GREEN on the map
  skippedLevels:   number[];  // levels skipped   — shown BLACK (accessible) on the map
  adsRemoved:      boolean;
  hasPurchasedAds?: boolean;  // legacy key, kept for backwards compatibility
};

export const DEFAULT_PROGRESS: PlayerProgress = {
  currentLevel:   1,
  unlockedLevels: [1],
  solvedLevels:   [],
  skippedLevels:  [],
  adsRemoved:     false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseNumber(value: string | null, fallback: number) {
  const n = value == null ? NaN : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseBoolean(value: string | null, fallback: boolean) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

function parseNumberArray(value: string | null, fallback: number[]): number[] {
  if (!value) return fallback;
  try {
    const arr = JSON.parse(value);
    if (!Array.isArray(arr)) return fallback;
    const nums = arr.map((x) => Number(x)).filter((n) => Number.isFinite(n));
    return nums.length
      ? Array.from(new Set(nums)).sort((a, b) => a - b)
      : fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------
export async function loadProgress(): Promise<PlayerProgress> {
  const pairs = await AsyncStorage.multiGet([
    KEYS.currentLevel,
    KEYS.unlockedLevels,
    KEYS.solvedLevels,
    KEYS.skippedLevels,
    KEYS.adsRemoved,
    KEYS.hasPurchasedAds,
  ]);
  const map = new Map(pairs);

  const storedAdsRemoved   = parseBoolean(map.get(KEYS.adsRemoved)      ?? null, false);
  const legacyPurchasedAds = parseBoolean(map.get(KEYS.hasPurchasedAds) ?? null, false);

  const solvedLevels  = parseNumberArray(map.get(KEYS.solvedLevels)  ?? null, []);
  const skippedLevels = parseNumberArray(map.get(KEYS.skippedLevels) ?? null, []);

  // unlockedLevels = everything the player can enter.
  // Re-derive it from solved + skipped so it's always consistent,
  // but also honour whatever was stored (for players upgrading from old saves).
  const storedUnlocked = parseNumberArray(map.get(KEYS.unlockedLevels) ?? null, [1]);
  const derived = Array.from(
    new Set([...storedUnlocked, ...solvedLevels, ...skippedLevels, 1]),
  ).sort((a, b) => a - b);

  return {
    currentLevel:    parseNumber(map.get(KEYS.currentLevel) ?? null, 1),
    unlockedLevels:  derived,
    solvedLevels,
    skippedLevels,
    adsRemoved:      storedAdsRemoved || legacyPurchasedAds,
    hasPurchasedAds: legacyPurchasedAds,
  };
}

// ---------------------------------------------------------------------------
// Save  (stores only what changed — keeps phone storage tiny)
// ---------------------------------------------------------------------------
export async function saveProgress(progress: PlayerProgress) {
  await AsyncStorage.multiSet([
    [KEYS.currentLevel,    String(progress.currentLevel)],
    [KEYS.unlockedLevels,  JSON.stringify(progress.unlockedLevels)],
    [KEYS.solvedLevels,    JSON.stringify(progress.solvedLevels)],
    [KEYS.skippedLevels,   JSON.stringify(progress.skippedLevels)],
    [KEYS.adsRemoved,      String(progress.adsRemoved)],
    [KEYS.hasPurchasedAds, String(progress.adsRemoved)],
  ]);
}

// ---------------------------------------------------------------------------
// Reset
// ---------------------------------------------------------------------------
export async function resetProgress() {
  await AsyncStorage.multiRemove(Object.values(KEYS));
  await saveProgress(DEFAULT_PROGRESS);
}

// ---------------------------------------------------------------------------
// Helper: call this when a player SOLVES a level
// Returns the updated progress object (already saved to storage)
// ---------------------------------------------------------------------------
export async function markLevelSolved(
  progress: PlayerProgress,
  level: number,
): Promise<PlayerProgress> {
  const nextLevel     = level + 1;
  const solvedLevels  = Array.from(new Set([...progress.solvedLevels, level])).sort((a, b) => a - b);
  const unlockedLevels = Array.from(
    new Set([...progress.unlockedLevels, level, nextLevel]),
  ).sort((a, b) => a - b);

  const updated: PlayerProgress = {
    ...progress,
    currentLevel: nextLevel,
    solvedLevels,
    unlockedLevels,
  };
  await saveProgress(updated);
  return updated;
}

// ---------------------------------------------------------------------------
// Helper: call this when a player SKIPS a level
// Returns the updated progress object (already saved to storage)
// ---------------------------------------------------------------------------
export async function markLevelSkipped(
  progress: PlayerProgress,
  level: number,
): Promise<PlayerProgress> {
  const nextLevel      = level + 1;
  const skippedLevels  = Array.from(new Set([...progress.skippedLevels, level])).sort((a, b) => a - b);
  const unlockedLevels = Array.from(
    new Set([...progress.unlockedLevels, level, nextLevel]),
  ).sort((a, b) => a - b);

  const updated: PlayerProgress = {
    ...progress,
    currentLevel: nextLevel,
    skippedLevels,
    unlockedLevels,
  };
  await saveProgress(updated);
  return updated;
}