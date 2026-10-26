"use client";

import { useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cafeConfig } from "@/config/cafe";
import { useFramePreloader } from "@/hooks/useFramePreloader";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HeroCanvas } from "@/components/HeroCanvas";
import { AboutSection } from "@/components/AboutSection";
import { MenuSection } from "@/components/MenuSection";
import { GallerySection } from "@/components/GallerySection";
import { VisitSection } from "@/components/VisitSection";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingContact } from "@/components/FloatingContact";

gsap.registerPlugin(ScrollTrigger);

async function refreshScrollTriggers() {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }
  ScrollTrigger.refresh(true);
}

export function CafePage() {
  const reducedMotion = usePrefersReducedMotion();
  const motionKnown = reducedMotion !== null;

  const {
    ready,
    progress,
    bitmaps,
    frameCount,
    activeSet,
    strategyKey,
  } = useFramePreloader(
    cafeConfig,
    reducedMotion === true,
    motionKnown
  );

  const showContent = motionKnown && ready;

  const refreshLayout = useCallback(() => {
    refreshScrollTriggers().catch(console.error);
  }, []);

  useEffect(() => {
    if (!showContent) return;

    if (window.scrollY !== 0) {
      window.scrollTo(0, 0);
    }

    const id = requestAnimationFrame(() => {
      refreshLayout();
    });
    return () => cancelAnimationFrame(id);
  }, [showContent, refreshLayout]);

  useEffect(() => {
    if (!showContent || !strategyKey) return;
    refreshLayout();
  }, [showContent, strategyKey, refreshLayout]);

  return (
    <>
      <LoadingScreen progress={progress} visible={!showContent} />
      <div className="relative w-full max-w-full overflow-x-hidden">
        <header className="sr-only">
          <h1>{cafeConfig.name}</h1>
          <p>{cafeConfig.tagline}</p>
        </header>
        <HeroCanvas
          config={cafeConfig}
          bitmaps={bitmaps}
          frameCount={frameCount}
          activeSet={activeSet}
          reducedMotion={reducedMotion === true}
          contentVisible={showContent}
        />
        <main>
          <AboutSection />
          <MenuSection />
          <GallerySection />
          <VisitSection />
        </main>
        <SiteFooter />
        <FloatingContact />
      </div>
    </>
  );
}
