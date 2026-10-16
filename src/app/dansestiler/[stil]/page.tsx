import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { DANCE_STYLES, familyLabel, familyTint, cityBySlug } from "@/lib/constants";
import { getStyleDetail } from "@/lib/data";
import { CourseCard } from "@/components/course/course-card";
import { SectionHeader, StyleChip } from "@/components/site/ui-bits";

export const revalidate = 300;

type Props = { params: Promise<{ stil: string }> };

export function generateStaticParams() {
  return DANCE_STYLES.map((s) => ({ stil: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stil } = await params;
  const style = DANCE_STYLES.find((s) => s.slug === stil);
  if (!style) return { title: "Dansestil finnes ikke" };
  return {
    title: `${style.name} kurs – finn dansekurs i ${style.name.toLowerCase()}`,
    description: style.short,
    alternates: { canonical: `/dansestiler/${style.slug}` },
  };
}

export default async function StilSide({ params }: Props) {
  const { stil } = await params;
  const detail = await getStyleDetail(stil);
  if (!detail) notFound();

  const { style, courses, citiesWith } = detail;
  const aleneNavn = style.name.toLowerCase();

  const faq = [
    {
      q: `Kan jeg komme alene på ${aleneNavn}-kurs?`,
      a: style.komAlene
        ? `Ja! På ${aleneNavn}-kurs er det helt normalt å komme alene — de fleste deltakere gjør det. Skolene roterer partnerne gjennom timen, så du møter nye dansere og lærer raskere. Velg «kom alene»-filteret i søket for å se kurs med garantert plass til enkeltdeltakere.`
        : `${style.name} er en stil der dere som regel danser fast to og to, så her anbefaler vi å melde dere på som par. Enkelte skoler kan likevel finne partner til deg — se «kom alene»-filtret i søket.`,
    },
    {
      q: `Hva koster ${aleneNavn}-kurs?`,
      a: `Prisene varierer med skole, by og nivå — typisk mellom 1 200 og 2 600 kroner for en kursrekke per person, og fra 100 kroner for drop-in og prøvetimer. Alle priser på Taktfast vises tydelig før du booker, uten skjulte gebyrer.`,
    },
    {
      q: `Hvor finner jeg ${aleneNavn}-kurs i nærheten av meg?`,
      a: courses.length > 0
        ? `${style.name} tilbys av verifiserte danseskoler i ${citiesWith.length} ${citiesWith.length === 1 ? "by" : "byer"} — se liste under «Populært i byene». Velg byen din for å se tidspunkter, priser og ledige plasser.`
        : `Ingen kurs i ${style.name.toLowerCase()} er lagt ut akkurat nå — bruk søket og meld deg på venteliste, så varsler vi deg når et nytt kurs åpner.`,
    },
    {
      q: `Hva skal jeg ha på meg til ${aleneNavn}-kurs?`,
      a: `Bruk komfortable klær du kan bevege deg fritt i, og rene innendørssko med myk såle — eller dedikerte dansesko. Ta med litt å drikke. Mange skoler har skoleanlegg med garderobe, og enkelte tilbyr leie av dansesko.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ---------- Hero-band ---------- */}
      <section className="border-b border-[#CCD2DE] bg-sky-pale">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:py-14">
          <div>
            <nav aria-label="Sti" className="mb-3 text-sm text-[#6B6B6B]">
              <Link href="/" className="hover:underline">
                Hjem
              </Link>{" "}
              › <span className="text-[#1A1A1A]">{style.name} kurs</span>
            </nav>
            <h1>{style.name} kurs</h1>
            <p className="mt-3 max-w-xl text-[17px] text-[#1A1A1A]">{style.long}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {style.komAlene && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EB5986] px-3 py-1 text-xs font-semibold text-white">
                  <Users className="h-3.5 w-3.5" aria-hidden="true" /> Kan danse alene
                </span>
              )}
              <StyleChip name={familyLabel(style.family)} tint={familyTint(style.family)} />
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src={style.image}
              alt={`${style.name} – dansestil hos Taktfast`}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- Kurs ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title={`Alle ${style.name.toLowerCase()}-kurs`}
          subtitle={
            courses.length > 0
              ? `${courses.length} kurs hos verifiserte danseskoler – sortert etter startdato.`
              : undefined
          }
          seeAllHref={`/sok?stil=${style.slug}`}
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
          <p className="rounded-md border border-[#CCD2DE] bg-sky-pale p-6 text-[#1A1A1A]">
            Ingen {aleneNavn}-kurs er lagt ut akkurat nå.{" "}
            <Link href="/sok" className="link-chevron">
              Se alle andre kurs <span aria-hidden="true">›</span>
            </Link>
          </p>
        )}
      </section>

      {/* ---------- Populært i byene ---------- */}
      {citiesWith.length > 0 && (
        <section className="bg-sky-pale py-12 md:py-16">
          <div className="mx-auto w-full max-w-7xl px-4">
            <SectionHeader
              title="Populært i byene"
              subtitle={`Velg byen din for å se ${aleneNavn}-kurs med tidspunkter og ledige plasser.`}
            />
            <ul className="flex flex-wrap gap-2">
              {citiesWith.map((citySlug) => {
                const city = cityBySlug(citySlug);
                return (
                  <li key={citySlug}>
                    <Link href={`/by/${citySlug}/${style.slug}`}>
                      <StyleChip
                        name={`${city?.name ?? citySlug} (${style.name})`}
                        tint={familyTint(style.family)}
                        className="px-3 py-1.5 text-sm transition-transform hover:scale-[1.03]"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
        <SectionHeader title="Ofte stilte spørsmål" subtitle={`Svar på det vanligste om ${aleneNavn}-kurs på Taktfast.`} />
        <div className="space-y-3">
          {faq.map((f) => (
            <details
              key={f.q}
              className="group rounded-md border border-[#CCD2DE] bg-white p-4 open:shadow-sm"
            >
              <summary className="cursor-pointer list-none font-display text-[17px] font-bold text-navy marker:hidden">
                <span className="flex items-center justify-between gap-3">
                  {f.q}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl leading-none transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-[#1A1A1A]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
