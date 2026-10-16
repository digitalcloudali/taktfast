import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, cityBySlug, styleName, styleFamily, familyTint } from "@/lib/constants";
import { getCityDetail } from "@/lib/data";
import { CourseCard } from "@/components/course/course-card";
import { SchoolCard } from "@/components/home/school-card";
import { SectionHeader, StyleChip, InfoBox } from "@/components/site/ui-bits";
import { CityImage } from "@/components/home/city-image";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = cityBySlug(slug);
  if (!city) return { title: "By finnes ikke" };
  return {
    title: `Dansekurs i ${city.name} – alle danseskoler og kurs`,
    description: city.blurb,
    alternates: { canonical: `/by/${city.slug}` },
  };
}

export default async function BySide({ params }: Props) {
  const { slug } = await params;
  const constCity = cityBySlug(slug);
  const detail = await getCityDetail(slug);
  if (!constCity || !detail?.city) notFound();

  const { courses, schools, styleCounts } = detail;
  const stiler = [...styleCounts]
    .sort((a, b) => b._count - a._count)
    .map((g) => ({ slug: g.styleSlug, count: g._count }));
  const visteKurs = courses.slice(0, 12);

  return (
    <>
      {/* ---------- Banner ---------- */}
      <section className="relative h-[300px] w-full md:h-[380px]">
        <CityImage
          slug={constCity.slug}
          name={constCity.name}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00205B]/60 to-transparent" aria-hidden="true" />
        <p className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy md:bottom-6 md:left-6">
          {constCity.county}
        </p>
      </section>
      <div className="relative z-10 mx-auto -mt-16 w-full max-w-7xl px-4 md:-mt-20">
        <div className="max-w-2xl rounded-md bg-white p-6 shadow-md">
          <h1>Dansekurs i {constCity.name}</h1>
          <p className="mt-2 text-[17px] text-[#1A1A1A]">{constCity.blurb}</p>
        </div>
      </div>

      {/* ---------- Dansestiler i byen ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title={`Dansestiler i ${constCity.name}`}
          subtitle="Velg en stil for å se alle kurs med tidspunkter og ledige plasser."
        />
        {stiler.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {stiler.map((s) => (
              <li key={s.slug}>
                <Link href={`/by/${constCity.slug}/${s.slug}`}>
                  <StyleChip
                    name={`${styleName(s.slug)} (${s.count})`}
                    tint={familyTint(styleFamily(s.slug))}
                    className="px-3 py-1.5 text-sm transition-transform hover:scale-[1.03]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[#6B6B6B]">Ingen kurs lagt ut i {constCity.name} ennå.</p>
        )}
      </section>

      {/* ---------- Danseskoler i byen ---------- */}
      <section className="bg-sky-pale py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            title={`Danseskoler i ${constCity.name}`}
            subtitle="Verifiserte skoler med vurderinger fra deltakere."
          />
          {schools.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {schools.map((s) => (
                <li key={s.id}>
                  <SchoolCard school={s} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#6B6B6B]">
              Ingen skoler i {constCity.name} ennå – se nabobyene eller søk på hele Norge.
            </p>
          )}
        </div>
      </section>

      {/* ---------- Kurs i byen ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title={`Kurs i ${constCity.name}`}
          subtitle="Alle aktive kurs – sortert etter startdato."
        />
        {courses.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visteKurs.map((c) => (
                <li key={c.id}>
                  <CourseCard course={c} />
                </li>
              ))}
            </ul>
            {courses.length > visteKurs.length && (
              <div className="mt-6">
                <Link
                  href={`/sok?by=${constCity.slug}`}
                  className="inline-flex h-10 items-center justify-center rounded-[5px] border-2 border-transparent bg-[#EEF5FC] px-4 text-[16px] font-semibold text-[#00205B] transition-colors hover:bg-[#00205B] hover:text-white"
                >
                  Se alle {courses.length} kurs i {constCity.name} <span aria-hidden="true">›</span>
                </Link>
              </div>
            )}
          </>
        ) : (
          <InfoBox title={`Ingen kurs i ${constCity.name} akkurat nå`}>
            Meld deg på venteliste hos en skole, eller{" "}
            <Link href="/sok" className="link-chevron">
              søk i hele Norge <span aria-hidden="true">›</span>
            </Link>
          </InfoBox>
        )}
      </section>
    </>
  );
}
