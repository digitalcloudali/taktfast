import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";
import { COMMISSION_RATE } from "@/lib/constants";

/** Omsetning & KPI for skolepanelet (Recharts-data) */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }

  const payments = await db.payment.findMany({
    where: { status: "PAID", method: { in: ["VIPPS", "KORT"] } },
  });
  const codes = new Set(payments.map((p) => p.bookingCode));
  const bookings = await db.booking.findMany({
    where: { code: { in: [...codes] }, ...(schoolId ? { schoolId } : {}) },
    select: { code: true, amount: true, createdAt: true, schoolId: true, kind: true },
  });
  // ett betalingsbeløp per kode (unngå dobbelttelling ved flere seter)
  const amountByCode = new Map<string, number>();
  for (const b of bookings) {
    if (!amountByCode.has(b.code)) amountByCode.set(b.code, 0);
  }
  for (const p of payments) {
    if (amountByCode.has(p.bookingCode)) {
      amountByCode.set(p.bookingCode, amountByCode.get(p.bookingCode)! + p.amount);
    }
  }

  const months: { month: string; label: string; omsetning: number; provisjon: number; bookinger: number }[] = [];
  const now = new Date();
  const monthLabels = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const inMonth = bookings.filter((b) => b.createdAt >= d && b.createdAt < next);
    const sum = inMonth.reduce((s, b) => s + (amountByCode.get(b.code) ?? 0) / 2, 0); // halv per sete-antakelse demo
    months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: monthLabels[d.getMonth()],
      omsetning: Math.round(sum),
      provisjon: Math.round(sum * COMMISSION_RATE),
      bookinger: inMonth.length,
    });
  }

  const allTime = months.reduce((s, m) => s + m.omsetning, 0);
  const kpis = {
    omsetningSiste6: allTime,
    provisjon: Math.round(allTime * COMMISSION_RATE),
    bookinger: await db.booking.count(schoolId ? { where: { schoolId } } : {}),
    kurs: await db.course.count(schoolId ? { where: { schoolId } } : {}),
    venteliste: await db.waitlistEntry.count({ where: { ...(schoolId ? { course: { schoolId } } : {}), status: { in: ["ACTIVE", "OFFERED"] } } }),
    vurdering: schoolId ? (await db.school.findFirst({ where: { id: schoolId } }))?.ratingAvg ?? 0 : 4.5,
  };

  return NextResponse.json({ months, kpis });
}
