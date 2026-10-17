import { cn } from "@/lib/utils";

/** Statusbrikke for modereringsstatus: PENDING smørgul, APPROVED grønn, REJECTED rød */
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Venter", cls: "bg-tint-butter text-[#7a6210] border-[#e6d68a]" },
  APPROVED: { label: "Godkjent", cls: "bg-[#e7f3e4] text-[#2e6b28] border-[#bcdcb4]" },
  REJECTED: { label: "Avslått", cls: "bg-[#fbe7e3] text-[#a13a2c] border-[#efc3ba]" },
  ALLE: { label: "Alle", cls: "bg-sky-pale text-navy border-[#CCD2DE]" },
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-sky-pale text-navy border-[#CCD2DE]" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        s.cls,
        className
      )}
    >
      {s.label}
    </span>
  );
}

/** Kanalbrikke for varsellogg: EMAIL marineblå, SMS rosa */
const CHANNEL_MAP: Record<string, { label: string; cls: string }> = {
  EMAIL: { label: "E-post", cls: "bg-navy text-white" },
  SMS: { label: "SMS", cls: "bg-[#f8dcec] text-[#96295e] border border-[#eec3da]" },
};

export function ChannelChip({ channel, className }: { channel: string; className?: string }) {
  const c = CHANNEL_MAP[channel] ?? { label: channel, cls: "bg-sky-pale text-navy border border-[#CCD2DE]" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        c.cls,
        className
      )}
    >
      {c.label}
    </span>
  );
}

/** Rollebrikke: ADMIN marineblå, SKOLE smørgul, DANSER lyseblå */
const ROLE_MAP: Record<string, { label: string; cls: string }> = {
  ADMIN: { label: "Admin", cls: "bg-navy text-white" },
  SKOLE: { label: "Skole", cls: "bg-tint-butter text-[#7a6210] border border-[#e6d68a]" },
  DANSER: { label: "Danser", cls: "bg-sky-pale text-navy border border-[#CCD2DE]" },
};

export function RoleChip({ role, className }: { role: string; className?: string }) {
  const r = ROLE_MAP[role] ?? { label: role, cls: "bg-sky-pale text-navy border border-[#CCD2DE]" };
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        r.cls,
        className
      )}
    >
      {r.label}
    </span>
  );
}
