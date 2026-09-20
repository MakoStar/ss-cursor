import type { ThemeAssets } from '../types';
import { Emitter, SlideTrail } from '../engine';
import { TAU } from '../utils';

const RING_OUTER = new URL('../../assets/christmas/ring_outer.png', import.meta.url).href;
const CORE = new URL('../../assets/christmas/core.png', import.meta.url).href;
const BURST = new URL('../../assets/christmas/burst.png', import.meta.url).href;
const CURSOR = new URL('../../assets/cursor.png', import.meta.url).href;
const CURSOR_POINTER = new URL('../../assets/cursor-pointer.png', import.meta.url).href;

/** 圣诞主题 */
export const christmas: ThemeAssets = {
  name: 'christmas',
  label: 'Christmas',

  matchDate: () => {
    const m = new Date().getMonth() + 1;
    const d = new Date().getDate();
    return (m === 12 && d >= 25) || (m === 1 && d <= 7);
  },

  spriteFiles: {
    ringOuter: RING_OUTER,
    core: CORE,
    burst: BURST,
  },

  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,

  createEmitters(S) {
    const out: Emitter[] = [];

    /** 外层环 */
    out.push(new Emitter({
      sprite: S.ringOuter,
      frameCount: 1,
      startDelay: 0.05,
      lifeMin: 0.43, lifeMax: 0.43,
      speedMin: 0, speedMax: 0,
      sizeMin: 12, sizeMax: 12,
      burstCount: 1,
      sizeCurve: () => 1,
      alphaCurve: t => {
        if (t < 0.17) return t / 0.17;
        if (t < 0.378) return 1;
        if (t < 0.582) return 1 - (t - 0.378) / 0.204 * 0.677;
        if (t < 0.603) return 0.323 - (t - 0.582) / 0.021 * 0.19;
        return 0.133 * (1 - (t - 0.603) / 0.397);
      },
    }));

    /** 中心星，固定自转角速度，整体染浅青 */
    out.push(new Emitter({
      sprite: S.core,
      frameCount: 1,
      startDelay: 0,
      lifeMin: 0.6, lifeMax: 0.6,
      speedMin: 0, speedMax: 0,
      sizeMin: 15, sizeMax: 15,
      burstCount: 1,
      rotMin: 0, rotMax: 0,
      rotSpeed: 3.37,
      tint: 'rgba(196, 254, 255, 1)',
      sizeCurve: t => {
        if (t < 0.146) return 1 - t / 0.146 * 0.42;
        return 0.58 - (t - 0.146) / 0.854 * 0.18;
      },
      alphaCurve: t => {
        if (t < 0.19) return t / 0.19;
        if (t < 0.77) return 1 - (t - 0.19) / 0.58 * 0.1;
        return 0.9 * (1 - (t - 0.77) / 0.23);
      },
    }));

    /** OStart 5 颗，2×2 网格第 1 行 */
    out.push(new Emitter({
      sprite: S.burst,
      frameCount: 2,
      tileX: 2, tileY: 2, frameStart: 0,
      frameMode: 'fixed',
      startDelay: 0.16,
      lifeMin: 0.5, lifeMax: 0.8,
      speedMin: 25, speedMax: 50,
      sizeMin: 2, sizeMax: 8,
      burstCount: 5,
      shapeRadius: 3,
      gravity: 2,
      drag: 3,
      rotMin: -Math.PI / 3, rotMax: Math.PI / 3,
      sizeCurve: t => 1 - t * 0.49,
      alphaCurve: t => {
        if (t < 0.274) return 1 - t / 0.274 * 0.357;
        if (t < 0.440) return 0.643 + (t - 0.274) / 0.166 * 0.141;
        if (t < 0.586) return 0.784 - (t - 0.440) / 0.146 * 0.157;
        if (t < 0.745) return 0.627 - (t - 0.586) / 0.159 * 0.227;
        return 0.400 - (t - 0.745) / 0.255 * 0.400;
      },
    }));

    /** OStart1 6 颗，2×2 网格第 2 行 */
    out.push(new Emitter({
      sprite: S.burst,
      frameCount: 2,
      tileX: 2, tileY: 2, frameStart: 2,
      frameMode: 'fixed',
      startDelay: 0.16,
      lifeMin: 0.5, lifeMax: 0.8,
      speedMin: 25, speedMax: 50,
      sizeMin: 2, sizeMax: 8,
      burstCount: 6,
      shapeRadius: 3,
      gravity: 5,
      drag: 3,
      rotMin: -Math.PI / 3, rotMax: Math.PI / 3,
      sizeCurve: t => 1 - t * 0.49,
      alphaCurve: t => {
        if (t < 0.274) return 1 - t / 0.274 * 0.357;
        if (t < 0.440) return 0.643 + (t - 0.274) / 0.166 * 0.141;
        if (t < 0.586) return 0.784 - (t - 0.440) / 0.146 * 0.157;
        if (t < 0.745) return 0.627 - (t - 0.586) / 0.159 * 0.227;
        return 0.400 - (t - 0.745) / 0.255 * 0.400;
      },
    }));

    return out;
  },

  createTrail(S) {
    return new SlideTrail({
      maxPoints: 240,
      minDist: 3,
      pointLife: 0.35,
      activationDelay: 0.12,
      ribbonWidth: 5.0,
      ribbonAlpha: 0.75,
      ribbonBright: 1.0,
      ribbonLayers: [
        { widthMul: 2.6, alpha: 0.35, blur: 6 },
        { widthMul: 1.3, alpha: 0.70, blur: 1.5 },
        { widthMul: 0.6, alpha: 1.00, blur: 0 },
      ],
      ribbonColors: [
        { t: 0.00, color: 'rgba(255, 85, 115, 0)' },
        { t: 0.15, color: 'rgba(255, 85, 115, 0.7)' },
        { t: 0.55, color: 'rgba(120, 180, 60, 0.95)' },
        { t: 0.85, color: 'rgba(0, 212, 27, 1.0)' },
        { t: 1.00, color: 'rgba(0, 212, 27, 1.0)' },
      ],
      sprite: S.burst,
      spriteFrames: 4,
      spriteTileX: 2, spriteTileY: 2, spriteFrameStart: 0,
      frameMode: 'fixed',
      fixedFrameWeights: [
        [0, 0.4], [1, 0.4], [2, 0.1], [3, 0.1],
      ],
      ribbonOnTop: true,
      starInterval: 0.06,
      starSpacing: 60,
      starLifeMin: 0.5, starLifeMax: 0.8,
      starSizeMin: 35, starSizeMax: 45,
      starSpeedMin: 0, starSpeedMax: 0,
      starDrag: 6,
      starJitter: 0,
      starRotMin: 0, starRotMax: TAU,
      starRotSpeedMin: 0, starRotSpeedMax: 0,
      starShrink: 0.75,
      starFadeStart: 0.55, starFadeEnd: 1.00,
      starBaseAlpha: 0.9,
      starColors: [],
    });
  },
};
