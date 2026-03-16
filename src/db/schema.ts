import { pgTable, timestamp, varchar, uuid, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    email: varchar("email", { length: 256 }).unique().notNull(),
    hashedPassword: varchar('hashed_password', { length: 256 }).notNull(),
    isChirpyRed: boolean('is_chirpy_red').notNull().default(false),
});

export type NewUser = typeof users.$inferInsert;
export type UserResponse = Omit<typeof users.$inferSelect, 'hashedPassword'>;

export const chirps = pgTable('chirps', {
    id: uuid('id').primaryKey().defaultRandom(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    body: varchar("body", { length: 280 }).notNull(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
});

export type NewChirp = typeof chirps.$inferInsert;
export type ChirpResponse = typeof chirps.$inferSelect;

export const refreshTokens = pgTable('refresh_tokens', {
    token: varchar('token', { length: 256 }).primaryKey(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at').notNull(),
    revokedAt: timestamp('revoked_at'),
});

export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshTokenResponse = typeof refreshTokens.$inferSelect;