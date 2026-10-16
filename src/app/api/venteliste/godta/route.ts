import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";
import { computeSeats, roleBookingAllowed } from "@/lib/seats";

const schema = z.object({ entryId: z.string() });

/** Godta venteliste-tilbud → konverteres til betalt plass (demo: direkte bekreftet) */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });

  const entry = await db.waitlistEntry.findFirst({
    where: { id: parsed.data.entryId, userId: user.id, status: "OFFERED" },
    include: { course: true },
  });
  if (!entry) return NextResponse.json({ error: "Fant ikke tilbudet (det kan ha utløpt)." }, { status: 404 });
  if (entry.offerExpiresAt && entry.offerExpiresAt.getTime() < Date.now()) {
    await db.waitlistEntry.update({ where: { id: entry.id }, data: { status: "EXPIRED" } });
    return NextResponse.json({ error: "Tilbudet har utløpt (24 t)." }, { status: 410 });
  }

  // re-sjekk rollebalanse og kapasitet
  const grouped = await db.booking.groupBy({
    by: ["role"],
    where: { courseId: entry.courseId, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
    _count: { _all: true },
  });
  let forere = 0, folgere = 0;
  for (const g of grouped) {
    if (g.role === "FORER") forere = g._count._all;
    if (g.role === "FOLGER") folgere = g._count._all;
  }
  const seats = computeSeats(entry.course, forere, folgere);
  if (!roleBookingAllowed(seats, entry.role as "FORER" | "FOLGER")) {
    return NextResponse.json({ error: "Plassen er dessverre tatt. Du står fortsatt på venteliste." }, { status: 409 });
  }

  const count = await db.booking.count({ where: { courseId: entry.courseId, role: entry.role, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } } });
  const booking = await db.$transaction([
    db.booking.create({
      data: {
        code: "TF-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
        userId: user.id,
        profileId: entry.profileId,
        schoolId: entry.course.schoolId,
        courseId: entry.courseId,
        kind: "KURS",
        role: entry.role,
        seatLabel: `${entry.role === "FORER" ? "Fører" : "Følger"} ${count + 1}`,
        amount: entry.course.price,
        paymentMethod: "VIPPS",
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
    }),
    db.waitlistEntry.update({ where: { id: entry.id }, data: { status: "CONVERTED" } }),
    db.notification.create({
      data: { userId: user.id, email: user.email, channel: "EMAIL", subject: "Venteliste-plass bekreftet!", body: `Hurra! Din plass på «${entry.course.title}» er bekreftet. Se bekreftelsen med QR-kode under Mine kurs.` },
    }),
  ]);

  return NextResponse.json({ ok: true, bookingId: booking[0].id, code: booking[0].code });
}
