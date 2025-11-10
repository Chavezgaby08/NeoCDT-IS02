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
    // El frontend envía el registro a /api/auth/register y puede usar
    // campos con nombre en español; aceptar varias formas (email/username/correo)
    await page.route("**/api/auth/register", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      const submittedEmail =
        postData.email ?? postData.username ?? postData.correo;
      const submittedName = postData.name ?? postData.nombreCompleto;

      // Validar datos del registro
      if (submittedEmail && postData.password && submittedName) {
        await route.fulfill({
          status: 201,
          json: {
            message: "Usuario registrado exitosamente",
            user: {
              id: 1,
              email: submittedEmail,
              name: submittedName,
              rol: "CLIENTE",
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
    await expect(page).toHaveTitle("Registro | BancoNex");

    // Esperar a que el formulario sea visible
    await page.waitForSelector(".login-card");

    // Completar formulario
    await page.getByLabel("Nombre Completo").fill("Usuario Test");
    await page.getByLabel("Correo electrónico").fill("nuevo@test.com");
    await page.getByLabel("Cédula").fill("1234567890");
    await page.getByLabel("Teléfono").fill("3001234567");
    await page.locator("#password").fill("Password123!");
    await page.locator("#confirmPassword").fill("Password123!");

    // Submit: la app muestra un alert y luego navega a /login
    await page.waitForSelector('.login-card button[type="submit"]');
    // Evitar uso de dialog (puede ser frágil en ejecución paralela). Reemplazar window.alert
    await page.evaluate(() => {
      // store alert message on window.__lastAlert (TS-safe read/write via any)
      (window as any).__lastAlert = null;
      (window as any).alert = (msg: any) => {
        (window as any).__lastAlert = msg;
      };
    });
    await page.locator('.login-card button[type="submit"]').click();
    // Leer el mensaje almacenado por el override
    const lastAlert = await page.evaluate(() => (window as any).__lastAlert);
    expect(lastAlert).toContain("Usuario registrado exitosamente");
    await page.waitForURL("/login");
  });

  // Escenario: Registro con datos inválidos
  test("mostrar errores con campos vacíos", async ({ page }) => {
    // Navegar a página de registro
    await page.goto("/register");

    // Click en registrar sin llenar campos (usar selector real)
    await page.waitForSelector('.login-card button[type="submit"]');
    await page.locator('.login-card button[type="submit"]').click();

    // Verificar que los campos son requeridos
    const requiredFields = await page.$$("input[required]");
    expect(requiredFields.length).toBeGreaterThan(0);

    // Verificar que seguimos en la misma página
    await expect(page).toHaveURL(/.*register/);

    // Verificar que seguimos en la página de registro
    await expect(page).toHaveURL(/.*register/);
  });
});
