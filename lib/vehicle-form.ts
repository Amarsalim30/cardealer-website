import { vehicleFormSchema } from "@/lib/validation/vehicle";
import {
  asOptionalNumber,
  asOptionalString,
  isTruthy,
  normalizeStockCode,
} from "@/lib/utils";
import type { VehicleFormInput, VehicleImageInput } from "@/types/dealership";

function isBlobUrl(value: unknown) {
  return typeof value === "string" && /^blob:/i.test(value.trim());
}

function resolveUploadState(image: VehicleImageInput) {
  if (image.uploadState) {
    return image.uploadState;
  }

  if (image.sourceUrl) {
    return "pending_url" as const;
  }

  if (
    image.pendingFileId ||
    typeof image.pendingFileOrder === "number" ||
    isBlobUrl(image.imageUrl)
  ) {
    return "pending_file" as const;
  }

  return "uploaded" as const;
}

function parseImages(value: string | undefined): VehicleImageInput[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as VehicleImageInput[];
    return parsed.map((image, index) => ({
      ...image,
      sortOrder: image.sortOrder ?? index,
      isHero: Boolean(image.isHero),
      uploadState: resolveUploadState(image),
      sourceUrl: image.sourceUrl || undefined,
      pendingFileId: image.pendingFileId || undefined,
      pendingFileOrder:
        typeof image.pendingFileOrder === "number"
          ? image.pendingFileOrder
          : undefined,
    }));
  } catch {
    return [];
  }
}

export function mapVehicleFormData(formData: FormData): VehicleFormInput {
  const payload = {
    id: asOptionalString(formData.get("id")),
    title: asOptionalString(formData.get("title")) || "",
    stockCode: normalizeStockCode(
      asOptionalString(formData.get("stockCode")) || "",
    ),
    slug: asOptionalString(formData.get("slug")),
    make: asOptionalString(formData.get("make")) || "",
    model: asOptionalString(formData.get("model")) || "",
    year: asOptionalNumber(formData.get("year")) || 0,
    condition: asOptionalString(formData.get("condition")) || "",
    price: asOptionalNumber(formData.get("price")) || 0,
    negotiable: isTruthy(formData.get("negotiable")),
    mileage: asOptionalNumber(formData.get("mileage")) || 0,
    transmission: asOptionalString(formData.get("transmission")) || "",
    fuelType: asOptionalString(formData.get("fuelType")) || "",
    driveType: asOptionalString(formData.get("driveType")),
    bodyType: asOptionalString(formData.get("bodyType")),
    engineCapacity: asOptionalString(formData.get("engineCapacity")),
    color: asOptionalString(formData.get("color")),
    locationId: asOptionalString(formData.get("locationId")),
    featured: isTruthy(formData.get("featured")),
    status: asOptionalString(formData.get("status")) || "draft",
    stockCategory:
      asOptionalString(formData.get("stockCategory")) || "used",
    description: asOptionalString(formData.get("description")) || "",
    images: parseImages(asOptionalString(formData.get("imagesJson"))),
  };

  return vehicleFormSchema.parse(payload);
}
