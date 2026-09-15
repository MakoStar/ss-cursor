import type { LoadedThemeAssets, ResolvedConfig } from '../types';
import { drawCentered } from '../utils';
import { interpolateKeyframe, DEFAULT_BG_KF, CHRISTMAS_BG_KF, RING_KF, DOT_KF } from '../keyframes';

interface Shard {
    image: HTMLImageElement;
    targetX: number; targetY: number;
    scale: number; durationFactor: number;
}

/** 管理一次鼠标点击的完整特效 */
export class ClickEffect {
    readonly born: number;
    private x: number; private y: number;
    private duration: number;
    private assets: LoadedThemeAssets;
    private config: ResolvedConfig;
    private dotRotation: number;
    private shards: Shard[];
    private customEffect: ReturnType<NonNullable<LoadedThemeAssets['clickEffectFactory']>> | null = null;

    /** 创建点击特效实例 */
    constructor(x: number, y: number, assets: LoadedThemeAssets, config: ResolvedConfig) {
        this.x = x; this.y = y;
        this.assets = assets;
        this.config = config;
        this.born = performance.now();
        this.duration = assets.animDuration;
        this.dotRotation = Math.random() * Math.PI * 2;
        if (assets.clickEffectFactory) {
            this.customEffect = assets.clickEffectFactory(x, y, assets, config);
            this.shards = [];
            return;
        }

        this.shards = [];
        for (let i = 0; i < config.randomCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 30 + Math.random() * 100;
            this.shards.push({
                image: assets.shards[Math.floor(Math.random() * assets.shards.length)],
                targetX: Math.round(distance * Math.cos(angle)),
                targetY: Math.round(distance * Math.sin(angle)),
                scale: 0.5 + Math.random(),
                durationFactor: 0.5 + Math.random() * 0.5,
            });
        }
    }

    /** 绘制点击特效并返回是否继续存在 */
    draw(ctx: CanvasRenderingContext2D, now: number): boolean {
        if (this.customEffect) return this.customEffect.draw(ctx, now);
        const elapsed = now - this.born;
        const t = Math.min(elapsed / this.duration, 1);
        if (t >= 1) return false;
        const baseSize = 80;
        const isDefault = this.assets.name === 'default';

        ctx.save();
        ctx.translate(this.x, this.y);

        /** 绘制背景层 */
        if (this.assets.bgType === 'canvas-draw') {
            const opacity = interpolateKeyframe(DEFAULT_BG_KF, t, 'opacity');
            const size = interpolateKeyframe(DEFAULT_BG_KF, t, 'size');
            const rotation = interpolateKeyframe(DEFAULT_BG_KF, t, 'rot') * Math.PI / 180;
            if (opacity > 0.001) {
                ctx.save(); ctx.globalAlpha = opacity; ctx.rotate(rotation);
                const radius = baseSize * size / 2;
                ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(0,255,167,1)'; ctx.shadowBlur = 20;
                ctx.stroke();
                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
                gradient.addColorStop(0, 'rgba(107,251,203,0.45)');
                gradient.addColorStop(1, 'rgba(107,251,203,0)');
                ctx.fillStyle = gradient; ctx.fill();
                ctx.restore();
            }
        } else if (this.assets.bgImages.length >= 1) {
            const kf = isDefault ? DEFAULT_BG_KF : CHRISTMAS_BG_KF;
            const opacity = interpolateKeyframe(kf, t, 'opacity');
            const size = interpolateKeyframe(kf, t, 'size');
            const rotation = interpolateKeyframe(kf, t, 'rot') * Math.PI / 180;
            if (opacity > 0.001) {
                ctx.save(); ctx.globalAlpha = opacity; ctx.rotate(rotation);
                for (const bgImg of this.assets.bgImages)
                    drawCentered(ctx, bgImg, 0, 0, baseSize * size);
                ctx.restore();
            }
        }

        /** 绘制默认主题光环 */
        if (isDefault && this.assets.ring) {
            const opacity = interpolateKeyframe(RING_KF, t, 'opacity');
            const scale = interpolateKeyframe(RING_KF, t, 'scale');
            if (opacity > 0.001) {
                ctx.save(); ctx.globalAlpha = opacity;
                drawCentered(ctx, this.assets.ring, 0, 0, baseSize * 0.75 * scale);
                ctx.restore();
            }
        }

        /** 绘制默认主题光点 */
        if (isDefault && this.assets.dot) {
            const opacity = interpolateKeyframe(DOT_KF, t, 'opacity');
            const size = interpolateKeyframe(DOT_KF, t, 'size');
            const blur = interpolateKeyframe(DOT_KF, t, 'blur');
            if (opacity > 0.001) {
                ctx.save(); ctx.globalAlpha = opacity; ctx.rotate(this.dotRotation);
                if (blur > 0) ctx.filter = `blur(${blur}px)`;
                drawCentered(ctx, this.assets.dot, 0, 0, baseSize * size);
                ctx.filter = 'none'; ctx.restore();
            }
        }

        /** 绘制飞散碎片 */
        for (const shard of this.shards) {
            const shardProgress = Math.min(elapsed / (this.duration * shard.durationFactor), 1);
            if (shardProgress >= 1) continue;
            let offsetX: number, offsetY: number, shardScale: number, shardOpacity: number;
            if (shardProgress <= 0.2367) {
                offsetX = 0; offsetY = 0; shardScale = 1; shardOpacity = (shardProgress / 0.2367) * 0.3;
            } else {
                const progress = (shardProgress - 0.2367) / (1 - 0.2367);
                offsetX = shard.targetX * progress; offsetY = shard.targetY * progress;
                shardScale = 1 + (shard.scale - 1) * progress; shardOpacity = 0.3 * (1 - progress);
            }
            if (shardOpacity > 0.001) {
                ctx.save(); ctx.globalAlpha = shardOpacity; ctx.translate(offsetX, offsetY);
                ctx.filter = 'blur(0.2px)';
                drawCentered(ctx, shard.image, 0, 0, baseSize * 0.4 * shardScale);
                ctx.filter = 'none'; ctx.restore();
            }
        }

        ctx.restore();
        return true;
    }
}