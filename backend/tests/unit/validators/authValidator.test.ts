import "@jest/globals";
import {
  registerSchema,
  loginSchema,
} from "../../../src/validators/authValidator";

describe("Auth Validators", () => {
  describe("registerSchema", () => {
    it("should pass validation with valid data", () => {
      // Arrange
      const validData = {
        nombreCompleto: "John Doe",
        username: "johndoe",
        cedula: "1234567890",
        correo: "john@example.com",
        telefono: "1234567890",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it("should throw error when nombreCompleto is too short", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "Jo",
        username: "johndoe",
        cedula: "1234567890",
        correo: "john@example.com",
        telefono: "1234567890",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Nombre completo debe tener al menos 3 caracteres"
      );
    });

    it("should throw error when username is too short", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "John Doe",
        username: "jo",
        cedula: "1234567890",
        correo: "john@example.com",
        telefono: "1234567890",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Username debe tener al menos 3 caracteres"
      );
    });

    it("should throw error when cedula is too short", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "John Doe",
        username: "johndoe",
        cedula: "12345",
        correo: "john@example.com",
        telefono: "1234567890",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Cédula debe tener al menos 6 caracteres"
      );
    });

    it("should throw error when email is invalid", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "John Doe",
        username: "johndoe",
        cedula: "1234567890",
        correo: "invalid-email",
        telefono: "1234567890",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow("Email inválido");
    });

    it("should throw error when telefono is too short", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "John Doe",
        username: "johndoe",
        cedula: "1234567890",
        correo: "john@example.com",
        telefono: "123456",
        password: "password123",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Teléfono debe tener al menos 10 caracteres"
      );
    });

    it("should throw error when password is too short", () => {
      // Arrange
      const invalidData = {
        nombreCompleto: "John Doe",
        username: "johndoe",
        cedula: "1234567890",
        correo: "john@example.com",
        telefono: "1234567890",
        password: "12345",
      };

      // Act & Assert
      expect(() => registerSchema.parse(invalidData)).toThrow(
        "Password debe tener al menos 6 caracteres"
      );
    });
  });

  describe("loginSchema", () => {
    it("should pass validation with valid data", () => {
      // Arrange
      const validData = {
        username: "johndoe",
        password: "password123",
      };

      // Act & Assert
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it("should throw error when username is empty", () => {
      // Arrange
      const invalidData = {
        username: "",
        password: "password123",
      };

      // Act & Assert
      expect(() => loginSchema.parse(invalidData)).toThrow(
        "Username es requerido"
      );
    });

    it("should throw error when password is empty", () => {
      // Arrange
      const invalidData = {
        username: "johndoe",
        password: "",
      };

      // Act & Assert
      expect(() => loginSchema.parse(invalidData)).toThrow(
        "Password es requerido"
      );
    });

    it("should throw error when fields are missing", () => {
      // Arrange
      const invalidData = {};

      // Act & Assert
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });
});
