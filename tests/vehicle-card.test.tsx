import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VehicleCard } from "@/components/inventory/vehicle-card";
import { createDemoData } from "@/lib/data/demo-data";

describe("VehicleCard", () => {
  it("renders core vehicle information", () => {
    const vehicle = createDemoData().vehicles[0];

    render(<VehicleCard vehicle={vehicle} />);

    expect(screen.getByText(vehicle.title)).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(screen.getByText(/Ksh/i)).toBeInTheDocument();
  });
});
