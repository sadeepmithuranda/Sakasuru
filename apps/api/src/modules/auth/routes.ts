import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, isNull, gt, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { RegisterSchema, LoginSchema, ChangePasswordSchema, z } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { AppError, conflict, unauthorized } from "../../lib/errors.js";
import { randomToken, sha256 } from "../../lib/crypto.js";
import { audit } from "../../lib/audit.js";
import { authenticate, signAccessToken } from "../../plugins/auth.js";
import type { RoleName } from "../../lib/context.js";
import { loadMe } from "../me/service.js";

const REFRESH_COOKIE = "sk_refresh";
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;
// Argon2id parameters (OWASP recommended minimums).
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

const ok = z.object({ ok: z.literal(true) });

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db, config } = app.ctx;

  const cookieOpts = () => ({
    httpOnly: true,
    secure: config.NODE_ENV === "production" || config.COOKIE_SAMESITE === "none",
    sameSite: config.COOKIE_SAMESITE,
    path: "/api/v1/auth",
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 86400,
  });

  async function startSession(req: FastifyRequest, reply: FastifyReply, userId: string, role: RoleName, familyId: string = randomUUID()) {
    const refresh = randomToken(32);
    const expiresAt = new Date(app.ctx.now().getTime() + config.REFRESH_TOKEN_TTL_DAYS * 86_400_000);
    const [session] = await db
      .insert(schema.sessions)
      .values({ userId, tokenHash: sha256(refresh), familyId, userAgent: req.headers["user-agent"]?.slice(0, 200) ?? null, ip: req.ip, expiresAt })
      .returning({ id: schema.sessions.id });
    reply.setCookie(REFRESH_COOKIE, refresh, cookieOpts());
    const accessToken = await signAccessToken(config, userId, role, session!.id);
    // `refreshToken` is also returned for native/mobile clients that cannot use cookies.
    return { accessToken, refreshToken: refresh, expiresIn: config.ACCESS_TOKEN_TTL_MIN * 60 };
  }

  const authLimit = { config: { rateLimit: { max: config.AUTH_RATE_LIMIT, timeWindow: "1 minute" } } };

  app.post("/register", { ...authLimit, schema: { tags: ["auth"], body: RegisterSchema } }, async (req, reply) => {
    const { email, password, name, language } = req.body;
    const exists = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
    if (exists.length) throw conflict("email_taken", "An account with this email already exists");
    const passwordHash = await hash(password, ARGON);
    const user = await db.transaction(async (tx) => {
      const [u] = await tx.insert(schema.users).values({ email, passwordHash }).returning();
      await tx.insert(schema.userProfiles).values({ userId: u!.id, name, language });
      await tx.insert(schema.userPreferences).values({ userId: u!.id, data: {} });
      await tx.insert(schema.learningStreaks).values({ userId: u!.id });
      await tx.insert(schema.consents).values([
        { userId: u!.id, type: "terms", granted: true },
        { userId: u!.id, type: "aiDataAccess", granted: false },
        { userId: u!.id, type: "aiHistory", granted: false },
        { userId: u!.id, type: "analytics", granted: false },
      ]);
      await tx.insert(schema.notifications).values({ userId: u!.id, key: "notifications.welcome", dedupeKey: "welcome" });
      return u!;
    });
    req.auth = { userId: user.id, role: "user" };
    await audit(db, req, "auth.register", user.id);
    const tokens = await startSession(req, reply, user.id, "user");
    reply.code(201);
    return { ...tokens, me: await loadMe(app.ctx, user.id) };
  });

  app.post("/login", { ...authLimit, schema: { tags: ["auth"], body: LoginSchema } }, async (req, reply) => {
    const { email, password } = req.body;
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    const now = app.ctx.now();
    if (!user) {
      // Spend comparable time to avoid user-enumeration timing differences.
      await hash(password, ARGON);
      throw unauthorized("invalid_credentials");
    }
    if (user.lockedUntil && user.lockedUntil > now) throw new AppError(429, "account_locked", "Too many attempts. Try again later.");
    const valid = await verify(user.passwordHash, password);
    if (!valid) {
      const failed = user.failedLogins + 1;
      await db
        .update(schema.users)
        .set({ failedLogins: failed >= MAX_FAILED ? 0 : failed, lockedUntil: failed >= MAX_FAILED ? new Date(now.getTime() + LOCK_MINUTES * 60_000) : null })
        .where(eq(schema.users.id, user.id));
      req.auth = { userId: user.id, role: user.role as RoleName };
      await audit(db, req, failed >= MAX_FAILED ? "auth.locked" : "auth.login_failed", user.id);
      throw unauthorized("invalid_credentials");
    }
    // Suspicious-login signal: first login from a new user agent creates a security notification.
    const ua = req.headers["user-agent"]?.slice(0, 200) ?? null;
    const known = await db
      .select({ id: schema.sessions.id })
      .from(schema.sessions)
      .where(and(eq(schema.sessions.userId, user.id), ua ? eq(schema.sessions.userAgent, ua) : isNull(schema.sessions.userAgent)))
      .limit(1);
    await db.update(schema.users).set({ failedLogins: 0, lockedUntil: null, lastLoginAt: now }).where(eq(schema.users.id, user.id));
    req.auth = { userId: user.id, role: user.role as RoleName };
    if (!known.length && user.lastLoginAt) {
      await db
        .insert(schema.notifications)
        .values({ userId: user.id, key: "notifications.newDevice", params: { device: (ua ?? "unknown").slice(0, 60) }, dedupeKey: `newdevice:${sha256(ua ?? "")}` })
        .onConflictDoNothing();
    }
    await audit(db, req, "auth.login", user.id);
    const tokens = await startSession(req, reply, user.id, user.role as RoleName);
    return { ...tokens, me: await loadMe(app.ctx, user.id) };
  });

  /**
   * Refresh-token rotation with reuse detection: each refresh token works once.
   * Presenting an already-rotated token revokes the whole session family.
   * Requires the X-Requested-With header as a CSRF guard for cookie use.
   */
  app.post(
    "/refresh",
    { schema: { tags: ["auth"], body: z.object({ refreshToken: z.string().max(200).optional() }).nullish() } },
    async (req, reply) => {
      const fromCookie = req.cookies[REFRESH_COOKIE];
      const token = req.body?.refreshToken ?? fromCookie;
      if (!token) throw unauthorized("no_refresh_token");
      if (fromCookie && !req.body?.refreshToken && req.headers["x-requested-with"] !== "sakasuru") throw unauthorized("csrf");
      const [session] = await db.select().from(schema.sessions).where(eq(schema.sessions.tokenHash, sha256(token)));
      const now = app.ctx.now();
      if (!session) throw unauthorized("refresh_invalid");
      if (session.revokedAt) {
        await db.update(schema.sessions).set({ revokedAt: now }).where(and(eq(schema.sessions.familyId, session.familyId), isNull(schema.sessions.revokedAt)));
        await audit(db, null, "auth.refresh_reuse_detected", session.userId);
        reply.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
        throw unauthorized("refresh_reused");
      }
      if (session.expiresAt < now) throw unauthorized("refresh_expired");
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, session.userId));
      if (!user) throw unauthorized();
      await db.update(schema.sessions).set({ revokedAt: now, lastUsedAt: now }).where(eq(schema.sessions.id, session.id));
      return startSession(req, reply, user.id, user.role as RoleName, session.familyId);
    },
  );

  app.post("/logout", { schema: { tags: ["auth"], response: { 200: ok } } }, async (req, reply) => {
    const token = req.cookies[REFRESH_COOKIE];
    if (token) await db.update(schema.sessions).set({ revokedAt: app.ctx.now() }).where(eq(schema.sessions.tokenHash, sha256(token)));
    reply.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" });
    return { ok: true as const };
  });

  app.get("/me", { preHandler: authenticate, schema: { tags: ["auth"], security: [{ bearer: [] }] } }, async (req) => loadMe(app.ctx, req.auth!.userId));

  app.post("/change-password", { preHandler: authenticate, ...authLimit, schema: { tags: ["auth"], body: ChangePasswordSchema } }, async (req) => {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, req.auth!.userId));
    if (!user || !(await verify(user.passwordHash, req.body.currentPassword))) throw unauthorized("invalid_credentials");
    await db.update(schema.users).set({ passwordHash: await hash(req.body.newPassword, ARGON) }).where(eq(schema.users.id, user.id));
    // Sign out every other session.
    const sid = req.auth!.sessionId;
    await db
      .update(schema.sessions)
      .set({ revokedAt: app.ctx.now() })
      .where(and(eq(schema.sessions.userId, user.id), isNull(schema.sessions.revokedAt), sid ? sql`${schema.sessions.id} <> ${sid}` : sql`true`));
    await audit(db, req, "auth.password_changed", user.id);
    return { ok: true as const };
  });

  app.get("/sessions", { preHandler: authenticate, schema: { tags: ["auth"] } }, async (req) => {
    const rows = await db
      .select()
      .from(schema.sessions)
      .where(and(eq(schema.sessions.userId, req.auth!.userId), isNull(schema.sessions.revokedAt), gt(schema.sessions.expiresAt, app.ctx.now())));
    return rows.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      lastUsedAt: s.lastUsedAt.toISOString(),
      current: s.id === req.auth!.sessionId,
    }));
  });

  app.delete("/sessions/:id", { preHandler: authenticate, schema: { tags: ["auth"], params: z.object({ id: z.string().uuid() }) } }, async (req) => {
    await db
      .update(schema.sessions)
      .set({ revokedAt: app.ctx.now() })
      .where(and(eq(schema.sessions.id, req.params.id), eq(schema.sessions.userId, req.auth!.userId)));
    await audit(db, req, "auth.session_revoked", req.params.id);
    return { ok: true as const };
  });

};
