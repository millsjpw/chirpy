import express from 'express';
import { handlerReadiness } from './api/readiness.js';
import { middlewareErrorHandler, middlewareLogResponses, middlewareMetricsInc } from './api/middleware.js';
import { handlerMetrics } from './api/metrics.js';
import { handlerReset } from './api/reset.js';
import { handlerCreateChirp, handlerDeleteChirpById, handlerGetAllChirps, handlerGetChirpById } from './api/chirps.js';
import { config } from "./config.js";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { handlerUsersCreate, handlerUsersUpdate } from './api/users.js';
import { handlerLogin, handlerRefresh, handlerRevoke } from './api/auth.js';

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(express.json());
app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);

app.get("/api/healthz", handlerReadiness);
app.post("/api/users", handlerUsersCreate);
app.put("/api/users", handlerUsersUpdate);
app.post("/api/chirps", handlerCreateChirp);
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerGetChirpById);
app.delete("/api/chirps/:chirpId", handlerDeleteChirpById);
app.post("/api/login", handlerLogin);
app.post("/api/refresh", handlerRefresh);
app.post("/api/revoke", handlerRevoke);

app.use(middlewareErrorHandler);

app.listen(config.api.port, () => {
  console.log(`Server is running on http://localhost:${config.api.port}`);
});