import { PrismaClient } from "@prisma/client";

// Configurar un mock inicial para PrismaClient
let mockPrismaInstance: any;
let mockPrismaConstructor: jest.Mock;

jest.mock("@prisma/client", () => {
  mockPrismaConstructor = jest.fn().mockImplementation((config) => {
    mockPrismaInstance = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      _config: config,
    };
    return mockPrismaInstance;
  });
  return { PrismaClient: mockPrismaConstructor };
});

describe("Database Configuration", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.resetModules();
  });

  it("debe crear una instancia de PrismaClient", () => {
    const prisma = require("../../../src/config/database").default;
    expect(mockPrismaConstructor).toHaveBeenCalled();
    expect(prisma).toBe(mockPrismaInstance);
  });

  it("debe configurar logs en desarrollo", () => {
    process.env.NODE_ENV = "development";
    jest.resetModules();
    require("../../../src/config/database");
    expect(mockPrismaConstructor).toHaveBeenCalledWith({
      log: ["query", "error", "warn"],
    });
  });

  it("debe configurar logs solo para errores en producción", () => {
    process.env.NODE_ENV = "production";
    jest.resetModules();
    require("../../../src/config/database");
    expect(mockPrismaConstructor).toHaveBeenCalledWith({
      log: ["error"],
    });
  });

  it("debe exportar la instancia de prisma", () => {
    const prisma = require("../../../src/config/database").default;
    expect(prisma).toBe(mockPrismaInstance);
    expect(prisma.$connect).toBeDefined();
    expect(prisma.$disconnect).toBeDefined();
  });
});
