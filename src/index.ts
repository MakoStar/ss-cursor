import type { StellaSoraCursorOptions } from './types';
import { resolveConfig } from './config';
import { resolveTheme } from './themes';
import { Renderer } from './renderer';
import { setSilent, logInit, logDestroy, logError, logWarn } from './log';

export type {
  StellaSoraCursorOptions,
  ThemeAssets,
  LoadedThemeAssets,
} from './types';

/** 当前活动实例的计数 */
let activeCount = 0;

/** 异步初始化光标效果 */
export async function initStellaSoraCursor(
  options?: StellaSoraCursorOptions,
): Promise<{ destroy: () => void }> {
  const config = resolveConfig(options);
  setSilent(config.silent);

  if (activeCount > 0) {
    logWarn(`already ${activeCount} active instance(s) on this page`);
  }

  let theme;
  try {
    theme = await resolveTheme(options?.theme, options?.customThemes);
  } catch (err) {
    logError('theme load failed', err);
    throw err;
  }

  const renderer = new Renderer(config, theme);
  activeCount++;

  return {
    destroy: () => {
      renderer.destroy();
      activeCount = Math.max(0, activeCount - 1);
      logDestroy();
    },
  };
}
