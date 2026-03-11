import Image from "next/image";
import Link from "next/link";
import {
  Check,
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

const heroBackgroundImages = [
  "https://res.cloudinary.com/dlyrnhpcn/image/upload/v1773256508/mohammad-aqhib-5l2BnpBkAME-unsplash_op0aip.jpg",
  "https://res.cloudinary.com/dlyrnhpcn/image/upload/v1772901994/3_x83v11.jpg",
  "https://res.cloudinary.com/dlyrnhpcn/image/upload/v1772902428/4_mmphkh.jpg",
  "https://res.cloudinary.com/dlyrnhpcn/image/upload/v1772901065/3_gae6fj.jpg",
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
            sizes="(min-width: 1280px) 194px, (min-width: 768px) 30vw, 100vw"
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
  const [collections, reviews, vehicles] = await Promise.all([
    getHomepageCollections(),
    getReviews(),
    getAllVehicles(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([{ name: "Home", path: "/" }]);
  const homepageWhatsAppUrl = buildWhatsAppUrl(
    "Hi, I am ready to buy a car. Please share your best available options, prices, and the fastest next step on WhatsApp.",
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
        <section className="relative flex min-h-[calc(100svh-5rem)] w-full flex-col justify-center overflow-hidden bg-black pb-8 pt-20 lg:min-h-[calc(100svh-5.5rem)] lg:pb-12 lg:pt-24">
          {/* Immersive Background Environment */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBackgroundImages[0] ?? "/carHero.png"}
              alt="Premium Dealership Vehicle Background"
              fill
              priority
              quality={90}
              className="object-cover object-[60%_62%] opacity-95 brightness-[1.12] contrast-[1.02] transition-transform duration-[30s] ease-out hover:scale-[1.05]"
              sizes="100vw"
            />
            {/* Cinematic Gradient Overlays for Depth */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 via-black/10 to-black/72" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_30%_76%,rgba(255,255,255,0.22)_0%,transparent_30%),radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
          </div>

          <div className="container relative z-20 mx-auto flex w-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 xl:max-w-7xl">
            <div className="max-w-5xl space-y-5 animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-1000 sm:space-y-6">
              <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05]">
                Premium Imported <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-200 via-white to-stone-500">
                  Cars in Mombasa
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mx-auto max-w-[640px] text-lg font-light leading-relaxed text-stone-300 sm:text-xl md:text-2xl">
                Discover a curated collection of premium SUVs and sedans. Transparent pricing, flexible financing, and a flawless journey from showroom to driveway.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-14 overflow-hidden rounded-full border border-primary/80 bg-primary px-8 text-base font-semibold text-white shadow-[0_14px_30px_rgba(165,90,42,0.34)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8c4922] hover:shadow-[0_18px_36px_rgba(140,73,34,0.34)]"
                >
                  <Link
                    href="/inventory"
                    className="flex items-center gap-2 text-white"
                    style={{ color: "#ffffff" }}
                  >
                    Explore Collection
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="group h-14 rounded-full border border-white/20 bg-black/40 px-8 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:-translate-y-0.5 hover:border-white/40 hover:shadow-[0_8px_20px_rgba(255,255,255,0.05)] duration-300"
                >
                  <a
                    href={homepageWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-white"
                    style={{ color: "#ffffff" }}
                  >
                    <WhatsAppIcon className="size-5 text-[#25d366] transition-transform group-hover:scale-110 duration-300" />
                    Contact Sales
                  </a>
                </Button>
              </div>

              {/* Trust Strip */}
              <div className="hidden mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/80 lowercase tracking-wider sm:gap-6">
                <span className="flex items-center gap-1.5"><span className="text-[#25d366]">✔</span> Trusted Mombasa Dealer</span>
                <span className="flex items-center gap-1.5"><span className="text-[#25d366]">✔</span> Fully Inspected Vehicles</span>
                <span className="flex items-center gap-1.5"><span className="text-[#25d366]">✔</span> Fast WhatsApp Response</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-white/80 lowercase tracking-wider sm:gap-6">
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#25d366]" />
                  Trusted Mombasa Dealer
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#25d366]" />
                  Fully Inspected Vehicles
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-[#25d366]" />
                  Fast WhatsApp Response
                </span>
              </div>
            </div>

            {/* Integrated Floating Search Bar (Glassmorphism) - Redesigned */}
            <div className="surface-card relative mt-6 w-full max-w-5xl rounded-[2rem] border border-white/10 bg-white/5 p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 sm:mt-8 sm:p-3.5">
              <form
                action="/inventory"
                className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
              >
                <div className="relative flex items-center">
                  <svg className="absolute left-4 h-5 w-5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    name="q"
                    placeholder="Search Make or Model..."
                    className="h-14 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-stone-400 text-white focus:border-primary focus:bg-white/10 focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  />
                </div>
                <div className="relative flex items-center">
                  <select
                    name="make"
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-5 text-sm outline-none transition-all text-white focus:border-primary focus:bg-white/10 focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(0,0,0,0.5)] [&>option]:text-black"
                    defaultValue=""
                  >
                    <option value="">Any Make</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Land Rover">Land Rover</option>
                    <option value="Mazda">Mazda</option>
                    <option value="Subaru">Subaru</option>
                    <option value="Nissan">Nissan</option>
                    <option value="BMW">BMW</option>
                    <option value="Ford">Ford</option>
                  </select>
                  <svg className="absolute right-4 h-4 w-4 pointer-events-none text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="relative flex items-center">
                  <select
                    name="category"
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-5 text-sm outline-none transition-all text-white focus:border-primary focus:bg-white/10 focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(0,0,0,0.5)] [&>option]:text-black"
                    defaultValue=""
                  >
                    <option value="">All Conditions</option>
                    <option value="used">Used</option>
                    <option value="new">New</option>
                    <option value="imported">Direct Import</option>
                    <option value="traded-in">Traded-in</option>
                  </select>
                  <svg className="absolute right-4 h-4 w-4 pointer-events-none text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <div className="relative flex items-center">
                  <select
                    name="sort"
                    className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-5 text-sm outline-none transition-all text-white focus:border-primary focus:bg-white/10 focus:ring-1 focus:ring-primary focus:shadow-[0_0_15px_rgba(0,0,0,0.5)] [&>option]:text-black"
                    defaultValue="latest"
                  >
                    <option value="latest">Latest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <svg className="absolute right-4 h-4 w-4 pointer-events-none text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <Button
                  type="submit"
                  className="h-14 rounded-2xl border-none bg-white px-8 font-semibold text-stone-950 transition-all duration-300 hover:scale-[1.02] hover:bg-stone-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:col-span-2 xl:col-span-1"
                >
                  Search
                </Button>
              </form>
            </div>

          </div>
        </section>

        {/* Feature Highlights Row */}
        <section className="border-b border-stone-200 bg-white">
          <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-12 lg:px-8 xl:max-w-7xl">
            <div className="grid w-full grid-cols-2 gap-6 text-sm font-medium text-stone-600 md:grid-cols-4">
              <div className="flex flex-col items-center justify-center gap-3 p-5">
                <CircleGauge className="size-6 text-primary" />
                <span className="text-center font-semibold text-stone-900">Low-Mileage Imports</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 p-5">
                <Cog className="size-6 text-primary" />
                <span className="text-center font-semibold text-stone-900">Fully Inspected</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 p-5">
                <svg className="size-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-center font-semibold text-stone-900">Warranty Included</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 p-5">
                <Fuel className="size-6 text-primary" />
                <span className="text-center font-semibold text-stone-900">Flexible Financing</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell pt-16">
          <div className="container-shell space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-3">
                <SectionHeading
                  eyebrow="Inventory"
                  title={
                    collections.featured.length
                      ? "Featured Cars Ready for Viewing"
                      : "Browse Available Vehicles"
                  }
                  description="See price, mileage, transmission, fuel type, and condition at a glance before you open the full details or start a WhatsApp conversation."
                />
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                    Updated daily
                  </span>
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    Price + spec snapshots
                  </span>
                </div>
              </div>
              <Button asChild variant="secondary">
                <Link href="/inventory">Review Full Inventory</Link>
              </Button>
            </div>

            {featuredShowcaseVehicles.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
                {featuredShowcaseVehicles.slice(0, 8).map((vehicle) => {
                  const primaryImage =
                    vehicle.heroImageUrl || vehicle.images[0]?.imageUrl || null;
                  const detailsUrl = buildVehicleUrl(vehicle);
                  const whatsappUrl = buildWhatsAppUrl(
                    `Hi, I am ready to move on the ${vehicle.title}. Please confirm availability, best price, and the next step to reserve it.`,
                    siteConfig.whatsappNumber,
                  );
                  const displayTitle = getShowcaseTitle(vehicle);

                  return (
                    <article
                      key={vehicle.id}
                      className="flex h-full flex-col rounded-[20px] border border-stone-200 bg-white p-2.5 shadow-[0_10px_24px_rgba(28,25,23,0.05)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(0,0,0,0.1)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border border-stone-200 bg-stone-200">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={vehicle.title}
                            fill
                            sizes="(min-width: 1280px) 353px, (min-width: 768px) 50vw, 100vw"
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
                            aria-label={`Get price on WhatsApp for ${vehicle.title}`}
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
          <div className="container-shell space-y-8">
            <SectionHeading
              eyebrow="Testimonials"
              title="Trust-building copy stays close to the buyer journey"
              description="Reviews reinforce responsiveness, clarity, and confidence instead of chasing empty brand language."
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                    Next step
                  </p>
                  <h2 className="mt-4 display-font text-4xl">
                    Shortlist With Logic. Close on WhatsApp.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
                    Review inventory first, then message us when you want availability, financing guidance, or the fastest route to reserve the right car.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href="/inventory">Review Inventory</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-[#25d366] text-white shadow-[0_10px_24px_rgba(37,211,102,0.24)] hover:bg-[#1fb85a]"
                  >
                    <a href={homepageWhatsAppUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="size-4" />
                      Reserve on WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <FloatingWhatsAppButton
        whatsappUrl={homepageWhatsAppUrl}
        label="Get Price on WhatsApp"
      />
    </>
  );
}
