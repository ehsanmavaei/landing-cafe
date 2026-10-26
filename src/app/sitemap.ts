import type { MetadataRoute } from "next";
import { cafeConfig } from "@/config/cafe";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = cafeConfig.seo.siteUrl;
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
