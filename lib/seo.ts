import type { Metadata } from "next";

import { siteConfig } from "@/lib/config/site";
import { absoluteUrl, formatCurrency } from "@/lib/utils";
import type { Location, Vehicle } from "@/types/dealership";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: MetadataInput): Metadata {
  const url = absoluteUrl(path);
  const metaTitle = `${title} | ${siteConfig.name}`;
  const imageUrl = image || absoluteUrl("/og-dealership.svg");

  return {
    title: metaTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: metaTitle,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description,
      images: [imageUrl],
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function buildAutoDealerJsonLd(locations: Location[]) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    telephone: siteConfig.phoneDisplay,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: siteConfig.region.split(",")[0],
      addressCountry: "KE",
    },
    areaServed: "Kenya",
    location: locations.map((location) => ({
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: location.addressLine,
        addressLocality: location.city,
        addressCountry: "KE",
      },
      telephone: location.phone,
    })),
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildItemListJsonLd(vehicles: Vehicle[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/cars/${vehicle.slug}`),
      name: vehicle.title,
    })),
  };
}

export function buildVehicleJsonLd(vehicle: Vehicle) {
  const imageUrls = vehicle.images.length
    ? vehicle.images.map((image) => image.imageUrl)
    : vehicle.heroImageUrl
      ? [vehicle.heroImageUrl]
      : [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.title,
    description: vehicle.description,
    image: imageUrls,
    brand: {
      "@type": "Brand",
      name: vehicle.make,
    },
    model: vehicle.model,
    category: vehicle.bodyType || vehicle.stockCategory,
    itemCondition: "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: vehicle.price,
      availability:
        vehicle.status === "published"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/cars/${vehicle.slug}`),
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Year", value: vehicle.year },
      {
        "@type": "PropertyValue",
        name: "Transmission",
        value: vehicle.transmission,
      },
      { "@type": "PropertyValue", name: "Fuel type", value: vehicle.fuelType },
      { "@type": "PropertyValue", name: "Mileage", value: vehicle.mileage },
      {
        "@type": "PropertyValue",
        name: "Price",
        value: formatCurrency(vehicle.price),
      },
    ],
  };
}
