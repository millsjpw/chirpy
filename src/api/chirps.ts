import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { createChirp, deleteChirpById, getAllChirps, getChirpById } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

type ChirpData = {
    body: string;
};

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  return cleanChirp(body);
}

function cleanChirp(chirp: string): string {
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    let cleanedChirp = chirp;
    for (const badWord of badWords) {
        const regex = new RegExp(badWord, "gi");
        cleanedChirp = cleanedChirp.replace(regex, "****");
    }
    return cleanedChirp;
}

export async function handlerCreateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;

    const token = getBearerToken(req);
    if (!token) {
        respondWithError(res, 401, "Unauthorized");
        return;
    }
    const userId = validateJWT(token, config.jwt.secret);

    const cleaned = validateChirp(params.body);
    const chirp = await createChirp({ body: cleaned, userId: userId });

    respondWithJSON(res, 201, chirp);
}

export async function handlerGetAllChirps(req: Request, res: Response) {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (authorIdQuery) {
        if (typeof authorIdQuery === "string") {
            authorId = authorIdQuery;
        }
    }

    let sortDirection: "asc" | "desc" = "asc";
    let sortQuery = req.query.sort;
    if (sortQuery && typeof sortQuery === "string") {
        if (sortQuery === "asc" || sortQuery === "desc") {
            sortDirection = sortQuery;
        }
    }

    const chirps = await getAllChirps(authorId, sortDirection);
    respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
        respondWithError(res, 400, "Invalid chirp ID");
        return;
    }

    const chirp = await getChirpById(chirpId.toString());
    if (!chirp) {
        respondWithError(res, 404, `Chirp with chirpId: ${chirpId} not found`);
        return;
    }
    
    respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirpById(req: Request, res: Response) {
    const token = getBearerToken(req);
    const subject = validateJWT(token, config.jwt.secret);

    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
        respondWithError(res, 400, "Invalid chirp ID");
        return;
    }

    // only allow users to delete their own chirps, else return 403
    try {
        await deleteChirpById(chirpId.toString(), subject);
    } catch (error) {
        // if chirp not found, return 404
        if (error instanceof NotFoundError) {
            respondWithError(res, 404, `Chirp with chirpId: ${chirpId} not found`);
            return;
        }
        // for any other errors, return 403
        respondWithError(res, 403, "Forbidden");
        return;
    }
    respondWithJSON(res, 204, { message: `Chirp with id ${chirpId} deleted` });
}