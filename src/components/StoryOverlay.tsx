"use client";

import type { StoryStep } from "@/config/cafe";

type StoryOverlayProps = {
  steps: StoryStep[];
  progress: number;
  /** Bottom edge of visible frame (px from hero top); keeps copy off the cup */
  frameBottomPx?: number;
};

function stepOpacity(step: StoryStep, progress: number): number {
  const { startProgress, endProgress } = step;
  const mid = (startProgress + endProgress) / 2;
  const fadeInEnd = startProgress + (mid - startProgress) * 0.35;
  const fadeOutStart = endProgress - (endProgress - mid) * 0.35;

  if (progress < startProgress || progress > endProgress) return 0;
  if (progress <= fadeInEnd) {
    return (progress - startProgress) / (fadeInEnd - startProgress);
  }
  if (progress >= fadeOutStart) {
    return (endProgress - progress) / (endProgress - fadeOutStart);
  }
  return 1;
}

export function StoryOverlay({
  steps,
  progress,
  frameBottomPx,
}: StoryOverlayProps) {
  const belowFrame = frameBottomPx != null;
  const textTop = belowFrame ? frameBottomPx + 24 : undefined;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[2] px-6 text-center"
      style={
        belowFrame
          ? { top: textTop, bottom: "auto", maxHeight: `calc(100% - ${textTop}px)` }
          : { bottom: "4rem", top: "auto" }
      }
      aria-hidden
    >
      <div className="relative mx-auto min-h-[3rem] w-full max-w-4xl sm:min-h-[4rem]">
        {steps.map((step) => {
          const opacity = stepOpacity(step, progress);
          return (
            <p
              key={step.text}
              className="font-heading absolute inset-x-0 top-0 text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl"
              style={{
                opacity,
                transform: `translateY(${(1 - opacity) * 12}px)`,
                transition: "opacity 0.15s linear, transform 0.15s linear",
              }}
            >
              {step.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}
