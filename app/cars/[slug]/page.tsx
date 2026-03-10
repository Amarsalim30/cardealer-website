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
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

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

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={vehicleJsonLd} />
      <section className="section-shell pb-28">
        <div className="container-shell space-y-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <VehicleGallery images={vehicle.images} title={vehicle.title} />

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
                <div className="mt-5 flex items-center gap-2 text-sm text-stone-600">
                  <MapPin className="size-4" />
                  {vehicle.location?.name || "Mombasa showroom"}
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
                <p className="font-semibold text-stone-900">Trust highlights</p>
                <ul className="mt-4 space-y-2">
                  <li>
                    Clean summary of condition, key specs, and showroom location.
                  </li>
                  <li>
                    Fast phone and WhatsApp contact without forcing long forms.
                  </li>
                  <li>
                    Support for finance discussions, trade-ins, and viewing scheduling.
                  </li>
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
                <p className="mt-5 text-sm leading-8 text-stone-600">
                  {vehicle.description}
                </p>
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
