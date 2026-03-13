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
              as="h1"
              eyebrow="Trade-in"
              title="Trade in your current car without slowing down the next deal"
              description="Send the basics first. Sales can estimate fit, ask for anything missing, and tell you whether it makes sense to move forward."
            />
            <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
              <p className="font-semibold text-stone-950">Recommended information</p>
              <ul className="mt-4 space-y-2">
                <li>Current make, model, year, and mileage.</li>
                <li>Condition notes that affect valuation confidence.</li>
                <li>The replacement vehicle the buyer has in mind, if any.</li>
              </ul>
            </Card>
            <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
              <p className="font-semibold text-stone-950">What to expect after you submit</p>
              <ul className="mt-4 space-y-2">
                <li>The team reviews the vehicle details before calling you back.</li>
                <li>You can share photos later if they are needed for a firmer valuation.</li>
                <li>If the numbers work, sales help you move straight into the next car conversation.</li>
              </ul>
            </Card>
          </div>
          <div className="lg:sticky lg:top-28">
            <TradeInForm
              desiredVehicleTitle={desiredVehicleTitle}
              source="Trade-in page"
            />
          </div>
        </div>
      </section>
    );
}
