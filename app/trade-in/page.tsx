import type { Metadata } from "next";

import { TradeInForm } from "@/components/forms/trade-in-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Trade-In",
  description:
    "Value your trade and start a dealership conversation with the basic information sales staff actually need.",
  path: "/trade-in",
});

export default async function TradeInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const desiredVehicleTitle =
    typeof params.vehicle === "string"
      ? params.vehicle.replaceAll("-", " ")
      : undefined;

  return (
    <section className="section-shell">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading
            eyebrow="Trade-in"
            title="Use trade-ins to open the next conversation faster"
            description="The form stays lean: just enough to estimate fit, guide the next step, and keep the process low-friction."
          />
          <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
            <p className="font-semibold text-stone-950">Recommended information</p>
            <ul className="mt-4 space-y-2">
              <li>Current make, model, year, and mileage.</li>
              <li>Condition notes that affect valuation confidence.</li>
              <li>The replacement vehicle the buyer has in mind, if any.</li>
            </ul>
          </Card>
        </div>
        <TradeInForm
          desiredVehicleTitle={desiredVehicleTitle}
          source="Trade-in page"
        />
      </div>
    </section>
  );
}
