import "@jest/globals";
import { requireRole } from "../../../src/middlewares/roleMiddleware";
import { createMockRequest, createMockResponse } from "../../utils/testUtils";
import { AuthRequest } from "../../../src/types";
import { Response, NextFunction } from "express";
import { RolUsuario } from "@prisma/client";

describe("requireRole middleware", () => {
  let mockRequest: AuthRequest;
  let mockResponse: Response;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest() as AuthRequest;
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() when user has required role", () => {
    // Arrange
    mockRequest.user = {
      id: "1",
      email: "admin@example.com",
      rol: "ADMINISTRADOR" as RolUsuario,
    };
    const middleware = requireRole("ADMINISTRADOR");

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should call next() when user has one of multiple required roles", () => {
    // Arrange
    mockRequest.user = {
      id: "1",
      email: "agente@example.com",
      rol: "AGENTE" as RolUsuario,
    };
    const middleware = requireRole("ADMINISTRADOR", "AGENTE");

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    // Arrange
    mockRequest.user = undefined;
    const middleware = requireRole("ADMINISTRADOR");

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Usuario no autenticado",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 403 when user does not have required role", () => {
    // Arrange
    mockRequest.user = {
      id: "1",
      email: "cliente@example.com",
      rol: "CLIENTE" as RolUsuario,
    };
    const middleware = requireRole("ADMINISTRADOR");

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "No tienes permisos para realizar esta acción",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 403 when user does not have any of multiple required roles", () => {
    // Arrange
    mockRequest.user = {
      id: "1",
      email: "cliente@example.com",
      rol: "CLIENTE" as RolUsuario,
    };
    const middleware = requireRole("ADMINISTRADOR", "AGENTE");

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "No tienes permisos para realizar esta acción",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
