'use client';

// Kveldsbillett: antall 1–4, navn, betaling med Vipps (demo) → bekreftelse
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { fmtNok } from "@/lib/types";

type Props = {
  nightId: string;
  price: number;
  title: string;
};

export function NightBookingPanel({ nightId, price, title }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingMe, setCheckingMe] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const j = await res.json();
          if (alive) setName(j.user?.name ?? "");
        }
      } finally {
        if (alive) setCheckingMe(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function onBuy() {
    setLoading(true);
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) {
        toast({ title: "Logg inn først", description: "Du må ha en Taktfast-konto for å kjøpe kveldsbillett." });
        router.push("/logg-inn");
        return;
      }
      const me = await meRes.json();
      const profileId = me.profiles?.[0]?.id;
      if (!profileId) {
        toast({ title: "Mangler deltakerprofil", description: "Opprett en deltakerprofil på Min side først." });
        router.push("/min-side");
        return;
      }

      const bookRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "KVELD",
          nightId,
          seats: Array.from({ length: qty }, () => ({ profileId, role: "INGEN" })),
        }),
      });
      const bookJson = await bookRes.json();
      if (!bookRes.ok) {
        toast({
          title: bookRes.status === 409 ? "Utsolgt" : "Kjøpet feilet",
          description: bookJson.error ?? "Prøv igjen.",
          variant: "destructive",
        });
        return;
      }

      const payRes = await fetch("/api/booking/betal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: bookJson.code, method: "VIPPS" }),
      });
      const payJson = await payRes.json();
      if (!payRes.ok) {
        toast({ title: "Betalingen feilet (demo)", description: payJson.error ?? "Prøv igjen.", variant: "destructive" });
        router.push(`/bekreftelse/${bookJson.code}`);
        return;
      }

      toast({ title: "Kveldsbilletten er din!", description: `Bestilling ${bookJson.code} er betalt med Vipps (demo).` });
      router.push(`/bekreftelse/${bookJson.code}`);
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-[#CCD2DE] bg-white p-4 shadow-sm" aria-label={`Kjøp kveldsbillett til ${title}`}>
      <p className="flex items-center gap-2 font-display text-lg font-bold text-navy">
        <Ticket className="h-5 w-5" aria-hidden="true" /> Kjøp kveldsbillett
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="nb-qty">Antall billetter</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Færre billetter"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Input
              id="nb-qty"
              type="number"
              min={1}
              max={4}
              value={qty}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setQty(Math.min(4, Math.max(1, Math.round(v))));
              }}
              className="w-16 text-center"
              inputMode="numeric"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQty((q) => Math.min(4, q + 1))}
              disabled={qty >= 4}
              aria-label="Flere billetter"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="text-sm text-tf-muted">maks 4 per bestilling</span>
          </div>
        </div>

        <div>
          <Label htmlFor="nb-name">Navn</Label>
          <Input
            id="nb-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={checkingMe ? "Henter navnet ditt …" : "Ditt navn"}
          />
        </div>

        <div className="flex items-baseline justify-between border-t border-[#CCD2DE] pt-3">
          <span className="text-sm text-tf-muted">
            {fmtNok(price)} × {qty} {qty === 1 ? "billett" : "billetter"}
          </span>
          <span className="font-display text-2xl font-extrabold text-navy">{fmtNok(price * qty)}</span>
        </div>

        <Button onClick={onBuy} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Betaler med Vipps …
            </>
          ) : (
            `Betal ${fmtNok(price * qty)} med Vipps`
          )}
        </Button>

        <p className="flex items-start gap-2 text-xs text-tf-muted">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
          Sikker betaling med Vipps (demo). Gratis avbestilling inntil 48 t før.
        </p>
      </div>
    </div>
  );
}
