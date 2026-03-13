import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <Card className="w-full rounded-[32px] border border-border/80 bg-white p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Admin not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-stone-950">
          That admin page is unavailable.
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Return to inventory or jump back to the leads inbox.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/admin/vehicles">Inventory workspace</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/leads">Lead inbox</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
