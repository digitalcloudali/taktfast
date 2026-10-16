import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

const schema = z.object({
  bookingId: z.string().optional(),
  code: z.string().optional(), // QR-kode (gruppekode)
});

/** Innsjekk med QR/oppmøteliste (skole) */
export async function POST(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldig forespørsel" }, { status: 400 });
  const { bookingId, code } = parsed.data;
  if (!bookingId && !code) return NextResponse.json({ error: "Oppgi booking-ID eller QR-kode." }, { status: 400 });

  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }

  const booking = await db.booking.findFirst({
    where: {
      ...(bookingId ? { id: bookingId } : { code: code! }),
      ...(schoolId ? { schoolId } : {}),
      status: { in: ["CONFIRMED", "CHECKED_IN"] },
    },
    include: { profile: true, user: { select: { name: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Fant ingen gyldig bestilling med den koden." }, { status: 404 });

  if (booking.status === "CHECKED_IN") {
    return NextResponse.json({ ok: true, already: true, name: booking.profile?.name ?? booking.user.name });
  }

  await db.booking.update({ where: { id: booking.id }, data: { status: "CHECKED_IN", checkedInAt: new Date() } });
  return NextResponse.json({ ok: true, name: booking.profile?.name ?? booking.user.name, seatLabel: booking.seatLabel });
}
