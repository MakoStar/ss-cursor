import type { StellaSoraCursorOptions, ThemeAssets } from './types';
import { resolveConfig } from './config';
import { resolveTheme } from './themes';
import { Renderer } from './render';

export type { StellaSoraCursorOptions, ThemeAssets } from './types';

/** 异步初始化光标效果 */
export async function initStellaSoraCursor(
  options?: StellaSoraCursorOptions,
): Promise<{ destroy: () => void }> {
  const config = resolveConfig(options);
  const assets = await resolveTheme(options?.theme, options?.customThemes);
  const renderer = new Renderer(config, assets);
  return { destroy: () => renderer.destroy() };
}

/** 同步返回销毁句柄并异步初始化 */
export function initStellaSoraCursorSync(
  options?: StellaSoraCursorOptions,
): { destroy: () => void } {
  const config = resolveConfig(options);
  let renderer: Renderer | null = null;
  let destroyed = false;
  resolveTheme(options?.theme, options?.customThemes).then(a => {
    if (!destroyed) renderer = new Renderer(config, a);
  });
  return { destroy: () => { destroyed = true; renderer?.destroy(); } };
}