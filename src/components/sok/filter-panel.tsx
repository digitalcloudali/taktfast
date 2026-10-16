"use client";

// Taktfast /sok — filterpanel (klient): flyttbare filtre via router.push, chips og visningsvalg
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { List, MapPin, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { AGE_GROUPS, CITIES, DANCE_STYLES, FAMILIES, FORMATS, LEVELS, weekdayName } from "@/lib/constants";
import { activeFilterChips, activeFilterCount, filtersToQuery, type ChipKey, type SokFilters } from "./params";

const ALLE = "__ALLE__";

type ApplyFn = (next: Partial<SokFilters>) => void;

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
      </Label>
      <Select
        value={value ?? ALLE}
        onValueChange={(v) => onChange(v === ALLE ? undefined : v)}
      >
        <SelectTrigger id={id} className="w-full bg-white" aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALLE}>{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SwitchRow({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="text-sm text-tf-body">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function FilterControls({ filters, apply }: { filters: SokFilters; apply: ApplyFn }) {
  // Fritekst og makspris holdes som ukontrollerte inputs (bevarer fokus under debounced søk);
  // synkroniseres via refs når filtre endres utenfra (chips/nullstill)
  const qRef = useRef<HTMLInputElement>(null);
  const prisRef = useRef<HTMLInputElement>(null);
  const applyRef = useRef<ApplyFn>(apply);
  const qTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prisTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(
    () => () => {
      if (qTimer.current) clearTimeout(qTimer.current);
      if (prisTimer.current) clearTimeout(prisTimer.current);
    },
    []
  );

  // Hold inputfeltene i takt med URL-en når filtre fjernes via chips eller «Nullstill»
  useEffect(() => {
    const el = qRef.current;
    if (el && el.value !== (filters.q ?? "")) el.value = filters.q ?? "";
  }, [filters.q]);
  useEffect(() => {
    const el = prisRef.current;
    const v = filters.maksPris != null ? String(filters.maksPris) : "";
    if (el && el.value !== v) el.value = v;
  }, [filters.maksPris]);

  function onQChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (qTimer.current) clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => applyRef.current({ q: v.trim() || undefined }), 500);
  }

  function onPrisChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (prisTimer.current) clearTimeout(prisTimer.current);
    prisTimer.current = setTimeout(() => {
      const n = Number(v.replace(",", "."));
      applyRef.current({ maksPris: Number.isFinite(n) && n > 0 ? Math.round(n) : undefined });
    }, 600);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sok-fritekst" className="text-sm font-semibold text-navy">
          Fritekst
        </Label>
        <Input
          ref={qRef}
          id="sok-fritekst"
          type="search"
          placeholder="Søk kurs, skole eller stil …"
          defaultValue={filters.q ?? ""}
          onChange={onQChange}
          className="bg-white"
          autoComplete="off"
          aria-describedby="sok-fritekst-hjelp"
        />
        <p id="sok-fritekst-hjelp" className="text-xs text-tf-muted">
          Søker i kurstittel, skolenavn og stil.
        </p>
      </div>

      <FilterSelect
        id="f-stil"
        label="Dansestil"
        value={filters.stil}
        onChange={(v) => apply({ stil: v })}
        placeholder="Alle stiler"
        options={DANCE_STYLES.map((s) => ({ value: s.slug, label: s.name }))}
      />
      <FilterSelect
        id="f-familie"
        label="Dansefamilie"
        value={filters.familie}
        onChange={(v) => apply({ familie: v })}
        placeholder="Alle familier"
        options={FAMILIES.map((x) => ({ value: x.value, label: x.label }))}
      />
      <FilterSelect
        id="f-by"
        label="Sted"
        value={filters.by}
        onChange={(v) => apply({ by: v })}
        placeholder="Alle byer"
        options={CITIES.map((c) => ({ value: c.slug, label: c.name }))}
      />
      <FilterSelect
        id="f-dag"
        label="Ukedag"
        value={filters.dag ? String(filters.dag) : undefined}
        onChange={(v) => apply({ dag: v ? Number(v) : undefined })}
        placeholder="Alle dager"
        options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ value: String(n), label: weekdayName(n) }))}
      />
      <FilterSelect
        id="f-tid"
        label="Tidspunkt"
        value={filters.tid}
        onChange={(v) => apply({ tid: v as "dag" | "kveld" | undefined })}
        placeholder="Dag og kveld"
        options={[
          { value: "dag", label: "Dag (før kl. 17)" },
          { value: "kveld", label: "Kveld (etter kl. 17)" },
        ]}
      />
      <FilterSelect
        id="f-niva"
        label="Nivå"
        value={filters.niva}
        onChange={(v) => apply({ niva: v })}
        placeholder="Alle nivåer"
        options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
      />
      <FilterSelect
        id="f-alder"
        label="Alder"
        value={filters.alder}
        onChange={(v) => apply({ alder: v })}
        placeholder="Alle aldre"
        options={AGE_GROUPS.map((a) => ({ value: a.value, label: a.label }))}
      />
      <FilterSelect
        id="f-format"
        label="Format"
        value={filters.format}
        onChange={(v) => apply({ format: v })}
        placeholder="Alle formater"
        options={FORMATS.map((fm) => ({ value: fm.value, label: fm.label }))}
      />
      <FilterSelect
        id="f-rolle"
        label="Rolle i pardans"
        value={filters.rolle}
        onChange={(v) => apply({ rolle: v as "FORER" | "FOLGER" | undefined })}
        placeholder="Alle roller"
        options={[
          { value: "FORER", label: "Fører" },
          { value: "FOLGER", label: "Følger" },
        ]}
      />
      <FilterSelect
        id="f-rating"
        label="Vurdering"
        value={filters.minRating ? String(filters.minRating) : undefined}
        onChange={(v) => apply({ minRating: v ? Number(v) : undefined })}
        placeholder="Alle vurderinger"
        options={[
          { value: "3", label: "3+ stjerner" },
          { value: "4", label: "4+ stjerner" },
          { value: "4.5", label: "4,5+ stjerner" },
        ]}
      />

      <div className="space-y-1.5">
        <Label htmlFor="f-makspris" className="text-sm font-semibold text-navy">
          Makspris
        </Label>
        <div className="relative">
          <Input
            ref={prisRef}
            id="f-makspris"
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            placeholder="Ingen grense"
            defaultValue={filters.maksPris ?? ""}
            onChange={onPrisChange}
            className="bg-white pr-10"
            aria-label="Makspris i kroner"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-tf-muted">kr</span>
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-[#CCD2DE] bg-white p-3">
        <SwitchRow
          id="f-komalene"
          label="Kommer alene (uten partner)"
          checked={!!filters.komAlene}
          onChange={(v) => apply({ komAlene: v || undefined })}
        />
        <SwitchRow
          id="f-ledig"
          label="Ledige plasser nå"
          checked={!!filters.ledig}
          onChange={(v) => apply({ ledig: v || undefined })}
        />
        <SwitchRow
          id="f-student"
          label="Studentpris"
          checked={!!filters.student}
          onChange={(v) => apply({ student: v || undefined })}
        />
      </div>
    </div>
  );
}

/** Filterpanel: flyout-ark på mobil, fast panel i venstrekolonne på desktop */
export function FilterPanel({ filters }: { filters: SokFilters }) {
  const router = useRouter();

  function apply(next: Partial<SokFilters>) {
    const merged: SokFilters = { ...filters, ...next, side: 1 };
    const qs = filtersToQuery(merged);
    router.push(qs ? `/sok?${qs}` : "/sok", { scroll: false });
  }

  const count = activeFilterCount(filters);
  const nullstill = (
    <Link href="/sok" className="text-sm font-semibold text-navy underline underline-offset-4 hover:text-navy-mid">
      Nullstill filtre
    </Link>
  );

  return (
    <>
      {/* Mobil: filtrer-knapp som åpner ark */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center gap-2">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtrer
              {count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-navy px-1.5 text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
            <SheetHeader>
              <SheetTitle className="font-display text-navy">Filtrer kurs</SheetTitle>
              <SheetDescription className="sr-only">Juster filtrene for kurssøket.</SheetDescription>
            </SheetHeader>
            <div className="px-4 pb-8">
              <FilterControls filters={filters} apply={apply} />
              <div className="mt-6">{nullstill}</div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop: fast filterpanel */}
      <div className="hidden lg:block">
        <nav
          aria-label="Filtre for kurssøk"
          className="nice-scroll rounded-md border border-[#CCD2DE] bg-sky-pale p-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-display font-bold text-navy">
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filtrer kurs
            </p>
            {count > 0 && (
              <span className="text-xs font-semibold text-tf-muted">{count} aktive</span>
            )}
          </div>
          <FilterControls filters={filters} apply={apply} />
          <div className="mt-6 border-t border-[#CCD2DE] pt-4">{nullstill}</div>
        </nav>
      </div>
    </>
  );
}

/** Fjernbare chips for aktive filtre, vises over resultatene */
export function ActiveFilterChips({ filters }: { filters: SokFilters }) {
  const router = useRouter();
  const chips = activeFilterChips(filters);
  if (chips.length === 0) return null;

  function remove(key: ChipKey) {
    const next = { ...filters } as Record<string, unknown>;
    next[key] = undefined;
    next.side = 1;
    const qs = filtersToQuery(next as unknown as SokFilters);
    router.push(qs ? `/sok?${qs}` : "/sok", { scroll: false });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-navy">Aktive filtre:</span>
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => remove(c.key)}
          className="group inline-flex items-center gap-1 rounded-full border border-[#CCD2DE] bg-white py-1 pl-3 pr-1.5 text-sm text-navy transition-colors hover:border-navy"
          aria-label={`Fjern filteret ${c.label}`}
        >
          {c.label}
          <X className="h-3.5 w-3.5 text-tf-muted group-hover:text-signal" aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <Link href="/sok" className="ml-1 text-sm font-semibold text-navy underline underline-offset-4">
          Nullstill alle
        </Link>
      )}
    </div>
  );
}

/** Liste/Kart-valg — tilstandsløs via query-parameteren vis=kart */
export function ViewToggle({ params, vis }: { params: string; vis: "liste" | "kart" }) {
  const listeSp = new URLSearchParams(params);
  listeSp.delete("vis");
  const listeQs = listeSp.toString();
  const kartSp = new URLSearchParams(params);
  kartSp.set("vis", "kart");

  const base = "inline-flex h-9 items-center gap-1.5 px-3 text-sm font-semibold transition-colors";
  return (
    <div role="group" aria-label="Velg visning" className="inline-flex overflow-hidden rounded-md border border-[#CCD2DE]">
      <Link
        href={listeQs ? `/sok?${listeQs}` : "/sok"}
        aria-current={vis === "liste" ? "page" : undefined}
        className={`${base} ${vis === "liste" ? "bg-navy text-white" : "bg-white text-navy hover:bg-sky-pale"}`}
      >
        <List className="h-4 w-4" aria-hidden="true" />
        Liste
      </Link>
      <Link
        href={`/sok?${kartSp.toString()}`}
        aria-current={vis === "kart" ? "page" : undefined}
        className={`${base} border-l border-[#CCD2DE] ${vis === "kart" ? "bg-navy text-white" : "bg-white text-navy hover:bg-sky-pale"}`}
      >
        <MapPin className="h-4 w-4" aria-hidden="true" />
        Kart
      </Link>
    </div>
  );
}
