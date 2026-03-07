import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { JsonLd } from "@/components/layout/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/config/site";
import { buildAutoDealerJsonLd, buildMetadata } from "@/lib/seo";
import { getLocations } from "@/lib/data/repository";

const bodyFont = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = buildMetadata({
  title: "Cars for Sale in Nairobi",
  description: siteConfig.description,
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locations = await getLocations();
  const autoDealerJsonLd = buildAutoDealerJsonLd(locations);

  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased`}>
        <JsonLd data={autoDealerJsonLd} />
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(171,110,56,0.14),_transparent_36%),linear-gradient(180deg,_#fffaf5,_#f5efe8_58%,_#f9f7f4)] text-stone-900">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
