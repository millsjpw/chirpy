# Chirpy API

Minimal HTTP API for the Chirpy service. Below is a concise reference for available endpoints, authentication, and examples. Implementation lives in the `src` folder (see handlers in [src/index.ts](src/index.ts#L1-L40) and [src/api](src/api)).

**Authentication**: JWT Bearer tokens are used for user-protected endpoints. Send `Authorization: Bearer <token>`.

- Login: `POST /api/login` — body `{ "email": string, "password": string }` → returns user info plus `token` and `refreshToken`. See [src/api/auth.ts](src/api/auth.ts#L1-L80).
- Refresh token: `POST /api/refresh` — send refresh token in `Authorization: Bearer <refreshToken>` → returns `{ token }`.
- Revoke refresh: `POST /api/revoke` — send refresh token in `Authorization: Bearer <refreshToken>` → returns `204`.
- Webhooks: `POST /api/polka/webhooks` — requires `Authorization: ApiKey <POLKA_KEY>` header. See [src/api/webhooks.ts](src/api/webhooks.ts#L1-L60).

**Endpoints**

- `GET /api/healthz` — readiness probe, returns `200 OK` (plain text). Handler: [src/api/readiness.ts](src/api/readiness.ts#L1-L20).

- Users
	- `POST /api/users` — create user. Body: `{ "email": string, "password": string }`. Returns `201` with user object. Handler: [src/api/users.ts](src/api/users.ts#L1-L60).
	- `PUT /api/users` — update user (requires `Authorization: Bearer <token>`). Body: `{ "email": string, "password": string }`. Returns `200` with user object.

- Authentication
	- `POST /api/login` — sign-in, body `{ "email", "password" }`. Returns `200` with `token` and `refreshToken`.
	- `POST /api/refresh` — exchange refresh token for new access token.
	- `POST /api/revoke` — revoke a refresh token.

- Chirps
	- `POST /api/chirps` — create a chirp (requires `Authorization: Bearer <token>`). Body: `{ "body": string }`. Max length 140 characters; certain profanity is masked. Handler: [src/api/chirps.ts](src/api/chirps.ts#L1-L80).
	- `GET /api/chirps` — list chirps. Optional query `?authorId=<id>`.
	- `GET /api/chirps/:chirpId` — get single chirp by id.
	- `DELETE /api/chirps/:chirpId` — delete a chirp (requires `Authorization: Bearer <token>`). Only authors may delete their own chirps.

- Admin
	- `GET /admin/metrics` — simple HTML metrics page. See [src/api/metrics.ts](src/api/metrics.ts#L1-L40).
	- `POST /admin/reset` — development-only reset of file hit counter and DB reset (protected by environment/platform check). See [src/api/reset.ts](src/api/reset.ts#L1-L40).

**Errors & middleware**

- Error handling maps typed errors to status codes: `BadRequestError` → 400, `UserNotAuthenticatedError` → 401, `UserForbiddenError` → 403, `NotFoundError` → 404; unhandled errors return 500. See [src/api/errors.ts](src/api/errors.ts#L1-L40) and [src/api/middleware.ts](src/api/middleware.ts#L1-L80).
- Static files served under `/app` and increment a hit counter via middleware. See [src/index.ts](src/index.ts#L1-L40).

**Examples**

Login (get access + refresh tokens):

```bash
curl -X POST http://localhost:PORT/api/login \
	-H "Content-Type: application/json" \
	-d '{"email":"alice@example.com","password":"s3cret"}'
```

Create a chirp (requires access token):

```bash
curl -X POST http://localhost:PORT/api/chirps \
	-H "Authorization: Bearer <ACCESS_TOKEN>" \
	-H "Content-Type: application/json" \
	-d '{"body":"Hello Chirpy!"}'
```