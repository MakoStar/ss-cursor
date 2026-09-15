import type { ThemeAssets, LoadedThemeAssets } from './types';

/** 加载单张图片资源 */
function loadImage(source: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!source) { resolve(null); return; }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = source;
  });
}

/** 加载主题资源 */
export async function loadThemeAssets(theme: ThemeAssets): Promise<LoadedThemeAssets> {
  const shardImages = await Promise.all(theme.shardImages.map(loadImage));
  const backgroundImages = theme.bgImages
    ? await Promise.all(theme.bgImages.map(loadImage))
    : [];
  const ringImage = theme.ringImage ? await loadImage(theme.ringImage) : null;
  const dotImage = theme.dotImage ? await loadImage(theme.dotImage) : null;

  return {
    name: theme.name,
    shards: shardImages.filter(Boolean) as HTMLImageElement[],
    cursorImage: theme.cursorImage,
    cursorPointerImage: theme.cursorPointerImage,
    trail: theme.trail,
    particle: theme.particle,
    clickEffectFactory: theme.clickEffectFactory,
    animDuration: theme.animDuration,
    bgType: theme.bgType,
    bgImages: backgroundImages.filter(Boolean) as HTMLImageElement[],
    ring: ringImage,
    dot: dotImage,
  };
}