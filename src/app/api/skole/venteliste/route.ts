import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Ventelistehåndtering: se køen og tilby plass (tilbud varer 24 t) */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }
  const entries = await db.waitlistEntry.findMany({
    where: { status: { in: ["ACTIVE", "OFFERED"] }, ...(schoolId ? { course: { schoolId } } : {}) },
    include: { course: { select: { title: true, slug: true, capacity: true, unit: true } }, user: { select: { name: true, email: true } }, profile: { select: { name: true } } },
    orderBy: [{ courseId: "asc" }, { position: "asc" }],
  });
  return NextResponse.json({ entries: entries.map((e) => ({ ...e, name: e.profile?.name ?? e.user.name })) });
}

const offerSchema = z.object({ entryId: z.string() });

export async function POST(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = offerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });

  const entry = await db.waitlistEntry.findUnique({ where: { id: parsed.data.entryId }, include: { course: true, user: true } });
  if (!entry || entry.status !== "ACTIVE") return NextResponse.json({ error: "Innslaget er ikke lenger aktivt." }, { status: 409 });
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school || entry.course.schoolId !== school.id) return NextResponse.json({ error: "Du kan bare tilby plass på egne kurs." }, { status: 403 });
  }

  await db.waitlistEntry.update({
    where: { id: entry.id },
    data: { status: "OFFERED", offerExpiresAt: new Date(Date.now() + 24 * 3600_000) },
  });
  await db.notification.create({
    data: {
      userId: entry.userId,
      email: entry.user.email,
      channel: "EMAIL",
      subject: "Du har fått tilbud om plass!",
      body: `En plass har åpnet seg på «${entry.course.title}». Tilbudet gjelder i 24 timer — godta under Mine kurs → Venteliste.`,
    },
  });
  return NextResponse.json({ ok: true, expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString() });
}
