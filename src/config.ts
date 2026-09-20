import type { ResolvedConfig, StellaSoraCursorOptions } from './types';

const DEFAULT_CONFIG: ResolvedConfig = {
  themeName: 'auto',
  customThemes: [],
  holdDelay: 100,
  holdInterval: 100,
  zIndex: 2147483647,
  replaceCursor: true,
  disableTrail: false,
  silent: false,
};

/** 合并用户配置与默认配置 */
export function resolveConfig(
  options?: StellaSoraCursorOptions,
): ResolvedConfig {
  if (!options) return { ...DEFAULT_CONFIG };
  return {
    themeName: options.theme ?? DEFAULT_CONFIG.themeName,
    customThemes: options.customThemes ?? DEFAULT_CONFIG.customThemes,
    holdDelay: options.holdDelay ?? DEFAULT_CONFIG.holdDelay,
    holdInterval: options.holdInterval ?? DEFAULT_CONFIG.holdInterval,
    zIndex: options.zIndex ?? DEFAULT_CONFIG.zIndex,
    replaceCursor: options.replaceCursor ?? DEFAULT_CONFIG.replaceCursor,
    disableTrail: options.disableTrail ?? DEFAULT_CONFIG.disableTrail,
    silent: options.silent ?? DEFAULT_CONFIG.silent,
  };
}
