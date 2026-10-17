"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    if (!terms) {
      setTermsError(true);
      toast({
        variant: "destructive",
        title: "Du må godta vilkårene",
        description: "Kryss av for at du godtar vilkårene før du fortsetter.",
      });
      return;
    }
    setTermsError(false);
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, terms: true }),
      });
      const data: { error?: string } = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Kunne ikke opprette kontoen",
          description: data.error ?? "Prøv igjen om litt.",
        });
        return;
      }
      // Konto opprettet – logg automatisk inn
      const login = await signIn("credentials", { redirect: false, email, password });
      if (login?.error) {
        toast({
          title: "Kontoen er opprettet!",
          description: "Logg inn med e-post og passord for å komme i gang.",
        });
        router.push("/logg-inn");
        return;
      }
      toast({ title: "Velkommen til Taktfast!", description: "Kontoen din er klar." });
      router.push("/min-side");
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Noe gikk galt",
        description: "Sjekk internettforbindelsen og prøv igjen.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="reg-name">Navn</Label>
            <Input
              id="reg-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              placeholder="Fornavn og etternavn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-email">E-post</Label>
            <Input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="din@epost.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-phone">
              Telefon <span className="font-normal text-tf-muted">(valgfritt)</span>
            </Label>
            <Input
              id="reg-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              placeholder="F.eks. 900 00 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reg-password">Passord</Label>
            <Input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Velg et passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="reg-password-hint"
              className="h-11 bg-white"
            />
            <p id="reg-password-hint" className="text-xs text-tf-muted">
              Minst 8 tegn.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="reg-terms"
                checked={terms}
                onCheckedChange={(v) => {
                  setTerms(v === true);
                  if (v === true) setTermsError(false);
                }}
                aria-invalid={termsError || undefined}
                className="mt-0.5"
              />
              <Label htmlFor="reg-terms" className="font-normal leading-snug">
                Jeg godtar{" "}
                <Link
                  href="/vilkar"
                  className="font-semibold text-navy underline underline-offset-2 hover:no-underline"
                >
                  vilkårene
                </Link>{" "}
                og bekrefter at jeg har lest{" "}
                <Link
                  href="/personvern"
                  className="font-semibold text-navy underline underline-offset-2 hover:no-underline"
                >
                  personvernerklæringen
                </Link>
                .
              </Label>
            </div>
            {termsError && (
              <p role="alert" className="text-sm font-medium text-signal">
                Du må godta vilkårene for å opprette konto.
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Oppretter konto …" : "Opprett konto"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-tf-body">
          Har du allerede konto?{" "}
          <Link href="/logg-inn" className="font-semibold text-navy underline-offset-2 hover:underline">
            Logg inn <span aria-hidden="true">›</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
