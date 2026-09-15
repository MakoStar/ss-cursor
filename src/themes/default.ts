import type { ThemeAssets } from '../types';

/** Default 碎片资源 */
const SHARD_1 = new URL('./assets/themes/default/shard-1.png', import.meta.url).href;
/** Default 第二张碎片 */
const SHARD_2 = new URL('./assets/themes/default/shard-2.png', import.meta.url).href;
/** Default 第三张碎片 */
const SHARD_3 = new URL('./assets/themes/default/shard-3.png', import.meta.url).href;
/** Default 第四张碎片 */
const SHARD_4 = new URL('./assets/themes/default/shard-4.png', import.meta.url).href;
/** Default 光环和光点资源 */
const RING = new URL('./assets/themes/default/ring.png', import.meta.url).href;
/** Default 中心光点 */
const DOT = new URL('./assets/themes/default/dot.png', import.meta.url).href;
/** 普通页面光标 */
const CURSOR = new URL('./assets/cursor.png', import.meta.url).href;
/** 可点击元素光标 */
const CURSOR_POINTER = new URL('./assets/cursor-pointer.png', import.meta.url).href;

/** Default 拖尾配置 */
const DEFAULT_TRAIL = {
  colors: ['#fff7ff', '#ffb6f4', '#ff1493', '#ffff00'],
  colorStops: [0, 0.08, 0.72, 0.88],
  maxPoints: 20,
  maxWidth: 14,
  glowBlur: 18,
  fadeDelay: 20,
  fadeDuration: 20,
};

export const defaultTheme: ThemeAssets = {
  name: 'default',
  shardImages: [SHARD_1, SHARD_2, SHARD_3, SHARD_4],
  ringImage: RING,
  dotImage: DOT,
  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,
  trail: DEFAULT_TRAIL,
  animDuration: 500,
  bgType: 'canvas-draw',
  matchDate: () => true,
};