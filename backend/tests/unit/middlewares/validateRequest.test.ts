import "@jest/globals";
import { validateRequest } from "../../../src/middlewares/validateRequest";
import { createMockRequest, createMockResponse } from "../../utils/testUtils";
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

describe("validateRequest middleware", () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  const testSchema = z.object({
    name: z.string().min(3),
    age: z.number().min(18),
  });

  it("should call next() when validation succeeds", () => {
    // Arrange
    mockRequest.body = {
      name: "John Doe",
      age: 25,
    };
    const middleware = validateRequest(testSchema);

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should return 400 with validation errors when validation fails", () => {
    // Arrange
    mockRequest.body = {
      name: "Jo", // too short
      age: 16, // under minimum
    };
    const middleware = validateRequest(testSchema);

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Datos de entrada inválidos",
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          message: expect.any(String),
        }),
        expect.objectContaining({
          field: "age",
          message: expect.any(String),
        }),
      ]),
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 400 when required fields are missing", () => {
    // Arrange
    mockRequest.body = {};
    const middleware = validateRequest(testSchema);

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Datos de entrada inválidos",
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: "name",
          message: expect.any(String),
        }),
        expect.objectContaining({
          field: "age",
          message: expect.any(String),
        }),
      ]),
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 400 when fields have wrong types", () => {
    // Arrange
    mockRequest.body = {
      name: 123, // should be string
      age: "25", // should be number
    };
    const middleware = validateRequest(testSchema);

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Datos de entrada inválidos",
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: expect.any(String),
          message: expect.any(String),
        }),
      ]),
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should handle errors without error.errors property", () => {
    // Arrange
    const customError = new Error("Custom validation error");
    const mockSchema = {
      parse: jest.fn().mockImplementation(() => {
        throw customError;
      }),
    };
    const middleware = validateRequest(mockSchema as unknown as z.ZodSchema);

    // Act
    middleware(mockRequest, mockResponse, nextFunction);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      message: "Datos de entrada inválidos",
      errors: [],
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
