import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
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
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { siteConfig } from "@/lib/config/site";
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
  buildWhatsAppUrl,
  formatCurrency,
  formatMileage,
  humanizeStockCategory,
} from "@/lib/utils";

function buildSummarySpecs(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  return [
    {
      label: "Mileage",
      value: vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : "On request",
    },
    {
      label: "Transmission",
      value: vehicle.transmission,
    },
    {
      label: "Fuel",
      value: vehicle.fuelType,
    },
  ];
}

function buildBuyerSummary(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
  photoCount: number,
) {
  return [
    vehicle.condition
      ? `Presented as ${vehicle.condition}.`
      : "Condition details are available on request.",
    photoCount
      ? `${photoCount} photo${photoCount === 1 ? "" : "s"} included so you can review the car before speaking to sales.`
      : "Fresh photos can be shared directly on WhatsApp while the gallery is being updated.",
    `Available for viewing at ${vehicle.location?.name || "our Mombasa showroom"}.`,
    vehicle.negotiable
      ? "There is room for a serious offer after viewing."
      : "Ask sales for the best next step on price or payment.",
    `Quote ref ${vehicle.stockCode} when you call or message for faster help.`,
  ];
}

function buildOverviewHighlights(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  return [
    vehicle.bodyType
      ? `${vehicle.bodyType} comfort with ${
          vehicle.transmission === "Automatic"
            ? "easy automatic driving"
            : `${vehicle.transmission.toLowerCase()} control`
        }.`
      : `${
          vehicle.transmission === "Automatic"
            ? "Easy automatic driving"
            : `${vehicle.transmission} drive`
        } with ${vehicle.fuelType.toLowerCase()} power.`,
    vehicle.engineCapacity
      ? `Strong ${vehicle.engineCapacity} power for confident town driving and longer trips.`
      : `${vehicle.fuelType} power for buyers who want an easy everyday drive.`,
    vehicle.mileage > 0 ? `Shown at ${formatMileage(vehicle.mileage)} on the listing.` : null,
    vehicle.condition ? `Presented as ${vehicle.condition}.` : null,
    `Available for viewing at ${vehicle.location?.name || "our Mombasa showroom"}.`,
  ].filter((value): value is string => Boolean(value));
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
      label: stockLabel,
      variant: "muted" as const,
      className: "",
    },
  ].filter(
    (
      value,
    ): value is {
      label: string;
      variant: "default" | "muted";
      className: string;
    } => Boolean(value),
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
    title: `${vehicle.year} ${vehicle.make} ${vehicle.model} for Sale in ${
      vehicle.location?.city || "Mombasa"
    }`,
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
  const summarySpecs = buildSummarySpecs(vehicle);
  const buyerSummary = buildBuyerSummary(vehicle, photoCount);
  const buyerHighlights = buyerSummary.slice(0, 4);
  const overviewHighlights = buildOverviewHighlights(vehicle);
  const detailBadges = buildDetailBadges(vehicle);
  const baseVehiclePath = `/cars/${vehicle.slug}`;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />
      <section className="section-shell pb-24">
        <div className="container-shell space-y-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="min-w-0">
              <VehicleGallery
                key={vehicle.id}
                images={vehicle.images}
                heroImageUrl={vehicle.heroImageUrl}
                title={vehicle.title}
              />
            </div>

            <div className="min-w-0 space-y-5 lg:sticky lg:top-28 lg:self-start">
              <div className="flex flex-wrap gap-2">
                {detailBadges.map((badge) => (
                  <Badge
                    key={badge.label}
                    variant={badge.variant}
                    className={badge.className}
                  >
                    {badge.label}
                  </Badge>
                ))}
              </div>

              <div>
                <h1 className="text-[2.15rem] font-semibold leading-[1.06] tracking-tight text-text-primary break-words [overflow-wrap:anywhere] sm:text-[2.45rem] lg:text-5xl">
                  {vehicle.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-[0.85rem] font-medium text-text-secondary">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5">
                    <MapPin className="size-[1.1rem] text-text-secondary/70" />
                    {vehicle.location?.name || "Mombasa showroom"}
                  </div>
                  <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Ref {vehicle.stockCode}
                  </span>
                </div>
              </div>

              <Card className="rounded-[32px] p-6 lg:p-8 xl:p-9">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Listed Price
                </p>
                <p className="mt-1.5 max-w-full text-[clamp(2.25rem,9vw,4rem)] font-black leading-[0.96] tracking-tight text-accent [overflow-wrap:anywhere]">
                  {formatCurrency(vehicle.price)}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {summarySpecs.map((spec) => (
                    <div
                      key={spec.label}
                      className="min-w-0 rounded-[10px] border border-border/80 bg-[#F5F7FA] px-3 py-2.5"
                    >
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-text-secondary">
                        {spec.label}
                      </p>
                      <p className="mt-1 text-[0.92rem] font-bold leading-tight text-text-primary break-words [overflow-wrap:anywhere] sm:text-[0.95rem]">
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[0.85rem] leading-relaxed text-text-secondary">
                  Review the photos, then message or call for availability and the next step.
                </p>
                <div className="mt-7 grid gap-3.5">
                  <Button
                    asChild
                    variant="whatsapp"
                    size="lg"
                    className="h-14 w-full rounded-2xl text-base font-bold"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="mr-2 size-[1.15rem]" />
                      WhatsApp This Car
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="h-14 w-full rounded-2xl text-base font-semibold"
                  >
                    <a href={siteConfig.phoneHref}>
                      <Phone className="mr-2 size-[1.05rem]" />
                      Call About This Car
                    </a>
                  </Button>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 px-2 text-[0.85rem] font-bold text-text-secondary">
                    <Link
                      href={`${baseVehiclePath}?intent=viewing#contact-panel`}
                      className="transition-colors hover:text-accent"
                    >
                      Book a Visit / Test Drive
                    </Link>
                    <span className="hidden h-1 w-1 rounded-full bg-border md:block" />
                    <Link
                      href={`${baseVehiclePath}?intent=financing#contact-panel`}
                      className="transition-colors hover:text-accent"
                    >
                      See Payment Options
                    </Link>
                    <span className="hidden h-1 w-1 rounded-full bg-border md:block" />
                    <Link
                      href={`/trade-in?vehicle=${vehicle.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      Value Your Trade
                    </Link>
                  </div>
                </div>
                <div className="mt-5 border-t border-border/80 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Why buyers move quickly
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-text-secondary">
                    {buyerHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 inline-flex size-2 shrink-0 rounded-full bg-accent/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <Card className="rounded-[32px] p-7 lg:p-10">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-10">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">
                    Buyer guide
                  </p>
                  <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-text-primary">
                    Highlights buyers ask for
                  </h2>
                  <div className="mt-5">
                    <SpecGrid vehicle={vehicle} />
                  </div>
                </div>

                <div className="min-w-0 border-t border-border pt-7 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                  <h2 className="mt-3 text-[1.75rem] font-semibold tracking-tight text-text-primary">
                    Why this one stands out
                  </h2>
                  <ul className="mt-5 space-y-2.5 text-sm leading-7 text-text-secondary">
                    {overviewHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-3 inline-flex size-2 shrink-0 rounded-full bg-border" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-3 text-sm font-medium text-text-primary">
                    Mention ref {vehicle.stockCode} when you call or message and
                    sales will move faster.
                  </p>
                </div>
              </div>
            </Card>

            <div className="min-w-0 lg:sticky lg:top-28">
              <div id="contact-panel">
                <VehicleEnquiryForm
                  vehicleId={vehicle.id}
                  vehicleTitle={vehicle.title}
                  source="Vehicle detail page"
                  phoneHref={siteConfig.phoneHref}
                  phoneDisplay={siteConfig.phoneDisplay}
                  whatsappUrl={whatsappUrl}
                />
              </div>
            </div>
          </div>

          {similarVehicles.length ? (
            <div className="space-y-5">
              <h2 className="text-2xl font-semibold text-text-primary">
                Similar vehicles
              </h2>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {similarVehicles.map((item) => (
                  <VehicleCard key={item.id} vehicle={item} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <MobileCtaBar whatsappUrl={whatsappUrl} phoneHref={siteConfig.phoneHref} />
    </>
  );
}
