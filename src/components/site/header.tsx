"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X, Search, Heart, Music2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Pardans", href: "/sok?family=PARDANS" },
  { label: "Bryllupsdans", href: "/bryllupsdans" },
  { label: "Barn & ungdom", href: "/sok?family=BARNE_UNG" },
  { label: "Hiphop & street", href: "/sok?family=HIPHOP_STREET" },
  { label: "Ballett & jazz", href: "/sok?family=BALLETT_JAZZ" },
  { label: "Dansekvelder", href: "/dansekvelder" },
  { label: "Trening", href: "/sok?family=TRENING" },
  { label: "Tips og råd", href: "/tips-og-rad" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-1.5 ${className}`} aria-label="Taktfast – til forsiden">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy" aria-hidden="true">
        <Music2 className="h-4 w-4 text-white" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#EB5986]" />
      </span>
      <span className="font-display text-[1.65rem] font-extrabold tracking-tight text-navy">Taktfast</span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Lås scroll når mobilmeny er åpen
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { setOpen(false); setSearchOpen(false); }, [pathname]);

  const isActive = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/bryllupsdans" || base === "/dansekvelder" || base === "/tips-og-rad") return pathname === base;
    if (base === "/sok") return false;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_0_0_var(--divider)]">
      {/* Tynn toppbjelke */}
      <div className="border-b border-[#CCD2DE] bg-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-5 px-4 text-[13px]">
          <Link href="/for-danseskoler" className="text-navy hover:underline">For danseskoler</Link>
          <Link href="/gavekort" className="text-navy hover:underline">Gavekort</Link>
          <Link href="/kundeservice" className="text-navy hover:underline">Kundeservice</Link>
          {session ? (
            <>
              <Link href="/min-side" className="font-semibold text-navy hover:underline">Mine kurs</Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[#6B6B6B] hover:underline">
                Logg ut ({session.user?.name?.split(" ")[0]})
              </button>
            </>
          ) : (
            <>
              <Link href="/logg-inn" className="font-semibold text-navy hover:underline">Logg inn</Link>
              <Link href="/registrer" className="hidden text-navy hover:underline sm:inline">Ny her? Registrer deg</Link>
            </>
          )}
        </div>
      </div>

      {/* Hovedheader */}
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4">
        <Wordmark />

        <nav aria-label="Hovedmeny" className="hidden h-full items-center gap-6 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              data-active={isActive(item.href)}
              className="nav-underline flex h-[68px] items-center text-[15px] font-medium text-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Søk etter dansekurs"
            onClick={() => setSearchOpen((v) => !v)}
            className="flex h-[43px] w-[43px] items-center justify-center rounded-full text-navy hover:bg-sky-pale"
          >
            <Search className="h-5 w-5" />
          </button>
          {session && (
            <Link
              href="/min-side?tab=favoritter"
              aria-label="Mine favoritter"
              className="hidden h-[43px] w-[43px] items-center justify-center rounded-full text-navy hover:bg-sky-pale sm:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>
          )}
          <Link href="/sok" className="hidden lg:inline-flex">
            <Button className="h-11 px-5">Finn dansekurs</Button>
          </Link>
          <button
            aria-label="Åpne meny"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-[43px] w-[43px] items-center justify-center rounded-full text-navy hover:bg-sky-pale xl:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Søkefelt (utvidbart) */}
      {searchOpen && (
        <div className="border-t border-[#CCD2DE] bg-sky-pale">
          <form action="/sok" className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
            <Search className="h-5 w-5 text-[#6B6B6B]" />
            <input
              autoFocus
              type="search"
              name="q"
              placeholder="Søk etter dansestil, skole eller sted …"
              className="h-11 flex-1 rounded-[5px] border border-[#B3B3B3] bg-white px-4 text-[15px] text-navy outline-none focus:border-navy"
              aria-label="Søk etter dansekurs"
            />
            <Button type="submit" className="h-11 px-5">Søk</Button>
          </form>
        </div>
      )}

      {/* Fullskjerm navy mobilmeny */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-navy text-white xl:hidden" role="dialog" aria-modal="true" aria-label="Meny">
          <div className="flex h-[68px] items-center justify-between px-4">
            <span className="font-display text-2xl font-extrabold text-white">Taktfast</span>
            <button aria-label="Lukk meny" onClick={() => setOpen(false)} className="flex h-[43px] w-[43px] items-center justify-center rounded-full text-white hover:bg-white/10">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Mobilmeny">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="block border-b border-white/10 py-4 font-display text-2xl font-bold text-white">
                    {item.label} <ChevronDown className="inline h-5 w-5 -rotate-90 opacity-60" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 border-t border-white/10 px-6 py-6">
            <Link href="/sok" className="block"><Button className="h-12 w-full">Finn ledige kurs</Button></Link>
            <div className="flex gap-3">
              {session ? (
                <>
                  <Link href="/min-side" className="flex-1"><Button variant="secondary" className="h-12 w-full">Mine kurs</Button></Link>
                  <Button variant="outlineNavy" className="h-12 flex-1" onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}>Logg ut</Button>
                </>
              ) : (
                <>
                  <Link href="/logg-inn" className="flex-1"><Button variant="secondary" className="h-12 w-full">Logg inn</Button></Link>
                  <Link href="/registrer" className="flex-1"><Button variant="outlineNavy" className="h-12 w-full">Registrer deg</Button></Link>
                </>
              )}
            </div>
            <div className="flex gap-4 pt-2 text-sm text-white/70">
              <Link href="/for-danseskoler">For danseskoler</Link>
              <Link href="/gavekort">Gavekort</Link>
              <Link href="/kundeservice">Kundeservice</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
