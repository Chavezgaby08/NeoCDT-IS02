import { test, expect } from "@playwright/test";
import process from "process";

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
          user: { id: 1, email: "usuario@test.com", name: "Usuario Test" },
        },
      });
    });

    // Mock creación de solicitud
    await page.route("**/api/solicitudes", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Validar datos de la solicitud
      if (postData.monto && postData.plazo) {
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
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    // Navegar al formulario de creación
    await page.goto("/solicitudes/nueva");
    await expect(page).toHaveTitle(/Nueva Solicitud/);

    // Completar formulario
    await page.getByLabel("Monto").fill("1000000");
    await page.getByLabel("Plazo (meses)").fill("12");
    await page.getByLabel("Tasa").fill("12.5");

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
    await page.goto("/login");
    await page.getByLabel("Email").fill("usuario@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByRole("button", { name: "Ingresar" }).click();

    // Navegar al formulario de creación
    await page.goto("/solicitudes/nueva");

    // Click en guardar sin llenar campos
    await page.getByRole("button", { name: "Guardar" }).click();

    // Verificar mensajes de validación
    await expect(page.getByText("El monto es requerido")).toBeVisible();
    await expect(page.getByText("El plazo es requerido")).toBeVisible();

    // Verificar que seguimos en el formulario
    await expect(page).toHaveURL(/.*nueva/);
  });
});
