import type { Route } from "next";

/** Dataformat som brukes av kurskort og lister (kommer fra API/serverkomponenter) */
export type CourseCardData = {
  id: string;
  slug: string;
  title: string;
  styleSlug: string;
  styleName: string;
  family: string;
  tint: string;
  schoolName: string;
  schoolSlug: string;
  city: string;
  district?: string | null;
  level: string;
  format: string;
  weekday: number;
  startTime: string;
  durationMin: number;
  startDate: string;
  sessions: number;
  price: number;
  studentPrice?: number | null;
  dropInPrice?: number | null;
  pricePer: string;
  imageUrl: string;
  komAlene: boolean;
  ratingAvg: number;
  ratingCount: number;
  seatsLeft: number;
  forereFree: number;
  folgereFree: number;
  isPartnerStyle: boolean;
  ribbons: string[];
};

export type SchoolCardData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  citySlug: string;
  district?: string | null;
  coverImage: string;
  styles: string[];
  styleNames: string[];
  ratingAvg: number;
  ratingCount: number;
  verified: boolean;
  tagline: string;
  courseCount?: number;
};

export type NightCardData = {
  id: string;
  slug: string;
  title: string;
  schoolName: string;
  schoolSlug: string;
  city: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  styles: string[];
  freeBeginnerClass: boolean;
  imageUrl: string;
};

export type GuideCardData = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  readMinutes: number;
  tag: string;
};

export const fmtNok = (n: number) => `${n.toLocaleString("nb-NO")},-`;

export const fmtDate = (d: string | Date) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const months = ["jan.", "feb.", "mars", "apr.", "mai", "juni", "juli", "aug.", "sep.", "okt.", "nov.", "des."];
  return `${date.getDate()}. ${months[date.getMonth()]}`;
};

export const fmtWeekday = (n: number) => ["", "mandager", "tirsdager", "onsdager", "torsdager", "fredager", "lørdager", "søndager"][n] ?? "";
