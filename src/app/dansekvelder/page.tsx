import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { listNights } from "@/lib/data";
import { CITIES, cityBySlug, styleName, formatNok } from "@/lib/constants";
import { fmtDate } from "@/lib/types";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Dansekvelder og sosialdans",
  description:
    "Dansekvelder hos danseskoler i hele Norge: én kveldsbillett gir tilgang til alle kurs samme kveld, ofte med gratis nybegynnertime før sosialdansen.",
  alternates: { canonical: "/dansekvelder" },
};

type NightFromList = Awaited<ReturnType<typeof listNights>>[number];

/** «lørdag 24. oktober · 19:00–23:00» */
function nightDateLabel(dateIso: string, startTime: string, endTime: string): string {
  const d = new Date(dateIso);
  const weekday = d.toLocaleDateString("nb-NO", { weekday: "long" });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${fmtDate(d)} · ${startTime}–${endTime}`;
}

export default async function DansekvelderPage({
  searchParams,
}: {
  searchParams: Promise<{ by?: string }>;
}) {
  const { by } = await searchParams;
  const activeCity = by && cityBySlug(by) ? by : undefined;

  const allNights = await listNights();

  // Byer med flest kvelder (teller uansett aktivt filter, så chipser viser substans)
  const cityCounts = new Map<string, number>();
  for (const n of allNights) cityCounts.set(n.city, (cityCounts.get(n.city) ?? 0) + 1);
  const topCities = [...cityCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name);

  const nights: NightFromList[] = activeCity
    ? allNights.filter((n) => n.city === cityBySlug(activeCity)!.name)
    : allNights;

  return (
    <div className="flex flex-col">
      {/* ---------- Hero: pale sky band ---------- */}
      <section className="bg-sky-pale" aria-labelledby="kvelder-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h1 id="kvelder-h1">Dansekvelder og sosialdans</h1>
              <p className="mt-3 max-w-xl text-[17px] text-tf-body">
                Kveldsbillett gir tilgang til alle kurs samme kveld hos skolen. Kom alene eller med
                vennen — ofte er det gratis nybegynnertime før sosialdansen åpner.
              </p>
            </div>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md shadow-sm lg:min-h-[280px]">
              <Image
                src="/images/dansekveld-hero.png"
                alt="Folk som danser sosialt på en dansekveld med stemningslys"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Byfilter ---------- */}
      <nav aria-label="Filtrer dansekvelder etter by" className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/dansekvelder"
              data-active={!activeCity}
              className={
                !activeCity
                  ? "rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white"
                  : "rounded-full border border-[#CCD2DE] bg-white px-4 py-1.5 text-sm font-semibold text-navy hover:border-navy"
              }
            >
              Alle byer
            </Link>
          </li>
          {topCities.map((cityName) => {
            const slug = CITIES.find((c) => c.name === cityName)?.slug;
            if (!slug) return null;
            const active = activeCity === slug;
            return (
              <li key={slug}>
                <Link
                  href={`/dansekvelder?by=${slug}`}
                  data-active={active}
                  className={
                    active
                      ? "rounded-full bg-navy px-4 py-1.5 text-sm font-semibold text-white"
                      : "rounded-full border border-[#CCD2DE] bg-white px-4 py-1.5 text-sm font-semibold text-navy hover:border-navy"
                  }
                >
                  {cityName}
                  <span className="ml-1 text-xs opacity-70">({cityCounts.get(cityName)})</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ---------- Kveldskort ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-6 pb-14 sm:px-6" aria-labelledby="kveldene">
        <h2 id="kveldene" className="sr-only">
          Kommende dansekvelder
        </h2>
        {nights.length === 0 ? (
          <p className="rounded-md border border-[#CCD2DE] p-6 text-center text-tf-muted">
            Ingen dansekvelder i denne byen akkurat nå — se alle byer.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {nights.map((n) => (
              <li key={n.id} className="flex flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white">
                <Link href={`/dansekveld/${n.slug}`} className="relative block aspect-[16/9] w-full bg-stripe">
                  <Image
                    src={n.imageUrl}
                    alt={n.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                  {n.freeBeginnerClass && (
                    <span className="absolute left-2 top-2 rounded-[4px] bg-tpink px-2 py-1 text-xs font-bold text-white">
                      Gratis nybegynnertime før
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-[18px]">
                    <Link href={`/dansekveld/${n.slug}`} className="hover:underline">
                      {n.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-tf-muted">
                    <Link href={`/skole/${n.schoolSlug}`} className="font-semibold text-navy hover:underline">
                      {n.schoolName}
                    </Link>{" "}
                    · {n.city}
                  </p>
                  <p className="text-sm font-semibold text-navy">{nightDateLabel(n.date, n.startTime, n.endTime)}</p>
                  <ul className="flex flex-wrap gap-1.5" aria-label="Dansestiler denne kvelden">
                    {n.styles.slice(0, 4).map((s) => (
                      <li key={s} className="rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-semibold text-navy">
                        {styleName(s)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <p className="font-display text-lg font-extrabold text-navy">{formatNok(n.price)}</p>
                    <Link href={`/dansekveld/${n.slug}`} className={buttonVariants({ variant: "default", size: "sm" })}>
                      Kjøp kveldsbillett
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
