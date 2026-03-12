import { z } from "zod";

import { stockCategories, vehicleStatuses } from "@/types/dealership";

const nullishSchema = z.union([z.null(), z.undefined()]);
const httpImageUrlSchema = z
  .string()
  .trim()
  .url("Use a valid image URL.")
  .refine((value) => /^https?:\/\//i.test(value), "Use a valid image URL.");
const blobImageUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => /^blob:/i.test(value),
    "Staged files must use a blob preview URL.",
  );
const vehicleImageBaseSchema = z.object({
  altText: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  isHero: z.boolean(),
});

const uploadedVehicleImageSchema = vehicleImageBaseSchema.extend({
  uploadState: z.literal("uploaded"),
  imageUrl: httpImageUrlSchema,
  cloudinaryPublicId: z.string().trim().min(1).optional().nullable(),
  sourceUrl: nullishSchema,
  pendingFileId: nullishSchema,
  pendingFileOrder: nullishSchema,
});

const pendingUrlVehicleImageSchema = vehicleImageBaseSchema.extend({
  uploadState: z.literal("pending_url"),
  imageUrl: httpImageUrlSchema,
  sourceUrl: httpImageUrlSchema,
  cloudinaryPublicId: nullishSchema,
  pendingFileId: nullishSchema,
  pendingFileOrder: nullishSchema,
});

const pendingFileVehicleImageSchema = vehicleImageBaseSchema.extend({
  uploadState: z.literal("pending_file"),
  imageUrl: blobImageUrlSchema,
  cloudinaryPublicId: nullishSchema,
  sourceUrl: nullishSchema,
  pendingFileId: z
    .string({ error: "Staged files are missing. Add them again." })
    .trim()
    .min(1, "Staged files are missing. Add them again."),
  pendingFileOrder: z
    .number({ error: "Staged files are missing. Add them again." })
    .int()
    .min(0),
});

export const vehicleImageSchema = z.discriminatedUnion("uploadState", [
  uploadedVehicleImageSchema,
  pendingUrlVehicleImageSchema,
  pendingFileVehicleImageSchema,
]);

export const vehicleFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(3, "Enter a vehicle title."),
  stockCode: z
    .string()
    .trim()
    .min(3, "Enter a stock code.")
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only."),
  slug: z.string().trim().optional(),
  make: z.string().trim().min(2, "Enter the make."),
  model: z.string().trim().min(1, "Enter the model."),
  year: z.coerce
    .number()
    .int()
    .min(1990, "Enter a realistic year.")
    .max(new Date().getFullYear() + 1, "Enter a realistic year."),
  condition: z.string().trim().min(2, "Enter the condition."),
  price: z.coerce.number().min(0, "Enter a valid price."),
  negotiable: z.boolean(),
  mileage: z.coerce.number().int().min(0, "Enter a valid mileage."),
  transmission: z.string().trim().min(2, "Enter the transmission."),
  fuelType: z.string().trim().min(2, "Enter the fuel type."),
  driveType: z.string().trim().optional(),
  bodyType: z.string().trim().optional(),
  engineCapacity: z.string().trim().optional(),
  color: z.string().trim().optional(),
  locationId: z.string().trim().optional(),
  featured: z.boolean(),
  status: z.enum(vehicleStatuses),
  stockCategory: z.enum(stockCategories),
  description: z.string().trim().min(20, "Enter a stronger description."),
  images: z.array(vehicleImageSchema),
});
