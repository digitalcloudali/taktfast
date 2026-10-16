import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DANCE_STYLES, cityBySlug, styleName, styleFamily, familyTint } from "@/lib/constants";
import { getCityDetail } from "@/lib/data";
import { CourseCard } from "@/components/course/course-card";
import { SchoolCard } from "@/components/home/school-card";
import { SectionHeader, StyleChip } from "@/components/site/ui-bits";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string; stil: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, stil } = await params;
  const city = cityBySlug(slug);
  const style = DANCE_STYLES.find((s) => s.slug === stil);
  if (!city || !style) return { title: "Siden finnes ikke" };
  return {
    title: `${style.name} kurs i ${city.name} – ledige plasser`,
    description: `${style.short} Se alle ${style.name.toLowerCase()}-kurs i ${city.name} hos verifiserte danseskoler.`,
    alternates: { canonical: `/by/${city.slug}/${style.slug}` },
  };
}

export default async function ByStilSide({ params }: Props) {
  const { slug, stil } = await params;
  const constCity = cityBySlug(slug);
  const style = DANCE_STYLES.find((s) => s.slug === stil);
  if (!constCity || !style) notFound();

  const detail = await getCityDetail(slug, stil);
  if (!detail?.city) notFound();

  const { courses, schools, styleCounts } = detail;
  const skolerMedStil = schools.filter((s) => s.styles.includes(stil));
  const andreStiler = [...styleCounts]
    .sort((a, b) => b._count - a._count)
    .filter((g) => g.styleSlug !== stil)
    .slice(0, 10);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: "https://taktfast.no" },
      {
        "@type": "ListItem",
        position: 2,
        name: `Dansekurs i ${constCity.name}`,
        item: `https://taktfast.no/by/${constCity.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${style.name} kurs i ${constCity.name}`,
        item: `https://taktfast.no/by/${constCity.slug}/${style.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ---------- Topp ---------- */}
      <section className="border-b border-[#CCD2DE] bg-sky-pale">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <nav aria-label="Sti" className="mb-3 text-sm text-[#6B6B6B]">
            <Link href="/" className="hover:underline">
              Hjem
            </Link>{" "}
            ›{" "}
            <Link href={`/by/${constCity.slug}`} className="hover:underline">
              Dansekurs i {constCity.name}
            </Link>{" "}
            › <span className="text-[#1A1A1A]">{style.name} kurs</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-navy"
              style={{ backgroundColor: familyTint(style.family) }}
            >
              {style.name}
            </span>
            {style.komAlene && (
              <span className="inline-flex items-center rounded-full bg-[#EB5986] px-3 py-1 text-xs font-semibold text-white">
                Kan danse alene
              </span>
            )}
          </div>
          <h1 className="mt-3">
            {style.name} kurs i {constCity.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[17px] text-[#1A1A1A]">{style.long}</p>
        </div>
      </section>

      {/* ---------- Kurs ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title={`${style.name} kurs i ${constCity.name}`}
          subtitle={
            courses.length > 0
              ? `${courses.length} kurs hos verifiserte danseskoler i ${constCity.name}.`
              : undefined
          }
          seeAllHref={`/sok?stil=${style.slug}&by=${constCity.slug}`}
        />
        {courses.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-[#CCD2DE] bg-sky-pale p-6">
            <p className="font-display font-bold text-navy">
              Ingen {style.name.toLowerCase()}-kurs i {constCity.name} akkurat nå
            </p>
            <p className="mt-1 text-sm text-[#1A1A1A]">
              Se kurs i andre byer, eller meld deg på venteliste når du finner et passende kurs –
              så varsler vi deg når nye plasser åpner.
            </p>
            <Link
              href={`/dansestiler/${style.slug}`}
              className="link-chevron mt-3 inline-block text-[15px]"
            >
              Se alle {style.name.toLowerCase()}-kurs i Norge <span aria-hidden="true">›</span>
            </Link>
          </div>
        )}
      </section>

      {/* ---------- Skoler som tilbyr stilen ---------- */}
      {skolerMedStil.length > 0 && (
        <section className="bg-sky-pale py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4">
            <SectionHeader
              title={`Danseskoler i ${constCity.name} med ${style.name.toLowerCase()}`}
            />
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {skolerMedStil.map((s) => (
                <li key={s.id}>
                  <SchoolCard school={s} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- Andre stiler i byen ---------- */}
      {andreStiler.length > 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
          <SectionHeader
            title={`Andre dansestiler i ${constCity.name}`}
            seeAllHref={`/by/${constCity.slug}`}
          />
          <ul className="flex flex-wrap gap-2">
            {andreStiler.map((g) => (
              <li key={g.styleSlug}>
                <Link href={`/by/${constCity.slug}/${g.styleSlug}`}>
                  <StyleChip
                    name={`${styleName(g.styleSlug)} (${g._count})`}
                    tint={familyTint(styleFamily(g.styleSlug))}
                    className="px-3 py-1.5 text-sm transition-transform hover:scale-[1.03]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
