import type { LoadedThemeAssets, ThemeAssets } from '../types';
import { getThemeByDate } from '../utils';
import { loadThemeAssets } from '../loader';
import { christmasTheme } from './christmas';
import { defaultTheme } from './default';
import { newYearTheme } from './new-year';
import { summerTheme } from './summer';

/** 内置主题列表 */
const themes: ThemeAssets[] = [defaultTheme, christmasTheme, newYearTheme, summerTheme];

/** 解析并加载主题 */
export async function resolveTheme(
  themeName?: string,
  customThemes: ThemeAssets[] = [],
): Promise<LoadedThemeAssets> {
  /** 合并内置主题和运行时主题 */
  const availableThemes = [...themes, ...customThemes];
  /** 计算本次初始化使用的主题名称 */
  const selectedName = themeName === 'random'
    ? availableThemes[Math.floor(Math.random() * availableThemes.length)].name
    : themeName === 'auto' || !themeName
      ? getThemeByDate()
      : themeName;
  /** 查找主题并回退到默认主题 */
  const theme = availableThemes.find(({ name }) => name === selectedName);
  return loadThemeAssets(theme ?? defaultTheme);
}
