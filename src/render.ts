import type { LoadedThemeAssets, ResolvedConfig } from './types';
import { ClickEffect } from './effects/click-effect';
import { Particle } from './effects/particle';

/** 拖尾轨迹点 */
interface TrailPoint {
  x: number;
  y: number;
  distance: number;
}

/** 跟随碎片的最小生成间距 */
const FOLLOW_PARTICLE_SPACING = 6;
/** 进入拖拽特效前的最小移动距离 */
const DRAG_START_DISTANCE = 8;

/** 根据拖尾进度选择颜色 */
function getTrailColor(progress: number, colors: string[], colorStops: number[]): string {
  for (let index = colorStops.length - 1; index >= 0; index--) {
    if (progress >= colorStops[index]) return colors[index];
  }
  return colors[0];
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private canvasWidth = 0; private canvasHeight = 0;
  private particles: Particle[] = [];
  private clickEffects: ClickEffect[] = [];
  private trail: TrailPoint[] = [];
  private isMouseDown = false;
  private isDragActive = false;
  private suppressClick = false;
  private mouseDownPosition = { x: 0, y: 0 };
  private mousePosition = { x: 0, y: 0 };
  private holdTimer: ReturnType<typeof setInterval> | null = null;
  private triggerMoveTimer: ReturnType<typeof setTimeout> | null = null;
  private lastMoveTime = 0;
  private lastTrailMoveTime = 0;
  private trailFadeStartedAt: number | null = null;
  private animFrameId = 0;
  private destroyed = false;
  private cursorStyle: HTMLStyleElement | null = null;
  private readonly trailConfig = this.assets.trail ?? {
    colors: ['#ff003c', '#ff1493', '#ffff00', '#ff6600', '#39ff14'],
    colorStops: [0, 0.30, 0.35, 0.40, 0.45],
    maxPoints: 28,
    maxWidth: 13,
    glowBlur: 18,
    fadeDelay: 20,
    fadeDuration: 12,
  };

  private handlers: Record<string, EventListener> = {};

  /** 创建渲染器并注册页面事件 */
  constructor(private config: ResolvedConfig, private assets: LoadedThemeAssets) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `position:fixed;top:0;left:0;z-index:${config.zIndex};pointer-events:none;`;
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;
    this.applyCursor();
    this.resize();

    const eventHandlers = this.handlers;
    eventHandlers.resize = () => this.resize();
    eventHandlers.mousedown = ((e: MouseEvent) => this.onMouseDown(e)) as EventListener;
    eventHandlers.mousemove = ((e: MouseEvent) => this.onMouseMove(e)) as EventListener;
    eventHandlers.mouseup = ((e: MouseEvent) => { if (e.button === 0) this.forceClearAll(); }) as EventListener;
    eventHandlers.click = ((e: MouseEvent) => this.onClick(e)) as EventListener;
    eventHandlers.mouseleave = () => this.forceClearAll();
    eventHandlers.blur = () => this.forceClearAll();
    eventHandlers.visibilitychange = () => { if (document.hidden) this.forceClearAll(); };
    eventHandlers.beforeunload = () => this.forceClearAll();
    eventHandlers.mouseenter = ((e: MouseEvent) => {
      if (!(e.buttons & 1) && this.isMouseDown) this.forceClearAll();
    }) as EventListener;

    window.addEventListener('resize', eventHandlers.resize);
    document.addEventListener('mousedown', eventHandlers.mousedown, { passive: false } as AddEventListenerOptions);
    document.addEventListener('mousemove', eventHandlers.mousemove, {
      capture: true,
      passive: false,
    } as AddEventListenerOptions);
    document.addEventListener('mouseup', eventHandlers.mouseup, { capture: true } as AddEventListenerOptions);
    document.addEventListener('click', eventHandlers.click, { capture: true } as AddEventListenerOptions);
    document.addEventListener('mouseleave', eventHandlers.mouseleave);
    window.addEventListener('blur', eventHandlers.blur);
    document.addEventListener('visibilitychange', eventHandlers.visibilitychange);
    window.addEventListener('beforeunload', eventHandlers.beforeunload);
    document.addEventListener('mouseenter', eventHandlers.mouseenter);

    this.loop();
  }

  /** 同步画布尺寸 */
  private resize() {
    this.canvasWidth = this.canvas.width = innerWidth;
    this.canvasHeight = this.canvas.height = innerHeight;
  }

  /** 注入主题光标样式 */
  private applyCursor() {
    this.cursorStyle = document.createElement('style');
    const cursorUrl = this.assets.cursorImage
      ?.replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"') ?? '';
    const pointerUrl = this.assets.cursorPointerImage
      ?.replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"');
    const pointerRule = pointerUrl
      ? `html a, html button, html [role="button"], html input[type="button"], html input[type="submit"], html select, html label { cursor: url("${pointerUrl}") 0 0, pointer !important; }`
      : '';
    const cursorRule = this.assets.cursorImage
      ? `html, html * { cursor: url("${cursorUrl}") 0 0, auto !important; }`
      : '';
    this.cursorStyle.textContent = `${cursorRule} ${pointerRule}
      html.stella-sora-dragging, html.stella-sora-dragging * {
        user-select: none !important;
        -webkit-user-select: none !important;
      }`;
    document.head.appendChild(this.cursorStyle);
  }

  /** 切换页面文本选择状态 */
  private setSelectionDisabled(disabled: boolean) {
    document.documentElement.classList.toggle('stella-sora-dragging', disabled);
  }

  /** 清理按住状态和拖尾 */
  private forceClearAll() {
    if (this.holdTimer !== null) { clearInterval(this.holdTimer); this.holdTimer = null; }
    if (this.triggerMoveTimer !== null) { clearTimeout(this.triggerMoveTimer); this.triggerMoveTimer = null; }
    this.isMouseDown = false;
    this.isDragActive = false;
    this.setSelectionDisabled(false);
    this.trail = [];
    this.trailFadeStartedAt = null;
  }

  /** 处理鼠标按下事件 */
  private onMouseDown(e: MouseEvent) {
    if (e.button !== 0) return;
    this.isMouseDown = true;
    this.isDragActive = false;
    this.suppressClick = false;
    this.mouseDownPosition = { x: e.clientX, y: e.clientY };
    this.mousePosition = { x: e.clientX, y: e.clientY };
    this.trail = [{ x: e.clientX, y: e.clientY, distance: 0 }];
    this.lastTrailMoveTime = performance.now();
    this.trailFadeStartedAt = null;
    this.clickEffects.push(new ClickEffect(e.clientX, e.clientY, this.assets, this.config));
    if (this.holdTimer !== null) clearInterval(this.holdTimer);
    this.holdTimer = setInterval(() => {
      for (let i = 0; i < this.config.randomCount; i++)
        this.particles.push(new Particle(this.mousePosition.x, this.mousePosition.y, 'hold', this.assets, this.config));
    }, this.config.holdInterval);
    if (this.triggerMoveTimer !== null) clearTimeout(this.triggerMoveTimer);
    this.triggerMoveTimer = setTimeout(() => { this.triggerMoveTimer = null; }, this.config.holdDelay);
  }

  /** 处理鼠标移动和拖尾轨迹 */
  private onMouseMove(e: MouseEvent) {
    this.mousePosition = { x: e.clientX, y: e.clientY };
    if (!this.isMouseDown) return;
    const dragDistance = Math.hypot(
      e.clientX - this.mouseDownPosition.x,
      e.clientY - this.mouseDownPosition.y,
    );
    if (!this.isDragActive && dragDistance >= DRAG_START_DISTANCE) {
      this.isDragActive = true;
      this.suppressClick = true;
      this.setSelectionDisabled(true);
      window.getSelection()?.removeAllRanges();
    }
    if (this.isDragActive) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (this.triggerMoveTimer !== null) return;
    const now = performance.now();
    if (now - this.lastMoveTime < this.config.throttleDelay) return;
    this.lastMoveTime = now;
    if (this.trailFadeStartedAt !== null) {
      this.trail = [{ x: e.clientX, y: e.clientY, distance: 0 }];
      this.trailFadeStartedAt = null;
    }
    if (this.trail.length === 0) {
      this.trail = [{ x: e.clientX, y: e.clientY, distance: 0 }];
    }
    const previousPoint = this.trail[this.trail.length - 1];
    const deltaX = e.clientX - previousPoint.x;
    const deltaY = e.clientY - previousPoint.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance >= 2) {
      this.trail.push({ x: e.clientX, y: e.clientY, distance });
      if (this.trail.length > this.trailConfig.maxPoints) this.trail.shift();
      this.lastTrailMoveTime = now;
      if (distance >= FOLLOW_PARTICLE_SPACING) {
        this.particles.push(new Particle(e.clientX, e.clientY, 'follow', this.assets, this.config));
      }
    }
  }

  /** 阻止拖拽结束后产生的误触点击 */
  private onClick(e: MouseEvent) {
    if (!this.suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
    this.suppressClick = false;
  }

  /** 绘制主题拖尾 */
  private drawTrail(now: number) {
    if (this.trail.length < 2) return;
    if (
      this.isMouseDown &&
      this.trailFadeStartedAt === null &&
      now - this.lastTrailMoveTime >= this.trailConfig.fadeDelay
    ) {
      this.trailFadeStartedAt = now;
    }
    const maxDistance = 160;
    const maxWidth = this.trailConfig.maxWidth;
    const pointCount = this.trail.length;
    const fadeDuration = this.trailConfig.fadeDuration;
    const fadeStart = this.trailFadeStartedAt;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    for (let i = 1; i < pointCount; i++) {
      const from = this.trail[i - 1];
      const to = this.trail[i];
      const age = (i - 1) / (pointCount - 1);
      const width = 1.5 + (maxWidth - 1.5) * age * Math.min(to.distance / maxDistance, 1);
      const fadeProgress = fadeStart === null
        ? 0
        : Math.max(0, Math.min(1, (now - fadeStart - (i - 1) * 0.3) / fadeDuration));
      const color = getTrailColor(
        age,
        this.trailConfig.colors,
        this.trailConfig.colorStops,
      );
      const opacity = (0.06 + age * 0.28) * (1 - fadeProgress);

      this.ctx.globalAlpha = opacity * 0.25;
      this.ctx.strokeStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = this.trailConfig.glowBlur;
      this.ctx.lineWidth = width * 1.8;
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();

      this.ctx.globalAlpha = opacity;
      this.ctx.shadowBlur = 4;
      this.ctx.lineWidth = width;
      this.ctx.beginPath();
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();
    }
    this.ctx.shadowBlur = 0;
    this.ctx.restore();

    if (fadeStart !== null && now - fadeStart >= fadeDuration + (pointCount - 2) * 0.3) {
      this.trail = [];
      this.trailFadeStartedAt = null;
    }
  }

  /** 执行每一帧的统一绘制 */
  private loop = () => {
    if (this.destroyed) return;
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    const now = performance.now();
    this.drawTrail(now);
    for (let i = this.clickEffects.length - 1; i >= 0; i--)
      if (!this.clickEffects[i].draw(this.ctx, now)) this.clickEffects.splice(i, 1);
    for (let i = this.particles.length - 1; i >= 0; i--)
      if (!this.particles[i].draw(this.ctx, now)) this.particles.splice(i, 1);
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  /** 销毁渲染器和所有页面资源 */
  destroy() {
    this.destroyed = true;
    this.forceClearAll();
    cancelAnimationFrame(this.animFrameId);
    const eventHandlers = this.handlers;
    window.removeEventListener('resize', eventHandlers.resize);
    document.removeEventListener('mousedown', eventHandlers.mousedown);
    document.removeEventListener('mousemove', eventHandlers.mousemove, { capture: true } as AddEventListenerOptions);
    document.removeEventListener('mouseup', eventHandlers.mouseup, { capture: true } as AddEventListenerOptions);
    document.removeEventListener('click', eventHandlers.click, { capture: true } as AddEventListenerOptions);
    document.removeEventListener('mouseleave', eventHandlers.mouseleave);
    window.removeEventListener('blur', eventHandlers.blur);
    document.removeEventListener('visibilitychange', eventHandlers.visibilitychange);
    window.removeEventListener('beforeunload', eventHandlers.beforeunload);
    document.removeEventListener('mouseenter', eventHandlers.mouseenter);
    this.cursorStyle?.remove();
    this.cursorStyle = null;
    this.setSelectionDisabled(false);
    this.canvas.remove();
    this.particles = []; this.clickEffects = [];
  }
}