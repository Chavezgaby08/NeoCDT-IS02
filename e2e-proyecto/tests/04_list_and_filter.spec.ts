import { test, expect } from "@playwright/test";
import { login } from "./utils/login";
import process from "process";

test.use({
  baseURL:
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
});

// HU4 & HU8: Listar y Filtrar Solicitudes de CDT
test.describe("Listar y filtrar solicitudes", () => {
  // Mock para respuestas del backend
  test.beforeEach(async ({ page }) => {
    // Mock autenticación
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          token: "mock-jwt-token",
          user: { id: 1, email: "usuario@test.com", name: "Usuario Test", rol: "CLIENTE" },
        },
      });
    });

    // Mock listado de solicitudes
    await page.route("**/api/solicitudes**", async (route) => {
      const url = route.request().url();
      const params = new URL(url).searchParams;

      // Lista base de solicitudes
      const solicitudes = [
        {
          id: 1,
          monto: 1000000,
          plazo: 12,
          estado: "Aprobada",
          fechaCreacion: "2025-01-15T10:00:00Z",
        },
        {
          id: 2,
          monto: 2000000,
          plazo: 24,
          estado: "Borrador",
          fechaCreacion: "2025-01-20T15:30:00Z",
        },
      ];

      // Aplicar filtros si existen
      let filtradas = [...solicitudes];
      if (params.get("estado")) {
        filtradas = filtradas.filter((s) => s.estado === params.get("estado"));
      }
      if (params.get("fechaDesde") && params.get("fechaHasta")) {
        filtradas = filtradas.filter((s) => {
          const fecha = new Date(s.fechaCreacion);
          return (
            fecha >= new Date(params.get("fechaDesde") ?? "") &&
            fecha <= new Date(params.get("fechaHasta") ?? "")
          );
        });
      }

      await route.fulfill({
        status: 200,
        json: filtradas,
      });
    });
  });

  // Escenario: Visualización de solicitudes
  test("listar solicitudes y verificar datos", async ({ page }) => {
    // Login usando el utilitario
    await login(page, "usuario@test.com", "Password123!");

    // Ir a la lista de solicitudes
    await page.goto("/solicitudes");

    // Verificar elementos de la lista usando selectores más robustos
    // El formato de moneda en la UI es local (ej. $1.000.000)
    await expect(page.locator('[data-testid="monto-1"]')).toContainText(
      "$1.000.000"
    );
    await expect(page.locator('[data-testid="estado-1"]')).toContainText(
      "Aprobada"
    );
    await expect(page.locator('[data-testid="fecha-1"]')).toContainText(
      "15/01/2025"
    );
  });

  // Escenario: Filtrar por estado
  test("filtrar solicitudes por estado", async ({ page }) => {
    // Login usando el utilitario
    await login(page, "usuario@test.com", "Password123!");
    await page.goto("/solicitudes");

    // Aplicar filtro de estado usando selectores más robustos
    await page.locator("#estado-filter").selectOption("Aprobada");

    // Verificar resultados filtrados
    await expect(page.locator('[data-testid="estado-2"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="estado-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="estado-1"]')).toContainText(
      "Aprobada"
    );
  });

  // Escenario: Filtrar por rango de fechas
  test("filtrar solicitudes por rango de fechas", async ({ page }) => {
    // Login usando el utilitario
    await login(page, "usuario@test.com", "Password123!");
    await page.goto("/solicitudes");

    // Aplicar filtros de fecha usando selectores más robustos
    await page.locator("#fecha-desde").fill("2025-01-01");
    await page.locator("#fecha-hasta").fill("2025-01-15");
    await page.locator("#filtrar-btn").click();

    // Verificar resultados filtrados
    await expect(page.locator('[data-testid="fecha-1"]')).toContainText(
      "15/01/2025"
    );
    await expect(page.locator('[data-testid="fecha-2"]')).not.toBeVisible();
  });
});
