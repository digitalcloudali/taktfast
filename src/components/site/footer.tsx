import Link from "next/link";
import { Music2, Phone, Mail, ShieldCheck, CalendarX2, BadgeCheck } from "lucide-react";

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Kundeservice",
    links: [
      { label: "Kundeservice", href: "/kundeservice" },
      { label: "Slik fungerer det", href: "/slik-fungerer-det" },
      { label: "Kontakt oss", href: "/kundeservice#kontakt" },
    ],
  },
  {
    title: "Om Taktfast",
    links: [
      { label: "Om oss", href: "/om-oss" },
      { label: "Tips og råd", href: "/tips-og-rad" },
      { label: "Dansestiler A–Å", href: "/dansestiler/salsa" },
    ],
  },
  {
    title: "For danseskoler",
    links: [
      { label: "Bli partner", href: "/for-danseskoler" },
      { label: "Skolepanel", href: "/skolepanel" },
      { label: "Partneravtale", href: "/for-danseskoler#partneravtale" },
    ],
  },
  {
    title: "Snarveier",
    links: [
      { label: "Finn dansekurs", href: "/sok" },
      { label: "Bryllupsdans", href: "/bryllupsdans" },
      { label: "Dansekvelder", href: "/dansekvelder" },
      { label: "Gavekort", href: "/gavekort" },
    ],
  },
];

const USP = [
  { icon: CalendarX2, text: "Gratis avbestalling 48 t før kursstart" },
  { icon: BadgeCheck, text: "Verifiserte danseskoler" },
  { icon: ShieldCheck, text: "Trygg betaling med Vipps" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy text-white">
      {/* USP-rad */}
      <div className="border-b border-white/15">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-6 sm:grid-cols-3">
          {USP.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10" aria-hidden="true">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4">
        {COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="mb-3 font-display text-base font-bold text-white">{col.title}</h3>
            <ul className="space-y-2 text-sm text-white/80">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-white/70 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white" aria-hidden="true">
              <Music2 className="h-3.5 w-3.5 text-navy" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-extrabold text-white">Taktfast</span>
            <span aria-hidden="true">·</span>
            <span>alle kan lære å danse 💃</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> 22 00 00 00</span>
            <span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> post@taktfast.no</span>
            <Link href="/cookies" className="underline hover:text-white">Innstillinger for informasjonskapsler</Link>
            <Link href="/personvern" className="underline hover:text-white">Personvern</Link>
            <Link href="/vilkar" className="underline hover:text-white">Vilkår</Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-8 text-xs text-white/50">
          © {new Date().getFullYear()} Taktfast AS · Demonstrasjon med fiktive danseskoler, instruktører og personer. Priser er veiledende demo-priser i NOK.
        </div>
      </div>
    </footer>
  );
}
