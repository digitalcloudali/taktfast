"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ribbon, Stars, RoleBalanceBar, StyleChip } from "@/components/site/ui-bits";
import { fmtNok, fmtDate, fmtWeekday, type CourseCardData } from "@/lib/types";

export function CourseCard({ course, favorited = false }: { course: CourseCardData; favorited?: boolean }) {
  const [fav, setFav] = useState(favorited);
  const [busy, setBusy] = useState(false);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setBusy(true);
    try {
      const res = await fetch("/api/favoritter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      if (res.status === 401) {
        window.location.href = `/logg-inn?callbackUrl=/kurs/${course.slug}`;
        return;
      }
      const data = await res.json();
      setFav(!!data.favorited);
    } finally {
      setBusy(false);
    }
  }

  const prisLinje =
    course.pricePer === "PAR"
      ? `${fmtNok(course.price)} per par`
      : `${fmtNok(course.price)} per person`;

  return (
    <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-md border border-[#CCD2DE] bg-white transition-shadow hover:shadow-md">
      <Link href={`/kurs/${course.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#F2F2F2]" aria-label={course.title}>
        <Image
          src={course.imageUrl}
          alt={`${course.styleName} – ${course.title} hos ${course.schoolName}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {course.ribbons.map((r) => <Ribbon key={r} kind={r} />)}
        </div>
      </Link>

      <button
        onClick={toggleFav}
        disabled={busy}
        aria-label={fav ? "Fjern fra favoritter" : "Lagre som favoritt"}
        aria-pressed={fav}
        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
      >
        <Heart className={`h-5 w-5 ${fav ? "fill-[#D6001C] text-[#D6001C]" : "text-navy"}`} />
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <StyleChip name={course.styleName} tint={course.tint} />
          {course.format === "DROPIN" && <span className="text-xs font-semibold text-[#6B6B6B]">Drop-in</span>}
        </div>

        <Link href={`/kurs/${course.slug}`} className="font-display text-lg font-bold leading-snug text-navy hover:underline">
          {course.title}
        </Link>

        <p className="text-sm text-[#6B6B6B]">
          {course.schoolName} · {course.district ? `${course.district}, ` : ""}{course.city}
        </p>
        <p className="text-sm text-[#1A1A1A]">
          <span className="font-semibold">{fmtWeekday(course.weekday)} {course.startTime}</span> · {course.durationMin} min
        </p>
        <p className="text-sm text-[#6B6B6B]">
          {course.sessions > 1 ? `${course.sessions} ganger fra ${fmtDate(course.startDate)}` : `${fmtDate(course.startDate)}`}
        </p>

        <div className="mt-1"><Stars value={course.ratingAvg} count={course.ratingCount} /></div>

        {course.isPartnerStyle ? (
          <RoleBalanceBar forereFree={course.forereFree} folgereFree={course.folgereFree} compact />
        ) : (
          <p className={`text-xs font-semibold ${course.seatsLeft > 0 ? "text-[#1C3F78]" : "text-signal"}`}>
            {course.seatsLeft > 0 ? `${course.seatsLeft} ledige plasser` : "Fullt – venteliste"}
          </p>
        )}

        <div className="mt-auto pt-2">
          <p className="text-lg font-bold text-navy">
            {course.studentPrice ? <>fra {fmtNok(course.studentPrice)} <span className="text-sm font-medium text-[#6B6B6B]">(student)</span></> : prisLinje}
          </p>
          {course.dropInPrice != null && (
            <p className="text-sm text-[#6B6B6B]">Drop-in {fmtNok(course.dropInPrice)}</p>
          )}
          <Button asChild className="mt-3 w-full">
            <Link href={`/kurs/${course.slug}`}>{course.seatsLeft > 0 || course.forereFree + course.folgereFree > 0 ? "Meld deg på" : "Bli med på venteliste"}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
