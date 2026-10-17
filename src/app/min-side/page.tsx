// Taktfast /min-side — serverkomponent. Data via lib/data + db direkte; mutasjoner gjøres
// fra klientkomponenter mot API-ruter (aldri server actions). All UI-tekst på norsk bokmål.

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Heart, Ticket, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { myBookings, myFavorites, myKlippekort, myWaitlist } from "@/lib/data";
import { seatRoleLabel } from "@/lib/constants";
import { fmtNok } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CourseCard } from "@/components/course/course-card";
import { InfoBox } from "@/components/site/ui-bits";
import { AvbestillKnapp } from "@/components/bekreftelse/avbestill-knapp";
import {
  KindChip,
  MethodChip,
  MIN_SIDE_TABS,
  PaymentChip,
  StatusChip,
  capLongDate,
  kindLabel,
  gruppeStatus,
  shortDateYear,
  type MinSideTabValue,
} from "@/components/minside/chips";
import { MinSideTabs } from "@/components/minside/min-side-tabs";
import { VentelisteListe, type VentelisteEntryVM } from "@/components/minside/venteliste-liste";
import { DeltakereSeksjon, type DeltakerVM } from "@/components/minside/deltakere-seksjon";

export const metadata: Metadata = {
  title: "Min side",
  description:
    "Oversikt over dine dansekurs og bekreftelser, ventelister, favoritter, deltakere, klippekort og kvitteringer.",
};

type B = Awaited<ReturnType<typeof myBookings>>[number];

type SeatVM = {
  id: string;
  name: string;
  role: string;
  seatLabel: string | null;
  amount: number;
  status: string;
  innsjekket: boolean;
};

type GroupVM = {
  code: string;
  kind: string;
  status: string;
  paymentStatus: string;
  method: string;
  amount: number;
  discount: number;
  klippUsed: number;
  createdAt: Date;
  activeIds: string[];
  isPast: boolean;
  title: string;
  schoolName: string;
  schoolCity: string;
  nextDate: Date | null;
  nextTime: string | null;
  lastDate: Date | null;
  seats: SeatVM[];
};

/** Dato-linjen på et bestillingskort */
function datoLinje(g: GroupVM): string {
  if (g.kind === "KLIPPEKORT" || g.kind === "MAANEDSKORT") {
    return "Klippene dine gjelder drop-in og dansekvelder";
  }
  if (g.nextDate && !g.isPast) {
    return `Neste gang: ${capLongDate(g.nextDate)}${g.nextTime ? ` · kl. ${g.nextTime}` : ""}`;
  }
  if (g.isPast && g.lastDate) {
    return `Avsluttet · siste gang ${capLongDate(g.lastDate)}${g.nextTime ? ` · kl. ${g.nextTime}` : ""}`;
  }
  if (g.isPast && g.nextDate) {
    return `Gjennomført ${capLongDate(g.nextDate)}${g.nextTime ? ` · kl. ${g.nextTime}` : ""}`;
  }
  return "Tid avtales med skolen";
}

function OppsummeringChip({ icon: Icon, verdi, etikett }: { icon: LucideIcon; verdi: number; etikett: string }) {
  return (
    <div className="flex min-w-40 items-center gap-3 rounded-md border border-[#CCD2DE] bg-white px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-pale text-navy">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block font-display text-xl font-bold leading-tight text-navy">{verdi.toLocaleString("nb-NO")}</span>
        <span className="block text-sm text-tf-muted">{etikett}</span>
      </span>
    </div>
  );
}

function BookingKort({ g }: { g: GroupVM }) {
  return (
    <article className="rounded-md border border-[#CCD2DE] bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <KindChip kind={g.kind} />
        <StatusChip status={g.status} />
        <PaymentChip status={g.paymentStatus} />
        <span className="ml-auto font-mono text-xs text-tf-muted">{g.code}</span>
      </div>

      <h3 className="mt-3 font-display text-xl font-bold text-navy">{g.title}</h3>
      <p className="text-sm text-tf-muted">{[g.schoolName, g.schoolCity].filter(Boolean).join(" · ")}</p>

      <p className="mt-2 flex items-center gap-2 text-sm text-[#1A1A1A]">
        <CalendarDays className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
        <span>{datoLinje(g)}</span>
      </p>

      <ul className="mt-3 divide-y divide-[#E5E8F2] border-t border-[#CCD2DE]">
        {g.seats.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
            <Users className="h-4 w-4 shrink-0 text-tf-muted" aria-hidden="true" />
            <span className="font-semibold text-[#1A1A1A]">{s.name}</span>
            <span className="rounded-full bg-sky-pale px-2 py-0.5 text-xs font-semibold text-navy">
              {seatRoleLabel(s.role)}
            </span>
            {s.seatLabel && <span className="text-xs text-tf-muted">{s.seatLabel}</span>}
            <span className="text-tf-muted">{fmtNok(s.amount)}</span>
            {s.innsjekket && (
              <span className="ml-auto text-xs font-bold text-[#1B7F3B]">✓ Innsjekket</span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="font-display text-lg font-bold text-navy">{fmtNok(g.amount)}</p>
        {g.klippUsed > 0 && <span className="text-sm text-tf-muted">{g.klippUsed} klipp brukt</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/bekreftelse/${g.code}`}>
              Se bekreftelse &amp; QR <span aria-hidden="true">›</span>
            </Link>
          </Button>
          {!g.isPast && (
            <AvbestillKnapp
              bookingId={g.activeIds[0] ?? g.code}
              bookingIds={g.activeIds.length > 0 ? g.activeIds : undefined}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export default async function MinSidePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/logg-inn?callbackUrl=/min-side");

  const sp = await searchParams;
  const tabParam = typeof sp.tab === "string" ? sp.tab : "mine-kurs";
  const defaultTab: MinSideTabValue = MIN_SIDE_TABS.some((t) => t.value === tabParam)
    ? (tabParam as MinSideTabValue)
    : "mine-kurs";

  const [bookingsRaw, waitlist, favorites, klippekort, profiles] = await Promise.all([
    myBookings(user.id),
    myWaitlist(user.id),
    myFavorites(user.id),
    myKlippekort(user.id),
    db.deltakerProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);

  // ---------- Grupper bookinger per kode (QR-koden gjelder hele bestillingen) ----------
  const now = Date.now();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const groupsMap = new Map<string, B[]>();
  for (const b of bookingsRaw) {
    const arr = groupsMap.get(b.code);
    if (arr) arr.push(b);
    else groupsMap.set(b.code, [b]);
  }

  const courseIds = [...new Set(bookingsRaw.map((b) => b.courseId).filter((x): x is string => !!x))];
  const schoolIds = [...new Set(bookingsRaw.map((b) => b.schoolId))];
  type DatoRad = { id: string; courseId: string; date: Date; startTime: string };
  type SkoleRad = { id: string; name: string; city: string };
  const tommeDatoer: DatoRad[] = [];
  const tommeSkoler: SkoleRad[] = [];
  const [courseDates, schools] = await Promise.all([
    courseIds.length > 0
      ? db.courseDate.findMany({
          where: { courseId: { in: courseIds } },
          orderBy: { date: "asc" },
          select: { id: true, courseId: true, date: true, startTime: true },
        })
      : Promise.resolve(tommeDatoer),
    schoolIds.length > 0
      ? db.school.findMany({ where: { id: { in: schoolIds } }, select: { id: true, name: true, city: true } })
      : Promise.resolve(tommeSkoler),
  ]);
  const datesByCourse = new Map<string, Date[]>();
  for (const d of courseDates) {
    const arr = datesByCourse.get(d.courseId);
    if (arr) arr.push(d.date);
    else datesByCourse.set(d.courseId, [d.date]);
  }
  const dateById = new Map(courseDates.map((d) => [d.id, d]));
  const schoolById = new Map(schools.map((s) => [s.id, s]));

  const groups: GroupVM[] = [];
  for (const [code, bs] of groupsMap) {
    const b0 = bs[0];
    if (!b0) continue;
    const { status, paymentStatus } = gruppeStatus(bs);
    const course = b0.course;
    const school = schoolById.get(b0.schoolId);
    const title = course?.title ?? b0.night?.title ?? b0.weddingPackage?.name ?? kindLabel(b0.kind);
    const schoolName = course?.school.name ?? b0.night?.school.name ?? school?.name ?? "";
    const schoolCity = school?.city ?? "";

    let nextDate: Date | null = null;
    let nextTime: string | null = null;
    let lastDate: Date | null = null;
    if (b0.night) {
      nextDate = b0.night.date;
      nextTime = b0.night.startTime;
    } else if (course) {
      const spesifik =
        b0.dateId && (b0.kind === "DROPIN" || b0.kind === "PROVETIME") ? dateById.get(b0.dateId) : undefined;
      if (spesifik) {
        nextDate = spesifik.date;
        nextTime = spesifik.startTime;
      } else {
        const ds = datesByCourse.get(course.id) ?? [];
        nextDate = ds.find((d) => d.getTime() >= todayStart.getTime()) ?? null;
        lastDate = ds.length > 0 ? (ds[ds.length - 1] ?? null) : null;
        if (nextDate) nextTime = course.startTime;
        else if (lastDate) nextTime = course.startTime;
      }
    }

    const datePast = nextDate !== null && nextDate.getTime() < now;
    const courseOver =
      !b0.night && !!course && nextDate === null && (datesByCourse.get(course.id)?.length ?? 0) > 0;
    const isPast = status === "CANCELLED" || status === "COMPLETED" || datePast || courseOver;

    groups.push({
      code,
      kind: b0.kind,
      status,
      paymentStatus,
      method: b0.paymentMethod,
      amount: bs.reduce((s, b) => s + b.amount, 0),
      discount: bs.reduce((s, b) => s + b.discount, 0),
      klippUsed: bs.reduce((s, b) => s + b.klippUsed, 0),
      createdAt: b0.createdAt,
      activeIds: bs.filter((b) => b.status !== "CANCELLED").map((b) => b.id),
      isPast,
      title,
      schoolName,
      schoolCity,
      nextDate,
      nextTime,
      lastDate,
      seats: bs.map((b) => ({
        id: b.id,
        name: b.profile?.name ?? user.name,
        role: b.role,
        seatLabel: b.seatLabel,
        amount: b.amount,
        status: b.status,
        innsjekket: !!b.checkedInAt,
      })),
    });
  }

  const kommende = groups
    .filter((g) => !g.isPast)
    .sort((a, b) => (a.nextDate?.getTime() ?? Infinity) - (b.nextDate?.getTime() ?? Infinity));
  const tidligere = groups
    .filter((g) => g.isPast)
    .sort(
      (a, b) =>
        (b.nextDate?.getTime() ?? b.createdAt.getTime()) - (a.nextDate?.getTime() ?? a.createdAt.getTime()),
    );

  const klippIgjen = klippekort.reduce((s, k) => s + Math.max(0, k.clips - k.used), 0);
  const fornavn = user.name.trim().split(/\s+/)[0] ?? user.name;

  // ---------- Mine kurs ----------
  const mineKursNode =
    groups.length === 0 ? (
      <InfoBox className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Du har ingen kurs eller bestillinger ennå — finn ditt første kurs og meld deg på!</span>
        <Link href="/sok" className="link-chevron shrink-0 text-[15px]">
          Finn dansekurs <span aria-hidden="true">›</span>
        </Link>
      </InfoBox>
    ) : (
      <div className="space-y-6">
        {kommende.length > 0 && (
          <section aria-label="Kommende kurs og bestillinger" className="space-y-4">
            {kommende.map((g) => (
              <BookingKort key={g.code} g={g} />
            ))}
          </section>
        )}
        {tidligere.length > 0 && (
          <details className="rounded-md border border-[#CCD2DE] bg-white">
            <summary className="cursor-pointer select-none px-4 py-3.5 font-display font-bold text-navy">
              Tidligere kurs ({tidligere.length})
            </summary>
            <div className="space-y-4 border-t border-[#CCD2DE] p-4">
              {tidligere.map((g) => (
                <BookingKort key={g.code} g={g} />
              ))}
            </div>
          </details>
        )}
      </div>
    );

  // ---------- Venteliste ----------
  const ventelisteVM: VentelisteEntryVM[] = waitlist.map((e) => ({
    id: e.id,
    status: e.status,
    position: e.position,
    roleLabel: seatRoleLabel(e.role),
    courseTitle: e.course.title,
    schoolName: e.course.school.name,
    offerExpiresLabel: e.offerExpiresAt
      ? `Tilbudet gjelder til ${capLongDate(e.offerExpiresAt)} · kl. ${e.offerExpiresAt
          .toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`
      : "Tilbudet gjelder i 24 timer fra du fikk varselet",
  }));

  const ventelisteNode =
    ventelisteVM.length > 0 ? (
      <VentelisteListe entries={ventelisteVM} />
    ) : (
      <InfoBox className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Du står ikke i kø nå. Når et kurs blir fullt, kan du stille deg i kø fra kurssiden — vi varsler deg hvis en
          plass åpner seg.
        </span>
        <Link href="/sok" className="link-chevron shrink-0 text-[15px]">
          Finn dansekurs <span aria-hidden="true">›</span>
        </Link>
      </InfoBox>
    );

  // ---------- Favoritter ----------
  const favoritterNode =
    favorites.length > 0 ? (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((f) => (
          <CourseCard key={f.favId} course={f.course} favorited />
        ))}
      </div>
    ) : (
      <InfoBox className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>Du har ikke lagret noen favoritter ennå — trykk på hjertet på et kurs, så samles de her.</span>
        <Link href="/sok" className="link-chevron shrink-0 text-[15px]">
          Finn dansekurs <span aria-hidden="true">›</span>
        </Link>
      </InfoBox>
    );

  // ---------- Deltakere ----------
  const deltakereVM: DeltakerVM[] = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    birthYear: p.birthYear,
    isChild: p.isChild,
    consent: p.consent,
  }));
  const deltakereNode = <DeltakereSeksjon profiles={deltakereVM} />;

  // ---------- Klippekort ----------
  const klippekortNode =
    klippekort.length > 0 ? (
      <div className="space-y-4">
        <ul className="grid gap-4 sm:grid-cols-2">
          {klippekort.map((k) => {
            const igjen = Math.max(0, k.clips - k.used);
            return (
              <li key={k.id} className="rounded-md border border-[#CCD2DE] bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-bold text-navy">{k.clips}-klipp</p>
                  <p className="font-display font-bold text-navy">{fmtNok(k.price)}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
                  {Array.from({ length: k.clips }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-3.5 w-3.5 rounded-full ${i < igjen ? "bg-navy" : "border border-[#CCD2DE] bg-[#F2F2F2]"}`}
                    />
                  ))}
                </div>
                <p className="mt-3 font-semibold text-[#1A1A1A]">
                  {igjen} av {k.clips} klipp igjen
                </p>
                <p className="text-sm text-tf-muted">
                  Kjøpt {shortDateYear(k.purchasedAt)} ·{" "}
                  {k.expiresAt ? `Gyldig til ${shortDateYear(k.expiresAt)}` : "Uten utløpsdato"}
                </p>
              </li>
            );
          })}
        </ul>
        <InfoBox title="Slik bruker du klippene">
          Klippekort gjelder drop-in og dansekvelder. Velg klippekort som betaling når du melder deg på, så trekkes
          ett klipp per plass automatisk.
        </InfoBox>
      </div>
    ) : (
      <InfoBox className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Du har ingen klippekort. Klippekort gjelder drop-in og dansekvelder — perfekt hvis du vil danse når det
          passer deg.
        </span>
        <Link href="/dansekvelder" className="link-chevron shrink-0 text-[15px]">
          Se dansekvelder <span aria-hidden="true">›</span>
        </Link>
      </InfoBox>
    );

  // ---------- Kvitteringer ----------
  const kvitteringerNode =
    groups.length > 0 ? (
      <div className="nice-scroll max-h-96 overflow-y-auto rounded-md border border-[#CCD2DE]">
        <Table>
          <TableHeader>
            <TableRow className="bg-tf-surface">
              <TableHead>Kode</TableHead>
              <TableHead>Dato</TableHead>
              <TableHead>Beløp</TableHead>
              <TableHead>Betalingsmetode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Kvittering</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...groups]
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((g) => (
                <TableRow key={g.code} className="stripe-row">
                  <TableCell>
                    <span className="font-mono text-xs font-semibold text-navy">{g.code}</span>
                    <br />
                    <span className="text-xs text-tf-muted">{kindLabel(g.kind)}</span>
                  </TableCell>
                  <TableCell>{shortDateYear(g.createdAt)}</TableCell>
                  <TableCell className="font-semibold">{fmtNok(g.amount)}</TableCell>
                  <TableCell>
                    <MethodChip method={g.method} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={g.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link className="link-chevron whitespace-nowrap text-sm" href={`/bekreftelse/${g.code}`}>
                      Kvittering/PDF-aktig visning <span aria-hidden="true">›</span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    ) : (
      <InfoBox>Du har ingen kvitteringer ennå — de dukker opp her etter din første bestilling.</InfoBox>
    );

  return (
    <div className="flex flex-col">
      <header className="border-b border-[#CCD2DE] bg-sky-pale">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-navy">Hei, {fornavn}! 👋</h1>
          <p className="mt-1 max-w-2xl text-lg text-tf-muted">
            Her har du oversikten over kursene, ventelistene og kvitteringene dine.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <OppsummeringChip icon={CalendarDays} verdi={kommende.length} etikett="kommende kurs" />
            <OppsummeringChip icon={Ticket} verdi={klippIgjen} etikett="klipp igjen" />
            <OppsummeringChip
              icon={Heart}
              verdi={favorites.length}
              etikett={favorites.length === 1 ? "favoritt" : "favoritter"}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <MinSideTabs
          defaultTab={defaultTab}
          antallVenteliste={ventelisteVM.length}
          slots={{
            "mine-kurs": mineKursNode,
            venteliste: ventelisteNode,
            favoritter: favoritterNode,
            deltakere: deltakereNode,
            klippekort: klippekortNode,
            kvitteringer: kvitteringerNode,
          }}
        />
      </div>
    </div>
  );
}
