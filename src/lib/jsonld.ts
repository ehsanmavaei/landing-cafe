import type { CafeConfig } from "@/config/cafe";

export function buildLocalBusinessJsonLd(config: CafeConfig) {
  const { address, openingHours, phone, seo } = config;
  const fullAddress = `${address.street}, ${address.city}, ${address.region} ${address.postalCode}`;

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: config.name,
    description: seo.description,
    url: seo.siteUrl,
    telephone: phone,
    image: `${seo.siteUrl}${seo.ogImage}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    openingHoursSpecification: openingHours.map((row) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "22:00",
      description: `${row.label}: ${row.hours}`,
    })),
    sameAs: [config.instagram],
    servesCuisine: "Coffee shop",
    priceRange: "$$",
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    hasMap: config.googleMapsEmbedUrl,
    menu: `${seo.siteUrl}#menu`,
    ...(fullAddress ? {} : {}),
  };
}
