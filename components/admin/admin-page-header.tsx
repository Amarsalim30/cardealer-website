import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "rounded-[30px] border border-white/70 bg-white/95 px-5 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6",
        className,
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          {backHref && backLabel ? (
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-stone-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600 transition-colors hover:bg-stone-100"
            >
              <ChevronLeft className="size-3.5" />
              {backLabel}
            </Link>
          ) : null}
          {eyebrow ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-semibold text-stone-950 sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
