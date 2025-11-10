import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!(globalThis as any).process?.env?.CI,
  retries: 0,
  workers: undefined,

  // 👇 Aquí le decimos a Playwright que use el frontend React
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    actionTimeout: 0,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  // Puedes quitar esto si no lo usas con CI/CD
  reporter: [["html", { open: "never" }]],
});
