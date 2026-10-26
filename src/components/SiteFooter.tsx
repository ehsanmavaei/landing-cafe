import { cafeConfig } from "@/config/cafe";

export function SiteFooter() {
  const { name, tagline, instagram, phone, address } = cafeConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-heading text-2xl">{name}</p>
          <p className="mt-1 text-sm text-[var(--color-text)]/70">{tagline}</p>
          <p className="mt-2 text-sm text-[var(--color-text)]/60">
            {address.street}, {address.city}
          </p>
        </div>
        <nav aria-label="Social links" className="flex flex-wrap justify-center gap-6">
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Instagram
          </a>
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-sm text-[var(--color-text)]/80 underline-offset-4 hover:underline"
          >
            Call
          </a>
        </nav>
      </div>
      <p
        className="mx-auto mt-8 max-w-6xl text-center text-xs text-[var(--color-text)]/50"
        suppressHydrationWarning
      >
        © {year} {name}. All rights reserved.
      </p>
    </footer>
  );
}
