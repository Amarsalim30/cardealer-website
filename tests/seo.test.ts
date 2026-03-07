import { describe, expect, it } from "vitest";

import { buildMetadata, buildVehicleJsonLd } from "@/lib/seo";
import { createDemoData } from "@/lib/data/demo-data";

describe("SEO helpers", () => {
  it("builds metadata with canonical URLs", () => {
    const metadata = buildMetadata({
      title: "Inventory",
      description: "Browse vehicles",
      path: "/inventory",
    });

    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/inventory");
    expect(metadata.openGraph?.url).toBe("http://localhost:3000/inventory");
  });

  it("builds vehicle product json-ld", () => {
    const vehicle = createDemoData().vehicles[0];
    const jsonLd = buildVehicleJsonLd(vehicle);

    expect(jsonLd["@type"]).toBe("Product");
    expect(jsonLd.name).toBe(vehicle.title);
    expect(jsonLd.offers.price).toBe(vehicle.price);
  });
});
