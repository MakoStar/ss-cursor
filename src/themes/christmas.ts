/** Christmas 主题资源 */
import type { ThemeAssets } from '../types';

/** Christmas 碎片资源 */
const SHARD_1 = new URL('./assets/themes/christmas/shard-1.png', import.meta.url).href;
/** Christmas 第二张碎片 */
const SHARD_2 = new URL('./assets/themes/christmas/shard-2.png', import.meta.url).href;
/** Christmas 第三张碎片 */
const SHARD_3 = new URL('./assets/themes/christmas/shard-3.png', import.meta.url).href;
/** Christmas 第四张碎片 */
const SHARD_4 = new URL('./assets/themes/christmas/shard-4.png', import.meta.url).href;
/** Christmas 背景资源 */
const BG_1 = new URL('./assets/themes/christmas/bg-1.png', import.meta.url).href;
/** Christmas 第二层背景 */
const BG_2 = new URL('./assets/themes/christmas/bg-2.png', import.meta.url).href;
/** Christmas 公共光标资源 */
const CURSOR = new URL('./assets/cursor.png', import.meta.url).href;
/** Christmas 可点击元素光标 */
const CURSOR_POINTER = new URL('./assets/cursor-pointer.png', import.meta.url).href;

export const christmasTheme: ThemeAssets = {
  name: 'christmas',
  shardImages: [SHARD_1, SHARD_2, SHARD_3, SHARD_4],
  bgImages: [BG_1, BG_2],
  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,
  animDuration: 1000,
  bgType: 'images',
  matchDate: () => {
    const m = new Date().getMonth() + 1;
    const d = new Date().getDate();
    return (m === 12 && d >= 25) || (m === 1 && d <= 7);
  },
};