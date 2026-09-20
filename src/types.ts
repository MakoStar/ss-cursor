import type { Emitter, SlideTrail } from './engine';

/** 颜色渐变停靠点 */
export interface GradientStop {
  t: number;
  c: string;
}

/** 丝带颜色停靠点 */
export interface RibbonColorStop {
  t: number;
  color: string;
}

/** 拖尾多粒子层配置 */
export interface ParticleLayerConfig {
  sprite?: HTMLImageElement;
  tileX?: number;
  tileY?: number;
  frameMode?: 'fixed' | 'animated';
  rate?: number;
  emitSpacing?: number;
  lifeMin?: number;
  lifeMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  speedMin?: number;
  speedMax?: number;
  shapeRadius?: number;
  gravity?: number;
  drag?: number;
  startRotMin?: number;
  startRotMax?: number;
  rotSpeedMin?: number;
  rotSpeedMax?: number;
  sizeCurve?: (t: number) => number;
  colorCurve?: ((t: number) => string) | null;
  tint?: string | null;
  alphaCurve?: (t: number) => number;
  blendMode?: GlobalCompositeOperation;
}

/** 点击爆裂发射器配置 */
export interface EmitterConfig {
  sprite?: HTMLImageElement;
  drawMode?: 'whiteRing';
  frameCount?: number;
  tileX?: number;
  tileY?: number;
  frameStart?: number;
  frameMode?: 'fixed' | 'animated';
  startDelay?: number;
  lifeMin: number;
  lifeMax: number;
  speedMin: number;
  speedMax: number;
  sizeMin: number;
  sizeMax: number;
  burstCount?: number;
  bursts?: { time: number; count: number }[];
  shapeRadius?: number;
  gravity?: number;
  drag?: number;
  rotMin?: number;
  rotMax?: number;
  rotSpeed?: number;
  rotSpeedMin?: number;
  rotSpeedMax?: number;
  timescale?: number;
  blendMode?: GlobalCompositeOperation;
  tint?: string;
  colorCurve?: (t: number) => string;
  sizeCurve: (t: number) => number;
  alphaCurve: (t: number) => number;
  /** whiteRing 专用 */
  ringColor?: string;
  ringGlow?: string;
  ringRatio?: number;
  ringWidthRatio?: number;
  innerTopColor?: string;
  innerMidColor?: string;
  innerEdgeColor?: string;
}

/** 拖动拖尾配置 */
export interface SlideTrailConfig {
  pointLife?: number;
  maxPoints?: number;
  minDist?: number;
  activationDelay?: number;
  ribbonWidth?: number;
  ribbonAlpha?: number;
  ribbonBright?: number;
  ribbonBlend?: GlobalCompositeOperation;
  ribbonLayers?: { widthMul: number; alpha: number; blur: number }[];
  ribbonColors?: RibbonColorStop[];
  /** 兼容旧字段：单色渐变简写 */
  width?: number;
  colors?: string[];
  colorStops?: number[];

  sprite?: HTMLImageElement;
  spriteFrames?: number;
  spriteTileX?: number;
  spriteTileY?: number;
  spriteFrameStart?: number;
  frameMode?: 'fixed' | 'animated';
  frameRate?: number;
  fixedFrameWeights?: [number, number][] | null;
  ribbonOnTop?: boolean;

  starLifeMin?: number;
  starLifeMax?: number;
  starInterval?: number;
  starSpacing?: number;
  starSizeMin?: number;
  starSizeMax?: number;
  starSpeedMin?: number;
  starSpeedMax?: number;
  starDrag?: number;
  starJitter?: number;
  starRotMin?: number;
  starRotMax?: number;
  starRotSpeedMin?: number;
  starRotSpeedMax?: number;
  starShrink?: number;
  starColors?: string[];
  starFadeStart?: number;
  starFadeEnd?: number;
  starBaseAlpha?: number;

  particleLayers?: ParticleLayerConfig[];
}

/** 主题资源（用户输入版本，图片是 URL 字符串） */
export interface ThemeAssets {
  /** 主题名，用于 theme: 'summer' 这种查找 */
  name: string;
  /** 显示名，缺省用 name */
  label?: string;
  /** 贴图键 → URL */
  spriteFiles: Record<string, string>;
  /** 创建点击爆裂发射器列表 */
  createEmitters(S: Record<string, HTMLImageElement>): Emitter[];
  /** 创建拖动拖尾实例 */
  createTrail(S: Record<string, HTMLImageElement>): SlideTrail;
  /** 普通页面区域光标 URL */
  cursorImage?: string;
  /** 链接/按钮等可交互元素光标 URL */
  cursorPointerImage?: string;
  /** 日期匹配函数，用于 auto 主题选择 */
  matchDate?: () => boolean;
}

/** 加载完成的主题（图片已变成 HTMLImageElement） */
export interface LoadedThemeAssets extends ThemeAssets {
  loadedSprites: Record<string, HTMLImageElement>;
}

/** 初始化选项 */
export interface StellaSoraCursorOptions {
  /** 主题名，或 'auto' / 'random'，默认 'auto' */
  theme?: string;
  /** 运行时注册的自定义主题 */
  customThemes?: ThemeAssets[];
  /** 拖尾激活延迟（毫秒），默认 100 */
  holdDelay?: number;
  /** 拖尾粒子发射间隔（毫秒），默认 100 */
  holdInterval?: number;
  /** Canvas 层级，默认 2147483647 */
  zIndex?: number;
  /** 是否替换页面光标，默认 true */
  replaceCursor?: boolean;
  /** 是否禁用拖动拖尾，默认 false。点击爆裂不受影响 */
  disableTrail?: boolean;
  /** 是否静默控制台日志，默认 false */
  silent?: boolean;
}

/** 内部解析后的配置 */
export interface ResolvedConfig {
  themeName: string;
  customThemes: ThemeAssets[];
  holdDelay: number;
  holdInterval: number;
  zIndex: number;
  replaceCursor: boolean;
  disableTrail: boolean;
  silent: boolean;
}
