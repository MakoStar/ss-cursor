/** 圆周率两倍 */
export const TAU = Math.PI * 2;
/** 点击爆裂整体缩放 */
export const GLOBAL_SCALE = 6.0;
/** 区间随机 */
export const rand = (a: number, b: number): number => a + Math.random() * (b - a);

/** 解析 rgb/rgba 字符串 */
function parseRGB(str: string): { r: number; g: number; b: number } | null {
  const m = str.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  return { r: p[0], g: p[1], b: p[2] };
}

/** 两色线性插值 */
function lerpRGB(c0: string, c1: string, t: number): string {
  const a = parseRGB(c0), b = parseRGB(c1);
  if (!a || !b) return c0;
  return `rgb(${Math.round(a.r + (b.r - a.r) * t)},${Math.round(a.g + (b.g - a.g) * t)},${Math.round(a.b + (b.b - a.b) * t)})`;
}

/** 颜色渐变采样，stops 格式 [{t, c}] */
export function sampleGradient(stops: { t: number; c: string }[], t: number): string {
  if (t <= stops[0].t) return stops[0].c;
  const last = stops[stops.length - 1];
  if (t >= last.t) return last.c;
  for (let i = 0; i < stops.length - 1; i++) {
    const s0 = stops[i], s1 = stops[i + 1];
    if (t >= s0.t && t <= s1.t) {
      return lerpRGB(s0.c, s1.c, (t - s0.t) / (s1.t - s0.t));
    }
  }
  return last.c;
}

/** 分段折线曲线采样，pts 格式 [[t, v], ...] */
export function sampleCurve(pts: [number, number][], t: number): number {
  if (t <= pts[0][0]) return pts[0][1];
  const last = pts[pts.length - 1];
  if (t >= last[0]) return last[1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [t0, v0] = pts[i], [t1, v1] = pts[i + 1];
    if (t >= t0 && t <= t1) {
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
  }
  return last[1];
}

/** 去掉 rgba 的 alpha，取纯 RGB 字符串 */
export function stripAlpha(color: string): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  return `rgb(${p[0]},${p[1]},${p[2]})`;
}

/** 解析 rgba 的 alpha 值 */
export function parseAlpha(color: string): number {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return 1;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  return p[3] !== undefined ? p[3] : 1;
}

/** 颜色量化，用于缓存 key */
function quantizeColor(color: string): string {
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (!m) return color;
  const p = m[1].split(',').map(s => parseFloat(s.trim()));
  const r = Math.min(255, Math.round(p[0] / 16) * 16);
  const g = Math.min(255, Math.round(p[1] / 16) * 16);
  const b = Math.min(255, Math.round(p[2] / 16) * 16);
  const a = p[3] !== undefined ? Math.round(p[3] * 8) / 8 : 1;
  return `rgba(${r},${g},${b},${a})`;
}

/** 染色缓存 */
const _tintCache = new Map<string, HTMLCanvasElement | null>();

/** 乘法染色，保留贴图原色，只叠色调 */
export function getTinted(
  sprite: HTMLImageElement,
  color: string,
): HTMLCanvasElement | null {
  const q = quantizeColor(color);
  const key = (sprite.src || '') + '|' + q + '|' + sprite.width + 'x' + sprite.height;
  if (_tintCache.has(key)) return _tintCache.get(key)!;
  try {
    const c = document.createElement('canvas');
    c.width = sprite.width;
    c.height = sprite.height;
    const g = c.getContext('2d')!;
    g.drawImage(sprite, 0, 0);
    g.globalCompositeOperation = 'multiply';
    g.fillStyle = q;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = 'destination-in';
    g.drawImage(sprite, 0, 0);
    _tintCache.set(key, c);
    return c;
  } catch {
    return null;
  }
}

/** 按比例居中绘制图片 */
export function drawCentered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  cx: number,
  cy: number,
  size: number,
): void {
  if (!image || !image.complete || image.naturalWidth === 0) return;
  const aspect = image.naturalWidth / image.naturalHeight;
  let w: number, h: number;
  if (aspect >= 1) { w = size; h = size / aspect; }
  else { h = size; w = size * aspect; }
  ctx.drawImage(image, cx - w / 2, cy - h / 2, w, h);
}
