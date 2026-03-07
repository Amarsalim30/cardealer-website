"use client";

import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { navigationLinks, siteConfig } from "@/lib/config/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-[#fff8f2]/90 backdrop-blur">
      <div className="container-shell flex items-center justify-between gap-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-stone-900 text-white">
            SD
          </div>
          <div>
            <p className="display-font text-xl leading-none tracking-wide text-stone-900">
              {siteConfig.shortName}
            </p>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Nairobi showroom
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-stone-700 transition-colors hover:text-stone-950"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={siteConfig.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-stone-700"
          >
            <Phone className="size-4" />
            {siteConfig.phoneDisplay}
          </a>
          <Button asChild size="sm">
            <Link href="/inventory">View Inventory</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-border text-stone-900 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border bg-white/95 lg:hidden">
          <div className="container-shell flex flex-col gap-2 py-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={siteConfig.phoneHref}
              className="rounded-2xl border border-border px-4 py-3 text-sm font-medium text-stone-700"
            >
              Call {siteConfig.phoneDisplay}
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
