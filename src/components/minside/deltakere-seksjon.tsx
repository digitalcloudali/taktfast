"use client";

// Taktfast /min-side → Deltakere-fanen. Legg til / samtykke / slett via API-ruter
// (POST / PATCH / DELETE /api/profiler). Ingen server actions.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { InfoBox } from "@/components/site/ui-bits";

export type DeltakerVM = {
  id: string;
  name: string;
  birthYear: number | null;
  isChild: boolean;
  consent: boolean;
};

export function DeltakereSeksjon({ profiles }: { profiles: DeltakerVM[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  async function leggTil(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const aar = birthYear.trim() === "" ? null : Number.parseInt(birthYear, 10);
      const res = await fetch("/api/profiler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthYear: aar !== null && !Number.isNaN(aar) ? aar : null,
          isChild,
          consent: isChild ? consent : false,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok) {
        toast({ title: "Deltakeren er lagt til", description: `${name.trim()} kan nå brukes ved påmeldinger.` });
        setOpen(false);
        setName("");
        setBirthYear("");
        setIsChild(false);
        setConsent(false);
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Kunne ikke legge til deltaker", description: j.error ?? "Prøv igjen." });
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusy(false);
    }
  }

  async function settSamtykke(id: string, value: boolean) {
    setBusyId(id);
    try {
      const res = await fetch("/api/profiler", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, consent: value }),
      });
      if (res.ok) {
        toast({
          title: value ? "Samtykke registrert" : "Samtykke fjernet",
          description: value ? "Barnet kan nå delta på kurs booket via Taktfast." : "Barnet kan ikke meldes på før samtykket er gitt.",
        });
        router.refresh();
      } else {
        const j = (await res.json()) as { error?: string };
        toast({ variant: "destructive", title: "Kunne ikke oppdatere samtykke", description: j.error ?? "Prøv igjen." });
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusyId(null);
    }
  }

  async function slett(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/profiler", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast({ title: "Deltakeren er slettet" });
        router.refresh();
      } else {
        const j = (await res.json()) as { error?: string };
        toast({ variant: "destructive", title: "Kunne ikke slette deltaker", description: j.error ?? "Prøv igjen." });
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusyId(null);
    }
  }

  const kanLagre = name.trim().length >= 2 && (!isChild || consent) && !busy;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tf-muted">
          Deltakerne du kan melde på kurs — {profiles.length} {profiles.length === 1 ? "profil" : "profiler"}.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Legg til deltaker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Legg til deltaker</DialogTitle>
              <DialogDescription>
                Legg til deg selv eller et familiemedlem — profilen gjenbrukes ved alle påmeldinger.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={leggTil} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="deltaker-navn">Navn</Label>
                <Input
                  id="deltaker-navn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="F.eks. Kari Danselyst"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deltaker-aar">Fødselsår (valgfritt)</Label>
                <Input
                  id="deltaker-aar"
                  type="number"
                  min={1900}
                  max={currentYear}
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder={String(currentYear - 30)}
                />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md bg-sky-pale px-3 py-2.5">
                <Label htmlFor="deltaker-barn" className="text-sm font-medium">
                  Deltakeren er under 18 år
                </Label>
                <Switch id="deltaker-barn" checked={isChild} onCheckedChange={setIsChild} />
              </div>
              {isChild && (
                <div className="flex items-start gap-2.5 rounded-md border border-[#CCD2DE] p-3">
                  <Checkbox
                    id="deltaker-samtykke"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="deltaker-samtykke" className="text-sm font-normal leading-snug">
                    Jeg bekrefter at jeg er foresatt og samtykker til at barnet deltar på kurs booket via Taktfast.
                  </Label>
                </div>
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={busy}>
                    Avbryt
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={!kanLagre}>
                  {busy ? "Lagrer …" : "Legg til"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {profiles.length === 0 ? (
        <InfoBox>
          Du har ingen deltakerprofiler ennå — legg til deg selv, så er opplysningene klare neste gang du melder deg på.
        </InfoBox>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => {
            const busy = busyId === p.id;
            return (
              <li key={p.id} className="rounded-md border border-[#CCD2DE] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold text-navy">{p.name}</p>
                    <p className="text-sm text-tf-muted">
                      {p.birthYear ? `Født ${p.birthYear} (${currentYear - p.birthYear} år)` : "Fødselsår ikke oppgitt"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.isChild && (
                        <span className="rounded-full bg-tint-pink px-2.5 py-0.5 text-xs font-bold text-navy">Barn</span>
                      )}
                      {p.isChild &&
                        (p.consent ? (
                          <span className="rounded-full bg-[#E7F3E8] px-2.5 py-0.5 text-xs font-bold text-[#1B7F3B]">
                            Samtykke gitt
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#FBE7EA] px-2.5 py-0.5 text-xs font-bold text-[#D6001C]">
                            Mangler samtykke
                          </span>
                        ))}
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Slett ${p.name}`}
                        disabled={busy}
                        className="h-11 w-11 shrink-0 text-tf-muted hover:text-[#D6001C]"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Slette {p.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Profilen fjernes fra deltakerlisten din. Profiler med aktive kurs kan ikke slettes, og
                          historikk og kvitteringer beholdes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={busy}>Avbryt</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => slett(p.id)}
                          disabled={busy}
                          className="bg-[#D6001C] text-white hover:bg-[#D6001C]/90"
                        >
                          {busy ? "Sletter …" : "Slett"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {p.isChild && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-sky-pale px-3 py-2">
                    <Label htmlFor={`samtykke-${p.id}`} className="text-sm">
                      Foresatt-samtykke
                    </Label>
                    <Switch
                      id={`samtykke-${p.id}`}
                      checked={p.consent}
                      disabled={busy}
                      onCheckedChange={(v) => settSamtykke(p.id, v)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <InfoBox>
        Barn under 18 må ha foresatt-samtykke for å delta på kurs. Du kan justere samtykket når som helst.
      </InfoBox>
    </div>
  );
}
