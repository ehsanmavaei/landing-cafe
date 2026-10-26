"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CafeConfig } from "@/config/cafe";
import type { FrameSetConfig } from "@/lib/frameSet";
import { isPortraitViewport } from "@/lib/frameSet";
import {
  drawFrameWithFit,
  getBitmapForFrame,
  getFrameSrc,
  MAX_CANVAS_DPR,
  progressToFrameIndex,
  storyBelowFrame,
} from "@/lib/frames";
import { StoryOverlay } from "@/components/StoryOverlay";

gsap.registerPlugin(ScrollTrigger);

function getScrollLengthVh(config: CafeConfig["frames"]): number {
  const mobile =
    isPortraitViewport() ||
    window.matchMedia("(max-width: 767px)").matches;
  return mobile ? config.scrollLengthVh.mobile : config.scrollLengthVh.desktop;
}

function getPinnedScrollPx(config: CafeConfig["frames"]): number {
  return window.innerHeight * getScrollLengthVh(config);
}

function measurePinSize(pin: HTMLElement): { w: number; h: number } {
  let w = pin.clientWidth;
  let h = pin.clientHeight;

  if (w <= 0 || h <= 0) {
    w = window.innerWidth;
    h = window.visualViewport?.height ?? window.innerHeight;
  }

  return { w, h };
}

type HeroCanvasProps = {
  config: CafeConfig;
  bitmaps: Map<number, ImageBitmap>;
  frameCount: number;
  activeSet: FrameSetConfig;
  reducedMotion: boolean;
  contentVisible: boolean;
};

export function HeroCanvas({
  config,
  bitmaps,
  frameCount,
  activeSet,
  reducedMotion,
  contentVisible,
}: HeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [frameBottomPx, setFrameBottomPx] = useState<number | undefined>();
  const frameState = useRef(1);
  const activeSetRef = useRef(activeSet);
  const bitmapsRef = useRef(bitmaps);
  const frameCountRef = useRef(frameCount);
  const rafDrawRef = useRef<number | null>(null);
  const pendingFrameRef = useRef<number | null>(null);
  const loggedInitRef = useRef(false);
  const layoutRef = useRef({ w: 0, h: 0 });
  const resizeCanvasRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeSetRef.current = activeSet;
    frameCountRef.current = frameCount;
  }, [activeSet, frameCount]);

  useEffect(() => {
    bitmapsRef.current = bitmaps;
    if (bitmaps.size > 0 && resizeCanvasRef.current) {
      frameState.current = reducedMotion ? frameCount : 1;
      resizeCanvasRef.current();
    }
  }, [bitmaps, frameCount, reducedMotion]);

  useEffect(() => {
    if (!contentVisible || bitmaps.size === 0 || frameCount === 0) return;

    const redraw = () => resizeCanvasRef.current?.();
    requestAnimationFrame(() => {
      requestAnimationFrame(redraw);
    });
  }, [contentVisible, bitmaps.size, frameCount]);

  useEffect(() => {
    if (bitmaps.size === 0 || frameCount === 0) return;
    loggedInitRef.current = false;

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!canvas || !section || !pin) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = config.colors.bg;

    const updateStoryAnchor = (rectBottom: number | null) => {
      const { fit } = activeSetRef.current;
      if (storyBelowFrame(fit) && rectBottom != null) {
        setFrameBottomPx(Math.round(rectBottom));
      } else {
        setFrameBottomPx(undefined);
      }
    };

    const drawFrame = (logicalIndex: number) => {
      const count = frameCountRef.current;
      const { fit, zoom } = activeSetRef.current;
      const bitmap = getBitmapForFrame(
        logicalIndex,
        bitmapsRef.current,
        count
      );
      const { w, h } = layoutRef.current;
      if (!bitmap) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
        return;
      }
      if (w <= 0 || h <= 0) return;

      try {
        const rect = drawFrameWithFit(ctx, bitmap, w, h, fit, bg, zoom);
        updateStoryAnchor(rect ? rect.y + rect.h : null);
      } catch (err) {
        console.error("Canvas draw failed for frame", logicalIndex, err);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const scheduleDraw = (logicalIndex: number) => {
      pendingFrameRef.current = logicalIndex;
      if (rafDrawRef.current !== null) return;
      rafDrawRef.current = requestAnimationFrame(() => {
        rafDrawRef.current = null;
        const idx = pendingFrameRef.current;
        if (idx === null || idx === frameState.current) return;
        frameState.current = idx;
        drawFrame(idx);
      });
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
      const { w, h } = measurePinSize(pin);
      if (w <= 0 || h <= 0) return false;

      layoutRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(frameState.current);

      if (!loggedInitRef.current) {
        loggedInitRef.current = true;
        const { fit, zoom, folder } = activeSetRef.current;
        console.info("[Hero canvas init]", {
          frameFolder: folder,
          fit,
          zoom,
          layoutCssPx: { w, h },
          canvasPixels: { w: canvas.width, h: canvas.height },
          dpr,
          frameCount: frameCountRef.current,
          bitmapEntries: bitmapsRef.current.size,
        });
      }
      return true;
    };

    resizeCanvasRef.current = resizeCanvas;

    frameState.current = reducedMotion ? frameCount : 1;

    if (!resizeCanvas()) {
      let attempts = 0;
      const retryUntilSized = () => {
        if (resizeCanvas() || attempts > 30) return;
        attempts += 1;
        requestAnimationFrame(retryUntilSized);
      };
      requestAnimationFrame(retryUntilSized);
    }

    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(pin);

    let ctxGsap: gsap.Context | undefined;
    let scrollTriggerRef: ScrollTrigger | undefined;

    const logScrollMetrics = () => {
      const pinnedPx = getPinnedScrollPx(config.frames);
      console.info("[Hero scroll metrics]", {
        documentHeight: document.documentElement.scrollHeight,
        pinnedScrollDistancePx: pinnedPx,
        pinnedScrollDistanceVh: getScrollLengthVh(config.frames) * 100,
        viewportInnerHeight: window.innerHeight,
        scrollTriggerEnd: scrollTriggerRef?.end,
        scrollY: window.scrollY,
      });
    };

    const setupScroll = () => {
      const proxy = { progress: 0 };
      return gsap.context(() => {
        gsap.to(proxy, {
          progress: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getPinnedScrollPx(config.frames)}`,
            scrub: config.frames.scrub,
            pin,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setProgress(self.progress);
              const idx = progressToFrameIndex(
                self.progress,
                frameCountRef.current
              );
              if (idx !== frameState.current) {
                scheduleDraw(idx);
              }
            },
            onRefresh: (self) => {
              scrollTriggerRef = self;
            },
          },
        });
        scrollTriggerRef = ScrollTrigger.getAll().slice(-1)[0];
      }, section);
    };

    const rebuildScroll = () => {
      ctxGsap?.revert();
      if (!reducedMotion) {
        ctxGsap = setupScroll();
        ScrollTrigger.refresh();
        resizeCanvas();
        logScrollMetrics();
      }
    };

    if (!reducedMotion) {
      ctxGsap = setupScroll();
      window.addEventListener("orientationchange", rebuildScroll);
      window.addEventListener("resize", rebuildScroll);
    } else {
      setProgress(1);
      drawFrame(frameCount);
    }

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      logScrollMetrics();
    });

    return () => {
      window.removeEventListener("orientationchange", rebuildScroll);
      window.removeEventListener("resize", rebuildScroll);
      ro.disconnect();
      resizeCanvasRef.current = null;
      if (rafDrawRef.current !== null) {
        cancelAnimationFrame(rafDrawRef.current);
      }
      ctxGsap?.revert();
    };
  }, [config, bitmaps, frameCount, reducedMotion, activeSet]);

  const staticLastFrame = reducedMotion;
  const lastSrc = getFrameSrc(
    frameCount,
    activeSet.folder,
    config.frames.extension
  );
  const { fit } = activeSet;

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative w-full max-w-full bg-[var(--color-bg)]"
      aria-label={`${config.name} story`}
    >
      <div
        ref={pinRef}
        className="relative h-[100svh] min-h-[100svh] w-full max-w-full overflow-hidden supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:min-h-[100dvh]"
      >
        {staticLastFrame ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={lastSrc}
            alt=""
            className={`block h-full w-full ${
              fit === "cover" ? "object-cover" : "object-contain"
            }`}
            aria-hidden
          />
        ) : (
          <canvas
            ref={canvasRef}
            className="block h-full w-full max-w-full"
            style={{ width: "100%", height: "100%", display: "block" }}
            aria-hidden
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[var(--color-bg)] via-transparent to-[var(--color-bg)]/40"
          aria-hidden
        />
        <StoryOverlay
          steps={config.storySteps}
          progress={progress}
          fit={fit}
          frameBottomPx={frameBottomPx}
        />
        {!reducedMotion && (
          <p className="sr-only">
            Scroll to explore how {config.name} prepares your cup. Story progress{" "}
            {Math.round(progress * 100)} percent.
          </p>
        )}
      </div>
    </section>
  );
}
