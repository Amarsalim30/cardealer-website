import Link from "next/link";

import { navigationLinks, siteConfig } from "@/lib/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-stone-950 text-stone-200">
      <div className="container-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div className="space-y-4">
          <p className="display-font text-3xl text-white">{siteConfig.name}</p>
          <p className="max-w-lg text-sm leading-7 text-stone-400">
            Used, imported, and traded-in vehicles with clearer listings, faster
            response times, and a practical buying process.
          </p>
          <div className="space-y-1 text-sm text-stone-300">
            <p>{siteConfig.address}</p>
            <p>{siteConfig.phoneDisplay}</p>
            <p>{siteConfig.salesEmail}</p>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-stone-400">
            Explore
          </p>
          <div className="grid gap-3 text-sm text-stone-300">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-stone-400">
            Hours
          </p>
          <div className="space-y-2 text-sm text-stone-300">
            <p>{siteConfig.hoursLabel}</p>
            <p>Sunday by appointment</p>
            <p>WhatsApp and phone support available throughout the day.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
