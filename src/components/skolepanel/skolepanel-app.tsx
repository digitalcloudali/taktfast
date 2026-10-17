"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CalendarDays,
  CalendarRange,
  HeartHandshake,
  Hourglass,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  ScanLine,
  Star,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Stars } from "@/components/site/ui-bits";
import { toast } from "@/hooks/use-toast";
import {
  AGE_GROUPS,
  DANCE_STYLES,
  FORMATS,
  LEVELS,
  NORWEGIAN_WEEKDAYS,
  formatDateNb,
  formatDateTimeNb,
  formatLabel,
  levelLabel,
  seatRoleLabel,
  styleName,
  weekdayName,
} from "@/lib/constants";
import { StatusChip, courseStatusLabel, privatStatusLabel } from "./status-chip";

/* ---------------------------------- Hjelpere ---------------------------------- */

type ApiOptions = { method?: "POST" | "PATCH"; body?: unknown };

async function api<T>(url: string, options?: ApiOptions): Promise<T> {
  const res = await fetch(url, {
    method: options?.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const json = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) throw new Error(json?.error ?? "Noe gikk galt. Prøv igjen.");
  return json as T;
}

const kr = (n: number) => `${n.toLocaleString("nb-NO")} kr`;
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const fmtDatoLang = (iso: string) =>
  new Date(iso).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
const erIdag = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

/** Felles datahentings-hook for panelets faner: skjelett, feil-toast og gjenhenting. */
function useSkoleData<T>(url: string, errTitle: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const doFetch = useCallback(async () => {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    const json = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) throw new Error(json?.error ?? errTitle);
    return json as T;
  }, [url, errTitle]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const d = await doFetch();
        if (live) {
          setData(d);
          setError(null);
        }
      } catch (err) {
        if (live) {
          const msg = err instanceof Error ? err.message : errTitle;
          setError(msg);
          toast({ title: errTitle, description: msg, variant: "destructive" });
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [doFetch, errTitle]);

  const reload = useCallback(
    async (silent = false): Promise<T | null> => {
      try {
        const d = await doFetch();
        setData(d);
        setError(null);
        return d;
      } catch (err) {
        const msg = err instanceof Error ? err.message : errTitle;
        setError(msg);
        if (!silent) toast({ title: errTitle, description: msg, variant: "destructive" });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [doFetch, errTitle]
  );

  return { data, loading, error, reload };
}

/* --------------------------------- Småbyggeklosser --------------------------------- */

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: ReactNode }) {
  return (
    <div className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-navy">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[#6B7280]">{hint}</p>}
    </div>
  );
}

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full rounded-md" />
      ))}
    </div>
  );
}

function ErrorBox({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#CCD2DE] bg-sky-pale p-4">
      <p className="text-sm font-medium text-navy">{msg}</p>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Prøv igjen
      </Button>
    </div>
  );
}

function EmptyBox({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-md border border-[#CCD2DE] bg-sky-pale p-6 text-center">
      <p className="font-display font-bold text-navy">{title}</p>
      {body && <p className="mt-1 text-sm text-[#6B7280]">{body}</p>}
    </div>
  );
}

/** Gjenbrukbart svarskjema (anmeldelser + meldinger). Returnerer true ved suksess. */
function SvarSkjema({
  label,
  placeholder,
  busy,
  maxLength,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  busy: boolean;
  maxLength: number;
  onSubmit: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const t = text.trim();
        if (t.length < 2) {
          toast({ title: "Skriv minst to tegn.", variant: "destructive" });
          return;
        }
        const ok = await onSubmit(t);
        if (ok) setText("");
      }}
    >
      <Textarea
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={maxLength}
        disabled={busy}
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={busy || text.trim().length < 2}>
          {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
          Send svar
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------ Typer ------------------------------------ */

type InnsjekkResp = { ok: boolean; name: string; seatLabel?: string; already?: boolean };

type OversiktDeltaker = {
  id: string;
  name: string;
  role: string;
  seatLabel: string | null;
  status: string;
  checkedInAt: string | null;
  code: string;
};

type OversiktDato = {
  dateId: string;
  date: string;
  courseId: string;
  courseTitle: string;
  unit: string;
  capacity: number;
  startTime: string;
  schoolName: string;
  attendees: OversiktDeltaker[];
  forere: number;
  folgere: number;
};

type Oversikt = { todayCount: number; dates: OversiktDato[] };

type SkoleKurs = {
  id: string;
  title: string;
  styleSlug: string;
  format: string;
  level: string;
  weekday: number;
  startTime: string;
  price: number;
  dropInPrice?: number | null;
  capacity: number;
  unit: string;
  sessions: number;
  startDate: string;
  status: string;
  ratingAvg: number;
  ratingCount: number;
  seats: {
    forereFree: number;
    folgereFree: number;
    seatsLeft: number;
    isPartner: boolean;
    isFull: boolean;
  } | null;
};

type VentelisteInnslag = {
  id: string;
  courseId: string;
  course: { title: string; slug: string; capacity: number; unit: string };
  name: string;
  role: string;
  position: number;
  status: string;
  offerExpiresAt: string | null;
};

type PrivatForesporsel = {
  id: string;
  contactName: string;
  email: string;
  phone: string | null;
  weddingDate: string | null;
  participants: number;
  message: string | null;
  status: string;
  weddingPackage: { name: string } | null;
  school: { name: string };
  createdAt: string;
};

type Anmeldelse = {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  reply: string | null;
  course: { title: string } | null;
  createdAt: string;
};

type Melding = {
  id: string;
  fromRole: string;
  senderName: string;
  subject: string;
  body: string;
  createdAt: string;
};

type OmsetningData = {
  months: { month: string; label: string; omsetning: number; provisjon: number; bookinger: number }[];
  kpis: {
    omsetningSiste6: number;
    provisjon: number;
    bookinger: number;
    kurs: number;
    venteliste: number;
    vurdering: number;
  };
};

/* ============================== Dagens timer ============================== */

function DatoKort({
  d,
  checked,
  busyId,
  scanning,
  onCheckIn,
  onScan,
}: {
  d: OversiktDato;
  checked: Record<string, string>;
  busyId: string | null;
  scanning: boolean;
  onCheckIn: (id: string) => void;
  onScan: (code: string) => Promise<void>;
}) {
  const [kode, setKode] = useState("");
  const balanseUtrygg = Math.abs(d.forere - d.folgere) > 2;

  return (
    <article className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-bold text-navy">{d.courseTitle}</h3>
          <p className="text-sm text-[#6B7280]">
            {fmtDatoLang(d.date)} · {d.startTime}
          </p>
        </div>
        <p
          className={
            balanseUtrygg
              ? "rounded-[4px] bg-[#FDECEA] px-2 py-1 text-sm font-bold text-signal"
              : "rounded-[4px] bg-sky-pale px-2 py-1 text-sm font-bold text-navy"
          }
        >
          Førere: {d.forere} · Følgere: {d.folgere}
          {balanseUtrygg && <span className="sr-only"> — utrygg rollebalanse</span>}
        </p>
      </div>

      <div className="nice-scroll mt-4 max-h-96 overflow-y-auto rounded-md border border-[#CCD2DE]">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-pale">
              <TableHead className="text-navy">Navn</TableHead>
              <TableHead className="text-navy">Rolle / plass</TableHead>
              <TableHead className="text-navy">Status</TableHead>
              <TableHead className="text-right text-navy">
                Innsjekk <span className="sr-only">per deltaker</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {d.attendees.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-6 text-center text-sm text-[#6B7280]">
                  Ingen påmeldte på denne timen ennå.
                </TableCell>
              </TableRow>
            )}
            {d.attendees.map((a) => {
              const status = checked[a.id] ? "CHECKED_IN" : a.status;
              const isInnsjekket = status === "CHECKED_IN";
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold text-navy">{a.name}</TableCell>
                  <TableCell className="text-sm">{a.seatLabel ?? seatRoleLabel(a.role)}</TableCell>
                  <TableCell>
                    <StatusChip status={status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {isInnsjekket ? (
                      <span className="text-xs font-bold text-[#1F7A4D]">
                        Innsjekket
                        {checked[a.id] && (
                          <span className="sr-only"> kl. {new Date(checked[a.id]).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </span>
                    ) : (
                      <Button size="sm" disabled={busyId === a.id} onClick={() => onCheckIn(a.id)}>
                        {busyId === a.id && <Loader2 className="animate-spin" aria-hidden="true" />}
                        Innsjekk
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={async (e) => {
          e.preventDefault();
          const c = kode.trim();
          if (!c) return;
          await onScan(c);
          setKode("");
        }}
      >
        <Input
          aria-label="QR-kode"
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          placeholder="Skriv/scan QR-kode (TF-XXXXX)"
          className="sm:max-w-xs"
          autoComplete="off"
        />
        <Button type="submit" disabled={scanning || !kode.trim()}>
          {scanning ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ScanLine aria-hidden="true" />}
          Innsjekk med kode
        </Button>
      </form>
    </article>
  );
}

function DagensTimerTab() {
  const { data, loading, error, reload } = useSkoleData<Oversikt>(
    "/api/skole/oversikt",
    "Kunne ikke hente dagens timer"
  );
  const [checked, setChecked] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  const checkInBooking = useCallback(
    async (bookingId: string) => {
      setBusyId(bookingId);
      try {
        const res = await api<InnsjekkResp>("/api/skole/innsjekk", {
          method: "POST",
          body: { bookingId },
        });
        if (res.already) {
          toast({ title: `${res.name} er allerede innsjekket.` });
        } else {
          toast({
            title: `✅ ${res.name} er innsjekket`,
            description: res.seatLabel ?? undefined,
          });
        }
        setChecked((prev) => ({ ...prev, [bookingId]: new Date().toISOString() }));
      } catch (err) {
        toast({
          title: "Innsjekk feilet",
          description: err instanceof Error ? err.message : "Prøv igjen.",
          variant: "destructive",
        });
      } finally {
        setBusyId(null);
      }
    },
    []
  );

  async function scanKode(raw: string) {
    const c = raw.trim();
    if (!c) return;
    setScanning(true);
    try {
      const res = await api<InnsjekkResp>("/api/skole/innsjekk", { method: "POST", body: { code: c } });
      if (res.already) {
        toast({ title: `${res.name} er allerede innsjekket.` });
      } else {
        toast({ title: `✅ ${res.name} er innsjekket`, description: res.seatLabel ?? undefined });
      }
      const now = new Date().toISOString();
      setChecked((prev) => {
        const next = { ...prev };
        for (const a of (data?.dates ?? []).flatMap((d) => d.attendees)) {
          if (a.code && a.code.toUpperCase() === c.toUpperCase()) next[a.id] = now;
        }
        return next;
      });
      await reload(true); // fang opp bookinger utenfor listen (stille oppfriskning)
    } catch (err) {
      toast({
        title: "Innsjekk feilet",
        description: err instanceof Error ? err.message : "Fant ingen gyldig bestilling med den koden.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  }

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;
  if (!data) return null;

  const alleDeltakere = data.dates.flatMap((d) => d.attendees);
  const unike = new Map(alleDeltakere.map((a) => [a.id, a]));
  const innsjekket = [...unike.values()].filter((a) => checked[a.id] || a.status === "CHECKED_IN").length;
  const datoerIdag = data.dates.filter((d) => erIdag(d.date)).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Kurs i dag" value={String(data.todayCount)} hint={`${datoerIdag} time${datoerIdag === 1 ? "" : "r"} i dag`} />
        <KpiCard label="Kommende timer · 14 d" value={String(data.dates.length)} />
        <KpiCard label="Påmeldte" value={String(unike.size)} hint="Unike bookinger i perioden" />
        <KpiCard label="Innsjekket" value={String(innsjekket)} hint="Oppmøte registrert" />
      </div>

      {data.dates.length === 0 ? (
        <EmptyBox
          title="Ingen kommende timer de neste 14 dagene"
          body="Når kursene dine har timeplan, dukker deltakerlistene opp her."
        />
      ) : (
        <div className="space-y-4">
          {data.dates.map((d) => (
            <DatoKort
              key={d.dateId}
              d={d}
              checked={checked}
              busyId={busyId}
              scanning={scanning}
              onCheckIn={(id) => void checkInBooking(id)}
              onScan={scanKode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== Kurs & timeplan ============================== */

type NyttKursForm = {
  title: string;
  styleSlug: string;
  level: string;
  format: string;
  ageGroup: string;
  description: string;
  capacity: string;
  price: string;
  dropInPrice: string;
  weekday: string;
  startTime: string;
  startDate: string;
  sessions: string;
};

const TOM_SKJEMA: NyttKursForm = {
  title: "",
  styleSlug: "",
  level: "NYBEGYNNER",
  format: "KURSREKKE",
  ageGroup: "VOKSEN",
  description: "",
  capacity: "12",
  price: "1200",
  dropInPrice: "",
  weekday: "4",
  startTime: "19:00",
  startDate: "",
  sessions: "6",
};

function NyttKursDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<NyttKursForm>(TOM_SKJEMA);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof NyttKursForm) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    const tittel = form.title.trim();
    if (tittel.length < 3) {
      toast({ title: "Tittelen må være minst 3 tegn.", variant: "destructive" });
      return;
    }
    if (!form.styleSlug) {
      toast({ title: "Velg dansestil.", variant: "destructive" });
      return;
    }
    if (!form.startDate || isNaN(new Date(form.startDate).getTime())) {
      toast({ title: "Velg en gyldig startdato.", variant: "destructive" });
      return;
    }
    const capacity = Number(form.capacity);
    const price = Number(form.price);
    const sessions = Number(form.sessions);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 60) {
      toast({ title: "Kapasiteten må være et tall fra 1 til 60.", variant: "destructive" });
      return;
    }
    if (!Number.isInteger(price) || price < 0 || price > 20000) {
      toast({ title: "Prisen må være et tall fra 0 til 20 000.", variant: "destructive" });
      return;
    }
    if (!Number.isInteger(sessions) || sessions < 1 || sessions > 16) {
      toast({ title: "Antall ganger må være et tall fra 1 til 16.", variant: "destructive" });
      return;
    }
    const dropInTrim = form.dropInPrice.trim();
    if (dropInTrim !== "" && (!Number.isInteger(Number(dropInTrim)) || Number(dropInTrim) < 0 || Number(dropInTrim) > 1000)) {
      toast({ title: "Drop-in-prisen må være et tall fra 0 til 1 000.", variant: "destructive" });
      return;
    }

    setBusy(true);
    try {
      await api<{ ok: boolean }>("/api/skole/kurs", {
        method: "POST",
        body: {
          title: tittel,
          styleSlug: form.styleSlug,
          level: form.level,
          format: form.format,
          ageGroup: form.ageGroup,
          description: form.description.trim(),
          capacity,
          price,
          ...(dropInTrim === "" ? {} : { dropInPrice: Number(dropInTrim) }),
          weekday: Number(form.weekday),
          startTime: form.startTime,
          sessions,
          startDate: form.startDate,
        },
      });
      toast({ title: "Kurset er opprettet!", description: `${tittel} er nå synlig på taktfast.no.` });
      setForm(TOM_SKJEMA);
      onOpenChange(false);
      onCreated();
    } catch (err) {
      toast({
        title: "Kunne ikke opprette kurset",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nice-scroll max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nytt kurs</DialogTitle>
          <DialogDescription>
            Kurset får egne kursdatoer automatisk, én per uke fra startdatoen.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nk-tittel">Tittel</Label>
            <Input id="nk-tittel" value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="F.eks. Salsa nybegynner – onsdag" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-stil">Dansestil</Label>
            <Select value={form.styleSlug} onValueChange={set("styleSlug")}>
              <SelectTrigger id="nk-stil" className="w-full">
                <SelectValue placeholder="Velg stil" />
              </SelectTrigger>
              <SelectContent className="nice-scroll max-h-72">
                {DANCE_STYLES.map((s) => (
                  <SelectItem key={s.slug} value={s.slug}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-format">Format</Label>
            <Select value={form.format} onValueChange={set("format")}>
              <SelectTrigger id="nk-format" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-niva">Nivå</Label>
            <Select value={form.level} onValueChange={set("level")}>
              <SelectTrigger id="nk-niva" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-alder">Aldersgruppe</Label>
            <Select value={form.ageGroup} onValueChange={set("ageGroup")}>
              <SelectTrigger id="nk-alder" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-ukedag">Ukedag</Label>
            <Select value={form.weekday} onValueChange={set("weekday")}>
              <SelectTrigger id="nk-ukedag" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NORWEGIAN_WEEKDAYS.map((dag, i) =>
                  i >= 1 ? (
                    <SelectItem key={i} value={String(i)}>
                      {cap(dag)}
                    </SelectItem>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-tid">Starttid</Label>
            <Input id="nk-tid" type="time" value={form.startTime} onChange={(e) => set("startTime")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-startdato">Startdato</Label>
            <Input id="nk-startdato" type="date" value={form.startDate} onChange={(e) => set("startDate")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-ganger">Antall ganger</Label>
            <Input id="nk-ganger" type="number" min={1} max={16} inputMode="numeric" value={form.sessions} onChange={(e) => set("sessions")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-kapasitet">Kapasitet</Label>
            <Input id="nk-kapasitet" type="number" min={1} max={60} inputMode="numeric" value={form.capacity} onChange={(e) => set("capacity")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-pris">Pris (kr)</Label>
            <Input id="nk-pris" type="number" min={0} max={20000} inputMode="numeric" value={form.price} onChange={(e) => set("price")(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nk-dropin">Drop-in-pris (kr, valgfritt)</Label>
            <Input id="nk-dropin" type="number" min={0} max={1000} inputMode="numeric" value={form.dropInPrice} onChange={(e) => set("dropInPrice")(e.target.value)} placeholder="F.eks. 250" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="nk-beskrivelse">Beskrivelse</Label>
            <Textarea id="nk-beskrivelse" rows={3} maxLength={1500} value={form.description} onChange={(e) => set("description")(e.target.value)} placeholder="Hva kan deltakerne forvente på kurset?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Avbryt
          </Button>
          <Button onClick={() => void submit()} disabled={busy}>
            {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
            Opprett kurs
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function KursTab() {
  const { data, loading, error, reload } = useSkoleData<{ courses: SkoleKurs[] }>(
    "/api/skole/kurs",
    "Kunne ikke hente kursene"
  );
  const [nyttApen, setNyttApen] = useState(false);
  const [prisKurs, setPrisKurs] = useState<SkoleKurs | null>(null);
  const [prisVerdi, setPrisVerdi] = useState("");
  const [dropInVerdi, setDropInVerdi] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState<string | null>(null);

  function apnePrisDialog(k: SkoleKurs) {
    setPrisKurs(k);
    setPrisVerdi(String(k.price));
    setDropInVerdi(k.dropInPrice == null ? "" : String(k.dropInPrice));
  }

  async function lagrePris() {
    if (!prisKurs) return;
    const price = Number(prisVerdi);
    if (!Number.isInteger(price) || price < 0 || price > 20000) {
      toast({ title: "Prisen må være et tall fra 0 til 20 000.", variant: "destructive" });
      return;
    }
    const dropInTrim = dropInVerdi.trim();
    if (dropInTrim !== "" && (!Number.isInteger(Number(dropInTrim)) || Number(dropInTrim) < 0 || Number(dropInTrim) > 1000)) {
      toast({ title: "Drop-in-prisen må være et tall fra 0 til 1 000.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await api("/api/skole/kurs", {
        method: "PATCH",
        body: {
          courseId: prisKurs.id,
          price,
          ...(dropInTrim === "" ? { dropInPrice: null } : { dropInPrice: Number(dropInTrim) }),
        },
      });
      toast({ title: "Prisen er oppdatert.", description: prisKurs.title });
      setPrisKurs(null);
      await reload(true);
    } catch (err) {
      toast({
        title: "Kunne ikke lagre prisen",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function endreStatus(kursId: string, status: string) {
    setStatusBusy(kursId);
    try {
      await api("/api/skole/kurs", { method: "PATCH", body: { courseId: kursId, status } });
      toast({ title: "Status er oppdatert.", description: courseStatusLabel(status) });
      await reload(true);
    } catch (err) {
      toast({
        title: "Kunne ikke endre status",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setStatusBusy(null);
    }
  }

  if (loading) return <PanelSkeleton rows={4} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6B7280]">
          {courses.length} kurs i katalogen · priser og status oppdateres umiddelbart
        </p>
        <Button onClick={() => setNyttApen(true)}>
          <Plus aria-hidden="true" /> Nytt kurs
        </Button>
      </div>

      {courses.length === 0 ? (
        <EmptyBox title="Du har ingen kurs ennå" body="Klikk «Nytt kurs» for å legge til ditt første kurs." />
      ) : (
        <div className="nice-scroll max-h-96 overflow-auto rounded-md border border-[#CCD2DE] bg-white shadow-sm">
          <Table className="min-w-[820px]">
            <TableHeader>
              <TableRow className="bg-sky-pale">
                <TableHead className="text-navy">Kurs</TableHead>
                <TableHead className="text-navy">Stil</TableHead>
                <TableHead className="hidden text-navy md:table-cell">Nivå</TableHead>
                <TableHead className="text-navy">Dag &amp; tid</TableHead>
                <TableHead className="text-navy">Pris</TableHead>
                <TableHead className="text-navy">Ledige plasser</TableHead>
                <TableHead className="text-navy">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((k) => {
                const total = k.seats ? (k.seats.isPartner ? k.capacity * 2 : k.capacity) : k.capacity;
                const ledige = k.seats?.seatsLeft ?? null;
                const booktPct = ledige == null ? 0 : Math.min(100, Math.max(0, Math.round(((total - ledige) / Math.max(1, total)) * 100)));
                return (
                  <TableRow key={k.id}>
                    <TableCell>
                      <p className="font-semibold text-navy">{k.title}</p>
                      <p className="text-xs text-[#6B7280]">
                        Starter {formatDateNb(k.startDate)} · {k.sessions} ganger
                      </p>
                    </TableCell>
                    <TableCell className="text-sm">{styleName(k.styleSlug)}</TableCell>
                    <TableCell className="hidden text-sm md:table-cell">{levelLabel(k.level)}</TableCell>
                    <TableCell className="text-sm">
                      {cap(weekdayName(k.weekday))} {k.startTime}
                      <span className="block text-xs text-[#6B7280]">{formatLabel(k.format)}</span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => apnePrisDialog(k)}
                        className="inline-flex items-center gap-1 rounded-[4px] font-semibold text-navy underline decoration-[#8BB8E8] decoration-2 underline-offset-2 hover:bg-sky-pale"
                        aria-label={`Endre pris for ${k.title}`}
                      >
                        {kr(k.price)}
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                      </button>
                      {k.dropInPrice != null && (
                        <span className="block text-xs text-[#6B7280]">Drop-in {kr(k.dropInPrice)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#E5E8F2]" role="presentation">
                        <div className="h-full rounded-full bg-sky" style={{ width: `${booktPct}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        {ledige == null ? "—" : `${ledige} ledige av ${total}`}
                        {k.seats?.isPartner && (
                          <span className="sr-only">
                            {" "}
                            (Førere {k.seats.forereFree} · Følgere {k.seats.folgereFree})
                          </span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusChip status={k.status} />
                        <Select
                          value={k.status}
                          onValueChange={(v) => void endreStatus(k.id, v)}
                          disabled={statusBusy === k.id}
                        >
                          <SelectTrigger
                            className="h-8 w-[104px] text-xs"
                            aria-label={`Endre status for ${k.title}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {["AKTIV", "FULL", "AVLYST"].map((s) => (
                              <SelectItem key={s} value={s}>
                                {courseStatusLabel(s)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <NyttKursDialog open={nyttApen} onOpenChange={setNyttApen} onCreated={() => void reload(true)} />

      <Dialog open={prisKurs !== null} onOpenChange={(o) => !o && setPrisKurs(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Endre pris</DialogTitle>
            <DialogDescription>{prisKurs?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pris-verdi">Pris (kr)</Label>
              <Input id="pris-verdi" type="number" min={0} max={20000} inputMode="numeric" value={prisVerdi} onChange={(e) => setPrisVerdi(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dropin-verdi">Drop-in-pris (kr, valgfritt)</Label>
              <Input id="dropin-verdi" type="number" min={0} max={1000} inputMode="numeric" value={dropInVerdi} onChange={(e) => setDropInVerdi(e.target.value)} placeholder="La stå tom for å fjerne" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPrisKurs(null)} disabled={busy}>
              Avbryt
            </Button>
            <Button onClick={() => void lagrePris()} disabled={busy}>
              {busy && <Loader2 className="animate-spin" aria-hidden="true" />}
              Lagre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ============================== Venteliste ============================== */

function VentelisteTab() {
  const { data, loading, error, reload } = useSkoleData<{ entries: VentelisteInnslag[] }>(
    "/api/skole/venteliste",
    "Kunne ikke hente ventelisten"
  );
  const [busy, setBusy] = useState<string | null>(null);

  const grupper = useMemo(() => {
    const m = new Map<string, { tittel: string; entries: VentelisteInnslag[] }>();
    for (const e of data?.entries ?? []) {
      const g = m.get(e.courseId) ?? { tittel: e.course?.title ?? "Ukjent kurs", entries: [] };
      g.entries.push(e);
      m.set(e.courseId, g);
    }
    return [...m.values()];
  }, [data]);

  async function tilbyPlass(entryId: string) {
    setBusy(entryId);
    try {
      await api<{ ok: boolean }>("/api/skole/venteliste", { method: "POST", body: { entryId } });
      toast({ title: "Tilbud sendt! Gjelder i 24 timer." });
      await reload(true);
    } catch (err) {
      toast({
        title: "Kunne ikke sende tilbud",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B7280]">
        Dansere i kø på fulle kurs. Når en plass åpner seg, tilbyr du plassen — den gjelder i 24 timer.
      </p>
      {grupper.length === 0 ? (
        <EmptyBox title="Ventelisten er tom" body="Når et kurs blir fullt, havner dansere som vil inn her." />
      ) : (
        grupper.map((g) => (
          <article key={g.entries[0]?.courseId} className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-navy">{g.tittel}</h3>
              <span className="rounded-full bg-[#00205B] px-3 py-1 text-xs font-bold text-white">
                {g.entries.length} i kø
              </span>
            </div>
            <ul className="nice-scroll mt-3 max-h-96 space-y-2 overflow-y-auto">
              {g.entries.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-[4px] border border-[#CCD2DE] bg-sky-pale px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 text-center font-display text-sm font-extrabold text-navy">#{e.position}</span>
                    <div>
                      <p className="text-sm font-semibold text-navy">{e.name}</p>
                      <p className="text-xs text-[#6B7280]">{seatRoleLabel(e.role)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {e.status === "OFFERED" && e.offerExpiresAt && (
                      <span className="text-xs font-medium text-[#6B7280]">
                        Utløper {formatDateTimeNb(e.offerExpiresAt)}
                      </span>
                    )}
                    <StatusChip status={e.status} />
                    {e.status === "ACTIVE" && (
                      <Button size="sm" disabled={busy === e.id} onClick={() => void tilbyPlass(e.id)}>
                        {busy === e.id && <Loader2 className="animate-spin" aria-hidden="true" />}
                        Tilby plass
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </article>
        ))
      )}
    </div>
  );
}

/* ============================== Privattimer ============================== */

function PrivattimerTab() {
  const { data, loading, error, reload } = useSkoleData<{ requests: PrivatForesporsel[] }>(
    "/api/skole/privattimer",
    "Kunne ikke hente forespørslene"
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function endreStatus(id: string, status: string) {
    setBusy(id);
    try {
      await api("/api/skole/privattimer", { method: "PATCH", body: { id, status } });
      toast({ title: "Status er oppdatert.", description: privatStatusLabel(status) });
      await reload(true);
    } catch (err) {
      toast({
        title: "Kunne ikke endre status",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;

  const requests = data?.requests ?? [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#6B7280]">
        Forespørsler om privattimer (bryllupsdans m.m.). Sett status etter du har vært i kontakt.
      </p>
      {requests.length === 0 ? (
        <EmptyBox title="Ingen forespørsler ennå" body="Forespørsler fra bryllupsdans-siden havner her." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((r) => (
            <article key={r.id} className="flex flex-col rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-navy">{r.contactName}</h3>
                <StatusChip status={r.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-[4px] bg-tint-butter px-2 py-1 text-xs font-bold text-navy">
                  {r.weddingDate ? `Bryllup: ${formatDateNb(r.weddingDate)}` : "Bryllupsdato ikke oppgitt"}
                </span>
                {r.weddingPackage && (
                  <span className="rounded-[4px] bg-sky-pale px-2 py-1 text-xs font-bold text-navy">
                    {r.weddingPackage.name}
                  </span>
                )}
                <span className="rounded-[4px] bg-[#E5E8F2] px-2 py-1 text-xs font-bold text-navy">
                  {r.participants} person{r.participants === 1 ? "" : "er"}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <p className="flex items-center gap-2 text-[#374151]">
                  <Mail className="h-4 w-4 text-sky" aria-hidden="true" />
                  <a href={`mailto:${r.email}`} className="underline decoration-dotted">
                    {r.email}
                  </a>
                </p>
                {r.phone && (
                  <p className="flex items-center gap-2 text-[#374151]">
                    <Phone className="h-4 w-4 text-sky" aria-hidden="true" />
                    <a href={`tel:${r.phone}`} className="underline decoration-dotted">
                      {r.phone}
                    </a>
                  </p>
                )}
              </div>
              {r.message && <p className="mt-3 text-sm italic text-[#374151]">«{r.message}»</p>}
              <p className="mt-2 text-xs text-[#6B7280]">Mottatt {formatDateTimeNb(r.createdAt)}</p>
              <div className="mt-auto flex items-center gap-2 pt-3">
                <Label htmlFor={`status-${r.id}`} className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                  Status
                </Label>
                <Select value={r.status} onValueChange={(v) => void endreStatus(r.id, v)} disabled={busy === r.id}>
                  <SelectTrigger id={`status-${r.id}`} className="h-8 w-[130px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["NEW", "CONTACTED", "BOOKED"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {privatStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== Anmeldelser ============================== */

function AnmeldelserTab() {
  const { data, loading, error, reload } = useSkoleData<{ reviews: Anmeldelse[] }>(
    "/api/skole/anmeldelser",
    "Kunne ikke hente anmeldelsene"
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function sendSvar(reviewId: string, text: string): Promise<boolean> {
    setBusy(reviewId);
    try {
      await api("/api/skole/anmeldelser", { method: "POST", body: { reviewId, reply: text } });
      toast({ title: "Svaret er publisert." });
      await reload(true);
      return true;
    } catch (err) {
      toast({
        title: "Kunne ikke publisere svaret",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;

  const reviews = data?.reviews ?? [];

  if (reviews.length === 0) {
    return <EmptyBox title="Ingen anmeldelser ennå" body="Anmeldelser fra deltakerne dine vises her." />;
  }

  return (
    <div className="nice-scroll max-h-[36rem] space-y-4 overflow-y-auto pr-1">
      {reviews.map((v) => (
        <article key={v.id} className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Stars value={v.rating} />
            <p className="text-xs text-[#6B7280]">{formatDateTimeNb(v.createdAt)}</p>
          </div>
          <p className="mt-2 text-sm">
            <strong className="text-navy">{v.authorName}</strong>
            {v.course?.title && <span className="text-[#6B7280]"> · {v.course.title}</span>}
          </p>
          <p className="mt-2 text-[15px] text-[#1A1A1A]">{v.text}</p>
          {v.reply ? (
            <div className="mt-3 rounded-[4px] border border-[#CCD2DE] bg-sky-pale p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-navy">Svar fra skolen</p>
              <p className="mt-1 text-sm text-[#1A1A1A]">{v.reply}</p>
            </div>
          ) : (
            <SvarSkjema
              label="Svar på anmeldelsen"
              placeholder="Skriv et vennlig svar — både ros og kritikk fortjener et svar."
              maxLength={800}
              busy={busy === v.id}
              onSubmit={(text) => sendSvar(v.id, text)}
            />
          )}
        </article>
      ))}
    </div>
  );
}

/* ============================== Meldinger ============================== */

function MeldingerTab() {
  const { data, loading, error, reload } = useSkoleData<{ messages: Melding[] }>(
    "/api/skole/meldinger",
    "Kunne ikke hente meldingene"
  );
  const [busy, setBusy] = useState<string | null>(null);

  async function sendSvar(threadId: string, text: string): Promise<boolean> {
    setBusy(threadId);
    try {
      await api("/api/skole/meldinger", { method: "POST", body: { threadId, body: text } });
      toast({ title: "Svaret er sendt.", description: "Danseren får beskjed på e-post." });
      await reload(true);
      return true;
    } catch (err) {
      toast({
        title: "Kunne ikke sende svaret",
        description: err instanceof Error ? err.message : "Prøv igjen.",
        variant: "destructive",
      });
      return false;
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;

  const messages = data?.messages ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-tint-butter px-3 py-1 text-xs font-bold text-navy">Mock-innboks</span>
        <p className="text-sm text-[#6B7280]">Meldinger fra kontaktskjemaet og svar du sender.</p>
      </div>
      {messages.length === 0 ? (
        <EmptyBox title="Innboksen er tom" body="Når noen sender deg en melding, dukker den opp her." />
      ) : (
        <div className="nice-scroll max-h-[36rem] space-y-4 overflow-y-auto pr-1">
          {messages.map((m) => (
            <article key={m.id} className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-navy">{m.subject}</h3>
                  <p className="text-sm text-[#6B7280]">
                    {m.senderName} · {m.fromRole === "SKOLE" ? "fra skolen" : "fra danser"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      m.fromRole === "SKOLE"
                        ? "rounded-full bg-[#00205B] px-2.5 py-0.5 text-xs font-bold text-white"
                        : "rounded-full bg-[#EEF5FC] px-2.5 py-0.5 text-xs font-bold text-[#00205B]"
                    }
                  >
                    {m.fromRole === "SKOLE" ? "Skolen" : "Danser"}
                  </span>
                  <p className="text-xs text-[#6B7280]">{formatDateTimeNb(m.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[15px] text-[#1A1A1A]">{m.body}</p>
              {m.fromRole !== "SKOLE" && (
                <SvarSkjema
                  label="Svar på meldingen"
                  placeholder="Skriv svaret ditt til danseren …"
                  maxLength={1000}
                  busy={busy === m.id}
                  onSubmit={(text) => sendSvar(m.id, text)}
                />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== Omsetning ============================== */

function OmsetningTab() {
  const { data, loading, error, reload } = useSkoleData<OmsetningData>(
    "/api/skole/omsetning",
    "Kunne ikke hente omsetningstallene"
  );

  if (loading) return <PanelSkeleton rows={3} />;
  if (error) return <ErrorBox msg={error} onRetry={() => void reload()} />;
  if (!data) return null;

  const { months, kpis } = data;
  const diagramData = months.map((m) => ({ ...m, label: cap(m.label) }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <KpiCard label="Omsetning · 6 mnd" value={kr(kpis.omsetningSiste6)} />
        <KpiCard label="Provisjon · 10 %" value={kr(kpis.provisjon)} hint="Taktfasts andel" />
        <KpiCard label="Bookinger" value={String(kpis.bookinger)} hint="Alle bookinger totalt" />
        <KpiCard label="Kurs" value={String(kpis.kurs)} hint="Aktive og tidligere kurs" />
        <KpiCard label="Venteliste" value={String(kpis.venteliste)} hint="Aktive og med tilbud" />
        <KpiCard
          label="Vurdering"
          value={kpis.vurdering.toFixed(1).replace(".", ",")}
          hint={
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-[#F5B301] text-[#F5B301]" aria-hidden="true" /> av 5 stjerner
            </span>
          }
        />
      </div>

      <section className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6">
        <h3 className="font-display text-lg font-bold text-navy">Omsetning per måned</h3>
        <p className="text-sm text-[#6B7280]">Siste 6 måneder · mørkeblå: omsetning, lyseblå: provisjon</p>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={diagramData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E8F2" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#CCD2DE" }}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                width={56}
                tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toLocaleString("nb-NO")}k` : String(v))}
              />
              <Tooltip formatter={(v: number | string | (number | string)[]) => kr(Number(v))} cursor={{ fill: "#EEF5FC" }} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="omsetning" name="Omsetning" fill="#00205B" radius={[4, 4, 0, 0]} maxBarSize={48} />
              <Bar dataKey="provisjon" name="Provisjon" fill="#8BB8E8" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="overflow-x-auto rounded-md border border-[#CCD2DE] bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-pale">
              <TableHead className="text-navy">Måned</TableHead>
              <TableHead className="text-right text-navy">Omsetning</TableHead>
              <TableHead className="text-right text-navy">Provisjon</TableHead>
              <TableHead className="text-right text-navy">Bookinger</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {months.map((m) => (
              <TableRow key={m.month}>
                <TableCell className="font-semibold text-navy">{cap(m.label)}</TableCell>
                <TableCell className="text-right">{kr(m.omsetning)}</TableCell>
                <TableCell className="text-right">{kr(m.provisjon)}</TableCell>
                <TableCell className="text-right">{m.bookinger}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

/* ============================== Hovedkomponent ============================== */

const FANER = [
  { value: "timer", label: "Dagens timer", icon: CalendarDays },
  { value: "kurs", label: "Kurs & timeplan", icon: CalendarRange },
  { value: "venteliste", label: "Venteliste", icon: Hourglass },
  { value: "privattimer", label: "Privattimer", icon: HeartHandshake },
  { value: "anmeldelser", label: "Anmeldelser", icon: Star },
  { value: "meldinger", label: "Meldinger", icon: Mail },
  { value: "omsetning", label: "Omsetning", icon: TrendingUp },
] as const;

export function SkolepanelApp({ schoolName, userName }: { schoolName: string; userName: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky">Taktfast skolepanel</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-navy">{schoolName}</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Logget inn som <strong className="text-navy">{userName}</strong> — styr timer, kurs og kommunikasjon.
          </p>
        </div>
        <span className="rounded-full bg-[#00205B] px-3 py-1 text-xs font-bold text-white">Danseskole</span>
      </header>

      <Tabs defaultValue="timer" className="mt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <TabsList
            aria-label="Skolepanel-meny"
            className="nice-scroll flex h-auto w-full flex-row justify-start gap-1 overflow-x-auto rounded-md border border-[#CCD2DE] bg-white p-2 lg:sticky lg:top-24 lg:w-56 lg:flex-col lg:items-stretch"
          >
            {FANER.map((f) => {
              const Ikon = f.icon;
              return (
                <TabsTrigger
                  key={f.value}
                  value={f.value}
                  className="justify-start gap-2 whitespace-nowrap rounded-[5px] px-3 py-2 text-sm font-bold text-[#3D4757] hover:bg-sky-pale data-[state=active]:bg-sky-pale data-[state=active]:text-navy data-[state=active]:shadow-none"
                >
                  <Ikon className="h-4 w-4" aria-hidden="true" />
                  {f.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="min-w-0 flex-1">
            <TabsContent value="timer">
              <DagensTimerTab />
            </TabsContent>
            <TabsContent value="kurs">
              <KursTab />
            </TabsContent>
            <TabsContent value="venteliste">
              <VentelisteTab />
            </TabsContent>
            <TabsContent value="privattimer">
              <PrivattimerTab />
            </TabsContent>
            <TabsContent value="anmeldelser">
              <AnmeldelserTab />
            </TabsContent>
            <TabsContent value="meldinger">
              <MeldingerTab />
            </TabsContent>
            <TabsContent value="omsetning">
              <OmsetningTab />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
