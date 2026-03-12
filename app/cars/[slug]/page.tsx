import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
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

function buildQuickFacts(vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>) {
  return [
    `${vehicle.transmission} transmission`,
    `${vehicle.fuelType} fuel`,
    vehicle.bodyType ? `${vehicle.bodyType} body` : null,
    vehicle.mileage > 0 ? formatMileage(vehicle.mileage) : null,
  ].filter((value): value is string => Boolean(value));
}

function buildBuyerSummary(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
  photoCount: number,
) {
  return [
    vehicle.condition
      ? `Condition listed as ${vehicle.condition}.`
      : "Condition details available on request.",
    photoCount
      ? `Gallery includes ${photoCount} photo${photoCount === 1 ? "" : "s"} so buyers can review the car before they call.`
      : "Fresh photos can be shared directly on WhatsApp while the gallery is being updated.",
    `Available for viewing at ${vehicle.location?.name || "our Mombasa showroom"}.`,
    vehicle.negotiable
      ? "Price discussion is available after viewing and inspection."
      : "Ask sales for current pricing, finance guidance, and the fastest next step.",
    `Reference stock code ${vehicle.stockCode} when you call or message for faster assistance.`,
  ];
}

function buildOverviewHighlights(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  return [
    vehicle.mileage > 0
      ? `Mileage currently listed at ${formatMileage(vehicle.mileage)}.`
      : null,
    vehicle.engineCapacity
      ? `${vehicle.engineCapacity} engine paired with ${vehicle.transmission.toLowerCase()} transmission.`
      : `${vehicle.transmission} transmission with ${vehicle.fuelType.toLowerCase()} power.`,
    vehicle.condition ? `${vehicle.condition} condition noted on the listing.` : null,
    `Available for viewing at ${vehicle.location?.name || "our Mombasa showroom"}.`,
  ].filter((value): value is string => Boolean(value));
}

function buildDetailBadges(
  vehicle: NonNullable<Awaited<ReturnType<typeof getVehicleBySlug>>>,
) {
  const stockLabel = (() => {
    switch (vehicle.stockCategory) {
      case "available_for_importation":
        return "Available to import";
      case "traded_in":
        return "Traded-in unit";
      default:
        return `${humanizeStockCategory(vehicle.stockCategory)} stock`;
    }
  })();

  return [
    vehicle.featured
      ? {
          label: "Featured",
          variant: "default" as const,
          className: "bg-primary text-white shadow-[0_10px_24px_rgba(165,90,42,0.18)]",
        }
      : null,
    vehicle.negotiable
      ? {
          label: "Negotiable",
          variant: "muted" as const,
          className: "border border-stone-200 bg-white text-stone-700",
        }
      : null,
    {
      label: stockLabel,
      variant: "muted" as const,
      className: "bg-stone-200 text-stone-700",
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
  const quickFacts = buildQuickFacts(vehicle);
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
                <h1 className="display-font text-balance text-5xl leading-tight text-stone-950">
                  {vehicle.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="size-4" />
                    {vehicle.location?.name || "Mombasa showroom"}
                  </div>
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Stock code {vehicle.stockCode}
                  </span>
                </div>
              </div>

              <Card className="rounded-[28px] border-stone-200 bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_100%)] p-6 shadow-[0_18px_40px_rgba(41,26,7,0.08)] lg:p-7">
                <p className="text-sm font-medium text-stone-500">
                  Price
                </p>
                <p className="mt-3 text-[clamp(2.9rem,6vw,5.25rem)] font-black leading-none tracking-[-0.04em] text-stone-950">
                  {formatCurrency(vehicle.price)}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {quickFacts.map((fact) => (
                    <span
                      key={fact}
                      className="rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-stone-700"
                    >
                      {fact}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-stone-600">
                  The fastest path is WhatsApp. Use the secondary actions only if
                  you already know the next step you want.
                </p>
                <div className="mt-5 grid gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full shadow-[0_18px_40px_rgba(185,106,43,0.28)]"
                  >
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="size-4" />
                      WhatsApp This Car
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`${baseVehiclePath}?intent=viewing#contact-panel`}>
                      Book Test Drive / Viewing
                    </Link>
                  </Button>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm font-semibold text-stone-600">
                    <Link
                      href={`${baseVehiclePath}?intent=financing#contact-panel`}
                      className="transition-colors hover:text-stone-950 hover:underline"
                    >
                      Ask About Financing
                    </Link>
                    <Link
                      href={`/trade-in?vehicle=${vehicle.slug}`}
                      className="transition-colors hover:text-stone-950 hover:underline"
                    >
                      Value Your Trade
                    </Link>
                  </div>
                </div>
                <div className="mt-5 border-t border-stone-200/80 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Before you enquire
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
                    {buyerHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 inline-flex size-2 shrink-0 rounded-full bg-primary/70" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <Card className="rounded-[28px] p-6 lg:p-7">
              <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:gap-10">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Vehicle details
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-stone-950">
                    Core specifications
                  </h2>
                  <div className="mt-5">
                    <SpecGrid vehicle={vehicle} />
                  </div>
                </div>

                <div className="min-w-0 border-t border-stone-200 pt-7 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
                  <h2 className="mt-3 text-2xl font-semibold text-stone-950">
                    What to expect
                  </h2>
                  <ul className="mt-5 space-y-2.5 text-sm leading-7 text-stone-600">
                    {overviewHighlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-3 inline-flex size-2 shrink-0 rounded-full bg-stone-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="pt-3 text-sm font-medium text-stone-700">
                    Reference stock code {vehicle.stockCode} when you call or
                    message so the team can move faster.
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
              <h2 className="text-2xl font-semibold text-stone-950">
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
