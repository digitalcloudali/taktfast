import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Moderering av anmeldelser */
export async function GET(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const status = req.nextUrl.searchParams.get("status") ?? "PENDING";
  const reviews = await db.review.findMany({
    where: status === "ALLE" ? {} : { status },
    include: { school: { select: { name: true } }, course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ reviews });
}

const patchSchema = z.object({ reviewId: z.string(), status: z.enum(["APPROVED", "REJECTED", "PENDING"]) });

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { reviewId, status } = parsed.data;
  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return NextResponse.json({ error: "Fant ikke anmeldelsen." }, { status: 404 });
  await db.review.update({ where: { id: reviewId }, data: { status } });
  // re-aggreger rating
  const agg = await db.review.aggregate({ where: { schoolId: review.schoolId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
  await db.school.update({ where: { id: review.schoolId }, data: { ratingAvg: Math.round((agg._avg.rating ?? 0) * 10) / 10, ratingCount: agg._count } });
  if (review.courseId) {
    const aggC = await db.review.aggregate({ where: { courseId: review.courseId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
    await db.course.update({ where: { id: review.courseId }, data: { ratingAvg: Math.round((aggC._avg.rating ?? 0) * 10) / 10, ratingCount: aggC._count } });
  }
  return NextResponse.json({ ok: true });
}
