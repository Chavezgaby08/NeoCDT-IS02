import { Request, Response } from "express";
import { AuthController } from "../../../src/controllers/authController";
import { AuthService } from "../../../src/services/authService";
import { RolUsuario } from "@prisma/client";

jest.mock("../../../src/services/authService");

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    mockAuthService.register = jest.fn();
    mockAuthService.login = jest.fn();

    jest
      .spyOn(AuthService.prototype, "register")
      .mockImplementation(mockAuthService.register);
    jest
      .spyOn(AuthService.prototype, "login")
      .mockImplementation(mockAuthService.login);

    authController = new AuthController();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as Partial<Response>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validRegisterData = {
      nombreCompleto: "Juan Pérez",
      username: "juanperez",
      cedula: "123456789",
      correo: "juan@example.com",
      telefono: "3001234567",
      password: "password123",
    };

    it("debe registrar usuario exitosamente", async () => {
      // Arrange
      const expectedResult = {
        success: true,
        message: "Usuario registrado exitosamente",
      };
      mockAuthService.register.mockResolvedValue(expectedResult);
      mockRequest = { body: validRegisterData };

      // Act
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegisterData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("debe manejar errores de registro", async () => {
      // Arrange
      const errorMessage = "Usuario ya existe";
      mockAuthService.register.mockRejectedValue(new Error(errorMessage));
      mockRequest = { body: validRegisterData };

      // Act
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos", async () => {
      // Arrange
      mockAuthService.register.mockRejectedValue(new Error());
      mockRequest = { body: validRegisterData };

      // Act
      await authController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al registrar usuario",
      });
    });
  });

  describe("login", () => {
    const validLoginData = {
      username: "juan@example.com",
      password: "password123",
    };

    it("debe iniciar sesión exitosamente", async () => {
      // Arrange
      const expectedResult = {
        success: true,
        user: {
          id: "1",
          email: "juan@example.com",
          rol: "CLIENTE" as RolUsuario,
        },
        token: "jwt-token",
      };
      mockAuthService.login.mockResolvedValue(expectedResult);
      mockRequest = { body: validLoginData };

      // Act
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginData);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it("debe manejar errores de login", async () => {
      // Arrange
      const errorMessage = "Credenciales inválidas";
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));
      mockRequest = { body: validLoginData };

      // Act
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("debe manejar errores genéricos en login", async () => {
      // Arrange
      mockAuthService.login.mockRejectedValue(new Error());
      mockRequest = { body: validLoginData };

      // Act
      await authController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Error al iniciar sesión",
      });
    });
  });
});
