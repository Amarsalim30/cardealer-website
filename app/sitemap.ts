import type { MetadataRoute } from "next";

import { getAllVehicles } from "@/lib/data/repository";
import { absoluteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await getAllVehicles();
  const publicVehicles = vehicles.filter((vehicle) => vehicle.status === "published");

  const staticRoutes = [
    "/",
    "/inventory",
    "/inventory/new",
    "/inventory/used",
    "/inventory/imported",
    "/inventory/traded-in",
    "/financing",
    "/trade-in",
    "/about",
    "/contact",
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: absoluteUrl(path),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...publicVehicles.map((vehicle) => ({
      url: absoluteUrl(`/cars/${vehicle.slug}`),
      lastModified: new Date(vehicle.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
