import type { Config } from "../config.js";
import type { DB } from "../db/client.js";
import type { FieldCipher } from "./crypto.js";
import type { AiProvider } from "../modules/ai/provider.js";

export interface AppContext {
  config: Config;
  db: DB;
  cipher: FieldCipher;
  ai: AiProvider | null;
  /** injectable clock for tests */
  now: () => Date;
}

export type RoleName = "user" | "creator" | "reviewer" | "moderator" | "admin" | "superadmin";
export const ROLE_RANK: Record<RoleName, number> = { user: 0, creator: 1, reviewer: 2, moderator: 3, admin: 4, superadmin: 5 };

declare module "fastify" {
  interface FastifyInstance {
    ctx: AppContext;
  }
  interface FastifyRequest {
    auth?: { userId: string; role: RoleName; sessionId?: string };
  }
}
