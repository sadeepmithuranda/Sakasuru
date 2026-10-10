import type { FastifyRequest } from "fastify";
import { schema } from "../db/client.js";
import type { DB } from "../db/client.js";

/** Write an audit entry. Never include financial amounts or message content in `meta`. */
export async function audit(db: DB, req: FastifyRequest | null, action: string, target?: string | null, meta?: Record<string, unknown>) {
  await db.insert(schema.auditLogs).values({
    actorId: req?.auth?.userId ?? null,
    action,
    target: target ?? null,
    ip: req?.ip ?? null,
    meta: meta ?? null,
  });
}
