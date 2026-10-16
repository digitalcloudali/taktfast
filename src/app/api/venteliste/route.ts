import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

const joinSchema = z.object({
  courseId: z.string(),
  profileId: z.string(),
  role: z.enum(["FORER", "FOLGER"]),
});

/** Bli med på venteliste (kurs fullt eller rollen full) */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const rl = rateLimit(clientKey(req, `waitlist:${user.id}`), 20, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "For mange forsøk — vent litt." }, { status: 429 });
  const parsed = joinSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });

  const course = await db.course.findUnique({ where: { id: parsed.data.courseId }, include: { school: true } });
  if (!course) return NextResponse.json({ error: "Kurset finnes ikke." }, { status: 404 });

  const profile = await db.deltakerProfile.findFirst({ where: { id: parsed.data.profileId, userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Ugyldig deltakerprofil." }, { status: 400 });

  const already = await db.waitlistEntry.findFirst({
    where: { courseId: course.id, userId: user.id, profileId: profile.id, status: { in: ["ACTIVE", "OFFERED"] } },
  });
  if (already) return NextResponse.json({ error: "Du står allerede på ventelisten for dette kurset." }, { status: 409 });

  const count = await db.waitlistEntry.count({ where: { courseId: course.id, status: { in: ["ACTIVE", "OFFERED"] } } });
  const entry = await db.waitlistEntry.create({
    data: { courseId: course.id, userId: user.id, profileId: profile.id, role: parsed.data.role, position: count + 1, status: "ACTIVE" },
  });
  await db.notification.create({
    data: { userId: user.id, email: user.email, channel: "EMAIL", subject: "Du står på venteliste", body: `Vi varsler deg hvis en plass åpner seg på «${course.title}» hos ${course.school.name}. Tilbudet gjelder i 24 timer.` },
  });
  return NextResponse.json({ ok: true, entryId: entry.id, position: entry.position });
}

/** Mine venteliste-innslag */
export async function GET() {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const entries = await db.waitlistEntry.findMany({
    where: { userId: user.id, status: { in: ["ACTIVE", "OFFERED"] } },
    include: { course: { include: { school: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ entries });
}

/** Trekk seg fra venteliste */
export async function DELETE(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const { entryId } = (await req.json().catch(() => null)) as { entryId?: string };
  if (!entryId) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  await db.waitlistEntry.updateMany({ where: { id: entryId, userId: user.id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
