import "@jest/globals";
import bcrypt from "bcryptjs";

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

export const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
