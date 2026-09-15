import type {
  ClickEffectFactory,
  LoadedThemeAssets,
  ResolvedConfig,
  ThemeAssets,
} from '../types';
import { drawCentered } from '../utils';
import { interpolateKeyframe, RING_KF } from '../keyframes';

/** 新年烟花点击特效 */
/** 创建新年烟花点击效果 */
const createNewYearClickEffect: ClickEffectFactory = (
  x: number,
  y: number,
  assets: LoadedThemeAssets,
  config: ResolvedConfig,
) => {
  const bornAt = performance.now();
  const fireworksDuration = assets.animDuration;
  const ringDuration = 500;
  const duration = Math.max(fireworksDuration, ringDuration);
  const images = assets.bgImages;
  const imageSize = 80;
  const ringImage = assets.ring;

  return {
    draw(ctx: CanvasRenderingContext2D, now: number): boolean {
      const elapsed = now - bornAt;
      if (elapsed >= duration) return false;

      const phaseDuration = fireworksDuration / images.length;
      const progress = Math.min(elapsed / duration, 1);
      const ringProgress = Math.min(elapsed / ringDuration, 1);
      const ringOpacity = interpolateKeyframe(RING_KF, ringProgress, 'opacity');
      const ringScale = interpolateKeyframe(RING_KF, ringProgress, 'scale');
      ctx.save();
      ctx.translate(x, y);
      ctx.shadowColor = '#fff200';
      ctx.shadowBlur = 18;

      if (ringImage) {
        ctx.save();
        ctx.globalAlpha = ringOpacity;
        ctx.shadowBlur = 0;
        drawCentered(ctx, ringImage, 0, 0, imageSize * 0.75 * ringScale);
        ctx.restore();
      }

      images.slice(0, 4).forEach((image, index) => {
        const phaseProgress = Math.min(Math.max(
          (elapsed - index * phaseDuration) / phaseDuration,
          0,
        ), 1);
        if (phaseProgress <= 0) return;
        const easedProgress = 1 - Math.pow(1 - phaseProgress, 3);
        const opacity = 0.9 * (1 - phaseProgress);
        const size = imageSize * (0.2 + easedProgress * 1.1);
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.rotate((index - 1.5) * phaseProgress * 0.5);
        drawCentered(ctx, image, 0, 0, size);
        ctx.restore();
      });

      ctx.restore();
      return true;
    },
  };
};

/** 新年背景图片资源 */
const BG_1 = new URL('./assets/themes/new-year/bg-1.png', import.meta.url).href;
/** 新年第二层背景 */
const BG_2 = new URL('./assets/themes/new-year/bg-2.png', import.meta.url).href;
/** 新年第三层背景 */
const BG_3 = new URL('./assets/themes/new-year/bg-3.png', import.meta.url).href;
/** 新年第四层背景 */
const BG_4 = new URL('./assets/themes/new-year/bg-4.png', import.meta.url).href;
/** 新年拖尾碎片资源 */
const SHARD_1 = new URL('./assets/themes/new-year/shard-1.png', import.meta.url).href;
/** 新年第二张拖尾碎片 */
const SHARD_2 = new URL('./assets/themes/new-year/shard-2.png', import.meta.url).href;
/** 新年第三张拖尾碎片 */
const SHARD_3 = new URL('./assets/themes/new-year/shard-3.png', import.meta.url).href;
/** 新年第四张拖尾碎片 */
const SHARD_4 = new URL('./assets/themes/new-year/shard-4.png', import.meta.url).href;
/** 新年光环和公共光标资源 */
const RING = new URL('./assets/themes/new-year/ring.png', import.meta.url).href;
/** 新年普通页面光标 */
const CURSOR = new URL('./assets/cursor.png', import.meta.url).href;
/** 新年可点击元素光标 */
const CURSOR_POINTER = new URL('./assets/cursor-pointer.png', import.meta.url).href;

/** 新年主题资源 */
export const newYearTheme: ThemeAssets = {
  name: 'new-year',
  shardImages: [SHARD_1, SHARD_2, SHARD_3, SHARD_4],
  bgImages: [BG_1, BG_2, BG_3, BG_4],
  ringImage: RING,
  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,
  clickEffectFactory: createNewYearClickEffect,
  particle: {
    size: 11,
    glowColor: '#ffff00',
    glowBlur: 10,
  },
  animDuration: 360,
  bgType: 'images',
  trail: {
    colors: ['#ffff00'],
    colorStops: [0],
    maxPoints: 22,
    maxWidth: 14,
    glowBlur: 20,
    fadeDelay: 20,
    fadeDuration: 20,
  },
};
