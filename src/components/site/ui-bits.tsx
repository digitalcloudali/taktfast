import { Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm", className)} aria-label={`Vurdering ${value.toFixed(1)} av 5`}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("h-4 w-4", i <= Math.round(value) ? "fill-[#F5B301] text-[#F5B301]" : "fill-[#E5E8F2] text-[#E5E8F2]")} />
        ))}
      </span>
      <span className="font-semibold text-navy">{value.toFixed(1).replace(".", ",")}</span>
      {typeof count === "number" && <span className="text-[#6B6B6B]">({count})</span>}
    </span>
  );
}

/** Rollebalanse: fører/følger-ledige som en liten balanse-indikator */
export function RoleBalanceBar({
  forereFree,
  folgereFree,
  compact,
}: {
  forereFree: number;
  folgereFree: number;
  compact?: boolean;
}) {
  const total = forereFree + folgereFree;
  if (total === 0) {
    return <p className="text-xs font-medium text-signal">Fullt i begge roller – bli med på venteliste</p>;
  }
  const leaderPct = total > 0 ? Math.round((forereFree / total) * 100) : 0;
  return (
    <div className={cn("space-y-1", compact && "space-y-0.5")}>
      <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-[#E5E8F2]" role="presentation">
        <div className="h-full bg-sky" style={{ width: `${leaderPct}%` }} />
        <div className="h-full bg-[#EB5986]" style={{ width: `${100 - leaderPct}%` }} />
      </div>
      <p className="text-xs font-medium text-[#6B6B6B]">
        Førere: {forereFree} ledige · Følgere: {folgereFree} ledige
      </p>
    </div>
  );
}

export function Ribbon({ kind }: { kind: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    sisteplasser: { label: "Siste plasser", cls: "bg-[#D6001C] text-white" },
    starter_snart: { label: "Starter snart", cls: "bg-[#FDF6D8] text-navy" },
    dropin: { label: "Drop-in mulig", cls: "bg-[#8BB8E8] text-navy" },
    kom_alene: { label: "Kom alene", cls: "bg-[#EB5986] text-white" },
    aapen_uke: { label: "Åpen uke", cls: "bg-[#D6001C] text-white" },
    ny: { label: "Ny", cls: "bg-[#EB5986] text-white" },
    fullt: { label: "Fullt", cls: "bg-[#D6001C] text-white" },
  };
  const item = map[kind];
  if (!item) return null;
  return (
    <span className={cn("rounded-[4px] px-2 py-1 text-xs font-bold", item.cls)}>{item.label}</span>
  );
}

export function StyleChip({ name, tint, className }: { name: string; tint: string; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-navy", className)}
      style={{ backgroundColor: tint }}
    >
      {name}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  seeAllHref,
  seeAllLabel = "Se alle",
  className,
  id,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 id={id} className="text-navy">{title}</h2>
        {subtitle && <p className="mt-1 max-w-2xl text-[#6B6B6B]">{subtitle}</p>}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} className="link-chevron text-[15px]">
          {seeAllLabel} <span aria-hidden="true">›</span>
        </Link>
      )}
    </div>
  );
}

export function KomAleneBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-[#EB5986] px-2.5 py-0.5 text-xs font-semibold text-white", className)}>
      <Users className="h-3 w-3" aria-hidden="true" /> Kom alene – vi finner partner
    </span>
  );
}

export function InfoBox({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-md border border-[#CCD2DE] bg-sky-pale p-4", className)}>
      {title && <p className="mb-1 font-display font-bold text-navy">{title}</p>}
      <div className="text-sm text-[#1A1A1A]">{children}</div>
    </div>
  );
}
