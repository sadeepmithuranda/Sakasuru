import type { FastifyPluginAsyncZod, ZodTypeProvider } from "fastify-type-provider-zod";
import { and, eq, sql } from "drizzle-orm";
import { gradeQuiz, updateStreak, xpForAttempt, colomboDate, CHALLENGES, BADGES } from "@sakasuru/content";
import { LessonCompleteSchema, z } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import { authenticate } from "../../plugins/auth.js";
import { notFound } from "../../lib/errors.js";
import { awardBadges, getLearningState, getLesson, listCourses } from "./service.js";

export const learningRoutes: FastifyPluginAsyncZod = async (app) => {
  const { db } = app.ctx;

  /* Public educational content (SEO-friendly, no auth). */
  app.get("/courses", { schema: { tags: ["learning"] } }, async () => listCourses(app.ctx));

  app.get("/lessons/:slug", { schema: { tags: ["learning"], params: z.object({ slug: z.string().max(60) }) } }, async (req) => {
    const lesson = await getLesson(app.ctx, req.params.slug);
    if (!lesson) throw notFound("Lesson");
    return lesson;
  });

  app.get("/badges", { schema: { tags: ["learning"] } }, async () => BADGES);
  app.get("/challenges", { schema: { tags: ["learning"] } }, async () => CHALLENGES);

  /* Personal learning state. */
  app.register(async (instance) => {
    const priv = instance.withTypeProvider<ZodTypeProvider>();
    priv.addHook("preHandler", authenticate);

    priv.get("/learning", { schema: { tags: ["learning"] } }, async (req) => getLearningState(app.ctx, req.auth!.userId));

    priv.post("/lessons/:slug/complete", { schema: { tags: ["learning"], params: z.object({ slug: z.string().max(60) }), body: LessonCompleteSchema } }, async (req) => {
      const userId = req.auth!.userId;
      const lesson = await getLesson(app.ctx, req.params.slug);
      if (!lesson) throw notFound("Lesson");
      const graded = gradeQuiz(lesson, req.body.answers);
      const [existing] = await db.select().from(schema.learningProgress).where(and(eq(schema.learningProgress.userId, userId), eq(schema.learningProgress.lessonSlug, lesson.slug)));
      const xp = xpForAttempt(lesson, !existing, graded.correct, graded.total);
      const today = colomboDate(app.ctx.now());
      await db.transaction(async (tx) => {
        await tx.insert(schema.quizAttempts).values({ userId, lessonSlug: lesson.slug, score: graded.correct, total: graded.total, answers: req.body.answers, xpEarned: xp });
        await tx
          .insert(schema.learningProgress)
          .values({ userId, lessonSlug: lesson.slug, bestScore: graded.correct, total: graded.total })
          .onConflictDoUpdate({
            target: [schema.learningProgress.userId, schema.learningProgress.lessonSlug],
            set: { bestScore: sql`greatest(${schema.learningProgress.bestScore}, ${graded.correct})`, total: graded.total },
          });
        await tx.insert(schema.learningStreaks).values({ userId }).onConflictDoNothing();
        const [s] = await tx.select().from(schema.learningStreaks).where(eq(schema.learningStreaks.userId, userId));
        const next = updateStreak({ streak: s!.streak, longestStreak: s!.longestStreak, lastActiveDate: s!.lastActiveDate }, today);
        await tx.update(schema.learningStreaks).set({ ...next, xp: s!.xp + xp }).where(eq(schema.learningStreaks.userId, userId));
      });
      const newBadges = await awardBadges(app.ctx, userId, { perfectQuiz: graded.correct === graded.total });
      // Mark joined challenges that are now complete.
      const learning = await getLearningState(app.ctx, userId);
      for (const c of learning.challenges.filter((c) => c.completed)) {
        await db
          .update(schema.challengeParticipation)
          .set({ completedAt: app.ctx.now() })
          .where(and(eq(schema.challengeParticipation.userId, userId), eq(schema.challengeParticipation.challengeKey, c.key), sql`${schema.challengeParticipation.completedAt} is null`));
      }
      return { correct: graded.correct, total: graded.total, xpEarned: xp, newBadges, results: graded.results, learning };
    });

    priv.post("/challenges/:key/join", { schema: { tags: ["learning"], params: z.object({ key: z.string().max(40) }) } }, async (req) => {
      if (!CHALLENGES.some((c) => c.key === req.params.key)) throw notFound("Challenge");
      await db.insert(schema.challengeParticipation).values({ userId: req.auth!.userId, challengeKey: req.params.key }).onConflictDoNothing();
      return getLearningState(app.ctx, req.auth!.userId);
    });

    /** Self-reported challenges (e.g. reviewing subscriptions) are confirmed by the user. */
    priv.post("/challenges/:key/complete", { schema: { tags: ["learning"], params: z.object({ key: z.string().max(40) }) } }, async (req) => {
      const def = CHALLENGES.find((c) => c.key === req.params.key);
      if (!def || def.metric !== "subscriptionReview") throw notFound("Challenge");
      await db
        .insert(schema.challengeParticipation)
        .values({ userId: req.auth!.userId, challengeKey: def.key, completedAt: app.ctx.now() })
        .onConflictDoUpdate({ target: [schema.challengeParticipation.userId, schema.challengeParticipation.challengeKey], set: { completedAt: app.ctx.now() } });
      return getLearningState(app.ctx, req.auth!.userId);
    });
  });
};
