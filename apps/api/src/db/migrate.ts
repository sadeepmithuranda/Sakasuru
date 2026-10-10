import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createDb } from "./client.js";

const here = path.dirname(fileURLToPath(import.meta.url));
export const MIGRATIONS_DIR = path.resolve(here, "../../drizzle");

export async function runMigrations(url: string, ssl = false) {
  const { db, pool } = createDb(url, ssl);
  try {
    await migrate(db, { migrationsFolder: MIGRATIONS_DIR });
  } finally {
    await pool.end();
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  runMigrations(url, process.env.DATABASE_SSL === "true")
    .then(() => console.log("✔ migrations applied"))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
