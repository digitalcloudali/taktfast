"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const DEMO_USERS = [
  { email: "danser@taktfast.no", role: "Danser" },
  { email: "skole@taktfast.no", role: "Danseskole" },
  { email: "admin@taktfast.no", role: "Admin" },
] as const;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await signIn("credentials", { redirect: false, email, password });
      if (res?.error) {
        toast({
          variant: "destructive",
          title: "Feil e-post eller passord",
          description: "Sjekk opplysningene og prøv igjen.",
        });
        return;
      }
      router.push(callbackUrl || "/min-side");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("demo1234");
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
          <div className="space-y-1.5">
            <Label htmlFor="login-email">E-post</Label>
            <Input
              id="login-email"
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
            <Label htmlFor="login-password">Passord</Label>
            <div className="relative">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Passordet ditt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-[5px] text-tf-muted hover:bg-sky-pale hover:text-navy"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Logger inn …" : "Logg inn"}
          </Button>
        </form>

        {/* ---------- Demo-brukere ---------- */}
        <div className="mt-6 rounded-md bg-sky-pale p-4" aria-label="Demo-brukere">
          <p className="flex items-center gap-1.5 font-display text-sm font-bold text-navy">
            <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            Demo-brukere (passord demo1234)
          </p>
          <ul className="mt-3 space-y-2">
            {DEMO_USERS.map((u) => (
              <li key={u.email} className="flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm">
                  <span className="block truncate font-medium text-navy">{u.email}</span>
                  <span className="text-xs text-tf-muted">{u.role}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => fillDemo(u.email)}
                >
                  Fyll inn
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-6 text-center text-sm text-tf-body">
          Ny her?{" "}
          <Link href="/registrer" className="font-semibold text-navy underline-offset-2 hover:underline">
            Opprett konto <span aria-hidden="true">›</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
