import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Tips og råd",
  description:
    "Guider for deg som skal begynne på dansekurs — eller velge riktig stil: priser, salsa eller bachata, å komme alene, brudevals, barnedans og hva du skal ha på deg.",
  alternates: { canonical: "/tips-og-rad" },
};

const TAG_TINT: Record<string, string> = {
  "Priser": "#EEF5FC",
  "Velge stil": "#FFF2E5",
  "Nybegynner": "#EDF5D9",
  "Bryllup": "#FDF6D8",
  "Barn": "#FEEFF6",
  "Første time": "#D9F3F5",
};

const tagTint = (tag: string) => TAG_TINT[tag] ?? "#EEF5FC";

export default function TipsOgRadPage() {
  const [featured, ...rest] = GUIDES;

  return (
    <div className="flex flex-col">
      {/* ---------- Hero ---------- */}
      <section className="bg-sky-pale" aria-labelledby="tips-h1">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <h1 id="tips-h1">Tips og råd</h1>
          <p className="mt-3 max-w-2xl text-[17px] text-tf-body">
            Guider for deg som skal begynne — eller velge riktig kurs. Skrevet av Taktfast-redaksjonen
            sammen med instruktørene hos skolene våre.
          </p>
        </div>
      </section>

      {/* ---------- Utvalgt guide ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6" aria-labelledby="utvalgt">
        <h2 id="utvalgt" className="sr-only">
          Utvalgt guide
        </h2>
        <Link
          href={`/tips-og-rad/${featured.slug}`}
          className="group grid overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md md:grid-cols-2"
        >
          <div className="relative aspect-[16/9] w-full md:aspect-auto md:min-h-[320px]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6">
            <span
              className="w-fit rounded-full px-3 py-1 text-xs font-bold text-navy"
              style={{ backgroundColor: tagTint(featured.tag) }}
            >
              {featured.tag}
            </span>
            <h3 className="text-[26px] leading-tight">{featured.title}</h3>
            <p className="text-[15px] text-tf-muted">{featured.excerpt}</p>
            <p className="flex items-center gap-2 text-sm text-tf-muted">
              <Clock className="h-4 w-4" aria-hidden="true" /> {featured.readMinutes} min lesetid
            </p>
            <p className="link-chevron">
              Les guiden <span aria-hidden="true">›</span>
            </p>
          </div>
        </Link>
      </section>

      {/* ---------- Øvrige guider ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 pb-14 sm:px-6" aria-labelledby="alle-guider">
        <h2 id="alle-guider">Alle guider</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((g) => (
            <li key={g.slug} className="flex flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white">
              <Link href={`/tips-og-rad/${g.slug}`} className="group relative block aspect-[16/9] w-full bg-stripe">
                <Image
                  src={g.image}
                  alt={g.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span
                  className="w-fit rounded-full px-2.5 py-0.5 text-xs font-bold text-navy"
                  style={{ backgroundColor: tagTint(g.tag) }}
                >
                  {g.tag}
                </span>
                <h3 className="text-[19px] leading-snug">
                  <Link href={`/tips-og-rad/${g.slug}`} className="hover:underline">
                    {g.title}
                  </Link>
                </h3>
                <p className="line-clamp-2 text-sm text-tf-muted">{g.excerpt}</p>
                <p className="flex items-center gap-2 text-xs text-tf-muted">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {g.readMinutes} min lesetid
                </p>
                <p className="link-chevron mt-auto text-sm">
                  <Link href={`/tips-og-rad/${g.slug}`}>
                    Les mer <span aria-hidden="true">›</span>
                  </Link>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
