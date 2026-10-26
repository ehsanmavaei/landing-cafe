import type { MetadataRoute } from "next";
import { cafeConfig } from "@/config/cafe";

export default function robots(): MetadataRoute.Robots {
  const base = cafeConfig.seo.siteUrl;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
