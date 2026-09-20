import type { ThemeAssets } from '../types';
import { Emitter, SlideTrail } from '../engine';
import { TAU } from '../utils';

const RING_OUTER = new URL('../../assets/default/ring_outer.png', import.meta.url).href;
const CORE = new URL('../../assets/default/core.png', import.meta.url).href;
const COMMON_SEQ_STAR = new URL('../../assets/default/seq_star.png', import.meta.url).href;
const CURSOR = new URL('../../assets/cursor.png', import.meta.url).href;
const CURSOR_POINTER = new URL('../../assets/cursor-pointer.png', import.meta.url).href;

/** 默认主题 */
export const defaultTheme: ThemeAssets = {
  name: 'default',
  label: 'Default',
  matchDate: () => true,

  spriteFiles: {
    ringOuter: RING_OUTER,
    core: CORE,
    commonSeqStar: COMMON_SEQ_STAR,
  },

  cursorImage: CURSOR,
  cursorPointerImage: CURSOR_POINTER,

  createEmitters(S) {
    const out: Emitter[] = [];

    /** 内环用途效果太差: 手绘白环 + 青绿内晕 + 双层外扩光晕 */
    out.push(new Emitter({
      drawMode: 'whiteRing',
      ringColor: '#ffffff',
      ringGlow: 'rgba(171, 249, 250, 0.9)',
      ringRatio: 0.9,
      ringWidthRatio: 0.06,
      innerTopColor: 'rgba(171, 249, 250, 0.9)',
      innerMidColor: 'rgba(171, 249, 250, 0.6)',
      innerEdgeColor: 'rgba(171, 249, 250, 0.7)',
      startDelay: 0.02,
      lifeMin: 0.15, lifeMax: 0.15,
      speedMin: 0, speedMax: 0,
      sizeMin: 8, sizeMax: 12,
      burstCount: 1,
      sizeCurve: t => 1 - t * 0.4,
      alphaCurve: t => {
        if (t < 0.20) return t / 0.20;
        if (t < 0.55) return 1;
        return 1 - (t - 0.55) / 0.45;
      },
    }));

    /** 外层环 */
    out.push(new Emitter({
      sprite: S.ringOuter,
      frameCount: 1,
      startDelay: 0.1,
      lifeMin: 0.35, lifeMax: 0.35,
      speedMin: 0, speedMax: 0,
      sizeMin: 12, sizeMax: 16,
      burstCount: 1,
      rotMin: 0, rotMax: 8.03,
      sizeCurve: t => 1 - Math.pow(1 - t, 2),
      alphaCurve: t => {
        if (t < 0.20) return t / 0.20;
        if (t < 0.55) return 1;
        return 1 - (t - 0.55) / 0.45;
      },
    }));

    /** 中心四角星 */
    out.push(new Emitter({
      sprite: S.core,
      frameCount: 1,
      startDelay: 0.03,
      lifeMin: 0.25, lifeMax: 0.25,
      speedMin: 0, speedMax: 0,
      sizeMin: 4, sizeMax: 20,
      burstCount: 1,
      sizeCurve: t => {
        if (t < 0.05) return 0.91;
        if (t < 0.112) return 0.91 - (t - 0.05) / 0.062 * 0.485;
        return 0.425 * (1 - (t - 0.112) / 0.888);
      },
      alphaCurve: t => {
        if (t < 0.192) return t / 0.192;
        if (t < 0.770) return 1 - (t - 0.192) / 0.578 * 0.1;
        return 0.9 * (1 - (t - 0.77) / 0.23);
      },
    }));

    /** 5 颗 4 星芒爆发，2×2 uv序列图每颗出生随机锁帧 */
    out.push(new Emitter({
      sprite: S.commonSeqStar,
      frameCount: 2,
      tileX: 2, tileY: 2, frameStart: 0,
      frameMode: 'fixed',
      startDelay: 0.22,
      lifeMin: 0.20, lifeMax: 0.45,
      speedMin: 25, speedMax: 50,
      sizeMin: 2, sizeMax: 6,
      burstCount: 5,
      shapeRadius: 3,
      drag: 3,
      rotMin: 0, rotMax: 0,
      sizeCurve: t => {
        if (t < 0.250) return 0.98 - t * 2.17;
        if (t < 0.525) return 0.44 + (t - 0.250) / 0.275 * 0.42;
        if (t < 0.702) return 0.86 - (t - 0.525) / 0.177 * 0.35;
        if (t < 0.812) return 0.51 + (t - 0.702) / 0.110 * 0.07;
        return 0.58 - (t - 0.812) / 0.188 * 0.31;
      },
      alphaCurve: t => {
        if (t < 0.27) return 1 - t * 1.30;
        if (t < 0.44) return 0.65 + (t - 0.27) / 0.17 * 0.13;
        if (t < 0.59) return 0.78 - (t - 0.44) / 0.15 * 0.15;
        if (t < 0.75) return 0.63 - (t - 0.59) / 0.16 * 0.23;
        return 0.4 * (1 - (t - 0.75) / 0.25);
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
      ribbonWidth: 5.5,
      ribbonAlpha: 0.75,
      ribbonBright: 1.0,
      ribbonLayers: [
        { widthMul: 2.6, alpha: 0.35, blur: 6 },
        { widthMul: 1.3, alpha: 0.70, blur: 1.5 },
        { widthMul: 0.6, alpha: 1.00, blur: 0 },
      ],
      ribbonColors: [
        { t: 0.00, color: 'rgba(180, 140, 255, 0.00)' },
        { t: 0.10, color: 'rgba(200, 160, 255, 0.30)' },
        { t: 0.30, color: 'rgba(230, 150, 255, 0.70)' },
        { t: 0.55, color: 'rgba(255, 130, 240, 0.95)' },
        { t: 0.78, color: 'rgba(255, 180, 220, 1.00)' },
        { t: 0.92, color: 'rgba(255, 230, 180, 1.00)' },
        { t: 1.00, color: 'rgba(255, 250, 220, 1.00)' },
      ],
      sprite: S.core,
      spriteFrames: 1,
      spriteTileX: 1, spriteTileY: 1, spriteFrameStart: 0,
      frameMode: 'fixed',
      ribbonOnTop: true,
      starInterval: 0.05,
      starSpacing: 60,
      starLifeMin: 0.5, starLifeMax: 0.55,
      starSizeMin: 20, starSizeMax: 40,
      starSpeedMin: 0, starSpeedMax: 2,
      starDrag: 6,
      starJitter: 3,
      starRotMin: 0, starRotMax: TAU,
      starRotSpeedMin: -1.5, starRotSpeedMax: 1.5,
      starShrink: 0.85,
      starFadeStart: 0.55, starFadeEnd: 1.00,
      starBaseAlpha: 0.9,
      starColors: [
        'rgba(93, 150, 254, 0.6)',
        'rgba(76, 240, 203, 0.6)',
        'rgba(160, 235, 100, 0.6)',
        'rgba(230, 240, 160, 0.6)',
        'rgba(255, 170, 220, 0.6)',
      ],
    });
  },
};
