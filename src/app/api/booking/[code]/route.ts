import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser, isResponse } from "@/lib/session";

/** Bekreftelsesdetaljer per gruppekode (med QR-data) */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const user = await requireUser();
  if (isResponse(user)) return user;
  const { code } = await params;

  const bookings = await db.booking.findMany({
    where: { code, userId: user.id },
    include: {
      course: { include: { school: { select: { name: true, slug: true, city: true, address: true } }, dates: { orderBy: { date: "asc" } } } },
      night: { include: { school: { select: { name: true, city: true, address: true } } } },
      weddingPackage: { include: { school: { select: { name: true } } } },
      profile: true,
      school: { select: { name: true, city: true, address: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  if (bookings.length === 0) return NextResponse.json({ error: "Bestillingen ble ikke funnet." }, { status: 404 });

  const b0 = bookings[0];
  const payment = await db.payment.findFirst({ where: { bookingCode: code, status: "PAID" } });
  return NextResponse.json({
    code,
    kind: b0.kind,
    status: b0.status,
    paymentStatus: b0.paymentStatus,
    method: payment?.method ?? b0.paymentMethod,
    amount: bookings.reduce((s, b) => s + b.amount, 0),
    discount: bookings.reduce((s, b) => s + b.discount, 0),
    school: b0.school,
    course: b0.course
      ? {
          title: b0.course.title, slug: b0.course.slug, level: b0.course.level,
          firstDate: b0.course.dates[0]?.date ?? null,
          startTime: b0.course.startTime, durationMin: b0.course.durationMin,
          address: b0.course.school.address,
        }
      : null,
    night: b0.night ? { title: b0.night.title, date: b0.night.date, startTime: b0.night.startTime, address: b0.night.school.address } : null,
    package: b0.weddingPackage ? { name: b0.weddingPackage.name } : null,
    seats: bookings.map((b) => ({
      id: b.id,
      name: b.profile?.name ?? user.name,
      role: b.role,
      seatLabel: b.seatLabel,
      amount: b.amount,
      status: b.status,
      checkedInAt: b.checkedInAt,
    })),
    createdAt: b0.createdAt,
  });
}
