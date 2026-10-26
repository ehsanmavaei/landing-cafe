"use client";

import { cafeConfig } from "@/config/cafe";

type LoadingScreenProps = {
  progress: number;
  visible: boolean;
};

export function LoadingScreen({ progress, visible }: LoadingScreenProps) {
  if (!visible) return null;

  const { name, tagline, colors } = cafeConfig;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 transition-opacity duration-500"
      style={{ backgroundColor: colors.bg, color: colors.text }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading ${name}`}
    >
      <p className="font-heading text-3xl tracking-tight sm:text-4xl">{name}</p>
      <p className="mt-2 text-sm opacity-80 sm:text-base">{tagline}</p>
      <div className="mt-10 w-full max-w-xs">
        <div
          className="h-1 w-full overflow-hidden rounded-full opacity-30"
          style={{ backgroundColor: colors.text }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.accent,
            }}
          />
        </div>
        <p className="mt-3 text-center font-mono text-sm tabular-nums opacity-90">
          {progress}%
        </p>
      </div>
    </div>
  );
}
