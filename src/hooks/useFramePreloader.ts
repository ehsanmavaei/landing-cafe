"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CafeConfig } from "@/config/cafe";
import {
  resolveFrameStrategy,
  isPortraitViewport,
  probeFrameSetAvailable,
  type FrameSetConfig,
  type ResolvedFrameStrategy,
} from "@/lib/frameSet";
import {
  buildLogicalFrameIndices,
  frameFileName,
  getFrameSrc,
  getNearestLoadedFrameIndex,
} from "@/lib/frames";

export type FramePreloadState = {
  ready: boolean;
  progress: number;
  bitmaps: Map<number, ImageBitmap>;
  frameCount: number;
  activeSet: FrameSetConfig;
  strategyKey: string;
};

function closeBitmapsUnique(map: Map<number, ImageBitmap>) {
  const seen = new Set<ImageBitmap>();
  map.forEach((bitmap) => {
    if (seen.has(bitmap)) return;
    seen.add(bitmap);
    try {
      bitmap.close();
    } catch {
      /* already closed */
    }
  });
}

function fillLogicalFrameMap(
  frameCount: number,
  loaded: Map<number, ImageBitmap>,
  loadedIndices: number[]
): Map<number, ImageBitmap> {
  const full = new Map<number, ImageBitmap>();
  const sorted = [...loadedIndices].sort((a, b) => a - b);
  if (sorted.length === 0) return full;

  for (let i = 1; i <= frameCount; i++) {
    if (loaded.has(i)) {
      full.set(i, loaded.get(i)!);
      continue;
    }
    const nearest = getNearestLoadedFrameIndex(i, sorted);
    const bitmap = loaded.get(nearest);
    if (bitmap) full.set(i, bitmap);
  }
  return full;
}

function strategyKeyFrom(strategy: ResolvedFrameStrategy): string {
  return `${strategy.set.folder}:${strategy.set.fit}:${strategy.set.zoom}:${isPortraitViewport()}`;
}

function shouldLoadEverySecondFrame(): boolean {
  return (
    isPortraitViewport() ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

const idleStrategy: FramePreloadState = {
  ready: false,
  progress: 0,
  bitmaps: new Map(),
  frameCount: 0,
  activeSet: {
    folder: "",
    frameCount: 0,
    aspectRatio: 1,
    fit: "cover",
    zoom: 1,
  },
  strategyKey: "",
};

async function loadImageBitmapFromUrl(
  src: string,
  fileLabel: string
): Promise<ImageBitmap | null> {
  const img = new Image();
  img.decoding = "async";
  img.src = src;

  try {
    await img.decode();
  } catch (err) {
    console.error(`Frame decode failed: ${fileLabel} (${src})`, err);
    return null;
  }

  if (!img.complete || img.naturalWidth === 0) {
    console.error(`Frame failed to load: ${fileLabel} (${src})`);
    return null;
  }

  try {
    return await createImageBitmap(img);
  } catch (err) {
    console.error(`Frame bitmap failed: ${fileLabel} (${src})`, err);
    return null;
  }
}

export function useFramePreloader(
  config: CafeConfig,
  reducedMotion: boolean,
  active: boolean
): FramePreloadState {
  const [state, setState] = useState<FramePreloadState>(idleStrategy);
  const lastKeyRef = useRef("");
  const desktopKnownRef = useRef<boolean | null>(null);
  const bitmapsRef = useRef<Map<number, ImageBitmap>>(new Map());
  const loadGenRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadWithStrategy = useCallback(
    async (strategy: ResolvedFrameStrategy, opts?: { keepReady?: boolean }) => {
      const gen = ++loadGenRef.current;
      const { set } = strategy;
      const { frameCount } = set;
      const { extension } = config.frames;

      if (!opts?.keepReady) {
        setState((s) => ({ ...s, ready: false, progress: 0 }));
      }

      const probeOk = await probeFrameSetAvailable(set.folder, extension);
      if (gen !== loadGenRef.current) return;

      if (!probeOk) {
        console.error(
          `Frame set unavailable (404 or load error): ${set.folder}/f_0001.${extension}`
        );
      }

      const mobileEveryNth = shouldLoadEverySecondFrame() ? 2 : 1;

      const indices = reducedMotion
        ? [frameCount]
        : buildLogicalFrameIndices(frameCount, mobileEveryNth);

      const uniqueSrcs = new Map<string, number[]>();

      indices.forEach((logical) => {
        const src = getFrameSrc(logical, set.folder, extension);
        const list = uniqueSrcs.get(src) ?? [];
        list.push(logical);
        uniqueSrcs.set(src, list);
      });

      const total = uniqueSrcs.size;
      let loaded = 0;
      const partial = new Map<number, ImageBitmap>();

      await Promise.all(
        Array.from(uniqueSrcs.entries()).map(async ([src, logicalIndices]) => {
          const file = frameFileName(logicalIndices[0], extension);
          const bitmap = await loadImageBitmapFromUrl(src, file);
          if (gen !== loadGenRef.current) return;

          if (bitmap) {
            logicalIndices.forEach((idx) => partial.set(idx, bitmap));
          }
          loaded += 1;
          setState((s) => ({
            ...s,
            progress: Math.round((loaded / total) * 100),
          }));
        })
      );

      if (gen !== loadGenRef.current) return;

      const full = reducedMotion
        ? partial
        : fillLogicalFrameMap(frameCount, partial, indices);

      if (full.size === 0) {
        console.error(
          `No frames loaded for ${set.folder} (check public${set.folder})`
        );
      }

      closeBitmapsUnique(bitmapsRef.current);
      bitmapsRef.current = full;

      const key = strategyKeyFrom(strategy);
      lastKeyRef.current = key;

      setState({
        ready: true,
        progress: 100,
        bitmaps: full,
        frameCount,
        activeSet: set,
        strategyKey: key,
      });

      console.info("[Hero frames loaded]", {
        folder: set.folder,
        fit: set.fit,
        zoom: set.zoom,
        frameCount,
        bitmapEntries: full.size,
        sparseLoadCount: partial.size,
        portrait: isPortraitViewport(),
      });
    },
    [config, reducedMotion]
  );

  const load = useCallback(async () => {
    const strategy = await resolveFrameStrategy(
      config.frames,
      desktopKnownRef
    );
    await loadWithStrategy(strategy);
  }, [config.frames, loadWithStrategy]);

  const maybeReloadOnLayout = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (isPortraitViewport()) {
        desktopKnownRef.current = null;
      }
      const strategy = await resolveFrameStrategy(
        config.frames,
        desktopKnownRef
      );
      const key = strategyKeyFrom(strategy);
      if (key === lastKeyRef.current) return;
      await loadWithStrategy(strategy, { keepReady: true });
    }, 250);
  }, [config.frames, loadWithStrategy]);

  useEffect(() => {
    if (!active) return;

    load().catch((err) => {
      console.error(err);
      setState((s) => ({ ...s, progress: 100, ready: true }));
    });

    const onLayoutChange = () => {
      maybeReloadOnLayout();
    };

    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("orientationchange", onLayoutChange);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("orientationchange", onLayoutChange);
      loadGenRef.current += 1;
      closeBitmapsUnique(bitmapsRef.current);
    };
  }, [load, active, maybeReloadOnLayout]);

  if (!active) return idleStrategy;

  return state;
}
