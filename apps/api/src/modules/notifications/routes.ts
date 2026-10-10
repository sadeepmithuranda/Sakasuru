import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { authenticate } from "../../plugins/auth.js";
import { generateNotifications, listNotifications } from "./service.js";

export const notificationRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db } = app.ctx;
  app.addHook("preHandler", authenticate);

  app.get("/", { schema: { tags: ["notifications"] } }, async (req) => {
    await generateNotifications(app.ctx, req.auth!.userId);
    return listNotifications(app.ctx, req.auth!.userId);
  });

  app.post("/:id/read", { schema: { tags: ["notifications"], params: z.object({ id: z.string().uuid() }) } }, async (req) => {
    await db.update(schema.notifications).set({ readAt: app.ctx.now() }).where(and(eq(schema.notifications.id, req.params.id), eq(schema.notifications.userId, req.auth!.userId)));
    return { ok: true as const };
  });

  app.post("/read-all", { schema: { tags: ["notifications"] } }, async (req) => {
    await db.update(schema.notifications).set({ readAt: app.ctx.now() }).where(and(eq(schema.notifications.userId, req.auth!.userId), isNull(schema.notifications.readAt)));
    return { ok: true as const };
  });
};
