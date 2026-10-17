import { cn } from "@/lib/utils";

/** Statuschips for skolepanelet — AKTIV navy, FULL rød, AVLYST grå, NEW butter, CONTACTED himmelblå, BOOKED grønn. */
const CHIP_MAP: Record<string, { label: string; cls: string }> = {
  // Kursstatus
  AKTIV: { label: "Aktiv", cls: "bg-[#00205B] text-white" },
  FULL: { label: "Fullt", cls: "bg-[#D6001C] text-white" },
  AVLYST: { label: "Avlyst", cls: "bg-[#6B7280] text-white" },
  // Privattime-forespørsler
  NEW: { label: "Ny", cls: "bg-[#FDF6D8] text-[#00205B]" },
  CONTACTED: { label: "Kontaktet", cls: "bg-[#EEF5FC] text-[#00205B] border border-[#8BB8E8]" },
  BOOKED: { label: "Booket", cls: "bg-[#1F7A4D] text-white" },
  // Oppmøte (bookinger)
  CONFIRMED: { label: "Påmeldt", cls: "bg-[#EEF5FC] text-[#00205B]" },
  CHECKED_IN: { label: "Innsjekket", cls: "bg-[#1F7A4D] text-white" },
  // Venteliste
  ACTIVE: { label: "Aktiv", cls: "bg-[#EEF5FC] text-[#00205B]" },
  OFFERED: { label: "Fikk tilbud", cls: "bg-[#FDF6D8] text-[#00205B]" },
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const item = CHIP_MAP[status] ?? { label: status, cls: "bg-[#E5E8F2] text-[#1A1A1A]" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold",
        item.cls,
        className
      )}
    >
      {item.label}
    </span>
  );
}

/** Norsk etikett for kursstatus i nedtrekkslister */
export const courseStatusLabel = (s: string) =>
  s === "FULL" ? "Fullt" : s === "AVLYST" ? "Avlyst" : "Aktiv";

/** Norsk etikett for privattime-status i nedtrekkslister */
export const privatStatusLabel = (s: string) =>
  s === "CONTACTED" ? "Kontaktet" : s === "BOOKED" ? "Booket" : "Ny";
