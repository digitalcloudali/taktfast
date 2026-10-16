import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ChevronRight, User, Users, CalendarDays, Shirt, GraduationCap } from "lucide-react";
import { getCourseDetail } from "@/lib/data";
import { styleName, styleFamily, familyTint, levelLabel, ageLabel, formatLabel, PROVETIME_CREDIT } from "@/lib/constants";
import { fmtNok } from "@/lib/types";
import { Stars, RoleBalanceBar, Ribbon, StyleChip, InfoBox } from "@/components/site/ui-bits";
import { CourseCard } from "@/components/course/course-card";
import { BookingWidget, type BookingCourse } from "@/components/booking/booking-widget";
import { WaitlistButton } from "@/components/course/waitlist-button";
import { Progress } from "@/components/ui/progress";

type PageProps = { params: Promise<{ slug: string }> };
type CourseDetail = NonNullable<Awaited<ReturnType<typeof getCourseDetail>>>;

const SITE_URL = "https://taktfast.no";

function dateLabel(date: Date, startTime: string): string {
  return `${date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })} kl. ${startTime}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCourseDetail(slug);
  if (!data) return { title: "Fant ikke kurset" };
  const { course } = data;
  const description = course.description.length > 155 ? `${course.description.slice(0, 152)}…` : course.description;
  return {
    title: course.title,
    description,
    alternates: { canonical: `/kurs/${course.slug}` },
    openGraph: {
      title: `${course.title} – ${course.school.name}`,
      description,
      images: [{ url: course.imageUrl, alt: course.title }],
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCourseDetail(slug);
  if (!data) notFound();
  const { course, seats, ribbons, reviews, waitlistCount, related } = data;
  const { school, instructor } = course;

  const tint = familyTint(styleFamily(course.styleSlug));
  const fullAddress = `${school.address}, ${school.postalCode} ${school.city}`;
  const provetimeKind: BookingCourse["kind"] =
    course.format === "PRIVATTIME"
      ? "PRIVATTIME"
      : course.format === "PROVETIME"
        ? "PROVETIME"
        : course.format === "DROPIN"
          ? "DROPIN"
          : "KURS";

  const widgetCourse: BookingCourse = {
    id: course.id,
    title: course.title,
    kind: provetimeKind,
    isPartner: course.unit === "PAR",
    komAlene: course.komAlene,
    price: course.price,
    studentPrice: course.studentPrice,
    seniorPrice: course.seniorPrice,
    pricePer: course.pricePer,
    dropInPrice: course.dropInPrice,
    forereFree: seats.forereFree,
    folgereFree: seats.folgereFree,
    seatsLeft: seats.seatsLeft,
    dates: course.dates.map((d) => ({ id: d.id, dateISO: d.date.toISOString(), startTime: d.startTime })),
  };

  const firstDate = course.dates[0];
  const pctLeft = seats.capacitySeats > 0 ? Math.round((seats.seatsLeft / seats.capacitySeats) * 100) : 0;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Course",
      name: course.title,
      description: course.description,
      inLanguage: "nb-NO",
      ...(course.ratingCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: course.ratingAvg.toFixed(1),
              reviewCount: course.ratingCount,
            },
          }
        : {}),
      provider: {
        "@type": "Organization",
        name: school.name,
        url: `${SITE_URL}/danseskoler/${school.slug}`,
      },
      ...(instructor ? { instructor: { "@type": "Person", name: instructor.name } } : {}),
      offers: {
        "@type": "Offer",
        price: course.price,
        priceCurrency: "NOK",
        availability: seats.isFull ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
        url: `${SITE_URL}/kurs/${course.slug}`,
      },
      hasCourseInstance: firstDate
        ? [
            {
              "@type": "CourseInstance",
              courseMode: "onsite",
              startDate: firstDate.date.toISOString(),
              location: {
                "@type": "Place",
                name: school.name,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: school.address,
                  postalCode: school.postalCode,
                  addressLocality: school.city,
                  addressCountry: "NO",
                },
              },
            },
          ]
        : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Forside", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: styleName(course.styleSlug), item: `${SITE_URL}/stiler/${course.styleSlug}` },
        { "@type": "ListItem", position: 3, name: course.title, item: `${SITE_URL}/kurs/${course.slug}` },
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      {/* Brødsmulesti */}
      <nav aria-label="Brødsmulesti" className="mb-4 text-sm text-[#6B6B6B]">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="font-semibold text-navy hover:underline">Forside</Link>
          </li>
          <li aria-hidden="true" className="flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5" /> </li>
          <li>
            <Link href={`/stiler/${course.styleSlug}`} className="font-semibold text-navy hover:underline">
              {styleName(course.styleSlug)}
            </Link>
          </li>
          <li aria-hidden="true" className="flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5" /> </li>
          <li aria-current="page" className="font-semibold text-[#1A1A1A]">{course.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Hovedinnhold */}
        <div className="min-w-0 lg:col-span-2">
          <header>
            <h1 className="text-balance">{course.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StyleChip name={styleName(course.styleSlug)} tint={tint} />
              <span className="rounded-full border border-[#CCD2DE] px-2.5 py-0.5 text-xs font-semibold text-navy">
                {levelLabel(course.level)}
              </span>
              {course.ageGroup !== "VOKSEN" && (
                <span className="rounded-full border border-[#CCD2DE] px-2.5 py-0.5 text-xs font-semibold text-navy">
                  {ageLabel(course.ageGroup)}
                </span>
              )}
            </div>

            {ribbons.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ribbons.map((r) => (
                  <Ribbon key={r} kind={r} />
                ))}
              </div>
            )}

            <p className="mt-3 inline-flex flex-wrap items-center gap-1.5 text-[15px] text-[#1A1A1A]">
              <Link
                href={`/danseskoler/${school.slug}`}
                className="font-semibold text-navy hover:underline"
              >
                Hos {school.name}
              </Link>
              <span className="text-[#6B6B6B]">·</span>
              <span className="inline-flex items-center gap-1 text-[#6B6B6B]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {school.district ? `${school.district}, ` : ""}{school.city}
              </span>
            </p>
          </header>

          <div className="relative mt-5 aspect-[16/9] w-full overflow-hidden rounded-md bg-[#F2F2F2]">
            <Image
              src={course.imageUrl}
              alt={`${course.title} – ${styleName(course.styleSlug)} hos ${school.name}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </div>

          <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-[#1A1A1A]">{course.description}</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoBox title="Dette lærer du" className="h-full">
              <p className="whitespace-pre-line">{course.learnWhat}</p>
            </InfoBox>
            <InfoBox title="Påkledning og sko" className="h-full">
              <p className="whitespace-pre-line">{course.clothing}</p>
            </InfoBox>
          </div>

          {/* Alle datoene */}
          <section aria-labelledby="datoer-tittel" className="mt-8">
            <h2 id="datoer-tittel" className="font-display text-xl font-bold text-navy">Alle datoene</h2>
            {course.dates.length > 0 ? (
              <ul className="mt-3 divide-y divide-[#CCD2DE] rounded-md border border-[#CCD2DE]">
                {course.dates.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${d.status === "AVLYST" ? "bg-signal" : "bg-navy"}`}
                    />
                    <span className={d.status === "AVLYST" ? "text-[#6B6B6B] line-through" : "text-[#1A1A1A]"}>
                      {dateLabel(d.date, d.startTime)}
                    </span>
                    {d.status === "AVLYST" && (
                      <span className="ml-auto rounded-[4px] bg-[#D6001C] px-2 py-0.5 text-xs font-bold text-white">Avlyst</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#6B6B6B]">Datoene for dette kurset blir annonsert snart.</p>
            )}
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#6B6B6B]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Alle timene varer {course.durationMin} minutter.
            </p>
          </section>

          {/* Ledige plasser */}
          <section aria-labelledby="plasser-tittel" className="mt-8">
            <h2 id="plasser-tittel" className="font-display text-xl font-bold text-navy">Ledige plasser</h2>
            {seats.isPartner ? (
              <div className="mt-3 rounded-md border border-[#CCD2DE] bg-white p-4">
                <RoleBalanceBar forereFree={seats.forereFree} folgereFree={seats.folgereFree} />
                <p className="mt-2 text-xs text-[#6B6B6B]">Balansen mellom førere og følgere kan avvike maks 2.</p>
                {waitlistCount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-navy">{waitlistCount} står på venteliste</p>
                )}
              </div>
            ) : (
              <div className="mt-3 rounded-md border border-[#CCD2DE] bg-white p-4">
                {seats.seatsLeft > 0 ? (
                  <>
                    <p className="text-sm font-semibold text-[#1C3F78]">
                      {seats.seatsLeft} av {seats.capacitySeats} plasser ledige
                    </p>
                    <Progress value={pctLeft} className="mt-2 h-2" aria-label={`${pctLeft} prosent av plassene ledige`} />
                  </>
                ) : (
                  <p className="text-sm font-semibold text-signal">
                    Fullt – 0 av {seats.capacitySeats} plasser ledige. Still deg i kø på venteliste.
                  </p>
                )}
                {waitlistCount > 0 && (
                  <p className="mt-2 text-xs font-semibold text-navy">{waitlistCount} står på venteliste</p>
                )}
              </div>
            )}
          </section>

          {/* Priser */}
          <section aria-labelledby="priser-tittel" className="mt-8">
            <h2 id="priser-tittel" className="font-display text-xl font-bold text-navy">Priser</h2>
            <div className="mt-3 rounded-md border border-[#CCD2DE] bg-sky-pale p-4">
              <p className="font-display text-2xl font-extrabold text-navy">
                {fmtNok(course.price)}
                <span className="ml-1 text-sm font-semibold text-[#6B6B6B]">
                  {course.pricePer === "PAR" ? "per par" : "per person"}
                </span>
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-[#1A1A1A]">
                {course.studentPrice != null && (
                  <li className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-navy" aria-hidden="true" />
                    Studentpris: <strong>{fmtNok(course.studentPrice)}</strong> (gyldig studentbevis)
                  </li>
                )}
                {course.seniorPrice != null && (
                  <li className="flex items-center gap-2">
                    <User className="h-4 w-4 text-navy" aria-hidden="true" />
                    Honnørpris 60+: <strong>{fmtNok(course.seniorPrice)}</strong>
                  </li>
                )}
                {course.dropInPrice != null && (
                  <li className="flex items-center gap-2">
                    <span className="rounded-[4px] bg-[#8BB8E8] px-2 py-0.5 text-xs font-bold text-navy">Drop-in mulig</span>
                    {fmtNok(course.dropInPrice)} per gang
                  </li>
                )}
                {course.format !== "KURSREKKE" && (
                  <li className="text-[#6B6B6B]">Format: {formatLabel(course.format)}</li>
                )}
              </ul>
              <p className="mt-3 border-t border-[#CCD2DE] pt-2 text-xs text-[#6B6B6B]">
                Prøvetime {PROVETIME_CREDIT},- krediteres ved kjøp av kursrekke hos samme skole.
              </p>
            </div>
          </section>

          {/* Anmeldelser for kurset */}
          {reviews.length > 0 && (
            <section aria-labelledby="kursanmeldelser-tittel" className="mt-8">
              <h2 id="kursanmeldelser-tittel" className="font-display text-xl font-bold text-navy">Anmeldelser for kurset</h2>
              <div className="mt-3 grid gap-4 max-h-96 overflow-y-auto nice-scroll pr-1 sm:grid-cols-2">
                {reviews.map((r) => (
                  <article key={r.id} className="rounded-md border border-[#CCD2DE] bg-white p-4">
                    <Stars value={r.rating} />
                    <p className="mt-2 text-sm leading-relaxed text-[#1A1A1A]">«{r.text}»</p>
                    <p className="mt-3 text-xs font-semibold text-navy">
                      {r.authorName}
                      <span className="ml-2 font-normal text-[#6B6B6B]">
                        {r.createdAt.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </p>
                    {r.reply && (
                      <div className="mt-3 rounded-md bg-sky-pale p-3">
                        <p className="text-xs font-bold text-navy">Svar fra skolen</p>
                        <p className="mt-1 text-sm leading-relaxed text-[#1A1A1A]">{r.reply}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Instruktør */}
          {instructor && (
            <section aria-labelledby="instruktor-tittel" className="mt-8">
              <h2 id="instruktor-tittel" className="font-display text-xl font-bold text-navy">Instruktøren din</h2>
              <article className="mt-3 flex flex-col gap-4 rounded-md border border-[#CCD2DE] bg-white p-4 sm:flex-row">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#F2F2F2]">
                  <Image
                    src={instructor.imageUrl}
                    alt={`Instruktør ${instructor.name} ved ${school.name}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-navy">{instructor.name}</h3>
                  {instructor.since != null && (
                    <p className="text-xs font-semibold text-[#6B6B6B]">Underviser siden {instructor.since}</p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-[#1A1A1A]">{instructor.bio}</p>
                  <Link href={`/danseskoler/${school.slug}`} className="link-chevron mt-2 inline-flex text-sm">
                    Se alle kurs hos {school.name} <span aria-hidden="true">›</span>
                  </Link>
                </div>
              </article>
            </section>
          )}

          {/* Andre kurs hos samme skole */}
          {related.length > 0 && (
            <section aria-labelledby="relaterte-tittel" className="mt-10">
              <h2 id="relaterte-tittel" className="font-display text-xl font-bold text-navy">Andre kurs hos samme skole</h2>
              <div className="snap-row mt-3 pb-2">
                {related.map((c) => (
                  <div key={c.id} className="w-[260px] sm:w-[280px]">
                    <CourseCard course={c} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: booking */}
        <aside className="self-start lg:sticky lg:top-24" aria-label="Påmelding">
          <div className="space-y-4">
            {seats.isFull && !seats.isPartner && (
              <InfoBox title="Fullt — still deg i kø">
                <p>
                  Alle {seats.capacitySeats} plassene er tatt. Registrer deg på ventelisten, så varsler vi deg
                  hvis en plass blir ledig.
                </p>
              </InfoBox>
            )}
            <BookingWidget course={widgetCourse} />
            {seats.isFull && !seats.isPartner && (
              <WaitlistButton courseId={course.id} courseSlug={course.slug} courseTitle={course.title} />
            )}
            <p className="flex items-start gap-2 text-xs text-[#6B6B6B]">
              <Shirt className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Usikker på påkledning? Se «Påkledning og sko» eller send spørsmål til skolen.
            </p>
            <p className="flex items-start gap-2 text-xs text-[#6B6B6B]">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {course.komAlene
                ? "Kom alene — skolen balanserer førere og følgere og bytter partnere gjennom timen."
                : "Meld deg på sammen med en venn, eller still deg i kø for en partner."}
            </p>
          </div>
        </aside>
      </div>

      {/* Strukturerte data (udefinerte nøkler utelates automatisk av JSON.stringify) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
