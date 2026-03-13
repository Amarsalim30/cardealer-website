import { render, screen } from "@testing-library/react";
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
  it("renders quick actions and typed lead details", () => {
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
            vehicleTitle: "2021 Toyota Corolla",
            source: "Trade-in page",
            createdAt: "2026-03-10T09:00:00.000Z",
            lastContactedAt: "2026-03-10T10:00:00.000Z",
            details: [
              {
                label: "Current vehicle",
                value: "2016 Mazda CX-5",
              },
              {
                label: "Mileage",
                value: "88,000 km",
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: /call/i })).toHaveAttribute(
      "href",
      "tel:+254700000000",
    );
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      expect.stringContaining("wa.me/254700000000"),
    );
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:jane@example.com",
    );
    expect(screen.getByText("Current vehicle")).toBeInTheDocument();
    expect(screen.getByText("2016 Mazda CX-5")).toBeInTheDocument();
    expect(screen.getByText(/workflow actions for follow_up/i)).toBeInTheDocument();
  });
});
