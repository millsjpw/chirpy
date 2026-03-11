import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(req: Request, res: Response) {
    res.status(200).set("Content-Type", "text/html; charset=utf-8").send(`
        <html>
            <body>
                <h1>Welcome, Chirpy Admin</h1>
                <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
            </body>
        </html>`
    );
}
