import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Vilkår",
  description:
    "Booking-vilkår for Taktfast: priser og betaling med Vipps, avbestilling og refusjon, venteliste, aldersgrenser, klippekort, gavekort og prøvetime-kreditt.",
  alternates: { canonical: "/vilkar" },
};

const REFUSJON = [
  {
    type: "Kursrekke",
    frist: "48 t før kursstart",
    regel: "Full refusjon. Etter dette 50 % frem til andre kurstime har vært holdt – deretter ingen refusjon.",
  },
  {
    type: "Drop-in",
    frist: "12 t før timen",
    regel: "Full refusjon. Ingen refusjon under 12 timer før timen starter.",
  },
  {
    type: "Privattime",
    frist: "48 t før timen",
    regel: "Full refusjon. Ingen refusjon etter dette.",
  },
  {
    type: "Prøvetime",
    frist: "12 t før timen",
    regel: "Full refusjon, eller 100,- i kreditt hvis du heller vil bruke beløpet på neste booking.",
  },
  {
    type: "Klippekort",
    frist: "—",
    regel: "Klipp trekkes først ved innsjekk. Ubrukte klipp refunderes ikke, men kortet er gyldig i 12 måneder.",
  },
] as const;

export default function VilkarPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Vilkår"
        sub="Gjeldende vilkår for booking og kjøp av dansekurs gjennom Taktfast – skrevet så plain som mulig."
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-sm text-tf-muted">
          Sist oppdatert: januar 2025 · Taktfast AS (demo) · Med «vi» mener vi Taktfast, med «skolen»
          danseskolen som leverer kurset.
        </p>

        {/* ---------- Priser og betaling ---------- */}
        <section className="mt-10" aria-labelledby="priser-og-betaling">
          <h2 id="priser-og-betaling">1. Priser og betaling</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>Alle priser er oppgitt i norske kroner (NOK) og inkluderer mva der det kommer til bruk.</li>
            <li>
              Prisen du ser i søket og i kassen er den fulle prisen. Taktfast legger ikke på
              bookinggebyrer eller skjulte tillegg.
            </li>
            <li>
              Betaling skjer med Vipps gjennom Taktfasts kasse (simulert i demoen). Beløpet trekkes
              straks, og kvittering sendes til e-posten din og legges på Min side.
            </li>
            <li>
              Rabattkoder og studentpriser valideres i kassen og kan ikke kombineres med andre tilbud
              med mindre annet er oppgitt.
            </li>
          </ul>
        </section>

        {/* ---------- Avbestilling og refusjon ---------- */}
        <section className="mt-10" aria-labelledby="avbestilling-refusjon">
          <h2 id="avbestilling-refusjon">2. Avbestilling og refusjon</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Du kan alltid avbestille selv på Min side. Fristene nedenfor gjelder fra kursets oppsatte
            starttidspunkt:
          </p>
          <div className="mt-6 overflow-x-auto rounded-md border border-[#CCD2DE] bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <caption className="sr-only">Avbestillingsfrister og refusjonsregler per kurstype</caption>
              <thead>
                <tr className="bg-sky-pale font-display text-navy">
                  <th scope="col" className="px-4 py-3 font-bold">Kurstype</th>
                  <th scope="col" className="px-4 py-3 font-bold">Gratis frist</th>
                  <th scope="col" className="px-4 py-3 font-bold">Regel</th>
                </tr>
              </thead>
              <tbody className="text-tf-body">
                {REFUSJON.map((r) => (
                  <tr key={r.type} className="stripe-row border-t border-[#CCD2DE]">
                    <th scope="row" className="px-4 py-3 font-semibold text-navy">{r.type}</th>
                    <td className="px-4 py-3">{r.frist}</td>
                    <td className="px-4 py-3">{r.regel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Refusjon utbetales til samme betalingsmiddel innen 5–10 virkedager. Avbestiller skolen
            kurset, får du alltid full refusjon eller gratis overføring til et annet kurs.
          </p>
        </section>

        {/* ---------- Venteliste ---------- */}
        <section className="mt-10" aria-labelledby="venteliste-vilkar">
          <h2 id="venteliste-vilkar">3. Venteliste</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>Det er gratis å stå på venteliste, og du kan stå på flere lister samtidig.</li>
            <li>
              Når en plass i din rolle (fører/følger) blir ledig, får du varsel med forhåndsreservert
              plass. Reservasjonsfristen står i varslet – bekrefter du ikke, går plassen videre.
            </li>
            <li>
              Du betaler først når du aksepterer plassen. Skolen prioriterer rollebalanse når
              ventelisten slippes.
            </li>
          </ul>
        </section>

        {/* ---------- Aldersgrenser ---------- */}
        <section className="mt-10" aria-labelledby="aldersgrenser">
          <h2 id="aldersgrenser">4. Aldersgrenser og foresatt-samtykke</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>Kurs for voksne har normalt aldersgrense 16 år (18 år der det er oppgitt per kurs).</li>
            <li>
              Deltakere under 15 år må være påmeldt av en foresatt over 18 år, som bekrefter samtykke
              ved bookingen.
            </li>
            <li>
              For barnekurs må kontaktpersonen være til stede eller kunne nås under timen. Aldersinndeling
              per kurs står oppgitt i kursbeskrivelsen.
            </li>
          </ul>
        </section>

        {/* ---------- Klippekort og gavekort ---------- */}
        <section className="mt-10" aria-labelledby="klippekort-gavekort">
          <h2 id="klippekort-gavekort">5. Klippekort og gavekort</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>
              Klippekort gjelder drop-in-timer hos skolen kortet er kjøpt hos, og er gyldig i 12 måneder
              fra kjøpsdato. Klipp trekkes først når QR-koden skannes ved innsjekk.
            </li>
            <li>Ubrukte klipp refunderes ikke, men kan overføres til et annet medlem av samme husstand.</li>
            <li>
              Gavekort kan brukes på alle kurs, klippekort og prøvetimer på Taktfast, og er gyldig i
              12 måneder. Restverdi blir stående til neste booking.
            </li>
            <li>Gavekort og klippekort kan ikke veksles til kontanter.</li>
          </ul>
        </section>

        {/* ---------- Prøvetime-kreditt ---------- */}
        <section className="mt-10" aria-labelledby="provetid">
          <h2 id="provetid">6. Prøvetime-kreditt (100,-)</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Går du videre fra prøvetime til en kursrekke hos samme skole, krediteres 100,- av
            prøvetimens pris på din neste booking. Kreditten legges inn automatisk på Min side etter
            prøvetimen og er gyldig i 3 måneder. Kreditten er personlig og kan ikke utbetales.
          </p>
        </section>

        <p className="mt-10 text-sm text-tf-muted">
          Spørsmål om vilkårene? Ta kontakt via{" "}
          <Link href="/kundeservice#kontakt" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
            kundeservice
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
