import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const router = {
  refresh: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/lib/actions/admin-actions", () => ({
  deleteVehicleAction: vi.fn(),
  setVehicleStatusAction: vi.fn(),
  toggleVehicleFeaturedAction: vi.fn(),
}));

import { VehicleRowActions } from "@/components/admin/vehicle-row-actions";

describe("VehicleRowActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires a second confirmation step before delete is shown", () => {
    render(
      <VehicleRowActions
        featured={false}
        status="published"
        vehicleId="vehicle-1"
      />,
    );

    expect(screen.queryByText(/confirm delete/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /actions/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete vehicle/i }));

    expect(
      screen.getByText(
        "This removes the listing from the admin inventory.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm delete/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));

    expect(screen.queryByText(/confirm delete/i)).not.toBeInTheDocument();
  });
});
