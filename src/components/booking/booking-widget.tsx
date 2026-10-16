"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { EXTRAS } from "@/lib/constants";
import { fmtNok } from "@/lib/types";
import { Users, Ticket, CreditCard, UserPlus, ChevronRight, ChevronLeft, Clock3, ListChecks } from "lucide-react";

export type BookingCourse = {
  id: string;
  title: string;
  kind: "KURS" | "DROPIN" | "PROVETIME" | "PRIVATTIME";
  isPartner: boolean;
  komAlene: boolean;
  price: number;
  studentPrice: number | null;
  seniorPrice: number | null;
  pricePer: string;
  dropInPrice: number | null;
  forereFree: number;
  folgereFree: number;
  seatsLeft: number;
  dates: { id: string; dateISO: string; startTime: string }[];
};

type Profile = { id: string; name: string; isChild: boolean; birthYear: number | null; consent: boolean };

const STEPS = ["Deltakere", "Rolle & balanse", "Tillegg", "Rabatt", "Betaling"];

export function BookingWidget({ course }: { course: BookingCourse }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [klippLeft, setKlippLeft] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [roles, setRoles] = useState<Record<string, "FORER" | "FOLGER">>({});
  const [dateId, setDateId] = useState<string>("");
  const [extras, setExtras] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState<{ type: string; label: string; code?: string; percentOff?: number; amountOff?: number; balance?: number } | null>(null);
  const [giftInfo, setGiftInfo] = useState<{ type: string; label: string; code?: string; balance?: number } | null>(null);
  const [useKlipp, setUseKlipp] = useState(false);
  const [method, setMethod] = useState<"VIPPS" | "KORT">("VIPPS");

  const needDate = course.kind === "DROPIN" || course.kind === "PROVETIME";

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setProfiles(d.profiles ?? []);
          setKlippLeft(d.klippLeft ?? 0);
          if (d.profiles?.[0]) setSelected([d.profiles[0].id]);
        }
      })
      .catch(() => {});
  }, []);

  const seatCount = selected.length || 0;
  const ageOf = useCallback((p: Profile) => (p.birthYear ? new Date().getFullYear() - p.birthYear : null), []);

  const basePrice = useMemo(() => {
    if (course.kind === "DROPIN") return course.dropInPrice ?? course.price;
    if (course.kind === "PROVETIME") return 100;
    return course.price;
  }, [course]);

  const seatsTotal = useMemo(() => {
    let sum = 0;
    for (const id of selected) {
      const p = profiles.find((x) => x.id === id);
      const age = p ? ageOf(p) : null;
      if (course.kind === "KURS" && course.studentPrice && age != null && age <= 30 && p && !p.isChild) sum += course.studentPrice;
      else if (course.kind === "KURS" && course.seniorPrice && age != null && age >= 60 && p && !p.isChild) sum += course.seniorPrice;
      else sum += basePrice;
    }
    if (course.pricePer === "PAR" && selected.length >= 2) sum = course.price;
    else if (course.pricePer === "PAR" && selected.length === 1) sum = Math.round(course.price / 2);
    return Math.round(sum);
  }, [selected, profiles, basePrice, course, ageOf]);

  const extrasTotal = extras.reduce((s, id) => s + (EXTRAS.find((e) => e.id === id)?.price ?? 0), 0);

  const discountFromCodes = useMemo(() => {
    let d = 0;
    const sub = seatsTotal + extrasTotal;
    if (couponInfo?.percentOff) d += Math.round((sub * couponInfo.percentOff) / 100);
    if (couponInfo?.amountOff) d += couponInfo.amountOff;
    if (useKlipp && klippLeft >= seatCount && course.kind === "DROPIN") d += (course.dropInPrice ?? basePrice) * seatCount;
    return d;
  }, [couponInfo, seatsTotal, extrasTotal, useKlipp, klippLeft, seatCount, course, basePrice]);

  const giftCover = giftInfo?.balance != null ? Math.min(giftInfo.balance, Math.max(0, seatsTotal + extrasTotal - discountFromCodes)) : 0;
  const total = Math.max(0, seatsTotal + extrasTotal - discountFromCodes - giftCover);

  const roleFull = (role: "FORER" | "FOLGER") => (role === "FORER" ? course.forereFree <= 0 : course.folgereFree <= 0);

  async function addProfile(data: { name: string; birthYear: number | null; isChild: boolean; consent: boolean }) {
    const res = await fetch("/api/profiler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const j = await res.json();
    if (!res.ok) {
      toast({ title: "Kunne ikke legge til deltaker", description: j.error, variant: "destructive" });
      return;
    }
    setProfiles((prev) => [...prev, j.profile]);
    setSelected((prev) => [...prev, j.profile.id]);
    toast({ title: "Deltaker lagt til", description: `${j.profile.name} er klar for dansetime 💃` });
  }

  async function validateCode() {
    const res = await fetch("/api/kuponger/valider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    const j = await res.json();
    if (!res.ok) {
      toast({ title: "Koden virker ikke", description: j.error, variant: "destructive" });
      return;
    }
    if (j.type === "GAVEKORT") {
      setGiftInfo(j);
    } else {
      setCouponInfo(j);
    }
    setCoupon("");
    toast({ title: "Rabatt registrert", description: j.label });
  }

  async function joinWaitlist() {
    if (!selected[0]) {
      toast({ title: "Velg deltaker først", variant: "destructive" });
      return;
    }
    const role = roles[selected[0]] ?? (course.forereFree >= course.folgereFree ? "FORER" : "FOLGER");
    const res = await fetch("/api/venteliste", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: course.id, profileId: selected[0], role }),
    });
    const j = await res.json();
    if (!res.ok) {
      toast({ title: "Kunne ikke stille deg i kø", description: j.error, variant: "destructive" });
      return;
    }
    toast({ title: "Du står på venteliste!", description: `Du er nummer ${j.position} i køen. Vi varsler deg hvis en plass åpner seg.` });
    router.push("/min-side");
  }

  async function pay() {
    setLoading(true);
    try {
      const bookingRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: course.kind,
          courseId: course.id,
          dateId: needDate ? dateId : undefined,
          seats: selected.map((id) => ({ profileId: id, role: course.isPartner ? roles[id] ?? "FORER" : "INGEN" })),
          extras,
          couponCode: couponInfo?.code,
          giftCardCode: giftInfo?.code,
        }),
      });
      const bj = await bookingRes.json();
      if (!bookingRes.ok) {
        if (bookingRes.status === 401) {
          router.push("/logg-inn");
          return;
        }
        toast({ title: "Bestillingen feilet", description: bj.error, variant: "destructive" });
        return;
      }
      const payRes = await fetch("/api/booking/betal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: bj.code, method }),
      });
      const pj = await payRes.json();
      if (!payRes.ok) {
        toast({ title: "Betalingen feilet", description: pj.error, variant: "destructive" });
        return;
      }
      toast({ title: "Betaling gjennomført 🎉", description: "Din plass er bekreftet. God dans!" });
      router.push(`/bekreftelse/${bj.code}`);
    } finally {
      setLoading(false);
    }
  }

  const canNext = () => {
    if (step === 0) return selected.length > 0;
    if (step === 1 && needDate) return !!dateId;
    if (step === 1 && course.isPartner) return selected.every((id) => roles[id]);
    return true;
  };

  return (
    <Card className="rounded-md border-[#CCD2DE] shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-xl text-navy">Meld deg på</CardTitle>
          <span className="text-sm font-semibold text-[#6B6B6B]">
            Steg {step + 1} av {STEPS.length}
          </span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2 h-1.5" />
        <p className="mt-2 text-xs font-medium text-[#6B6B6B]">{STEPS.join(" › ")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 0 && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-navy"><Users className="h-4 w-4" /> Hvem skal danse?</p>
            {profiles.length === 0 && <p className="text-sm text-[#6B6B6B]">Laster profiler …</p>}
            {profiles.map((p) => (
              <label key={p.id} className="flex items-center justify-between gap-3 rounded-md border border-[#CCD2DE] bg-white p-3 hover:bg-sky-pale has-[[data-state=checked]]:border-navy">
                <span className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={(v) => setSelected((prev) => (v ? [...prev, p.id] : prev.filter((x) => x !== p.id)))}
                    data-state={selected.includes(p.id) ? "checked" : "unchecked"}
                    aria-label={`Velg ${p.name}`}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy">{p.name}</span>
                    <span className="block text-xs text-[#6B6B6B]">
                      {p.isChild ? `Barn${p.birthYear ? `, født ${p.birthYear}` : ""}${p.consent ? "" : " · mangler foresatt-samtykke"}` : p.birthYear ? `Født ${p.birthYear}` : "Voksen"}
                    </span>
                  </span>
                </span>
              </label>
            ))}
            <AddProfileDialog onAdd={addProfile} />
            {course.komAlene && course.isPartner && (
              <p className="rounded-md bg-[#FEEFF6] p-3 text-xs text-navy">
                💃 Du kan <strong>komme alene</strong> — vi balanserer førere og følgere, og bytter partnere gjennom timen.
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {course.isPartner && (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-navy"><ListChecks className="h-4 w-4" /> Rolle per deltaker</p>
                {selected.map((id) => {
                  const p = profiles.find((x) => x.id === id);
                  const role = roles[id] ?? "FORER";
                  const full = roleFull(role);
                  return (
                    <div key={id} className="rounded-md border border-[#CCD2DE] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-navy">{p?.name}</span>
                        <span className="text-xs text-[#6B6B6B]">{course.forereFree} førere · {course.folgereFree} følgere ledige</span>
                      </div>
                      <RadioGroup value={role} onValueChange={(v) => setRoles((r) => ({ ...r, [id]: v as "FORER" | "FOLGER" }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FORER" id={`r-${id}-f`} disabled={course.forereFree <= 0} />
                          <Label htmlFor={`r-${id}-f`} className="text-sm">Fører</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="FOLGER" id={`r-${id}-g`} disabled={course.folgereFree <= 0} />
                          <Label htmlFor={`r-${id}-g`} className="text-sm">Følger</Label>
                        </div>
                      </RadioGroup>
                      {full && (
                        <p className="mt-2 text-xs font-semibold text-[#D6001C]">
                          {role === "FORER" ? "Førerrollen er full" : "Følgerrollen er full"} — velg den andre rollen eller still deg i kø.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {needDate && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-semibold text-navy"><Clock3 className="h-4 w-4" /> Velg dato</Label>
                <Select value={dateId} onValueChange={setDateId}>
                  <SelectTrigger aria-label="Velg dato"><SelectValue placeholder="Velg dato …" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {course.dates.map((d) => {
                      const dt = new Date(d.dateISO);
                      return (
                        <SelectItem key={d.id} value={d.id}>
                          {dt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })} kl. {d.startTime}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-navy">Tillegg (valgfritt)</p>
            {EXTRAS.map((e) => (
              <label key={e.id} className="flex items-start gap-3 rounded-md border border-[#CCD2DE] p-3 hover:bg-sky-pale">
                <Checkbox
                  checked={extras.includes(e.id)}
                  onCheckedChange={(v) => setExtras((prev) => (v ? [...prev, e.id] : prev.filter((x) => x !== e.id)))}
                  aria-label={e.name}
                />
                <span>
                  <span className="block text-sm font-semibold text-navy">{e.name} · {fmtNok(e.price)}</span>
                  <span className="block text-xs text-[#6B6B6B]">{e.desc}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-navy">Rabattkode eller gavekort</Label>
              <div className="flex gap-2">
                <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="F.eks. TAKT10 eller TF-DEMO-500" aria-label="Rabattkode" />
                <Button type="button" variant="secondary" onClick={validateCode}>Bruk kode</Button>
              </div>
              {couponInfo && <p className="text-xs font-semibold text-[#1C3F78]">✔ {couponInfo.label}</p>}
              {giftInfo && <p className="text-xs font-semibold text-[#1C3F78]">✔ {giftInfo.label}</p>}
            </div>
            {klippLeft > 0 && course.kind === "DROPIN" && (
              <label className="flex items-center gap-3 rounded-md bg-sky-pale p-3">
                <Checkbox checked={useKlipp} onCheckedChange={(v) => setUseKlipp(!!v)} aria-label="Bruk klippekort" />
                <span className="text-sm text-navy"><strong>Bruk klippekort</strong> ({klippLeft} klipp igjen) — dekker {seatCount} klipp</span>
              </label>
            )}
            <p className="text-xs text-[#6B6B6B]">Prøvetime hos samme skole gir 100,- i kreditt ved kjøp av kursrekke (trekkes automatisk).</p>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="rounded-md bg-sky-pale p-4 text-sm">
              <div className="flex justify-between py-1"><span>{course.title}</span><span className="font-semibold">{fmtNok(seatsTotal)}</span></div>
              {extrasTotal > 0 && <div className="flex justify-between py-1 text-[#6B6B6B]"><span>Tillegg</span><span>{fmtNok(extrasTotal)}</span></div>}
              {discountFromCodes > 0 && <div className="flex justify-between py-1 text-[#1C3F78]"><span>Rabatt</span><span>−{fmtNok(discountFromCodes)}</span></div>}
              {giftCover > 0 && <div className="flex justify-between py-1 text-[#1C3F78]"><span>Gavekort</span><span>−{fmtNok(giftCover)}</span></div>}
              <div className="mt-2 flex justify-between border-t border-[#CCD2DE] pt-2 text-lg font-bold text-navy"><span>Å betale</span><span>{fmtNok(total)}</span></div>
            </div>
            <RadioGroup value={method} onValueChange={(v) => setMethod(v as "VIPPS" | "KORT")} className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-[#CCD2DE] p-3 has-[[data-state=checked]]:border-navy">
                <RadioGroupItem value="VIPPS" id="m-vipps" />
                <span className="flex items-center gap-2 text-sm font-semibold text-navy"><Ticket className="h-4 w-4 text-[#FF5B24]" /> Vipps <span className="text-[10px] font-normal text-[#6B6B6B]">(demo)</span></span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md border border-[#CCD2DE] p-3 has-[[data-state=checked]]:border-navy">
                <RadioGroupItem value="KORT" id="m-kort" />
                <span className="flex items-center gap-2 text-sm font-semibold text-navy"><CreditCard className="h-4 w-4" /> Kort <span className="text-[10px] font-normal text-[#6B6B6B]">(demo)</span></span>
              </label>
            </RadioGroup>
            <Button size="xl" className="w-full" onClick={pay} disabled={loading}>
              {loading ? "Behandler betaling …" : total === 0 ? "Bekreft bestilling (0,-)" : `Betal ${fmtNok(total)} med ${method === "VIPPS" ? "Vipps" : "kort"}`}
            </Button>
            <p className="text-center text-xs text-[#6B6B6B]">Gratis avbestilling inntil 48 t før start · Trygg betaling (demo)</p>
          </div>
        )}

        {step < 4 && (
          <div className="flex items-center justify-between gap-3 border-t border-[#CCD2DE] pt-4">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} type="button">
              <ChevronLeft className="h-4 w-4" /> Tilbake
            </Button>
            <div className="flex items-center gap-2">
              {course.isPartner && (course.forereFree <= 0 || course.folgereFree <= 0) && (
                <Button variant="outline" type="button" onClick={joinWaitlist}>Venteliste</Button>
              )}
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} type="button">
                Neste <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddProfileDialog({ onAdd }: { onAdd: (data: { name: string; birthYear: number | null; isChild: boolean; consent: boolean }) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [consent, setConsent] = useState(false);

  function submit() {
    if (name.trim().length < 2) return;
    onAdd({ name: name.trim(), birthYear: birthYear ? Number(birthYear) : null, isChild, consent: isChild ? consent : false });
    setName(""); setBirthYear(""); setIsChild(false); setConsent(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" type="button"><UserPlus className="h-4 w-4" /> Legg til ny deltaker (f.eks. barn eller partner)</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-navy">Ny deltaker</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="np-name">Navn</Label>
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Fornavn og etternavn" />
          </div>
          <div>
            <Label htmlFor="np-year">Fødselsår (brukes til student-/honnørpris og aldersgruppe)</Label>
            <Input id="np-year" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1990" inputMode="numeric" />
          </div>
          <label className="flex items-center gap-2">
            <Checkbox checked={isChild} onCheckedChange={(v) => setIsChild(!!v)} id="np-child" />
            <span className="text-sm">Dette er et barn (under 18)</span>
          </label>
          {isChild && (
            <label className="flex items-center gap-2 rounded-md bg-[#FEEFF6] p-3">
              <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} id="np-consent" />
              <span className="text-sm text-navy">Jeg bekrefter som foresatt at barnet kan delta (påkrevd)</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={name.trim().length < 2}>Legg til deltaker</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
