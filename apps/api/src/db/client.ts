import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";

export type DB = NodePgDatabase<typeof schema>;

// Return NUMERIC as string (exact) and DATE as yyyy-mm-dd string, never JS Date/float.
pg.types.setTypeParser(1082, (v) => v);

export function createDb(url: string, ssl = false) {
  const pool = new pg.Pool({ connectionString: url, max: 10, ssl: ssl ? { rejectUnauthorized: false } : undefined });
  const db = drizzle(pool, { schema });
  return { db, pool };
}

export { schema };
