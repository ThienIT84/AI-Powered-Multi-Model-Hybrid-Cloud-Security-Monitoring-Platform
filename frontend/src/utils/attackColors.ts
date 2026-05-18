
/**
 * Deterministic color generation for attack types based on string hashing.
 * Provides consistent colors that adapt to theme requirements.
 */

export interface AttackTheme {
  primary: string;
  secondary: string;
  muted: string;
  glow: string;
  border: string;
  gradient: string;
  text: string;
}

/**
 * Simple hash function for strings to generate a numeric seed
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Generates an HSL color based on a string name using Golden Angle distribution
 */
export function getAttackColor(name: string, isDarkMode: boolean = true): AttackTheme {
  const hash = hashString(name);
  
  // Use Golden Angle (137.5 degrees) for optimal hue distribution
  // This ensures maximum distance between sequential hash results
  const hue = Math.floor((hash * 137.508) % 360);
  
  // Higher saturation for better differentiation
  const saturation = isDarkMode ? 85 : 75;
  // Adjusted lightness for better visibility on respective themes
  const lightness = isDarkMode ? 60 : 45;
  
  const primary = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const secondary = `hsl(${hue}, ${saturation}%, ${isDarkMode ? 40 : 65}%)`;
  const muted = `hsl(${hue}, ${saturation}%, ${isDarkMode ? 12 : 92}%)`;
  const glow = `hsla(${hue}, ${saturation}%, ${lightness}%, ${isDarkMode ? 0.5 : 0.3})`;
  const border = `hsla(${hue}, ${saturation}%, ${lightness}%, ${isDarkMode ? 0.4 : 0.6})`;
  const text = isDarkMode ? `hsl(${hue}, ${saturation}%, 85%)` : `hsl(${hue}, 90%, 30%)`;
  
  const gradient = isDarkMode 
    ? `linear-gradient(135deg, hsla(${hue}, ${saturation}%, ${lightness}%, 0.15), hsla(${hue}, ${saturation}%, ${lightness}%, 0.02))`
    : `linear-gradient(135deg, hsla(${hue}, ${saturation}%, ${lightness}%, 0.08), hsla(${hue}, ${saturation}%, ${lightness}%, 0.01))`;

  return {
    primary,
    secondary,
    muted,
    glow,
    border,
    gradient,
    text
  };
}

/**
 * Global cache for attack themes to ensure performance and consistency
 */
const themeCache = new Map<string, AttackTheme>();

export function getCachedAttackTheme(name: string, isDarkMode: boolean): AttackTheme {
  const cacheKey = `${name}-${isDarkMode ? 'dark' : 'light'}`;
  if (!themeCache.has(cacheKey)) {
    themeCache.set(cacheKey, getAttackColor(name, isDarkMode));
  }
  return themeCache.get(cacheKey)!;
}
