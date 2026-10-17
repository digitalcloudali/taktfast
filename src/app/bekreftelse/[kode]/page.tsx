// Taktfast /bekreftelse/[kode] — serverkomponent. Henter bestillingsgruppen direkte fra db
// (samme logikk som GET /api/booking/[code]); mutasjoner gjøres fra klientkomponenter via API-ruter.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Check, Clock3, MapPin, X } from "lucide-react";

import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { seatRoleLabel } from "@/lib/constants";
import { fmtNok } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoBox } from "@/components/site/ui-bits";
import { AvbestillKnapp } from "@/components/bekreftelse/avbestill-knapp";
import { QrCard } from "@/components/bekreftelse/qr-card";
import { FullforBetaling } from "@/components/bekreftelse/fullfor-betaling";
import {
  KindChip,
  MethodChip,
  PaymentChip,
  StatusChip,
  capLongDate,
  kindLabel,
  gruppeStatus,
} from "@/components/minside/chips";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kode: string }>;
}): Promise<Metadata> {
  const { kode } = await params;
  return {
    title: `Bekreftelse ${kode}`,
    description: "Din bekreftelse med QR-kode for innsjekk hos danseskolen.",
    robots: { index: false, follow: false },
  };
}

const AVBESTILL_REGLER: Record<string, string> = {
  KURS:
    "Kursrekke: full refusjon ved avbestilling inntil 48 timer før første gang. Etter første gang er det 50 % refusjon inntil andre gang — etter det får du dessverre ingen refusjon.",
  DROPIN:
    "Drop-in: full refusjon inntil 12 timer før timen. Under 12 timer før timen er plassen dessverre ikke refunderbar.",
  KVELD: "Dansekveld: full refusjon inntil 48 timer før arrangementet starter.",
  PRIVATTIME:
    "Privattime: full refusjon inntil 48 timer før avtalt tid. Flytting avtales direkte med skolen.",
  PROVETIME: "Prøvetime: full refusjon inntil 12 timer før timen.",
  PAKKE:
    "Bryllupspakke: avbestilling behandles individuelt av skolen — ta kontakt, så finner vi en god løsning sammen.",
  KLIPPEKORT:
    "Klippekort: klippene forsvinner ikke — de gjelder drop-in og dansekvelder, men kortet er ikke refunderbart.",
  MAANEDSKORT: "Månedskort: refundering behandles av skolen du kjøpte kortet hos.",
};

export default async function BekreftelsePage({ params }: { params: Promise<{ kode: string }> }) {
  const { kode } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/logg-inn?callbackUrl=/bekreftelse/${encodeURIComponent(kode)}`);

  const bookings = await db.booking.findMany({
    where: { code: kode, userId: user.id },
    include: {
      course: { include: { school: true, dates: { orderBy: { date: "asc" } } } },
      night: { include: { school: true } },
      weddingPackage: { include: { school: true } },
      profile: true,
    },
    orderBy: { createdAt: "asc" },
  });
  if (bookings.length === 0) notFound();

  const b0 = bookings[0]!;
  const payment = await db.payment.findFirst({ where: { bookingCode: kode, status: "PAID" } });
  const { status, paymentStatus } = gruppeStatus(bookings);
  const cancelled = status === "CANCELLED";
  const activeIds = bookings.filter((b) => b.status !== "CANCELLED").map((b) => b.id);

  const course = b0.course;
  const night = b0.night;
  // Booking-modellen har ingen school-relasjon i skjemaet — slå skolen opp direkte som fallback
  const school =
    course?.school ??
    night?.school ??
    b0.weddingPackage?.school ??
    (await db.school.findUnique({ where: { id: b0.schoolId }, select: { name: true, address: true, city: true } }));
  const title = course?.title ?? night?.title ?? b0.weddingPackage?.name ?? kindLabel(b0.kind);

  const amount = bookings.reduce((s, b) => s + b.amount, 0);
  const discount = bookings.reduce((s, b) => s + b.discount, 0);
  const klippUsed = bookings.reduce((s, b) => s + b.klippUsed, 0);
  const method = payment?.method ?? b0.paymentMethod;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  let firstDate: Date | null = null;
  let firstTime: string | null = null;
  let tidLinje: string;
  if (night) {
    firstDate = night.date;
    firstTime = night.startTime;
    tidLinje = firstDate ? `${capLongDate(firstDate)}${firstTime ? ` · kl. ${firstTime}` : ""}` : "Tid avtales med skolen";
  } else if (course) {
    const ds = course.dates.map((d) => d.date);
    const neste = ds.find((d) => d.getTime() >= todayStart.getTime()) ?? null;
    firstDate = neste ?? ds[0] ?? null;
    firstTime = firstDate ? course.startTime : null;
    if (firstDate) {
      tidLinje = `${capLongDate(firstDate)}${firstTime ? ` · kl. ${firstTime}` : ""}`;
    } else if (b0.dateId) {
      const spesifik = course.dates.find((d) => d.id === b0.dateId);
      tidLinje = spesifik ? capLongDate(spesifik.date) : "Tid avtales med skolen";
    } else {
      tidLinje = "Tid avtales med skolen";
    }
  } else if (b0.weddingPackage) {
    tidLinje = `${b0.weddingPackage.sessions} ${b0.weddingPackage.sessions === 1 ? "time" : "timer"} à ${b0.weddingPackage.durationMin} min · Tid avtales med skolen`;
  } else {
    tidLinje = "Tid avtales med skolen";
  }

  return (
    <div className="flex flex-col">
      {/* Suksess-hero */}
      <section className={`border-b border-[#CCD2DE] ${cancelled ? "bg-tf-surface" : "bg-sky-pale"}`}>
        <div className="mx-auto w-full max-w-5xl px-4 py-10 text-center sm:px-6">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white ${cancelled ? "bg-[#6B6B6B]" : "bg-[#1B7F3B]"}`}
            aria-hidden="true"
          >
            {cancelled ? <X className="h-8 w-8" /> : <Check className="h-8 w-8" />}
          </div>
          <h1 className="mt-4 font-display text-navy">
            {cancelled
              ? "Bestillingen er avbestilt"
              : status === "CHECKED_IN"
                ? "Innsjekket — god dansetid! 🎉"
                : "Du er påmeldt! 🎉"}
          </h1>
          <p className="mt-2 text-lg text-tf-muted">
            Bekreftelseskode:{" "}
            <span className="font-mono text-base font-bold text-navy">{kode}</span>
          </p>
          {!cancelled && (
            <p className="mt-1 text-sm text-tf-muted">Vi har sendt en bekreftelse til {user.email}.</p>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {paymentStatus === "PENDING" && !cancelled && (
          <div className="mb-6 rounded-md border border-[#E5C55A] bg-tint-butter p-4 sm:p-5">
            <p className="font-display font-bold text-navy">Betalingen er ikke fullført ennå</p>
            <p className="mt-1 text-sm text-[#1A1A1A]">
              Plassen din er reservert, men ikke bekreftet før betalingen går igjennom. Demo: bekreftelsen skjer med
              én gang.
            </p>
            <div className="mt-3">
              <FullforBetaling code={kode} />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Venstrekolonne: QR + handlinger */}
          <div className="space-y-4">
            <QrCard kode={kode} disabled={cancelled} />
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-between">
                <Link href="/min-side">
                  Til Min side <span aria-hidden="true">›</span>
                </Link>
              </Button>
              {!cancelled && (
                <AvbestillKnapp bookingId={activeIds[0] ?? b0.id} bookingIds={activeIds.length > 0 ? activeIds : undefined} />
              )}
            </div>
          </div>

          {/* Høyrekolonne: detaljer */}
          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-display text-navy">
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                    Sted &amp; tid
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                  <p className="font-display text-lg font-bold leading-snug text-navy">{title}</p>
                  <KindChip kind={b0.kind} />
                  <p className="flex items-start gap-2 text-[#1A1A1A]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tf-muted" aria-hidden="true" />
                    <span>
                      {school?.name}
                      <br />
                      {school?.address}
                      <br />
                      {school?.city}
                    </span>
                  </p>
                  <p className="flex items-start gap-2 text-[#1A1A1A]">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-tf-muted" aria-hidden="true" />
                    <span>{tidLinje}</span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-navy">Deltakere</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="nice-scroll max-h-96 divide-y divide-[#E5E8F2] overflow-y-auto">
                    {bookings.map((b) => (
                      <li key={b.id} className="flex flex-wrap items-center gap-x-2.5 gap-y-1 py-2.5 text-sm">
                        <span className="font-semibold text-[#1A1A1A]">{b.profile?.name ?? user.name}</span>
                        <span className="rounded-full bg-sky-pale px-2 py-0.5 text-xs font-semibold text-navy">
                          {seatRoleLabel(b.role)}
                        </span>
                        {b.seatLabel && <span className="text-xs text-tf-muted">{b.seatLabel}</span>}
                        <span className="ml-auto">
                          {b.checkedInAt ? (
                            <span className="text-xs font-bold text-[#1B7F3B]">✓ Innsjekket</span>
                          ) : b.status === "CANCELLED" ? (
                            <span className="text-xs font-semibold text-tf-muted">Avbestilt</span>
                          ) : (
                            <StatusChip status={b.status} />
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-navy">Betaling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-tf-muted">Deltakere</span>
                  <span>{bookings.length}</span>
                </div>
                {klippUsed > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-tf-muted">Brukte klipp</span>
                    <span>{klippUsed}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-tf-muted">Rabatt</span>
                    <span className="text-[#1B7F3B]">−{fmtNok(discount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-[#CCD2DE] pt-2 font-display text-lg font-bold text-navy">
                  <span>Totalt</span>
                  <span>{fmtNok(amount)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <MethodChip method={method} />
                  <PaymentChip status={paymentStatus} />
                </div>
              </CardContent>
            </Card>

            <InfoBox title="Avbestillingsregler">
              {AVBESTILL_REGLER[b0.kind] ??
                "Avbestilling behandles etter skolens vilkår — ta kontakt med skolen eller kundeservice."}{" "}
              Du finner knapp for avbestilling til venstre, eller under Mine kurs på Min side.
            </InfoBox>
          </div>
        </div>
      </div>
    </div>
  );
}
