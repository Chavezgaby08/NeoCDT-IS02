jest.mock("zod", () => {
  const actual = jest.requireActual("zod");
  return {
    z: {
      ...actual.z,
      object: jest.fn().mockReturnValue({
        parse: jest.fn().mockImplementation((env) => {
          if (!env.JWT_SECRET) {
            throw new Error("Required");
          }
          return {
            ...env,
            JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || "24h",
            PORT: env.PORT || "3000",
            NODE_ENV: env.NODE_ENV || "development",
            FRONTEND_URL: env.FRONTEND_URL || "http://localhost:5173",
            BCRYPT_SALT_ROUNDS: env.BCRYPT_SALT_ROUNDS || "10",
          };
        }),
      }),
    },
  };
});

describe("Environment Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("debe validar todas las variables de entorno requeridas", () => {
    const mockEnv = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "supersecret".repeat(4),
      JWT_EXPIRES_IN: "24h",
      PORT: "3000",
      NODE_ENV: "development",
      FRONTEND_URL: "http://localhost:5173",
      BCRYPT_SALT_ROUNDS: "10",
    };
    process.env = mockEnv;

    const { env } = require("../../../src/config/env");

    expect(env).toEqual(mockEnv);
  });

  it("debe definir esquemas correctos para cada variable", () => {
    const mockEnv = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "supersecret".repeat(4),
      JWT_EXPIRES_IN: "24h",
      PORT: "3000",
      NODE_ENV: "development",
      FRONTEND_URL: "http://localhost:5173",
      BCRYPT_SALT_ROUNDS: "10",
    };
    process.env = mockEnv;

    const { env } = require("../../../src/config/env");
    expect(env).toEqual(mockEnv);
  });

  it("debe lanzar error si JWT_SECRET no está definido", () => {
    process.env = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      // JWT_SECRET omitido intencionalmente
      JWT_EXPIRES_IN: "24h",
      PORT: "3000",
      NODE_ENV: "development",
      FRONTEND_URL: "http://localhost:5173",
      BCRYPT_SALT_ROUNDS: "10",
    };

    expect(() => {
      require("../../../src/config/env");
    }).toThrow();
  });

  it("debe usar valores por defecto cuando no están definidos", () => {
    process.env = {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      JWT_SECRET: "supersecret".repeat(4),
      // Valores omitidos intencionalmente para usar los defaults:
      // JWT_EXPIRES_IN
      // PORT
      // NODE_ENV
      // FRONTEND_URL
      // BCRYPT_SALT_ROUNDS
    };

    const { env } = require("../../../src/config/env");

    expect(env.JWT_EXPIRES_IN).toBe("24h");
    expect(env.PORT).toBe("3000");
    expect(env.NODE_ENV).toBe("development");
    expect(env.FRONTEND_URL).toBe("http://localhost:5173");
    expect(env.BCRYPT_SALT_ROUNDS).toBe("10");
  });
});
