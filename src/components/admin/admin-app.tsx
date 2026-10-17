"use client";

// Administrasjonspanel for Taktfast — kun for rolle ADMIN.
// Seks faner: oversikt, danseskoler, brukere, kuponger & gavekort, anmeldelser, varsellogg.
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  Check,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Percent,
  Plus,
  RefreshCw,
  School,
  Search,
  Ticket,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Stars } from "@/components/site/ui-bits";
import { ChannelChip, RoleChip, StatusChip } from "@/components/admin/status-chip";

// ---------------- Typer ----------------

type Stats = {
  kpis: {
    userCount: number;
    schoolCount: number;
    pendingSchools: number;
    bookingCount: number;
    reviewPending: number;
    gmvTotal: number;
    provisjon: number;
  };
  months: { month: string; label: string; gmv: number; provisjon: number }[];
};

type AdminSchool = {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: string;
  verified: boolean;
  createdAt: string;
  _count: { courses: number; reviews: number };
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  bookings: number;
  profiles: number;
  createdAt: string;
};

type Coupon = {
  code: string;
  percentOff: number;
  amountOff: number;
  active: boolean;
  uses: number;
  maxUses: number;
  description: string;
};

type GiftCard = {
  code: string;
  amount: number;
  balance: number;
  active: boolean;
  createdAt: string;
};

type AdminReview = {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  status: string;
  reply: string | null;
  school: { name: string } | null;
  course: { title: string } | null;
  createdAt: string;
};

type NotificationRow = {
  id: string;
  channel: string;
  subject: string;
  body: string;
  email: string | null;
  createdAt: string;
};

// ---------------- Hjelpere ----------------

const kr = (n: number) => `${Math.round(n).toLocaleString("nb-NO")} kr`;

const dato = (iso: string) => new Date(iso).toLocaleDateString("nb-NO");

const datoTid = (iso: string) =>
  new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

async function parseError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: string };
    return j.error ?? "Prøv igjen om litt.";
  } catch {
    return "Prøv igjen om litt.";
  }
}

function KpiCard({
  label,
  value,
  sub,
  warn,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#4a5468]">{label}</p>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-pale text-navy">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
      {sub ? (
        <p className={cn("mt-1 text-xs font-medium", warn ? "text-[#a13a2c]" : "text-[#6b7488]")}>{sub}</p>
      ) : null}
    </div>
  );
}

function FeilBoks({ onRetry, what }: { onRetry: () => void; what: string }) {
  return (
    <div className="rounded-md border border-[#CCD2DE] bg-white p-8 text-center shadow-sm" role="alert">
      <p className="font-semibold text-navy">Kunne ikke hente {what}</p>
      <p className="mt-1 text-sm text-[#4a5468]">Sjekk tilkoblingen og prøv igjen.</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Prøv igjen
      </Button>
    </div>
  );
}

function TabSkeleton({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Tomt({ tekst }: { tekst: string }) {
  return (
    <div className="rounded-md border border-[#CCD2DE] bg-sky-pale p-8 text-center text-sm font-medium text-navy">
      {tekst}
    </div>
  );
}

// ---------------- Fane 1: Oversikt ----------------

function OversiktTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as Stats;
        if (!cancelled) {
          setStats(j);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  if (error) return <FeilBoks what="tallene" onRetry={() => setRefresh((c) => c + 1)} />;
  if (!stats) {
    return (
      <TabSkeleton>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-md" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-md" />
      </TabSkeleton>
    );
  }

  const k = stats.kpis;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Brukere" value={k.userCount.toLocaleString("nb-NO")} icon={Users} />
        <KpiCard
          label="Danseskoler"
          value={k.schoolCount.toLocaleString("nb-NO")}
          icon={School}
          sub={k.pendingSchools > 0 ? `${k.pendingSchools} venter på godkjenning` : "Alle behandlet"}
          warn={k.pendingSchools > 0}
        />
        <KpiCard label="Bookinger" value={k.bookingCount.toLocaleString("nb-NO")} icon={CalendarCheck} />
        <KpiCard label="GMV totalt" value={kr(k.gmvTotal)} icon={TrendingUp} />
        <KpiCard label="Provisjon" value={kr(k.provisjon)} sub="10 % av GMV" icon={Percent} />
        <KpiCard
          label="Anmeldelser til moddering"
          value={k.reviewPending.toLocaleString("nb-NO")}
          icon={MessageSquare}
        />
      </div>

      <section className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6" aria-label="Omsetning per måned">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-navy">Omsetning og provisjon per måned</h2>
          <p className="text-xs text-[#6b7488]">Siste 12 måneder</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={stats.months} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#CCD2DE" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#4a5468" }}
                tickLine={false}
                axisLine={{ stroke: "#CCD2DE" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#4a5468" }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              />
              <Tooltip
                formatter={(value: unknown, name: unknown) => [kr(Number(value)), String(name)]}
                contentStyle={{
                  borderRadius: 6,
                  border: "1px solid #CCD2DE",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} iconType="circle" />
              <Bar dataKey="gmv" name="Omsetning" fill="#00205B" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line
                dataKey="provisjon"
                name="Provisjon (10 %)"
                stroke="#8BB8E8"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#8BB8E8", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

// ---------------- Fane 2: Danseskoler ----------------

const SKOLE_STATUSER = [
  { value: "PENDING", label: "Venter på godkjenning" },
  { value: "APPROVED", label: "Godkjente skoler" },
  { value: "REJECTED", label: "Avslåtte skoler" },
  { value: "ALLE", label: "Alle skoler" },
] as const;

function SkolerTab() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [schools, setSchools] = useState<AdminSchool[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/skoler?status=${statusFilter}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { schools: AdminSchool[] };
        if (!cancelled) {
          setSchools(j.schools);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, refresh]);

  async function endreSkole(schoolId: string, action: "APPROVE" | "REJECT" | "PENDING") {
    setBusyId(schoolId);
    try {
      const res = await fetch("/api/admin/skoler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, action }),
      });
      if (!res.ok) {
        toast({
          title: "Handlingen feilet",
          description: await parseError(res),
          variant: "destructive",
        });
        return;
      }
      const melding =
        action === "APPROVE"
          ? "Skolen er godkjent og nå synlig i søket."
          : action === "REJECT"
            ? "Skolen er avslått og får ikke ligge ute."
            : "Skolen er merket som ventende igjen.";
      toast({ title: "Lagret", description: `${melding} Eieren får varsel på e-post.` });
      setRefresh((c) => c + 1);
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk tilkoblingen og prøv igjen.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-64">
          <Label htmlFor="skole-status" className="sr-only">
            Filtrer på status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="skole-status" className="w-full bg-white">
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {SKOLE_STATUSER.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {schools ? (
          <p className="text-sm text-[#4a5468]">
            {schools.length.toLocaleString("nb-NO")} {schools.length === 1 ? "skole" : "skoler"}
          </p>
        ) : null}
      </div>

      {error ? (
        <FeilBoks what="skolene" onRetry={() => setRefresh((c) => c + 1)} />
      ) : schools === null ? (
        <TabSkeleton>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </TabSkeleton>
      ) : schools.length === 0 ? (
        <Tomt tekst="Ingen danseskoler i denne statusen." />
      ) : (
        <div className="max-h-96 overflow-auto nice-scroll rounded-md border border-[#CCD2DE] bg-white shadow-sm">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#CCD2DE]">
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>By</TableHead>
                <TableHead className="text-right">Kurs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verifisert</TableHead>
                <TableHead className="text-right">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schools.map((s) => {
                const busy = busyId === s.id;
                return (
                  <TableRow
                    key={s.id}
                    className={cn(s.status === "PENDING" && "bg-tint-butter/70 hover:bg-tint-butter")}
                  >
                    <TableCell className="max-w-56 font-medium text-navy">
                      <Link
                        href={`/danseskoler/${s.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                      >
                        {s.name}
                      </Link>
                      <span className="block text-xs font-normal text-[#6b7488]">{dato(s.createdAt)}</span>
                    </TableCell>
                    <TableCell className="text-[#4a5468]">{s.city}</TableCell>
                    <TableCell className="text-right tabular-nums">{s._count.courses}</TableCell>
                    <TableCell>
                      <StatusChip status={s.status} />
                    </TableCell>
                    <TableCell>
                      {s.verified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2e6b28]">
                          <Check className="size-4" aria-hidden="true" />
                          Verifisert
                        </span>
                      ) : (
                        <span className="text-xs text-[#6b7488]" aria-label="Ikke verifisert">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {busy ? (
                        <Loader2 className="ml-auto size-4 animate-spin text-navy" aria-label="Arbeider" />
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => endreSkole(s.id, "APPROVE")}
                          >
                            Godkjenn
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" className="h-8 px-2.5 text-xs">
                                Avslå
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Avslå {s.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Skolen blir ikke synlig i søket, og eieren får beskjed på e-post. Du kan
                                  angre senere ved å godkjenne skolen på nytt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-[#a13a2c] text-white hover:bg-[#8a3125]"
                                  onClick={() => endreSkole(s.id, "REJECT")}
                                >
                                  Ja, avslå skolen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => endreSkole(s.id, "PENDING")}
                          >
                            Merk som PENDING
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ---------------- Fane 3: Brukere ----------------

function BrukereTab() {
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  // Debounce søkefeltet (500 ms) — oppdatering skjer i timeout-callback, ikke synkront i effect.
  useEffect(() => {
    const t = setTimeout(() => setQ(qInput.trim()), 500);
    return () => clearTimeout(t);
  }, [qInput]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/brukere${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { users: AdminUser[] };
        if (!cancelled) {
          setUsers(j.users);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, refresh]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b7488]" aria-hidden="true" />
        <Input
          id="bruker-sok"
          type="search"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Søk på navn eller e-post …"
          className="bg-white pl-9"
          aria-label="Søk etter bruker"
        />
      </div>

      {error ? (
        <FeilBoks what="brukerne" onRetry={() => setRefresh((c) => c + 1)} />
      ) : users === null ? (
        <TabSkeleton>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </TabSkeleton>
      ) : users.length === 0 ? (
        <Tomt tekst="Ingen brukere matcher søket ditt." />
      ) : (
        <div className="max-h-96 overflow-auto nice-scroll rounded-md border border-[#CCD2DE] bg-white shadow-sm">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#CCD2DE]">
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead>E-post</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead className="text-right">Bookinger</TableHead>
                <TableHead className="text-right">Profiler</TableHead>
                <TableHead>Opprettet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-navy">{u.name || "(uten navn)"}</TableCell>
                  <TableCell className="text-[#4a5468]">{u.email}</TableCell>
                  <TableCell>
                    <RoleChip role={u.role} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{u.bookings}</TableCell>
                  <TableCell className="text-right tabular-nums">{u.profiles}</TableCell>
                  <TableCell className="whitespace-nowrap text-[#4a5468]">{dato(u.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ---------------- Fane 4: Kuponger & gavekort ----------------

function KupongerTab() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [gifts, setGifts] = useState<GiftCard[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [toggling, setToggling] = useState<string | null>(null);

  // Ny kode-dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [kode, setKode] = useState("");
  const [prosent, setProsent] = useState("");
  const [belop, setBelop] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/kuponger");
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { coupons: Coupon[]; gifts: GiftCard[] };
        if (!cancelled) {
          setCoupons(j.coupons);
          setGifts(j.gifts);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  async function veksleAktiv(code: string, active: boolean) {
    setToggling(code);
    try {
      const res = await fetch("/api/admin/kuponger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, active }),
      });
      if (!res.ok) {
        toast({ title: "Kunne ikke endre kupongen", description: await parseError(res), variant: "destructive" });
        return;
      }
      setCoupons((prev) => (prev ? prev.map((c) => (c.code === code ? { ...c, active } : c)) : prev));
      toast({
        title: active ? "Kupongen er aktivert" : "Kupongen er deaktivert",
        description: `Koden ${code} er ${active ? "i bruk igjen" : "midlertidig stengt"}.`,
      });
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk tilkoblingen og prøv igjen.", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  }

  function resetSkjema() {
    setKode("");
    setProsent("");
    setBelop("");
    setBeskrivelse("");
  }

  async function opprettKupong(e: React.FormEvent) {
    e.preventDefault();
    const clean = kode.trim().toUpperCase();
    if (clean.length < 3) {
      toast({ title: "Koden må ha minst 3 tegn", variant: "destructive" });
      return;
    }
    const percentOff = Math.max(0, Math.round(Number(prosent) || 0));
    const amountOff = Math.max(0, Math.round(Number(belop) || 0));
    if (percentOff === 0 && amountOff === 0) {
      toast({
        title: "Velg en rabatt",
        description: "Fyll inn prosent eller et fast beløp.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kuponger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean, percentOff, amountOff, description: beskrivelse.trim() }),
      });
      if (!res.ok) {
        const errTekst = await parseError(res);
        toast({
          title: res.status === 409 ? "Koden finnes allerede" : "Kunne ikke opprette kupongen",
          description: errTekst,
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Kupongen er opprettet", description: `Koden ${clean} er aktiv fra nå.` });
      resetSkjema();
      setDialogOpen(false);
      setRefresh((c) => c + 1);
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk tilkoblingen og prøv igjen.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const rabattTekst = (c: Coupon) =>
    c.percentOff > 0
      ? `${c.percentOff} %`
      : c.amountOff > 0
        ? kr(c.amountOff)
        : "—";

  return (
    <div className="space-y-6">
      {error ? <FeilBoks what="kupongene" onRetry={() => setRefresh((c) => c + 1)} /> : null}

      {!error ? (
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6 lg:col-span-3" aria-label="Kuponger">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-navy">Kuponger</h2>
                <p className="text-xs text-[#6b7488]">Rabattkoder som kan brukes ved booking.</p>
              </div>
              <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetSkjema();
                }}
              >
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Ny rabattkode</DialogTitle>
                    <DialogDescription>
                      Koden blir aktiv med én gang. Velg rabatt i prosent eller som fast beløp.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={opprettKupong} className="grid gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="kp-kode">Kode</Label>
                      <Input
                        id="kp-kode"
                        value={kode}
                        onChange={(e) => setKode(e.target.value.toUpperCase())}
                        placeholder="F.eks. TAKT15"
                        required
                        minLength={3}
                        maxLength={20}
                        className="font-mono uppercase"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="kp-prosent">Prosent (0–100)</Label>
                        <Input
                          id="kp-prosent"
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={prosent}
                          onChange={(e) => setProsent(e.target.value)}
                          placeholder="F.eks. 15"
                          inputMode="numeric"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="kp-belop">Beløp (kr)</Label>
                        <Input
                          id="kp-belop"
                          type="number"
                          min={0}
                          max={5000}
                          step={1}
                          value={belop}
                          onChange={(e) => setBelop(e.target.value)}
                          placeholder="F.eks. 200"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="kp-beskrivelse">Beskrivelse</Label>
                      <Input
                        id="kp-beskrivelse"
                        value={beskrivelse}
                        onChange={(e) => setBeskrivelse(e.target.value)}
                        placeholder="F.eks. Kampanje for nybyggere"
                        maxLength={200}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={saving}>
                        {saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                        Opprett kode
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {coupons === null ? (
              <TabSkeleton>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </TabSkeleton>
            ) : coupons.length === 0 ? (
              <Tomt tekst="Ingen kuponger er opprettet ennå." />
            ) : (
              <div className="max-h-96 overflow-auto nice-scroll rounded-md border border-[#CCD2DE]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_#CCD2DE]">
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Rabatt</TableHead>
                      <TableHead className="text-right">Bruk</TableHead>
                      <TableHead>Beskrivelse</TableHead>
                      <TableHead className="text-right">Aktiv</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((c) => (
                      <TableRow key={c.code} className={cn(!c.active && "opacity-60")}>
                        <TableCell className="font-mono font-bold text-navy">{c.code}</TableCell>
                        <TableCell className="font-semibold text-navy">{rabattTekst(c)}</TableCell>
                        <TableCell className="text-right tabular-nums text-[#4a5468]">
                          {c.uses.toLocaleString("nb-NO")} / {c.maxUses.toLocaleString("nb-NO")}
                        </TableCell>
                        <TableCell className="max-w-48 truncate text-[#4a5468]" title={c.description}>
                          {c.description || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={c.active}
                            disabled={toggling === c.code}
                            onCheckedChange={(v) => veksleAktiv(c.code, v)}
                            aria-label={`${c.active ? "Deaktiver" : "Aktiver"} kupongen ${c.code}`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>

          <section className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm sm:p-6 lg:col-span-2" aria-label="Gavekort">
            <div className="mb-4">
              <h2 className="text-base font-bold text-navy">Gavekort</h2>
              <p className="text-xs text-[#6b7488]">Saldoen tilgjengelig per gavekort.</p>
            </div>
            {gifts === null ? (
              <TabSkeleton>
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </TabSkeleton>
            ) : gifts.length === 0 ? (
              <Tomt tekst="Ingen gavekort er solgt ennå." />
            ) : (
              <div className="max-h-96 divide-y divide-[#E4E8F0] overflow-y-auto nice-scroll rounded-md border border-[#CCD2DE]">
                {gifts.map((g) => (
                  <div key={g.code} className="flex flex-wrap items-center justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-navy">{g.code}</p>
                      <p className="text-xs text-[#6b7488]">Verdi {kr(g.amount)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-sky-pale px-2.5 py-0.5 text-xs font-bold text-navy">
                        Saldo {kr(g.balance)}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          g.active ? "bg-[#e7f3e4] text-[#2e6b28]" : "bg-[#fbe7e3] text-[#a13a2c]"
                        )}
                      >
                        {g.active ? "Aktiv" : "Inaktiv"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}

// ---------------- Fane 5: Anmeldelser ----------------

const ANMELDELSE_STATUSER = [
  { value: "PENDING", label: "Til moddering" },
  { value: "APPROVED", label: "Godkjente" },
  { value: "REJECTED", label: "Avslåtte" },
  { value: "ALLE", label: "Alle anmeldelser" },
] as const;

function AnmeldelserTab() {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [reviews, setReviews] = useState<AdminReview[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/admin/anmeldelser?status=${statusFilter}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { reviews: AdminReview[] };
        if (!cancelled) {
          setReviews(j.reviews);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, refresh]);

  async function settStatus(reviewId: string, status: string) {
    setBusyId(reviewId);
    try {
      const res = await fetch("/api/admin/anmeldelser", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, status }),
      });
      if (!res.ok) {
        toast({ title: "Kunne ikke lagre statusen", description: await parseError(res), variant: "destructive" });
        return;
      }
      toast({
        title:
          status === "APPROVED"
            ? "Anmeldelsen er godkjent"
            : status === "REJECTED"
              ? "Anmeldelsen er avslått"
              : "Anmeldelsen er satt på vent",
        description: "Vurderingssnittet på skolen og kurset er oppdatert.",
      });
      setRefresh((c) => c + 1);
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk tilkoblingen og prøv igjen.", variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-64">
          <Label htmlFor="anmeldelse-status" className="sr-only">
            Filtrer på status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="anmeldelse-status" className="w-full bg-white">
              <SelectValue placeholder="Velg status" />
            </SelectTrigger>
            <SelectContent>
              {ANMELDELSE_STATUSER.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {reviews ? (
          <p className="text-sm text-[#4a5468]">
            {reviews.length.toLocaleString("nb-NO")} {reviews.length === 1 ? "anmeldelse" : "anmeldelser"}
          </p>
        ) : null}
      </div>

      {error ? (
        <FeilBoks what="anmeldelsene" onRetry={() => setRefresh((c) => c + 1)} />
      ) : reviews === null ? (
        <TabSkeleton>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-md" />
          ))}
        </TabSkeleton>
      ) : reviews.length === 0 ? (
        <Tomt tekst="Ingen anmeldelser i denne statusen." />
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto nice-scroll pr-1">
          {reviews.map((r) => (
            <article key={r.id} className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={r.rating} />
                    <StatusChip status={r.status} />
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#2a2f3a]">{r.text}</p>
                  <p className="mt-2 text-xs text-[#6b7488]">
                    <span className="font-semibold text-navy">{r.school?.name ?? "Ukjent skole"}</span>
                    {r.course?.title ? ` • ${r.course.title}` : ""}
                    {` • ${r.authorName} • ${dato(r.createdAt)}`}
                  </p>
                  {r.reply ? (
                    <div className="mt-2 rounded-md bg-sky-pale p-3 text-xs leading-relaxed text-[#2a2f3a]">
                      <span className="font-semibold text-navy">Svar fra skolen: </span>
                      {r.reply}
                    </div>
                  ) : null}
                </div>
                <div className="w-40 shrink-0">
                  {busyId === r.id ? (
                    <div className="flex h-8 items-center justify-center">
                      <Loader2 className="size-4 animate-spin text-navy" aria-label="Arbeider" />
                    </div>
                  ) : (
                    <>
                      <Label htmlFor={`anm-status-${r.id}`} className="sr-only">
                        Sett status for anmeldelsen
                      </Label>
                      <Select value={r.status} onValueChange={(v) => settStatus(r.id, v)}>
                        <SelectTrigger id={`anm-status-${r.id}`} size="sm" className="w-full">
                          <SelectValue placeholder="Velg status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPROVED">Godkjenn</SelectItem>
                          <SelectItem value="REJECTED">Avslå</SelectItem>
                          <SelectItem value="PENDING">Avvent</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Fane 6: Varsellogg ----------------

function VarselloggTab() {
  const [notifications, setNotifications] = useState<NotificationRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/varsellogg?antall=60");
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { notifications: NotificationRow[] };
        if (!cancelled) {
          setNotifications(j.notifications);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  return (
    <div className="space-y-4">
      {error ? (
        <FeilBoks what="varsellisten" onRetry={() => setRefresh((c) => c + 1)} />
      ) : notifications === null ? (
        <TabSkeleton>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </TabSkeleton>
      ) : notifications.length === 0 ? (
        <Tomt tekst="Ingen varsler er sendt ennå." />
      ) : (
        <div className="max-h-96 divide-y divide-[#E4E8F0] overflow-y-auto nice-scroll rounded-md border border-[#CCD2DE] bg-white shadow-sm">
          {notifications.map((n) => (
            <div key={n.id} className="flex flex-wrap items-start gap-3 p-4">
              <ChannelChip channel={n.channel} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy">{n.subject}</p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#4a5468]">{n.body}</p>
                {n.email ? <p className="mt-1 text-xs text-[#6b7488]">Til: {n.email}</p> : null}
              </div>
              <time className="shrink-0 text-xs text-[#6b7488]" dateTime={n.createdAt}>
                {datoTid(n.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------- Hovedkomponent ----------------

const FANER = [
  { value: "oversikt", label: "Oversikt", icon: LayoutDashboard },
  { value: "skoler", label: "Danseskoler", icon: School },
  { value: "brukere", label: "Brukere", icon: Users },
  { value: "kuponger", label: "Kuponger & gavekort", icon: Ticket },
  { value: "anmeldelser", label: "Anmeldelser", icon: MessageSquare },
  { value: "varsellogg", label: "Varsellogg", icon: Bell },
] as const;

export function AdminApp({ userName }: { userName: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6" id="admin-panel">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#4a5468]">Hei, {userName}</p>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Administrasjon</h1>
          <p className="mt-1 text-sm text-[#4a5468]">
            Overblikk over danseskoler, brukere, salg og moderering — alt på ett sted.
          </p>
        </div>
        <span className="rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Taktfast Admin
        </span>
      </header>

      <Tabs defaultValue="oversikt" className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-md border border-[#CCD2DE] bg-white p-1 shadow-sm">
          {FANER.map((f) => (
            <TabsTrigger key={f.value} value={f.value} className="gap-1.5 px-3 sm:flex-none">
              <f.icon className="size-4" aria-hidden="true" />
              {f.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="oversikt" className="mt-2">
          <OversiktTab />
        </TabsContent>
        <TabsContent value="skoler" className="mt-2">
          <SkolerTab />
        </TabsContent>
        <TabsContent value="brukere" className="mt-2">
          <BrukereTab />
        </TabsContent>
        <TabsContent value="kuponger" className="mt-2">
          <KupongerTab />
        </TabsContent>
        <TabsContent value="anmeldelser" className="mt-2">
          <AnmeldelserTab />
        </TabsContent>
        <TabsContent value="varsellogg" className="mt-2">
          <VarselloggTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
