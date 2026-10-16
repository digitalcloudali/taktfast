// Taktfast /sok — delte filtertyper og URL-hjelpere (brukes av både server- og klientkomponenter)
import {
  ageLabel,
  cityBySlug,
  familyLabel,
  formatLabel,
  levelLabel,
  styleName,
  weekdayName,
} from "@/lib/constants";

/** Alle søkefiltre for /sok (URL-parametre: q, stil, familie, by, dag, tid, niva, alder, komAlene, rolle, format, maksPris, student, minRating, ledig, side, vis) */
export type SokFilters = {
  q?: string;
  stil?: string;
  familie?: string;
  by?: string;
  dag?: number; // 1–7 (mandag = 1)
  tid?: "dag" | "kveld";
  niva?: string;
  alder?: string;
  komAlene?: boolean;
  rolle?: "FORER" | "FOLGER";
  format?: string;
  maksPris?: number;
  student?: boolean;
  minRating?: number;
  ledig?: boolean;
  side?: number;
  vis?: "liste" | "kart";
};

/** Én prikk på kartet = én danseskole (aggregert fra gjeldende resultatside) */
export type SchoolPin = {
  schoolSlug: string;
  schoolName: string;
  city: string;
  district: string | null;
  lat: number;
  lng: number;
  count: number;
  tintHex: string;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(sp: RawParams, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  if (s == null || s === "") return undefined;
  return s;
}

function num(s: string | undefined): number {
  if (!s) return NaN;
  return Number(s.replace(/\s/g, "").replace(",", "."));
}

/** Tolk rå searchParams (Next 16) til SokFilters — tomme/ugyldige verdier blir undefined */
export function parseSearchParams(sp: RawParams): SokFilters {
  const dag = num(first(sp, "dag"));
  const maks = num(first(sp, "maksPris"));
  const minRating = num(first(sp, "minRating"));
  const side = num(first(sp, "side"));
  const tid = first(sp, "tid");
  const rolle = first(sp, "rolle");
  const vis = first(sp, "vis");
  return {
    q: first(sp, "q")?.trim() || undefined,
    stil: first(sp, "stil") || undefined,
    familie: first(sp, "familie") || undefined,
    by: first(sp, "by") || undefined,
    dag: dag >= 1 && dag <= 7 ? Math.round(dag) : undefined,
    tid: tid === "dag" || tid === "kveld" ? tid : undefined,
    niva: first(sp, "niva") || undefined,
    alder: first(sp, "alder") || undefined,
    komAlene: first(sp, "komAlene") === "1",
    rolle: rolle === "FORER" || rolle === "FOLGER" ? rolle : undefined,
    format: first(sp, "format") || undefined,
    maksPris: Number.isFinite(maks) && maks > 0 ? maks : undefined,
    student: first(sp, "student") === "1",
    minRating: Number.isFinite(minRating) && minRating > 0 ? minRating : undefined,
    ledig: first(sp, "ledig") === "1",
    side: Number.isFinite(side) && side > 1 ? Math.floor(side) : undefined,
    vis: vis === "kart" ? "kart" : undefined,
  };
}

/** Bygg kanonisk query-streng av filtrene (tomme/standardverdier utelates) */
export function filtersToQuery(f: SokFilters): string {
  const sp = new URLSearchParams();
  if (f.q) sp.set("q", f.q);
  if (f.stil) sp.set("stil", f.stil);
  if (f.familie) sp.set("familie", f.familie);
  if (f.by) sp.set("by", f.by);
  if (f.dag) sp.set("dag", String(f.dag));
  if (f.tid) sp.set("tid", f.tid);
  if (f.niva) sp.set("niva", f.niva);
  if (f.alder) sp.set("alder", f.alder);
  if (f.komAlene) sp.set("komAlene", "1");
  if (f.rolle) sp.set("rolle", f.rolle);
  if (f.format) sp.set("format", f.format);
  if (f.maksPris) sp.set("maksPris", String(f.maksPris));
  if (f.student) sp.set("student", "1");
  if (f.minRating) sp.set("minRating", String(f.minRating));
  if (f.ledig) sp.set("ledig", "1");
  if (f.side && f.side > 1) sp.set("side", String(f.side));
  if (f.vis && f.vis !== "liste") sp.set("vis", f.vis);
  return sp.toString();
}

/** Nøkler som kan vises som fjernbare chips (side/vis er ikke filtre) */
export type ChipKey = Exclude<keyof SokFilters, "side" | "vis">;

/** Aktive filtre som lesbare, fjernbare chips */
export function activeFilterChips(f: SokFilters): { key: ChipKey; label: string }[] {
  const chips: { key: ChipKey; label: string }[] = [];
  if (f.q) chips.push({ key: "q", label: `«${f.q}»` });
  if (f.stil) chips.push({ key: "stil", label: styleName(f.stil) });
  if (f.familie) chips.push({ key: "familie", label: familyLabel(f.familie) });
  if (f.by) chips.push({ key: "by", label: cityBySlug(f.by)?.name ?? f.by });
  if (f.dag) chips.push({ key: "dag", label: weekdayName(f.dag) });
  if (f.tid) chips.push({ key: "tid", label: f.tid === "dag" ? "Dag" : "Kveld" });
  if (f.niva) chips.push({ key: "niva", label: levelLabel(f.niva) });
  if (f.alder) chips.push({ key: "alder", label: ageLabel(f.alder) });
  if (f.komAlene) chips.push({ key: "komAlene", label: "Kommer alene" });
  if (f.rolle) chips.push({ key: "rolle", label: f.rolle === "FORER" ? "Fører" : "Følger" });
  if (f.format) chips.push({ key: "format", label: formatLabel(f.format) });
  if (f.maksPris) chips.push({ key: "maksPris", label: `Maks ${f.maksPris.toLocaleString("nb-NO")},-` });
  if (f.student) chips.push({ key: "student", label: "Studentpris" });
  if (f.minRating) chips.push({ key: "minRating", label: `${f.minRating.toLocaleString("nb-NO")}+ stjerner` });
  if (f.ledig) chips.push({ key: "ledig", label: "Ledige plasser" });
  return chips;
}

export const activeFilterCount = (f: SokFilters): number => activeFilterChips(f).length;
