import type { ThemeAssets, LoadedThemeAssets } from './types';
import { logWarn } from './log';

/** 加载单张图片，失败返回 null 不抛错 */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      logWarn(`failed to load sprite: ${src}`);
      resolve(null);
    };;
    img.src = src;
  });
}

/** 加载主题的所有贴图 */
export async function loadThemeAssets(
  theme: ThemeAssets,
): Promise<LoadedThemeAssets> {
  const entries = Object.entries(theme.spriteFiles);
  const images = await Promise.all(entries.map(([, src]) => loadImage(src)));
  const loadedSprites: Record<string, HTMLImageElement> = {};
  entries.forEach(([key], i) => {
    const img = images[i];
    if (img) loadedSprites[key] = img;
  });
  if (entries.length > 0 && Object.keys(loadedSprites).length === 0) {
    logWarn(`theme "${theme.name}" loaded 0 sprites, check spriteFiles`);
  }
  return { ...theme, loadedSprites };
}
