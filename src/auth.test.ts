import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});

describe("JWT Handling", () => {
  const userId = "12345";
  let token: string;
  let secret = "mySecretKey";

  beforeAll(() => {
    token = makeJWT(userId, 3600, secret);
  });

  it("should validate a valid JWT", () => {
    const result = validateJWT(token, secret);
    expect(result).toBe(userId);
  });

  it("should return null for an invalid JWT", () => {
    const invalidToken = token + "invalid";
    expect(() => validateJWT(invalidToken, secret)).toThrowError();
  });
});