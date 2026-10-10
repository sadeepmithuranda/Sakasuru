import { fileURLToPath } from "node:url";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { COURSES } from "@sakasuru/content";
import { createDb, schema, type DB } from "./client.js";

/**
 * Seeds courses and lessons from the reviewed content package.
 * Existing lessons are NOT overwritten (so CMS edits survive restarts);
 * only missing ones are inserted as published.
 */
export async function seedContent(db: DB) {
  for (const course of COURSES) {
    await db
      .insert(schema.courses)
      .values({ slug: course.slug, level: course.level, icon: course.icon, color: course.color, title: course.title, description: course.description, prerequisites: course.prerequisites ?? [] })
      .onConflictDoUpdate({ target: schema.courses.slug, set: { level: course.level, icon: course.icon, color: course.color, title: course.title, description: course.description, prerequisites: course.prerequisites ?? [] } });
    let sort = 0;
    for (const lesson of course.lessons) {
      const { slug, lastReviewed, nextReview, ...data } = lesson;
      await db.insert(schema.lessons).values({ slug, courseSlug: course.slug, sort: sort++, data, status: "published", lastReviewed, nextReview }).onConflictDoNothing();
    }
  }
}

/** Optional: create the first super administrator from environment variables. */
export async function seedAdmin(db: DB, email: string, password: string) {
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
  if (existing) {
    await db.update(schema.users).set({ role: "superadmin" }).where(eq(schema.users.id, existing.id));
    return existing.id;
  }
  const passwordHash = await hash(password, { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const [u] = await db.insert(schema.users).values({ email: email.toLowerCase(), passwordHash, role: "superadmin" }).returning();
  await db.insert(schema.userProfiles).values({ userId: u!.id, name: "Admin", language: "en", onboardingCompleted: true });
  await db.insert(schema.userPreferences).values({ userId: u!.id, data: {} });
  await db.insert(schema.learningStreaks).values({ userId: u!.id });
  await db.insert(schema.consents).values({ userId: u!.id, type: "terms", granted: true });
  return u!.id;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const { db, pool } = createDb(url, process.env.DATABASE_SSL === "true");
  (async () => {
    await seedContent(db);
    const count = await db.select({ c: sql<number>`count(*)::int` }).from(schema.lessons);
    console.log(`✔ content seeded (${count[0]?.c} lessons)`);
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      await seedAdmin(db, process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
      console.log(`✔ super administrator ready: ${process.env.ADMIN_EMAIL}`);
    }
    await pool.end();
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
