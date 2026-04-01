/**
 * theme.ts
 *
 * All visual themes live here. To add a new theme:
 *   1. Add an entry to THEMES
 *   2. Add a date range in getActiveTheme() if it's seasonal
 *
 * The color KEYS (red, blue, green, etc.) must never change —
 * they are what levels.json stores. Only the hex VALUES change per theme.
 */

export type BallColorKey =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal';

export type Theme = {
  name: string;
  colors: Record<BallColorKey, string>;
};

// ---------------------------------------------------------------------------
// All themes
// ---------------------------------------------------------------------------
const THEMES: Record<string, Theme> = {

  default: {
    name: 'Default',
    colors: {
      red:    '#e05c5c',
      blue:   '#5b8dee',
      green:  '#4caf7d',
      yellow: '#f0c040',
      purple: '#9b6dff',
      orange: '#f0874a',
      pink:   '#f06fa0',
      teal:   '#3dbdbd',
    },
  },

  christmas: {
    name: 'Christmas',
    colors: {
      red:    '#c0392b', // deep red
      blue:   '#1a5276', // midnight blue
      green:  '#1e8449', // pine green
      yellow: '#f9ca24', // star gold
      purple: '#6c3483', // deep purple
      orange: '#ca6f1e', // warm bronze
      pink:   '#e91e8c', // candy pink
      teal:   '#148f77', // holly teal
    },
  },

  halloween: {
    name: 'Halloween',
    colors: {
      red:    '#c0392b', // blood red
      blue:   '#1c2833', // dark night
      green:  '#196f3d', // swamp green
      yellow: '#f39c12', // pumpkin orange-yellow
      purple: '#6c3483', // witch purple
      orange: '#e67e22', // pumpkin
      pink:   '#943126', // dark rose
      teal:   '#117a65', // poison teal
    },
  },

  thanksgiving: {
    name: 'Thanksgiving',
    colors: {
      red:    '#922b21', // cranberry
      blue:   '#1a5276', // twilight blue
      green:  '#1e8449', // harvest green
      yellow: '#d4ac0d', // golden wheat
      purple: '#6c3483', // plum
      orange: '#ca6f1e', // pumpkin spice
      pink:   '#cb4335', // autumn rose
      teal:   '#0e6655', // forest teal
    },
  },

  valentines: {
    name: "Valentine's Day",
    colors: {
      red:    '#e91e63', // hot pink-red
      blue:   '#9c27b0', // romantic purple
      green:  '#4caf7d', // sage
      yellow: '#ffb6c1', // soft blush
      purple: '#7b1fa2', // deep violet
      orange: '#ff6b8a', // coral pink
      pink:   '#f48fb1', // pastel rose
      teal:   '#ce93d8', // lavender
    },
  },

  easter: {
    name: 'Easter',
    colors: {
      red:    '#ff8a80',  // soft coral
      blue:   '#82b1ff',  // pastel blue
      green:  '#b9f6ca',  // mint
      yellow: '#ffff8d',  // lemon
      purple: '#ea80fc',  // lavender
      orange: '#ffd180',  // peach
      pink:   '#ff80ab',  // pastel pink
      teal:   '#a7ffeb',  // aqua mint
    },
  },

  summer: {
    name: 'Summer',
    colors: {
      red:    '#ff5252', // watermelon
      blue:   '#40c4ff', // sky blue
      green:  '#69f0ae', // tropical green
      yellow: '#ffff00', // sunshine
      purple: '#e040fb', // tropical purple
      orange: '#ff9100', // mango
      pink:   '#ff4081', // flamingo
      teal:   '#1de9b6', // ocean
    },
  },

  // Add more themes here as needed...
  // newYears, stPatricks, july4th, etc.
};

// ---------------------------------------------------------------------------
// Auto-select theme by current date
// Add seasonal ranges here — last match wins so order by priority.
// ---------------------------------------------------------------------------
export function getActiveTheme(): Theme {
  const now   = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day   = now.getDate();

  // Valentine's Day: Feb 1–14
  if (month === 2 && day <= 14) return THEMES.valentines;

  // Easter: approximate (mid March – mid April)
  if ((month === 3 && day >= 15) || (month === 4 && day <= 20)) return THEMES.easter;

  // Halloween: all of October
  if (month === 10) return THEMES.halloween;

  // Thanksgiving: Nov 15–30 (US)
  if (month === 11 && day >= 15) return THEMES.thanksgiving;

  // Christmas: Dec 1–26
  if (month === 12 && day <= 26) return THEMES.christmas;

  // Summer: June–August
  if (month >= 6 && month <= 8) return THEMES.summer;

  return THEMES.default;
}

// The active theme is resolved once at startup — consistent for the whole session
export const activeTheme = getActiveTheme();

/**
 * Resolve a color key (e.g. "red") to a hex value using the active theme.
 * Falls back to the default theme if the key is missing from the active one.
 */
export function resolveColor(key: string): string {
  const themed  = (activeTheme.colors as Record<string, string>)[key];
  if (themed) return themed;
  const fallback = (THEMES.default.colors as Record<string, string>)[key];
  return fallback ?? '#cccccc';
}
