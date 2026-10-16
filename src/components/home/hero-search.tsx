"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DANCE_STYLES, CITIES, LEVELS, NORWEGIAN_WEEKDAYS } from "@/lib/constants";

const selectCls =
  "h-11 w-full rounded-[5px] border border-[#B3B3B3] bg-white px-3 text-[15px] text-navy outline-none focus:border-navy";

/** Søkeraden i heroten: dansestil, by, ukedag, nivå + «kommer alene» */
export function HeroSearch() {
  const router = useRouter();
  const [stil, setStil] = useState("");
  const [by, setBy] = useState("");
  const [dag, setDag] = useState("");
  const [niva, setNiva] = useState("");
  const [alene, setAlene] = useState(false);

  function sok(e: React.FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (stil) p.set("stil", stil);
    if (by) p.set("by", by);
    if (dag) p.set("dag", dag);
    if (niva) p.set("niva", niva);
    if (alene) p.set("komAlene", "1");
    p.set("ledig", "1");
    router.push(`/sok?${p.toString()}`);
  }

  return (
    <form
      onSubmit={sok}
      className="mt-5 space-y-3"
      role="search"
      aria-label="Søk etter dansekurs"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="hs-stil" className="mb-1 block text-sm font-semibold text-navy">
            Dansestil
          </label>
          <select
            id="hs-stil"
            value={stil}
            onChange={(e) => setStil(e.target.value)}
            className={selectCls}
          >
            <option value="">Alle stiler</option>
            {DANCE_STYLES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hs-by" className="mb-1 block text-sm font-semibold text-navy">
            By
          </label>
          <select
            id="hs-by"
            value={by}
            onChange={(e) => setBy(e.target.value)}
            className={selectCls}
          >
            <option value="">Alle byer</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hs-dag" className="mb-1 block text-sm font-semibold text-navy">
            Ukedag
          </label>
          <select
            id="hs-dag"
            value={dag}
            onChange={(e) => setDag(e.target.value)}
            className={selectCls}
          >
            <option value="">Alle dager</option>
            {NORWEGIAN_WEEKDAYS.map((navn, i) =>
              i === 0 ? null : (
                <option key={i} value={String(i)}>
                  {navn.charAt(0).toUpperCase() + navn.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
        <div>
          <label htmlFor="hs-niva" className="mb-1 block text-sm font-semibold text-navy">
            Nivå
          </label>
          <select
            id="hs-niva"
            value={niva}
            onChange={(e) => setNiva(e.target.value)}
            className={selectCls}
          >
            <option value="">Alle nivåer</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <label htmlFor="hs-alene" className="flex cursor-pointer items-center gap-2 text-[15px] text-[#1A1A1A]">
          <input
            id="hs-alene"
            type="checkbox"
            checked={alene}
            onChange={(e) => setAlene(e.target.checked)}
            className="h-4 w-4 accent-[#00205B]"
          />
          Kommer alene
        </label>
        <Button type="submit" size="lg">
          Finn ledige kurs
        </Button>
      </div>
    </form>
  );
}
