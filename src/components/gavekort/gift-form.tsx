'use client';

// Gavekjøp: velg beløp, skriv hilsen, få kode på skjermen (demo — ingen ekte betaling)
import { useState } from "react";
import { Check, Copy, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatNok } from "@/lib/constants";

const PRESETS = [500, 1000] as const;

export function GiftForm() {
  const { toast } = useToast();
  const [preset, setPreset] = useState<number | null>(500);
  const [custom, setCustom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ code: string; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const amount = preset ?? (Number(custom) || 0);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || amount < 250 || amount > 5000) {
      toast({ title: "Ugyldig beløp", description: "Velg et beløp mellom 250,- og 5 000,-.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/gavekort", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, email: email.trim(), message: message.trim() }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast({ title: "Kunne ikke lage gavekort", description: j.error ?? "Prøv igjen.", variant: "destructive" });
        return;
      }
      setResult({ code: j.code, amount: j.amount });
      toast({ title: "Gavekortet er klart!", description: `Koden ${j.code} har ${formatNok(j.amount)} i saldo.` });
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Kunne ikke kopiere", description: `Skriv ned koden: ${result.code}` });
    }
  }

  if (result) {
    return (
      <div className="rounded-md border border-[#CCD2DE] bg-white p-6 text-center shadow-sm" role="status">
        <p className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-tint-mint">
          <Check className="h-6 w-6 text-[#2E7D32]" aria-hidden="true" />
        </p>
        <h2 className="mt-3 text-[22px]">Gavekortet er klart!</h2>
        <p className="mt-1 text-[15px] text-tf-muted">
          {formatNok(result.amount)} i saldo, gyldig i 3 år hos alle skoler på Taktfast.
        </p>
        <div className="mx-auto mt-4 flex max-w-xs items-center justify-center gap-2 rounded-md bg-sky-pale px-4 py-3">
          <span className="font-display text-2xl font-extrabold tracking-wider text-navy">{result.code}</span>
          <Button type="button" variant="ghost" size="icon" onClick={copyCode} aria-label="Kopier gavekortkoden">
            {copied ? <Check className="h-4 w-4 text-[#2E7D32]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </div>
        <p className="mt-4 text-[15px] font-semibold text-navy">Gavekortet brukes i steg 4 i bookingflyten.</p>
        <p className="mt-1 text-xs text-tf-muted">
          Demo: koden er sendt til {email.trim()} (simulert e-post). I en ekte løsning ville mottakeren fått den på SMS/e-post.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
      <p className="flex items-center gap-2 font-display text-lg font-bold text-navy">
        <Gift className="h-5 w-5" aria-hidden="true" /> Sett sammen gavekortet
      </p>

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold text-navy">Velg verdi</legend>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPreset(p);
                setCustom("");
              }}
              aria-pressed={preset === p}
              className={
                preset === p
                  ? "rounded-md border-2 border-navy bg-sky-pale px-3 py-3 font-display text-lg font-extrabold text-navy"
                  : "rounded-md border-2 border-[#CCD2DE] bg-white px-3 py-3 font-display text-lg font-extrabold text-navy hover:border-navy"
              }
            >
              {formatNok(p)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPreset(null)}
            aria-pressed={preset === null}
            className={
              preset === null
                ? "rounded-md border-2 border-navy bg-sky-pale px-3 py-3 text-sm font-bold text-navy"
                : "rounded-md border-2 border-[#CCD2DE] bg-white px-3 py-3 text-sm font-bold text-navy hover:border-navy"
            }
          >
            Egendefinert
          </button>
        </div>
        {preset === null && (
          <div className="mt-3">
            <Label htmlFor="gift-custom">Beløp (250–5 000,-)</Label>
            <Input
              id="gift-custom"
              type="number"
              min={250}
              max={5000}
              step={50}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="F.eks. 750"
              className="mt-1.5"
              inputMode="numeric"
              required
            />
          </div>
        )}
      </fieldset>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="gift-email">Din e-post (kvittering)</Label>
        <Input
          id="gift-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="deg@epost.no"
          required
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Label htmlFor="gift-message">Hilsen til mottakeren (valgfritt)</Label>
        <Textarea
          id="gift-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="«Gratulerer med dagen! Nå skal dere ut på dansegulvet …»"
        />
      </div>

      <Button type="submit" disabled={loading} className="mt-5 w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Lager gavekort …
          </>
        ) : amount ? (
          `Lag gavekort på ${formatNok(amount)}`
        ) : (
          "Lag gavekort"
        )}
      </Button>
      <p className="mt-2 text-center text-xs text-tf-muted">Demo — ingen ekte betaling skjer nå.</p>
    </form>
  );
}
