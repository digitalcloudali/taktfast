import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const schema = z.object({
  courseId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Skriv minst 10 tegn").max(1000),
});

/** Legg igjen anmeldelse etter kurs (krever innlogging; modereres av admin) */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const rl = rateLimit(clientKey(req, `review:${user.id}`), 5, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange anmeldelser på kort tid." }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });

  const course = await db.course.findUnique({ where: { id: parsed.data.courseId }, include: { school: true } });
  if (!course) return NextResponse.json({ error: "Kurset ble ikke funnet." }, { status: 404 });

  const hasBooking = await db.booking.findFirst({ where: { userId: user.id, courseId: course.id, status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_IN"] } } });
  if (!hasBooking) return NextResponse.json({ error: "Du kan bare anmelde kurs du er eller har vært påmeldt." }, { status: 403 });

  const review = await db.review.create({
    data: {
      schoolId: course.schoolId,
      courseId: course.id,
      userId: user.id,
      authorName: user.name,
      rating: parsed.data.rating,
      text: parsed.data.text,
      status: "APPROVED", // demo: godkjennes umiddelbart (admin kan avvise)
    },
  });
  // oppdater snitt
  const agg = await db.review.aggregate({ where: { courseId: course.id, status: "APPROVED" }, _avg: { rating: true }, _count: true });
  await db.course.update({ where: { id: course.id }, data: { ratingAvg: Math.round((agg._avg.rating ?? 5) * 10) / 10, ratingCount: agg._count } });
  const aggSchool = await db.review.aggregate({ where: { schoolId: course.schoolId, status: "APPROVED" }, _avg: { rating: true }, _count: true });
  await db.school.update({ where: { id: course.schoolId }, data: { ratingAvg: Math.round((aggSchool._avg.rating ?? 5) * 10) / 10, ratingCount: aggSchool._count } });

  return NextResponse.json({ ok: true, reviewId: review.id });
}
