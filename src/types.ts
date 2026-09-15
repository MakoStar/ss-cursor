/** 关键帧时间和属性值 */
export interface Keyframe {
  t: number;
  [prop: string]: number;
}

/** 拖尾视觉配置 */
export interface TrailConfig {
  colors: string[];
  colorStops: number[];
  maxPoints: number;
  maxWidth: number;
  glowBlur: number;
  fadeDelay: number;
  fadeDuration: number;
}

/** 主题碎片配置 */
export interface ParticleConfig {
  size: number;
  glowColor?: string;
  glowBlur?: number;
}

/** 主题点击特效实例 */
export interface ClickEffectInstance {
  /** 绘制一帧点击效果并返回是否继续 */
  draw(ctx: CanvasRenderingContext2D, now: number): boolean;
}

/** 主题点击特效工厂 */
export type ClickEffectFactory = (
  x: number,
  y: number,
  assets: LoadedThemeAssets,
  config: ResolvedConfig,
) => ClickEffectInstance;

/**
 * 主题资源定义接口
 * 新增主题只需实现此接口
 */
export interface ThemeAssets {
  name: string;
  /** 图片路径 */
  shardImages: string[];
  animDuration: number;
  bgType: 'canvas-draw' | 'images';
  cursorImage?: string; 
  cursorPointerImage?: string;
  bgImages?: string[];
  ringImage?: string;
  dotImage?: string;
  trail?: TrailConfig;
  particle?: ParticleConfig;
  clickEffectFactory?: ClickEffectFactory;
  matchDate?: () => boolean;
}

export interface LoadedThemeAssets {
  name: string;
  shards: HTMLImageElement[];
  cursorImage?: string;
  cursorPointerImage?: string;
  trail?: TrailConfig;
  particle?: ParticleConfig;
  clickEffectFactory?: ClickEffectFactory;
  animDuration: number;
  bgType: 'canvas-draw' | 'images';
  bgImages: HTMLImageElement[];
  ring: HTMLImageElement | null;
  dot: HTMLImageElement | null;
}

/** 初始化选项 */
export interface StellaSoraCursorOptions {
  theme?: string | 'auto' | 'random';
  customThemes?: ThemeAssets[];
  randomCount?: number;
  holdDelay?: number;
  throttleDelay?: number;
  holdInterval?: number;
  followAnimDuration?: number;
  holdParticleLife?: number;
  zIndex?: number;
}

/** 合并后的运行时配置 */
export interface ResolvedConfig {
  randomCount: number;
  holdDelay: number;
  throttleDelay: number;
  holdInterval: number;
  followAnimDuration: number;
  holdParticleLife: number;
  zIndex: number;
}