import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { InfoBox } from "@/components/site/ui-bits";

export const metadata: Metadata = {
  title: "Om Taktfast",
  description:
    "Taktfast er en uavhengig markedsplass for dansekurs i hele Norge. Sammenlign skoler, stiler og priser – og book på minutter. Alle kan lære å danse.",
  alternates: { canonical: "/om-oss" },
};

const TALL = [
  { value: "51", label: "danseskoler" },
  { value: "17", label: "dansestiler" },
  { value: "20+", label: "byer" },
  { value: "350+", label: "kurs i kalenderen" },
] as const;

const VERDIER = [
  {
    icon: Search,
    title: "Transparent og sammenlignbart",
    text: "Alle priser, tidspunkter, nivåer og ledige plasser vises like frem – slik at du kan finne kurset som passer deg, ikke oss.",
  },
  {
    icon: ShieldCheck,
    title: "Verifiserte danseskoler",
    text: "Vi samarbeider bare med etablerte danseskoler, og alle betalinger går gjennom vår trygge kasse med Vipps.",
  },
  {
    icon: HeartHandshake,
    title: "Alle kan lære å danse",
    text: "Det finnes ikke «feil» kropp eller feil rytme. Vi jobber for at dans skal være for alle – alene, i par eller sammen med hele familien.",
  },
] as const;

export default function OmOssPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Om Taktfast"
        sub="Norges uavhengige markedsplass for dansekurs – med én felles kasse, ærlige priser og en kalender som alltid er oppdatert."
        image="/images/socialdans.png"
        imageAlt="Par som danser sosialdans med smil i en lys dansesal"
      />

      {/* ---------- Misjon ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="misjon">
        <div className="max-w-3xl">
          <h2 id="misjon">Vår misjon</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Taktfast ble startet med en enkel tanke: Det skal være like lett å finne et dansekurs
            som å finne en restaurant. I dag er tilbudet spredt over mange flotte, men små
            danseskoler – med egne nettsider, egne løsninger og vanskelig å sammenligne. Vi samler
            dem på ett sted, uavhengig av kjede og eier.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Hos oss ser du ekte timeplaner, transparente priser og hvor mange plasser som faktisk
            er ledige. Du betaler trygt med Vipps, og du kan avbestille gratis frem til 48 timer
            før kursstart. Resten er opp til deg: finn stilen, kom alene eller med partner – og
            bli med fra første takt.
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Fordi alle kan lære å danse.
          </p>
        </div>
      </section>

      {/* ---------- Tall ---------- */}
      <section className="bg-sky-pale" aria-label="Taktfast i tall">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {TALL.map((t) => (
            <div key={t.label} className="text-center md:text-left">
              <p className="font-display text-4xl font-extrabold text-navy lg:text-5xl">{t.value}</p>
              <p className="mt-1 text-sm font-medium text-tf-muted">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Verdier ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="verdier">
        <h2 id="verdier">Det vi tror på</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {VERDIER.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-pale" aria-hidden="true">
                <Icon className="h-5 w-5 text-navy" />
              </span>
              <h3 className="mt-4 text-xl">{title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-tf-body">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Team + demo-notat ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 lg:pb-16" aria-labelledby="teamet">
        <div className="max-w-3xl">
          <h2 id="teamet">Teamet bak</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-tf-body">
            Vi er et lite team i Oslo med røtter fra både dansegulvet og produktutvikling. Noen av
            oss har konkurrert, andre holder bare takten på dansekveldene – alle deler gledest
            over å se nye ansikter våge seg ut på gulvet for første gang.
          </p>
        </div>
        <InfoBox className="mt-6 max-w-3xl" title="Demo-prosjekt">
          Taktfast er et demo-prosjekt med fiktive skoler og personer. Navn, instruktører,
          anmeldelser og priser er laget for illustrasjon, og betalinger simuleres.
        </InfoBox>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/sok">
            <Button className="h-11 px-6">Finn ditt dansekurs</Button>
          </Link>
          <Link href="/slik-fungerer-det">
            <Button variant="outline" className="h-11 px-6">Slik fungerer det</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
