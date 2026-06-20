// Standalone script -- runs directly against the database, no dev server needed.
// Schedule via Windows Task Scheduler to run daily.
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const result = await prisma.invoice.updateMany({
  where: {
    status: { in: ["SENT", "PARTIAL"] },
    dueDate: { lt: new Date() },
  },
  data: { status: "OVERDUE" },
});

const timestamp = new Date().toLocaleString("en-US");
console.log(`${timestamp} - marked ${result.count} invoice(s) overdue`);

await prisma.$disconnect();
