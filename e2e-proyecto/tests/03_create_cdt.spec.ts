import { test, expect } from "@playwright/test";
import process from "process";
import { login } from "./utils/login";

test.use({
  baseURL:
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
});

// HU3: Crear solicitud de CDT
test.describe("Crear solicitud de CDT", () => {
  // Mock para respuestas del backend
  test.beforeEach(async ({ page }) => {
    // Mock autenticación
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          token: "mock-jwt-token",
          user: {
            id: 1,
            email: "usuario@test.com",
            name: "Usuario Test",
            rol: "CLIENTE",
          },
        },
      });
    });

    // Mock listado y creación de solicitudes
    await page.route("**/api/solicitudes", async (route) => {
      const req = route.request();
      const method = req.method();

      if (method === "GET") {
        // Devolver lista base
        await route.fulfill({
          status: 200,
          json: [],
        });
        return;
      }

      // POST -> crear
      const postData = req.postDataJSON();
      if (postData && postData.monto && postData.plazo) {
        await route.fulfill({
          status: 201,
          json: {
            id: 1,
            monto: postData.monto,
            plazo: postData.plazo,
            estado: "Borrador",
            fechaCreacion: new Date().toISOString(),
          },
        });
      } else {
        await route.fulfill({
          status: 400,
          json: { message: "Datos de solicitud incompletos" },
        });
      }
    });
  });

  // Escenario: Creación exitosa
  test("crear solicitud CDT con datos válidos", async ({ page }) => {
    // Login previo (necesario para acceder al formulario)
    await login(page, "usuario@test.com", "Password123!");

    // Navegar al formulario de creación y esperar a que la página cargue
    await page.goto("/solicitudes");
    await page.getByRole("button", { name: /nueva solicitud/i }).click();

    // Esperar a que el modal del formulario sea visible
    await page.waitForSelector(".form-solicitud");

    // Completar formulario usando selectores más robustos
    await page.getByLabel(/monto a invertir/i).fill("1000000");
    await page.getByLabel(/plazo \(días\)/i).fill("360"); // 12 meses = 360 días

    // Submit y esperar redirección
    await Promise.all([
      page.waitForURL("/solicitudes"),
      page.getByRole("button", { name: "Guardar" }).click(),
    ]);

    // Verificar creación exitosa
    await expect(page.getByText("Solicitud creada exitosamente")).toBeVisible();
    await expect(page.getByText("Borrador")).toBeVisible();
  });

  // Escenario: Creación con datos inválidos
  test("mostrar errores con campos vacíos", async ({ page }) => {
    // Login previo
    await login(page, "usuario@test.com", "Password123!");

    // Navegar al formulario y esperar a que cargue
    await page.goto("/solicitudes");
    await page.getByRole("button", { name: /nueva solicitud/i }).click();
    await page.waitForSelector(".form-solicitud");

    // Click en guardar sin llenar campos
    await page.getByRole("button", { name: /crear solicitud/i }).click();

    // Verificar mensajes de validación
    await expect(page.getByText(/el monto debe ser mayor a 0/i)).toBeVisible();
    await expect(page.getByText(/el plazo debe ser mayor a 0/i)).toBeVisible();

    // Verificar que seguimos en el formulario
    await expect(page).toHaveURL(/.*nueva/);
  });
});
