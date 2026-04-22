import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Calendar,
  CarFront,
  CheckCircle2,
  Fuel,
  Gauge,
  Map,
  MapPin,
  Palette,
  Settings2,
  ShieldCheck,
  Star,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { notFound } from "next/navigation";

import { VehicleEnquiryForm } from "@/components/forms/vehicle-enquiry-form";
import { MobileCtaBar } from "@/components/inventory/mobile-cta-bar";
import { ShareVehicleAction } from "@/components/inventory/share-vehicle-action";
import { VehicleFinanceEstimator } from "@/components/inventory/vehicle-finance-estimator";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { VehicleGallery } from "@/components/inventory/vehicle-gallery";
import { JsonLd } from "@/components/layout/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { homeStats, siteConfig } from "@/lib/config/site";
import {
  getReviews,
  getSimilarVehicles,
  getVehicleBySlug,
} from "@/lib/data/repository";
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildVehicleJsonLd,
} from "@/lib/seo";
import {
  absoluteUrl,
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
} from "@/lib/utils";

type VehicleRecord = NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>;

type HeroFact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type DetailRow = {
  label: string;
  value: string;
};

function buildDescriptionCopy(description?: string | null) {
  const fallback =
    "Contact sales for the latest photos, condition notes, and viewing guidance before you travel.";
  const normalized = description?.trim() || fallback;

  if (normalized.length <= 200) {
    return { preview: normalized, remainder: "" };
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length > 1) {
    let preview = sentences[0];
    let index = 1;

    while (
      index < sentences.length &&
      preview.length < 200 &&
      preview.length + sentences[index].length + 1 <= 260
    ) {
      preview = `${preview} ${sentences[index]}`;
      index += 1;
    }

    return {
      preview,
      remainder: sentences.slice(index).join(" "),
    };
  }

  return {
    preview: `${normalized.slice(0, 200).trimEnd()}...`,
    remainder: normalized.slice(200).trimStart(),
  };
}

function buildStatusBadges(vehicle: VehicleRecord) {
  const stockLabel = (() => {
    switch (vehicle.stockCategory) {
      case "available_for_importation":
        return "Ready to import";
      case "imported":
        return "Imported";
      case "traded_in":
        return "Trade-in accepted";
      default:
        return null;
    }
  })();

  return [
    {
      label: "Verified listing",
      variant: "success" as const,
    },
    {
      label: "Available now",
      variant: "accent" as const,
    },
    vehicle.negotiable
      ? {
        label: "Negotiable",
        variant: "muted" as const,
      }
      : null,
    stockLabel
      ? {
        label: stockLabel,
        variant: "muted" as const,
      }
      : null,
    {
      label: "Finance options",
      variant: "muted" as const,
    },
  ].filter(
    (
      value,
    ): value is {
      label: string;
      variant: "accent" | "muted" | "success";
    } => Boolean(value),
  );
}

function buildHeroFacts(vehicle: VehicleRecord): HeroFact[] {
  return [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    {
      icon: Gauge,
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      icon: Settings2,
      label: "Transmission",
      value: vehicle.transmission,
    },
    { icon: Fuel, label: "Fuel Type", value: vehicle.fuelType },
    { icon: Map, label: "Drive Type", value: vehicle.driveType || "On request" },
    { icon: CarFront, label: "Body Type", value: vehicle.bodyType || "On request" },
    {
      icon: Wrench,
      label: "Engine",
      value: vehicle.engineCapacity || "On request",
    },
    { icon: Palette, label: "Color", value: vehicle.color || "On request" },
  ];
}

function buildAboutHighlights(vehicle: VehicleRecord) {
  return [
    vehicle.condition
      ? `${vehicle.condition} presentation gives a clearer expectation before you visit.`
      : "Ask sales for the latest condition notes before viewing.",
    vehicle.fuelType.toLowerCase() === "diesel"
      ? "Diesel running suits longer trips, highway use, and upcountry travel."
      : `${vehicle.fuelType} running keeps daily use and weekend trips straightforward.`,
    vehicle.transmission === "Automatic"
      ? "Automatic transmission is easier in traffic and everyday driving."
      : `${vehicle.transmission} transmission suits buyers who prefer direct control.`,
    vehicle.driveType && /awd|4wd|4x4/i.test(vehicle.driveType)
      ? `${vehicle.driveType} setup adds confidence on mixed road surfaces.`
      : vehicle.bodyType && /suv|pickup/i.test(vehicle.bodyType)
        ? `${vehicle.bodyType} shape gives space and road presence many buyers want.`
        : "Finance and trade-in support can start before a physical visit.",
  ];
}

function buildKeyFeatures(vehicle: VehicleRecord) {
  const haystack = `${vehicle.title} ${vehicle.description}`.toLowerCase();
  const featureCatalog = [
    { label: "Reverse Camera", keywords: ["reverse camera", "rear camera", "backup camera"] },
    { label: "Sunroof", keywords: ["sunroof", "moonroof"] },
    { label: "Leather Seats", keywords: ["leather seats", "leather interior"] },
    { label: "Alloy Wheels", keywords: ["alloy wheels"] },
    { label: "Bluetooth", keywords: ["bluetooth"] },
    { label: "Navigation", keywords: ["navigation", "gps"] },
    { label: "Parking Sensors", keywords: ["parking sensors", "park sensors"] },
    { label: "Push Start", keywords: ["push start", "keyless start", "smart key"] },
    { label: "Air Conditioning", keywords: ["air conditioning", "a/c", "ac"] },
    { label: "ABS Brakes", keywords: ["abs brakes", "abs"] },
    { label: "Airbags", keywords: ["airbags", "air bags"] },
    { label: "Entertainment System", keywords: ["entertainment system", "infotainment"] },
  ] as const;

  const features: string[] = [];

  for (const item of featureCatalog) {
    if (item.keywords.some((keyword) => haystack.includes(keyword))) {
      features.push(item.label);
    }
  }

  const fallback = [
    vehicle.transmission ? `${vehicle.transmission} Transmission` : null,
    vehicle.fuelType ? `${vehicle.fuelType} Engine` : null,
    vehicle.driveType ? `${vehicle.driveType} Drive` : null,
    vehicle.engineCapacity ? `${vehicle.engineCapacity} Engine` : null,
    vehicle.bodyType ? `${vehicle.bodyType} Body` : null,
    "Ready for Viewing",
  ];

  for (const item of fallback) {
    if (item && !features.includes(item)) {
      features.push(item);
    }
  }

  return features.slice(0, 8);
}

function buildSpecificationRows(vehicle: VehicleRecord): DetailRow[] {
  return [
    { label: "Model Year", value: String(vehicle.year) },
    {
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      label: "Engine Capacity",
      value: vehicle.engineCapacity || "On request",
    },
    { label: "Fuel Type", value: vehicle.fuelType },
    { label: "Transmission", value: vehicle.transmission },
    { label: "Drive Type", value: vehicle.driveType || "On request" },
    { label: "Body Type", value: vehicle.bodyType || "On request" },
    { label: "Exterior Color", value: vehicle.color || "On request" },
  ];
}

function buildConfidenceRows(vehicle: VehicleRecord): DetailRow[] {
  return [
    { label: "Condition", value: vehicle.condition || "On request" },
    { label: "Availability", value: "Available now" },
    {
      label: "Viewing location",
      value: vehicle.location?.name || "Mombasa showroom",
    },
    { label: "Response time", value: `Usually ${homeStats.responseTime}` },
    { label: "Financing", value: "Available on request" },
    { label: "Trade-in", value: "Accepted" },
  ];
}

function buildReassuranceItems() {
  return [
    {
      title: "Verified listings",
      description: "Key facts and pricing shown clearly before you enquire.",
    },
    {
      title: "Fast response",
      description: `Sales usually replies within ${homeStats.responseTime}.`,
    },
    {
      title: "Finance help",
      description: `Guidance available through ${homeStats.financePartners} finance partners.`,
    },
    {
      title: "Trade-in support",
      description: "Ask about valuing your current car as part of the deal.",
    },
  ];
}

function VehicleHeroFactGrid({ facts }: { facts: HeroFact[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {facts.map((fact) => {
        const Icon = fact.icon;

        return (
          <div
            key={fact.label}
            className="rounded-[18px] border border-border/80 bg-white/92 px-3.5 py-3 shadow-[0_10px_22px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  {fact.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-text-primary">
                  {fact.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VehicleOverviewCard({
  summary,
  details,
  highlights,
  features,
  rows,
}: {
  summary: string;
  details: string;
  highlights: string[];
  features: string[];
  rows: DetailRow[];
}) {
  return (
    <Card className="rounded-[28px] border border-border/80 p-5 lg:p-6">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            About this vehicle
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-text-secondary">{summary}</p>

          {details ? (
            <details className="mt-4 group">
              <summary className="cursor-pointer text-sm font-semibold text-accent marker:hidden list-none">
                More description
              </summary>
              <p className="mt-3 text-sm leading-7 text-text-secondary">{details}</p>
            </details>
          ) : null}

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-primary">
                <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Key features
          </p>
          <ul className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-1">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium text-text-primary">
                <CheckCircle2 className="size-4.5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7 border-t border-border/80 pt-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
          Specifications
        </p>

        <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="border-b border-border/70 pb-3">
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                {row.label}
              </dt>
              <dd className="mt-2 text-sm font-semibold text-text-primary">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs text-text-secondary">
          Vehicle details are shared in good faith and confirmed during viewing.
        </p>
      </div>
    </Card>
  );
}

function VehicleSupportPanel({
  averageRating,
  confidenceRows,
  financingHref,
  mapUrl,
  reviewCount,
  shareUrl,
  title,
  tradeInHref,
  viewingHref,
}: {
  averageRating: string | null;
  confidenceRows: DetailRow[];
  financingHref: string;
  mapUrl?: string | null;
  reviewCount: number;
  shareUrl: string;
  title: string;
  tradeInHref: string;
  viewingHref: string;
}) {
  const actionClassName =
    "flex w-full items-center justify-between gap-3 rounded-[18px] border border-border/80 bg-white/92 px-4 py-3 text-left text-sm font-semibold text-text-primary shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-colors hover:border-accent/30 hover:bg-surface-elevated";

  return (
    <Card className="rounded-[28px] border border-border/80 p-5 lg:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Buyer support
          </p>
          <h2 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.04em] text-text-primary">
            Plan your next step quickly
          </h2>
        </div>

        {averageRating ? (
          <div className="rounded-[18px] border border-border/70 bg-surface-elevated/70 px-4 py-3 text-right">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              Trusted by buyers
            </p>
            <div className="mt-1.5 flex items-center justify-end gap-2">
              <span className="text-lg font-semibold tracking-[-0.04em] text-text-primary">
                {averageRating}/5
              </span>
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              Based on {reviewCount} featured review{reviewCount === 1 ? "" : "s"}.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {confidenceRows.map((row) => (
          <div
            key={row.label}
            className="rounded-[18px] border border-border/80 bg-surface-elevated/70 px-4 py-3"
          >
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
              {row.label}
            </p>
            <p className="mt-1.5 text-sm font-semibold text-text-primary">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border/80 pt-6">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
          Quick actions
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Link href={tradeInHref} className={actionClassName}>
            <span>Check trade-in value</span>
            <ArrowRight className="size-4 text-text-secondary" />
          </Link>
          <Link href={viewingHref} className={actionClassName}>
            <span>Schedule a viewing</span>
            <ArrowRight className="size-4 text-text-secondary" />
          </Link>
          <Link href={financingHref} className={actionClassName}>
            <span>Ask about financing</span>
            <Banknote className="size-4 text-text-secondary" />
          </Link>
          <ShareVehicleAction title={title} url={shareUrl} />
          {mapUrl ? (
            <a href={mapUrl} target="_blank" rel="noreferrer" className={actionClassName}>
              <span>Open showroom location</span>
              <MapPin className="size-4 text-text-secondary" />
            </a>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ReassuranceBand() {
  const items = buildReassuranceItems();

  return (
    <section className="rounded-[24px] border border-border/80 bg-white/94 px-5 py-4 shadow-[0_16px_38px_rgba(15,23,42,0.05)] lg:px-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/8 text-accent">
              <ShieldCheck className="size-4.5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return buildMetadata({
      title: "Vehicle not found",
      description: "The requested vehicle is not available.",
      path: `/cars/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale in ${vehicle.location?.city || "Mombasa"}`,
    description: vehicle.description,
    path: `/cars/${vehicle.slug}`,
    image: vehicle.heroImageUrl,
  });
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    notFound();
  }

  const [similarVehicles, reviews] = await Promise.all([
    getSimilarVehicles(vehicle, 4),
    getReviews(),
  ]);

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: vehicle.title, path: `/cars/${vehicle.slug}` },
  ]);
  const vehicleJsonLd = buildVehicleJsonLd(vehicle);
  const vehiclePath = `/cars/${vehicle.slug}`;
  const whatsappUrl = buildWhatsAppUrl(
    `Hi, I would like to enquire about ${vehicle.title}.`,
    siteConfig.whatsappNumber,
  );
  const shareUrl = absoluteUrl(vehiclePath);
  const descriptionCopy = buildDescriptionCopy(vehicle.description);
  const aboutHighlights = buildAboutHighlights(vehicle);
  const heroFacts = buildHeroFacts(vehicle);
  const detailBadges = buildStatusBadges(vehicle);
  const keyFeatures = buildKeyFeatures(vehicle);
  const specificationRows = buildSpecificationRows(vehicle);
  const confidenceRows = buildConfidenceRows(vehicle);
  const averageRating = reviews.length
    ? (reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />

      <main className="section-shell pb-24 pt-6 sm:pt-8">
        <div className="container-shell space-y-6 lg:space-y-8">
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-[0.82rem] text-text-secondary">
              <li>
                <Link href="/" className="transition-colors hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/inventory" className="transition-colors hover:text-accent">
                  Inventory
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                aria-current="page"
                className="max-w-[20rem] truncate font-semibold text-text-primary"
              >
                {vehicle.title}
              </li>
            </ol>
          </nav>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_390px] xl:items-start">
            <div className="min-w-0">
              <VehicleGallery
                key={vehicle.id}
                images={vehicle.images}
                heroImageUrl={vehicle.heroImageUrl}
                title={vehicle.title}
                compact
              />
            </div>

            <Card className="rounded-[30px] border border-border/80 p-5 lg:p-6">
              <div className="flex flex-wrap gap-2">
                {detailBadges.map((badge) => (
                  <Badge key={badge.label} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <div className="mt-5">
                <h1 className="max-w-[12ch] text-balance text-[clamp(2.2rem,4vw,3.45rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-text-primary">
                  {vehicle.title}
                </h1>
                <p className="mt-3 text-[clamp(2rem,3vw,2.85rem)] font-semibold leading-none tracking-[-0.05em] text-accent">
                  {formatCurrency(vehicle.price)}
                </p>
              </div>

              <div className="mt-5">
                <VehicleHeroFactGrid facts={heroFacts} />
              </div>

              <div className="mt-5 space-y-3">
                <Button asChild variant="whatsapp" className="w-full rounded-[18px]">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    Inquire on WhatsApp
                  </a>
                </Button>
                <Button asChild variant="secondary" className="w-full rounded-[18px]">
                  <a href={siteConfig.phoneHref}>Call: {siteConfig.phoneDisplay}</a>
                </Button>
                <Button asChild variant="secondary" className="w-full rounded-[18px]">
                  <Link href={`${vehiclePath}?intent=viewing#contact-panel`}>
                    Schedule a Viewing
                  </Link>
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <VehicleOverviewCard
              summary={descriptionCopy.preview}
              details={descriptionCopy.remainder}
              highlights={aboutHighlights}
              features={keyFeatures}
              rows={specificationRows}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
            <VehicleFinanceEstimator
              price={vehicle.price}
              financingHref={`${vehiclePath}?intent=financing#contact-panel`}
            />

            <VehicleSupportPanel
              averageRating={averageRating}
              confidenceRows={confidenceRows}
              financingHref={`${vehiclePath}?intent=financing#contact-panel`}
              shareUrl={shareUrl}
              title={vehicle.title}
              tradeInHref={`/trade-in?vehicle=${vehicle.slug}`}
              viewingHref={`${vehiclePath}?intent=viewing#contact-panel`}
              mapUrl={vehicle.location?.mapUrl}
              reviewCount={reviews.length}
            />
          </section>

          <section id="contact-panel" className="space-y-4">
            <VehicleEnquiryForm
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title}
              source="Vehicle detail page"
              phoneHref={siteConfig.phoneHref}
              phoneDisplay={siteConfig.phoneDisplay}
              whatsappUrl={whatsappUrl}
              tradeInHref={`/trade-in?vehicle=${vehicle.slug}`}
            />
          </section>

          {similarVehicles.length ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Similar vehicles
                  </p>
                  <h2 className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    You may also like
                  </h2>
                </div>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-accent"
                >
                  View all similar vehicles
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {similarVehicles.map((item) => (
                  <VehicleCard key={item.id} vehicle={item} />
                ))}
              </div>
            </section>
          ) : null}

          <ReassuranceBand />
        </div>
      </main>

      <MobileCtaBar
        whatsappUrl={whatsappUrl}
        phoneHref={siteConfig.phoneHref}
        primaryHref={`${vehiclePath}?intent=viewing#contact-panel`}
        primaryLabel="Viewing"
      />
    </>
  );
}
