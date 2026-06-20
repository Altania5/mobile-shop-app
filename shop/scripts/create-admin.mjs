// Run once to create your admin account:
//   node scripts/create-admin.mjs
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as readline from "readline/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath   = resolve(__dirname, "../.env");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const name     = await rl.question("Name: ");
const email    = await rl.question("Email: ");
const password = await rl.question("Password (min 8 chars): ");
rl.close();

if (password.length < 8) { console.error("Password too short."); process.exit(1); }

const existing = await prisma.user.findUnique({ where: { email } });
if (existing) { console.error("Email already in use."); process.exit(1); }

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.create({
  data: { name, email, passwordHash, role: "ADMIN" },
});

console.log(`Admin created: ${user.name} (${user.email})`);
await prisma.$disconnect();
