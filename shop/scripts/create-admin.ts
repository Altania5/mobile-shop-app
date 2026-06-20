/**
 * Create (or update) a staff ADMIN user. Used to seed the first admin on a
 * fresh database so you can log into the shop admin.
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_NAME="Your Name" ADMIN_PASSWORD="secret" \
 *   DATABASE_URL=<postgres> node --experimental-strip-types scripts/create-admin.ts
 *
 * Re-running with the same email updates that user's name/password.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME ?? "").trim();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !name || !password) {
    throw new Error("ADMIN_EMAIL, ADMIN_NAME and ADMIN_PASSWORD are all required.");
  }
  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN", active: true },
    create: { email, name, passwordHash, role: "ADMIN", active: true },
  });

  await prisma.$disconnect();
  console.log(`Admin ready: ${user.email} (${user.role})`);
}

main().catch((err) => {
  console.error("create-admin failed:", err);
  process.exit(1);
});
