import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Shirt, Users, MapPin, Coins } from "lucide-react";
import { InfoBox } from "@/components/site/ui-bits";
import { NightBookingPanel } from "@/components/kveld/night-booking-panel";
import { db } from "@/lib/db";
import { formatNok, styleName } from "@/lib/constants";
import { fmtDate } from "@/lib/types";

type Params = { params: Promise<{ slug: string }> };

async function getNight(slug: string) {
  const night = await db.danceNight.findUnique({
    where: { slug },
    include: { school: true },
  });
  return night;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const night = await getNight(slug);
  if (!night) return { title: "Dansekveld ikke funnet" };
  return {
    title: night.title,
    description: `${night.title} hos ${night.school.name} i ${night.school.city} — ${fmtDate(night.date)} kl. ${night.startTime}. Kveldsbillett ${formatNok(night.price)}.`,
    alternates: { canonical: `/dansekveld/${night.slug}` },
  };
}

export default async function DansekveldPage({ params }: Params) {
  const { slug } = await params;
  const night = await getNight(slug);
  if (!night) notFound();

  const styles = (JSON.parse(night.styles || "[]") as string[]).map(styleName);
  const booked = await db.booking.count({
    where: { nightId: night.id, status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN"] } },
  });
  const soldOut = booked >= night.capacity;

  const weekday = night.date.toLocaleDateString("nb-NO", { weekday: "long" });
  const dateLabel = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${fmtDate(night.date)}`;

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: night.title,
    startDate: `${night.date.toISOString().slice(0, 10)}T${night.startTime}:00`,
    endDate: `${night.date.toISOString().slice(0, 10)}T${night.endTime}:00`,
    eventStatus: night.status === "AKTIV" ? "https://schema.org/EventScheduled" : "https://schema.org/EventCancelled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: night.school.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: night.school.address,
        postalCode: night.school.postalCode,
        addressLocality: night.school.city,
        addressCountry: "NO",
      },
    },
    image: [night.imageUrl],
    description: night.description,
    offers: {
      "@type": "Offer",
      price: night.price,
      priceCurrency: "NOK",
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `https://taktfast.no/dansekveld/${night.slug}`,
    },
    organizer: { "@type": "Organization", name: night.school.name, url: `https://taktfast.no/skole/${night.school.slug}` },
  };

  return (
    <div className="flex flex-col">
      <section className="bg-sky-pale" aria-labelledby="kveld-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            <div>
              <nav aria-label="Brødsmulesti" className="mb-3 text-sm text-tf-muted">
                <Link href="/dansekvelder" className="font-semibold text-navy hover:underline">
                  Dansekvelder
                </Link>{" "}
                / <span aria-current="page">{night.title}</span>
              </nav>
              <h1 id="kveld-h1">{night.title}</h1>
              <p className="mt-2 text-[17px]">
                <Link href={`/skole/${night.school.slug}`} className="font-semibold text-navy hover:underline">
                  {night.school.name}
                </Link>{" "}
                <span className="text-tf-muted">· {night.school.city}</span>
              </p>
              <ul className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" /> {dateLabel}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" /> {night.startTime}–{night.endTime}
                </li>
                <li className="flex items-center gap-2">
                  <Shirt className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" /> Dresscode: {night.dresscode}
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" /> {Math.max(0, night.capacity - booked)} av {night.capacity} plasser ledige
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" /> {night.school.address}, {night.school.postalCode} {night.school.city}
                </li>
                <li className="flex items-center gap-2 font-bold text-navy">
                  <Coins className="h-4 w-4 shrink-0" aria-hidden="true" /> {formatNok(night.price)} per person
                </li>
              </ul>
              {styles.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Dansestiler">
                  {styles.map((s) => (
                    <li key={s} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-navy ring-1 ring-[#CCD2DE]">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md shadow-sm lg:aspect-auto lg:min-h-[300px]">
              <Image
                src={night.imageUrl}
                alt={night.title}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2>Om kvelden</h2>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-tf-body">{night.description}</p>

            {night.freeBeginnerClass && (
              <InfoBox title="Ny på dans?" className="mt-4 max-w-2xl">
                <p>
                  Gratis nybegynnertime kl. 18:00 før festen — kom litt tidlig, lær grunnsteget, og
                  dans resten av kvelden med god samvittighet. Ingen påmelding nødvendig.
                </p>
              </InfoBox>
            )}

            <InfoBox title="Godt å vite" className="mt-4 max-w-2xl">
              <ul className="list-inside list-disc space-y-1">
                <li>Kveldsbilletten gir tilgang til alle kurs samme kveld hos skolen.</li>
                <li>Kom alene — partnerbytte i timene gjør det enkelt å bli med.</li>
                <li>Gratis avbestilling inntil 48 timer før kvelden starter.</li>
              </ul>
            </InfoBox>
          </div>

          <aside aria-label="Booking">
            {night.status === "AKTIV" && night.date.getTime() > Date.now() ? (
              <NightBookingPanel nightId={night.id} price={night.price} title={night.title} />
            ) : (
              <p className="rounded-md border border-[#CCD2DE] p-6 text-center text-tf-muted">
                Denne dansekvelden er avlyst eller allerede holdt.
              </p>
            )}
          </aside>
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }} />
    </div>
  );
}
