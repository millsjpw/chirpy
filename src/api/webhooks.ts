import { getAPIKey } from "../auth.js";
import { upgradeUserToChirpyRed } from "../db/queries/users.js";
import { respondWithJSON, respondWithError } from "./json.js";
import type { Request, Response } from "express";

export async function handlerUsersUpgradeToChirpyRed(req: Request, res: Response) {
    const apiKey = getAPIKey(req);
    if (apiKey !== process.env.POLKA_KEY) {
        respondWithError(res, 401, "Unauthorized");
        return;
    }

    type eventInfo = {
        event: string;
        data: {
            userId: string;
        }
    }

    const params: eventInfo = req.body;

    if (params.event !== "user.upgraded") {
        respondWithJSON(res, 204, {});
        return;
    }

    const user = await upgradeUserToChirpyRed(params.data.userId);
    if (!user) {
        respondWithError(res, 404, "");
        return;
    }

    respondWithJSON(res, 204, {});
}