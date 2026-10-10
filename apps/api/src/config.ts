import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** HS256 secret for access tokens, at least 32 characters */
  JWT_SECRET: z.string().min(32),
  /** AES-256-GCM key: 32 bytes base64-encoded, or any 32+ character secret (hashed to 32 bytes) */
  DATA_ENCRYPTION_KEY: z.string().min(32),
  /** optional: serve the built web app (apps/web/dist) from the API for a single-service deploy */
  WEB_DIST_DIR: z.string().optional(),
  /** comma-separated list of allowed web origins */
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
  ACCESS_TOKEN_TTL_MIN: z.coerce.number().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  /** set to "none" when the web app is served from a different site than the API */
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_MODEL: z.string().default("claude-haiku-5-5"),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  /** login/register attempts per IP per minute */
  AUTH_RATE_LIMIT: z.coerce.number().default(10),
  LOG_LEVEL: z.string().default("info"),
});

export type Config = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
