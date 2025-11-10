import { test, expect } from "@playwright/test";
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
          user: { id: 1, email: "usuario@test.com", name: "Usuario Test" },
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
            fecha >= new Date(params.get("fechaDesde")) &&
            fecha <= new Date(params.get("fechaHasta"))
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
    // Login previo
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    // Ir a la lista de solicitudes
    await page.goto("/solicitudes");

    // Verificar elementos de la lista
    await expect(page.getByText("$1,000,000")).toBeVisible();
    await expect(page.getByText("Aprobada")).toBeVisible();
    await expect(page.getByText("15/01/2025")).toBeVisible();
  });

  // Escenario: Filtrar por estado
  test("filtrar solicitudes por estado", async ({ page }) => {
    // Login y navegación
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.goto("/solicitudes");

    // Aplicar filtro de estado
    await page
      .getByRole("combobox", { name: "Estado" })
      .selectOption("Aprobada");

    // Verificar resultados filtrados
    await expect(page.getByText("Borrador")).not.toBeVisible();
    await expect(page.getByText("Aprobada")).toBeVisible();
  });

  // Escenario: Filtrar por rango de fechas
  test("filtrar solicitudes por rango de fechas", async ({ page }) => {
    // Login y navegación
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.goto("/solicitudes");

    // Aplicar filtros de fecha
    await page.getByLabel("Fecha desde").fill("2025-01-01");
    await page.getByLabel("Fecha hasta").fill("2025-01-15");
    await page.getByRole("button", { name: "Filtrar" }).click();

    // Verificar resultados filtrados
    await expect(page.getByText("15/01/2025")).toBeVisible();
    await expect(page.getByText("20/01/2025")).not.toBeVisible();
  });
});
