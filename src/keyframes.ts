import type { Keyframe } from './types';

/** 计算关键帧插值 */
export function interpolateKeyframe(keyframes: Keyframe[], progress: number, property: string): number {
  if (progress <= keyframes[0].t) return keyframes[0][property];
  if (progress >= keyframes[keyframes.length - 1].t) return keyframes[keyframes.length - 1][property];
  for (let index = 0; index < keyframes.length - 1; index++) {
    if (progress >= keyframes[index].t && progress <= keyframes[index + 1].t) {
      const segmentProgress = (progress - keyframes[index].t) / (keyframes[index + 1].t - keyframes[index].t);
      return keyframes[index][property] + segmentProgress * (keyframes[index + 1][property] - keyframes[index][property]);
    }
  }
  return keyframes[keyframes.length - 1][property];
}

/** 默认背景动画 */
export const DEFAULT_BG_KF: Keyframe[] = [
  { t: 0, opacity: 0.3, size: 0.85, rot: 0 },
  { t: 0.0263, opacity: 0.3, size: 0.85, rot: 0 },
  { t: 0.0526, opacity: 0.5, size: 0.825, rot: 0 },
  { t: 0.0789, opacity: 0.55, size: 0.80, rot: 0 },
  { t: 0.1052, opacity: 0.55, size: 0.775, rot: 25 },
  { t: 0.1315, opacity: 0.55, size: 0.75, rot: 45 },
  { t: 0.1316, opacity: 0.45, size: 0.65, rot: 55 },
  { t: 0.1578, opacity: 0, size: 0.65, rot: 60 },
  { t: 1.0, opacity: 0, size: 0, rot: 0 },
];

/** Christmas 背景动画 */
export const CHRISTMAS_BG_KF: Keyframe[] = [...DEFAULT_BG_KF];

/** 光环动画 */
export const RING_KF: Keyframe[] = [
  { t: 0, scale: 2, opacity: 0.3 },
  { t: 0.0263, scale: 1, opacity: 0.3 },
  { t: 0.0526, scale: 0.8, opacity: 0.5 },
  { t: 0.0789, scale: 0.75, opacity: 0.55 },
  { t: 0.1052, scale: 0.7, opacity: 0.55 },
  { t: 0.1315, scale: 0.5, opacity: 0.55 },
  { t: 0.1316, scale: 0.3, opacity: 0.5 },
  { t: 0.1578, scale: 0.2, opacity: 0.4 },
  { t: 0.1841, scale: 0.1, opacity: 0.4 },
  { t: 0.2104, scale: 0.05, opacity: 0.4 },
  { t: 0.2367, scale: 0, opacity: 0 },
  { t: 1.0, scale: 0, opacity: 0 },
];

/** 中心光点动画 */
export const DOT_KF: Keyframe[] = [
  { t: 0, size: 0.15, opacity: 0, blur: 0 },
  { t: 0.1315, size: 0.40, opacity: 0.7, blur: 0 },
  { t: 0.1578, size: 0.50, opacity: 0.8, blur: 0 },
  { t: 0.1841, size: 0.55, opacity: 0.8, blur: 0 },
  { t: 0.2104, size: 0.60, opacity: 0.8, blur: 0 },
  { t: 0.2367, size: 0.65, opacity: 0.8, blur: 0 },
  { t: 0.2630, size: 0.70, opacity: 0.8, blur: 0 },
  { t: 0.2893, size: 0.72, opacity: 0.8, blur: 0 },
  { t: 0.3156, size: 0.74, opacity: 0.8, blur: 0 },
  { t: 0.3419, size: 0.76, opacity: 0.8, blur: 0 },
  { t: 0.3682, size: 0.78, opacity: 0.7, blur: 0.2 },
  { t: 0.3945, size: 0.80, opacity: 0.6, blur: 0.4 },
  { t: 0.4208, size: 0.82, opacity: 0.5, blur: 0.6 },
  { t: 0.4471, size: 0.82, opacity: 0.4, blur: 0.8 },
  { t: 0.4734, size: 0.83, opacity: 0.35, blur: 1.0 },
  { t: 0.4997, size: 0.84, opacity: 0.3, blur: 1.0 },
  { t: 0.5260, size: 0.85, opacity: 0.25, blur: 1.1 },
  { t: 0.5523, size: 0.86, opacity: 0.25, blur: 1.1 },
  { t: 0.5786, size: 0.87, opacity: 0.2, blur: 1.1 },
  { t: 0.6049, size: 0.88, opacity: 0.1, blur: 1.1 },
  { t: 0.7101, size: 0.90, opacity: 0, blur: 1.1 },
  { t: 1.0, size: 0.90, opacity: 0, blur: 1.1 },
];

/** 跟随粒子动画 */
export const FOLLOW_KF: Keyframe[] = [
  { t: 0, scale: 2, opacity: 1 },
  { t: 0.5, scale: 1, opacity: 0.5 },
  { t: 1.0, scale: 0, opacity: 0 },
];