import "@jest/globals";
import { hashPassword, comparePassword } from "../../../src/utils/bcrypt";
import { bcryptMock } from "../../_mocks_/bcrypt";

jest.mock("bcryptjs");

describe("bcrypt utils", () => {
  const mockPassword = "testPassword123";
  const mockHash = "$2a$10$abcdefghijklmnopqrstuvwxyz123456";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BCRYPT_SALT_ROUNDS = "10";
  });

  describe("hashPassword", () => {
    it("should hash password with correct salt rounds", async () => {
      // Arrange
      (bcryptMock.hash as jest.Mock).mockResolvedValueOnce(mockHash);

      // Act
      const result = await hashPassword(mockPassword);

      // Assert
      expect(result).toBe(mockHash);
      expect(bcryptMock.hash).toHaveBeenCalledWith(mockPassword, 10);
    });

    it("should use default salt rounds when env variable is not set", async () => {
      // Arrange
      delete process.env.BCRYPT_SALT_ROUNDS;
      (bcryptMock.hash as jest.Mock).mockResolvedValueOnce(mockHash);

      // Act
      const result = await hashPassword(mockPassword);

      // Assert
      expect(result).toBe(mockHash);
      expect(bcryptMock.hash).toHaveBeenCalledWith(mockPassword, 10);
    });

    it("should reject if hashing fails", async () => {
      // Arrange
      const error = new Error("Hashing failed");
      (bcryptMock.hash as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(hashPassword(mockPassword)).rejects.toThrow(
        "Hashing failed"
      );
    });
  });

  describe("comparePassword", () => {
    it("should return true when passwords match", async () => {
      // Arrange
      (bcryptMock.compare as jest.Mock).mockResolvedValueOnce(true);

      // Act
      const result = await comparePassword(mockPassword, mockHash);

      // Assert
      expect(result).toBe(true);
      expect(bcryptMock.compare).toHaveBeenCalledWith(mockPassword, mockHash);
    });

    it("should return false when passwords do not match", async () => {
      // Arrange
      (bcryptMock.compare as jest.Mock).mockResolvedValueOnce(false);

      // Act
      const result = await comparePassword(mockPassword, mockHash);

      // Assert
      expect(result).toBe(false);
      expect(bcryptMock.compare).toHaveBeenCalledWith(mockPassword, mockHash);
    });

    it("should reject if comparison fails", async () => {
      // Arrange
      const error = new Error("Comparison failed");
      (bcryptMock.compare as jest.Mock).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(comparePassword(mockPassword, mockHash)).rejects.toThrow(
        "Comparison failed"
      );
    });
  });
});
