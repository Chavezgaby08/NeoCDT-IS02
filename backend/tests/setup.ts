import "@jest/globals";
import { prismaMock } from "./_mocks_/prismaClient";

beforeEach(() => {
  jest.clearAllMocks();
  jest.resetAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

export { prismaMock as prisma };
