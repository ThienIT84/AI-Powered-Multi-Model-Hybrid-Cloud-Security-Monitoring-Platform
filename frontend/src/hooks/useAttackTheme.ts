
import { useMemo } from 'react';
import { getCachedAttackTheme, AttackTheme } from '../utils/attackColors';

/**
 * Hook to get a deterministic theme for a specific attack type
 */
export function useAttackTheme(name: string, isDarkMode: boolean): AttackTheme {
  return useMemo(() => getCachedAttackTheme(name, isDarkMode), [name, isDarkMode]);
}

/**
 * Hook to get themes for multiple attack types at once (useful for charts)
 */
export function useAttackThemes(names: string[], isDarkMode: boolean): Record<string, AttackTheme> {
  return useMemo(() => {
    const themes: Record<string, AttackTheme> = {};
    names.forEach(name => {
      themes[name] = getCachedAttackTheme(name, isDarkMode);
    });
    return themes;
  }, [names, isDarkMode]);
}
