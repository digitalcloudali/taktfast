import type { Metadata } from "next";
import Image from "next/image";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoBox } from "@/components/site/ui-bits";
import { GiftForm } from "@/components/gavekort/gift-form";

export const metadata: Metadata = {
  title: "Gavekort på dansekurs",
  description:
    "Gi et gavekort på dansekurs fra 250,- til 5 000,-. Gyldig hos alle danseskoler på Taktfast — bruk saldoen i bookingflyten.",
  alternates: { canonical: "/gavekort" },
};

const FAQ = [
  {
    q: "Hvordan bruker mottakeren gavekortet?",
    a: "Gavekortet brukes i steg 4 i bookingflyten når mottakeren booker et kurs, privattime, pakke eller dansekveld. Saldoen trekkes automatisk, og restbeløpet betales som vanlig med Vipps eller kort. Koden kan også brukes i bookingdialogen for bryllupspakker.",
  },
  {
    q: "Hvor lenge er gavekortet gyldig?",
    a: "Gavekort fra Taktfast er gyldige i tre år fra kjøpsdato — nok tid til å finne riktig kurs, og til å endre mening et par ganger. Gjenstående saldo forblir på kortet til neste gang.",
  },
  {
    q: "Kan gavekortet brukes hos alle danseskoler?",
    a: "Ja, det er hele poenget. Gavekortet gjelder hos alle verifiserte skoler på Taktfast, i alle byer og for alle stiler — fra brudevals til barnedans. Mottakeren velger selv hva og hvor.",
  },
];

export default function GavekortPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="flex flex-col">
      {/* ---------- Hero ---------- */}
      <section className="tint-peach" aria-labelledby="gavekort-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <h1 id="gavekort-h1">Gavekort på dansekurs</h1>
              <p className="mt-3 max-w-xl text-[17px] text-tf-body">
                Gi noen du er glad i en opplevelse i stedet for en ting: en brudevals som sitter, en
                salsa-start med kollegaene, eller barnas første dansetime. Gavekortet gjelder hos
                alle skoler på Taktfast, i alle stiler og byer.
              </p>
            </div>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md shadow-sm lg:min-h-[300px]">
              <Image
                src="/images/gavekort.png"
                alt="Taktfast-gavekort med bånd på et dansegulv"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Kjøp + info ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="kjop">
        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 id="kjop" className="sr-only">
              Kjøp gavekort
            </h2>
            <GiftForm />
          </div>
          <div className="space-y-4">
            <InfoBox title="Vil du prøve først?">
              <p>
                Demo-koden <span className="font-bold text-navy">TF-DEMO-500</span> er aktiv med{" "}
                <span className="font-bold text-navy">500,- i saldo</span>. Legg den inn i steg 4 i
                bookingflyten — eller i «Gavekode»-feltet når du booker en bryllupspakke.
              </p>
            </InfoBox>
            <InfoBox title="Slik bruker mottakeren kortet">
              <ol className="list-inside list-decimal space-y-1">
                <li>Finn et kurs, en kveld eller en pakke på Taktfast.</li>
                <li>Book som vanlig — legg til deltakere i steg 2–3.</li>
                <li>Skriv inn gavekortkoden i steg 4, og saldoen trekkes automatisk.</li>
                <li>Betal eventuell restsum med Vipps eller kort.</li>
              </ol>
            </InfoBox>
            <InfoBox title="Enkelt å gi bort">
              <p>
                Koden sendes til e-posten din (simulert i demoen) — print den, lim den inn i et kort,
                eller videresend den. Ingen konto kreves for å kjøpe.
              </p>
            </InfoBox>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6" aria-labelledby="gavekort-faq">
        <h2 id="gavekort-faq">Spørsmål om gavekort</h2>
        <Accordion type="single" collapsible className="mt-6">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-[17px] font-semibold text-navy">{f.q}</AccordionTrigger>
              <AccordionContent className="text-[15px] text-tf-body">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
