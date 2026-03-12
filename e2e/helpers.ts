import { expect, type Page } from "@playwright/test";

export const DEMO_ADMIN_EMAIL = "demo@example.com";
export const DEMO_ADMIN_PASSWORD = "demo-password";

export async function loginAsDemoAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(DEMO_ADMIN_EMAIL);
  await page.getByLabel("Password").fill(DEMO_ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/admin\/vehicles$/);
}
