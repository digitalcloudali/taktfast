"use client";

// Taktfast — delt avbestillingsknapp med bekreftelsesvindu.
// Brukes både fra /min-side og /bekreftelse/[kode]. Mutasjon via API-rute, aldri server action.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
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

type AvbestillSvar = { ok?: boolean; refund?: number; refundPct?: number; reason?: string; error?: string };

export function AvbestillKnapp({
  bookingId,
  bookingIds,
  label,
}: {
  bookingId: string;
  /** Alle aktive bookinger som deler koden (avbestiller hele bestillingen). Faller tilbake til bookingId. */
  bookingIds?: string[];
  label?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const ids = bookingIds && bookingIds.length > 0 ? bookingIds : [bookingId];

  async function avbestill() {
    setBusy(true);
    try {
      let refundSum = 0;
      let reason = "";
      let feilet = false;
      for (const id of ids) {
        const res = await fetch("/api/booking/avbestill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: id }),
        });
        const j = (await res.json()) as AvbestillSvar;
        if (!res.ok) {
          feilet = true;
          toast({ variant: "destructive", title: "Kunne ikke avbestille", description: j.error ?? "Prøv igjen." });
          break;
        }
        refundSum += j.refund ?? 0;
        if (j.reason) reason = j.reason;
      }
      if (!feilet) {
        toast({
          title: "Bestillingen er avbestilt",
          description:
            refundSum > 0
              ? `${reason} Refusjon: ${refundSum.toLocaleString("nb-NO")},-.`
              : reason || "Du finner detaljene på Min side.",
        });
      }
      router.refresh();
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={busy}
          className="border-[#D6001C]/40 text-[#D6001C] hover:bg-[#D6001C]/5 hover:text-[#D6001C]"
        >
          {busy ? "Avbestiller …" : (label ?? "Avbestill")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Avbestille bestillingen?</AlertDialogTitle>
          <AlertDialogDescription>
            Bekreftelsen og QR-koden blir ugyldige, og plassen frigis til andre. Du får full refusjon inntil 48 timer
            før første gang — etter det kan refusjonen bli redusert eller bortfalle. {ids.length > 1 ? `Alle ${ids.length} deltakere i bestillingen avbestilles.` : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Behold bestillingen</AlertDialogCancel>
          <AlertDialogAction
            onClick={avbestill}
            disabled={busy}
            className="bg-[#D6001C] text-white hover:bg-[#D6001C]/90"
          >
            {busy ? "Avbestiller …" : "Ja, avbestill"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
