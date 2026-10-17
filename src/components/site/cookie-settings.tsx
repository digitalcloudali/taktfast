"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

type CookieCategory = {
  id: string;
  title: string;
  description: string;
  locked?: boolean;
  defaultOn?: boolean;
};

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "necessaria",
    title: "Nødvendige",
    description:
      "Kreves for at siden skal fungere: innloggingssesong og ditt cookie-valg. Disse kan ikke slås av.",
    locked: true,
    defaultOn: true,
  },
  {
    id: "analyse",
    title: "Analyse",
    description:
      "Hjelper oss å forstå hvilke stiler, byer og kurs som er mest populære – anonymisert og samlet.",
    defaultOn: true,
  },
  {
    id: "markedsforing",
    title: "Markedsføring",
    description:
      "Gjør at vi kan vise relevante dansekurs og kampanjer, f.eks. brudevalskurs når du leser bryllupsguider.",
    defaultOn: false,
  },
];

export function CookieSettings() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c.id, c.defaultOn ?? false]))
  );

  function save(next: Record<string, boolean>) {
    try {
      window.localStorage.setItem("taktfast-cookie-preferanser", JSON.stringify({ ...next, savedAt: Date.now() }));
    } catch {
      // localStorage kan være utilgjengelig – demoen fungerer uansett
    }
    toast({
      title: "Innstillinger lagret (demo)",
      description: "Valget ditt er lagret lokalt i nettleseren.",
    });
  }

  function handleSave() {
    save(prefs);
  }

  function allowAll() {
    const all = Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c.id, true]));
    setPrefs(all);
    save(all);
  }

  return (
    <div className="rounded-md border border-[#CCD2DE] bg-white p-6 shadow-sm">
      <h2 className="text-2xl">Dine valg</h2>
      <p className="mt-2 text-[15px] text-tf-body">
        Du bestemmer selv. Endre innstillingene og lagre – valget gjelder denne nettleseren.
      </p>

      <ul className="mt-6 divide-y divide-[#CCD2DE]">
        {COOKIE_CATEGORIES.map((cat) => (
          <li key={cat.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="max-w-lg">
              <p className="flex items-center gap-2 font-display font-bold text-navy">
                {cat.title}
                {cat.locked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-pale px-2 py-0.5 text-[11px] font-semibold text-navy">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Alltid på
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-tf-muted">{cat.description}</p>
            </div>
            <Switch
              checked={prefs[cat.id]}
              disabled={cat.locked}
              onCheckedChange={(v) => setPrefs((prev) => ({ ...prev, [cat.id]: v }))}
              aria-label={`Informasjonskapsler: ${cat.title}`}
              className="mt-1"
            />
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="h-11 px-6" onClick={handleSave}>
          Lagre innstillinger
        </Button>
        <Button variant="outline" className="h-11 px-6" onClick={allowAll}>
          Tillat alle
        </Button>
      </div>
    </div>
  );
}
