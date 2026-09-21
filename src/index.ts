import type { StellaSoraCursorOptions } from './types';
import { resolveConfig } from './config';
import { resolveTheme } from './themes';
import { Renderer } from './renderer';
import { setSilent, logDestroy, logError, logWarn } from './log';

export type {
  StellaSoraCursorOptions,
  ThemeAssets,
  LoadedThemeAssets,
  EmitterConfig,
  SlideTrailConfig,
  ParticleLayerConfig,
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

/** 同步返回销毁句柄，效果异步启动 */
export function initStellaSoraCursorSync(
  options?: StellaSoraCursorOptions,
): { destroy: () => void } {
  const config = resolveConfig(options);
  setSilent(config.silent);

  let renderer: Renderer | null = null;
  let destroyed = false;

  resolveTheme(options?.theme, options?.customThemes)
    .then((theme) => {
      if (destroyed) return;
      renderer = new Renderer(config, theme);
    })
    .catch((err) => {
      logError('theme load failed', err);
    });

  return {
    destroy: () => {
      destroyed = true;
      if (renderer) {
        renderer.destroy();
        logDestroy();
      }
    },
  };
}

export { Emitter, SlideTrail, TouchEffect } from './engine';
export {TAU, GLOBAL_SCALE, rand, sampleCurve, sampleGradient, getTinted } from './utils';
export { BUILTIN_THEMES } from './themes';
export { defaultTheme, christmas, newyear, summer } from './themes';
