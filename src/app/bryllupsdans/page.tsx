import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarHeart, Check, MapPin, Sparkles, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InfoBox } from "@/components/site/ui-bits";
import { BookingPakkeDialog } from "@/components/bryllup/booking-pakke-dialog";
import { WeddingRequestDialog } from "@/components/bryllup/wedding-request-dialog";
import { db } from "@/lib/db";
import { fmtNok } from "@/lib/types";
import { guideBySlug } from "@/lib/guides";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Bryllupsdans og brudevals",
  description:
    "Book bryllupsdans og brudevals hos verifiserte danseskoler: gruppekurs, privattimer og egen koreografi til deres sang. Få tidsforslag ut fra bryllupsdatoen deres.",
  alternates: { canonical: "/bryllupsdans" },
};

const TYPE_LABEL: Record<string, string> = {
  GRUPPEKURS: "Gruppekurs",
  PRIVATTIMER: "Privattimer",
  KOREOGRAFI: "Koreografi",
  FAR_DATTER: "Far–datter",
};

const STEPS = [
  {
    title: "Velg pakke",
    body: "Gruppekurs for flere par, privattimer for dere to, eller en skreddersydd koreografi til favorittsangen deres.",
  },
  {
    title: "Få tidsforslag fra skolen ut fra bryllupsdatoen",
    body: "Skolen foreslår tider som passer opp mot den store dagen — slik at dere rekker å innøve alt i god tid.",
  },
  {
    title: "Dans generalprøven i god tid",
    body: "Siste time brukes som generalprøve med riktig sko og klesdrakt — da sitter valsen trygt i bena på selve dagen.",
  },
];

const FAQ = [
  {
    q: "Trenger vi egne dansesko til brudevalsen?",
    a: "Nei, ikke i starten. Kom i rene sko med glatt såle — gummisåler kliner fast i gulvet og belaster knærne i vendingene. Mange skoler har dansesko til leie for rundt 50 kroner, og bruden bør teste skoene (eller hælhøyden) hun faktisk skal bruke på dagen.",
  },
  {
    q: "Hvor lang tid før bryllupet bør vi begynne?",
    a: "Tre til seks uker før passer for de fleste: da rekker dere grunnsteg, vendinger og en rolig generalprøve. Har dere en koreografert overraskelsesdans, bør dere regne med seks til åtte uker. Og husk: én time rett før den store dagen er gull verdt.",
  },
  {
    q: "Vi har null rytme — går det an?",
    a: "Ja. Brudevals er den mest tilgivende dansen som fins: gå i takt, hold omfavnelsen og smil. Instruktørene er vant til par som «ikke kan danse», og får dere trygge på grunnsteget i løpet av første time. Ingen i salen på bryllupsdagen vet hva dere hadde planlagt.",
  },
  {
    q: "Kan vi danse til favorittsangen vår uansett tempo?",
    a: "Som regel, ja. Vals krever 3/4-takt, men instruktøren kan koreografere til nesten enhver sang — eller hjelpe dere å velge en versjon som passer. Skriv sangen deres i meldingen når dere sender tidsforspørselen, så sjekker skolen den før dere møter opp.",
  },
];

export default async function BryllupsdansPage() {
  const packages = await db.weddingPackage.findMany({
    include: { school: { select: { name: true, slug: true, city: true } } },
    orderBy: { price: "asc" },
    take: 12,
  });
  const brudevalsGuide = guideBySlug("brudevals-pa-3-timer");

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
      {/* ---------- Hero: butter-tint band ---------- */}
      <section className="tint-butter" aria-labelledby="bryllup-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="grid items-center gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-navy">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Deres første dans på Taktfast
              </p>
              <h1 id="bryllup-h1">Bryllupsdans og brudevals</h1>
              <p className="mt-3 max-w-xl text-[17px] text-tf-body">
                Skal dere ut på dansegulvet foran alle sammen? Her finner dere danseskoler som lærer
                dere brudevalsen — eller koreograferer en hel overraskelsesdans til sangen deres.
                Velg pakke under, og få tidsforslag fra skolen ut fra bryllupsdatoen.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Typer bryllupsdans">
                {["Gruppekurs", "Privattimer", "Koreografi", "Far–datter"].map((chip) => (
                  <li key={chip} className="rounded-full border border-navy/20 bg-white px-3 py-1 text-sm font-semibold text-navy">
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-md shadow-sm lg:min-h-[320px]">
              <Image
                src="/images/bryllupsdans-hero.png"
                alt="Brudepar som øver på sin første dans hos en danseskole"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Slik fungerer det ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="slik-fungerer-det">
        <h2 id="slik-fungerer-det">Slik fungerer det</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2 rounded-md border border-[#CCD2DE] p-4">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full tint-butter font-display text-lg font-bold text-navy" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="text-[18px]">{step.title}</h3>
              <p className="text-sm text-tf-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Pakker ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="pakker">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="pakker">Bryllupspakker fra skolene</h2>
            <p className="mt-1 max-w-2xl text-tf-muted">
              Sortert etter pris. «Book pakke» tar dere rett gjennom til betaling — «Få tidsforslag
              fra skolen» er gratis og uforpliktende.
            </p>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packages.map((p) => {
            const features = (JSON.parse(p.features || "[]") as string[]).slice(0, 5);
            return (
              <li key={p.id} className="flex flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white">
                <div className="tint-butter px-4 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-navy">
                    {TYPE_LABEL[p.type] ?? "Bryllupspakke"}
                  </p>
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <h3 className="text-[18px]">{p.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-sm text-tf-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <Link href={`/skole/${p.school.slug}`} className="font-semibold text-navy hover:underline">
                        {p.school.name}
                      </Link>{" "}
                      · {p.school.city}
                    </p>
                  </div>
                  <p className="text-sm text-tf-body">{p.description}</p>
                  <ul className="space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2E7D32]" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto space-y-2 pt-2">
                    <p className="font-display text-xl font-extrabold text-navy">
                      {fmtNok(p.price)}{" "}
                      <span className="text-sm font-semibold text-tf-muted">
                        {p.priceUnit === "PER_PAR" ? "per par" : "per time"}
                      </span>
                    </p>
                    <BookingPakkeDialog
                      packageId={p.id}
                      packageName={p.name}
                      price={p.price}
                      priceUnit={p.priceUnit}
                      schoolName={p.school.name}
                    />
                    <WeddingRequestDialog schoolId={p.schoolId} schoolName={p.school.name} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        {packages.length === 0 && (
          <p className="rounded-md border border-[#CCD2DE] p-6 text-center text-tf-muted">
            Ingen bryllupspakker publisert ennå — kom snart tilbake.
          </p>
        )}
      </section>

      {/* ---------- Tips ---------- */}
      {brudevalsGuide && (
        <section className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6" aria-labelledby="tips">
          <h2 id="tips">Tips før dere begynner</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
            <Link
              href={`/tips-og-rad/${brudevalsGuide.slug}`}
              className="group flex flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md sm:flex-row"
            >
              <div className="relative aspect-[16/9] w-full sm:aspect-auto sm:w-64">
                <Image
                  src={brudevalsGuide.image}
                  alt={brudevalsGuide.title}
                  fill
                  sizes="(min-width: 640px) 16rem, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="w-fit rounded-full px-2.5 py-0.5 text-xs font-bold text-navy" style={{ backgroundColor: "#FDF6D8" }}>
                  {brudevalsGuide.tag}
                </span>
                <h3 className="text-[20px] group-hover:underline">{brudevalsGuide.title}</h3>
                <p className="text-sm text-tf-muted">{brudevalsGuide.excerpt}</p>
                <p className="link-chevron mt-auto text-sm">
                  Les guiden <span aria-hidden="true">›</span>
                </p>
              </div>
            </Link>
            <InfoBox title="Godt å vite" className="flex flex-col justify-center">
              <p className="flex items-start gap-2">
                <CalendarHeart className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                Gratis avbestilling inntil 48 timer før hver time.
              </p>
              <p className="mt-2 flex items-start gap-2">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                Flere par? Gruppekurs i brudevals er det sosiale — og rimeligste — alternativet.
              </p>
              <p className="mt-3">
                <Link href="/gavekort" className="link-chevron text-sm">
                  Gi et gavekort på dansekurs <span aria-hidden="true">›</span>
                </Link>
              </p>
            </InfoBox>
          </div>
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6" aria-labelledby="faq">
        <h2 id="faq">Ofte stilte spørsmål om bryllupsdans</h2>
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
