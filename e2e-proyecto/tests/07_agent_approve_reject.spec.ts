import { test, expect } from "@playwright/test";
import process from "process";

test.use({
  baseURL:
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
});

// HU11: Aprobar/Rechazar Solicitud
test.describe("Aprobar o rechazar solicitudes", () => {
  // Mock para respuestas del backend
  test.beforeEach(async ({ page }) => {
    // Mock login como agente
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          token: "mock-jwt-token",
          user: {
            id: 2,
            email: "agente@test.com",
            name: "Agente Test",
            rol: "AGENTE",
          },
        },
      });
    });

    // Mock obtener solicitud
    await page.route("**/api/agente/solicitudes/**", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: 1,
          monto: 1000000,
          plazo: 12,
          estado: "En validación",
          fechaCreacion: "2025-01-15T10:00:00Z",
        },
      });
    });

    // Mock aprobar/rechazar solicitud
    await page.route("**/api/agente/solicitudes/*/aprobar", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          message: "Solicitud aprobada exitosamente",
          estado: "Aprobada",
        },
      });
    });

    await page.route("**/api/agente/solicitudes/*/rechazar", async (route) => {
      const postData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        json: {
          message: "Solicitud rechazada",
          estado: "Rechazada",
          observacion: postData.observacion,
        },
      });
    });
  });

  // Escenario: Aprobar solicitud
  test("aprobar solicitud como agente", async ({ page }) => {
    // Login como agente
    await page.goto("/login");
    await page.waitForSelector(".login-card");
    await page.locator("#email").fill("agente@test.com");
    await page.locator("#password").fill("Password123!");
    // Use the submit button selector used in the app
    await page.locator('.login-card button[type="submit"]').click();

    // Ir al detalle de la solicitud
    await page.goto("/solicitudes/1");

    // Aprobar solicitud
    await Promise.all([
      page.waitForResponse("**/api/solicitudes/*/aprobar"),
      page.getByRole("button", { name: "Aprobar" }).click(),
    ]);

    // Verificar cambio de estado
    await expect(
      page.getByText("Solicitud aprobada exitosamente")
    ).toBeVisible();
    await expect(page.getByText("Aprobada")).toBeVisible();
  });

  // Escenario: Rechazar solicitud
  test("rechazar solicitud con observación", async ({ page }) => {
    // Login como agente
    await page.goto("/login");
    await page.locator("#email").fill("agente@test.com");
    await page.locator("#password").fill("Password123!");
    await page.locator('.login-card button[type="submit"]').click();

    // Ir al detalle de la solicitud
    await page.goto("/solicitudes/1");

    // Rechazar solicitud
    await page.getByRole("button", { name: "Rechazar" }).click();
    await page.getByLabel("Observación").fill("Documentación incompleta");

    await Promise.all([
      page.waitForResponse("**/api/solicitudes/*/rechazar"),
      page.getByRole("button", { name: "Confirmar rechazo" }).click(),
    ]);

    // Verificar cambio de estado y observación
    await expect(page.getByText("Solicitud rechazada")).toBeVisible();
    await expect(page.getByText("Rechazada")).toBeVisible();
    await expect(page.getByText("Documentación incompleta")).toBeVisible();
  });
});
