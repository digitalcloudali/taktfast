'use client';

// Bryllup: be skolen om tidsforslag basert på bryllupsdatoen (via /api/kontakt type BRYLLUP)
import { useState } from "react";
import { Loader2, MailQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Props = {
  schoolId: string;
  schoolName: string;
};

export function WeddingRequestDialog({ schoolId, schoolName }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          type: "BRYLLUP",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          weddingDate,
          participants: 2,
          message: message.trim(),
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        toast({ title: "Forespørselen ble ikke sendt", description: j.error ?? "Prøv igjen.", variant: "destructive" });
        return;
      }
      setOpen(false);
      toast({ title: "Forespørsel sendt til skolen", description: "Skolen svarer deg normalt innen 24 timer med tidsforslag." });
      setName(""); setEmail(""); setPhone(""); setWeddingDate(""); setMessage("");
    } catch {
      toast({ title: "Noe gikk galt", description: "Sjekk internettforbindelsen og prøv igjen.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Få tidsforslag fra skolen</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailQuestion className="h-5 w-5 text-navy" aria-hidden="true" /> Få tidsforslag fra {schoolName}
          </DialogTitle>
          <DialogDescription>
            Skolen ser på bryllupsdatoen deres og foreslår tider som passer — helt uforpliktende.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`wr-name-${schoolId}`}>Navn</Label>
              <Input id={`wr-name-${schoolId}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Deres navn" required minLength={2} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`wr-email-${schoolId}`}>E-post</Label>
              <Input id={`wr-email-${schoolId}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="deg@epost.no" required />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`wr-phone-${schoolId}`}>Telefon (valgfritt)</Label>
              <Input id={`wr-phone-${schoolId}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="900 00 000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`wr-date-${schoolId}`}>Bryllupsdato</Label>
              <Input id={`wr-date-${schoolId}`} type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`wr-msg-${schoolId}`}>Melding</Label>
            <Textarea
              id={`wr-msg-${schoolId}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              minLength={5}
              placeholder="Fortell om sangen, antall ganger dere vil trene, eller dere har spørsmål …"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sender …
                </>
              ) : (
                "Send forespørsel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
