import type { Request, Response } from "express";

import { createUser, updateUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { NewUser, UserResponse } from "../db/schema.js";
import { hashPassword, validateJWT } from "../auth.js";
import { getBearerToken } from "../auth.js";
import { config } from "../config.js";

export async function handlerUsersCreate(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    respondWithError(res, 400, "Missing required fields");
    return;
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword,
  } satisfies NewUser);

  if (!user) {
    respondWithError(res, 500, "Could not create user");
    return;
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies UserResponse);
}

export async function handlerUsersUpdate(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const token = getBearerToken(req);
  const subject = validateJWT(token, config.jwt.secret);

  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await updateUser(subject, params.email, hashedPassword);

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
  } satisfies UserResponse);
}