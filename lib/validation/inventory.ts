import { z } from "zod";

import { inventorySortOptions } from "@/types/dealership";

const searchParamString = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  });

const optionalNumberString = searchParamString.transform((value) => {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
});

export const inventoryQuerySchema = z.object({
  q: searchParamString,
  make: searchParamString,
  category: searchParamString
    .refine(
      (value) =>
        !value ||
        ["new", "used", "imported", "traded-in"].includes(value.trim()),
    )
    .transform(
      (value) =>
        value as "new" | "used" | "imported" | "traded-in" | undefined,
    ),
  location: searchParamString,
  minPrice: optionalNumberString,
  maxPrice: optionalNumberString,
  yearFrom: optionalNumberString,
  yearTo: optionalNumberString,
  transmission: searchParamString,
  fuelType: searchParamString,
  sort: searchParamString
    .refine(
      (value) =>
        !value ||
        inventorySortOptions.includes(
          value as (typeof inventorySortOptions)[number],
        ),
    )
    .transform(
      (value) =>
        value as (typeof inventorySortOptions)[number] | undefined,
    ),
  page: optionalNumberString.transform((value) => value ?? 1),
  pageSize: optionalNumberString.transform((value) => value ?? 9),
});

export function parseInventoryQuery(
  raw: Record<string, string | string[] | undefined>,
) {
  return inventoryQuerySchema.parse(raw);
}
