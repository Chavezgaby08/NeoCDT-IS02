import "@jest/globals";
import { AuthService } from "../../../src/services/authService";
import { prismaMock } from "../../_mocks_/prismaClient";
import { RolUsuario } from "@prisma/client";

jest.mock("@prisma/client");

// Mock bcrypt utils
const mockHashPassword = jest.fn();
const mockComparePassword = jest.fn();
jest.mock("../../../src/utils/bcrypt", () => ({
  hashPassword: (...args: any[]) => mockHashPassword(...args),
  comparePassword: (...args: any[]) => mockComparePassword(...args),
}));

// Mock jwt utils
const mockGenerateToken = jest.fn();
jest.mock("../../../src/utils/jwt", () => ({
  generateToken: (...args: any[]) => mockGenerateToken(...args),
}));

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validRegisterData = {
      correo: "test@example.com",
      password: "password123",
      nombreCompleto: "John Doe",
      cedula: "1234567890",
      telefono: "1234567890",
      username: "johndoe123",
    };

    it("should register a user with single name", async () => {
      // Arrange
      const singleNameData = {
        ...validRegisterData,
        nombreCompleto: "John",
      };
      const hashedPassword = "hashed_password";
      prismaMock.usuario.findFirst.mockResolvedValueOnce(null);
      mockHashPassword.mockResolvedValueOnce(hashedPassword);
      prismaMock.usuario.create.mockResolvedValueOnce({
        id: "1",
        email: singleNameData.correo,
        password: hashedPassword,
        rol: "CLIENTE" as RolUsuario,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.register(singleNameData);

      // Assert
      expect(result.success).toBe(true);
      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: singleNameData.correo,
          password: hashedPassword,
          rol: "CLIENTE",
          cliente: {
            create: {
              nombres: "John",
              apellidos: "John", // Debería usar el mismo nombre como apellido
              tipoDocumento: "CC",
              numeroDocumento: singleNameData.cedula,
              telefono: singleNameData.telefono,
            },
          },
        },
      });
    });

    it("should register a new user successfully", async () => {
      // Arrange
      const hashedPassword = "hashed_password";
      prismaMock.usuario.findFirst.mockResolvedValueOnce(null);
      mockHashPassword.mockResolvedValueOnce(hashedPassword);
      prismaMock.usuario.create.mockResolvedValueOnce({
        id: "1",
        email: validRegisterData.correo,
        password: hashedPassword,
        rol: "CLIENTE" as RolUsuario,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.register(validRegisterData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe("Usuario registrado exitosamente");
      expect(prismaMock.usuario.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: validRegisterData.correo },
            { cliente: { numeroDocumento: validRegisterData.cedula } },
          ],
        },
      });
      expect(mockHashPassword).toHaveBeenCalledWith(validRegisterData.password);
      expect(prismaMock.usuario.create).toHaveBeenCalledWith({
        data: {
          email: validRegisterData.correo,
          password: hashedPassword,
          rol: "CLIENTE",
          cliente: {
            create: {
              nombres: "John",
              apellidos: "Doe",
              tipoDocumento: "CC",
              numeroDocumento: validRegisterData.cedula,
              telefono: validRegisterData.telefono,
            },
          },
        },
      });
    });

    it("should throw error if user already exists", async () => {
      // Arrange
      prismaMock.usuario.findFirst.mockResolvedValueOnce({
        id: "1",
        email: validRegisterData.correo,
        password: "existing_hashed_password",
        rol: "CLIENTE" as RolUsuario,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(service.register(validRegisterData)).rejects.toThrow(
        "Usuario o cédula ya registrados"
      );
      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(prismaMock.usuario.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    const validLoginData = {
      username: "test@example.com",
      password: "password123",
    };

    const mockUser = {
      id: "1",
      email: "test@example.com",
      password: "hashed_password",
      rol: "CLIENTE" as RolUsuario,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should login successfully with valid credentials", async () => {
      // Arrange
      const mockToken = "mock.jwt.token";
      prismaMock.usuario.findUnique.mockResolvedValueOnce(mockUser);
      mockComparePassword.mockResolvedValueOnce(true);
      mockGenerateToken.mockReturnValueOnce(mockToken);

      // Act
      const result = await service.login(validLoginData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        rol: mockUser.rol,
      });
      expect(result.token).toBe(mockToken);
      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: validLoginData.username },
      });
      expect(mockComparePassword).toHaveBeenCalledWith(
        validLoginData.password,
        mockUser.password
      );
      expect(mockGenerateToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        rol: mockUser.rol,
      });
    });

    it("should throw error if user does not exist", async () => {
      // Arrange
      prismaMock.usuario.findUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(service.login(validLoginData)).rejects.toThrow(
        "Credenciales inválidas"
      );
      expect(mockComparePassword).not.toHaveBeenCalled();
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it("should throw error if password is invalid", async () => {
      // Arrange
      prismaMock.usuario.findUnique.mockResolvedValueOnce(mockUser);
      mockComparePassword.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(service.login(validLoginData)).rejects.toThrow(
        "Credenciales inválidas"
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });

    it("should throw error if user is inactive", async () => {
      // Arrange
      prismaMock.usuario.findUnique.mockResolvedValueOnce({
        ...mockUser,
        activo: false,
      });
      mockComparePassword.mockResolvedValueOnce(true);

      // Act & Assert
      await expect(service.login(validLoginData)).rejects.toThrow(
        "Usuario inactivo"
      );
      expect(mockGenerateToken).not.toHaveBeenCalled();
    });
  });
});
