import type {
  ClickEffectFactory,
  LoadedThemeAssets,
  ResolvedConfig,
  ThemeAssets,
} from '../types';
import { drawCentered } from '../utils';
import { interpolateKeyframe, CHRISTMAS_BG_KF } from '../keyframes';

/** Summer 点击特效 */
/** 创建 Summer 点击效果 */
const createSummerClickEffect: ClickEffectFactory = (
  x: number,
  y: number,
  assets: LoadedThemeAssets,
  _config: ResolvedConfig,
) => {
  const bornAt = performance.now();
  const burstDuration = assets.animDuration;
  const followDuration = burstDuration + 30;
  const duration = followDuration;
  const [burstImage, followImage] = assets.bgImages;
  const baseSize = 80;

  return {
    draw(ctx: CanvasRenderingContext2D, now: number): boolean {
      const elapsed = now - bornAt;
      if (elapsed >= duration) return false;

      ctx.save();
      ctx.translate(x, y);

      const burstProgress = Math.min(elapsed / burstDuration, 1);
      const easedProgress = 1 - Math.pow(1 - burstProgress, 3);
      const burstOpacity = 0.9 * (1 - burstProgress);
      ctx.globalAlpha = burstOpacity;
      drawCentered(ctx, burstImage, 0, 0, baseSize * (0.2 + easedProgress * 1.1));

      const followProgress = Math.min(elapsed / followDuration, 1);
      const opacity = 0.8 * (1 - followProgress);
      const size = interpolateKeyframe(CHRISTMAS_BG_KF, followProgress, 'size');
      const rotation = interpolateKeyframe(CHRISTMAS_BG_KF, followProgress, 'rot') * Math.PI / 180;
      ctx.globalAlpha = opacity;
      ctx.rotate(rotation);
      drawCentered(ctx, followImage, 0, 0, baseSize * size);

      ctx.restore();
      return true;
    },
  };
};

/** Summer 背景图片资源 */
const BG_1 = new URL('./assets/themes/summer/bg-1.png', import.meta.url).href;
/** Summer 第二层背景 */
const BG_2 = new URL('./assets/themes/summer/bg-2.png', import.meta.url).href;
/** Summer 拖尾碎片资源 */
const SHARD_1 = new URL('./assets/themes/summer/shard-1.png', import.meta.url).href;
/** Summer 第二张拖尾碎片 */
const SHARD_2 = new URL('./assets/themes/summer/shard-2.png', import.meta.url).href;
/** Summer 第三张拖尾碎片 */
const SHARD_3 = new URL('./assets/themes/summer/shard-3.png', import.meta.url).href;
/** Summer 第四张拖尾碎片 */
const SHARD_4 = new URL('./assets/themes/summer/shard-4.png', import.meta.url).href;
/** Summer 第五张拖尾碎片 */
const SHARD_5 = new URL('./assets/themes/summer/shard-5.png', import.meta.url).href;
/** Summer 普通页面光标 */
const CURSOR = new URL('./assets/cursor.png', import.meta.url).href;
/** Summer 可点击元素光标 */
const CURSOR_POINTER = new URL('./assets/cursor-pointer.png', import.meta.url).href;

/** Summer 主题资源 */
export const summerTheme: ThemeAssets = {
  name: 'summer',
  shardImages: [SHARD_1, SHARD_2, SHARD_3, SHARD_4, SHARD_5],
  bgImages: [BG_1, BG_2],
  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,
  clickEffectFactory: createSummerClickEffect,
  animDuration: 700,
  bgType: 'images',
  trail: {
    colors: ['#3ed6f5'],
    colorStops: [0],
    maxPoints: 22,
    maxWidth: 50,
    glowBlur: 20,
    fadeDelay: 20,
    fadeDuration: 20,
  },
};
