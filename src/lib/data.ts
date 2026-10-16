import { db } from "@/lib/db";
import { seatCountsForCourses, toCardData, computeSeats, ribbonsFor } from "@/lib/seats";
import { styleName, styleFamily, FAMILIES, DANCE_STYLES } from "@/lib/constants";
import type { CourseCardData, SchoolCardData, NightCardData } from "@/lib/types";
import type { Prisma } from "@prisma/client";

// ---------- Kursøk ----------

export type CourseFilters = {
  q?: string;
  style?: string; // style slug
  family?: string;
  city?: string; // city slug
  day?: number; // 1-7
  timeOfDay?: "dag" | "kveld";
  level?: string;
  age?: string;
  komAlene?: boolean;
  role?: string; // FORER | FOLGER
  format?: string; // KURSREKKE | DROPIN | ...
  maxPrice?: number;
  student?: boolean;
  minRating?: number;
  ledig?: boolean;
  page?: number;
  pageSize?: number;
};

export async function searchCourses(f: CourseFilters): Promise<{ items: CourseCardData[]; total: number; page: number; pageSize: number }> {
  const where: Prisma.CourseWhereInput = {
    school: { status: "APPROVED" },
    status: "AKTIV",
  };
  if (f.q) {
    const q = f.q.toLowerCase();
    where.OR = [
      { title: { contains: q } },
      { school: { name: { contains: q } } },
      { school: { city: { contains: q } } },
      { styleSlug: { contains: q } },
    ];
  }
  if (f.style) where.styleSlug = f.style;
  if (f.family) where.styleSlug = { in: DANCE_STYLES.filter((s) => s.family === f.family).map((s) => s.slug) };
  if (f.city) where.school = { ...where.school as object, citySlug: f.city };
  if (f.day) where.weekday = f.day;
  if (f.timeOfDay === "dag") where.startTime = { lte: "16:59" };
  if (f.timeOfDay === "kveld") where.startTime = { gte: "17:00" };
  if (f.level) where.level = f.level;
  if (f.age) where.ageGroup = f.age;
  if (f.komAlene) where.komAlene = true;
  if (f.format) where.format = f.format;
  if (f.maxPrice) where.price = { lte: f.maxPrice };
  if (f.student) where.studentPrice = { not: null };
  if (f.minRating) where.ratingAvg = { gte: f.minRating };

  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(24, Math.max(6, f.pageSize ?? 12));

  let courses = await db.course.findMany({
    where,
    include: { school: { select: { name: true, slug: true, city: true, district: true } } },
    orderBy: [{ startDate: "asc" }],
    take: 400,
  });

  let seatsMap = await seatCountsForCourses(courses.map((c) => c.id));
  if (f.role === "FORER") courses = courses.filter((c) => (seatsMap.get(c.id)?.forereFree ?? 0) > 0);
  if (f.role === "FOLGER") courses = courses.filter((c) => (seatsMap.get(c.id)?.folgereFree ?? 0) > 0);
  if (f.ledig) courses = courses.filter((c) => (seatsMap.get(c.id)?.seatsLeft ?? 0) > 0);

  const total = courses.length;
  const paged = courses.slice((page - 1) * pageSize, page * pageSize);
  const items = paged.map((c) => toCardData(c as never, seatsMap.get(c.id)!));
  return { items, total, page, pageSize };
}

export async function homeSections() {
  const base = {
    school: { select: { name: true, slug: true, city: true, district: true } },
  } as const;
  const now = Date.now();

  const [starterSnart, dropinUken, provetimer, populare, brudevals, kvelder, guides] = await Promise.all([
    // kurs som starter snart
    db.course.findMany({
      where: { school: { status: "APPROVED" }, status: "AKTIV", format: { in: ["KURSREKKE", "WORKSHOP"] }, startDate: { gte: new Date(now), lte: new Date(now + 21 * 86400000) } },
      include: base,
      orderBy: { startDate: "asc" },
      take: 24,
    }),
    // drop-in denne uken
    db.course.findMany({
      where: { school: { status: "APPROVED" }, status: "AKTIV", format: "DROPIN", startDate: { gte: new Date(now - 86400000), lte: new Date(now + 7 * 86400000) } },
      include: base,
      orderBy: { weekday: "asc" },
      take: 12,
    }),
    // prøvetimer / åpen uke
    db.course.findMany({
      where: { school: { status: "APPROVED" }, status: "AKTIV", format: "PROVETIME", startDate: { gte: new Date(now) } },
      include: base,
      orderBy: { startDate: "asc" },
      take: 8,
    }),
    // populære skoler
    db.school.findMany({
      where: { status: "APPROVED" },
      orderBy: [{ ratingCount: "desc" }, { ratingAvg: "desc" }],
      take: 8,
    }),
    // brudevals-pakker
    db.weddingPackage.findMany({
      include: { school: { select: { name: true, slug: true, city: true } } },
      orderBy: { price: "asc" },
      take: 6,
    }),
    // dansekvelder i helgen
    db.danceNight.findMany({
      where: { status: "AKTIV", date: { gte: new Date(now), lte: new Date(now + 21 * 86400000) } },
      include: { school: { select: { name: true, slug: true, city: true } } },
      orderBy: { date: "asc" },
      take: 8,
    }),
    null,
  ]);

  const seatsMap = await seatCountsForCourses([...starterSnart, ...dropinUken, ...provetimer].map((c) => c.id));
  return {
    starterSnart: starterSnart.map((c) => toCardData(c as never, seatsMap.get(c.id)!)).slice(0, 12),
    dropinUken: dropinUken.map((c) => toCardData(c as never, seatsMap.get(c.id)!)),
    provetimer: provetimer.map((c) => toCardData(c as never, seatsMap.get(c.id)!)),
    populare: populare.map((s) => schoolToCard(s)),
    brudevals: brudevals.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, type: p.type, sessions: p.sessions, durationMin: p.durationMin,
      price: p.price, priceUnit: p.priceUnit, description: p.description, image: p.image,
      schoolName: p.school.name, schoolSlug: p.school.slug, city: p.school.city,
    })),
    kvelder: kvelder.map((n) => nightToCard(n)),
  };
}

export function schoolToCard(s: {
  id: string; slug: string; name: string; city: string; citySlug: string; district: string | null;
  coverImage: string; styles: string; ratingAvg: number; ratingCount: number; verified: boolean; tagline: string;
}): SchoolCardData {
  const styles = JSON.parse(s.styles || "[]") as string[];
  return {
    id: s.id, slug: s.slug, name: s.name, city: s.city, citySlug: s.citySlug, district: s.district,
    coverImage: s.coverImage, styles, styleNames: styles.map(styleName),
    ratingAvg: s.ratingAvg, ratingCount: s.ratingCount, verified: s.verified, tagline: s.tagline,
  };
}

export function nightToCard(n: {
  id: string; slug: string; title: string; date: Date; startTime: string; endTime: string; price: number;
  styles: string; freeBeginnerClass: boolean; imageUrl: string;
  school: { name: string; slug: string; city: string };
}): NightCardData {
  return {
    id: n.id, slug: n.slug, title: n.title,
    schoolName: n.school.name, schoolSlug: n.school.slug, city: n.school.city,
    date: n.date.toISOString(), startTime: n.startTime, endTime: n.endTime, price: n.price,
    styles: JSON.parse(n.styles || "[]"),
    freeBeginnerClass: n.freeBeginnerClass, imageUrl: n.imageUrl,
  };
}

// ---------- Detaljsider ----------

export async function getCourseDetail(slug: string) {
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      school: true,
      studio: true,
      instructor: true,
      dates: { orderBy: { date: "asc" } },
    },
  });
  if (!course) return null;
  const seats = (await seatCountsForCourses([course.id])).get(course.id)!;
  const reviews = await db.review.findMany({
    where: { courseId: course.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
  const waitlistCount = await db.waitlistEntry.count({ where: { courseId: course.id, status: "ACTIVE" } });
  const related = await db.course.findMany({
    where: { schoolId: course.schoolId, id: { not: course.id }, status: "AKTIV" },
    include: { school: { select: { name: true, slug: true, city: true, district: true } } },
    take: 4,
  });
  const relatedSeats = await seatCountsForCourses(related.map((c) => c.id));
  return {
    course,
    seats,
    ribbons: ribbonsFor(course, seats),
    reviews,
    waitlistCount,
    related: related.map((c) => toCardData(c as never, relatedSeats.get(c.id)!)),
  };
}

export async function getSchoolDetail(slug: string) {
  const school = await db.school.findUnique({
    where: { slug },
    include: {
      studios: true,
      instructors: true,
      courses: { where: { status: "AKTIV" }, orderBy: [{ weekday: "asc" }, { startTime: "asc" }] },
      nights: { where: { status: "AKTIV", date: { gte: new Date() } }, orderBy: { date: "asc" } },
      weddingPackages: true,
      reviews: { where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 12 },
    },
  });
  if (!school) return null;
  const seatsMap = await seatCountsForCourses(school.courses.map((c) => c.id));
  const pendingSchools = undefined;
  return { school, seatsMap, courses: school.courses };
}

export async function getStyleDetail(slug: string) {
  const style = DANCE_STYLES.find((s) => s.slug === slug);
  if (!style) return null;
  const courses = await db.course.findMany({
    where: { styleSlug: slug, status: "AKTIV", school: { status: "APPROVED" } },
    include: { school: { select: { name: true, slug: true, city: true, citySlug: true, district: true } } },
    orderBy: { startDate: "asc" },
    take: 60,
  });
  const seatsMap = await seatCountsForCourses(courses.map((c) => c.id));
  const citiesWith = [...new Set(courses.map((c) => c.school.citySlug))];
  return { style, courses: courses.map((c) => toCardData(c as never, seatsMap.get(c.id)!)), citiesWith };
}

export async function getCityDetail(slug: string, styleSlug?: string) {
  const city = (await db.city.findUnique({ where: { slug } })) ?? null;
  const where: Prisma.CourseWhereInput = {
    status: "AKTIV",
    school: { status: "APPROVED", citySlug: slug },
    ...(styleSlug ? { styleSlug } : {}),
  };
  const courses = await db.course.findMany({ where, include: { school: { select: { name: true, slug: true, city: true, district: true } } }, orderBy: { startDate: "asc" }, take: 60 });
  const seatsMap = await seatCountsForCourses(courses.map((c) => c.id));
  const schools = await db.school.findMany({ where: { status: "APPROVED", citySlug: slug }, orderBy: { ratingCount: "desc" } });
  const styleCounts = await db.course.groupBy({ by: ["styleSlug"], where: { status: "AKTIV", school: { status: "APPROVED", citySlug: slug } }, _count: true });
  return { city, courses: courses.map((c) => toCardData(c as never, seatsMap.get(c.id)!)), schools: schools.map(schoolToCard), styleCounts };
}

// ---------- Dansekvelder ----------

export async function listNights(city?: string) {
  const nights = await db.danceNight.findMany({
    where: { status: "AKTIV", date: { gte: new Date() }, ...(city ? { school: { citySlug: city } } : {}) },
    include: { school: { select: { name: true, slug: true, city: true } } },
    orderBy: { date: "asc" },
    take: 60,
  });
  return nights.map(nightToCard);
}

// ---------- Min side ----------

export async function myBookings(userId: string) {
  const bookings = await db.booking.findMany({
    where: { userId },
    include: {
      course: { include: { school: { select: { name: true, slug: true } } } },
      night: { include: { school: { select: { name: true } } } },
      profile: true,
      weddingPackage: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return bookings;
}

export async function myFavorites(userId: string) {
  const favs = await db.favorite.findMany({
    where: { userId },
    include: { course: { include: { school: { select: { name: true, slug: true, city: true, district: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  const seatsMap = await seatCountsForCourses(favs.map((f) => f.course.id));
  return favs.filter((f) => f.course).map((f) => ({ course: toCardData(f.course as never, seatsMap.get(f.course.id)!), favId: f.id }));
}

export async function myKlippekort(userId: string) {
  return db.klippekort.findMany({ where: { userId }, orderBy: { purchasedAt: "desc" } });
}

export async function myWaitlist(userId: string) {
  return db.waitlistEntry.findMany({
    where: { userId, status: { in: ["ACTIVE", "OFFERED"] } },
    include: { course: { include: { school: { select: { name: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}
