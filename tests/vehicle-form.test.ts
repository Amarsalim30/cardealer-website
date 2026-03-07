import { describe, expect, it } from "vitest";

import { mapVehicleFormData } from "@/lib/vehicle-form";

describe("mapVehicleFormData", () => {
  it("maps form data into a typed vehicle payload", () => {
    const formData = new FormData();
    formData.set("title", "2020 Toyota Prado");
    formData.set("make", "Toyota");
    formData.set("model", "Prado");
    formData.set("year", "2020");
    formData.set("condition", "Foreign used");
    formData.set("price", "6500000");
    formData.set("mileage", "42000");
    formData.set("transmission", "Automatic");
    formData.set("fuelType", "Diesel");
    formData.set("status", "published");
    formData.set("stockCategory", "used");
    formData.set("description", "A clean SUV with strong condition notes and ready availability.");
    formData.set(
      "imagesJson",
      JSON.stringify([
        {
          imageUrl: "https://example.com/car.jpg",
          sortOrder: 0,
          isHero: true,
        },
      ]),
    );

    const result = mapVehicleFormData(formData);

    expect(result.title).toBe("2020 Toyota Prado");
    expect(result.price).toBe(6500000);
    expect(result.images).toHaveLength(1);
    expect(result.images[0].isHero).toBe(true);
  });
});
