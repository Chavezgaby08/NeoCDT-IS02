import { test, expect } from "@playwright/test";

test.describe("HU1 - Login de Usuario", () => {
  test("debe mostrar errores de validación para campos vacíos", async ({
    page,
  }) => {
    await page.goto("/login");

    // Dejar campos vacíos y hacer clic en submit
    await page.click('button[type="submit"]');

    // Verificar que permanece en login
    await expect(page).toHaveURL(/\/login/);

    // Verificar mensajes de error del navegador (required)
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');

    // Los inputs requeridos deberían mostrar validación del navegador
    await expect(emailInput).toHaveAttribute("required");
    await expect(passwordInput).toHaveAttribute("required");
  });
});

test.describe("HU2 - Registro de Usuario", () => {
  test("debe mostrar error cuando las contraseñas no coinciden", async ({
    page,
  }) => {
    await page.goto("/register");

    // Llenar formulario con contraseñas diferentes
    await page.fill('input[id="nombreCompleto"]', "Juan Pérez");
    await page.fill('input[id="email"]', "juan@example.com");
    await page.fill('input[id="cedula"]', "1234567890");
    await page.fill('input[id="telefono"]', "3001234567");
    await page.fill('input[id="password"]', "password123");
    await page.fill('input[id="confirmPassword"]', "differentpassword");

    await page.click('button[type="submit"]');

    // Verificar que permanece en registro
    await expect(page).toHaveURL(/\/register/);

    // Verificar mensaje de error
    await expect(page.locator(".error")).toContainText(
      "Las contraseñas no coinciden"
    );
  });

  test("debe mostrar errores de validación para campos requeridos vacíos", async ({
    page,
  }) => {
    await page.goto("/register");

    // Hacer clic en submit sin llenar campos
    await page.click('button[type="submit"]');

    // Verificar que permanece en registro
    await expect(page).toHaveURL(/\/register/);

    // Verificar que los campos requeridos tienen el atributo required
    const requiredFields = [
      'input[id="nombreCompleto"]',
      'input[id="email"]',
      'input[id="cedula"]',
      'input[id="telefono"]',
      'input[id="password"]',
      'input[id="confirmPassword"]',
    ];

    for (const field of requiredFields) {
      await expect(page.locator(field)).toHaveAttribute("required");
    }
  });
});
