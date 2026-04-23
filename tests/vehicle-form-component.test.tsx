import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cleanupUploadedVehicleImagesAction: vi.fn(),
  router: {
    push: vi.fn(),
    refresh: vi.fn(),
  },
  saveVehicleAction: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
}));

vi.mock("@/lib/actions/admin-actions", () => ({
  cleanupUploadedVehicleImagesAction: mocks.cleanupUploadedVehicleImagesAction,
  saveVehicleAction: mocks.saveVehicleAction,
}));

import { VehicleForm } from "@/components/admin/vehicle-form";
import type { Vehicle } from "@/types/dealership";

function buildVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
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
    locationId: null,
    location: null,
    featured: false,
    status: "draft",
    stockCategory: "used",
    description: "Clean unit ready for viewing.",
    heroImageUrl: null,
    images: [],
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useRouter.mockReturnValue(mocks.router);
  mocks.saveVehicleAction.mockResolvedValue({
    success: false,
    message: "Please review the highlighted fields and try again.",
    fieldErrors: {
      images: ["Add at least one gallery image."],
      title: ["Enter a vehicle title."],
    },
  });
});

describe("VehicleForm", () => {
  it("renders a keyboard-accessible file staging button with image type filters", () => {
    const { container } = render(<VehicleForm locations={[]} />);

    expect(
      screen.getByRole("button", { name: /stage files/i }),
    ).toBeInTheDocument();

    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement | null;

    expect(fileInput).not.toBeNull();
    expect(fileInput).toHaveAttribute(
      "accept",
      expect.stringContaining("image/jpeg"),
    );
    expect(fileInput).toHaveAttribute(
      "accept",
      expect.stringContaining("image/png"),
    );
  });

  it("surfaces field-level save errors inline after submission", async () => {
    render(<VehicleForm locations={[]} />);

    fireEvent.click(screen.getByRole("button", { name: /save vehicle/i }));

    await waitFor(() => {
      expect(screen.getByText("Enter a vehicle title.")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/listing title/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Add at least one gallery image.")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(mocks.router.push).not.toHaveBeenCalled();
  });

  it("warns before leaving when the editor has unsaved changes", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<VehicleForm locations={[]} vehicle={buildVehicle()} />);

    fireEvent.change(screen.getByLabelText(/listing title/i), {
      target: { value: "Updated title" },
    });
    fireEvent.click(screen.getByRole("button", { name: /return to inventory/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(mocks.router.push).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it("reconciles staged url images after a successful edit save", async () => {
    mocks.saveVehicleAction.mockResolvedValueOnce({
      success: true,
      message: "Vehicle saved successfully.",
    });

    render(<VehicleForm locations={[]} vehicle={buildVehicle()} />);

    fireEvent.change(screen.getByLabelText(/stage image from url/i), {
      target: { value: "https://example.com/car.jpg" },
    });
    fireEvent.click(screen.getByRole("button", { name: /stage url/i }));

    expect(screen.getByText("Imports on save")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Vehicle saved successfully.")).toBeInTheDocument();
    });

    expect(screen.queryByText("Imports on save")).not.toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });
});
