// Taktfast /min-side + /bekreftelse — felles chips, etiketter og dato­hjelpere.
// Ren modul (ingen hooks / ingen "use client") — kan brukes fra både server- og klientkomponenter.

const chipBase =
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold";

// ---------- Statuschips ----------

const STATUS_CHIPS: Record<string, { label: string; cls: string }> = {
  CONFIRMED: { label: "Bekreftet", cls: "bg-navy text-white" },
  CHECKED_IN: { label: "Innsjekket", cls: "bg-[#1B7F3B] text-white" },
  CANCELLED: { label: "Avbestilt", cls: "bg-[#E5E8F2] text-[#6B6B6B]" },
  PENDING: { label: "Venter", cls: "bg-tint-butter text-navy" },
  COMPLETED: { label: "Fullført", cls: "bg-sky-pale text-navy" },
};

export function StatusChip({ status }: { status: string }) {
  const chip = STATUS_CHIPS[status] ?? { label: status, cls: "bg-[#E5E8F2] text-[#6B6B6B]" };
  return <span className={`${chipBase} ${chip.cls}`}>{chip.label}</span>;
}

const PAYMENT_CHIPS: Record<string, { label: string; cls: string }> = {
  PAID: { label: "Betalt", cls: "bg-[#E7F3E8] text-[#1B7F3B]" },
  PENDING: { label: "Venter på betaling", cls: "bg-tint-butter text-navy" },
  REFUNDED: { label: "Refundert", cls: "bg-[#E5E8F2] text-[#6B6B6B]" },
  PARTIALLY_REFUNDED: { label: "Delvis refundert", cls: "bg-[#FDF0E5] text-[#A05A00]" },
  FAILED: { label: "Betaling feilet", cls: "bg-[#FBE7EA] text-[#D6001C]" },
};

export function PaymentChip({ status }: { status: string }) {
  const chip = PAYMENT_CHIPS[status] ?? { label: status, cls: "bg-[#E5E8F2] text-[#6B6B6B]" };
  return <span className={`${chipBase} ${chip.cls}`}>{chip.label}</span>;
}

const KIND_LABELS: Record<string, string> = {
  KURS: "Kursrekke",
  DROPIN: "Drop-in",
  KVELD: "Dansekveld",
  PRIVATTIME: "Privattime",
  PROVETIME: "Prøvetime",
  PAKKE: "Bryllupspakke",
  KLIPPEKORT: "Klippekort",
  MAANEDSKORT: "Månedskort",
  WORKSHOP: "Workshop",
};

export const kindLabel = (kind: string) => KIND_LABELS[kind] ?? kind;

export function KindChip({ kind }: { kind: string }) {
  return <span className={`${chipBase} bg-sky-pale text-navy`}>{kindLabel(kind)}</span>;
}

const METHOD_LABELS: Record<string, string> = {
  VIPPS: "Vipps (demo)",
  KORT: "Kort (demo)",
  REFUND: "Refusjon",
};

export function MethodChip({ method }: { method: string }) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-full border border-[#CCD2DE] bg-white px-2.5 py-0.5 text-xs font-semibold text-navy">
      {METHOD_LABELS[method] ?? method}
    </span>
  );
}

// ---------- Gruppestatus (flere bookinger deler én kode) ----------

export function gruppeStatus(bs: { status: string; paymentStatus: string }[]): {
  status: string;
  paymentStatus: string;
} {
  const active = bs.filter((b) => b.status !== "CANCELLED");
  let status = "PENDING";
  if (active.length === 0) status = "CANCELLED";
  else if (active.some((b) => b.status === "CHECKED_IN")) status = "CHECKED_IN";
  else if (active.every((b) => b.status === "COMPLETED")) status = "COMPLETED";
  else if (active.some((b) => b.status === "CONFIRMED")) status = "CONFIRMED";

  let paymentStatus = bs[0]?.paymentStatus ?? "PENDING";
  if (active.some((b) => b.paymentStatus === "PAID")) paymentStatus = "PAID";
  else if (active.length > 0 && active.every((b) => b.paymentStatus === "REFUNDED")) paymentStatus = "REFUNDED";
  else if (bs.some((b) => b.paymentStatus === "PARTIALLY_REFUNDED")) paymentStatus = "PARTIALLY_REFUNDED";

  return { status, paymentStatus };
}

// ---------- Dato­hjelpere (nb-NO) ----------

export const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const longDate = (d: Date) =>
  d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });

export const capLongDate = (d: Date) => cap(longDate(d));

export const longDateYear = (d: Date) =>
  d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const shortDateYear = (d: Date) =>
  d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });

export const klokkeslett = (d: Date) =>
  d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

// ---------- Faner på Min side (delt mellom server- og klientkomponent) ----------

export const MIN_SIDE_TABS = [
  { value: "mine-kurs", label: "Mine kurs" },
  { value: "venteliste", label: "Venteliste" },
  { value: "favoritter", label: "Favoritter" },
  { value: "deltakere", label: "Deltakere" },
  { value: "klippekort", label: "Klippekort" },
  { value: "kvitteringer", label: "Kvitteringer" },
] as const;

export type MinSideTabValue = (typeof MIN_SIDE_TABS)[number]["value"];
