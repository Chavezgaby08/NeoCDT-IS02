import { test, expect } from "@playwright/test";
import process from "process";

// Ensure tests use an explicit baseURL so page.goto('/path') resolves even if
// Playwright config failed to load env vars in some shells. This prefers
// PLAYWRIGHT_TEST_BASE_URL, then FRONTEND_URL, then the default Vite URL.
test.use({
  baseURL:
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
});

// HU1: Login de Usuario
test.describe("Login de usuario", () => {
  // Mock para respuestas del backend
  test.beforeEach(async ({ page }) => {
    // Interceptar peticiones al endpoint de login
    await page.route("**/api/auth/login", async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();

      // Validar credenciales mock (aceptar tanto 'email' como 'username')
      const submittedEmail = postData.email ?? postData.username;
      // Validar credenciales mock
      if (
        submittedEmail === "usuario@test.com" &&
        postData.password === "Password123!"
      ) {
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
      } else {
        await route.fulfill({
          status: 401,
          json: { message: "Credenciales inválidas" },
        });
      }
    });
  });

  // Escenario: Login exitoso
  test("login exitoso con credenciales válidas", async ({ page }) => {
    // Navegar a la página de login
    await page.goto("/login");
    await expect(page).toHaveTitle("Login | BancoNex");

    // Esperar a que el formulario sea visible
    await page.waitForSelector(".login-card");

    // Ingresar credenciales válidas
    await page.locator("#email").fill("usuario@test.com");
    await page.locator("#password").fill("Password123!");

    // Submit y esperar redirección
    await page.waitForSelector('.login-card button[type="submit"]');
    await page.locator('.login-card button[type="submit"]').click();
    await page.waitForURL("/dashboard");

    // Verificar redirección exitosa
    await expect(page).toHaveURL(/.*dashboard/);
    // Verificar que el login guardó token y usuario en localStorage
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const userJson = await page.evaluate(() => localStorage.getItem("user"));
    const user = userJson ? JSON.parse(userJson) : null;
    expect(token).toBeTruthy();
    expect(user?.email || user?.username).toBe("usuario@test.com");
  });

  // Escenario: Login fallido
  test("mostrar error con credenciales inválidas", async ({ page }) => {
    // Navegar a la página de login
    await page.goto("/login");

    // Esperar a que el formulario sea visible
    await page.waitForSelector(".login-card");

    // Ingresar credenciales inválidas
    await page.getByLabel("Correo electrónico").fill("incorrecto@test.com");
    await page.getByLabel("Contraseña").fill("ClaveIncorrecta123");

    // Submit y esperar mensaje de error
    // botón en UI es 'Iniciar Sesión' — usar selector del formulario
    await page.locator('.login-card button[type="submit"]').click();

    // Verificar mensaje de error y que seguimos en login
    await expect(page.getByText("Credenciales inválidas")).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });
});
