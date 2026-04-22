import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Clock3,
  MapPin,
  Ticket,
} from "lucide-react";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/layout/json-ld";
import { VehicleEnquiryForm } from "@/components/forms/vehicle-enquiry-form";
import { MobileCtaBar } from "@/components/inventory/mobile-cta-bar";
import { SpecGrid } from "@/components/inventory/spec-grid";
import { VehicleCard } from "@/components/inventory/vehicle-card";
import { VehicleGallery } from "@/components/inventory/vehicle-gallery";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { homeStats, siteConfig } from "@/lib/config/site";
import {
  getSimilarVehicles,
  getVehicleBySlug,
} from "@/lib/data/repository";
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildVehicleJsonLd,
} from "@/lib/seo";
import {
  cn,
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
  humanizeStockCategory,
} from "@/lib/utils";

/* -------------------------
   Helper builders (kept mostly as-is)
   ------------------------- */

function buildEssentialDetails(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  return [
    {
      label: "Year",
      value: String(vehicle.year),
    },
    {
      label: "Transmission",
      value: vehicle.transmission,
    },
    {
      label: "Fuel",
      value: vehicle.fuelType,
    },
    {
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      label: "Drive",
      value: vehicle.driveType || "On request",
    },
    {
      label: "Body",
      value: vehicle.bodyType || "On request",
    },
    {
      label: "Condition",
      value: vehicle.condition || "On request",
    },
  ];
}

function roundToNearest(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

function buildFinanceEstimate(price: number) {
  const depositRate = 0.3;
  const termMonths = 24;
  const deposit = roundToNearest(price * depositRate, 1000);
  const monthly = roundToNearest((price - deposit) / termMonths, 1000);

  return {
    deposit,
    monthly,
    depositRate,
    termMonths,
  };
}

function buildLeadSummary(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
  photoCount: number,
) {
  const city = vehicle.location?.city || "Mombasa";
  const mileage =
    vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "mileage on request";
  const condition = vehicle.condition?.toLowerCase() || "clean presentation";
  const gearbox = vehicle.transmission.toLowerCase();
  const fuel = vehicle.fuelType.toLowerCase();
  const photoText = photoCount
    ? `${photoCount} listing photo${photoCount === 1 ? "" : "s"}`
    : "direct WhatsApp follow-up";

  return `${vehicle.year} ${vehicle.make} ${vehicle.model} is listed in ${city} with ${mileage}, ${gearbox} ${fuel} running, and ${condition} presentation. ${photoText} help buyers shortlist with clearer confidence before they travel for viewing.`;
}

function buildBuyerHighlights(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  return [
    vehicle.fuelType.toLowerCase() === "diesel"
      ? "Diesel running suits buyers doing longer highway, coastal, or upcountry mileage."
      : `${vehicle.fuelType} running keeps daily driving straightforward for town use and weekend travel.`,
    vehicle.bodyType && /suv|pickup/i.test(vehicle.bodyType)
      ? `${vehicle.bodyType} shape gives the road presence and practicality many Kenyan family buyers look for.`
      : vehicle.bodyType
        ? `${vehicle.bodyType} body style keeps the car practical for daily driving and easier parking.`
        : null,
    vehicle.driveType && /awd|4wd|4x4/i.test(vehicle.driveType)
      ? `${vehicle.driveType} setup adds confidence for mixed road conditions and wet-weather driving.`
      : vehicle.transmission === "Automatic"
        ? "Automatic transmission helps with traffic and everyday driving comfort."
        : `${vehicle.transmission} transmission suits buyers who prefer direct control and simple running.`,
    vehicle.condition
      ? `${vehicle.condition} condition note gives a clearer expectation before viewing.`
      : null,
    "Finance and trade-in guidance can start before a physical visit, so buyers get clarity earlier.",
  ].filter((value): value is string => Boolean(value));
}

function buildFeaturePills(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
  photoCount: number,
) {
  return [
    vehicle.transmission ? `${vehicle.transmission} drive` : null,
    vehicle.fuelType ? `${vehicle.fuelType} running` : null,
    vehicle.driveType ? `${vehicle.driveType} road setup` : null,
    vehicle.bodyType ? `${vehicle.bodyType} body style` : null,
    vehicle.engineCapacity ? `${vehicle.engineCapacity} engine` : null,
    photoCount ? `${photoCount} listing photos` : "Fresh photos on request",
  ].filter((value): value is string => Boolean(value));
}

function buildDescriptionCopy(description?: string | null) {
  const fallback =
    "Contact sales for the latest condition notes, extra photos, and viewing guidance before you travel.";
  const normalized = description?.trim() || fallback;

  if (normalized.length <= 220) {
    return { preview: normalized, remainder: "" };
  }

  const sentences = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);

  if (sentences.length > 1) {
    let preview = sentences[0];
    let index = 1;

    while (
      index < sentences.length &&
      preview.length < 220 &&
      preview.length + sentences[index].length + 1 <= 290
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
    preview: `${normalized.slice(0, 220).trimEnd()}...`,
    remainder: normalized.slice(220).trimStart(),
  };
}

function buildDetailBadges(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  const stockLabel = (() => {
    switch (vehicle.stockCategory) {
      case "available_for_importation":
        return "Ready to import";
      case "traded_in":
        return "Trade-in offer";
      default:
        return humanizeStockCategory(vehicle.stockCategory);
    }
  })();

  return [
    vehicle.featured
      ? {
        label: "Featured",
        variant: "default" as const,
        className: "",
      }
      : null,
    vehicle.negotiable
      ? {
        label: "Negotiable",
        variant: "muted" as const,
        className: "",
      }
      : null,
    {
      label: "Verified listing",
      variant: "success" as const,
      className: "",
    },
    {
      label: stockLabel,
      variant: "muted" as const,
      className: "",
    },
  ].filter(
    (
      value,
    ): value is {
      label: string;
      variant: "default" | "muted" | "success";
      className: string;
    } => Boolean(value),
  );
}

function buildConfidenceStats(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
  photoCount: number,
) {
  return [
    {
      icon: Camera,
      label: "Gallery",
      value: photoCount
        ? `${photoCount} photo${photoCount === 1 ? "" : "s"}`
        : "Photos on request",
      detail: photoCount
        ? "Enough detail to review before you call."
        : "Fresh photos are available on request.",
    },
    {
      icon: MapPin,
      label: "Viewing",
      value: vehicle.location?.name || "Mombasa showroom",
      detail: "Confirm timing before you leave home.",
    },
    {
      icon: Ticket,
      label: "Reference",
      value: vehicle.stockCode,
      detail: "Quote this code for faster follow-up.",
    },
  ];
}

function VehicleDescriptionSection({
  description,
  featurePills,
  className,
}: {
  description?: string | null;
  featurePills: string[];
  className?: string;
}) {
  const descriptionCopy = buildDescriptionCopy(description);

  return (
    <section
      className={cn(
        "rounded-[24px] border border-border/80 bg-[linear-gradient(180deg,_rgba(249,251,252,0.96),_rgba(244,247,251,0.92))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] sm:px-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
            Description
          </p>
          <h2 className="mt-1 text-[1.2rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
            What buyers should know first
          </h2>
        </div>
        <Link
          href="#contact-panel"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
        >
          Ask about this vehicle
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <p className="mt-3 text-sm leading-6 text-text-secondary">
        {descriptionCopy.preview}
      </p>

      {descriptionCopy.remainder ? (
        <details className="mt-3 text-sm text-text-secondary">
          <summary className="cursor-pointer list-none font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
            Read full description
          </summary>
          <p className="mt-3 leading-6">{descriptionCopy.remainder}</p>
        </details>
      ) : null}

      {featurePills.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {featurePills.map((item) => (
            <span
              key={item}
              className="inline-flex rounded-full border border-border/80 bg-white/90 px-3 py-1.5 text-[0.8rem] font-medium text-text-primary shadow-[0_8px_18px_rgba(15,23,42,0.04)]"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

/* -------------------------
   Metadata generation (unchanged)
   ------------------------- */

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
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale in ${vehicle.location?.city || "Mombasa"
      }`,
    description: vehicle.description,
    path: `/cars/${vehicle.slug}`,
    image: vehicle.heroImageUrl,
  });
}

/* -------------------------
   Page component - improved UX & structure
   ------------------------- */

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

  const similarVehicles = await getSimilarVehicles(vehicle, 3);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Inventory", path: "/inventory" },
    { name: vehicle.title, path: `/cars/${vehicle.slug}` },
  ]);
  const vehicleJsonLd = buildVehicleJsonLd(vehicle);
  const whatsappUrl = buildWhatsAppUrl(
    `Hi, is ${vehicle.title} still available?`,
    siteConfig.whatsappNumber,
  );
  const photoCount = vehicle.images.length || (vehicle.heroImageUrl ? 1 : 0);
  const essentialDetails = buildEssentialDetails(vehicle);
  const leadSummary = buildLeadSummary(vehicle, photoCount);
  const buyerHighlights = buildBuyerHighlights(vehicle);
  const featurePills = buildFeaturePills(vehicle, photoCount);
  const detailBadges = buildDetailBadges(vehicle);
  const confidenceStats = buildConfidenceStats(vehicle, photoCount);
  const financeEstimate = buildFinanceEstimate(vehicle.price);
  const vehiclePath = `/cars/${vehicle.slug}`;

  // quick destructure for cleaner markup
  const {
    title,
    id,
    heroImageUrl,
    images,
    description,
    stockCode,
    location,
    price,
  } = vehicle;

  return (
    <>
      {/* JSON-LD for SEO */}
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />

      <main className="section-shell pb-24 pt-6 sm:pt-8">
        <div className="container-shell space-y-5">
          {/* Visible breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-[0.82rem] text-text-secondary">
              <li>
                <Link href="/" className="transition-colors hover:text-accent">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/inventory" className="transition-colors hover:text-accent">Inventory</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li
                aria-current="page"
                className="max-w-[20rem] truncate font-semibold text-text-primary"
              >
                {title}
              </li>
            </ol>
          </nav>

          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(145deg,_rgba(255,255,255,0.96),_rgba(244,247,251,0.98))] p-3 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-4 lg:p-5">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_360px] xl:items-start">
              <div className="min-w-0 space-y-4">
                <VehicleGallery
                  key={id}
                  images={images}
                  heroImageUrl={heroImageUrl}
                  title={title}
                  compact
                />
                <VehicleDescriptionSection
                  description={description}
                  featurePills={featurePills}
                  className="hidden xl:block"
                />
              </div>

              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {detailBadges.map((badge) => (
                    <Badge key={badge.label} variant={badge.variant} className={badge.className}>
                      {badge.label}
                    </Badge>
                  ))}
                  <Badge variant="accent">Available now</Badge>
                </div>

                <div className="space-y-3">
                  <h1 className="max-w-[14ch] text-balance text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-text-primary">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-end gap-3">
                    <p className="text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.05em] text-accent">
                      {formatCurrency(price)}
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Ref {stockCode}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-text-secondary">
                    {leadSummary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[0.84rem] text-text-secondary">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/92 px-3 py-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <MapPin className="size-3.5 text-text-secondary/70" aria-hidden />
                    <span>{location?.name || "Mombasa showroom"}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/92 px-3 py-1.5 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <Clock3 className="size-3.5 text-text-secondary/70" aria-hidden />
                    <span>Usually replies in {homeStats.responseTime}</span>
                  </div>
                </div>

                <Card className="rounded-[26px] border border-border/80 p-4 lg:p-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Quick vehicle facts
                  </p>
                  <div className="mt-3 divide-y divide-border/80 overflow-hidden rounded-[20px] border border-border/80 bg-white/92">
                    {essentialDetails.map((detail) => (
                      <div
                        key={detail.label}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <span className="text-text-secondary">{detail.label}</span>
                        <span className="font-semibold text-text-primary">{detail.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-[18px] border border-border/80 bg-surface-elevated/75 p-3.5">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                      Budget guide
                    </p>
                    <p className="mt-1 text-base font-semibold text-text-primary">
                      Approx {formatCurrency(financeEstimate.monthly)}/month
                    </p>
                    <p className="mt-1 text-[0.82rem] leading-5 text-text-secondary">
                      Estimate based on {Math.round(financeEstimate.depositRate * 100)}% deposit over {financeEstimate.termMonths} months. Confirm exact terms with sales.
                    </p>
                    <Link
                      href={`${vehiclePath}?intent=financing#contact-panel`}
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-hover"
                    >
                      Ask about payment options
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <Button asChild variant="dark" className="w-full rounded-[18px]">
                      <Link href={`${vehiclePath}?intent=viewing#contact-panel`}>
                        Book viewing
                      </Link>
                    </Button>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      <Button asChild variant="whatsapp" className="w-full rounded-[18px]">
                        <a href={whatsappUrl} target="_blank" rel="noreferrer">
                          Chat on WhatsApp
                        </a>
                      </Button>
                      <Button asChild variant="secondary" className="w-full rounded-[18px]">
                        <a href={siteConfig.phoneHref}>
                          Call {siteConfig.phoneDisplay}
                        </a>
                      </Button>
                    </div>
                    <Button asChild variant="primary" className="w-full rounded-[18px]">
                      <Link href={`${vehiclePath}#contact-panel`}>
                        Send message
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary">
                    <span>Order ID {stockCode}</span>
                    <Link
                      href={`/trade-in?vehicle=${vehicle.slug}`}
                      className="font-semibold transition-colors hover:text-accent"
                    >
                      Trade-in accepted
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <VehicleDescriptionSection
                description={description}
                featurePills={featurePills}
                className="xl:hidden"
              />

              <Card className="rounded-[28px] p-5 lg:p-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                  Vehicle details
                </p>
                <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                  Buyer notes and full specs
                </h2>
                <div className="mt-5">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                    Buyer notes
                  </p>
                  <ul className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
                    {buyerHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                        <span className="mt-2 inline-flex size-1.5 shrink-0 rounded-full bg-accent/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <details className="mt-5 rounded-[22px] border border-border/80 bg-surface-elevated/58 p-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                    Show full vehicle details
                  </summary>
                  <div className="mt-4">
                    <SpecGrid vehicle={vehicle} />
                  </div>
                </details>
              </Card>

              <section id="contact-panel" className="space-y-3">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Send message
                  </p>
                  <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    Ask about this vehicle without a long back-and-forth
                  </h2>
                </div>
                <VehicleEnquiryForm
                  vehicleId={id}
                  vehicleTitle={title}
                  source="Vehicle detail page"
                  phoneHref={siteConfig.phoneHref}
                  phoneDisplay={siteConfig.phoneDisplay}
                  whatsappUrl={whatsappUrl}
                />
              </section>
            </div>

            <Card className="rounded-[28px] p-5 lg:p-6 xl:sticky xl:top-24 xl:self-start">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-secondary">
                Broker support
              </p>
              <h2 className="mt-2 text-[1.35rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                {siteConfig.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Speak to the Mombasa team for viewing times, current availability, and finance or trade-in guidance before you travel.
              </p>

              <ul className="mt-4 space-y-2.5 text-sm leading-6 text-text-secondary">
                <li>{location?.name || siteConfig.address}</li>
                <li>{siteConfig.salesEmail}</li>
                <li>{siteConfig.hoursLabel}</li>
                <li>{homeStats.deliveredCount}+ vehicles delivered</li>
              </ul>

              <div className="mt-5 grid gap-2">
                {confidenceStats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-[18px] border border-border/80 bg-surface-elevated/72 px-3.5 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5 text-text-secondary/70" />
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                          {stat.label}
                        </p>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-text-primary">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[0.82rem] leading-5 text-text-secondary">
                        {stat.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-2">
                <Button asChild variant="secondary" className="w-full rounded-[18px]">
                  <a href={siteConfig.phoneHref}>Call {siteConfig.phoneDisplay}</a>
                </Button>
                {location?.mapUrl ? (
                  <Button asChild variant="ghost" className="w-full rounded-[18px]">
                    <a href={location.mapUrl} target="_blank" rel="noreferrer">
                      Open showroom location
                    </a>
                  </Button>
                ) : null}
              </div>
            </Card>
          </section>

          {similarVehicles.length ? (
            <section className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Related
                  </p>
                  <h2 className="mt-2 text-[1.55rem] font-semibold leading-tight tracking-[-0.04em] text-text-primary">
                    Related listings
                  </h2>
                </div>
                <Link
                  href="/inventory"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-accent"
                >
                  Browse full inventory
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {similarVehicles.map((item) => (
                  <VehicleCard key={item.id} vehicle={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <MobileCtaBar
        whatsappUrl={whatsappUrl}
        phoneHref={siteConfig.phoneHref}
        primaryHref={`${vehiclePath}?intent=viewing#contact-panel`}
        primaryLabel="Reserve"
      />
    </>
  );
}
