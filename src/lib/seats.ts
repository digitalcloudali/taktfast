import { db } from "@/lib/db";
import type { CourseCardData } from "@/lib/types";
import { DANCE_STYLES, styleName, styleFamily, FAMILIES } from "@/lib/constants";

/** Setestatus som teller mot kapasitet */
export const ACTIVE_SEAT_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN"];

export type SeatCounts = {
  capacitySeats: number; // antall personer
  forere: number;
  folgere: number;
  forereFree: number;
  folgereFree: number;
  seatsLeft: number;
  isPartner: boolean;
  isFull: boolean;
};

export function isPartnerCourse(course: { unit: string; styleSlug?: string; format?: string }) {
  return course.unit === "PAR";
}

export function computeSeats(
  course: { capacity: number; unit: string },
  forere: number,
  folgere: number
): SeatCounts {
  const isPartner = course.unit === "PAR";
  const capPairs = course.capacity;
  if (isPartner) {
    const forereFree = Math.max(0, capPairs - forere);
    const folgereFree = Math.max(0, capPairs - folgere);
    return {
      capacitySeats: capPairs * 2,
      forere, folgere, forereFree, folgereFree,
      seatsLeft: forereFree + folgereFree,
      isPartner,
      isFull: forereFree + folgereFree === 0,
    };
  }
  const booked = forere + folgere; // rolle INGEN telles også via aggregator under
  return {
    capacitySeats: capPairs,
    forere, folgere,
    forereFree: Math.max(0, capPairs - booked),
    folgereFree: Math.max(0, capPairs - booked),
    seatsLeft: Math.max(0, capPairs - booked),
    isPartner,
    isFull: booked >= capPairs,
  };
}

/** Sjekk rollebalanse-regel: fører/følger kan ikke avvike mer enn 2 */
export function roleBookingAllowed(seats: SeatCounts, role: "FORER" | "FOLGER"): boolean {
  if (!seats.isPartner) return seats.seatsLeft > 0;
  if (role === "FORER") {
    if (seats.forereFree <= 0) return false;
    return Math.abs(seats.forere + 1 - seats.folgere) <= 2;
  }
  if (seats.folgereFree <= 0) return false;
  return Math.abs(seats.forere - (seats.folgere + 1)) <= 2;
}

const seatStatusWhere = { status: { in: ACTIVE_SEAT_STATUSES } };

export async function seatCountsForCourses(courseIds: string[]): Promise<Map<string, SeatCounts>> {
  const map = new Map<string, SeatCounts>();
  if (courseIds.length === 0) return map;
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, capacity: true, unit: true },
  });
  const grouped = await db.booking.groupBy({
    by: ["courseId", "role"],
    where: { courseId: { in: courseIds }, ...seatStatusWhere },
    _count: { _all: true },
  });
  const byCourse = new Map<string, { forere: number; folgere: number; other: number }>();
  for (const g of grouped) {
    const cur = byCourse.get(g.courseId!) ?? { forere: 0, folgere: 0, other: 0 };
    if (g.role === "FORER") cur.forere += g._count._all;
    else if (g.role === "FOLGER") cur.folgere += g._count._all;
    else cur.other += g._count._all;
    byCourse.set(g.courseId!, cur);
  }
  for (const c of courses) {
    const cur = byCourse.get(c.id) ?? { forere: 0, folgere: 0, other: 0 };
    const seats = computeSeats(c, cur.forere, cur.folgere);
    // for ikke-partnerkurs: trekk også "INGEN"-roller
    if (!seats.isPartner) {
      const left = Math.max(0, c.capacity - (cur.forere + cur.folgere + cur.other));
      seats.seatsLeft = left;
      seats.forereFree = left;
      seats.folgereFree = left;
      seats.isFull = left === 0;
    }
    map.set(c.id, seats);
  }
  return map;
}

export function ribbonsFor(course: {
  format: string; komAlene: boolean; startDate: Date; dropInPrice: number | null;
}, seats: SeatCounts): string[] {
  const out: string[] = [];
  if (seats.isFull) out.push("fullt");
  else if (seats.isPartner && (seats.forereFree <= 2 || seats.folgereFree <= 2)) out.push("sisteplasser");
  else if (!seats.isPartner && seats.seatsLeft <= 3) out.push("sisteplasser");
  const daysTo = (course.startDate.getTime() - Date.now()) / 86400000;
  if (course.format === "KURSREKKE" && daysTo > 0 && daysTo < 14) out.push("starter_snart");
  if (course.dropInPrice != null) out.push("dropin");
  if (course.komAlene) out.push("kom_alene");
  return out;
}

export function toCardData(
  c: {
    id: string; slug: string; title: string; styleSlug: string; format: string; level: string;
    weekday: number; startTime: string; durationMin: number; startDate: Date; sessions: number;
    price: number; studentPrice: number | null; dropInPrice: number | null; pricePer: string;
    imageUrl: string; komAlene: boolean; ratingAvg: number; ratingCount: number;
    school: { name: string; slug: string; city: string; district: string | null };
  },
  seats: SeatCounts
): CourseCardData {
  const fam = styleFamily(c.styleSlug);
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    styleSlug: c.styleSlug,
    styleName: styleName(c.styleSlug),
    family: fam,
    tint: FAMILIES.find((f) => f.value === fam)?.tintHex ?? "#EEF5FC",
    schoolName: c.school.name,
    schoolSlug: c.school.slug,
    city: c.school.city,
    district: c.school.district,
    level: c.level,
    format: c.format,
    weekday: c.weekday,
    startTime: c.startTime,
    durationMin: c.durationMin,
    startDate: c.startDate.toISOString(),
    sessions: c.sessions,
    price: c.price,
    studentPrice: c.studentPrice,
    dropInPrice: c.dropInPrice,
    pricePer: c.pricePer,
    imageUrl: c.imageUrl,
    komAlene: c.komAlene,
    ratingAvg: c.ratingAvg,
    ratingCount: c.ratingCount,
    seatsLeft: seats.seatsLeft,
    forereFree: seats.forereFree,
    folgereFree: seats.folgereFree,
    isPartnerStyle: seats.isPartner,
    ribbons: ribbonsFor(c, seats),
  };
}
