import "@jest/globals";
import jwt from "jsonwebtoken";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

export const jwtMock = jwt as jest.Mocked<typeof jwt>;
