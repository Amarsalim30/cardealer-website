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
});
