import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { env } from "@/lib/env";
import type { StockCategory, Vehicle, VehicleStatus } from "@/types/dealership";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path = "/") {
  return new URL(path, env.siteUrl).toString();
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-KE").format(value);
}

export function formatMileage(value: number) {
  return `${formatNumber(value)} km`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeStockCategory(category: StockCategory) {
  const labels: Record<StockCategory, string> = {
    new: "New",
    used: "Used",
    imported: "Imported",
    available_for_importation: "Available for Importation",
    traded_in: "Traded-in",
  };

  return labels[category];
}

export function humanizeStatus(status: VehicleStatus) {
  const labels: Record<VehicleStatus, string> = {
    draft: "Draft",
    published: "Published",
    sold: "Sold",
    unpublished: "Unpublished",
  };

  return labels[status];
}

export function buildVehicleUrl(vehicle: Pick<Vehicle, "slug">) {
  return `/cars/${vehicle.slug}`;
}

export function buildWhatsAppUrl(message: string, phone = "254700123456") {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function isTruthy(value: FormDataEntryValue | null) {
  return value === "true" || value === "on" || value === "1";
}

export function asOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

export function asOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function vehicleSearchText(vehicle: Vehicle) {
  return [
    vehicle.title,
    vehicle.make,
    vehicle.model,
    vehicle.year,
    vehicle.location?.name,
    vehicle.location?.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function sortByNewest<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
