import type { ResolvedConfig, StellaSoraCursorOptions } from './types';

/** 默认配置 */
const DEFAULT_CONFIG: ResolvedConfig = {
  randomCount: 5,
  holdDelay: 100,
  throttleDelay: 10,
  holdInterval: 100,
  followAnimDuration: 500,
  holdParticleLife: 100,
  zIndex: 2147483647,
};

/** 合并用户配置与默认配置 */
export function resolveConfig(options?: StellaSoraCursorOptions): ResolvedConfig {
  if (!options) return { ...DEFAULT_CONFIG };
  return {
    randomCount: options.randomCount ?? DEFAULT_CONFIG.randomCount,
    holdDelay: options.holdDelay ?? DEFAULT_CONFIG.holdDelay,
    throttleDelay: options.throttleDelay ?? DEFAULT_CONFIG.throttleDelay,
    holdInterval: options.holdInterval ?? DEFAULT_CONFIG.holdInterval,
    followAnimDuration: options.followAnimDuration ?? DEFAULT_CONFIG.followAnimDuration,
    holdParticleLife: options.holdParticleLife ?? DEFAULT_CONFIG.holdParticleLife,
    zIndex: options.zIndex ?? DEFAULT_CONFIG.zIndex,
  };
}