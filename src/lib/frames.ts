import type { FrameFit } from "@/config/cafe";
import type { FrameSetConfig } from "@/lib/frameSet";

export const MAX_CANVAS_DPR = 1.5;
export const FRAME_ZOOM_MIN = 0.8;
export const FRAME_ZOOM_MAX = 1.6;

export function clampFrameZoom(zoom: number): number {
  return Math.min(FRAME_ZOOM_MAX, Math.max(FRAME_ZOOM_MIN, zoom));
}

export function formatFrameIndex(index: number): string {
  return String(index).padStart(4, "0");
}

export function getFrameSrc(
  logicalIndex: number,
  folder: string,
  extension: string
): string {
  return `${folder}/f_${formatFrameIndex(logicalIndex)}.${extension}`;
}

export function frameFileName(logicalIndex: number, extension: string): string {
  return `f_${formatFrameIndex(logicalIndex)}.${extension}`;
}

export function buildLogicalFrameIndices(
  frameCount: number,
  mobileEveryNth: number
): number[] {
  const indices: number[] = [];
  for (let i = 1; i <= frameCount; i++) {
    if (mobileEveryNth > 1 && i % mobileEveryNth !== 1 && i !== frameCount) {
      continue;
    }
    indices.push(i);
  }
  if (indices[indices.length - 1] !== frameCount) {
    indices.push(frameCount);
  }
  return indices;
}

export function progressToFrameIndex(
  progress: number,
  frameCount: number
): number {
  const clamped = Math.min(1, Math.max(0, progress));
  const index = Math.round(clamped * (frameCount - 1)) + 1;
  return Math.min(frameCount, Math.max(1, index));
}

export function getNearestLoadedFrameIndex(
  logicalIndex: number,
  loadedKeys: number[]
): number {
  if (loadedKeys.length === 0) return 1;
  let nearest = loadedKeys[0];
  let minDist = Infinity;
  for (const idx of loadedKeys) {
    const d = Math.abs(idx - logicalIndex);
    if (d < minDist) {
      minDist = d;
      nearest = idx;
    }
  }
  return nearest;
}

export function getBitmapForFrame(
  logicalIndex: number,
  map: Map<number, ImageBitmap>,
  frameCount: number
): ImageBitmap | undefined {
  if (map.size === 0) return undefined;

  const direct = map.get(logicalIndex);
  if (direct) return direct;

  const keys = [...map.keys()].sort((a, b) => a - b);
  const nearest = getNearestLoadedFrameIndex(logicalIndex, keys);
  return map.get(nearest) ?? map.get(1) ?? map.get(frameCount);
}

function getImageSize(image: CanvasImageSource): { iw: number; ih: number } {
  if (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
    return { iw: image.width, ih: image.height };
  }

  const iw =
    "naturalWidth" in image && image.naturalWidth
      ? image.naturalWidth
      : (image as HTMLImageElement).width;
  const ih =
    "naturalHeight" in image && image.naturalHeight
      ? image.naturalHeight
      : (image as HTMLImageElement).height;
  return { iw, ih };
}

export type ContainedFrameRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function computeContainedFrameRect(
  image: CanvasImageSource,
  width: number,
  height: number,
  zoom: number
): ContainedFrameRect | null {
  const { iw, ih } = getImageSize(image);
  if (!iw || !ih) return null;

  const scale = Math.min(width / iw, height / ih) * clampFrameZoom(zoom);
  const w = iw * scale;
  const h = ih * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}

export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  scaleMultiplier = 1
): void {
  const { iw, ih } = getImageSize(image);
  if (!iw || !ih) return;

  const scale = Math.max(width / iw, height / ih) * scaleMultiplier;
  const sw = iw * scale;
  const sh = ih * scale;
  const sx = (width - sw) / 2;
  const sy = (height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh);
}

export function drawContainImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  zoom = 1
): ContainedFrameRect | null {
  const rect = computeContainedFrameRect(image, width, height, zoom);
  if (!rect) return null;
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
  return rect;
}

export function drawContainBlur(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  backgroundColor: string,
  zoom = 1
): ContainedFrameRect | null {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.filter = "blur(56px) brightness(0.32) saturate(1.1)";
  drawCoverImage(ctx, image, width, height, 1.35);
  ctx.restore();

  return drawContainImage(ctx, image, width, height, zoom);
}

export function drawFrameWithFit(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  fit: FrameFit,
  backgroundColor: string,
  zoom = 1
): ContainedFrameRect | null {
  ctx.clearRect(0, 0, width, height);

  switch (fit) {
    case "contain":
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      return drawContainImage(ctx, image, width, height, zoom);
    case "contain-blur":
      return drawContainBlur(ctx, image, width, height, backgroundColor, zoom);
    case "cover":
    default:
      drawCoverImage(ctx, image, width, height);
      return null;
  }
}

export function frameCountForSet(set: FrameSetConfig): number {
  return set.frameCount;
}

export function storyBelowFrame(fit: FrameFit): boolean {
  return fit === "contain" || fit === "contain-blur";
}
