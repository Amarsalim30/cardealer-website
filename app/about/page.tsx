import type { Metadata } from "next";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { homeStats } from "@/lib/config/site";
import { getReviews } from "@/lib/data/repository";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Learn how the dealership positions trust, fast response times, and practical support for Nairobi car buyers.",
  path: "/about",
});

export default async function AboutPage() {
  const reviews = await getReviews();

  return (
    <section className="section-shell">
      <div className="container-shell space-y-12">
        <SectionHeading
          eyebrow="About and trust"
          title="A dealership experience designed around confidence, not clutter"
          description="The MVP focuses on what actually helps buyers convert: clear inventory, honest contact options, and a buying process that feels guided rather than noisy."
          align="center"
        />

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Delivered units
            </p>
            <p className="mt-4 text-4xl font-semibold text-stone-950">
              {homeStats.deliveredCount}+
            </p>
          </Card>
          <Card className="rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Finance support
            </p>
            <p className="mt-4 text-4xl font-semibold text-stone-950">
              {homeStats.financePartners}
            </p>
          </Card>
          <Card className="rounded-[28px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Typical response
            </p>
            <p className="mt-4 text-4xl font-semibold text-stone-950">
              {homeStats.responseTime}
            </p>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[28px] p-8">
            <h2 className="text-2xl font-semibold text-stone-950">
              Why buyers trust the process
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
              <li>
                Listings stay structured and readable instead of hiding key facts
                under visual noise.
              </li>
              <li>
                WhatsApp and phone contact remain visible at every high-intent
                moment.
              </li>
              <li>
                Finance and trade-in routes are treated as conversion paths, not
                secondary links.
              </li>
            </ul>
          </Card>
          <Card className="rounded-[28px] p-8">
            <h2 className="text-2xl font-semibold text-stone-950">
              Operational posture
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
              <li>Keep inventory current with clear publish and sold states.</li>
              <li>
                Use featured placement sparingly so important units still stand out.
              </li>
              <li>
                Follow up quickly on leads instead of trying to over-automate the
                workflow.
              </li>
            </ul>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="rounded-[28px] p-6">
              <p className="text-sm leading-7 text-stone-700">“{review.quote}”</p>
              <p className="mt-6 font-semibold text-stone-950">
                {review.customerName}
              </p>
              <p className="text-sm text-stone-500">{review.vehicleLabel}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
