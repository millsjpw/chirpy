import { NotFoundError, UserForbiddenError } from "../../api/errors.js";
import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";
import { asc, eq, desc } from "drizzle-orm";


export async function createChirp(chirp: NewChirp) {
    const [result] = await db
        .insert(chirps)
        .values(chirp)
        .returning();
    return result;
}

export async function getAllChirps(authorId?: string, sortDirection?: "asc" | "desc") {
    const orderBy = sortDirection === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt);
    if (authorId) {
        return await db.select()
            .from(chirps)
            .where(eq(chirps.userId, authorId))
            .orderBy(orderBy);
    }
    return await db.select()
        .from(chirps)
        .orderBy(orderBy);
}

export async function getChirpById(chirpId: string) {
    const [result] = await db.select()
        .from(chirps)
        .where(eq(chirps.id, chirpId));
    return result;
}

export async function deleteAllChirps() {
    await db.delete(chirps);
}

export async function deleteChirpById(chirpId: string, userId: string) {
    // get the chirp to see if it exists
    const chirp = await getChirpById(chirpId);
    if (!chirp) {
        throw new NotFoundError(`Chirp with id ${chirpId} not found`);
    }
    // only allow users to delete their own chirps
    if (chirp.userId !== userId) {
        throw new UserForbiddenError("You do not have permission to delete this chirp");
    }
    await db.delete(chirps)
        .where(eq(chirps.id, chirpId));
}