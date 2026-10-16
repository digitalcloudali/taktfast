import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Check, MapPin, Phone, Mail, Globe, ChevronRight } from "lucide-react";
import { getSchoolDetail } from "@/lib/data";
import type { SeatCounts } from "@/lib/seats";
import {
  weekdayName,
  levelLabel,
  formatLabel,
  styleName,
  styleFamily,
  familyTint,
  PROVETIME_CREDIT,
} from "@/lib/constants";
import { fmtNok } from "@/lib/types";
import { Stars, RoleBalanceBar, StyleChip, InfoBox } from "@/components/site/ui-bits";
import { SchoolMapWrapper } from "@/components/school/school-map-wrapper";
import { ContactForm } from "@/components/school/contact-form";

type PageProps = { params: Promise<{ slug: string }> };
type SchoolDetail = NonNullable<Awaited<ReturnType<typeof getSchoolDetail>>>;
type SchoolCourse = SchoolDetail["courses"][number];
type SchoolReview = SchoolDetail["school"]["reviews"][number];

const SITE_URL = "https://taktfast.no";

function jsonArr(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSchoolDetail(slug);
  if (!data) return { title: "Fant ikke skolen" };
  const { school } = data;
  return {
    title: `${school.name} – dansekurs i ${school.city}`,
    description: school.tagline,
    alternates: { canonical: `/danseskoler/${school.slug}` },
    openGraph: {
      title: `${school.name} – dansekurs i ${school.city}`,
      description: school.tagline,
      images: [{ url: school.coverImage, alt: `${school.name} – dansestudio i ${school.city}` }],
    },
  };
}

export default async function SchoolPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getSchoolDetail(slug);
  if (!data) notFound();
  const { school, seatsMap, courses } = data;

  const gallery = jsonArr(school.gallery).slice(0, 4);
  const amenities = jsonArr(school.amenities);
  const schoolStyles = jsonArr(school.styles);
  const fullAddress = `${school.address}, ${school.postalCode} ${school.city}`;

  // Grupper timeplan etter ukedag
  const weekdays = [...new Set(courses.map((c) => c.weekday))].sort((a, b) => a - b);
  const byWeekday = new Map<number, SchoolCourse[]>();
  for (const c of courses) {
    const list = byWeekday.get(c.weekday) ?? [];
    list.push(c);
    byWeekday.set(c.weekday, list);
  }

  // Priser avledet fra kursene
  const kursrekker = courses.filter((c) => c.format === "KURSREKKE");
  const kursrekkeFra = kursrekker.length > 0 ? Math.min(...kursrekker.map((c) => c.price)) : null;
  const dropinPriser = courses.filter((c) => c.dropInPrice != null).map((c) => c.dropInPrice as number);
  const dropinFra = dropinPriser.length > 0 ? Math.min(...dropinPriser) : null;
  const studentPriser = courses.filter((c) => c.studentPrice != null).map((c) => c.studentPrice as number);
  const studentFra = studentPriser.length > 0 ? Math.min(...studentPriser) : null;
  const privattimer = courses.filter((c) => c.format === "PRIVATTIME");
  const privatFra = privattimer.length > 0 ? Math.min(...privattimer.map((c) => c.price)) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["DanceSchool", "LocalBusiness"],
    name: school.name,
    description: school.tagline,
    url: `${SITE_URL}/danseskoler/${school.slug}`,
    image: `${SITE_URL}${school.coverImage}`,
    telephone: school.phone,
    email: school.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address,
      postalCode: school.postalCode,
      addressLocality: school.city,
      addressCountry: "NO",
    },
    geo: { "@type": "GeoCoordinates", latitude: school.lat, longitude: school.lng },
    openingHours: "17:00-22:00",
    ...(school.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: school.ratingAvg.toFixed(1),
            reviewCount: school.ratingCount,
          },
        }
      : {}),
  };

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
            <Link href={`/byer/${school.citySlug}`} className="font-semibold text-navy hover:underline">
              Dansekurs i {school.city}
            </Link>
          </li>
          <li aria-hidden="true" className="flex items-center gap-1"><ChevronRight className="h-3.5 w-3.5" /> </li>
          <li aria-current="page" className="font-semibold text-[#1A1A1A]">{school.name}</li>
        </ol>
      </nav>

      {/* Hero: bilde + overlappende infokort */}
      <header>
        <div className="relative aspect-[16/6] w-full overflow-hidden rounded-md bg-[#F2F2F2]">
          <Image
            src={school.coverImage}
            alt={`${school.name} – dansestudio i ${school.district ? `${school.district}, ` : ""}${school.city}`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto -mt-14 w-[96%] rounded-md border border-[#CCD2DE] bg-white p-5 shadow-lg sm:p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-balance">{school.name}</h1>
              <p className="mt-2 text-lg text-[#6B6B6B]">{school.tagline}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {school.verified && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-pale px-3 py-1 text-sm font-bold text-navy">
                    <BadgeCheck className="h-4 w-4 text-navy" aria-hidden="true" />
                    Verifisert skole
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]">
                  <MapPin className="h-4 w-4 text-navy" aria-hidden="true" />
                  {fullAddress}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Stars value={school.ratingAvg} count={school.ratingCount} />
              <div className="flex flex-wrap gap-1.5">
                {schoolStyles.map((s) => (
                  <StyleChip key={s} name={styleName(s)} tint={familyTint(styleFamily(s))} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Galleri */}
      {gallery.length > 0 && (
        <section aria-labelledby="galleri-tittel" className="mt-8">
          <h2 id="galleri-tittel" className="sr-only">Bildegalleri</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#CCD2DE] bg-[#F2F2F2]">
                <Image
                  src={src}
                  alt={`${school.name} – bilde ${i + 1} fra studioet`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Om skolen */}
      <section aria-labelledby="om-tittel" className="mt-12">
        <h2 id="om-tittel">Om skolen</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#1A1A1A]">{school.about}</p>
          <div>
            {amenities.length > 0 && (
              <ul className="grid gap-2 sm:grid-cols-2" aria-label="Fasiliteter">
                {amenities.map((a) => (
                  <li
                    key={a}
                    className="inline-flex items-center gap-2 rounded-md border border-[#CCD2DE] bg-sky-pale px-3 py-2 text-sm font-semibold text-navy"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[#1C3F78]" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Instruktører */}
      {school.instructors.length > 0 && (
        <section aria-labelledby="instruktorer-tittel" className="mt-12">
          <h2 id="instruktorer-tittel">Instruktører</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {school.instructors.map((inst) => {
              const styles = jsonArr(inst.styles);
              return (
                <article key={inst.id} className="flex h-full flex-col rounded-md border border-[#CCD2DE] bg-white p-4">
                  <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-full bg-[#F2F2F2]">
                    <Image
                      src={inst.imageUrl}
                      alt={`Instruktør ${inst.name} ved ${school.name}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-bold text-navy">{inst.name}</h3>
                  {inst.since != null && (
                    <p className="text-xs font-semibold text-[#6B6B6B]">Underviser siden {inst.since}</p>
                  )}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1A1A1A]">{inst.bio}</p>
                  {styles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {styles.map((s) => (
                        <StyleChip key={s} name={styleName(s)} tint={familyTint(styleFamily(s))} />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Studioer / salonger */}
      {school.studios.length > 0 && (
        <section aria-labelledby="studioer-tittel" className="mt-12">
          <h2 id="studioer-tittel">Studioer og salonger</h2>
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {school.studios.map((studio) => (
              <li key={studio.id} className="rounded-md border border-[#CCD2DE] bg-white p-4">
                <h3 className="font-display text-lg font-bold text-navy">{studio.name}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#1A1A1A]">{studio.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-[#CCD2DE] px-2.5 py-0.5 text-xs font-semibold text-navy">
                    Gulv: {studio.floorType}
                  </span>
                  {studio.dressingRooms && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-semibold text-navy">
                      <Check className="h-3 w-3" aria-hidden="true" /> Garderobe
                    </span>
                  )}
                  {studio.parking && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-semibold text-navy">
                      <Check className="h-3 w-3" aria-hidden="true" /> Parkering
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Timeplan per uke */}
      {courses.length > 0 && (
        <section aria-labelledby="timeplan-tittel" className="mt-12">
          <h2 id="timeplan-tittel">Timeplan per uke</h2>
          <p className="mt-1 text-[#6B6B6B]">Alle ukentlige timer hos {school.name}. Klikk på kurset for detaljer og påmelding.</p>
          <div className="mt-4 space-y-8">
            {weekdays.map((day) => (
              <div key={day}>
                <h3 className="mb-2 font-display text-xl font-bold text-navy">{cap(weekdayName(day))}</h3>
                <div className="overflow-x-auto rounded-md border border-[#CCD2DE]">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <caption className="sr-only">Timeplan {weekdayName(day)} hos {school.name}</caption>
                    <thead>
                      <tr className="bg-sky-pale text-left text-navy">
                        <th scope="col" className="px-3 py-2.5 font-bold">Tid</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Kurs</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Nivå</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Format</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Ledige plasser</th>
                        <th scope="col" className="px-3 py-2.5 font-bold">Pris</th>
                        <th scope="col" className="px-3 py-2.5 font-bold"><span className="sr-only">Påmelding</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(byWeekday.get(day) ?? []).map((c) => {
                        const seats: SeatCounts | undefined = seatsMap.get(c.id);
                        return (
                          <tr key={c.id} className="stripe-row border-t border-[#CCD2DE]">
                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-navy">{c.startTime}</td>
                            <td className="px-3 py-3">
                              <Link href={`/kurs/${c.slug}`} className="font-semibold text-navy hover:underline">
                                {c.title}
                              </Link>
                              {c.ageGroup !== "VOKSEN" && c.ageGroup !== "ALLE" && (
                                <span className="ml-2 text-xs text-[#6B6B6B]">(barn/ungdom)</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-[#1A1A1A]">{levelLabel(c.level)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-[#1A1A1A]">{formatLabel(c.format)}</td>
                            <td className="min-w-[190px] px-3 py-3">
                              {seats ? (
                                seats.isPartner ? (
                                  <RoleBalanceBar forereFree={seats.forereFree} folgereFree={seats.folgereFree} compact />
                                ) : seats.seatsLeft > 0 ? (
                                  <span className="text-xs font-semibold text-[#1C3F78]">{seats.seatsLeft} ledige plasser</span>
                                ) : (
                                  <span className="text-xs font-semibold text-signal">Fullt – venteliste</span>
                                )
                              ) : (
                                <span className="text-xs text-[#6B6B6B]">–</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 font-semibold text-navy">{fmtNok(c.price)}</td>
                            <td className="whitespace-nowrap px-3 py-3 text-right">
                              <Link href={`/kurs/${c.slug}`} className="link-chevron text-sm">
                                Meld deg på <span aria-hidden="true">›</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Priser */}
      <section aria-labelledby="priser-tittel" className="mt-12">
        <h2 id="priser-tittel">Priser</h2>
        <InfoBox className="mt-4 max-w-2xl">
          <dl className="divide-y divide-[#CCD2DE]">
            {kursrekkeFra != null && (
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-navy">Kursrekke</dt>
                <dd className="text-right">fra <strong>{fmtNok(kursrekkeFra)}</strong></dd>
              </div>
            )}
            {dropinFra != null && (
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-navy">Drop-in</dt>
                <dd className="text-right">fra <strong>{fmtNok(dropinFra)}</strong></dd>
              </div>
            )}
            {studentFra != null && (
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-navy">Studentpris</dt>
                <dd className="text-right">fra <strong>{fmtNok(studentFra)}</strong> (gyldig studentbevis)</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="font-semibold text-navy">Prøvetime</dt>
              <dd className="text-right"><strong>{PROVETIME_CREDIT},-</strong> (krediteres ved kurskjøp)</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="font-semibold text-navy">Klippekort</dt>
              <dd className="text-right">10 klipp <strong>1 690,-</strong></dd>
            </div>
            {privatFra != null && (
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="font-semibold text-navy">Privattime</dt>
                <dd className="text-right">fra <strong>{fmtNok(privatFra)}</strong></dd>
              </div>
            )}
          </dl>
          <p className="mt-2 text-xs text-[#6B6B6B]">
            Prøvetimen krediteres automatisk når du melder deg på en kursrekke hos samme skole.
          </p>
        </InfoBox>
      </section>

      {/* Anmeldelser */}
      {school.reviews.length > 0 && (
        <section aria-labelledby="anmeldelser-tittel" className="mt-12">
          <h2 id="anmeldelser-tittel">Anmeldelser</h2>
          <div className="mt-1 flex items-center gap-3">
            <Stars value={school.ratingAvg} count={school.ratingCount} />
            <span className="text-sm text-[#6B6B6B]">basert på {school.ratingCount} vurderinger</span>
          </div>
          <div className="mt-4 grid max-h-96 gap-4 overflow-y-auto nice-scroll pr-1 md:grid-cols-2">
            {school.reviews.map((r: SchoolReview) => (
              <article key={r.id} className="flex h-full flex-col rounded-md border border-[#CCD2DE] bg-white p-4">
                <Stars value={r.rating} />
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#1A1A1A]">«{r.text}»</p>
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

      {/* Kart */}
      <section aria-labelledby="kart-tittel" className="mt-12">
        <h2 id="kart-tittel">Finn oss</h2>
        <p className="mt-1 mb-4 inline-flex items-center gap-1.5 text-sm text-[#1A1A1A]">
          <MapPin className="h-4 w-4 text-navy" aria-hidden="true" />
          {fullAddress}
        </p>
        <SchoolMapWrapper lat={school.lat} lng={school.lng} name={school.name} address={fullAddress} />
      </section>

      {/* Kontakt skolen */}
      <section aria-labelledby="kontakt-tittel" className="mt-12">
        <h2 id="kontakt-tittel">Kontakt skolen</h2>
        <p className="mt-1 text-[#6B6B6B]">Spør om nivå, oppstart, prøvetime eller noe annet – svaret kommer normalt innen 1–2 dager.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm schoolId={school.id} schoolName={school.name} />
          </div>
          <div className="space-y-3">
            <div className="rounded-md border border-[#CCD2DE] bg-white p-4">
              <h3 className="font-display text-base font-bold text-navy">Kontaktinformasjon</h3>
              <ul className="mt-3 space-y-2 text-sm text-[#1A1A1A]">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                  <a href={`tel:${school.phone.replace(/\s/g, "")}`} className="hover:underline">{school.phone}</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                  <a href={`mailto:${school.email}`} className="break-all hover:underline">{school.email}</a>
                </li>
                {school.website && (
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                    <a href={school.website} target="_blank" rel="noopener noreferrer nofollow" className="hover:underline">
                      {school.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            <InfoBox title="Åpningstider">
              <p>Man–fre 17:00–22:00 · Lør–søn etter timeplan</p>
            </InfoBox>
          </div>
        </div>
      </section>

      {/* Strukturerte data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
