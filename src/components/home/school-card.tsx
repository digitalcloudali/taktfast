import Image from "next/image";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Stars } from "@/components/site/ui-bits";
import type { SchoolCardData } from "@/lib/types";

/** Kort for danseskole – brukes på forsiden, bysider og skolelister */
export function SchoolCard({ school }: { school: SchoolCardData }) {
  return (
    <Link
      href={`/danseskoler/${school.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F2]">
        <Image
          src={school.coverImage}
          alt={`${school.name} – danseskole i ${school.city}`}
          fill
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 24vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-tight">{school.name}</h3>
          {school.verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-navy ring-1 ring-[#CCD2DE]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verifisert
            </span>
          )}
        </div>
        <p className="text-sm text-[#6B6B6B]">
          {school.city}
          {school.district ? ` · ${school.district}` : ""}
        </p>
        <p className="line-clamp-2 text-sm text-[#1A1A1A]">{school.tagline}</p>
        <Stars value={school.ratingAvg} count={school.ratingCount} />
        <span className="link-chevron mt-auto text-[15px]">
          Les mer <span aria-hidden="true">›</span>
        </span>
      </div>
    </Link>
  );
}
