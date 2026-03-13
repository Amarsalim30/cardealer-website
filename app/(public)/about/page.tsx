import type { Metadata } from "next";

import { SectionHeading } from "@/components/marketing/section-heading";
import { Card } from "@/components/ui/card";
import { homeStats } from "@/lib/config/site";
import { getReviews } from "@/lib/data/repository";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    "Learn how the dealership positions trust, fast response times, and practical support for Mombasa car buyers.",
  path: "/about",
});

export default async function AboutPage() {
  const reviews = await getReviews();

  return (
    <section className="section-shell">
      <div className="container-shell space-y-12">
        <SectionHeading
          as="h1"
          eyebrow="About and trust"
          title="Why Mombasa buyers start with Ocean Motors"
          description="Most buyers do not need a long brand story. They need clear stock, honest follow-up, and a dealership team that makes the next step obvious."
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
              What buyers notice first
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
              <li>
                Pricing, mileage, and key specs appear early, so buyers can screen cars quickly.
              </li>
              <li>
                Phone and WhatsApp contact stay close to high-intent moments instead of hiding in the footer.
              </li>
              <li>
                Finance and trade-in conversations start simply, without forcing a long application before a buyer is ready.
              </li>
            </ul>
          </Card>
          <Card className="rounded-[28px] p-8">
            <h2 className="text-2xl font-semibold text-stone-950">
              What happens after you enquire
            </h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
              <li>
                Sales confirm availability first, then guide you to the right showroom or yard.
              </li>
              <li>
                Viewings, trade-ins, and finance questions are handled as separate next steps so the conversation stays clear.
              </li>
              <li>
                Listings are kept current so buyers spend less time chasing cars that are no longer available.
              </li>
            </ul>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.id} className="rounded-[28px] p-6">
              <p className="text-sm leading-7 text-stone-700">&quot;{review.quote}&quot;</p>
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
