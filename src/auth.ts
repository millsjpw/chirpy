import * as argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UserNotAuthenticatedError } from "./api/errors.js";

const TOKEN_ISSUER = "chirpy";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string): Promise<boolean> {
    if (!password) return false;
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    const now = Math.floor(Date.now() / 1000);
    const p: payload = {
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: now,
        exp: now + expiresIn
    }
    return jwt.sign(p, secret);
}

export function validateJWT(tokenString: string, secret: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UserNotAuthenticatedError("Invalid token");
    }

    if (decoded.iss !== TOKEN_ISSUER) {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
  const splitAuth = header.split(" ");
  if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }
  return splitAuth[1];
}

export function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(req: Request) {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    }

    const splitAuth = authHeader.split("ApiKey ");
    if (splitAuth.length < 2) {
        throw new UserNotAuthenticatedError("Malformed authorization header");
    }
    return splitAuth[1];
}