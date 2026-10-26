import { cafeConfig } from "@/config/cafe";
import { ScrollReveal } from "@/components/ScrollReveal";

export function VisitSection() {
  const { openingHours, address, googleMapsEmbedUrl, phone } = cafeConfig;
  const formattedAddress = `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`;

  return (
    <ScrollReveal as="section" id="visit" className="section-pad border-t border-white/10">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Visit
          </p>
          <h2 className="font-heading mt-4 text-4xl sm:text-5xl">Find us</h2>
          <address className="mt-6 not-italic leading-relaxed text-[var(--color-text)]/90">
            {formattedAddress}
          </address>
          <p className="mt-4">
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              {phone}
            </a>
          </p>
          <h3 className="mt-10 font-heading text-2xl">Opening hours</h3>
          <ul className="mt-4 space-y-2">
            {openingHours.map((row) => (
              <li
                key={row.label}
                className="flex justify-between gap-4 border-b border-white/10 py-2 text-sm sm:text-base"
              >
                <span>{row.label}</span>
                <span className="text-[var(--color-text)]/80">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title={`Map showing location of ${cafeConfig.name}`}
            src={googleMapsEmbedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </ScrollReveal>
  );
}
