import "@jest/globals";
import { generateToken, verifyToken } from "../../../src/utils/jwt";
import { jwtMock } from "../../_mocks_/jwt";

jest.mock("jsonwebtoken");

describe("JWT utils", () => {
  const mockPayload = {
    id: "1",
    email: "test@example.com",
    rol: "CLIENTE" as const,
  };
  const mockToken = "mock.jwt.token";
  const mockSecret = "test-secret";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = mockSecret;
    process.env.JWT_EXPIRES_IN = "24h";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe("generateToken", () => {
    it("should generate token with correct payload and options", () => {
      // Arrange
      (jwtMock.sign as jest.Mock).mockReturnValueOnce(mockToken);

      // Act
      const result = generateToken(mockPayload);

      // Assert
      expect(result).toBe(mockToken);
      expect(jwtMock.sign).toHaveBeenCalledWith(mockPayload, mockSecret, {
        expiresIn: "24h",
      });
    });

    it("should use default expiration when JWT_EXPIRES_IN is not set", () => {
      // Arrange
      delete process.env.JWT_EXPIRES_IN;
      (jwtMock.sign as jest.Mock).mockReturnValueOnce(mockToken);

      // Act
      const result = generateToken(mockPayload);

      // Assert
      expect(result).toBe(mockToken);
      expect(jwtMock.sign).toHaveBeenCalledWith(mockPayload, mockSecret, {
        expiresIn: "24h",
      });
    });

    it("should throw error when JWT_SECRET is not set", () => {
      // Arrange
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => generateToken(mockPayload)).toThrow(
        "JWT_SECRET no está definido en las variables de entorno"
      );
      expect(jwtMock.sign).not.toHaveBeenCalled();
    });
  });

  describe("verifyToken", () => {
    it("should verify and decode token successfully", () => {
      // Arrange
      (jwtMock.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      // Act
      const result = verifyToken(mockToken);

      // Assert
      expect(result).toEqual(mockPayload);
      expect(jwtMock.verify).toHaveBeenCalledWith(mockToken, mockSecret);
    });

    it("should throw error when JWT_SECRET is not set", () => {
      // Arrange
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => verifyToken(mockToken)).toThrow(
        "JWT_SECRET no está definido en las variables de entorno"
      );
      expect(jwtMock.verify).not.toHaveBeenCalled();
    });

    it("should throw error when token is invalid", () => {
      // Arrange
      const error = new Error("Invalid token");
      error.name = "JsonWebTokenError";
      (jwtMock.verify as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      // Act & Assert
      expect(() => verifyToken(mockToken)).toThrow("Invalid token");
      expect(jwtMock.verify).toHaveBeenCalledWith(mockToken, mockSecret);
    });

    it("should throw error when token is expired", () => {
      // Arrange
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      (jwtMock.verify as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      // Act & Assert
      expect(() => verifyToken(mockToken)).toThrow("Token expired");
      expect(jwtMock.verify).toHaveBeenCalledWith(mockToken, mockSecret);
    });
  });
});
