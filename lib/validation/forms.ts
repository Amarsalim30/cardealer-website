import { z } from "zod";

import { leadTypes } from "@/types/dealership";

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => !value || z.email().safeParse(value).success, {
    message: "Enter a valid email address.",
  });

export const leadFormSchema = z.object({
  vehicleId: z.string().trim().optional(),
  vehicleTitle: z.string().trim().optional(),
  leadType: z.enum(leadTypes),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  email: optionalEmail,
  message: z
    .string()
    .trim()
    .max(800, "Keep the message under 800 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  source: z.string().trim().optional(),
  utmSource: z.string().trim().optional(),
  utmMedium: z.string().trim().optional(),
  utmCampaign: z.string().trim().optional(),
});

export const testDriveFormSchema = z.object({
  vehicleId: z.string().trim().optional(),
  vehicleTitle: z.string().trim().optional(),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  email: optionalEmail,
  preferredDate: z.string().trim().min(1, "Select your preferred date."),
  preferredTime: z.string().trim().optional(),
  message: z
    .string()
    .trim()
    .max(800, "Keep the message under 800 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  source: z.string().trim().optional(),
});

export const tradeInFormSchema = z.object({
  desiredVehicleId: z.string().trim().optional(),
  desiredVehicleTitle: z.string().trim().optional(),
  name: z.string().trim().min(2, "Enter your name."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  email: optionalEmail,
  currentVehicleMake: z.string().trim().min(2, "Enter the make."),
  currentVehicleModel: z.string().trim().min(1, "Enter the model."),
  currentVehicleYear: z.coerce
    .number()
    .int()
    .min(1990, "Enter a realistic year.")
    .max(new Date().getFullYear() + 1, "Enter a realistic year."),
  currentVehicleMileage: z.coerce.number().int().min(0).optional(),
  conditionNotes: z
    .string()
    .trim()
    .max(800, "Keep the notes under 800 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  message: z
    .string()
    .trim()
    .max(800, "Keep the message under 800 characters.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  source: z.string().trim().optional(),
});
