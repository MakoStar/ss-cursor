import type { LoadedThemeAssets, ResolvedConfig } from '../types';
import { drawCentered } from '../utils';
import { interpolateKeyframe, FOLLOW_KF } from '../keyframes';

/** 粒子生成类型 */
export type ParticleType = 'hold' | 'follow';

export class Particle {
  x: number;
  y: number;
  readonly type: ParticleType;
  readonly born: number;
  readonly life: number;
  private image: HTMLImageElement | null;
  private rotation: number;
  private scale: number;
  private velocityX: number;
  private velocityY: number;
  private baseSize: number;
  private glowColor?: string;
  private glowBlur: number;

  /** 创建一个主题粒子 */
  constructor(
    x: number, y: number, type: ParticleType,
    assets: LoadedThemeAssets, config: ResolvedConfig,
  ) {
    this.x = x; this.y = y; this.type = type;
    this.born = performance.now();
    this.image = assets.shards.length > 0
      ? assets.shards[Math.floor(Math.random() * assets.shards.length)]
      : null;
    this.rotation = Math.random() * Math.PI * 2;
    this.glowColor = assets.particle?.glowColor;
    this.glowBlur = assets.particle?.glowBlur ?? 0;

    if (type === 'hold') {
      this.life = config.holdParticleLife;
      this.scale = 0.5 + Math.random();
      this.velocityX = Math.random() - 0.5;
      this.velocityY = Math.random() - 0.5;
      this.baseSize = assets.particle?.size ?? 20;
    } else {
      this.life = config.followAnimDuration;
      this.scale = 1; this.velocityX = 0; this.velocityY = 0;
      this.baseSize = assets.particle?.size ?? 15;
    }
  }

  /** 绘制粒子并返回是否继续存在 */
  draw(ctx: CanvasRenderingContext2D, now: number): boolean {
    const elapsed = now - this.born;
    const t = Math.min(elapsed / this.life, 1);
    if (t >= 1) return false;
    if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return true;

    if (this.type === 'hold') {
      const alpha = 0.8 * (1 - t);
      const scale = this.scale * (1 - t * 0.5);
      this.x += this.velocityX; this.y += this.velocityY;
      if (alpha < 0.001) return true;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.glowColor ?? 'transparent';
      ctx.shadowBlur = this.glowBlur;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      drawCentered(ctx, this.image, 0, 0, this.baseSize * scale);
      ctx.restore();
    } else {
      const scale = interpolateKeyframe(FOLLOW_KF, t, 'scale');
      const opacity = interpolateKeyframe(FOLLOW_KF, t, 'opacity');
      if (opacity < 0.001) return true;
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.shadowColor = this.glowColor ?? 'transparent';
      ctx.shadowBlur = this.glowBlur;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      drawCentered(ctx, this.image, 0, 0, this.baseSize * scale);
      ctx.restore();
    }
    return true;
  }
}
