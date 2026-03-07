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
            eyebrow="Financing"
            title="Keep financing conversations short, clear, and action-oriented"
            description="The MVP does not turn into a loan portal. It simply captures buyer intent and the context sales staff need for a good follow-up."
          />
          <Card className="rounded-[28px] p-6 text-sm leading-7 text-stone-600">
            <p className="font-semibold text-stone-950">What buyers usually want</p>
            <ul className="mt-4 space-y-2">
              <li>Rough affordability guidance based on deposit expectations.</li>
              <li>Clarity on required documents and expected follow-up.</li>
              <li>Confidence that they can ask first and complete paperwork later.</li>
            </ul>
          </Card>
        </div>
        <LeadCaptureForm
          title="Ask about financing"
          description="Share your contact details and what you need to know. The team will follow up with the practical next steps."
          leadType="financing"
          source="Financing page"
          vehicleTitle={vehicleTitle}
          submitLabel="Ask About Financing"
        />
      </div>
    </section>
  );
}
