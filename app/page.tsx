import Image from "next/image";
import Link from "next/link";
import {
  CircleGauge,
  Cog,
  Fuel,
  Phone,
} from "lucide-react";

import { JsonLd } from "@/components/layout/json-ld";
import { FloatingWhatsAppButton } from "@/components/marketing/floating-whatsapp-button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { siteConfig } from "@/lib/config/site";
import {
  getAllVehicles,
  getHomepageCollections,
  getLocations,
  getReviews,
} from "@/lib/data/repository";
import { buildBreadcrumbJsonLd } from "@/lib/seo";
import {
  buildVehicleUrl,
  buildWhatsAppUrl,
} from "@/lib/utils";
import type { Vehicle } from "@/types/dealership";

type DeliveredFallbackSeed = {
  vehicleSlug: string;
  deliveryLabel: string;
};

type DeliveredVehicleCardData = {
  id: string;
  title: string;
  year: string;
  imageUrl: string | null;
  deliveryLabel: string;
};

const deliveredFallbackSeeds: DeliveredFallbackSeed[] = [
  {
    vehicleSlug: "2013-toyota-land-cruiser-prado",
    deliveryLabel: "Recently delivered in Mombasa",
  },
  {
    vehicleSlug: "2016-mazda-cx-5",
    deliveryLabel: "Collected from the showroom",
  },
  {
    vehicleSlug: "2014-toyota-fielder",
    deliveryLabel: "Delivered after financing approval",
  },
];

function getShowcaseStockLabel(vehicle: Vehicle) {
  switch (vehicle.stockCategory) {
    case "imported":
    case "available_for_importation":
      return "Imported";
    case "used":
    case "traded_in":
      return "Local Used";
    case "new":
    default:
      return "New Arrival";
  }
}

function getShowcaseEngineLabel(vehicle: Vehicle) {
  const engine = vehicle.engineCapacity?.trim();

  if (engine) {
    return /cc|l/i.test(engine) ? engine : `${engine} Cc`;
  }

  return `${Math.max(1, Math.round(vehicle.mileage / 1000))}k km`;
}

function getShowcasePrice(value: number) {
  return `KSh ${new Intl.NumberFormat("en-KE", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function getShowcaseTitle(vehicle: Vehicle) {
  const matched = vehicle.title.trim().match(/^(\d{4})\s+(.+)$/);

  if (matched) {
    return {
      year: matched[1],
      title: matched[2],
    };
  }

  return {
    year: String(vehicle.year),
    title: vehicle.title,
  };
}

function mapVehicleToDeliveredCard(
  vehicle: Vehicle,
  deliveryLabel: string,
): DeliveredVehicleCardData {
  const displayTitle = getShowcaseTitle(vehicle);

  return {
    id: vehicle.id,
    title: displayTitle.title,
    year: displayTitle.year,
    imageUrl: vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null,
    deliveryLabel,
  };
}

function DeliveredVehicleCard({
  vehicle,
}: {
  vehicle: DeliveredVehicleCardData;
}) {
  return (
    <Card className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_30px_rgba(28,25,23,0.06)]">
      <div className="relative aspect-[16/11] overflow-hidden bg-stone-200">
        {vehicle.imageUrl ? (
          <Image
            src={vehicle.imageUrl}
            alt={`${vehicle.year} ${vehicle.title}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f5f5f4,white)] px-6 text-center text-sm leading-7 text-stone-500">
            Photo coming soon
          </div>
        )}
        <div className="absolute left-4 top-4 rounded-full bg-emerald-600/92 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(5,150,105,0.22)] backdrop-blur-sm">
          Delivered
        </div>
      </div>

      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          {vehicle.deliveryLabel}
        </p>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
            {vehicle.year}
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-stone-950">
            {vehicle.title}
          </h3>
        </div>
      </div>
    </Card>
  );
}

export default async function Home() {
  const [collections, reviews, locations, vehicles] = await Promise.all([
    getHomepageCollections(),
    getReviews(),
    getLocations(),
    getAllVehicles(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]);
  const homepageWhatsAppUrl = buildWhatsAppUrl(
    "Hi, I would like help choosing a vehicle.",
    siteConfig.whatsappNumber,
  );
  const featuredShowcaseVehicles = [
    ...collections.featured,
    ...collections.latest,
  ].filter(
    (vehicle, index, vehicles) =>
      vehicles.findIndex((item) => item.id === vehicle.id) === index,
  );
  const deliveredShowcaseVehicles = collections.sold.length
    ? collections.sold
        .slice(0, 3)
        .map((vehicle) => mapVehicleToDeliveredCard(vehicle, "Recently delivered"))
    : deliveredFallbackSeeds
        .map((item) => {
          const matchedVehicle = vehicles.find(
            (vehicle) => vehicle.slug === item.vehicleSlug,
          );

          return matchedVehicle
            ? mapVehicleToDeliveredCard(matchedVehicle, item.deliveryLabel)
            : null;
        })
        .filter(
          (vehicle): vehicle is DeliveredVehicleCardData => vehicle !== null,
        );

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      <main className="homepage-flow">
        <section className="section-shell">
          <div className="container-shell">
            <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-start lg:gap-9">
              <div className="space-y-5 lg:space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-primary/80">
                  Mombasa dealership
                </p>
                <h1 className="display-font max-w-2xl text-balance text-4xl leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
                  Browse Cars Available in Mombasa Today.
                </h1>
                <p className="max-w-[36rem] text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
                  SUVs, sedans, and imported units ready for inspection. Compare
                  vehicles, check details, and contact our team instantly.
                </p>
              </div>

              <div className="relative flex min-h-[250px] items-center justify-center sm:min-h-[310px] lg:min-h-[450px]">
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

            <div className="relative z-20 mt-5 space-y-4 lg:-mt-12">
              <form
                action="/inventory"
                className="surface-card grid gap-2 rounded-[28px] border border-white/70 bg-white/92 p-3 shadow-[0_22px_55px_rgba(61,39,14,0.1)] backdrop-blur sm:grid-cols-2 sm:gap-3 sm:p-4 xl:grid-cols-[1.25fr_repeat(3,minmax(0,0.82fr))_auto]"
              >
                <input
                  name="q"
                  placeholder="Search Toyota, Prado, Land Cruiser..."
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

        <section className="section-shell">
          <div className="container-shell space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow={collections.featured.length ? "Featured listings" : "Latest arrivals"}
                title="Cars buyers can enquire about in one click"
                description="Quickly browse vehicles ready for viewing in Mombasa. Tap View Details or contact us instantly on WhatsApp."
              />
              <Button asChild variant="secondary">
                <Link href="/inventory">Browse all inventory</Link>
              </Button>
            </div>

            {featuredShowcaseVehicles.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
                {featuredShowcaseVehicles.slice(0, 8).map((vehicle) => {
                  const primaryImage =
                    vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null;
                  const detailsUrl = buildVehicleUrl(vehicle);
                  const whatsappUrl = buildWhatsAppUrl(
                    `Hi, I am interested in the ${vehicle.title}. Please share availability, price, and viewing options.`,
                    siteConfig.whatsappNumber,
                  );
                  const displayTitle = getShowcaseTitle(vehicle);

                  return (
                    <article
                      key={vehicle.id}
                      className="flex h-full flex-col rounded-[20px] border border-stone-200 bg-white p-2.5 shadow-[0_10px_24px_rgba(28,25,23,0.05)]"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-[16px] border border-stone-200 bg-stone-200">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={vehicle.title}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#ece7df,#f8f5ef)] px-6 text-center text-sm font-medium text-stone-500">
                            Gallery coming soon for {vehicle.stockCode}
                          </div>
                        )}

                        <div className="absolute inset-x-0 inset-y-0 bg-gradient-to-t from-black/75 via-black/12 to-black/5" />

                        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-stone-900/84 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(28,25,23,0.24)] backdrop-blur-sm">
                            {getShowcaseStockLabel(vehicle)}
                          </span>
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/78">
                                {displayTitle.year}
                              </p>
                              <h3 className="mt-2 text-[1.05rem] font-bold leading-tight text-white [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden sm:text-[1.12rem]">
                                {displayTitle.title}
                              </h3>
                            </div>
                            <p className="shrink-0 rounded-full bg-white/92 px-3 py-1.5 text-sm font-bold text-stone-950 shadow-[0_8px_18px_rgba(15,23,42,0.22)]">
                              {getShowcasePrice(vehicle.price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-3">
                        <div className="flex flex-wrap gap-2 text-[0.82rem] font-medium text-stone-700">
                          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5">
                            <CircleGauge className="size-3.5 shrink-0 text-stone-500" />
                            <span className="truncate">{getShowcaseEngineLabel(vehicle)}</span>
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5">
                            <Cog className="size-3.5 shrink-0 text-stone-500" />
                            <span className="truncate">{vehicle.transmission}</span>
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5">
                            <Fuel className="size-3.5 shrink-0 text-stone-500" />
                            <span className="truncate">{vehicle.fuelType}</span>
                          </span>
                        </div>

                        <div className="mt-auto flex items-center gap-2 pt-0.5">
                          <Link
                            href={detailsUrl}
                            className="inline-flex h-10 min-w-0 flex-1 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_10px_20px_rgba(165,90,42,0.22)] transition-colors hover:bg-[#8c4922]"
                          >
                            View Details
                          </Link>

                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`WhatsApp about ${vehicle.title}`}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white shadow-[0_8px_18px_rgba(37,211,102,0.22)] transition-colors hover:bg-[#1fb85a]"
                          >
                            <WhatsAppIcon className="size-4.5" />
                          </a>
                          <a
                            href={siteConfig.phoneHref}
                            aria-label={`Call sales about ${vehicle.title}`}
                            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition-colors hover:bg-stone-100"
                          >
                            <Phone className="size-4" />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        <section className="section-shell bg-white/50">
          <div className="container-shell grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[30px] p-7 sm:p-8">
              <SectionHeading
                eyebrow="Financing"
                title="Vehicle Financing Available"
                description="Ask about deposit options, monthly payment plans, and the next steps before you commit to a vehicle."
              />
              <Button asChild className="mt-6">
                <Link href="/financing">Ask About Financing</Link>
              </Button>
            </Card>
            <Card className="rounded-[30px] p-7 sm:p-8">
              <SectionHeading
                eyebrow="Trade-in"
                title="Trade In Your Car"
                description="Share your current car details and our team will guide you on valuation, top-up options, and the next step toward your next vehicle."
              />
              <Button asChild className="mt-6">
                <Link href="/trade-in">Value Your Trade</Link>
              </Button>
            </Card>
          </div>
        </section>

        <section className="section-shell">
          <div className="container-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
            <SectionHeading
              eyebrow="Delivered units"
              title="Sold and delivered stock keeps trust visible"
              description="Social proof works better when it is grounded in real-looking inventory rather than generic claims."
            />
            <div className="grid gap-5 md:grid-cols-3">
              {deliveredShowcaseVehicles.map((vehicle) => (
                <DeliveredVehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell bg-white/50">
          <div className="container-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
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

        <section className="section-shell">
          <div className="container-shell">
            <Card className="rounded-[34px] border border-stone-900 bg-stone-950 px-7 py-8 text-white sm:px-8 sm:py-9">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">
                    Contact strip
                  </p>
                  <h2 className="mt-4 display-font text-4xl">
                    Ready to shortlist a vehicle or ask about availability?
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
                    {locations[0]?.name || "Mombasa dealership"} is open during
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
      </main>

      <FloatingWhatsAppButton whatsappUrl={homepageWhatsAppUrl} />
    </>
  );
}
