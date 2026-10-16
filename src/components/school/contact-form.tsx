"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

type ContactFormProps = {
  schoolId: string;
  schoolName: string;
};

/** Kontaktskjema: sender spørsmål til skolen via /api/kontakt */
export function ContactForm({ schoolId, schoolName }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          type: "SPORSMAL",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!res.ok) {
        toast({
          title: "Kunne ikke sende meldingen",
          description: data?.error ?? "Prøv igjen om litt.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Meldingen er sendt!",
        description: data?.message ?? `${schoolName} svarer deg normalt innen 1–2 dager.`,
      });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      toast({
        title: "Noe gikk galt",
        description: "Sjekk nettforbindelsen og prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-md border border-[#CCD2DE] bg-white p-4 sm:p-6" noValidate={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="kontakt-navn">Navn *</Label>
          <Input
            id="kontakt-navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Fornavn og etternavn"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kontakt-epost">E-post *</Label>
          <Input
            id="kontakt-epost"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deg@epost.no"
            required
            autoComplete="email"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kontakt-telefon">Telefon (valgfritt)</Label>
        <Input
          id="kontakt-telefon"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+47 900 00 000"
          maxLength={20}
          autoComplete="tel"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="kontakt-melding">Melding *</Label>
        <Textarea
          id="kontakt-melding"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hei! Jeg lurer på …`}
          required
          minLength={5}
          maxLength={1500}
          rows={5}
        />
        <p className="text-xs text-[#6B6B6B]">{message.length}/1500 tegn</p>
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {sending ? "Sender melding …" : "Send melding til skolen"}
      </Button>
      <p className="text-xs text-[#6B6B6B]">
        Ved å sende godtar du at {schoolName} mottar navn og kontaktinformasjon for å svare deg.
      </p>
    </form>
  );
}
