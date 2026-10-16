// Taktfast /sok — kurssøk (serverkomponent): henter data server-side, klientkomponenter håndterer bare filter-UI og kart
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/course-card";
import { InfoBox } from "@/components/site/ui-bits";
import { searchCourses } from "@/lib/data";
import { db } from "@/lib/db";
import { cityBySlug, familyTint } from "@/lib/constants";
import { ActiveFilterChips, FilterPanel, ViewToggle } from "@/components/sok/filter-panel";
import { MapView } from "@/components/sok/map-view";
import { filtersToQuery, parseSearchParams, type SchoolPin, type SokFilters } from "@/components/sok/params";

export const metadata: Metadata = {
  title: "Søk dansekurs",
  description:
    "Søk blant dansekurs i hele Norge: filtrer på dansestil, by, ukedag, tidspunkt, nivå, alder, pris og ledige plasser hos verifiserte danseskoler.",
};

const PAGE_SIZE = 12;
const OSLO: [number, number] = [59.9139, 10.7522];

function pageHref(f: SokFilters, side: number | undefined): string {
  const qs = filtersToQuery({ ...f, side });
  return qs ? `/sok?${qs}` : "/sok";
}

export default async function SokPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const f = parseSearchParams(sp);
  const vis = f.vis ?? "liste";
  const side = f.side ?? 1;

  const res = await searchCourses({
    q: f.q,
    style: f.stil,
    family: f.familie,
    city: f.by,
    day: f.dag,
    timeOfDay: f.tid,
    level: f.niva,
    age: f.alder,
    komAlene: f.komAlene,
    role: f.rolle,
    format: f.format,
    maxPrice: f.maksPris,
    student: f.student,
    minRating: f.minRating,
    ledig: f.ledig,
    page: side,
    pageSize: PAGE_SIZE,
  });

  // Kart: slå opp koordinater for skolene på gjeldende resultatside og aggreger per skole
  const schoolSlugs = [...new Set(res.items.map((c) => c.schoolSlug))];
  const schools =
    schoolSlugs.length > 0
      ? await db.school.findMany({
          where: { slug: { in: schoolSlugs } },
          select: { slug: true, name: true, city: true, district: true, lat: true, lng: true },
        })
      : [];
  const tintBySchool = new Map<string, string>();
  for (const c of res.items) {
    if (!tintBySchool.has(c.schoolSlug)) tintBySchool.set(c.schoolSlug, familyTint(c.family));
  }
  const pins: SchoolPin[] = schools.map((s) => ({
    schoolSlug: s.slug,
    schoolName: s.name,
    city: s.city,
    district: s.district,
    lat: s.lat,
    lng: s.lng,
    count: res.items.filter((c) => c.schoolSlug === s.slug).length,
    tintHex: tintBySchool.get(s.slug) ?? "#8BB8E8",
  }));

  const valgtBy = f.by ? cityBySlug(f.by) : undefined;
  const center: [number, number] = valgtBy ? [valgtBy.lat, valgtBy.lng] : OSLO;
  const zoom = valgtBy ? 12 : 6;

  const start = (side - 1) * PAGE_SIZE + 1;
  const end = start + res.items.length - 1;
  const hasPrev = side > 1;
  const hasNext = side * PAGE_SIZE < res.total;
  const tom = res.items.length === 0;

  return (
    <div className="flex flex-col">
      {/* Sidehode */}
      <header className="border-b border-[#CCD2DE] bg-sky-pale">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-navy">Finn dansekurs</h1>
          <p className="mt-2 text-lg text-tf-muted">
            {res.total.toLocaleString("nb-NO")} kurs fra verifiserte skoler
          </p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        {/* Venstrekolonne: filtre (mobil: knapp + ark) */}
        <aside className="shrink-0 lg:sticky lg:top-24 lg:w-72 lg:self-start" aria-label="Filtre">
          <FilterPanel filters={f} />
        </aside>

        {/* Høyrekolonne: resultater */}
        <section aria-label="Søkeresultater" className="min-w-0 flex-1">
          <ActiveFilterChips filters={f} />

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-lg font-bold text-navy">
              {res.total.toLocaleString("nb-NO")} kurs funnet
            </p>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-tf-muted md:inline">Sortert etter startdato</span>
              <ViewToggle params={filtersToQuery(f)} vis={vis} />
            </div>
          </div>

          {tom ? (
            <InfoBox className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-3">
                <SearchX className="h-6 w-6 shrink-0 text-navy" aria-hidden="true" />
                <span>Ingen kurs matcher søket ditt — prøv å fjerne et filter</span>
              </span>
              <Link href="/sok" className="link-chevron shrink-0 text-[15px]">
                Nullstill alle filtre <span aria-hidden="true">›</span>
              </Link>
            </InfoBox>
          ) : vis === "kart" ? (
            <div className="space-y-4">
              <p className="text-sm text-tf-muted">
                Kartet viser danseskolene fra denne resultatsiden — klikk på en prikk for å se skolen.
                Fargen viser dansefamilien.
              </p>
              <MapView key={`${center[0]}-${center[1]}-${zoom}`} pins={pins} center={center} zoom={zoom} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {res.items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}

          {!tom && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-tf-muted">
                Viser {start.toLocaleString("nb-NO")}–{end.toLocaleString("nb-NO")} av{" "}
                {res.total.toLocaleString("nb-NO")} kurs
              </p>
              <div className="flex items-center gap-3">
                {hasPrev && (
                  <Button variant="outline" asChild>
                    <Link href={pageHref(f, side - 1)} scroll={false} rel="prev">
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      Forrige
                    </Link>
                  </Button>
                )}
                {hasNext && (
                  <Button asChild>
                    <Link href={pageHref(f, side + 1)} scroll={false} rel="next">
                      Vis flere
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
