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
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    await seedAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
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
