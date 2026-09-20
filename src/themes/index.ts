import type { ThemeAssets, LoadedThemeAssets } from '../types';
import { loadThemeAssets } from '../loader';
import { logWarn, logTips } from '../log';

import { defaultTheme } from './default';
import { christmas } from './christmas';
import { newyear } from './newyear';
import { summer } from './summer';

/** 内置主题注册表 */
export const BUILTIN_THEMES: ThemeAssets[] = [
  defaultTheme,
  christmas,
  newyear,
  summer,
];

/** 按名称解析主题并加载贴图 */
export async function resolveTheme(
  name: string | undefined,
  customThemes: ThemeAssets[] = [],
): Promise<LoadedThemeAssets> {
  const all = [...customThemes, ...BUILTIN_THEMES];
  const key = name ?? 'auto';

  let picked: ThemeAssets;
  if (key === 'auto') {
    picked = all.find(t => t.matchDate?.()) ?? defaultTheme;
    logTips(`auto -> ${picked.name}`);
  } else if (key === 'random') {
    picked = all[Math.floor(Math.random() * all.length)] ?? defaultTheme;
    logTips(`random -> ${picked.name}`);
  } else {
    const found = all.find(t => t.name === key);
    if (!found) {
      logWarn(`unknown theme key: "${key}",`
        + `fallback to default -- ` +
        `[${BUILTIN_THEMES.map(t => t.name).toString()}]`
      );
      picked = defaultTheme;
    } else {
      picked = found;
    }
  }

  return loadThemeAssets(picked);
}

export { defaultTheme, christmas, newyear, summer };
