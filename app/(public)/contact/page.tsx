import type { Metadata } from "next";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  PhoneCall,
} from "lucide-react";

import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { SectionHeading } from "@/components/marketing/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/lib/config/site";
import { getLocations } from "@/lib/data/repository";
import { buildMetadata } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/utils";
import type { Location } from "@/types/dealership";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact the dealership, review location details, and send a short enquiry from the contact page.",
  path: "/contact",
});

function getLocationPhoneHref(phone: string) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function getLocationEmail(location: Location) {
  if (!location.email) {
    return null;
  }

  if (!location.email.endsWith(".demo")) {
    return location.email;
  }

  if (location.email.includes("oceanmotors")) {
    return location.email;
  }

  const demoEmailDomain =
    siteConfig.salesEmail.split("@")[1] || "oceanmotors.demo";
  return location.isPrimary
    ? siteConfig.salesEmail
    : `yard@${demoEmailDomain}`;
}

function getLocationMapHref(location: Location) {
  return (
    location.mapUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(
      `${location.addressLine} ${location.city}`,
    )}`
  );
}

export default async function ContactPage() {
  const locations = await getLocations();
  const generalWhatsAppUrl = buildWhatsAppUrl(
    "Hi, I would like directions, available cars, and the fastest way to book a viewing.",
    siteConfig.whatsappNumber,
  );

  return (
    <section className="section-shell">
      <div className="container-shell space-y-10">
        <SectionHeading
          as="h1"
          eyebrow="Contact and locations"
          title="Call, WhatsApp, or get directions before you visit"
          description="If you already know the car you want, call or message sales. If you still need guidance, use the enquiry form and we will point you to the right showroom or yard."
        />

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-5">
            {locations.map((location) => {
              const phoneHref = getLocationPhoneHref(location.phone);
              const email = getLocationEmail(location);
              const mapHref = getLocationMapHref(location);

              return (
                <Card key={location.id} className="rounded-[28px] p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-stone-950">
                        {location.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        Visit for viewings, stock checks, and final confirmation before you make a move.
                      </p>
                    </div>
                    {location.isPrimary ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-primary">
                        Main showroom
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 text-sm leading-6 text-stone-600 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-1 size-4 text-stone-400" />
                      <div>
                        <p>{location.addressLine}</p>
                        <p>{location.city}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-1 size-4 text-stone-400" />
                      <p>{location.hours}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <PhoneCall className="mt-1 size-4 text-stone-400" />
                      <a
                        href={phoneHref}
                        className="font-medium text-stone-900 transition-colors hover:text-primary"
                      >
                        {location.phone}
                      </a>
                    </div>
                    {email ? (
                      <div className="flex items-start gap-3">
                        <ArrowUpRight className="mt-1 size-4 text-stone-400" />
                        <a
                          href={`mailto:${email}`}
                          className="font-medium text-stone-900 transition-colors hover:text-primary"
                        >
                          {email}
                        </a>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <Button asChild className="h-11">
                      <a href={phoneHref}>Call now</a>
                    </Button>
                    <Button asChild variant="secondary" className="h-11">
                      <a href={mapHref} target="_blank" rel="noreferrer">
                        Directions
                      </a>
                    </Button>
                    <Button asChild variant="dark" className="h-11">
                      <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="space-y-5 lg:sticky lg:top-28">
            <Card className="rounded-[28px] border-stone-900 bg-stone-950 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
                Need a fast answer?
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Talk to sales before you leave home
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                Confirm availability, check which location has the car, or ask for directions on WhatsApp.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Button asChild className="h-11">
                  <a href={siteConfig.phoneHref}>Call {siteConfig.phoneDisplay}</a>
                </Button>
                <Button asChild className="h-11 bg-[#25d366] text-white hover:bg-[#1fb85a]">
                  <a href={generalWhatsAppUrl} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    WhatsApp sales
                  </a>
                </Button>
              </div>
            </Card>
            <LeadCaptureForm
              className="rounded-[28px]"
              title="Send a quick enquiry"
              description="Ask about stock, opening hours, directions, finance, or the next best car for your budget."
              leadType="contact"
              source="Contact page"
              submitLabel="Send Enquiry"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
