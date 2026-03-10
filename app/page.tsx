import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/layout/json-ld";
import { FloatingWhatsAppButton } from "@/components/marketing/floating-whatsapp-button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";
import {
  getHomepageCollections,
  getLocations,
  getReviews,
} from "@/lib/data/repository";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/utils";

export default async function Home() {
  const [collections, reviews, locations] = await Promise.all([
    getHomepageCollections(),
    getReviews(),
    getLocations(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]);
  const homepageWhatsAppUrl = buildWhatsAppUrl(
    "Hi, I would like help choosing a vehicle.",
    siteConfig.whatsappNumber,
  );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <section className="section-shell pb-8 pt-2">
        <div className="container-shell">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div className="space-y-5 lg:space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
                Mombasa showroom
              </p>
              <h1 className="display-font max-w-2xl text-balance text-4xl leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
                Find quality cars in Mombasa without the usual friction.
              </h1>
              <p className="max-w-[36rem] text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                Used, imported, and traded-in vehicles with cleaner details and
                faster ways to contact sales.
              </p>
            </div>

            <div className="relative flex min-h-[280px] items-center justify-center sm:min-h-[340px] lg:min-h-[500px]">
              <div className="absolute inset-x-8 bottom-14 h-24 rounded-full bg-[radial-gradient(circle,_rgba(165,90,42,0.18)_0%,_rgba(165,90,42,0.03)_68%,_transparent_100%)] blur-3xl" />
              <div className="absolute inset-x-16 bottom-10 h-10 rounded-full bg-stone-950/10 blur-2xl" />
              <Image
                src="/carHero.png"
                alt="Toyota Land Cruiser Prado hero"
                width={1400}
                height={900}
                priority
                className="relative z-10 mx-auto w-full max-w-[640px] object-contain drop-shadow-[0_28px_34px_rgba(61,39,14,0.16)] lg:translate-x-6"
              />
            </div>
          </div>

          <div className="relative z-20 mt-6 space-y-5 lg:-mt-14">
            <form
              action="/inventory"
              className="surface-card grid gap-2 rounded-[28px] border border-white/70 bg-white/92 p-3 shadow-[0_22px_55px_rgba(61,39,14,0.1)] backdrop-blur sm:grid-cols-2 sm:gap-3 sm:p-4 xl:grid-cols-[1.25fr_repeat(3,minmax(0,0.82fr))_auto]"
            >
              <input
                name="q"
                placeholder="Search by make, model, or keyword"
                className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-primary/40"
              />
              <select
                name="make"
                className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition-colors focus:border-primary/40"
                defaultValue=""
              >
                <option value="">Any make</option>
                <option value="Toyota">Toyota</option>
                <option value="Land Rover">Land Rover</option>
                <option value="Mazda">Mazda</option>
                <option value="Subaru">Subaru</option>
                <option value="Nissan">Nissan</option>
                <option value="BMW">BMW</option>
                <option value="Ford">Ford</option>
              </select>
              <select
                name="category"
                className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition-colors focus:border-primary/40"
                defaultValue=""
              >
                <option value="">All categories</option>
                <option value="used">Used</option>
                <option value="new">New</option>
                <option value="imported">Imported</option>
                <option value="traded-in">Traded-in</option>
              </select>
              <select
                name="sort"
                className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm outline-none transition-colors focus:border-primary/40"
                defaultValue="latest"
              >
                <option value="latest">Latest stock</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
              <Button
                type="submit"
                className="h-11 px-5 sm:col-span-2 xl:col-span-1"
              >
                Search Inventory
              </Button>
            </form>
          </div>

          {/* <Card className="rounded-[32px] border border-stone-900 bg-stone-950 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">
              Why buyers convert here
            </p>
            <div className="mt-6 space-y-6">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <ShieldCheck className="size-8 text-[#f8be8d]" />
                <h2 className="mt-4 text-xl font-semibold">
                  Clearer trust signals
                </h2>
                <p className="mt-2 text-sm leading-7 text-stone-300">
                  Each listing leads with availability, specs, location, and fast
                  contact options instead of clutter.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <Phone className="size-6 text-[#f8be8d]" />
                  <p className="mt-4 font-semibold">Direct call support</p>
                  <p className="mt-2 text-sm text-stone-300">
                    Sales lines stay open for same-day stock checks and viewing
                    planning.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <Clock3 className="size-6 text-[#f8be8d]" />
                  <p className="mt-4 font-semibold">Fast response</p>
                  <p className="mt-2 text-sm text-stone-300">
                    Phone and WhatsApp remain visible throughout the journey.
                  </p>
                </div>
              </div>
            </div>
          </Card> */}
        </div>
      </section>

      <section className="section-shell pt-6">
        <div className="container-shell space-y-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="Featured listings"
              title="Top Picks From Our Current Inventory"
              description="Browse our most requested cars in Mombasa. Clean imports, trusted trade-ins, and quick WhatsApp access to pricing and availability."
            />
            <Button asChild variant="secondary">
              <Link href="/inventory">Browse all inventory</Link>
            </Button>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {collections.featured.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white/50">
        <div className="container-shell grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[30px] p-8">
            <SectionHeading
              eyebrow="Financing"
              title="Short financing enquiries, practical follow-up"
              description="The financing path stays simple: ask about pricing, affordability, and next steps without turning the website into a banking workflow."
            />
            <Button asChild className="mt-8">
              <Link href="/financing">Ask About Financing</Link>
            </Button>
          </Card>
          <Card className="rounded-[30px] p-8">
            <SectionHeading
              eyebrow="Trade-in"
              title="Use trade-ins as a conversion path, not an afterthought"
              description="Buyers can share their current vehicle details in one quick form, giving sales staff a stronger opening for follow-up."
            />
            <Button asChild className="mt-8">
              <Link href="/trade-in">Value Your Trade</Link>
            </Button>
          </Card>
        </div>
      </section>

      <section className="section-shell">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Delivered units"
            title="Sold and delivered stock keeps trust visible"
            description="Social proof works better when it is grounded in real-looking inventory rather than generic claims."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {collections.sold.length ? (
              collections.sold.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))
            ) : (
              <Card className="rounded-[28px] p-6 md:col-span-3">
                <p className="text-sm leading-7 text-stone-600">
                  Delivered and sold units will appear here as inventory updates are
                  published.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell bg-white/50">
        <div className="container-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Testimonials"
            title="Trust-building copy stays close to the buyer journey"
            description="Reviews reinforce responsiveness, clarity, and confidence instead of chasing empty brand language."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id} className="rounded-[28px] p-6">
                <p className="text-lg leading-8 text-stone-700">&quot;{review.quote}&quot;</p>
                <p className="mt-6 font-semibold text-stone-950">
                  {review.customerName}
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  {review.vehicleLabel}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-28 sm:pb-24">
        <div className="container-shell">
          <Card className="rounded-[34px] border border-stone-900 bg-stone-950 px-8 py-10 text-white">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                  Contact strip
                </p>
                <h2 className="mt-4 display-font text-4xl">
                  Ready to shortlist a vehicle or ask about availability?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
                  {locations[0]?.name || "Mombasa Showroom"} is open during
                  business hours, and WhatsApp support is available for fast
                  inventory questions.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link href="/inventory">View Inventory</Link>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <FloatingWhatsAppButton whatsappUrl={homepageWhatsAppUrl} />
    </>
  );
}
