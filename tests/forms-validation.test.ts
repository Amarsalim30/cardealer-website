import { describe, expect, it } from "vitest";

import {
  leadFormSchema,
  testDriveFormSchema,
  tradeInFormSchema,
} from "@/lib/validation/forms";

describe("form schemas", () => {
  it("validates a lead enquiry", () => {
    const result = leadFormSchema.safeParse({
      leadType: "quote",
      name: "Jane Doe",
      phone: "+254700000000",
      email: "jane@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = leadFormSchema.safeParse({
      leadType: "quote",
      name: "Jane Doe",
      phone: "+254700000000",
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("validates a test drive request", () => {
    const result = testDriveFormSchema.safeParse({
      name: "Mark",
      phone: "+254700000000",
      preferredDate: "2026-03-09",
    });

    expect(result.success).toBe(true);
  });

  it("requires trade-in vehicle basics", () => {
    const result = tradeInFormSchema.safeParse({
      name: "Susan",
      phone: "+254700000000",
      currentVehicleMake: "Toyota",
      currentVehicleModel: "Auris",
      currentVehicleYear: 2014,
    });

    expect(result.success).toBe(true);
  });
});
