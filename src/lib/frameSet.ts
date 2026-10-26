import type { CafeConfig } from "@/config/cafe";
import type { MutableRefObject } from "react";

export type FrameSetConfig = CafeConfig["frames"]["mobile"];

export type ResolvedFrameStrategy = {
  set: FrameSetConfig;
};

export function isPortraitViewport(): boolean {
  return window.innerHeight > window.innerWidth;
}

export async function probeFrameSetAvailable(
  folder: string,
  extension: string
): Promise<boolean> {
  const url = `${folder}/f_0001.${extension}`;
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (res.ok) return true;
    if (res.status === 404) {
      console.error(`Frame set probe 404: f_0001.${extension} in ${folder}`);
    }
  } catch {
    /* network / HEAD unsupported — fall through to image probe */
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => {
      console.error(`Frame set probe failed: f_0001.${extension} in ${folder}`);
      resolve(false);
    };
    img.src = url;
  });
}

export async function resolveFrameStrategy(
  frames: CafeConfig["frames"],
  desktopKnownRef?: MutableRefObject<boolean | null>
): Promise<ResolvedFrameStrategy> {
  const portrait = isPortraitViewport();

  if (portrait) {
    return { set: frames.mobile };
  }

  let desktopReady = desktopKnownRef?.current ?? null;
  if (desktopReady === null) {
    desktopReady = await probeFrameSetAvailable(
      frames.desktop.folder,
      frames.extension
    );
    if (desktopKnownRef) desktopKnownRef.current = desktopReady;
  }

  if (desktopReady) {
    return { set: frames.desktop };
  }

  return { set: frames.mobile };
}
