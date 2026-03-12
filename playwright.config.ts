import { defineConfig, devices } from "@playwright/test";

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `cmd /c npm run start -- --hostname localhost --port ${port}`,
    env: {
      ADMIN_NOTIFICATION_EMAIL: "sales@example.com",
      CLOUDINARY_API_KEY: "playwright-key",
      CLOUDINARY_API_SECRET: "playwright-secret",
      CLOUDINARY_CLOUD_NAME: "playwright-cloud",
      DEMO_ADMIN_EMAIL: "demo@example.com",
      DEMO_ADMIN_PASSWORD: "demo-password",
      DEMO_ADMIN_SESSION_SECRET: "playwright-demo-session-secret",
      E2E_TEST_MODE: "1",
      ENABLE_DEMO_ADMIN: "1",
      NEXT_PUBLIC_SITE_URL: baseURL,
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: `${baseURL}/admin/login`,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
