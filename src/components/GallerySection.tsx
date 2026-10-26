import Image from "next/image";
import { cafeConfig } from "@/config/cafe";
import { ScrollReveal } from "@/components/ScrollReveal";

export function GallerySection() {
  const { gallery } = cafeConfig;

  return (
    <ScrollReveal as="section" id="gallery" className="section-pad border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Gallery
          </p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">Inside the bloom</h2>
        </div>
        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((img) => (
            <li
              key={img.src}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 sm:aspect-[4/3]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </li>
          ))}
        </ul>
      </div>
    </ScrollReveal>
  );
}
