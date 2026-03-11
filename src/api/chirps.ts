import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createChirp, getAllChirps, getChirpById } from "../db/queries/chirps.js";
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
    const userId = validateJWT(token, config.jwt.secret);

    const cleaned = validateChirp(params.body);
    const chirp = await createChirp({ body: cleaned, userId: userId });

    respondWithJSON(res, 201, chirp);
}

export async function handlerGetAllChirps(_: Request, res: Response) {
    const chirps = await getAllChirps();
    respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
    const chirpId = req.params.chirpId;
    if (typeof chirpId !== "string") {
        throw new BadRequestError("Invalid chirp ID");
    }

    const chirp = await getChirpById(chirpId.toString());
    if (!chirp) {
        throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
    }
    
    respondWithJSON(res, 200, chirp);
}