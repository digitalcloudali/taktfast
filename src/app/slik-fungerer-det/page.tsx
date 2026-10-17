import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck2,
  ClipboardCheck,
  CreditCard,
  HeartHandshake,
  Hourglass,
  ListChecks,
  QrCode,
  Search,
  Ticket,
  UserPlus2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Slik fungerer det",
  description:
    "Slik booker du dansekurs på Taktfast: søk og sammenlign, velg rolle og deltaker, betal trygt med Vipps og vis QR-koden når du kommer. Se også regler for avbestilling, venteliste og klippekort.",
  alternates: { canonical: "/slik-fungerer-det" },
};

const STEG = [
  {
    icon: Search,
    title: "Søk og sammenlign",
    text: "Filtrer på dansestil, by, dag, nivå og pris. Alle kurs viser transparente priser, instruktør og hvor mange plasser som er ledige – før og etter din rolle.",
  },
  {
    icon: UserPlus2,
    title: "Velg rolle og deltaker",
    text: "Pardans? Velg fører eller følger – vi viser alltid rollebalansen. Du kan legge til flere deltakere, komme alene eller melde deg på venteliste hvis kurset er fullt.",
  },
  {
    icon: CreditCard,
    title: "Betal trygt med Vipps (demo)",
    text: "Prisen du ser er prisen du betaler – ingen skjulte gebyrer. Betalingen går via Vipps i demoen, og kvitteringen ligger på Min side med en gang.",
  },
  {
    icon: QrCode,
    title: "Vis QR-koden når du kommer",
    text: "Du får en QR-kode per booking i appen eller på Min side. Skolen skanner den ved inngangen – og du er på dansegulvet på under ti sekunder.",
  },
] as const;

const AVBESTILLING = [
  {
    type: "Kursrekke",
    gratis: "Frem til 48 t før kursstart",
    etter: "50 % refusjon frem til andre kurstime, deretter ingen refusjon",
  },
  {
    type: "Drop-in",
    gratis: "Frem til 12 t før timen",
    etter: "Ingen refusjon under 12 timer før",
  },
  {
    type: "Privattime",
    gratis: "Frem til 48 t før timen",
    etter: "Ingen refusjon",
  },
  {
    type: "Prøvetime",
    gratis: "Frem til 12 t før timen",
    etter: "100,- krediteres til neste booking",
  },
] as const;

export default function SlikFungererDetPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Slik fungerer det"
        sub="Fra søk til dansegulv i fire steg – med trygg betaling og enkel avbestilling underveis."
        image="/images/studio-interior.png"
        imageAlt="Lys dansesal med ballettbarre, store vinduer og lyst tregulv"
      />

      {/* ---------- 4 steg ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="stegene">
        <h2 id="stegene">Fire steg til første time</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEG.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
              <span className="absolute right-4 top-4 font-display text-3xl font-extrabold text-sky-pale" aria-hidden="true">
                {i + 1}
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-pale" aria-hidden="true">
                <Icon className="h-5 w-5 text-navy" />
              </span>
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-tf-body">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link href="/sok">
            <Button className="h-11 px-6">Finn dansekurs nå</Button>
          </Link>
        </div>
      </section>

      {/* ---------- Komme alene ---------- */}
      <section className="border-t border-[#CCD2DE] bg-sky-pale" aria-labelledby="komme-alene">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-14">
          <div>
            <h2 id="komme-alene" className="flex items-center gap-3">
              <HeartHandshake className="h-7 w-7 shrink-0 text-navy" aria-hidden="true" />
              Komme alene
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
              Du trenger ikke en partner for å melde deg på pardans. Kurs merket «Kom alene» roterer
              partnere underveis, slik at alle danser med alle – og du lærer raskere når du bytter
              fører eller følger gjennom timen.
            </p>
            <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
              Velg rollen du vil danse når du booker (fører eller følger), så sørger skolen for at
              det er balanse på gulvet. Ikke helt sikker? Velg «Kom alene»-filtret i søket, og bare
              kurs som passer blir vist.
            </p>
          </div>
          <div className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
            <h3 className="text-lg">Kort fortalt</h3>
            <ul className="mt-3 space-y-3 text-[15px] text-tf-body">
              <li className="flex gap-2.5">
                <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Meld deg på som fører eller følger – rollebalansen vises på hvert kurs.
              </li>
              <li className="flex gap-2.5">
                <Hourglass className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Er kurset fullt i din rolle? Sett deg på ventelisten, vi gir deg beskjed.
              </li>
              <li className="flex gap-2.5">
                <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Vi bytter partnere jevnlig – det er normalt, sosialt og den raskeste måten å lære på.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- Venteliste ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="venteliste">
        <div className="max-w-3xl">
          <h2 id="venteliste">Venteliste og rollebalanse</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Når din rolle er full, kan du sette deg gratis på ventelisten. Får skolen en ledig
            plass – fordi noen avbestiller eller balansen endres – får du et varsel og en
            forhåndsreservert plass i en begrenset periode. Du bekrefter selv om du vil ha den.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Mange skoler holder et par plasser i «motsatt» rolle for å holde gulvet i balanse. Derfor
            kan det lønne seg å melde interesse tidlig, selv om plassen ikke er åpnet ennå.
          </p>
        </div>
      </section>

      {/* ---------- Avbestilling ---------- */}
      <section className="border-y border-[#CCD2DE]" aria-labelledby="avbestilling">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="max-w-3xl">
            <h2 id="avbestilling">Avbestilling</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
              Livet skjer – og planene endres. Avbestilling skjer på Min side, og refusjonen
              kommer tilbake til samme betalingsmiddel. Her er fristene:
            </p>
          </div>
          <div className="mt-6 overflow-x-auto rounded-md border border-[#CCD2DE] bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <caption className="sr-only">Regler for avbestilling og refusjon per kurstype</caption>
              <thead>
                <tr className="bg-sky-pale font-display text-navy">
                  <th scope="col" className="px-4 py-3 font-bold">Kurstype</th>
                  <th scope="col" className="px-4 py-3 font-bold">Gratis avbestilling</th>
                  <th scope="col" className="px-4 py-3 font-bold">Etter fristen</th>
                </tr>
              </thead>
              <tbody className="text-tf-body">
                {AVBESTILLING.map((r) => (
                  <tr key={r.type} className="stripe-row border-t border-[#CCD2DE]">
                    <th scope="row" className="px-4 py-3 font-semibold text-navy">{r.type}</th>
                    <td className="px-4 py-3">{r.gratis}</td>
                    <td className="px-4 py-3">{r.etter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 max-w-3xl text-sm text-tf-muted">
            Avbestiller skolen selv, får du alltid full refusjon – eller kreditt med en liten godtgjørelse
            hvis du heller ønsker å stå på venteliste til neste kursrekke.
          </p>
        </div>
      </section>

      {/* ---------- Klippekort ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="klippekort">
        <div className="grid max-w-5xl gap-6 lg:grid-cols-2">
          <div>
            <h2 id="klippekort" className="flex items-center gap-3">
              <Ticket className="h-7 w-7 shrink-0 text-navy" aria-hidden="true" />
              Klippekort
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
              Klippekort gjelder drop-in-timer hos én skole: kjøp 5 eller 10 klipp, og bruk dem når
              det passer deg. Et klipp trekkes når du sjekker inn med QR-koden – ikke når du booker.
              Er det fullt i timen du ønsker? Da trekkes ingen klipp, og du får beskjed om ledige
              alternativer.
            </p>
          </div>
          <div className="rounded-md bg-sky-pale p-6">
            <h3 className="text-lg">Slik fungerer klippekortet</h3>
            <ul className="mt-3 space-y-3 text-[15px] text-tf-body">
              <li className="flex gap-2.5">
                <CalendarCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Gjelder drop-in og utvalgte dansekvelder hos skolen kortet er kjøpt hos.
              </li>
              <li className="flex gap-2.5">
                <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Klipp trekkes først når QR-koden skannes ved innsjekk.
              </li>
              <li className="flex gap-2.5">
                <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
                Gyldig i 12 måneder fra kjøp, og kan deles med én husstand.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
