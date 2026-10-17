import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { DANCE_STYLES, CITIES } from "@/lib/constants";

const BASE = "https://taktfast.no";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/sok",
    "/bryllupsdans",
    "/dansekvelder",
    "/tips-og-rad",
    "/gavekort",
    "/for-danseskoler",
    "/om-oss",
    "/slik-fungerer-det",
    "/kundeservice",
    "/personvern",
    "/vilkar",
    "/cookies",
    "/logg-inn",
    "/registrer",
  ].map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.6 }));

  // Statisk innhold
  const styles = DANCE_STYLES.map((s) => ({ url: `${BASE}/dansestiler/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  const cities = CITIES.map((c) => ({ url: `${BASE}/by/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 }));
  const cityStyles: MetadataRoute.Sitemap = [];
  for (const c of CITIES) {
    for (const s of DANCE_STYLES) {
      cityStyles.push({ url: `${BASE}/by/${c.slug}/${s.slug}`, changeFrequency: "weekly" as const, priority: 0.5 });
    }
  }
  const guides = (await import("@/lib/guides")).GUIDES.map((g) => ({ url: `${BASE}/tips-og-rad/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.5 }));

  // Dynamisk innhold fra db
  let schoolUrls: MetadataRoute.Sitemap = [];
  let courseUrls: MetadataRoute.Sitemap = [];
  let nightUrls: MetadataRoute.Sitemap = [];
  try {
    const [schools, courses, nights] = await Promise.all([
      db.school.findMany({ where: { status: "APPROVED" }, select: { slug: true, createdAt: true } }),
      db.course.findMany({ where: { status: "AKTIV", school: { status: "APPROVED" } }, select: { slug: true, createdAt: true } }),
      db.danceNight.findMany({ where: { status: "AKTIV", date: { gte: new Date() } }, select: { slug: true, date: true } }),
    ]);
    schoolUrls = schools.map((s) => ({ url: `${BASE}/danseskoler/${s.slug}`, lastModified: s.createdAt, changeFrequency: "weekly" as const, priority: 0.7 }));
    courseUrls = courses.map((c) => ({ url: `${BASE}/kurs/${c.slug}`, lastModified: c.createdAt, changeFrequency: "daily" as const, priority: 0.9 }));
    nightUrls = nights.map((n) => ({ url: `${BASE}/dansekveld/${n.slug}`, lastModified: n.date, changeFrequency: "daily" as const, priority: 0.7 }));
  } catch {
    // db utilgjengelig ved build — statisk innhold er nok
  }

  return [...staticPages, ...styles, ...cities, ...cityStyles, ...guides, ...schoolUrls, ...courseUrls, ...nightUrls];
}
