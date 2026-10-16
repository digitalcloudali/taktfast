import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

const schema = z.object({ bookingId: z.string().min(4) });

/**
 * Avbestillingsregler:
 * - Kursrekke: gratis inntil 48 t før første gang; 50 % inntil andre gang; deretter ingen refusjon
 * - Drop-in: ingen refusjon under 12 t før
 * - Privattime: gratis inntil 48 t før (håndheves av skolen i praksis)
 * - Dansekveld: gratis inntil 48 t før
 */
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });

  const booking = await db.booking.findFirst({
    where: { id: parsed.data.bookingId, userId: user.id },
    include: { course: { include: { dates: { orderBy: { date: "asc" } } } }, night: true, profile: true },
  });
  if (!booking) return NextResponse.json({ error: "Bestillingen ble ikke funnet." }, { status: 404 });
  if (booking.status === "CANCELLED") return NextResponse.json({ error: "Bestillingen er allerede avbestilt." }, { status: 409 });

  const now = Date.now();
  let refundPct = 0;
  let reason = "";

  if (booking.kind === "KURS" && booking.course) {
    const first = booking.course.dates[0]?.date?.getTime();
    const second = booking.course.dates[1]?.date?.getTime();
    if (first && now < first - 48 * 3600_000) {
      refundPct = 100; reason = "Kansellering mer enn 48 timer før første gang — full refusjon.";
    } else if (second && now < second - 3600_000) {
      refundPct = 50; reason = "Kansellering etter første gang, men før andre gang — 50 % refusjon.";
    } else {
      refundPct = 0; reason = "Kansellering etter andre gang — dessverre ingen refusjon.";
    }
  } else if (booking.kind === "DROPIN") {
    const cd = booking.dateId ? await db.courseDate.findUnique({ where: { id: booking.dateId } }) : null;
    if (cd && now < cd.date.getTime() - 12 * 3600_000) { refundPct = 100; reason = "Kansellering mer enn 12 timer før — full refusjon."; }
    else { refundPct = 0; reason = "Under 12 timer til timen — dessverre ingen refusjon på drop-in."; }
  } else if (booking.kind === "PRIVATTIME") {
    refundPct = 100; reason = "Privattime avbestilt — full refusjon.";
  } else {
    const target = booking.night?.date?.getTime();
    if (target && now < target - 48 * 3600_000) { refundPct = 100; reason = "Kansellering mer enn 48 timer før — full refusjon."; }
    else { refundPct = 100; reason = "Avbestilt — refusjon behandles av skolen."; }
  }

  const refund = Math.round((booking.amount * refundPct) / 100);
  const klippBack = booking.klippUsed > 0 ? booking.klippUsed : 0;

  await db.$transaction([
    db.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        paymentStatus: refundPct === 100 ? "REFUNDED" : refundPct === 50 ? "PARTIALLY_REFUNDED" : booking.paymentStatus,
        cancelReason: reason,
      },
    }),
    ...(refund > 0
      ? [db.payment.create({
          data: { bookingCode: booking.code, method: "REFUND", amount: -refund, status: "REFUNDED", reference: `refund-${Date.now()}` },
        })]
      : []),
    ...(klippBack > 0 && booking.klippekortId
      ? [db.klippekort.update({ where: { id: booking.klippekortId }, data: { used: { decrement: klippBack } } })]
      : []),
    db.notification.create({
      data: {
        userId: user.id,
        email: user.email,
        channel: "EMAIL",
        subject: `Avbestilling bekreftet`,
        body: `${reason} Refusjon: ${refund} kr.`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, refund, refundPct, reason });
}
