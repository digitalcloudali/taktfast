import Image from "next/image";
import Link from "next/link";
import { homeSections } from "@/lib/data";
import { DANCE_STYLES, CITIES, familyTint } from "@/lib/constants";
import { fmtNok, type CourseCardData, type NightCardData } from "@/lib/types";
import { CourseCard } from "@/components/course/course-card";
import { SectionHeader, InfoBox } from "@/components/site/ui-bits";
import { HeroSearch } from "@/components/home/hero-search";
import { CityImage } from "@/components/home/city-image";
import { SchoolCard } from "@/components/home/school-card";
import { CarouselRow } from "@/components/home/carousel-row";

export const revalidate = 120;

const GUIDES = [
  {
    title: "Hva koster dansekurs i Oslo?",
    excerpt:
      "Vi har sammenlignet priser fra 50 skoler: fra 1 290,- for et nybegynnerkurs til over 3 000,- for avanserte nivåer. Her er oversikten.",
    image: "/images/guide-priser.png",
  },
  {
    title: "Salsa eller bachata – hvilken passer deg?",
    excerpt:
      "Begge er latin, men temposet og stemningen er ulik. Test deg selv med vår lille guide før du velger kurs.",
    image: "/images/guide-salsa-eller-bachata.png",
  },
  {
    title: "Kan jeg gå på dansekurs alene?",
    excerpt:
      "Ja! Hver tredje deltaker kommer alene, og mange stiler krever ingen partner. Slik fungerer partnerrotasjon og «kom alene»-kurs.",
    image: "/images/guide-alene.png",
  },
];

export default async function Forside() {
  const { starterSnart, dropinUken, provetimer, populare, brudevals, kvelder } =
    await homeSections();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Taktfast",
        url: "https://taktfast.no",
        logo: "https://taktfast.no/images/og-image.png",
        description: "Norges uavhengige markedsplass for dansekurs hos verifiserte danseskoler.",
      },
      {
        "@type": "WebSite",
        name: "Taktfast",
        url: "https://taktfast.no",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://taktfast.no/sok?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---------- Hero ---------- */}
      <section className="relative h-[420px] w-full md:h-[520px]">
        <Image
          src="/images/hero-salsa-couple.png"
          alt="Dansende par i lys dansestudio"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </section>
      <div className="relative z-10 mx-auto -mt-24 w-full max-w-7xl px-4 md:-mt-36">
        <div className="max-w-xl rounded-md bg-white p-6 shadow-md">
          <h1>Finn dansekurset som får deg i takt</h1>
          <p className="mt-2 text-[17px] text-[#1A1A1A]">
            Salsa, brudevals, barnedans eller swing — sammenlign ledige kurs hos verifiserte
            danseskoler i hele Norge 💃
          </p>
          <HeroSearch />
        </div>
      </div>

      {/* ---------- Finn din dansestil ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title="Finn din dansestil"
          subtitle="17 stiler – fra karibisk salsa til rolig seniordans. Trykk på en stil for å se alle kurs."
          seeAllHref="/sok"
        />
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {DANCE_STYLES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/dansestiler/${s.slug}`}
                className="group flex h-full flex-col rounded-md p-3 transition-shadow hover:shadow-md"
                style={{ backgroundColor: familyTint(s.family) }}
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-white">
                  <Image
                    src={s.image}
                    alt={`${s.name} – dansestil`}
                    fill
                    sizes="(max-width: 1024px) 45vw, (max-width: 1280px) 24vw, 15vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="mt-3 text-[17px] leading-tight">{s.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[#6B6B6B]">{s.short}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Kurs som starter snart ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 md:pb-16">
        <SectionHeader
          title="Kurs som starter snart"
          subtitle="Sikre deg en plass før det er for sent."
          seeAllHref="/sok?ledig=1"
        />
        {starterSnart.length > 0 ? (
          <CarouselRow label="Kurs som starter snart">
            {starterSnart.map((c: CourseCardData) => (
              <div key={c.id} className="w-[272px] sm:w-[290px]">
                <CourseCard course={c} />
              </div>
            ))}
          </CarouselRow>
        ) : (
          <p className="text-[#6B6B6B]">Ingen kurs med startdato akkurat nå – se alle kurs i søket.</p>
        )}
      </section>

      {/* ---------- Drop-in denne uken ---------- */}
      <section className="bg-sky-pale py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            title="Drop-in denne uken"
            subtitle="Ingen påmelding nødvendig – møt opp og dans."
            seeAllHref="/sok?format=DROPIN"
          />
          {dropinUken.length > 0 ? (
            <CarouselRow label="Drop-in denne uken">
              {dropinUken.map((c: CourseCardData) => (
                <div key={c.id} className="w-[272px] sm:w-[290px]">
                  <CourseCard course={c} />
                </div>
              ))}
            </CarouselRow>
          ) : (
            <p className="text-[#6B6B6B]">Ingen drop-in-timer denne uken – finn kursrekker i søket.</p>
          )}
        </div>
      </section>

      {/* ---------- Prøvetime & åpen uke ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title="Prøvetime & åpen uke"
          subtitle="Prøv dansen før du bestemmer deg – mange skoler holder åpent hus."
        />
        <InfoBox
          title="Prøvetime 100,- som krediteres når du kjøper kurset"
          className="mb-6 max-w-2xl"
        >
          Meld deg på en prøvetime, og får du kjøpt kurset hos skolen etterpå, trekkes de 100
          kronene fra kursprisen.
        </InfoBox>
        {provetimer.length > 0 ? (
          <CarouselRow label="Prøvetimer og åpen uke">
            {provetimer.map((c: CourseCardData) => (
              <div key={c.id} className="w-[272px] sm:w-[290px]">
                <CourseCard course={c} />
              </div>
            ))}
          </CarouselRow>
        ) : (
          <p className="text-[#6B6B6B]">Ingen planlagte prøvetimer akkurat nå.</p>
        )}
      </section>

      {/* ---------- Populære danseskoler ---------- */}
      <section className="bg-sky-pale py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            title="Populære danseskoler"
            subtitle="Skoler med flest og beste vurderinger fra deltakere."
            seeAllHref="/danseskoler"
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {populare.map((s) => (
              <li key={s.id}>
                <SchoolCard school={s} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Brudevals-pakker ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title="Brudevals-pakker"
          subtitle="Deres første dans – ferdige pakker med instruktør, koreografi og god tid til å øve."
          seeAllHref="/bryllupsdans"
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {brudevals.slice(0, 3).map((p) => (
            <li key={p.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white">
                <div
                  className="h-2 w-full"
                  style={{ backgroundColor: "#FDF6D8" }}
                  aria-hidden="true"
                />
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h3 className="text-lg leading-tight">{p.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">
                    {p.schoolName} · {p.city}
                  </p>
                  <p className="text-sm text-[#1A1A1A]">
                    {p.sessions} ganger à {p.durationMin} min
                  </p>
                  <p className="mt-1 text-xl font-bold text-navy">
                    {fmtNok(p.price)}{" "}
                    <span className="text-sm font-medium text-[#6B6B6B]">per par</span>
                  </p>
                  <Link
                    href="/bryllupsdans"
                    className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-[5px] border-2 border-transparent bg-[#00205B] px-4 text-[16px] font-semibold text-white transition-colors hover:border-[#00205B] hover:bg-white hover:text-[#00205B]"
                  >
                    Se bryllupspakker
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Dansekvelder i helgen ---------- */}
      <section className="bg-sky-pale py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            title="Dansekvelder i helgen"
            subtitle="Sosialdans, nybegynnertimer og fest hos skoler nær deg."
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kvelder.map((n: NightCardData) => (
              <li key={n.id}>
                <Link
                  href={`/dansekveld/${n.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#F2F2F2]">
                    <Image
                      src={n.imageUrl}
                      alt={n.title}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <h3 className="text-[17px] leading-snug">{n.title}</h3>
                    <p className="text-sm text-[#6B6B6B]">
                      {n.schoolName} · {n.city}
                    </p>
                    <p className="text-sm font-semibold capitalize text-navy">
                      {new Date(n.date).toLocaleDateString("nb-NO", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}{" "}
                      · kl. {n.startTime}
                    </p>
                    {n.freeBeginnerClass && (
                      <span className="inline-flex w-fit items-center rounded-full bg-[#EB5986] px-2.5 py-0.5 text-xs font-semibold text-white">
                        Gratis nybegynnertime
                      </span>
                    )}
                    <p className="mt-auto pt-1 text-lg font-bold text-navy">
                      {n.price === 0 ? "Gratis" : fmtNok(n.price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- For danseskoler (navy) ---------- */}
      <section className="navy-block w-full">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-16">
          <div>
            <h2>Driver du danseskole?</h2>
            <p className="mt-3 max-w-lg text-white/85">
              Fyll tomme kursplasser og nå dansere i hele Norge. Legg ut kursene dine på Taktfast —
              dere holder styr på timene, vi bringer deltakerne. Gratis å komme i gang, og du
              betaler bare når noen melder seg på.
            </p>
            <Link
              href="/for-danseskoler"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-[5px] border-2 border-white bg-white px-4 text-[16px] font-semibold text-[#00205B] transition-colors hover:border-[#00205B] hover:bg-[#00205B] hover:text-white"
            >
              Bli partner <span aria-hidden="true">›</span>
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md">
            <Image
              src="/images/for-skoler-instructor.png"
              alt="Instruktør som underviser i dansestudio"
              fill
              sizes="(max-width: 768px) 92vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- Tips og råd ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title="Tips og råd"
          subtitle="Bli klokere før du velger kurs – guider skrevet av dansere, for dansere."
          seeAllHref="/tips-og-rad"
        />
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {GUIDES.map((g) => (
            <li key={g.title}>
              <Link
                href="/tips-og-rad"
                className="group flex h-full flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F2]">
                  <Image
                    src={g.image}
                    alt={g.title}
                    fill
                    sizes="(max-width: 768px) 92vw, 32vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-lg leading-snug">{g.title}</h3>
                  <p className="line-clamp-3 text-sm text-[#6B6B6B]">{g.excerpt}</p>
                  <span className="link-chevron mt-auto text-[15px]">
                    Les artikkelen <span aria-hidden="true">›</span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Byer ---------- */}
      <section className="bg-sky-pale py-12 md:py-16">
        <div className="mx-auto w-full max-w-7xl px-4">
          <SectionHeader
            title="Dansekurs i hele Norge"
            subtitle="Finn kurs i byen din – vi dekker store og små steder fra Kristiansand til Tromsø."
          />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/by/${c.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-md border border-[#CCD2DE] bg-white">
                    <CityImage
                      slug={c.slug}
                      name={c.name}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <h3 className="mt-2 text-[17px] leading-tight">{c.name}</h3>
                  <p className="text-sm text-[#6B6B6B]">{c.county}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
