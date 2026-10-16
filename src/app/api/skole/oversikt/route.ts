import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";

/** Dagens og kommende timer med deltakerlister (for skolepanelet) */
export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;

  let schoolId: string | null = null;
  if (user.role === "SKOLE") {
    const school = await db.school.findFirst({ where: { ownerId: user.id } });
    if (!school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });
    schoolId = school.id;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const where = {
    ...(schoolId ? { schoolId } : {}),
    status: "AKTIV" as const,
  };

  const courses = await db.course.findMany({
    where,
    include: {
      school: { select: { name: true } },
      dates: { orderBy: { date: "asc" }, where: { date: { gte: todayStart, lte: new Date(Date.now() + 14 * 86400000) } } },
    },
  });

  const dates = courses.flatMap((c) =>
    c.dates.map((d) => ({ ...d, course: { id: c.id, title: c.title, unit: c.unit, capacity: c.capacity, styleSlug: c.styleSlug, startTime: c.startTime }, schoolName: c.school.name }))
  );

  const dateIds = dates.map((d) => d.id);
  const bookings = dateIds.length
    ? await db.booking.findMany({
        where: { courseId: { in: courses.map((c) => c.id) }, status: { in: ["CONFIRMED", "CHECKED_IN"] } },
        include: { profile: true, user: { select: { name: true, email: true } } },
      })
    : [];

  const todayDates = dates.filter((d) => d.date >= todayStart && d.date < todayEnd);
  const isToday = (courseId: string) => todayDates.some((d) => d.course.id === courseId && new Date(`${d.date.toISOString().slice(0, 10)}T${d.startTime}:00`).getTime() >= todayStart.getTime());

  return NextResponse.json({
    todayCount: todayDates.length,
    dates: dates.slice(0, 80).map((d) => {
      const seats = bookings.filter((b) => b.courseId === d.course.id && ["CONFIRMED", "CHECKED_IN"].includes(b.status));
      return {
        dateId: d.id,
        date: d.date,
        courseId: d.course.id,
        courseTitle: d.course.title,
        unit: d.course.unit,
        capacity: d.course.capacity,
        startTime: d.startTime,
        schoolName: d.schoolName,
        attendees: seats.map((b) => ({
          id: b.id,
          name: b.profile?.name ?? b.user.name,
          role: b.role,
          seatLabel: b.seatLabel,
          status: b.status,
          checkedInAt: b.checkedInAt,
          code: b.code,
        })),
        forere: seats.filter((b) => b.role === "FORER").length,
        folgere: seats.filter((b) => b.role === "FOLGER").length,
      };
    }),
  });
}
