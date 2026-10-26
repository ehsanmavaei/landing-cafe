import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { cafeConfig } from "@/config/cafe";
import { buildLocalBusinessJsonLd } from "@/lib/jsonld";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const { seo, colors, name } = cafeConfig;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: seo.title,
  description: seo.description,
  openGraph: {
    title: seo.title,
    description: seo.description,
    url: seo.siteUrl,
    siteName: name,
    locale: "en_US",
    type: "website",
    images: [{ url: seo.ogImage, width: 1200, height: 630, alt: name }],
  },
  twitter: {
    card: "summary_large_image",
    title: seo.title,
    description: seo.description,
    images: [seo.ogImage],
  },
  alternates: {
    canonical: seo.siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = buildLocalBusinessJsonLd(cafeConfig);
  const themeCss = `:root{--color-bg:${colors.bg};--color-text:${colors.text};--color-accent:${colors.accent}}`;

  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
