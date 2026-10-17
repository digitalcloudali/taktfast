import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Personvern",
  description:
    "Slik behandler Taktfast personopplysninger: hva vi samler inn, hvorfor, deling med danseskoler, cookies og dine rettigheter etter personopplysningsloven.",
  alternates: { canonical: "/personvern" },
};

export default function PersonvernPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Personvern"
        sub="Din dans, dine data. Her forklarer vi enkelt hvilke opplysninger vi behandler, hvorfor – og hvordan du har kontroll."
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        <p className="text-sm text-tf-muted">
          Sist oppdatert: januar 2025 · Taktfast AS (demo) · Personopplysningsloven (GDPR)
        </p>

        {/* ---------- Hva vi samler inn ---------- */}
        <section className="mt-10" aria-labelledby="hva-vi-samler-inn">
          <h2 id="hva-vi-samler-inn">Hva vi samler inn</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>
              <strong>Kontoinformasjon:</strong> navn, e-postadresse og eventuelt telefonnummer når du
              registrerer deg.
            </li>
            <li>
              <strong>Bookinger:</strong> kurs du booker, deltakere, rolle (fører/følger), ventelister
              og QR-koder til innsjekk.
            </li>
            <li>
              <strong>Betalingsinformasjon:</strong> beløp, kvitteringer og status på betaling. Vi behandler
              ikke kortnummer – betalingen håndteres av betalingsformidleren (Vipps, simulert i demoen).
            </li>
            <li>
              <strong>Teknisk informasjon:</strong> IP-adresse, nettlesertype og enkel logging for sikkerhet
              og feilsøking.
            </li>
          </ul>
        </section>

        {/* ---------- Hvorfor ---------- */}
        <section className="mt-10" aria-labelledby="hvorfor">
          <h2 id="hvorfor">Hvorfor behandler vi opplysningene</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Vi bruker opplysningene for å levere tjenesten: opprette og logge inn på kontoen din, gjennomføre
            bookinger, sende kvitteringer og påminnelser, holde rollebalansen på ventelister og gi deg beskjed
            hvis et kurs endres eller avlyses.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Grunnlaget er gjennomføring av avtale med deg (bookingen), berettiget interesse (sikkerhet og
            feilsøking) og samtykke der vi ber om det – for eksempel for nyhetsbrev eller analyse-cookies. Du
            kan trekke tilbake et samtykke når som helst.
          </p>
        </section>

        {/* ---------- Deling med danseskoler ---------- */}
        <section className="mt-10" aria-labelledby="deling">
          <h2 id="deling">Deling med danseskoler</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Når du booker et kurs hos en skole, deler vi den informasjonen skolen trenger for å gjennomføre
            timen: deltakernavn, rolle (fører/følger), aldersgruppe ved barnekurs og eventuelle merknader du
            selv oppgir. Skolen ser ikke passordet ditt, betalingsdetaljene dine eller andre bookinger du har
            gjort hos andre skoler.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Danseskolene er egne ansvarlige for sin videre behandling, og vi inngår databehandleravtaler med
            alle partnere. Vi selger aldri personopplysninger til tredjepart.
          </p>
        </section>

        {/* ---------- Cookies ---------- */}
        <section className="mt-10" aria-labelledby="cookies">
          <h2 id="cookies">Cookies og informasjonskapsler</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Vi bruker informasjonskapsler for at tjenesten skal fungere: innlogging (sesong-valg) og din
            cookie-innstilling lagres som nødvendige cookies. Valgfrie analyse- og markedsføringscookies settes
            bare hvis du sier ja. Du kan endre valget ditt når som helst:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-tf-body">
            <li>
              <strong>Nødvendige:</strong> holder deg innlogget og lagrer cookie-valget ditt – kan ikke slås av.
            </li>
            <li>
              <strong>Analyse:</strong> anonym statistikk om hvilke stiler og sider som er mest populære.
            </li>
            <li>
              <strong>Markedsføring:</strong> viser relevante dansekurs, f.eks. om brudevals rett etter du har
              lest en bryllupsguide.
            </li>
          </ul>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            <Link href="/cookies" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
              Endre cookie-innstillinger her
            </Link>
            .
          </p>
        </section>

        {/* ---------- Dine rettigheter ---------- */}
        <section className="mt-10" aria-labelledby="rettigheter">
          <h2 id="rettigheter">Dine rettigheter</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-tf-body">
            Du har rett til innsyn, retting, sletting, begrensning, dataportabilitet og å motsette deg
            behandling. Du kan også trekke tilbake samtykke og klage til Datatilsynet. Logg inn og send oss en
            melding, så hjelper vi deg innen 30 dager.
          </p>
        </section>

        {/* ---------- Kontakt ---------- */}
        <section className="mt-10 rounded-md bg-sky-pale p-6" aria-labelledby="personvern-kontakt">
          <h2 id="personvern-kontakt" className="text-navy">Kontakt personvernombudet</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-tf-body">
            Spørsmål om personvern? Skriv til{" "}
            <a href="mailto:post@taktfast.no" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
              post@taktfast.no
            </a>{" "}
            med «Personvern» i emnefeltet, eller ring{" "}
            <a href="tel:+4722000000" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
              22 00 00 00
            </a>{" "}
            på hverdager 09:00–16:00.
          </p>
        </section>
      </div>
    </div>
  );
}
