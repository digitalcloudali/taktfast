import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, Phone, School } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = {
  title: "Kundeservice",
  description:
    "Få svar på vanlige spørsmål om booking, avbestilling, betaling, gavekort og venteliste – eller kontakt Taktfast kundeservice på telefon 22 00 00 00 eller post@taktfast.no.",
  alternates: { canonical: "/kundeservice" },
};

const FAQ = [
  {
    q: "Hvordan avbestiller jeg et kurs?",
    a: "Alt skjer på Min side: åpne bookingen din og velg «Avbestill». For kursrekke er avbestilling gratis frem til 48 timer før kursstart, deretter 50 % refusjon frem til andre kurstime. Drop-in-timer kan avbestilles gratis frem til 12 timer før timen. Refusjonen kommer tilbake til samme betalingsmiddel innen noen dager.",
  },
  {
    q: "Kan jeg komme alene på pardans?",
    a: "Ja! Mange kurs er merket «Kom alene» – da roterer partnere underveis, og du danser med flere gjennom timen. Du velger selv om du vil danse fører eller følger når du booker, og skolen holder alltid et øye med rollebalansen på gulvet.",
  },
  {
    q: "Hvordan betaler jeg, og er det trygt?",
    a: "Du betaler med Vipps i kassen vår. Prisen du ser per kurs er den fulle prisen – Taktfast legger ikke på skjulte gebyrer. Betalingen din går gjennom en trygg løsning, og kvitteringen finner du på Min side med en gang. I demoen simuleres betalingen.",
  },
  {
    q: "Hvordan bruker jeg et gavekort?",
    a: "Gavekortet har en unik kode, f.eks. TF-DEMO-500. Skriv inn koden i kassen, så trekkes verdien fra totalsummen. Restverdien blir stående på kontoen din til neste gang. Gavekortet kan brukes på alle kurs og klippekort hos alle skoler på Taktfast.",
  },
  {
    q: "Hvordan fungerer ventelisten?",
    a: "Er kurset fullt i din rolle (fører eller følger), melder du deg gratis på ventelisten. Når en plass blir ledig, får du varsel med en forhåndsreservert plass i en begrenset periode. Bekrefter du ikke innen fristen, går plassen videre til neste på listen.",
  },
  {
    q: "Hvor gammel må jeg være for å delta?",
    a: "Kurs for voksne har normalt aldersgrense 16 år, noen steder 18 år. Barn og ungdom er hjertelig velkomne på egne kurs for barne- og ungdomsdans – der er aldersinndelingen oppgitt per kurs. Deltakere under 15 år må ha samtykke fra en foresatt ved påmelding.",
  },
] as const;

const KONTAKT = [
  {
    icon: Phone,
    label: "Telefon",
    value: "22 00 00 00",
    hint: "Hverdager 09:00–16:00",
    href: "tel:+4722000000",
  },
  {
    icon: Mail,
    label: "E-post",
    value: "post@taktfast.no",
    hint: "Vi svarer innen 24 timer",
    href: "mailto:post@taktfast.no",
  },
] as const;

export default function KundeservicePage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Kundeservice"
        sub="Vi hjelper deg raskt på vei – enten du lurer på en booking, en refusjon eller hvilket kurs du bør starte med."
      />

      {/* ---------- Kontakt (anker #kontakt) ---------- */}
      <section id="kontakt" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="kontakt-oss">
        <h2 id="kontakt-oss">Kontakt oss</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
          {KONTAKT.map(({ icon: Icon, label, value, hint, href }) => (
            <a
              key={label}
              href={href}
              className="group rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm transition-colors hover:border-navy"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-pale" aria-hidden="true">
                <Icon className="h-5 w-5 text-navy" />
              </span>
              <p className="mt-4 font-display text-lg font-bold text-navy">{label}</p>
              <p className="mt-1 font-semibold text-navy group-hover:underline">{value}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-tf-muted">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {hint}
              </p>
            </a>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm text-tf-muted">
          Vanlig svar tid: innen 24 timer på hverdager. Haster det? Ring oss i åpningstiden.
        </p>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="border-t border-[#CCD2DE] bg-sky-pale" aria-labelledby="faq">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <h2 id="faq">Vanlige spørsmål</h2>
          <div className="mt-6 max-w-3xl rounded-md border border-[#CCD2DE] bg-white px-5 shadow-sm">
            <Accordion type="single" collapsible className="w-full">
              {FAQ.map((item, i) => (
                <AccordionItem key={item.q} value={`faq-${i}`}>
                  <AccordionTrigger className="text-[15px] font-semibold text-navy hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-tf-body">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* ---------- Kontakt danseskolen direkte ---------- */}
          <div className="mt-8 flex max-w-3xl items-start gap-4 rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-pale" aria-hidden="true">
              <School className="h-5 w-5 text-navy" />
            </span>
            <div>
              <h3 className="text-lg">Lurer du på noe om et bestemt kurs?</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-tf-body">
                Spørsmål om timeplan, nivå, parkering eller klær? Kontakt{" "}
                <Link href="/danseskoler" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
                  danseskolen direkte
                </Link>{" "}
                – du finner kontaktskjemaet øverst på hver skoleside.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
