import { describe, expect, it } from "vitest";

import { buildWhatsAppUrl } from "@/lib/utils";

describe("CTA helpers", () => {
  it("builds encoded whatsapp links", () => {
    const url = buildWhatsAppUrl("Hi, is this car available?", "254700123456");

    expect(url).toContain("wa.me/254700123456");
    expect(url).toContain("Hi%2C%20is%20this%20car%20available%3F");
  });
});
