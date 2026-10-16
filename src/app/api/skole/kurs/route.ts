import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, isResponse } from "@/lib/session";
import { seatCountsForCourses } from "@/lib/seats";

const createSchema = z.object({
  title: z.string().min(3).max(120),
  styleSlug: z.string().min(2),
  level: z.enum(["NYBEGYNNER", "LETT_VIDEREKOMMEN", "VIDEREKOMMEN", "AVANSERT"]),
  format: z.enum(["KURSREKKE", "DROPIN", "WORKSHOP", "PROVETIME", "PRIVATTIME"]),
  ageGroup: z.enum(["ALDER_3_6", "ALDER_7_12", "ALDER_13_17", "VOKSEN", "SENIOR", "ALLE"]).default("VOKSEN"),
  description: z.string().max(1500).default(""),
  capacity: z.number().int().min(1).max(60),
  price: z.number().int().min(0).max(20000),
  dropInPrice: z.number().int().min(0).max(1000).nullable().optional(),
  weekday: z.number().int().min(1).max(7),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  sessions: z.number().int().min(1).max(16),
  startDate: z.string(), // ISO
});

async function mySchool(userId: string) {
  return db.school.findFirst({ where: { ownerId: userId } });
}

export async function GET() {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const school = user.role === "SKOLE" ? await mySchool(user.id) : null;
  if (user.role === "SKOLE" && !school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });

  const courses = await db.course.findMany({
    where: school ? { schoolId: school.id } : {},
    include: { school: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const seatsMap = await seatCountsForCourses(courses.map((c) => c.id));
  return NextResponse.json({
    courses: courses.map((c) => ({
      id: c.id, title: c.title, styleSlug: c.styleSlug, format: c.format, level: c.level,
      weekday: c.weekday, startTime: c.startTime, price: c.price, capacity: c.capacity, unit: c.unit,
      sessions: c.sessions, startDate: c.startDate, status: c.status, ratingAvg: c.ratingAvg, ratingCount: c.ratingCount,
      seats: seatsMap.get(c.id),
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const school = user.role === "SKOLE" ? await mySchool(user.id) : null;
  if (user.role === "SKOLE" && !school) return NextResponse.json({ error: "Fant ikke skolen din." }, { status: 404 });

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Ugyldige data" }, { status: 400 });
  const d = parsed.data;
  const start = new Date(d.startDate);
  if (isNaN(start.getTime())) return NextResponse.json({ error: "Ugyldig startdato" }, { status: 400 });

  const slug = `${d.styleSlug}-${(school?.slug ?? "admin").slice(0, 24)}-${Date.now().toString(36)}`;
  const course = await db.course.create({
    data: {
      schoolId: school?.id ?? (await db.school.findFirst({ where: { status: "APPROVED" } }))!.id,
      title: d.title,
      slug,
      styleSlug: d.styleSlug,
      level: d.level,
      format: d.format,
      ageGroup: d.ageGroup,
      description: d.description || `${d.title} — nytt kurs fra ${school?.name ?? "danseskolen"}.`,
      learnWhat: "Grunnsteg, føring/følging og klassiske figurer — steg for steg med dyktige instruktører.",
      clothing: "Komfortable klær og rene indendørssko.",
      capacity: d.capacity,
      unit: d.format === "PRIVATTIME" ? "PAR" : "PERSON",
      price: d.price,
      dropInPrice: d.dropInPrice ?? null,
      pricePer: d.format === "PRIVATTIME" ? "PAR" : "PERSON",
      durationMin: 75,
      weekday: d.weekday,
      startTime: d.startTime,
      startDate: start,
      sessions: d.sessions,
      imageUrl: `/images/stil-${d.styleSlug === "west-coast-swing" ? "wcs" : d.styleSlug === "k-pop" ? "kpop" : d.styleSlug}.png`,
      komAlene: true,
      status: "AKTIV",
    },
  });

  // generer kurdatoer
  const dates: { date: Date }[] = [];
  let first = new Date(start);
  const [sh, sm] = d.startTime.split(":").map(Number);
  for (let i = 0; i < d.sessions; i++) {
    const dd = new Date(first.getTime() + i * 7 * 86400000);
    dd.setHours(sh, sm, 0, 0);
    dates.push({ date: dd });
  }
  await db.courseDate.createMany({ data: dates.map((x) => ({ courseId: course.id, date: x.date, startTime: d.startTime, endTime: `${String((sh + 1) % 24).padStart(2, "0")}:${String(sm).padStart(2, "0")}` })) });

  return NextResponse.json({ ok: true, courseId: course.id, slug: course.slug });
}

const patchSchema = z.object({
  courseId: z.string(),
  price: z.number().int().min(0).max(20000).optional(),
  dropInPrice: z.number().int().min(0).max(1000).nullable().optional(),
  status: z.enum(["AKTIV", "FULL", "AVLYST"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await requireRole(["SKOLE", "ADMIN"]);
  if (isResponse(user)) return user;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ugyldige data" }, { status: 400 });
  const { courseId, ...data } = parsed.data;

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "Kurset ble ikke funnet." }, { status: 404 });
  if (user.role === "SKOLE") {
    const school = await mySchool(user.id);
    if (!school || course.schoolId !== school.id) return NextResponse.json({ error: "Du kan bare redigere egne kurs." }, { status: 403 });
  }
  await db.course.update({ where: { id: courseId }, data });
  return NextResponse.json({ ok: true });
}
