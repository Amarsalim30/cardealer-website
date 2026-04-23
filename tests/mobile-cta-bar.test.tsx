import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileCtaBar } from "@/components/inventory/mobile-cta-bar";

describe("MobileCtaBar", () => {
  it("renders WhatsApp first, Call second, and Viewing third", () => {
    render(
      <MobileCtaBar
        whatsappUrl="https://wa.me/254700000000?text=Hello"
        phoneHref="tel:+254700000000"
        viewingHref="/cars/example?intent=viewing#contact-panel"
      />,
    );

    const links = screen.getAllByRole("link");

    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("WhatsApp");
    expect(links[1]).toHaveTextContent("Call");
    expect(links[2]).toHaveTextContent("Viewing");
    expect(links[2]).toHaveAttribute(
      "href",
      "/cars/example?intent=viewing#contact-panel",
    );
  });
});
