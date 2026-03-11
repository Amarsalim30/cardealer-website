import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/layout/json-ld";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { TestDriveForm } from "@/components/forms/test-drive-form";
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
import { buildWhatsAppUrl, formatCurrency, formatMileage } from "@/lib/utils";

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

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />
      <section className="section-shell pb-28">
        <div className="container-shell space-y-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <VehicleGallery
              key={vehicle.id}
              images={vehicle.images}
              heroImageUrl={vehicle.heroImageUrl}
              title={vehicle.title}
            />

            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">
                  {vehicle.stockCategory.replaceAll("_", " ")}
                </Badge>
                {vehicle.negotiable ? (
                  <Badge variant="accent">Negotiable</Badge>
                ) : null}
                {vehicle.featured ? <Badge variant="muted">Featured</Badge> : null}
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
              </div>

              <Card className="rounded-[28px] p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                  Today&apos;s price
                </p>
                <p className="mt-3 text-4xl font-bold text-stone-950">
                  {formatCurrency(vehicle.price)}
                </p>
                <p className="mt-3 text-sm text-stone-600">
                  Price reflects current stock positioning. Use the primary CTAs
                  below for negotiation, financing questions, or viewing
                  confirmation.
                </p>
                <div className="mt-6 grid gap-3">
                  <Button asChild className="w-full">
                    <a href="#quote-form">Get Today&apos;s Price</a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <a href="#test-drive-form">Book Test Drive / Viewing</a>
                  </Button>
                  <Button asChild variant="dark" className="w-full">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="size-4" />
                      WhatsApp This Car
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/financing?vehicle=${vehicle.slug}`}>
                      Ask About Financing
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={`/trade-in?vehicle=${vehicle.slug}`}>
                      Value Your Trade
                    </Link>
                  </Button>
                </div>
              </Card>

              <div className="rounded-[28px] border border-border bg-white/70 p-6 text-sm leading-7 text-stone-600">
                <p className="font-semibold text-stone-900">Buyer summary</p>
                <ul className="mt-4 space-y-2">
                  {buyerSummary.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 inline-flex size-2 shrink-0 rounded-full bg-primary/70" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-10">
              <Card className="rounded-[28px] p-8">
                <h2 className="text-2xl font-semibold text-stone-950">
                  Core specifications
                </h2>
                <div className="mt-6">
                  <SpecGrid vehicle={vehicle} />
                </div>
              </Card>

              <Card className="rounded-[28px] p-8">
                <h2 className="text-2xl font-semibold text-stone-950">
                  Vehicle overview
                </h2>
                <div className="mt-5 space-y-4 text-sm leading-8 text-stone-600">
                  <p>{vehicle.description}</p>
                  <p>
                    Use the action buttons on this page to confirm live
                    availability, ask for a walk-around video, or book a viewing
                    slot before you travel.
                  </p>
                </div>
              </Card>

              {similarVehicles.length ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-stone-950">
                    Similar vehicles
                  </h2>
                  <div className="grid gap-6 lg:grid-cols-3">
                    {similarVehicles.map((item) => (
                      <VehicleCard key={item.id} vehicle={item} />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div id="quote-form">
                <LeadCaptureForm
                  title="Get today's price"
                  description="Ask about availability, negotiation, and current deal terms for this vehicle."
                  leadType="quote"
                  source="Vehicle detail page"
                  vehicleId={vehicle.id}
                  vehicleTitle={vehicle.title}
                  submitLabel="Request Quote"
                />
              </div>
              <div id="test-drive-form">
                <TestDriveForm
                  vehicleId={vehicle.id}
                  vehicleTitle={vehicle.title}
                  source="Vehicle detail page"
                />
              </div>
              <Card className="rounded-[28px] p-6">
                <h3 className="text-xl font-semibold text-stone-950">
                  Speak to sales
                </h3>
                <div className="mt-5 space-y-3">
                  <Button asChild className="w-full">
                    <a href={siteConfig.phoneHref}>
                      <Phone className="size-4" />
                      Call {siteConfig.phoneDisplay}
                    </a>
                  </Button>
                  <Button asChild variant="secondary" className="w-full">
                    <a href={whatsappUrl} target="_blank" rel="noreferrer">
                      <WhatsAppIcon className="size-4" />
                      WhatsApp Sales
                    </a>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <MobileCtaBar whatsappUrl={whatsappUrl} phoneHref={siteConfig.phoneHref} />
    </>
  );
}
