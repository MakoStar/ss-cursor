import type { ThemeAssets } from '../types';
import { Emitter, SlideTrail } from '../engine';
import { sampleCurve, sampleGradient, TAU } from '../utils';

const RING_MID = new URL('../../assets/summer/ring_mid.png', import.meta.url).href;
const RING_INNER = new URL('../../assets/summer/ring_inner.png', import.meta.url).href;
const BURST = new URL('../../assets/summer/burst.png', import.meta.url).href;
const SPARKLE = new URL('../../assets/summer/sparkle.png', import.meta.url).href;
const CURSOR = new URL('../../assets/cursor.png', import.meta.url).href;
const CURSOR_POINTER = new URL('../../assets/cursor-pointer.png', import.meta.url).href;

/** 夏日主题 */
export const summer: ThemeAssets = {
  name: 'summer',
  label: 'Summer',

  spriteFiles: {
    ringMid: RING_MID,
    ringInner: RING_INNER,
    burst: BURST,
    sparkle: SPARKLE,
  },

  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,

  createEmitters(S) {
    const out: Emitter[] = [];

    /** Ring_02 中层环 */
    out.push(new Emitter({
      sprite: S.ringMid,
      startDelay: 0.05,
      lifeMin: 0.5, lifeMax: 0.5,
      speedMin: 0, speedMax: 0,
      sizeMin: 10, sizeMax: 10,
      burstCount: 1,
      sizeCurve: t => sampleCurve([
        [0.000, 0.000], [0.159, 0.873], [1.000, 1.000],
      ], t),
      alphaCurve: t => sampleCurve([
        [0.000, 1.000], [0.316, 1.000], [0.506, 0.282], [1.000, 0.000],
      ], t),
    }));

    /** Ring_03 内层环 */
    out.push(new Emitter({
      sprite: S.ringInner,
      startDelay: 0.02,
      lifeMin: 0.45, lifeMax: 0.45,
      speedMin: 0, speedMax: 0,
      sizeMin: 15, sizeMax: 15,
      burstCount: 1,
      sizeCurve: t => t,
      alphaCurve: t => sampleCurve([
        [0.000, 0.000], [0.174, 1.000], [0.438, 1.000], [1.000, 0.000],
      ], t),
    }));

    /** OStart 6 帧，3×2 序列图 */
    out.push(new Emitter({
      sprite: S.burst,
      frameCount: 6,
      tileX: 3, tileY: 2, frameStart: 0,
      frameMode: 'fixed',
      startDelay: 0.15,
      lifeMin: 0.3, lifeMax: 0.6,
      speedMin: 8, speedMax: 16,
      sizeMin: 1, sizeMax: 4,
      burstCount: 6,
      shapeRadius: 0,
      gravity: 2,
      drag: 2,
      rotSpeedMin: -Math.PI / 3, rotSpeedMax: Math.PI / 3,
      sizeCurve: t => 1 - t * 0.494,
      alphaCurve: t => sampleCurve([
        [0.0000, 1.000],
        [0.2742, 0.643],
        [0.4403, 0.784],
        [0.5864, 0.627],
        [0.7449, 0.400],
        [1.0000, 0.000],
      ], t),
    }));

    return out;
  },

  createTrail(S) {
    return new SlideTrail({
      activationDelay: 0.12,
      pointLife: 0.3,
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
        { t: 0.000, color: 'rgba(18, 55, 255, 1)' },
        { t: 0.179, color: 'rgba(18, 55, 255, 1)' },
        { t: 0.532, color: 'rgba(121, 245, 255, 1)' },
        { t: 1.000, color: 'rgba(235, 253, 255, 1)' },
      ],
      ribbonOnTop: true,
      particleLayers: [
        {
          sprite: S.burst,
          tileX: 3, tileY: 2,
          frameMode: 'fixed',
          rate: 13,
          emitSpacing: 100,
          lifeMin: 0.5, lifeMax: 0.8,
          sizeMin: 40, sizeMax: 50,
          speedMin: 50, speedMax: 100,
          gravity: 15,
          startRotMin: 0, startRotMax: TAU,
          rotSpeedMin: -1.745, rotSpeedMax: 1.745,
          sizeCurve: t => sampleCurve([[0, 0.896], [1, 0.387]], t),
          alphaCurve: t => sampleCurve([
            [0.000, 1.000], [0.752, 1.000], [0.997, 0.000],
          ], t),
        },
        {
          sprite: S.sparkle,
          rate: 5,
          emitSpacing: 150,
          lifeMin: 0.5, lifeMax: 1.0,
          sizeMin: 20, sizeMax: 30,
          speedMin: 10, speedMax: 30,
          shapeRadius: 2,
          gravity: 0,
          startRotMin: 0, startRotMax: TAU,
          rotSpeedMin: -Math.PI / 3, rotSpeedMax: Math.PI / 3,
          sizeCurve: t => sampleCurve([
            [0, 0.896], [0.472, 0.207], [0.784, 0.655], [1, 0.387]
          ], t),
          colorCurve: t => sampleGradient([
            { t: 0.000, c: 'rgb(146, 181, 255)' },
            { t: 1.000, c: 'rgb(150, 248, 255)' },
          ], t),
          alphaCurve: t => sampleCurve([
            [0.000, 1.000], [0.282, 0.000], [0.665, 1.000], [0.998, 0.000],
          ], t),
        },
      ],
    });
  },
};
