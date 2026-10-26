import type { FrameFit } from "@/config/cafe";
import type { FrameSetConfig } from "@/lib/frameSet";

export const MAX_CANVAS_DPR = 1.5;
export const FRAME_ZOOM_MIN = 0.8;
export const FRAME_ZOOM_MAX = 2;

export type FrameLayout = Pick<
  FrameSetConfig,
  "zoom" | "focusX" | "focusY" | "offsetY"
>;

export function clampFrameZoom(zoom: number): number {
  return Math.min(FRAME_ZOOM_MAX, Math.max(FRAME_ZOOM_MIN, zoom));
}

export function clampFocus(value: number): number {
  return Math.min(1, Math.max(0, value));
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

export function computeFrameDrawRect(
  image: CanvasImageSource,
  width: number,
  height: number,
  fit: FrameFit,
  layout: FrameLayout
): ContainedFrameRect | null {
  const { iw, ih } = getImageSize(image);
  if (!iw || !ih) return null;

  const zoom = clampFrameZoom(layout.zoom);
  const focusX = clampFocus(layout.focusX);
  const focusY = clampFocus(layout.focusY);
  const offsetPx = layout.offsetY * height;

  const baseScale =
    fit === "cover"
      ? Math.max(width / iw, height / ih)
      : Math.min(width / iw, height / ih);

  const scale = baseScale * zoom;
  const w = iw * scale;
  const h = ih * scale;
  const x = focusX * width - focusX * iw * scale;
  const y = focusY * height - focusY * ih * scale + offsetPx;

  return { x, y, w, h };
}

/** Visible bottom edge of the drawn frame inside the canvas (for story placement) */
export function visibleFrameBottom(
  rect: ContainedFrameRect,
  canvasHeight: number
): number {
  const top = Math.max(0, rect.y);
  const bottom = rect.y + rect.h;
  return Math.min(canvasHeight, Math.max(top, bottom));
}

export function drawImageInRect(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  rect: ContainedFrameRect
): void {
  ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
}

export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  layout: FrameLayout,
  scaleExtra = 1
): ContainedFrameRect | null {
  const rect = computeFrameDrawRect(image, width, height, "cover", {
    ...layout,
    zoom: clampFrameZoom(layout.zoom * scaleExtra),
  });
  if (!rect) return null;
  drawImageInRect(ctx, image, rect);
  return rect;
}

export function drawContainImage(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  layout: FrameLayout
): ContainedFrameRect | null {
  const rect = computeFrameDrawRect(image, width, height, "contain", layout);
  if (!rect) return null;
  drawImageInRect(ctx, image, rect);
  return rect;
}

export function drawContainBlur(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  backgroundColor: string,
  layout: FrameLayout
): ContainedFrameRect | null {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.filter = "blur(56px) brightness(0.32) saturate(1.1)";
  drawCoverImage(ctx, image, width, height, layout, 1.35);
  ctx.restore();

  return drawContainImage(ctx, image, width, height, layout);
}

export function drawFrameWithFit(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  width: number,
  height: number,
  fit: FrameFit,
  backgroundColor: string,
  layout: FrameLayout
): ContainedFrameRect | null {
  ctx.clearRect(0, 0, width, height);

  switch (fit) {
    case "contain":
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      return drawContainImage(ctx, image, width, height, layout);
    case "contain-blur":
      return drawContainBlur(ctx, image, width, height, backgroundColor, layout);
    case "cover":
    default:
      return drawCoverImage(ctx, image, width, height, layout);
  }
}

export function frameCountForSet(set: FrameSetConfig): number {
  return set.frameCount;
}

export function storyBelowFrame(fit: FrameFit): boolean {
  return fit === "contain" || fit === "contain-blur";
}
