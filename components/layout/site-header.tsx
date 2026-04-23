"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { navigationLinks, siteConfig } from "@/lib/config/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const desktopLinks = navigationLinks.filter(
    (link) => link.href !== "/" && link.href !== "/inventory",
  );
  const mobileLinks = navigationLinks.filter((link) => link.href !== "/");

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/92 backdrop-blur">
      <div className="container-shell flex items-center justify-between gap-3 py-2 sm:gap-6 sm:py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <Image
            src="/logo.png"
            alt={`${siteConfig.name} logo`}
            width={40}
            height={40}
            className="size-8 rounded-full border border-border object-cover sm:size-10"
            priority
          />
          <div className="min-w-0">
            <p className="truncate text-[1.18rem] font-semibold leading-none tracking-tight text-text-primary sm:text-xl">
              {siteConfig.shortName}
            </p>
            <p className="hidden text-xs uppercase tracking-[0.24em] text-text-secondary sm:block">
              Mombasa dealership
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {desktopLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={siteConfig.phoneHref}
            className="flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <Phone className="size-4" />
            {siteConfig.phoneDisplay}
          </a>
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="h-9 border-border/70 bg-surface/60 px-3.5 text-text-secondary shadow-none hover:bg-surface-elevated hover:text-text-primary"
          >
            <Link href="/inventory">Inventory</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-surface text-text-primary transition-colors hover:bg-surface-elevated sm:size-11"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface/95 lg:hidden">
          <div className="container-shell flex flex-col gap-2.5 py-3">
            <div className="grid gap-3">
              <Button asChild variant="secondary" className="h-11">
                <a href={siteConfig.phoneHref}>
                  <Phone className="size-4" />
                  {siteConfig.phoneDisplay}
                </a>
              </Button>
            </div>
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-elevated hover:text-text-primary"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
