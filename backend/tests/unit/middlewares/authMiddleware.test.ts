import "@jest/globals";
import { authenticate } from "../../../src/middlewares/authMiddleware";
import { verifyToken } from "../../../src/utils/jwt";
import { Response, NextFunction } from "express";
import { createMockRequest, createMockResponse } from "../../utils/testUtils";
import type { AuthRequest } from "../../../src/types";

jest.mock("../../../src/utils/jwt", () => ({
  verifyToken: jest.fn(),
}));

describe("authenticate middleware", () => {
  let mockRequest: AuthRequest;
  let mockResponse: Response;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest() as AuthRequest;
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  it("should call next() when valid token is provided", () => {
    // Arrange
    const mockToken = "Bearer valid.jwt.token";
    const mockDecodedToken = {
      id: "1",
      email: "test@example.com",
      rol: "CLIENTE",
    };
    mockRequest.headers = { authorization: mockToken };
    (verifyToken as jest.Mock).mockReturnValueOnce(mockDecodedToken);

    // Act
    authenticate(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(verifyToken).toHaveBeenCalledWith("valid.jwt.token");
    expect(mockRequest.user).toEqual(mockDecodedToken);
    expect(nextFunction).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it("should return 401 when no token is provided", () => {
    // Act
    authenticate(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token no proporcionado",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 when invalid token format is provided", () => {
    // Arrange
    mockRequest.headers = { authorization: "InvalidTokenFormat" };

    // Act
    authenticate(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token no proporcionado",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 when token verification fails", () => {
    // Arrange
    const mockToken = "Bearer invalid.jwt.token";
    mockRequest.headers = { authorization: mockToken };
    (verifyToken as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Token inválido");
    });

    // Act
    authenticate(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Token inválido o expirado",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
