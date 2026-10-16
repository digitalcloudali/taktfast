import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BarChart3, CalendarClock, Tag, Wallet, ClipboardList, SearchCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerSignupForm } from "@/components/skoler/partner-signup-form";

export const metadata: Metadata = {
  title: "Driver du danseskole?",
  description:
    "Bli partner hos Taktfast: fyll tomme plasser, synlige priser gir færre henvendelser, venteliste og rollebalanse automatisk, og omsetningsoversikt i skolepanelet. Verifisering er gratis.",
  alternates: { canonical: "/for-danseskoler" },
};

const USP = [
  {
    icon: CalendarClock,
    title: "Fyll tomme plasser",
    body: "Dansere søker etter ledige plasser, dag og nivå. Tomme sete synlig i søket — og ventelisten varsler automatisk når en plass slipper.",
  },
  {
    icon: Tag,
    title: "Synlige priser = færre henvendelser",
    body: "Du styrer prisene selv, og danserne ser dem før de kontakter deg. Spørsmål om pris forsvinner fra innboksen — gjenværende henvendelser er faktisk kjøpsklare.",
  },
  {
    icon: SlidersHorizontal,
    title: "Venteliste og rollebalanse automatisk",
    body: "Taktfast holder balansen mellom førere og følgere i pardanskurs, og tilbyr plasser fra ventelisten automatisk når noen avbestiller.",
  },
  {
    icon: BarChart3,
    title: "Omsetningsoversikt i skolepanelet",
    body: "Se bookinger, innsjekkinger og omsetning per kurs og måned — i sanntid, uten regneark.",
  },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: "Registrer skolen",
    body: "Opprett konto og legg inn skole, saler og timeplan. Tar rundt 20 minutter.",
  },
  {
    icon: SearchCheck,
    title: "Vi verifiserer (gratis)",
    body: "Vi sjekker at skolen og tilbudet stemmer — ingen kostnad, ingen binding.",
  },
  {
    icon: SlidersHorizontal,
    title: "Du styrer pris og timeplan i panelet",
    body: "Endre priser, kapasitet og datoer når du vil. Taktfast viser alltid oppdatert informasjon til danserne.",
  },
  {
    icon: Wallet,
    title: "Vi tar 10 % provisjon av betalte bookinger (demo)",
    body: "Ingen faste kostnader: du betaler bare når du får betalte bookinger via Taktfast.",
  },
];

const QUOTES = [
  {
    text: "Vi sluttet å svare på «hva koster det?»-meldinger. Nå kommer henvendelsene gjennom Taktfast, ferdig betalt.",
    author: "Mette, Salsakraft Bergen",
  },
  {
    text: "Rollebalansen var hodebry i årevis. Nå ser danserne selv om vi trenger førere eller følgere — gruppen er i balanse hver uke.",
    author: "Jonas, Swingfabrikken Trondheim",
  },
  {
    text: "Brudevalspakkene våre ble synlige for folk som faktisk gifter seg. Tre nye par den første måneden.",
    author: "Ingrid, Valseriet Sandefjord",
  },
];

export default function ForDanseskolerPage() {
  return (
    <div className="flex flex-col">
      {/* ---------- Hero: navy block ---------- */}
      <section className="navy-block" aria-labelledby="skoler-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Markedsplassen for dansekurs i Norge
              </p>
              <h1 id="skoler-h1" className="text-white">
                Driver du danseskole?
              </h1>
              <p className="mt-3 max-w-xl text-[17px] text-white/85">
                Da bør skolen din stå i Taktfasts søk, der dansere sammenligner priser, ser ledige
                plasser og booker direkte. Du beholder full kontroll — vi skaffer danserne.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/registrer" className="inline-block">
                  <Button variant="white" size="lg">
                    Opprett konto
                  </Button>
                </Link>
                <a href="#partneravtale" className="inline-block">
                  <Button variant="outlineNavy" size="lg">
                    Se partneravtalen
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md shadow-lg lg:aspect-auto lg:min-h-[320px]">
              <Image
                src="/images/for-skoler-instructor.png"
                alt="Danseskole-instruktør som underviser i en lys studio med speilvegg"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Fordeler ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="fordeler">
        <h2 id="fordeler">Hva du får som partner</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {USP.map((u) => (
            <li key={u.title} className="flex gap-4 rounded-md border border-[#CCD2DE] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-pale">
                <u.icon className="h-5 w-5 text-navy" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-[18px]">{u.title}</h3>
                <p className="mt-1 text-sm text-tf-muted">{u.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Partneravtalen ---------- */}
      <section id="partneravtale" className="bg-sky-pale scroll-mt-20" aria-labelledby="avtalen">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h2 id="avtalen">Slik fungerer partneravtalen</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex flex-col gap-2 rounded-md border border-[#CCD2DE] bg-white p-4">
                <span className="absolute right-3 top-3 font-display text-3xl font-extrabold text-sky/60" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-pale">
                  <s.icon className="h-5 w-5 text-navy" aria-hidden="true" />
                </span>
                <h3 className="text-[17px] pr-8">{s.title}</h3>
                <p className="text-sm text-tf-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-tf-muted">
            Detaljer om provisjon og utbetaling avtales i partneravtalen — alt er demonstrasjon i
            denne demoen.
          </p>
        </div>
      </section>

      {/* ---------- Søknadsskjema ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="soknad">
        <div className="mb-6 max-w-2xl">
          <h2 id="soknad">Interessert? Send en søknad</h2>
          <p className="mt-1 text-tf-muted">
            Vi svarer innen 2 virkedager med info om verifisering og oppsett. Verifisering er gratis
            og uforpliktende.
          </p>
        </div>
        <PartnerSignupForm />
      </section>

      {/* ---------- Sitater ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="stemmer">
        <h2 id="stemmer">Skolene snakker</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {QUOTES.map((q) => (
            <li key={q.author} className="flex flex-col rounded-md tint-butter p-4">
              <blockquote className="text-[15px] leading-relaxed text-tf-body">«{q.text}»</blockquote>
              <p className="mt-3 font-display text-sm font-bold text-navy">{q.author}</p>
              <p className="text-xs text-tf-muted">Fiktiv skole i demo-dataene</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="cta">
        <div className="flex flex-col items-center gap-4 rounded-md bg-navy p-8 text-center">
          <h2 id="cta" className="text-white">
            Klar for å fylle salene?
          </h2>
          <p className="max-w-xl text-[15px] text-white/85">
            Opprett konto, registrer skolen og legg ut din første kursrekke i dag. Verifisering er
            gratis — du betaler bare for bookinger som kommer inn.
          </p>
          <Link href="/registrer" className="inline-block">
            <Button variant="white" size="lg">
              Opprett konto
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
