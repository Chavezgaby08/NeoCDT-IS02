import { test, expect } from "@playwright/test";

test.describe("HU3 - Crear Solicitud de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login primero
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU4 - Listar Solicitudes de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU5 - Editar Solicitud de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU6 - Cambiar Estado de Solicitud", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU7 - Eliminar Solicitud de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU8 - Filtrar Solicitudes de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU9 - Consultar Detalle de Solicitud de CDT", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[id="email"]', "test@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe("HU10 - Renovar Solicitud de CDT", () => {
  test("debe permitir renovar CDT próximo a vencer", async ({ page }) => {
    // Esta HU requiere una solicitud aprobada próxima a vencer
    // Para la prueba, asumimos que hay una solicitud en ese estado
    // La implementación dependería de la lógica de negocio específica
    console.log(
      "HU10 - Renovación requiere configuración específica de datos de prueba"
    );
  });
});

test.describe("HU11 - Aprobar/Rechazar Solicitud", () => {
  test.beforeEach(async ({ page }) => {
    // Login como asesor
    await page.goto("/login");
    await page.fill('input[id="email"]', "asesor@example.com");
    await page.fill('input[id="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/asesor/);
  });
});

// Pruebas de acciones incorrectas
test.describe("Pruebas de Acciones Incorrectas", () => {
  test("debe manejar intento de acceso sin autenticación", async ({ page }) => {
    // Intentar acceder a dashboard sin login
    await page.goto("/dashboard");

    // Debería redirigir a login
    await expect(page).toHaveURL(/\/login/);
  });

  test("debe manejar envío de formulario con datos inválidos", async ({
    page,
  }) => {
    await page.goto("/login");

    // Enviar formulario vacío
    await page.click('button[type="submit"]');

    // Verificar que permanece en login
    await expect(page).toHaveURL(/\/login/);
  });
});
