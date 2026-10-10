import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { desc, eq } from "drizzle-orm";
import { checkScamMessage } from "@sakasuru/financial-engine";
import { SCAM_EXAMPLES } from "@sakasuru/content";
import { ScamCheckSchema } from "@sakasuru/validation";
import { schema } from "../../db/client.js";

export const scamRoutes: FastifyPluginAsyncZod = async (app) => {
  /** Message text is analysed in memory and never stored or logged. */
  app.post("/check", { config: { rateLimit: { max: 30, timeWindow: "1 minute" } }, schema: { tags: ["scam"], body: ScamCheckSchema } }, async (req) => checkScamMessage(req.body.text));

  app.get("/examples", { schema: { tags: ["scam"] } }, async () => SCAM_EXAMPLES);

  app.get("/alerts", { schema: { tags: ["scam"] } }, async () =>
    app.ctx.db.select({ id: schema.scamAlerts.id, title: schema.scamAlerts.title, body: schema.scamAlerts.body, createdAt: schema.scamAlerts.createdAt }).from(schema.scamAlerts).where(eq(schema.scamAlerts.status, "published")).orderBy(desc(schema.scamAlerts.createdAt)).limit(20),
  );
};
