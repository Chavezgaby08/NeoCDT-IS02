import { test, expect } from "@playwright/test";
import process from "process";

test.use({
  baseURL:
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
});

// HU2: Registro de Usuario
test.describe("Registro de usuario", () => {
  // Mock para respuestas del backend
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/users/register", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Validar datos del registro
      if (postData.email && postData.password && postData.name) {
        await route.fulfill({
          status: 201,
          json: {
            message: "Usuario registrado exitosamente",
            user: {
              id: 1,
              email: postData.email,
              name: postData.name,
            },
          },
        });
      } else {
        await route.fulfill({
          status: 400,
          json: { message: "Datos de registro incompletos" },
        });
      }
    });
  });

  // Escenario: Registro exitoso
  test("registro exitoso con datos válidos", async ({ page }) => {
    // Navegar a página de registro
    await page.goto("/register");
    await expect(page).toHaveTitle(/Registro/);

    // Completar formulario
    await page.getByLabel("Nombre").fill("Usuario Test");
    await page.getByLabel("Email").fill("nuevo@test.com");
    await page.getByLabel("Contraseña").fill("Password123!");
    await page.getByLabel("Confirmar Contraseña").fill("Password123!");

    // Submit y esperar redirección
    await Promise.all([
      page.waitForURL("/login"),
      page.getByRole("button", { name: "Registrarme" }).click(),
    ]);

    // Verificar mensaje de éxito
    await expect(
      page.getByText("Usuario registrado exitosamente")
    ).toBeVisible();
  });

  // Escenario: Registro con datos inválidos
  test("mostrar errores con campos vacíos", async ({ page }) => {
    // Navegar a página de registro
    await page.goto("/register");

    // Click en registrar sin llenar campos
    await page.getByRole("button", { name: "Registrarme" }).click();

    // Verificar mensajes de validación
    await expect(page.getByText("El nombre es requerido")).toBeVisible();
    await expect(page.getByText("El email es requerido")).toBeVisible();
    await expect(page.getByText("La contraseña es requerida")).toBeVisible();

    // Verificar que seguimos en la página de registro
    await expect(page).toHaveURL(/.*register/);
  });
});
