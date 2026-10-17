import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { CookieSettings } from "@/components/site/cookie-settings";

export const metadata: Metadata = {
  title: "Cookie-innstillinger",
  description:
    "Velg hvilke informasjonskapsler Taktfast kan bruke: nødvendige cookies for funksjon, samt valgfrie analyse- og markedsføringscookies.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        title="Cookie-innstillinger"
        sub="Informasjonskapsler gjør siden mer nyttig – her bestemmer du hvilke vi får lov til å bruke."
      />

      <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-14" aria-labelledby="cookie-valg">
        <div className="rounded-md bg-sky-pale p-5 text-[15px] leading-relaxed text-tf-body">
          <p>
            Nødvendige informasjonskapsler holder deg innlogget og lagrer valgene dine, og kan ikke slås av.
            Analyse- og markedsføringscookies er valgfrie – du kan endre mening når som helst på denne siden.
            Les mer i vår{" "}
            <Link href="/personvern" className="font-semibold text-navy underline underline-offset-2 hover:no-underline">
              personvernerklæring
            </Link>
            .
          </p>
        </div>

        <div className="mt-6" id="cookie-valg">
          <span className="sr-only">Cookie-valg</span>
          <CookieSettings />
        </div>
      </section>
    </div>
  );
}
