import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InventoryFilterBar } from "@/components/inventory/inventory-filter-bar";

describe("InventoryFilterBar", () => {
  it("keeps the empty placeholder option selectable", () => {
    const { container } = render(
      <InventoryFilterBar
        query={{ make: "Toyota" }}
        facets={{
          makes: ["Toyota", "Mazda"],
          locations: ["Mombasa"],
          transmissions: ["Automatic"],
          fuelTypes: ["Diesel"],
          minPrice: 1000000,
          maxPrice: 7000000,
        }}
      />,
    );

    const makeSelect = container.querySelector(
      'select[name="make"]',
    ) as HTMLSelectElement | null;
    const placeholderOption = makeSelect?.querySelector(
      'option[value=""]',
    ) as HTMLOptionElement | null;

    expect(makeSelect).not.toBeNull();
    expect(placeholderOption).not.toBeNull();
    expect(placeholderOption).not.toBeDisabled();
  });
});
