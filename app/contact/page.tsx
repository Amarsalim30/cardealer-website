import type { Metadata } from "next";

import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { getLocations } from "@/lib/data/repository";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact the dealership, review location details, and send a short enquiry from the contact page.",
  path: "/contact",
});

export default async function ContactPage() {
  const locations = await getLocations();

  return (
    <section className="section-shell">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Contact and locations"
          title="Make it easy to call, WhatsApp, or visit the showroom"
          description="Local dealership sites convert better when location, hours, and direct contact remain obvious and easy to trust."
        />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-5">
            {locations.map((location) => (
              <Card key={location.id} className="rounded-[28px] p-6">
                <h2 className="text-xl font-semibold text-stone-950">
                  {location.name}
                </h2>
                <div className="mt-4 space-y-2 text-sm leading-7 text-stone-600">
                  <p>{location.addressLine}</p>
                  <p>{location.city}</p>
                  <p>{location.phone}</p>
                  {location.email ? <p>{location.email}</p> : null}
                  <p>{location.hours}</p>
                </div>
              </Card>
            ))}
          </div>
          <LeadCaptureForm
            title="Send a general enquiry"
            description="Ask about stock, opening hours, directions, or the next best vehicle for your budget."
            leadType="contact"
            source="Contact page"
            submitLabel="Send Enquiry"
          />
        </div>
      </div>
    </section>
  );
}
