import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUIDES, guideBySlug } from "@/lib/guides";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Guide ikke funnet" };
  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: { canonical: `/tips-og-rad/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.excerpt,
      images: [{ url: guide.image, alt: guide.title }],
    },
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const others = GUIDES.filter((g) => g.slug !== guide.slug);
  const SITE = "https://taktfast.no";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    image: [`${SITE}${guide.image}`],
    articleSection: guide.tag,
    inLanguage: "nb-NO",
    author: { "@type": "Organization", name: "Taktfast" },
    publisher: { "@type": "Organization", name: "Taktfast" },
    mainEntityOfPage: `${SITE}/tips-og-rad/${guide.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hjem", item: SITE },
      { "@type": "ListItem", position: 2, name: "Tips og råd", item: `${SITE}/tips-og-rad` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${SITE}/tips-og-rad/${guide.slug}` },
    ],
  };

  return (
    <div className="flex flex-col">
      <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Brødsmulesti" className="mb-4 text-sm text-tf-muted">
          <Link href="/" className="font-semibold text-navy hover:underline">
            Hjem
          </Link>{" "}
          /{" "}
          <Link href="/tips-og-rad" className="font-semibold text-navy hover:underline">
            Tips og råd
          </Link>{" "}
          / <span aria-current="page">{guide.tag}</span>
        </nav>

        <h1 className="text-balance">{guide.title}</h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tf-muted">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" /> {guide.readMinutes} min lesetid
          </span>
          <span aria-hidden="true">·</span>
          <span className="rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-bold text-navy">{guide.tag}</span>
        </p>

        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-md shadow-sm">
          <Image src={guide.image} alt={guide.title} fill priority sizes="(min-width: 768px) 48rem, 100vw" className="object-cover" />
        </div>

        <p className="mt-6 text-[19px] font-medium leading-relaxed text-tf-body">{guide.excerpt}</p>

        <div className="mt-4 space-y-8">
          {guide.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-[24px]">{s.heading}</h2>
              <p className="mt-2 text-[17px] leading-relaxed text-tf-body">{s.body}</p>
            </section>
          ))}
        </div>

        {/* ---------- CTA ---------- */}
        <aside className="mt-10 rounded-md bg-sky-pale p-6 text-center">
          <h2 className="text-[22px]">Finn ditt kurs på Taktfast</h2>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-tf-body">
            Sammenlign priser, se ledige plasser og book hos verifiserte danseskoler i hele Norge.
          </p>
          <Link href="/sok" className="mt-4 inline-block">
            <Button size="lg">Søk blant alle kurs</Button>
          </Link>
        </aside>
      </article>

      {/* ---------- Flere guider ---------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6" aria-labelledby="flere-guider">
        <h2 id="flere-guider">Flere guider</h2>
        <div className="snap-row mt-5">
          {others.map((g) => (
            <Link
              key={g.slug}
              href={`/tips-og-rad/${g.slug}`}
              className="group flex w-[260px] flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white sm:w-[300px]"
            >
              <div className="relative aspect-[16/10] w-full bg-stripe">
                <Image src={g.image} alt={g.title} fill sizes="300px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="w-fit rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-bold text-navy">{g.tag}</span>
                <h3 className="text-[17px] leading-snug group-hover:underline">{g.title}</h3>
                <p className="text-xs text-tf-muted">{g.readMinutes} min lesetid</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
    </div>
  );
}
