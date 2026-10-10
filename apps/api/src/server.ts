import { loadConfig } from "./config.js";
import { createDb } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { seedContent, seedAdmin } from "./db/seed.js";
import { FieldCipher } from "./lib/crypto.js";
import { AnthropicProvider } from "./modules/ai/provider.js";
import { buildApp } from "./app.js";

async function main() {
  const config = loadConfig();
  // Apply pending migrations and make sure the education content exists before serving traffic.
  await runMigrations(config.DATABASE_URL, config.DATABASE_SSL);
  const { db, pool } = createDb(config.DATABASE_URL, config.DATABASE_SSL);
  await seedContent(db);
  // Bootstrap the first super administrator from environment variables, if provided.
  // A bad admin setting must never stop the whole site from starting, so it only logs a warning.
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 12) console.warn("ADMIN_PASSWORD must be at least 12 characters — admin account not created.");
    else await seedAdmin(db, adminEmail, adminPassword).catch((err) => console.warn("Admin account not created:", err));
  }
  const app = await buildApp({
    config,
    db,
    cipher: new FieldCipher(config.DATA_ENCRYPTION_KEY),
    ai: config.ANTHROPIC_API_KEY ? new AnthropicProvider(config.ANTHROPIC_API_KEY, config.AI_MODEL) : null,
    now: () => new Date(),
  });
  const close = async () => {
    await app.close();
    await pool.end();
    process.exit(0);
  };
  process.on("SIGTERM", close);
  process.on("SIGINT", close);
  await app.listen({ port: config.PORT, host: config.HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
