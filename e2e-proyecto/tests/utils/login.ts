import { Page } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.waitForSelector(".login-card");

  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);

  await page.waitForSelector('.login-card button[type="submit"]');
  await page.locator('.login-card button[type="submit"]').click();
  // Wait until the app stores the token in localStorage (login complete)
  await page.waitForFunction(
    () => !!window.localStorage.getItem("token"),
    null,
    { timeout: 5000 }
  );
}
