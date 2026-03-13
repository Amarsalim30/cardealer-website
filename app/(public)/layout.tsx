import type { Metadata } from "next";

import { JsonLd } from "@/components/layout/json-ld";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/config/site";
import { getLocations } from "@/lib/data/repository";
import { buildAutoDealerJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Cars for Sale in Mombasa",
  description: siteConfig.description,
});

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locations = await getLocations();
  const autoDealerJsonLd = buildAutoDealerJsonLd(locations);

  return (
    <>
      <JsonLd data={autoDealerJsonLd} />
      <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(171,110,56,0.14),_transparent_36%),linear-gradient(180deg,_#fffaf5,_#f5efe8_58%,_#f9f7f4)] text-stone-900">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
}
