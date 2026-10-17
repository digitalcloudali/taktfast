"use client";

// Taktfast — «Fullfør betaling» på bekreftelsessiden når paymentStatus er PENDING.
// Demo-betaling via Vipps (POST /api/booking/betal), deretter oppfriskes siden.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function FullforBetaling({ code }: { code: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function betal() {
    setBusy(true);
    try {
      const res = await fetch("/api/booking/betal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, method: "VIPPS" }),
      });
      const j = (await res.json()) as { ok?: boolean; amount?: number; error?: string };
      if (res.ok) {
        toast({
          title: "Betalingen er gjennomført 🎉",
          description: `Vi «trakk» ${j.amount?.toLocaleString("nb-NO") ?? ""} kr via Vipps (demo). Plassen din er nå bekreftet.`,
        });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Betalingen feilet", description: j.error ?? "Prøv igjen." });
      }
    } catch {
      toast({ variant: "destructive", title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={betal} disabled={busy}>
      {busy ? "Betaler …" : "Fullfør betaling"}
    </Button>
  );
}
