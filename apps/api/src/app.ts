import Fastify, { type FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import fastifyStatic from "@fastify/static";
import { existsSync } from "node:fs";
import path from "node:path";
import { serializerCompiler, validatorCompiler, jsonSchemaTransform, hasZodFastifySchemaValidationErrors, type ZodTypeProvider } from "fastify-type-provider-zod";
import { sql } from "drizzle-orm";
import type { AppContext } from "./lib/context.js";
import { AppError } from "./lib/errors.js";
import { authRoutes } from "./modules/auth/routes.js";
import { meRoutes } from "./modules/me/routes.js";
import { financeRoutes } from "./modules/finance/routes.js";
import { learningRoutes } from "./modules/learning/routes.js";
import { notificationRoutes } from "./modules/notifications/routes.js";
import { scamRoutes } from "./modules/scam/routes.js";
import { aiRoutes } from "./modules/ai/routes.js";
import { adminRoutes } from "./modules/admin/routes.js";

export async function buildApp(ctx: AppContext) {
  const app = Fastify({
    logger: ctx.config.NODE_ENV === "test" ? false : { level: ctx.config.LOG_LEVEL, redact: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"] },
    trustProxy: true,
    bodyLimit: 1_048_576,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate("ctx", ctx);

  const webDir = ctx.config.WEB_DIST_DIR ? path.resolve(ctx.config.WEB_DIST_DIR) : null;
  const serveWeb = !!webDir && existsSync(path.join(webDir, "index.html"));
  await app.register(helmet, {
    // Strict CSP for the bundled web app (self-hosted fonts, no third-party scripts).
    contentSecurityPolicy: serveWeb
      ? { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"], fontSrc: ["'self'"], connectSrc: ["'self'"], workerSrc: ["'self'"], manifestSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"] } }
      : false,
    crossOriginResourcePolicy: { policy: "same-site" },
  });
  const origins = ctx.config.CORS_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
  // On Render the public URL may get a random suffix; always allow it.
  if (process.env.RENDER_EXTERNAL_URL) origins.push(process.env.RENDER_EXTERNAL_URL.replace(/\/$/, ""));
  await app.register(cors, { origin: origins, credentials: true, methods: ["GET", "POST", "PATCH", "PUT", "DELETE"] });
  await app.register(cookie);
  await app.register(rateLimit, { global: true, max: ctx.config.RATE_LIMIT_MAX, timeWindow: "1 minute" });

  await app.register(swagger, {
    openapi: {
      info: { title: "සකසුරු API", description: "Sakasuru — Sri Lankan financial literacy & personal finance platform. Educational use only.", version: "0.1.0" },
      components: { securitySchemes: { bearer: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
      security: [{ bearer: [] }],
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.setErrorHandler((err: FastifyError, req, reply) => {
    if (hasZodFastifySchemaValidationErrors(err)) {
      return reply.code(400).send({ error: "validation_failed", message: "Some fields are invalid.", details: err.validation.map((v) => ({ path: v.instancePath, message: v.message })) });
    }
    if (err instanceof AppError) return reply.code(err.statusCode).send({ error: err.code, message: err.message });
    if (err.statusCode === 429) return reply.code(429).send({ error: "rate_limited", message: "Too many requests. Please slow down." });
    if (err.statusCode && err.statusCode < 500) return reply.code(err.statusCode).send({ error: err.code ?? "bad_request", message: err.message });
    req.log.error({ err }, "unhandled error");
    // Human-friendly message; technical detail stays in the server log.
    return reply.code(500).send({ error: "internal", message: "Something went wrong. Your information is safe. Please try again." });
  });

  app.get("/health", { schema: { hide: true } }, async () => {
    await ctx.db.execute(sql`select 1`);
    return { status: "ok", time: ctx.now().toISOString(), ai: ctx.ai ? ctx.ai.name : "knowledge-base" };
  });

  await app.register(
    async (v1) => {
      await v1.register(authRoutes, { prefix: "/auth" });
      await v1.register(meRoutes, { prefix: "/me" });
      await v1.register(financeRoutes);
      await v1.register(learningRoutes);
      await v1.register(notificationRoutes, { prefix: "/notifications" });
      await v1.register(scamRoutes, { prefix: "/scam" });
      await v1.register(aiRoutes, { prefix: "/ai" });
      await v1.register(adminRoutes, { prefix: "/admin" });
    },
    { prefix: "/api/v1" },
  );

  if (serveWeb) {
    await app.register(fastifyStatic, { root: webDir!, prefix: "/", wildcard: false, maxAge: "1h" });
    app.setNotFoundHandler((req, reply) => {
      if (req.url.startsWith("/api/")) return reply.code(404).send({ error: "not_found", message: "Not found" });
      return reply.sendFile("index.html");
    });
  }

  return app;
}
