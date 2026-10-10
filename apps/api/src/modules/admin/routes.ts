import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { colomboDate } from "@sakasuru/content";
import { LessonUpsertSchema, ContentStatusChangeSchema, RoleChangeSchema, z, type AdminLessonDTO, type AdminStatsDTO } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { requireRole } from "../../plugins/auth.js";
import { ROLE_RANK, type RoleName } from "../../lib/context.js";
import { badRequest, forbidden, notFound } from "../../lib/errors.js";
import { audit } from "../../lib/audit.js";
import { getLesson } from "../learning/service.js";

/** Minimum role for each content-status transition. */
const TRANSITIONS: Record<string, { from: string[]; min: RoleName }> = {
  review: { from: ["draft"], min: "creator" },
  approved: { from: ["review"], min: "reviewer" },
  published: { from: ["approved", "archived"], min: "admin" },
  archived: { from: ["draft", "review", "approved", "published"], min: "admin" },
  draft: { from: ["review", "approved", "archived"], min: "creator" },
};

export const adminRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db } = app.ctx;

  /* ---------- aggregated analytics (never individual financial records) ---------- */
  app.get("/stats", { preHandler: requireRole("moderator"), schema: { tags: ["admin"] } }, async (): Promise<AdminStatsDTO> => {
    const since = new Date(app.ctx.now().getTime() - 30 * 86_400_000);
    const [users, active, lessons, quiz, budgets, goals, langs, hardest, topics, signups] = await Promise.all([
      db.select({ c: sql<number>`count(*)::int` }).from(schema.users),
      db.select({ c: sql<number>`count(distinct ${schema.sessions.userId})::int` }).from(schema.sessions).where(gte(schema.sessions.lastUsedAt, since)),
      db.select({ c: sql<number>`count(*)::int` }).from(schema.learningProgress),
      db.select({ s: sql<number>`coalesce(sum(${schema.quizAttempts.score}),0)::int`, t: sql<number>`coalesce(sum(${schema.quizAttempts.total}),0)::int` }).from(schema.quizAttempts),
      db.select({ c: sql<number>`count(*)::int` }).from(schema.budgets),
      db.select({ c: sql<number>`count(*)::int` }).from(schema.financialGoals),
      db.select({ lang: schema.userProfiles.language, count: sql<number>`count(*)::int` }).from(schema.userProfiles).groupBy(schema.userProfiles.language),
      db
        .select({ slug: schema.quizAttempts.lessonSlug, avg: sql<number>`round(avg(${schema.quizAttempts.score}::numeric / nullif(${schema.quizAttempts.total},0)) * 100)::int`, attempts: sql<number>`count(*)::int` })
        .from(schema.quizAttempts)
        .groupBy(schema.quizAttempts.lessonSlug)
        .having(sql`count(*) >= 3`)
        .orderBy(sql`2 asc`)
        .limit(5),
      db.select().from(schema.aiTopicStats).orderBy(desc(schema.aiTopicStats.count)).limit(8),
      db
        .select({ day: sql<string>`to_char(${schema.users.createdAt} at time zone 'Asia/Colombo', 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
        .from(schema.users)
        .where(gte(schema.users.createdAt, since))
        .groupBy(sql`1`)
        .orderBy(sql`1`),
    ]);
    return {
      users: users[0]?.c ?? 0,
      activeUsers30d: active[0]?.c ?? 0,
      lessonsCompleted: lessons[0]?.c ?? 0,
      quizSuccessRate: quiz[0]?.t ? Math.round((quiz[0].s / quiz[0].t) * 100) : 0,
      budgets: budgets[0]?.c ?? 0,
      goals: goals[0]?.c ?? 0,
      languages: langs.map((l) => ({ lang: l.lang as "si" | "ta" | "en", count: l.count })),
      hardestLessons: hardest.map((h) => ({ slug: h.slug, avgScore: h.avg, attempts: h.attempts })),
      topAiTopics: topics.map((t) => ({ topic: t.topic, count: t.count })),
      signupsByDay: signups,
    };
  });

  /* ---------- users & roles ---------- */
  app.get("/users", { preHandler: requireRole("admin"), schema: { tags: ["admin"], querystring: z.object({ q: z.string().max(100).optional() }) } }, async (req) => {
    const rows = await db
      .select({ id: schema.users.id, email: schema.users.email, role: schema.users.role, createdAt: schema.users.createdAt, lastLoginAt: schema.users.lastLoginAt, name: schema.userProfiles.name, language: schema.userProfiles.language })
      .from(schema.users)
      .leftJoin(schema.userProfiles, eq(schema.userProfiles.userId, schema.users.id))
      .where(req.query.q ? sql`${schema.users.email} ilike ${"%" + req.query.q + "%"}` : sql`true`)
      .orderBy(desc(schema.users.createdAt))
      .limit(100);
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), lastLoginAt: r.lastLoginAt?.toISOString() ?? null }));
  });

  app.patch("/users/:id/role", { preHandler: requireRole("admin"), schema: { tags: ["admin"], params: z.object({ id: z.string().uuid() }), body: RoleChangeSchema } }, async (req) => {
    const actor = req.auth!.role;
    const [target] = await db.select().from(schema.users).where(eq(schema.users.id, req.params.id));
    if (!target) throw notFound("User");
    // Admins may manage roles below their own; only super admins can grant admin roles.
    if (ROLE_RANK[req.body.role] >= ROLE_RANK[actor] || ROLE_RANK[target.role as RoleName] >= ROLE_RANK[actor]) throw forbidden();
    await db.update(schema.users).set({ role: req.body.role }).where(eq(schema.users.id, target.id));
    await audit(db, req, "admin.role_changed", target.id, { from: target.role, to: req.body.role });
    return { ok: true as const };
  });

  /* ---------- content management (CMS) ---------- */
  app.get("/lessons", { preHandler: requireRole("creator"), schema: { tags: ["admin"] } }, async (): Promise<AdminLessonDTO[]> => {
    const rows = await db
      .select({ l: schema.lessons, author: sql<string | null>`(select email from users where id = ${schema.lessons.authorId})`, reviewer: sql<string | null>`(select email from users where id = ${schema.lessons.reviewerId})` })
      .from(schema.lessons)
      .orderBy(schema.lessons.courseSlug, schema.lessons.sort);
    return rows.map(({ l, author, reviewer }) => {
      const d = l.data as { title: AdminLessonDTO["title"]; timeSensitive?: boolean };
      return { slug: l.slug, courseSlug: l.courseSlug, title: d.title, status: l.status as AdminLessonDTO["status"], author, reviewer, lastReviewed: l.lastReviewed, nextReview: l.nextReview, timeSensitive: !!d.timeSensitive, updatedAt: l.updatedAt.toISOString() };
    });
  });

  app.get("/lessons/:slug", { preHandler: requireRole("creator"), schema: { tags: ["admin"], params: z.object({ slug: z.string().max(60) }) } }, async (req) => {
    const lesson = await getLesson(app.ctx, req.params.slug, { includeUnpublished: true });
    if (!lesson) throw notFound("Lesson");
    return lesson;
  });

  app.put("/lessons/:slug", { preHandler: requireRole("creator"), schema: { tags: ["admin"], params: z.object({ slug: z.string().max(60) }), body: LessonUpsertSchema } }, async (req) => {
    const b = req.body;
    if (b.slug !== req.params.slug) throw badRequest("slug_mismatch");
    for (const q of b.quiz) if (!q.options.some((o) => o.id === q.correctId)) throw badRequest("invalid_quiz", `Question ${q.id} has no matching correct option`);
    const [course] = await db.select().from(schema.courses).where(eq(schema.courses.slug, b.courseSlug));
    if (!course) throw badRequest("unknown_course");
    const [existing] = await db.select().from(schema.lessons).where(eq(schema.lessons.slug, b.slug));
    const { slug, courseSlug, nextReview, ...data } = b;
    const isAdmin = ROLE_RANK[req.auth!.role] >= ROLE_RANK.admin;
    const today = colomboDate(app.ctx.now());
    const defaultNext = new Date(app.ctx.now().getTime() + (b.timeSensitive ? 90 : 180) * 86_400_000).toISOString().slice(0, 10);
    if (existing) {
      await db
        .update(schema.lessons)
        .set({ courseSlug, data, status: isAdmin ? existing.status : "draft", nextReview: nextReview ?? existing.nextReview, updatedAt: new Date() })
        .where(eq(schema.lessons.slug, slug));
    } else {
      const [{ max } = { max: 0 }] = await db.select({ max: sql<number>`coalesce(max(${schema.lessons.sort}),0)::int` }).from(schema.lessons).where(eq(schema.lessons.courseSlug, courseSlug));
      await db.insert(schema.lessons).values({ slug, courseSlug, sort: max + 1, data, status: "draft", authorId: req.auth!.userId, lastReviewed: today, nextReview: nextReview ?? defaultNext });
    }
    await audit(db, req, existing ? "cms.lesson_updated" : "cms.lesson_created", slug);
    return getLesson(app.ctx, slug, { includeUnpublished: true });
  });

  app.post("/lessons/:slug/status", { preHandler: requireRole("creator"), schema: { tags: ["admin"], params: z.object({ slug: z.string().max(60) }), body: ContentStatusChangeSchema } }, async (req) => {
    const [lesson] = await db.select().from(schema.lessons).where(eq(schema.lessons.slug, req.params.slug));
    if (!lesson) throw notFound("Lesson");
    const rule = TRANSITIONS[req.body.status];
    if (!rule || !rule.from.includes(lesson.status)) throw badRequest("invalid_transition", `Cannot move from ${lesson.status} to ${req.body.status}`);
    if (ROLE_RANK[req.auth!.role] < ROLE_RANK[rule.min]) throw forbidden();
    const set: Partial<typeof schema.lessons.$inferInsert> = { status: req.body.status, updatedAt: new Date() };
    if (req.body.status === "approved") {
      set.reviewerId = req.auth!.userId;
      set.lastReviewed = colomboDate(app.ctx.now());
    }
    await db.update(schema.lessons).set(set).where(eq(schema.lessons.slug, lesson.slug));
    await audit(db, req, "cms.status_changed", lesson.slug, { from: lesson.status, to: req.body.status });
    return { ok: true as const, status: req.body.status };
  });

  /* ---------- scam alerts ---------- */
  const L = z.object({ en: z.string().max(2000), si: z.string().max(2000), ta: z.string().max(2000) });
  app.post("/scam-alerts", { preHandler: requireRole("moderator"), schema: { tags: ["admin"], body: z.object({ title: L, body: L, publish: z.boolean().default(false) }) } }, async (req) => {
    const [row] = await db.insert(schema.scamAlerts).values({ title: req.body.title, body: req.body.body, status: req.body.publish ? "published" : "draft", createdBy: req.auth!.userId }).returning();
    await audit(db, req, "scam_alert.created", row!.id);
    return row;
  });

  /* ---------- audit log ---------- */
  app.get("/audit-logs", { preHandler: requireRole("admin"), schema: { tags: ["admin"] } }, async () => {
    const rows = await db
      .select({ id: schema.auditLogs.id, action: schema.auditLogs.action, target: schema.auditLogs.target, ip: schema.auditLogs.ip, createdAt: schema.auditLogs.createdAt, actor: schema.users.email })
      .from(schema.auditLogs)
      .leftJoin(schema.users, eq(schema.users.id, schema.auditLogs.actorId))
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(200);
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  });

  /* ---------- content due for review (time-sensitive information) ---------- */
  app.get("/review-due", { preHandler: requireRole("reviewer"), schema: { tags: ["admin"] } }, async () =>
    db
      .select({ slug: schema.lessons.slug, nextReview: schema.lessons.nextReview, status: schema.lessons.status })
      .from(schema.lessons)
      .where(and(sql`${schema.lessons.nextReview} <= (current_date + interval '30 days')`))
      .orderBy(schema.lessons.nextReview),
  );
};
