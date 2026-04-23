import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/admin/lead-workflow-actions", () => ({
  LeadWorkflowActions: ({
    status,
  }: {
    status: string;
  }) => <div>Workflow actions for {status}</div>,
}));

import { LeadInbox } from "@/components/admin/lead-inbox";

describe("LeadInbox", () => {
  it("renders a compact inbox list and updates the detail pane when a row is selected", () => {
    render(
      <LeadInbox
        items={[
          {
            id: "lead-1",
            type: "trade_in",
            sourceType: "trade_in",
            sourceId: "lead-1",
            status: "follow_up",
            name: "Jane Doe",
            phone: "+254 700 000 000",
            email: "jane@example.com",
            message: "Can you value my current car?",
            vehicleId: "vehicle-1",
            vehicleTitle: "2021 Toyota Corolla",
            source: "Trade-in page",
            createdAt: "2026-03-10T09:00:00.000Z",
            lastContactedAt: "2026-03-10T10:00:00.000Z",
            details: [
              {
                label: "Current vehicle",
                value: "2016 Mazda CX-5",
              },
            ],
          },
          {
            id: "lead-2",
            type: "quote",
            sourceType: "lead",
            sourceId: "lead-2",
            status: "new",
            name: "John Kamau",
            phone: "+254 711 111 111",
            message: "Need the cash price and financing options.",
            vehicleTitle: "2019 Subaru Forester",
            source: "Vehicle enquiry form",
            createdAt: "2026-03-11T09:00:00.000Z",
            details: [],
          },
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: /open lead from john kamau/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open lead from jane doe/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "John Kamau" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^Call$/i }),
    ).toHaveAttribute("href", "tel:+254711111111");
    expect(screen.getByText(/workflow actions for new/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open lead from jane doe/i }));

    expect(screen.getByRole("heading", { name: "Jane Doe" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Call$/i })).toHaveAttribute(
      "href",
      "tel:+254700000000",
    );
    expect(screen.getByRole("link", { name: /^WhatsApp$/i })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/254700000000"),
    );
    expect(screen.getByRole("link", { name: /^Email$/i })).toHaveAttribute(
      "href",
      "mailto:jane@example.com",
    );
    expect(screen.getByText("Current vehicle")).toBeInTheDocument();
    expect(screen.getByText("2016 Mazda CX-5")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open listing/i })).toHaveAttribute(
      "href",
      "/admin/vehicles/vehicle-1",
    );
    expect(
      screen.getByText(/workflow actions for follow_up/i),
    ).toBeInTheDocument();
  });

  it("filters the inbox locally with the search field", () => {
    render(
      <LeadInbox
        items={[
          {
            id: "lead-1",
            type: "contact",
            sourceType: "lead",
            sourceId: "lead-1",
            status: "new",
            name: "Alice Njeri",
            phone: "+254 722 000 000",
            message: "Need more photos.",
            vehicleTitle: "2018 Mazda Demio",
            createdAt: "2026-03-10T09:00:00.000Z",
            details: [],
          },
          {
            id: "lead-2",
            type: "trade_in",
            sourceType: "trade_in",
            sourceId: "lead-2",
            status: "contacted",
            name: "Brian Otieno",
            phone: "+254 733 000 000",
            message: "Trading in my Hilux.",
            createdAt: "2026-03-09T09:00:00.000Z",
            details: [],
          },
        ]}
      />,
    );

    fireEvent.change(screen.getByLabelText(/search leads/i), {
      target: { value: "Hilux" },
    });

    expect(
      screen.queryByRole("button", { name: /open lead from alice njeri/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open lead from brian otieno/i }),
    ).toBeInTheDocument();
  });
});
