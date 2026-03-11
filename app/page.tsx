import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightLeft,
  Check,
  CircleGauge,
  Cog,
  Fuel,
  Landmark,
  Phone,
  Star,
} from "lucide-react";

import { JsonLd } from "@/components/layout/json-ld";
import { FloatingWhatsAppButton } from "@/components/marketing/floating-whatsapp-button";
import { SectionHeading } from "@/components/marketing/section-heading";
import { TestimonialsCarousel } from "@/components/marketing/testimonials-carousel";
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
    <Card className="group relative aspect-[4/5] overflow-hidden rounded-[24px] border border-stone-200/50 bg-stone-900 shadow-[0_4px_20px_rgba(28,25,23,0.06)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(28,25,23,0.12)] sm:aspect-[4/3] lg:aspect-[4/5] xl:aspect-[4/4]">
      {vehicle.imageUrl ? (
        <Image
          src={vehicle.imageUrl}
          alt={`Delivered ${vehicle.title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center text-sm font-medium text-stone-500">
          Photo coming soon
        </div>
      )}

      {/* Premium dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 group-hover:opacity-90" />

      {/* Delivered Badge */}
      <div className="absolute left-4 top-4 rounded-md bg-[#10b981] px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] backdrop-blur-md">
        Delivered
      </div>

      {/* Content blocked at bottom */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5">
        <div className="mb-3">
          <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-stone-300/80">
            {vehicle.year}
          </p>
          <h3 className="text-[1.15rem] font-bold leading-tight text-white sm:text-[1.25rem]">
            {vehicle.title}
          </h3>
        </div>
        <div className="border-t border-white/10 pt-3">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#4ade80]">
            {vehicle.deliveryLabel}
          </p>
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
      .map((vehicle) =>
        mapVehicleToDeliveredCard(vehicle, "Recently delivered in Mombasa"),
      )
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
              className="animate-[hero-zoom_12s_ease-out_forwards] object-cover object-[30%_64%] opacity-95 brightness-[1.18] contrast-[1.05] saturate-[1.04]"
              sizes="100vw"
            />
            {/* Cinematic Gradient Overlays for Depth */}
            <div className="absolute inset-0 z-10 bg-[linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.65),rgba(0,0,0,0.75))]" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.18)_0%,transparent_50%),radial-gradient(circle_at_22%_78%,rgba(255,255,255,0.14)_0%,transparent_28%),radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.24)_100%)]" />
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
              <p className="mx-auto max-w-[640px] text-lg font-light leading-relaxed text-white/90 sm:text-xl md:text-2xl">
                Discover a curated collection of premium SUVs and sedans. Transparent pricing, flexible financing, and a flawless journey from showroom to driveway.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-14 overflow-hidden rounded-full border border-primary/80 bg-primary px-8 text-base font-semibold text-white shadow-[0_20px_44px_rgba(165,90,42,0.42)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8c4922] hover:shadow-[0_24px_48px_rgba(140,73,34,0.42)]"
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
                  className="group h-14 rounded-full border border-white/24 bg-black/44 px-8 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/36 hover:bg-black/54"
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
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[0.72rem] font-medium text-white/82">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-sm">
                  <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
                  4.8 Google Rating
                </span>
                <span className="inline-flex items-center rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-sm">
                  200+ Cars Sold
                </span>
                <span className="inline-flex items-center rounded-full border border-white/12 bg-black/26 px-3 py-1.5 backdrop-blur-sm">
                  Trusted by Mombasa Buyers
                </span>
              </div>
            </div>
            {/* Premium Unified Search Bar (Pill Design) */}
            <div className="relative mt-10 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150 xl:mt-14">
              <form
                action="/inventory"
                className="flex flex-col items-stretch rounded-[1.5rem] bg-white p-2 sm:rounded-[2rem] md:flex-row md:items-center md:rounded-full md:p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.25)] ring-1 ring-white/50 backdrop-blur-md"
              >
                {/* Keyword Search */}
                <div className="group relative flex flex-1 items-center px-4 py-3 sm:px-6 md:py-2 transition-colors hover:bg-stone-50 md:rounded-full">
                  <div className="absolute inset-y-0 left-4 flex items-center sm:left-6">
                    <svg className="h-5 w-5 text-stone-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="w-full pl-8 sm:pl-10">
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-stone-900">Keyword</label>
                    <input
                      name="q"
                      placeholder="Search make or model..."
                      className="w-full truncate bg-transparent p-0 text-sm font-semibold text-stone-700 placeholder:font-medium placeholder:text-stone-400 outline-none border-none focus:ring-0 sm:text-base mt-0.5"
                    />
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-stone-200 md:block" />

                {/* Make Select */}
                <div className="group relative flex flex-1 items-center px-4 py-3 sm:px-6 md:py-2 transition-colors hover:bg-stone-50 md:rounded-full cursor-pointer">
                  <div className="w-full pr-6">
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-stone-900">Make</label>
                    <select
                      name="make"
                      className="w-full appearance-none bg-transparent p-0 text-sm font-semibold text-stone-700 outline-none border-none focus:ring-0 sm:text-base cursor-pointer mt-0.5"
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
                  </div>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none sm:right-6">
                    <svg className="h-4 w-4 text-stone-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-stone-200 md:block" />

                {/* Condition Select */}
                <div className="group relative flex flex-1 items-center px-4 py-3 sm:px-6 md:py-2 transition-colors hover:bg-stone-50 md:rounded-full cursor-pointer">
                  <div className="w-full pr-6">
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-stone-900">Condition</label>
                    <select
                      name="category"
                      className="w-full appearance-none bg-transparent p-0 text-sm font-semibold text-stone-700 outline-none border-none focus:ring-0 sm:text-base cursor-pointer mt-0.5"
                      defaultValue=""
                    >
                      <option value="">All Conditions</option>
                      <option value="used">Local Used</option>
                      <option value="new">Brand New</option>
                      <option value="imported">Direct Import</option>
                      <option value="traded-in">Traded-in</option>
                    </select>
                  </div>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none sm:right-6">
                    <svg className="h-4 w-4 text-stone-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-stone-200 md:block" />

                {/* Sort Select */}
                <div className="group relative flex flex-1 items-center px-4 py-3 sm:px-6 md:py-2 transition-colors hover:bg-stone-50 md:rounded-full cursor-pointer">
                  <div className="w-full pr-6">
                    <label className="block text-[0.65rem] font-bold uppercase tracking-wider text-stone-900">Sort By</label>
                    <select
                      name="sort"
                      className="w-full appearance-none bg-transparent p-0 text-sm font-semibold text-stone-700 outline-none border-none focus:ring-0 sm:text-base cursor-pointer mt-0.5"
                      defaultValue="latest"
                    >
                      <option value="latest">Latest Arrivals</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                    </select>
                  </div>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none sm:right-6">
                    <svg className="h-4 w-4 text-stone-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Submit Form */}
                <div className="mt-2 w-full px-2 pb-2 md:mt-0 md:w-auto md:px-0 md:pb-0">
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-[1.125rem] bg-primary px-8 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:bg-[#8c4922] hover:shadow-2xl md:h-[4.25rem] md:w-auto md:rounded-full"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>

          </div>
        </section>

        {/* Feature Highlights Row */}
        <section className="border-b border-stone-200 bg-stone-50/60">
          <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 xl:max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              <div className="group flex items-center justify-start gap-4 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.08)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-950 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                  <CircleGauge className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold tracking-tight text-stone-950">Low Mileage</h4>
                  <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">Direct Imports</p>
                </div>
              </div>

              <div className="group flex items-center justify-start gap-4 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.08)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-950 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                  <Cog className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold tracking-tight text-stone-950">Fully Inspected</h4>
                  <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">100% Verified</p>
                </div>
              </div>

              <div className="group flex items-center justify-start gap-4 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.08)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-950 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                  <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold tracking-tight text-stone-950">Warranty Support</h4>
                  <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">Quality assured</p>
                </div>
              </div>

              <div className="group flex items-center justify-start gap-4 rounded-[1.25rem] bg-white p-5 shadow-[0_4px_20px_rgba(28,25,23,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(28,25,23,0.08)]">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-950 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                  <Fuel className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold tracking-tight text-stone-950">Flexible Financing</h4>
                  <p className="mt-0.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-stone-500">Easy conditions</p>
                </div>
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
                      ? "Cars Available Now in Mombasa"
                      : "Available Vehicles"
                  }
                  description="Compare price, mileage, and specs before opening a vehicle."
                />
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                    Updated daily
                  </span>
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone-600">
                    Verified Listings
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
                      className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white shadow-[0_4px_20px_rgba(28,25,23,0.04)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(28,25,23,0.08)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                        {primaryImage ? (
                          <Image
                            src={primaryImage}
                            alt={vehicle.title}
                            fill
                            sizes="(min-width: 1280px) 353px, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-medium text-stone-400">
                            Gallery coming soon
                          </div>
                        )}

                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-stone-900/90 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] backdrop-blur-md">
                            {getShowcaseStockLabel(vehicle)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-stone-500">
                              {displayTitle.year}
                            </p>
                            <h3 className="mt-1 text-lg font-bold leading-tight text-stone-950 sm:text-xl line-clamp-2">
                              {displayTitle.title}
                            </h3>
                          </div>
                          <p className="shrink-0 text-right text-lg font-black text-primary sm:text-xl">
                            {getShowcasePrice(vehicle.price)}
                          </p>
                        </div>

                        <div className="mb-6 grid grid-cols-3 gap-2 border-t border-stone-100 pt-5 text-sm font-medium text-stone-600">
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <CircleGauge className="size-4 text-stone-400" />
                            <span className="text-[0.75rem] leading-tight truncate w-full">{getShowcaseEngineLabel(vehicle)}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 text-center border-l border-stone-100">
                            <Cog className="size-4 text-stone-400" />
                            <span className="text-[0.75rem] leading-tight truncate w-full">{vehicle.transmission}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1.5 text-center border-l border-stone-100">
                            <Fuel className="size-4 text-stone-400" />
                            <span className="text-[0.75rem] leading-tight truncate w-full">{vehicle.fuelType}</span>
                          </div>
                        </div>

                        <div className="mt-auto grid grid-cols-[1fr_auto_auto] gap-2">
                          <Link
                            href={detailsUrl}
                            className="inline-flex h-11 items-center justify-center rounded-xl bg-stone-950 px-4 text-[0.85rem] font-semibold !text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-colors hover:bg-stone-800 hover:!text-white"
                          >
                            View Details
                          </Link>
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Get price on WhatsApp for ${vehicle.title}`}
                            className="inline-flex size-11 items-center justify-center rounded-xl bg-[#25d366]/10 text-[#25d366] transition-colors hover:bg-[#25d366] hover:text-white"
                          >
                            <WhatsAppIcon className="size-5" />
                          </a>
                          <a
                            href={siteConfig.phoneHref}
                            aria-label={`Call sales about ${vehicle.title}`}
                            className="inline-flex size-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50"
                          >
                            <Phone className="size-[1.1rem]" />
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

        <section className="section-shell bg-stone-50/50">
          <div className="container-shell grid gap-6 lg:grid-cols-2">
            <Card className="group flex h-full flex-col justify-between rounded-[32px] border border-stone-200/60 bg-white p-8 shadow-[0_8px_30px_rgba(28,25,23,0.03)] transition-all duration-400 ease-out hover:-translate-y-1.5 hover:border-stone-300/80 hover:shadow-[0_20px_40px_rgba(28,25,23,0.08)] sm:p-10">
              <div className="flex flex-1 flex-col">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[20px] bg-stone-100 text-stone-600 transition-colors duration-400 group-hover:bg-primary/10 group-hover:text-primary">
                  <Landmark className="size-7" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-stone-950 sm:text-[1.75rem]">
                    Vehicle Financing Available
                  </h3>
                  <p className="max-w-[85%] text-[0.95rem] leading-relaxed text-stone-500">
                    Ask about deposit options, monthly payment plans, and the next steps before you commit to a vehicle.
                  </p>
                </div>
              </div>
              <div className="mt-10 pt-2">
                <Button asChild variant="outline" className="h-12 rounded-xl border-stone-200 px-6 text-[0.9rem] font-semibold text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900">
                  <Link href="/financing">Ask About Financing</Link>
                </Button>
              </div>
            </Card>

            <Card className="group flex h-full flex-col justify-between rounded-[32px] border border-stone-200/60 bg-white p-8 shadow-[0_8px_30px_rgba(28,25,23,0.03)] transition-all duration-400 ease-out hover:-translate-y-1.5 hover:border-stone-300/80 hover:shadow-[0_20px_40px_rgba(28,25,23,0.08)] sm:p-10">
              <div className="flex flex-1 flex-col">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[20px] bg-stone-100 text-stone-600 transition-colors duration-400 group-hover:bg-primary/10 group-hover:text-primary">
                  <ArrowRightLeft className="size-7" />
                </div>
                <div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-stone-950 sm:text-[1.75rem]">
                    Trade In Your Car
                  </h3>
                  <p className="max-w-[85%] text-[0.95rem] leading-relaxed text-stone-500">
                    Upgrade seamlessly. Get a fair valuation on your current vehicle to put towards your next purchase.
                  </p>
                </div>
              </div>
              <div className="mt-10 pt-2">
                <Button asChild variant="outline" className="h-12 rounded-xl border-stone-200 px-6 text-[0.9rem] font-semibold text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900">
                  <Link href="/trade-in">Value Your Trade</Link>
                </Button>
              </div>
            </Card>
          </div>
        </section>

        <section className="section-shell">
          <div className="container-shell grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16 xl:gap-20">
            <div className="max-w-[420px]">
              <SectionHeading
                eyebrow="Delivered units"
                title="Recently Delivered Cars in Mombasa"
                description="Real cars delivered to real buyers in Mombasa."
              />
            </div>
            <div className="grid gap-8 md:grid-cols-3">
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
            <TestimonialsCarousel reviews={reviews} />
            <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-3">
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
