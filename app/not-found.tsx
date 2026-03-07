import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="section-shell">
      <div className="container-shell">
        <Card className="mx-auto max-w-2xl rounded-[32px] p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Not found
          </p>
          <h1 className="mt-4 display-font text-4xl text-stone-950">
            That page is no longer available.
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Return to the homepage or go straight to current inventory.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/inventory">Browse inventory</Link>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
