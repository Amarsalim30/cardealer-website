import { describe, expect, it } from "vitest";

import { parseInventoryQuery } from "@/lib/validation/inventory";

describe("parseInventoryQuery", () => {
  it("coerces numeric fields and sets defaults", () => {
    const result = parseInventoryQuery({
      make: "Toyota",
      minPrice: "1000000",
      page: "2",
      sort: "price-desc",
    });

    expect(result.make).toBe("Toyota");
    expect(result.minPrice).toBe(1000000);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(9);
    expect(result.sort).toBe("price-desc");
  });

  it("picks the first value from array search params", () => {
    const result = parseInventoryQuery({
      category: ["used", "new"],
      q: ["prado", "cx5"],
    });

    expect(result.category).toBe("used");
    expect(result.q).toBe("prado");
  });
});
