"use client";

// Taktfast /min-side → Venteliste-fanen. Mutasjoner via API-ruter:
// godta tilbud → POST /api/venteliste/godta (redirect til bekreftelse), trekk meg → DELETE /api/venteliste.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, Clock3, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export type VentelisteEntryVM = {
  id: string;
  status: string;
  position: number;
  roleLabel: string;
  courseTitle: string;
  schoolName: string;
  /** Forhåndsformatert frist-tekst fra serveren (unngår SSR-tidssonefeil) */
  offerExpiresLabel: string;
};

export function VentelisteListe({ entries }: { entries: VentelisteEntryVM[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function godta(entryId: string) {
    setBusyId(entryId);
    try {
      const res = await fetch("/api/venteliste/godta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      const j = (await res.json()) as { ok?: boolean; code?: string; error?: string };
      if (res.ok && j.code) {
        toast({ title: "Plassen er din!", description: "Ventelisteplassen er konvertert til en bekreftet plass." });
        router.push(`/bekreftelse/${j.code}`);
      } else {
        toast({ variant: "destructive", title: "Kunne ikke godta tilbudet", description: j.error ?? "Prøv igjen." });
        router.refresh();
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusyId(null);
    }
  }

  async function trekkMeg(entryId: string) {
    setBusyId(entryId);
    try {
      const res = await fetch("/api/venteliste", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      if (res.ok) {
        toast({ title: "Du er trukket fra køen", description: "Du kan når som helst stille deg i kø igjen fra kurssiden." });
        router.refresh();
      } else {
        const j = (await res.json()) as { error?: string };
        toast({ variant: "destructive", title: "Kunne ikke trekke deg fra køen", description: j.error ?? "Prøv igjen." });
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ul className="space-y-4">
      {entries.map((e) => {
        const tilbud = e.status === "OFFERED";
        const busy = busyId === e.id;
        return (
          <li
            key={e.id}
            className={`rounded-md border p-4 sm:p-5 ${tilbud ? "border-[#E5C55A] bg-tint-butter" : "border-[#CCD2DE] bg-white"}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-bold text-white">
                Nr. {e.position} i kø
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-navy">
                <UserRound className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                {e.roleLabel}
              </span>
              {tilbud && (
                <span className="rounded-full bg-[#D6001C] px-2.5 py-0.5 text-xs font-bold text-white">
                  Plass tilbudt!
                </span>
              )}
            </div>

            <h3 className="mt-2.5 font-display text-lg font-bold text-navy">{e.courseTitle}</h3>
            <p className="text-sm text-tf-muted">{e.schoolName}</p>

            {tilbud ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-navy">
                  <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {e.offerExpiresLabel}
                </p>
                <Button onClick={() => godta(e.id)} disabled={busy}>
                  {busy ? "Godtar …" : "Godta tilbud"}
                </Button>
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-sm text-tf-muted">
                <BellRing className="h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
                Vi varsler deg hvis en plass åpner seg.
              </p>
            )}

            <div className="mt-2">
              <Button
                variant="ghost"
                onClick={() => trekkMeg(e.id)}
                disabled={busy}
                className="min-h-11 text-tf-muted hover:text-[#D6001C]"
              >
                {busy ? "Vent …" : "Trekk meg fra køen"}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
