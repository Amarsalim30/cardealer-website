import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const pathnameMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  usePathname: pathnameMock,
}));

vi.mock("@/lib/actions/admin-actions", () => ({
  logoutAdminAction: vi.fn(),
}));

import { AdminNavigation } from "@/components/admin/admin-navigation";

describe("AdminNavigation", () => {
  it("shows the current section as active", () => {
    pathnameMock.mockReturnValue("/admin/leads");

    render(
      <AdminNavigation
        session={{
          email: "admin@example.com",
          mode: "demo",
          name: "Admin",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /lead inbox/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens the mobile drawer and exposes the quick create action", () => {
    pathnameMock.mockReturnValue("/admin/vehicles");

    render(
      <AdminNavigation
        session={{
          email: "admin@example.com",
          mode: "demo",
          name: "Admin",
        }}
      />,
    );

    expect(
      screen
        .getAllByRole("link")
        .some((link) => link.getAttribute("href") === "/admin/vehicles/new"),
    ).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /menu/i }));

    expect(screen.getByText(/admin navigation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/close navigation/i)).toBeInTheDocument();
  });
});
