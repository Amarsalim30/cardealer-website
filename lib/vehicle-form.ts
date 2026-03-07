import { vehicleFormSchema } from "@/lib/validation/vehicle";
import { asOptionalNumber, asOptionalString, isTruthy } from "@/lib/utils";
import type { VehicleFormInput, VehicleImageInput } from "@/types/dealership";

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
    }));
  } catch {
    return [];
  }
}

export function mapVehicleFormData(formData: FormData): VehicleFormInput {
  const payload = {
    id: asOptionalString(formData.get("id")),
    title: asOptionalString(formData.get("title")) || "",
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
