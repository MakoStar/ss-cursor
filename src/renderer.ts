import type { LoadedThemeAssets, ResolvedConfig } from './types';
import { TouchEffect } from './engine';
import type { SlideTrail } from './engine';
import { logWarn } from './log';

/** 光标样式注入的 style 标签 id */
const CURSOR_STYLE_ID = 'ss-cursor-style';
/** 拖拽时禁用文本选择的 class 名 */
const DRAGGING_CLASS = 'ss-cursor-dragging';
/** 进入拖拽状态的最小移动距离（像素） */
const DRAG_START_DISTANCE = 8;

/** 光标渲染器：管 canvas / 事件 / RAF / destroy */
export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ResolvedConfig;
  private theme: LoadedThemeAssets;

  private effects: TouchEffect[] = [];
  private trails: SlideTrail[] = [];
  private activeTrail: SlideTrail | null = null;

  private raf = 0;
  private lastT = 0;
  private destroyed = false;
  private W = 0;
  private H = 0;
  private DPR = 1;
  private cursorStyle: HTMLStyleElement | null = null;

  private warnedEmptyEmitters = false;

  /** 拖拽起点，用于判断是否进入拖拽状态 */
  private mouseDownPos = { x: 0, y: 0 };
  /** 是否已进入拖拽状态 */
  private isDragActive = false;
  /** 拖拽结束后吞掉随后的 click，避免误触 */
  private suppressClick = false;
  /** 延迟清除 suppressClick 的定时器 */
  private clickResetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: ResolvedConfig, theme: LoadedThemeAssets) {
    this.config = config;
    this.theme = theme;

    /** 全屏 canvas，pointer-events: none 让点击穿透到页面 */
    this.canvas = document.createElement('canvas');
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: String(config.zIndex),
    });
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    if (config.replaceCursor) this.applyCursor();

    this.resize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    window.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerUp);
    window.addEventListener('click', this.handleClick, true);
    window.addEventListener('blur', this.handleBlur);
    document.addEventListener('visibilitychange', this.handleVisibility);
    window.addEventListener('beforeunload', this.handleBeforeUnload);

    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  /** 把 config 里能对上的字段覆盖到 trail 实例上 */
  private applyOverrides(trail: SlideTrail) {
    const c = this.config;
    const t = trail as any;
    if (typeof t.activationDelay === 'number') {
      t.activationDelay = c.holdDelay / 1000;
    }
    if (typeof t.starInterval === 'number') {
      t.starInterval = c.holdInterval / 1000;
    }
    if (Array.isArray(t.particleLayers)) {
      for (const L of t.particleLayers) {
        if (L.rate > 0) L.rate = 1000 / c.holdInterval;
      }
    }
  }

  private resize() {
    this.DPR = Math.min(window.devicePixelRatio || 1, 2);
    // this.W = window.innerWidth;
    // this.H = window.innerHeight;
    /** Fix: 点击特效位置左上偏移 20260921 */
    this.W = document.documentElement.clientWidth;
    this.H = document.documentElement.clientHeight;
    this.canvas.width = this.W * this.DPR;
    this.canvas.height = this.H * this.DPR;
    this.ctx.setTransform(this.DPR, 0, 0, this.DPR, 0, 0);
  }

  private handleResize = () => this.resize();

  /** 切换页面文本选择状态 */
  private setSelectionDisabled(disabled: boolean) {
    document.documentElement.classList.toggle(DRAGGING_CLASS, disabled);
  }

  /** 清理拖拽状态 */
  private resetDrag() {
    if (this.clickResetTimer !== null) {
      clearTimeout(this.clickResetTimer);
      this.clickResetTimer = null;
    }
    this.isDragActive = false;
    this.setSelectionDisabled(false);
    /** 延迟清除 suppressClick，让随后的 click 事件被吞掉 */
    if (this.suppressClick) {
      this.clickResetTimer = setTimeout(() => {
        this.suppressClick = false;
        this.clickResetTimer = null;
      }, 50);
    }
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const x = e.clientX;
    const y = e.clientY;

    /** 重置拖拽状态 */
    this.mouseDownPos = { x, y };
    this.isDragActive = false;
    this.suppressClick = false;

    const emitters = this.theme.createEmitters(this.theme.loadedSprites);
    if (emitters.length === 0 && !this.warnedEmptyEmitters) {
      logWarn(`theme "${this.theme.name}" returned 0 emitters`);
      this.warnedEmptyEmitters = true;
    }

    /** 拖尾：disableTrail 时不创建 */
    if (this.config.disableTrail) return;
    const trail = this.theme.createTrail(this.theme.loadedSprites);
    this.applyOverrides(trail);

    this.effects.push(new TouchEffect(x, y, emitters));
    this.activeTrail = trail;
    trail.start(x, y);
    this.trails.push(trail);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.activeTrail) return;

    /** 判断是否进入拖拽状态 */
    if (!this.isDragActive) {
      const dx = e.clientX - this.mouseDownPos.x;
      const dy = e.clientY - this.mouseDownPos.y;
      if (dx * dx + dy * dy >= DRAG_START_DISTANCE * DRAG_START_DISTANCE) {
        this.isDragActive = true;
        this.suppressClick = true;
        this.setSelectionDisabled(true);
        window.getSelection()?.removeAllRanges();
      }
    }

    /** 拖拽时阻止默认行为（阻止文本选中） */
    if (this.isDragActive) {
      e.preventDefault();
    }

    this.activeTrail.push(e.clientX, e.clientY);
  };

  private handlePointerUp = () => {
    if (this.activeTrail) {
      this.activeTrail.end();
      this.activeTrail = null;
    }
    this.resetDrag();
  };

  /** 吞掉拖拽结束后产生的 click，避免误触页面元素 */
  private handleClick = (e: MouseEvent) => {
    if (!this.suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
  };

  private handleBlur = () => {
    if (this.activeTrail) {
      this.activeTrail.end();
      this.activeTrail = null;
    }
    this.resetDrag();
  };

  private handleVisibility = () => {
    if (document.hidden) this.handleBlur();
  };

  private handleBeforeUnload = () => {
    this.destroy();
  };

  private loop = (now: number) => {
    if (this.destroyed) return;
    const dt = Math.min((now - this.lastT) / 1000, 0.05);
    this.lastT = now;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const alive = this.effects[i].update(dt);
      this.effects[i].draw(ctx);
      if (!alive) this.effects.splice(i, 1);
    }
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const st = this.trails[i];
      st.update(dt);
      if (!st.done) st.draw(ctx);
      if (st.done) this.trails.splice(i, 1);
    }

    this.raf = requestAnimationFrame(this.loop);
  };

  private applyCursor() {
    const cursorUrl = this.theme.cursorImage
      ?.replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"') ?? '';
    const pointerUrl = this.theme.cursorPointerImage
      ?.replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"') ?? '';

    const cursorRule = cursorUrl
      ? `html, html * { cursor: url("${cursorUrl}") 0 0, auto !important; }`
      : '';
    const pointerRule = pointerUrl
      ? `html a, html button, html [role="button"], html input[type="button"], html input[type="submit"], html select, html label { cursor: url("${pointerUrl}") 0 0, pointer !important; }`
      : '';
    const dragRule = `html.${DRAGGING_CLASS}, html.${DRAGGING_CLASS} * {
      user-select: none !important;
      -webkit-user-select: none !important;
    }`;

    this.cursorStyle = document.createElement('style');
    this.cursorStyle.id = CURSOR_STYLE_ID;
    this.cursorStyle.textContent = `${cursorRule}\n${pointerRule}\n${dragRule}`;
    document.head.appendChild(this.cursorStyle);
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    cancelAnimationFrame(this.raf);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerUp);
    window.removeEventListener('click', this.handleClick, true);
    window.removeEventListener('blur', this.handleBlur);
    document.removeEventListener('visibilitychange', this.handleVisibility);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);

    if (this.clickResetTimer !== null) {
      clearTimeout(this.clickResetTimer);
      this.clickResetTimer = null;
    }
    this.setSelectionDisabled(false);

    this.cursorStyle?.remove();
    this.cursorStyle = null;

    this.canvas.remove();
    this.effects = [];
    this.trails = [];
    this.activeTrail = null;
    this.isDragActive = false;
    this.suppressClick = false;
  }
}
