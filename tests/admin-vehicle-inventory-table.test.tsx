import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const runBulkActionMock = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: () => [
      {
        success: false,
        message: "",
      },
      runBulkActionMock,
    ],
  };
});

vi.mock("@/components/admin/vehicle-row-actions", () => ({
  VehicleRowActions: () => <button type="button">More</button>,
}));

vi.mock("@/lib/actions/admin-actions", () => ({
  bulkVehicleAction: vi.fn(),
}));

import { AdminVehicleInventoryTable } from "@/components/admin/admin-vehicle-inventory-table";

const items = [
  {
    id: "vehicle-1",
    title: "2021 Toyota Corolla",
    stockCode: "COR-001",
    slug: "2021-toyota-corolla",
    make: "Toyota",
    model: "Corolla",
    year: 2021,
    condition: "Foreign used",
    price: 2150000,
    negotiable: false,
    mileage: 24000,
    transmission: "Automatic",
    fuelType: "Petrol",
    driveType: null,
    bodyType: "Sedan",
    engineCapacity: null,
    color: "White",
    locationId: "location-1",
    location: {
      id: "location-1",
      name: "Mombasa yard",
      addressLine: "Nyali",
      city: "Mombasa",
      phone: "+254700000000",
      email: null,
      hours: "8am - 6pm",
      mapUrl: null,
      isPrimary: true,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    featured: true,
    status: "published" as const,
    stockCategory: "used" as const,
    description: "Featured Corolla",
    heroImageUrl: null,
    images: [],
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-11T00:00:00.000Z",
  },
  {
    id: "vehicle-2",
    title: "2018 Mazda CX-5",
    stockCode: "CX5-001",
    slug: "2018-mazda-cx5",
    make: "Mazda",
    model: "CX-5",
    year: 2018,
    condition: "Locally used",
    price: 2650000,
    negotiable: false,
    mileage: 62000,
    transmission: "Automatic",
    fuelType: "Diesel",
    driveType: null,
    bodyType: "SUV",
    engineCapacity: null,
    color: "Grey",
    locationId: "location-2",
    location: {
      id: "location-2",
      name: "Nairobi yard",
      addressLine: "Westlands",
      city: "Nairobi",
      phone: "+254711111111",
      email: null,
      hours: "8am - 6pm",
      mapUrl: null,
      isPrimary: false,
      createdAt: "2026-03-01T00:00:00.000Z",
    },
    featured: false,
    status: "draft" as const,
    stockCategory: "traded_in" as const,
    description: "Draft Mazda",
    heroImageUrl: null,
    images: [],
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-09T00:00:00.000Z",
  },
];

describe("AdminVehicleInventoryTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows bulk actions after selecting rows and supports select-all-visible", () => {
    render(<AdminVehicleInventoryTable items={items} viewKey="view-a" />);

    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Select all visible rows"));

    expect(screen.getByText("2 selected")).toBeInTheDocument();
    expect(
      screen.getAllByRole("checkbox", { checked: true }).length,
    ).toBeGreaterThanOrEqual(3);
  });

  it("requires confirmation before bulk delete", () => {
    render(<AdminVehicleInventoryTable items={items} viewKey="view-a" />);

    fireEvent.click(screen.getByLabelText("Select all visible rows"));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByText("Confirm bulk delete")).toBeInTheDocument();
    expect(runBulkActionMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Confirm delete" }));

    expect(runBulkActionMock).toHaveBeenCalled();
  });

  it("requires inline confirmation before mark sold", () => {
    render(<AdminVehicleInventoryTable items={items} viewKey="view-a" />);

    fireEvent.click(screen.getByLabelText("Select all visible rows"));
    fireEvent.click(screen.getByRole("button", { name: "Mark sold" }));

    expect(
      screen.getByRole("button", { name: "Confirm mark sold" }),
    ).toBeInTheDocument();
    expect(runBulkActionMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Confirm mark sold")).not.toBeInTheDocument();
  });

  it("clears selection when view key changes", () => {
    const { rerender } = render(
      <AdminVehicleInventoryTable key="view-a" items={items} viewKey="view-a" />,
    );

    fireEvent.click(screen.getAllByLabelText("Select 2021 Toyota Corolla")[0]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    rerender(
      <AdminVehicleInventoryTable key="view-b" items={items} viewKey="view-b" />,
    );

    expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
  });

  it("keeps mobile rows focused on single-item actions", () => {
    render(<AdminVehicleInventoryTable items={items} viewKey="view-a" />);

    expect(screen.getAllByLabelText("Select 2021 Toyota Corolla")).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Edit" }).length).toBeGreaterThan(1);
  });
});
