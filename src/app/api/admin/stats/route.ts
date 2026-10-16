import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";
import { COMMISSION_RATE } from "@/lib/constants";

/** Admin-KPIer: GMV-provisjon, brukere, bookinger, skoler */
export async function GET() {
  const user = await requireRole(["ADMIN"]);
  if (isResponse(user)) return user;

  const [userCount, schoolCount, pendingSchools, bookingCount, reviewPending] = await Promise.all([
    db.user.count(),
    db.school.count(),
    db.school.count({ where: { status: "PENDING" } }),
    db.booking.count(),
    db.review.count({ where: { status: "PENDING" } }),
  ]);

  const payments = await db.payment.findMany({ where: { status: "PAID", method: { in: ["VIPPS", "KORT"] } } });
  const sumByCode = new Map<string, number>();
  for (const p of payments) sumByCode.set(p.bookingCode, (sumByCode.get(p.bookingCode) ?? 0) + p.amount);

  const months: { month: string; label: string; gmv: number; provisjon: number }[] = [];
  const now = new Date();
  const monthLabels = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];
  let gmvTotal = 0;
  for (let i = 11; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    let gmv = 0;
    for (const p of payments) {
      if (p.createdAt >= start && p.createdAt < end) gmv += p.amount;
    }
    gmvTotal += gmv;
    months.push({ month: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`, label: monthLabels[start.getMonth()], gmv, provisjon: Math.round(gmv * COMMISSION_RATE) });
  }

  return NextResponse.json({
    kpis: { userCount, schoolCount, pendingSchools, bookingCount, reviewPending, gmvTotal: Math.round(gmvTotal), provisjon: Math.round(gmvTotal * COMMISSION_RATE) },
    months,
  });
}
