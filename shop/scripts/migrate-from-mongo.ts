/**
 * One-off data migration: MongoDB (old Express app) -> PostgreSQL (Prisma).
 *
 * Run once before cutover. Idempotent: re-running skips rows already migrated
 * (matched by natural keys), so it is safe to run multiple times.
 *
 *   ATLAS_URI=<mongo connection string> \
 *   DATABASE_URL=<postgres connection string> \
 *   node --experimental-strip-types scripts/migrate-from-mongo.ts
 *
 * Migrates: portal Users -> Customer (bcrypt hashes carried over so customers
 * keep their passwords), Posts + Comments, Testimonials, BookingRequests,
 * ServiceHelpForms -> QuoteRequest.
 *
 * Intentionally NOT migrated (superseded by the shop app): services catalog,
 * time slots, old Bookings, old Mongo work orders.
 */
import { MongoClient } from "mongodb";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const TIME_SLOT: Record<string, "MORNING" | "AFTERNOON" | "EVENING"> = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
};

const BR_STATUS: Record<string, "NEW" | "CONTACTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "CONVERTED" | "DECLINED"> = {
  new: "NEW", contacted: "CONTACTED", scheduled: "SCHEDULED", completed: "COMPLETED",
  cancelled: "CANCELLED", converted: "CONVERTED", declined: "DECLINED",
};

const QUOTE_STATUS: Record<string, "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"> = {
  pending: "PENDING", in_progress: "IN_PROGRESS", completed: "COMPLETED", cancelled: "CANCELLED",
};

function fullName(first?: string, last?: string, fallback = "Customer") {
  return [first, last].filter(Boolean).join(" ").trim() || fallback;
}

async function main() {
  const atlas = process.env.ATLAS_URI;
  if (!atlas) throw new Error("ATLAS_URI (source Mongo) is required.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL (target Postgres) is required.");

  const mongo = new MongoClient(atlas);
  await mongo.connect();
  const db = mongo.db();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

  const counts = { customers: 0, posts: 0, comments: 0, testimonials: 0, bookingRequests: 0, quoteRequests: 0, skipped: 0 };

  // Lookup maps from Mongo.
  const mongoUsers = await db.collection("users").find().toArray();
  const userById = new Map(mongoUsers.map((u) => [String(u._id), u]));
  const mongoServices = await db.collection("services").find().toArray();
  const serviceById = new Map(mongoServices.map((s) => [String(s._id), s]));

  // ── 1. Portal users -> Customer (carry bcrypt password hashes) ──
  for (const u of mongoUsers) {
    if (u.role === "admin") continue; // staff live in the Prisma User table
    const email = (u.email ?? "").toLowerCase().trim();
    if (!email) { counts.skipped++; continue; }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      // Backfill a portal password onto a shop-created customer that lacks one.
      if (!existing.passwordHash && u.password) {
        await prisma.customer.update({ where: { id: existing.id }, data: { passwordHash: u.password, emailVerified: !!u.isEmailVerified } });
      }
      continue;
    }

    await prisma.customer.create({
      data: {
        firstName: u.firstName ?? "Customer",
        lastName: u.lastName ?? "",
        email,
        phone: u.phone ?? "",
        passwordHash: u.password ?? null,
        emailVerified: !!u.isEmailVerified,
        squareId: u.squareCustomerId ?? null,
        createdAt: u.createdAt ?? undefined,
      },
    });
    counts.customers++;
  }

  // Pick a default author for migrated blog posts (first ADMIN, else first staff user).
  const author =
    (await prisma.user.findFirst({ where: { role: "ADMIN" } })) ?? (await prisma.user.findFirst());

  // ── 2. Posts + 3. Comments ──
  if (author) {
    const mongoPosts = await db.collection("posts").find().toArray();
    const newPostIdBySlug = new Map<string, string>();

    for (const p of mongoPosts) {
      const slug = p.slug ?? String(p._id);
      let post = await prisma.post.findUnique({ where: { slug } });
      if (!post) {
        post = await prisma.post.create({
          data: {
            title: p.title ?? "Untitled",
            slug,
            content: p.content ?? "",
            summary: p.summary ?? null,
            heroImage: p.heroImage ?? null,
            allowComments: p.allowComments ?? true,
            publishedAt: p.createdAt ?? new Date(), // old posts were all live
            authorId: author.id,
            createdAt: p.createdAt ?? undefined,
          },
        });
        counts.posts++;
      }
      newPostIdBySlug.set(String(p._id), post.id);
    }

    const mongoComments = await db.collection("comments").find().toArray();
    for (const c of mongoComments) {
      const newPostId = newPostIdBySlug.get(String(c.post));
      if (!newPostId) { counts.skipped++; continue; }
      const authorUser = userById.get(String(c.author));
      const authorName = fullName(authorUser?.firstName, authorUser?.lastName, "Anonymous");
      const text = c.text ?? "";
      if (!text) { counts.skipped++; continue; }

      const dupe = await prisma.comment.findFirst({ where: { postId: newPostId, authorName, text } });
      if (dupe) continue;

      await prisma.comment.create({
        data: { postId: newPostId, authorName, text, createdAt: c.createdAt ?? undefined },
      });
      counts.comments++;
    }
  } else {
    console.warn("No staff User found — skipping blog posts/comments (need an author).");
  }

  // ── 4. Testimonials ──
  const mongoTestimonials = await db.collection("testimonials").find().toArray();
  for (const t of mongoTestimonials) {
    const authorUser = userById.get(String(t.author));
    const authorName = t.authorName ?? fullName(authorUser?.firstName, authorUser?.lastName, "Anonymous");
    const quote = t.quote ?? "";
    if (!quote) { counts.skipped++; continue; }

    const dupe = await prisma.testimonial.findFirst({ where: { authorName, quote } });
    if (dupe) continue;

    const service = serviceById.get(String(t.service));
    await prisma.testimonial.create({
      data: {
        quote,
        rating: typeof t.rating === "number" ? Math.min(5, Math.max(1, t.rating)) : 5,
        authorName,
        serviceLabel: service?.name ?? null,
        profileImageUrl: t.profileImageUrl ?? null,
        status: "PUBLISHED", // existing testimonials were already live
        createdAt: t.createdAt ?? undefined,
      },
    });
    counts.testimonials++;
  }

  // ── 5. Booking requests ──
  const mongoBookingRequests = await db.collection("bookingrequests").find().toArray();
  for (const b of mongoBookingRequests) {
    const email = (b.email ?? "").toLowerCase().trim();
    if (!email || !b.preferredDate) { counts.skipped++; continue; }

    const dupe = await prisma.bookingRequest.findFirst({
      where: { email, service: b.service ?? "", createdAt: b.createdAt ?? undefined },
    });
    if (dupe) continue;

    const customer = await prisma.customer.findUnique({ where: { email } });
    await prisma.bookingRequest.create({
      data: {
        name: b.name ?? "Customer",
        email,
        phone: b.phone ?? "",
        vehicleYear: Number(b.vehicleYear) || 0,
        vehicleMake: b.vehicleMake ?? "",
        vehicleModel: b.vehicleModel ?? "",
        service: b.service ?? "",
        serviceOther: b.serviceOther ?? null,
        preferredDate: b.preferredDate,
        preferredTimeSlot: TIME_SLOT[b.preferredTimeSlot] ?? "MORNING",
        serviceAddress: b.serviceAddress ?? "",
        source: b.source ?? "contact",
        status: BR_STATUS[b.status] ?? "NEW",
        customerId: customer?.id ?? null,
        createdAt: b.createdAt ?? undefined,
      },
    });
    counts.bookingRequests++;
  }

  // ── 6. Service help forms -> Quote requests ──
  const mongoHelp = await db.collection("servicehelpforms").find().toArray();
  for (const h of mongoHelp) {
    const email = (h.email ?? "").trim();
    if (!email) { counts.skipped++; continue; }

    const dupe = await prisma.quoteRequest.findFirst({
      where: { email, generalIssue: h.generalIssue ?? "", createdAt: h.createdAt ?? undefined },
    });
    if (dupe) continue;

    await prisma.quoteRequest.create({
      data: {
        name: h.name ?? "Customer",
        email,
        phone: h.phone ?? null,
        generalIssue: h.generalIssue ?? "",
        detailedDescription: h.detailedDescription ?? "",
        carMake: h.carMake ?? "",
        carModel: h.carModel ?? "",
        carTrim: h.carTrim ?? null,
        vin: h.vin ?? "",
        status: QUOTE_STATUS[h.status] ?? "PENDING",
        createdAt: h.createdAt ?? undefined,
      },
    });
    counts.quoteRequests++;
  }

  await mongo.close();
  await prisma.$disconnect();

  console.log("Migration complete:", counts);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
