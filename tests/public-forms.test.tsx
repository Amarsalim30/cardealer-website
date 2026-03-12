import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const useActionStateMock = vi.hoisted(() => vi.fn());
const useSearchParamsMock = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/lib/actions/public-actions", () => ({
  submitLeadAction: vi.fn(),
  submitTestDriveAction: vi.fn(),
  submitTradeInAction: vi.fn(),
}));

import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { TestDriveForm } from "@/components/forms/test-drive-form";
import { VehicleEnquiryForm } from "@/components/forms/vehicle-enquiry-form";

beforeEach(() => {
  vi.clearAllMocks();
  useSearchParamsMock.mockReturnValue({
    get: (key: string) => (key === "intent" ? "quote" : null),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("public forms", () => {
  it("renders viewing-specific date and time inputs in the vehicle enquiry flow", () => {
    useActionStateMock
      .mockReturnValueOnce([{ success: false, message: "" }, vi.fn()])
      .mockReturnValueOnce([{ success: false, message: "" }, vi.fn()]);
    useSearchParamsMock.mockReturnValue({
      get: (key: string) => (key === "intent" ? "viewing" : null),
    });

    render(
      <VehicleEnquiryForm
        source="Vehicle page"
        vehicleId="vehicle-1"
        vehicleTitle="2020 Toyota Prado"
      />,
    );

    expect(screen.getByLabelText(/preferred date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
  });

  it("marks lead capture inputs invalid when field errors are returned", () => {
    useActionStateMock.mockReturnValueOnce([
      {
        success: false,
        message: "Please review the highlighted fields and try again.",
        fieldErrors: {
          name: ["Enter your name."],
          phone: ["Enter a valid phone number."],
        },
      },
      vi.fn(),
    ]);

    render(
      <LeadCaptureForm
        title="Lead form"
        description="Capture a lead"
        leadType="quote"
        source="Homepage"
        submitLabel="Send"
      />,
    );

    expect(screen.getByLabelText(/full name/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Enter your name.")).toHaveAttribute(
      "role",
      "alert",
    );
    expect(screen.getByLabelText(/phone/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("marks the preferred date field invalid for test-drive requests", () => {
    useActionStateMock.mockReturnValueOnce([
      {
        success: false,
        message: "Please review the highlighted fields and try again.",
        fieldErrors: {
          preferredDate: ["Select your preferred date."],
        },
      },
      vi.fn(),
    ]);

    render(<TestDriveForm source="Inventory page" />);

    expect(screen.getByLabelText(/preferred date/i)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Select your preferred date.")).toHaveAttribute(
      "role",
      "alert",
    );
  });
});
