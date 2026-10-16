'use client';

// Bryllup: book pakke direkte (auth-krevet) → Vipps (demo) → bekreftelse
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarHeart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fmtNok } from "@/lib/types";

type Props = {
  packageId: string;
  packageName: string;
  price: number;
  priceUnit: string;
  schoolName: string;
};

export function BookingPakkeDialog({ packageId, packageName, price, priceUnit, schoolName }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loadingMe, setLoadingMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [message, setMessage] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");

  async function loadMe() {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const j = await res.json();
        setName((prev) => prev || j.user?.name || "");
        return j.profiles?.[0]?.id ?? null;
      }
      return null;
    } finally {
      setLoadingMe(false);
    }
  }

  async function handleOpenChange(v: boolean) {
    setOpen(v);
    if (v) void loadMe();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const me = await fetch("/api/me");
      if (!me.ok) {
        toast({ title: "Logg inn først", description: "Du må ha en Taktfast-konto for å booke pakken." });
        router.push("/logg-inn");
        return;
      }
      const meData = await me.json();
      const profileId = meData.profiles?.[0]?.id;
      if (!profileId) {
        toast({ title: "Mangler deltakerprofil", description: "Vi fant ingen profil på kontoen din. Opprett en på Min side." });
        router.push("/min-side");
        return;
      }

      const bookRes = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "PAKKE",
          packageId,
          seats: [{ profileId, role: "BEGGE" }],
          ...(giftCardCode.trim() ? { giftCardCode: giftCardCode.trim() } : {}),
          weddingDate: weddingDate || undefined,
          note: message.trim() || undefined,
        }),
      });
      const bookJson = await bookRes.json();
      if (!bookRes.ok) {
        toast({ title: "Bookingen feilet", description: bookJson.error ?? "Prøv igjen.", variant: "destructive" });
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

      toast({ title: "Pakken er booket!", description: `Bestilling ${bookJson.code} er betalt med Vipps (demo).` });
      router.push(`/bekreftelse/${bookJson.code}`);
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full">Book pakke</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarHeart className="h-5 w-5 text-navy" aria-hidden="true" /> Book «{packageName}»
          </DialogTitle>
          <DialogDescription>
            Hos {schoolName} · {fmtNok(price)} {priceUnit === "PER_PAR" ? "per par" : "per time"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={`bp-date-${packageId}`}>Bryllupsdato (så skolen kan foreslå tider)</Label>
            <Input
              id={`bp-date-${packageId}`}
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bp-name-${packageId}`}>Navn</Label>
            <Input
              id={`bp-name-${packageId}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ditt navn"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bp-msg-${packageId}`}>Melding til skolen (valgfritt)</Label>
            <Textarea
              id={`bp-msg-${packageId}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Fortell gjerne om sangen deres eller dere har spesielle ønsker …"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`bp-gift-${packageId}`}>Gavekode (valgfritt)</Label>
            <Input
              id={`bp-gift-${packageId}`}
              value={giftCardCode}
              onChange={(e) => setGiftCardCode(e.target.value)}
              placeholder="F.eks. TF-DEMO-500"
            />
          </div>
          <p className="flex items-start gap-2 text-xs text-tf-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-navy" aria-hidden="true" />
            Betaling med Vipps (demo). Gratis avbestilling inntil 48 t før.
          </p>
          <DialogFooter>
            <Button type="submit" disabled={submitting || loadingMe} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Behandler …
                </>
              ) : (
                `Book og betal ${fmtNok(price)}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
