import { cafeConfig } from "@/config/cafe";
import { ScrollReveal } from "@/components/ScrollReveal";

export function AboutSection() {
  const { name, about, tagline } = cafeConfig;

  return (
    <ScrollReveal as="section" id="about" className="section-pad">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
          About
        </p>
        <h2 className="font-heading mt-4 text-4xl sm:text-5xl">{name}</h2>
        <p className="mt-3 text-lg text-[var(--color-text)]/80">{tagline}</p>
        <p className="mt-8 text-base leading-relaxed text-[var(--color-text)]/90 sm:text-lg">
          {about}
        </p>
      </div>
    </ScrollReveal>
  );
}
