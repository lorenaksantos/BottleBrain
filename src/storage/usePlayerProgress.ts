import * as React from 'react';

import {
  DEFAULT_PROGRESS,
  loadProgress,
  markLevelSkipped,
  markLevelSolved,
  type PlayerProgress,
  saveProgress,
} from './progress';

export function usePlayerProgress() {
  const [progress, setProgress] = React.useState<PlayerProgress>(DEFAULT_PROGRESS);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load from storage once on mount
  React.useEffect(() => {
    let alive = true;
    loadProgress()
      .then((p) => {
        if (!alive) return;
        setProgress(p);
        setIsLoaded(true);
      })
      .catch(() => {
        if (!alive) return;
        setIsLoaded(true);
      });
    return () => { alive = false; };
  }, []);

  // Generic update (used by Settings reset etc.)
  const updateProgress = React.useCallback(async (next: PlayerProgress) => {
    setProgress(next);
    await saveProgress(next);
  }, []);

  // Call when the player finishes a level ✅
  // Adds level to solvedLevels, unlocks next level, advances currentLevel
  const solveLevel = React.useCallback(async (level: number) => {
    setProgress((prev) => {
      // Optimistic update so UI reacts instantly
      const nextLevel      = level + 1;
      const solvedLevels   = Array.from(new Set([...prev.solvedLevels, level])).sort((a, b) => a - b);
      const unlockedLevels = Array.from(new Set([...prev.unlockedLevels, level, nextLevel])).sort((a, b) => a - b);
      return { ...prev, currentLevel: nextLevel, solvedLevels, unlockedLevels };
    });
    // Also persist to storage in the background
    const latest = await loadProgress();
    const saved  = await markLevelSolved(latest, level);
    setProgress(saved);
  }, []);

  // Call when the player skips a level ⏭
  // Adds level to skippedLevels, unlocks next level, advances currentLevel
  const skipLevel = React.useCallback(async (level: number) => {
    setProgress((prev) => {
      const nextLevel      = level + 1;
      const skippedLevels  = Array.from(new Set([...prev.skippedLevels, level])).sort((a, b) => a - b);
      const unlockedLevels = Array.from(new Set([...prev.unlockedLevels, level, nextLevel])).sort((a, b) => a - b);
      return { ...prev, currentLevel: nextLevel, skippedLevels, unlockedLevels };
    });
    const latest = await loadProgress();
    const saved  = await markLevelSkipped(latest, level);
    setProgress(saved);
  }, []);

  return {
    progress,
    isLoaded,
    updateProgress,
    solveLevel,
    skipLevel,
  };
}