import "@jest/globals";
import { errorHandler } from "../../../src/middlewares/errorHandler";
import { createMockRequest, createMockResponse } from "../../utils/testUtils";
import { Request, Response, NextFunction } from "express";

describe("errorHandler middleware", () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let nextFunction: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("should handle JWT token invalid error", () => {
    // Arrange
    const error = new Error("Invalid token");
    error.name = "JsonWebTokenError";

    // Act
    errorHandler(error, mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token inválido",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
  });

  it("should handle JWT token expired error", () => {
    // Arrange
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";

    // Act
    errorHandler(error, mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token expirado",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
  });

  it("should show generic error message in production", () => {
    // Arrange
    process.env.NODE_ENV = "production";
    const error = new Error("Database connection failed");

    // Act
    errorHandler(error, mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Error interno del servidor",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
  });

  it("should show detailed error message in development", () => {
    // Arrange
    process.env.NODE_ENV = "development";
    const error = new Error("Database connection failed");

    // Act
    errorHandler(error, mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Database connection failed",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
  });
});
