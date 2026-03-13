import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AdminUnavailableState({
  title,
  description,
  retryHref = ".",
  backHref = "/admin/vehicles",
}: {
  title: string;
  description: string;
  retryHref?: string;
  backHref?: string;
}) {
  return (
    <Card className="rounded-[24px] border border-red-200 bg-red-50/70 p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
        Admin unavailable
      </p>
      <h3 className="mt-3 text-xl font-semibold text-stone-950">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-700">
        {description}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="sm">
          <Link href={retryHref}>Retry</Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href={backHref}>Back to inventory</Link>
        </Button>
      </div>
    </Card>
  );
}
