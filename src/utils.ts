/** 按比例居中绘制图片 */
export function drawCentered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  cx: number, cy: number, size: number,
): void {
  if (!image || !image.complete || image.naturalWidth === 0) return;
  const aspectRatio = image.naturalWidth / image.naturalHeight;
  let drawWidth: number, drawHeight: number;
  if (aspectRatio >= 1) { drawWidth = size; drawHeight = size / aspectRatio; }
  else { drawHeight = size; drawWidth = size * aspectRatio; }
  ctx.drawImage(image, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
}

/** 根据日期获取主题 */
export function getThemeByDate(): string {
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  if ((month === 12 && day >= 25) || (month === 1 && day <= 7)) return 'christmas';
  return 'default';
}