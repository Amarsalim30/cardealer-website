import { expect, test } from "@playwright/test";

test("viewing enquiries capture date and time in the public flow", async ({
  page,
}) => {
  const uniqueSuffix = Date.now();
  const name = `Viewing Lead ${uniqueSuffix}`;
  const preferredDate = "2026-04-18";
  const preferredTime = "10:30 AM";

  await page.goto("/cars/2018-range-rover-vogue?intent=viewing");

  await expect(page.getByLabel("Preferred date")).toBeVisible();
  await expect(page.getByLabel("Preferred time")).toBeVisible();
  await page.getByLabel("Phone").fill("+254700123123");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill("viewer@example.com");
  await page.getByLabel("Preferred date").fill(preferredDate);
  await page.getByLabel("Preferred time").fill(preferredTime);
  await page
    .locator('textarea[name="message"]')
    .fill("Please have the vehicle ready near the front entrance.");

  await page.getByRole("button", { name: /reserve my visit/i }).click();

  await expect(
    page.getByText("Your viewing request is in. We will confirm the slot shortly."),
  ).toBeVisible();
});
