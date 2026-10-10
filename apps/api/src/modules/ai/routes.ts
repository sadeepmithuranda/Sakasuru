import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { AskSchema } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { authenticate, verifyAccessToken } from "../../plugins/auth.js";
import { answerQuestion, getHistory } from "./service.js";

export const aiRoutes: FastifyPluginAsyncZod = async (app) => {
  /** Works for guests (knowledge answers only) and signed-in users (personal insights with consent). */
  app.post("/ask", { config: { rateLimit: { max: 20, timeWindow: "1 minute" } }, schema: { tags: ["ai"], body: AskSchema } }, async (req) => {
    let userId: string | null = null;
    const h = req.headers.authorization;
    if (h?.startsWith("Bearer ")) {
      try {
        userId = (await verifyAccessToken(app.ctx.config, h.slice(7))).userId;
      } catch {
        userId = null;
      }
    }
    return answerQuestion(app.ctx, userId, req.body);
  });

  app.get("/history", { preHandler: authenticate, schema: { tags: ["ai"] } }, async (req) => getHistory(app.ctx, req.auth!.userId));

  app.delete("/history", { preHandler: authenticate, schema: { tags: ["ai"] } }, async (req) => {
    await app.ctx.db.delete(schema.aiConversations).where(eq(schema.aiConversations.userId, req.auth!.userId));
    return { ok: true as const };
  });
};
