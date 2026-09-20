import type { ThemeAssets } from '../types';
import { Emitter, SlideTrail } from '../engine';
import { sampleCurve, sampleGradient, TAU } from '../utils';

const RING_OUTER = new URL('../../assets/newyear/ring_outer.png', import.meta.url).href;
const RING_MID = new URL('../../assets/newyear/ring_mid.png', import.meta.url).href;
const CORE = new URL('../../assets/newyear/core.png', import.meta.url).href;
const BURST = new URL('../../assets/newyear/burst.png', import.meta.url).href;
const SPARKLE = new URL('../../assets/newyear/sparkle.png', import.meta.url).href;
const CURSOR = new URL('../../assets/cursor.png', import.meta.url).href;
const CURSOR_POINTER = new URL('../../assets/cursor-pointer.png', import.meta.url).href;

/** 新年主题 */
export const newyear: ThemeAssets = {
  name: 'newyear',
  label: 'NewYear',

  spriteFiles: {
    ringOuter: RING_OUTER,
    ringMid: RING_MID,
    core: CORE,
    burst: BURST,
    sparkle: SPARKLE,
  },

  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,

  createEmitters(S) {
    const out: Emitter[] = [];

    /** Ring_01 外层光晕 */
    out.push(new Emitter({
      sprite: S.ringOuter,
      startDelay: 0.05,
      lifeMin: 0.43, lifeMax: 0.43,
      speedMin: 0, speedMax: 0,
      sizeMin: 16, sizeMax: 16,
      burstCount: 1,
      sizeCurve: () => 1,
      colorCurve: t => sampleGradient([
        { t: 0.000, c: 'rgb(255,234,119)' },
        { t: 0.381, c: 'rgb(255,216,170)' },
        { t: 1.000, c: 'rgb(236,146,52)' },
      ], t),
      alphaCurve: t => sampleCurve([
        [0.000, 0.000], [0.170, 1.000], [0.378, 1.000],
        [0.582, 0.323], [0.603, 0.133], [1.000, 0.000],
      ], t),
    }));

    /** Ring_02 彩色烟花，source-over 保留贴图原色 */
    out.push(new Emitter({
      sprite: S.ringMid,
      frameCount: 4,
      tileX: 2, tileY: 2, frameStart: 0,
      blendMode: 'source-over',
      startDelay: 0.05,
      lifeMin: 0.4, lifeMax: 0.4,
      speedMin: 0, speedMax: 0,
      sizeMin: 16, sizeMax: 16,
      burstCount: 1,
      sizeCurve: t => sampleCurve([
        [0.000, 0.000], [0.159, 0.873], [1.000, 1.000],
      ], t),
      alphaCurve: t => sampleCurve([
        [0.000, 1.000], [0.316, 1.000], [0.506, 0.282], [1.000, 0.000],
      ], t),
    }));

    /** MianStar 中心四角星 */
    out.push(new Emitter({
      sprite: S.core,
      startDelay: 0,
      lifeMin: 0.5, lifeMax: 0.5,
      speedMin: 0, speedMax: 0,
      sizeMin: 22, sizeMax: 22,
      burstCount: 1,
      rotSpeed: 0,
      sizeCurve: t => sampleCurve([
        [0.000, 1.000], [0.163, 0.325], [1.000, 0.132],
      ], t),
      colorCurve: t => sampleGradient([
        { t: 0.000, c: 'rgb(255,255,255)' },
        { t: 0.203, c: 'rgb(255,255,255)' },
        { t: 0.250, c: 'rgb(255,214,119)' },
        { t: 0.568, c: 'rgb(255,127,61)' },
        { t: 0.709, c: 'rgb(255,214,119)' },
        { t: 1.000, c: 'rgb(221,119,11)' },
      ], t),
      alphaCurve: t => sampleCurve([
        [0.000, 0.000], [0.192, 1.000], [0.770, 0.901], [1.000, 0.000],
      ], t),
    }));

    /** OStart 爆竹灯笼 5 颗，2×1 固定帧 */
    out.push(new Emitter({
      sprite: S.burst,
      frameCount: 2,
      tileX: 2, tileY: 1, frameStart: 0,
      frameMode: 'fixed',
      startDelay: 0.16,
      lifeMin: 0.5, lifeMax: 0.8,
      speedMin: 30, speedMax: 80,
      sizeMin: 3, sizeMax: 6,
      burstCount: 5,
      shapeRadius: 2,
      gravity: 2,
      drag: 3,
      rotMin: -TAU, rotMax: TAU,
      rotSpeedMin: -Math.PI / 3, rotSpeedMax: Math.PI / 3,
      sizeCurve: t => 1 - t * 0.5,
      colorCurve: t => sampleGradient([
        { t: 0.000, c: 'rgb(255,255,255)' },
        { t: 0.440, c: 'rgb(235,255,254)' },
        { t: 1.000, c: 'rgb(222,255,253)' },
      ], t),
      alphaCurve: t => sampleCurve([
        [0.0000, 1.000],
        [0.2742, 0.643],
        [0.4403, 0.784],
        [0.5864, 0.627],
        [0.7449, 0.400],
        [1.0000, 0.000],
      ], t),
    }));

    /** OStart1 白圆 10+10 颗 */
    out.push(new Emitter({
      sprite: S.sparkle,
      startDelay: 0,
      bursts: [
        { time: 0, count: 10 },
        { time: 0.05, count: 10 },
      ],
      lifeMin: 0.2, lifeMax: 0.8,
      speedMin: 40, speedMax: 80,
      sizeMin: 0.6, sizeMax: 1.6,
      shapeRadius: 2.5,
      gravity: 2,
      drag: 2.5,
      timescale: 0.5,
      rotSpeed: 0,
      sizeCurve: t => sampleCurve([
        [0.000, 1.000], [0.163, 0.325], [1.000, 0.132],
      ], t),
      colorCurve: t => sampleGradient([
        { t: 0.000, c: 'rgb(255,255,255)' },
        { t: 0.183, c: 'rgb(253,211,89)' },
        { t: 0.606, c: 'rgb(253,188,84)' },
        { t: 0.795, c: 'rgb(255,134,109)' },
      ], t),
      alphaCurve: t => sampleCurve([
        [0.000, 1.000], [0.608, 1.000], [1.000, 0.000],
      ], t),
    }));

    return out;
  },

  createTrail(S) {
    return new SlideTrail({
      activationDelay: 0.12,
      pointLife: 0.4,
      maxPoints: 400,
      minDist: 3,
      ribbonWidth: 5.0,
      ribbonAlpha: 0.75,
      ribbonBright: 1.0,
      ribbonLayers: [
        { widthMul: 2.6, alpha: 0.35, blur: 6 },
        { widthMul: 1.3, alpha: 0.70, blur: 1.5 },
        { widthMul: 0.6, alpha: 1.00, blur: 0 },
      ],
      ribbonColors: [
        { t: 0.000, color: 'rgba(255, 44, 30, 1)' },
        { t: 0.179, color: 'rgba(255, 44, 30, 1)' },
        { t: 0.571, color: 'rgba(255, 222, 85, 1)' },
        { t: 1.000, color: 'rgba(255, 222, 85, 1)' },
      ],
      ribbonOnTop: true,
      particleLayers: [
        {
          sprite: S.burst,
          tileX: 2, tileY: 1,
          frameMode: 'fixed',
          rate: 8,
          emitSpacing: 80,
          lifeMin: 0.5, lifeMax: 0.8,
          sizeMin: 30, sizeMax: 35,
          speedMin: 50, speedMax: 100,
          gravity: 15,
          startRotMin: 0, startRotMax: TAU,
          sizeCurve: t => sampleCurve([[0, 0.896], [1, 0.387]], t),
          colorCurve: t => sampleGradient([
            { t: 0.000, c: 'rgb(255,255,255)' },
            { t: 0.472, c: 'rgb(192,232,77)' },
            { t: 0.648, c: 'rgb(252,205,40)' },
            { t: 0.841, c: 'rgb(253,79,86)' },
            { t: 1.000, c: 'rgb(253,79,86)' },
          ], t),
          alphaCurve: t => 1 - t,
        },
        {
          sprite: S.sparkle,
          rate: 4,
          emitSpacing: 120,
          lifeMin: 0.5, lifeMax: 1.0,
          sizeMin: 22, sizeMax: 32,
          speedMin: 10, speedMax: 30,
          shapeRadius: 1,
          gravity: 0,
          startRotMin: 0, startRotMax: TAU,
          blendMode: 'source-over',
          sizeCurve: t => sampleCurve([
            [0, 0.896], [0.472, 0.207], [0.784, 0.655], [1, 0.387]
          ], t),
          colorCurve: t => sampleGradient([
            { t: 0.000, c: 'rgb(255,250,230)' },
            { t: 0.648, c: 'rgb(252,205,40)' },
            { t: 0.997, c: 'rgb(253,79,86)' },
            { t: 1.000, c: 'rgb(253,79,86)' },
          ], t),
          alphaCurve: t => sampleCurve([
            [0, 0.45], [0.28, 0.45], [0.665, 0.35], [0.997, 0]
          ], t),
        },
      ],
    });
  },
};
