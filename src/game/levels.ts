/**
 * levels.ts
 *
 * Levels are pre-generated static data — no BFS or randomness at runtime.
 * To regenerate:       node scripts/generateLevels.js
 * To update weekly:    re-run the script, commit the new levels.json
 * To change themes:    update src/game/theme.ts — no need to regenerate
 */
import type { Board } from './types';
import levelData from './levels.json';

const LEVELS: Board[] = levelData as Board[];

export function getLevelBoard(level: number): Board {
  const idx     = Math.floor(level) - 1;
  const safeIdx = Math.max(0, Math.min(idx, LEVELS.length - 1));
  // Deep copy so the game engine never mutates the source data
  return LEVELS[safeIdx].map((bottle) => [...bottle]);
}

export function getTotalLevels(): number {
  return LEVELS.length;
}