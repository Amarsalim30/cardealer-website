import type { Metadata } from "next";

import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Financing",
  description:
    "Ask about financing options, pricing guidance, and next steps for a vehicle purchase.",
  path: "/financing",
});

export default async function FinancingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const vehicleTitle =
    typeof params.vehicle === "string"
      ? params.vehicle.replaceAll("-", " ")
      : undefined;

  return (
    <section className="section-shell">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <SectionHeading
              as="h1"
              eyebrow="Financing"
              title="Get finance guidance before you commit to a car"
              description="Ask about deposit range, likely monthly plan, and the documents you will need before you come in. The goal is clarity, not paperwork."
            />
            <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
              <p className="font-semibold text-stone-950">What buyers usually want</p>
              <ul className="mt-4 space-y-2">
                <li>Deposit guidance before they spend time visiting the wrong car.</li>
                <li>Rough monthly payment direction based on budget and vehicle choice.</li>
                <li>Clear follow-up on documents, approval steps, and timing.</li>
              </ul>
            </Card>
            <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
              <p className="font-semibold text-stone-950">What happens next</p>
              <ul className="mt-4 space-y-2">
                <li>Share the vehicle or budget you have in mind.</li>
                <li>Sales respond with the clearest next step, not a long form journey.</li>
                <li>Once the numbers make sense, the team helps you move to viewing and paperwork.</li>
              </ul>
            </Card>
          </div>
          <div className="lg:sticky lg:top-28">
            <LeadCaptureForm
              title="Ask about financing"
              description="Share your preferred car, deposit range, or monthly budget and the team will reply with the clearest next step."
              leadType="financing"
              source="Financing page"
              vehicleTitle={vehicleTitle}
              submitLabel="Ask About Financing"
            />
          </div>
        </div>
      </section>
    );
}
