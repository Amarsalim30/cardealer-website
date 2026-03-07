import { z } from "zod";

import { stockCategories, vehicleStatuses } from "@/types/dealership";

export const vehicleImageSchema = z.object({
  imageUrl: z.string().url("Use a valid image URL."),
  altText: z.string().trim().optional(),
  cloudinaryPublicId: z.string().trim().optional(),
  sortOrder: z.number().int().min(0),
  isHero: z.boolean(),
});

export const vehicleFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(3, "Enter a vehicle title."),
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
  images: z.array(vehicleImageSchema).min(1, "Add at least one image."),
});
