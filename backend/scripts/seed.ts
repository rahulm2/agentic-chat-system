/**
 * Seed script — runs after migrations, before the server starts.
 * Creates the default test account if it does not already exist.
 * Safe to run multiple times (idempotent).
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const SEED_EMAIL = "test@example.com";
const SEED_PASSWORD = "password123";

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({ where: { email: SEED_EMAIL } });
    if (existing) {
      console.log(`[seed] User ${SEED_EMAIL} already exists — skipping`);
      return;
    }

    const passwordHash = await Bun.password.hash(SEED_PASSWORD);
    await prisma.user.create({ data: { email: SEED_EMAIL, passwordHash } });
    console.log(`[seed] Created test user ${SEED_EMAIL}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
