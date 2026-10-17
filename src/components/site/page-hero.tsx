import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Delt sidehode for statiske sider: lys himmelblå band (bg-sky-pale eller
 * valgfri tint) med h1 + valgfri undertekst og valgfritt sidebilde.
 * Serverkomponent — ingen klient-JS.
 */
export function PageHero({
  title,
  sub,
  image,
  imageAlt = "",
  tint,
  className,
}: {
  title: string;
  sub?: string;
  image?: string;
  imageAlt?: string;
  /** Valgfri bakgrunnsfarge (CSS-farge eller Tailwind-tint), ellers bg-sky-pale */
  tint?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(!tint && "bg-sky-pale", className)}
      style={tint ? { backgroundColor: tint } : undefined}
      aria-labelledby="page-hero-title"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:py-12">
        <div className="max-w-2xl">
          <h1 id="page-hero-title" className="text-balance">{title}</h1>
          {sub && <p className="mt-3 max-w-2xl text-[17px] text-tf-body">{sub}</p>}
        </div>
        {image && (
          <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-md border border-[#CCD2DE] md:h-40 md:w-80 lg:h-44">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 768px) 320px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>
    </section>
  );
}
