import { expect, test } from "@playwright/test";

import { loginAsDemoAdmin } from "./helpers";

test.describe.configure({ mode: "serial" });

test("local demo admin can sign in", async ({ page }) => {
  await loginAsDemoAdmin(page);

  await expect(page.getByRole("heading", { name: "Inventory" })).toBeVisible();
  await expect(page.getByRole("link", { name: /lead inbox/i })).toBeVisible();
});

test("admin can create a vehicle with direct image upload and manage it from the inventory workspace", async ({
  page,
}) => {
  const uniqueSuffix = Date.now();
  const title = `2021 Toyota Corolla Test ${uniqueSuffix}`;

  await page.route("**/api/admin/cloudinary/sign", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        allowedFormats: ["jpg", "jpeg", "png", "webp"],
        apiKey: "playwright-key",
        assetFolder: "2021-toy-cor",
        signature: "playwright-signature",
        slug: `2021-toyota-corolla-test-${uniqueSuffix}`,
        stockCode: `2021-TOY-COR-${uniqueSuffix}`,
        timestamp: 1700000000,
        uploadUrl:
          "https://api.cloudinary.com/v1_1/playwright-cloud/image/upload",
      }),
    });
  });

  let uploadCount = 0;
  await page.route(
    "https://api.cloudinary.com/v1_1/playwright-cloud/image/upload",
    async (route) => {
      uploadCount += 1;
      await route.fulfill({
        contentType: "application/json",
        status: 200,
        body: JSON.stringify({
          public_id: `playwright-upload-${uploadCount}`,
          secure_url: `https://res.cloudinary.com/playwright-cloud/image/upload/playwright-upload-${uploadCount}.jpg`,
        }),
      });
    },
  );

  await loginAsDemoAdmin(page);
  await page.getByRole("link", { name: /add vehicle/i }).last().click();

  await page.getByLabel("Listing title").fill(title);
  await page.getByLabel("Year").fill("2021");
  await page.getByLabel("Make").fill("Toyota");
  await page.getByLabel("Model").fill("Corolla");
  await page.getByRole("spinbutton", { name: "Price" }).fill("2150000");
  await page.getByLabel("Condition").fill("Foreign used");
  await page.getByLabel("Mileage").fill("24000");
  await page.getByLabel("Transmission").fill("Automatic");
  await page.getByLabel("Fuel type").fill("Petrol");
  await page
    .locator('textarea[name="description"]')
    .fill(
      "Clean Corolla test listing with direct upload coverage for the admin save flow.",
    );

  await page.locator('input[type="file"]').setInputFiles({
    name: "corolla.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from("playwright-image"),
  });

  await expect(page.getByText(/uploads on save/i)).toBeVisible();

  await page.getByRole("button", { name: /save vehicle/i }).click();

  await expect.poll(() => uploadCount).toBe(1);
  await expect(page).toHaveURL(/\/admin\/vehicles\/[^/?]+\?saved=1$/);
  await expect(page.getByText(/saved just now/i)).toBeVisible();

  await page.getByRole("link", { name: /return to inventory/i }).click();
  await expect(page).toHaveURL(/\/admin\/vehicles$/);

  await page.getByLabel("Search").fill(title);
  await page.getByRole("button", { name: /^apply$/i }).click();
  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole("button", { name: /actions/i }).click();
  await page.getByRole("button", { name: /delete vehicle/i }).click();
  await expect(
    page.getByText("This removes the listing from the admin inventory."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /confirm delete/i }),
  ).toBeVisible();
});

test("lead inbox remains usable on mobile without falling back to a table", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await loginAsDemoAdmin(page);
  await page.goto("/admin/leads");

  await expect(page.getByRole("heading", { name: "Lead inbox" })).toBeVisible();
  await expect(page.locator("table")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /call/i }).first()).toBeVisible();
});
